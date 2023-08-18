import 'server-only'

import { redirect } from 'next/navigation'
import { and, desc, eq, inArray } from 'drizzle-orm'
import { difference, isEmpty, pick } from 'lodash'

import { api } from '@/lib/api'
import { auth } from '@/lib/auth'
import { db } from '@/lib/drizzle-edge'
import { flags } from '@/lib/flags'
import { serverLog } from '@/lib/posthog'
import { nanoid, safeParse } from '@/lib/utils'
import {
  defaultWorkflowData,
  defaultWorkflowTree,
} from '@/app/app/[app_id]/settings/workflow/task-default-value'
import { WorkflowItem } from '@/app/app/[app_id]/settings/workflow/type'
import { taskToApiFormatter } from '@/app/app/[app_id]/settings/workflow/utils'

import { AppsDatasetsTable } from '../apps_datasets/schema'
import { DatasetsTable } from '../datasets/schema'
import { AppsTable, NewApp } from './schema'

export async function addApp(app: Omit<NewApp, 'short_id' | 'created_by'>) {
  try {
    const { userId } = auth()
    if (!userId) {
      throw new Error('Not authenticated')
    }

    let api_model_id = null
    if (flags.enabledAIService) {
      const chains = defaultWorkflowData.map(taskToApiFormatter)
      let res = await api.post<any, any>('/v1/models', {
        chains,
      })
      if (res.status !== 200) {
        serverLog.capture({
          distinctId: userId,
          event: 'ai_service_error:add_app',
          properties: {
            message: res.message,
          },
        })
        throw new Error(`AI service error: ${res.message}`)
      }
      api_model_id = res?.data?.id
    }

    const appVal = {
      ...app,
      short_id: nanoid(),
      workflow_tree_str: JSON.stringify(defaultWorkflowTree),
      workflow_data_str: JSON.stringify(defaultWorkflowData),
      published_workflow_tree_str: JSON.stringify(defaultWorkflowTree),
      published_workflow_data_str: JSON.stringify(defaultWorkflowData),
      api_model_id,
      created_by: userId,
    }
    const [newApp] = await db.insert(AppsTable).values(appVal).returning()

    const appId = newApp?.short_id

    serverLog.capture({
      distinctId: userId,
      event: 'success:add_app',
      properties: {
        app_id: appId,
        api_model_id,
      },
    })

    return { appId }
  } catch (error: any) {
    return {
      error: error.message,
    }
  }
}

export async function getApps() {
  try {
    const { userId } = auth()
    if (!userId) {
      throw new Error('Not authenticated')
    }

    return db
      .select()
      .from(AppsTable)
      .orderBy(desc(AppsTable.created_at))
      .where(
        and(eq(AppsTable.created_by, userId), eq(AppsTable.archived, false))
      )
  } catch (error) {
    redirect('/')
  }
}

export async function getApp(appId: string) {
  try {
    const [item] = await db
      .select()
      .from(AppsTable)
      .where(eq(AppsTable.short_id, appId))
      .limit(1)

    if (!item) {
      throw new Error('App not found')
    }

    return item
  } catch (error) {
    redirect('/')
  }
}

export async function editApp(appId: string, newValue: Partial<NewApp>) {
  try {
    const { userId } = auth()
    if (!userId) {
      return {
        error: 'Not authenticated',
      }
    }

    if (flags.enabledAIService) {
      const { api_model_id } = await getApp(appId)
      if (!api_model_id) {
        throw new Error('api_model_id is not found')
      }

      if (flags.enabledVideoInteraction) {
        const payload = pick(newValue, [
          'opening_remarks',
          'enable_video_interaction',
        ])
        if (!isEmpty(payload)) {
          let res = await api.patch<any, any>(
            `/v1/models/${api_model_id}`,
            payload
          )
          if (res.status !== 200) {
            serverLog.capture({
              distinctId: userId,
              event: 'ai_service_error:edit_app',
              properties: {
                app_id: appId,
                api_model_id,
                message: res.message,
              },
            })
            throw new Error(`AI service error: ${res.message}`)
          }
        }
      }
    }

    const response = await db
      .update(AppsTable)
      .set(newValue)
      .where(
        and(eq(AppsTable.short_id, appId), eq(AppsTable.created_by, userId))
      )

    serverLog.capture({
      distinctId: userId,
      event: 'success:edit_app',
      properties: {
        app_id: appId,
        value: newValue,
      },
    })

    return response
  } catch (error: any) {
    return {
      error: error.message,
    }
  }
}

export async function deployApp(appId: string, newValue: Partial<NewApp>) {
  try {
    const { userId } = auth()
    if (!userId) {
      throw new Error('Not authenticated')
    }

    if (flags.enabledAIService) {
      const { api_model_id } = await getApp(appId)
      if (!api_model_id) {
        throw new Error('api_model_id is not found, please create a new app')
      }

      const workflow = safeParse(newValue.published_workflow_data_str, [])
      const chains = workflow.map(taskToApiFormatter)
      console.log('deploy chains:', chains)
      let res = await api.patch<any, any>(`/v1/models/${api_model_id}`, {
        chains,
      })
      if (res.status !== 200) {
        serverLog.capture({
          distinctId: userId,
          event: 'ai_service_error:deploy_app',
          properties: {
            app_id: appId,
            api_model_id,
            message: res.message,
          },
        })
        throw new Error(`AI service error: ${res.message}`)
      }
    }

    // BEGIN link datasets to this app
    const newWorkflow = safeParse(newValue.published_workflow_data_str, [])
    const allApiDatasetIds = newWorkflow.reduce(
      (acc: string[], task: WorkflowItem) => {
        const d =
          (safeParse(task.formValueStr, {}).data?.datasets as string[]) || []
        acc.push(...d)
        return acc
      },
      []
    ) as string[]
    const newApiDatasetIds = [...new Set(allApiDatasetIds)]

    const oldApiDatasetIds = (
      await db
        .select({ api_dataset_id: DatasetsTable.api_dataset_id })
        .from(AppsDatasetsTable)
        .where(eq(AppsDatasetsTable.app_id, appId))
        .leftJoin(
          DatasetsTable,
          eq(DatasetsTable.short_id, AppsDatasetsTable.dataset_id)
        )
    ).map((d) => d.api_dataset_id)

    const addedApiDatasetIds = difference(
      newApiDatasetIds,
      oldApiDatasetIds
    ) as string[]
    const removedApiDatasetIds = difference(
      oldApiDatasetIds,
      newApiDatasetIds
    ) as string[]

    const queue = []
    if (addedApiDatasetIds.length > 0) {
      const addedDatasetIds = (
        await db
          .select({ id: DatasetsTable.short_id })
          .from(DatasetsTable)
          .where(inArray(DatasetsTable.api_dataset_id, addedApiDatasetIds))
      ).map((d) => d.id)
      for (const datasetId of addedDatasetIds) {
        const task = db.insert(AppsDatasetsTable).values({
          app_id: appId,
          dataset_id: datasetId,
        })
        queue.push(task)
        serverLog.capture({
          distinctId: userId,
          event: 'success:link_dataset_to_app',
          properties: {
            app_id: appId,
            dataset_id: datasetId,
          },
        })
      }
    }
    if (removedApiDatasetIds.length > 0) {
      const removedDatasetIds = (
        await db
          .select({ id: DatasetsTable.short_id })
          .from(DatasetsTable)
          .where(inArray(DatasetsTable.api_dataset_id, removedApiDatasetIds))
      ).map((d) => d.id)
      for (const datasetId of removedDatasetIds) {
        const task = db
          .delete(AppsDatasetsTable)
          .where(
            and(
              eq(AppsDatasetsTable.app_id, appId),
              eq(AppsDatasetsTable.dataset_id, datasetId)
            )
          )
        queue.push(task)
        serverLog.capture({
          distinctId: userId,
          event: 'success:unlink_dataset_from_app',
          properties: {
            app_id: appId,
            dataset_id: datasetId,
          },
        })
      }
    }
    if (queue.length > 0) {
      await Promise.all(queue)
    }
    // END link datasets to this app

    const response = await db
      .update(AppsTable)
      .set(newValue)
      .where(
        and(eq(AppsTable.short_id, appId), eq(AppsTable.created_by, userId))
      )
    serverLog.capture({
      distinctId: userId,
      event: 'success:deploy_app',
      properties: {
        app_id: appId,
        value: newValue,
      },
    })

    return response
  } catch (error: any) {
    return {
      error: error.message,
    }
  }
}

export async function removeApp(appId: string) {
  try {
    const { userId } = auth()
    if (!userId) {
      throw new Error('Not authenticated')
    }

    const response = await db
      .update(AppsTable)
      .set({ archived: true, updated_at: new Date() })
      .where(
        and(eq(AppsTable.short_id, appId), eq(AppsTable.created_by, userId))
      )
    serverLog.capture({
      distinctId: userId,
      event: 'success:remove_app',
      properties: {
        app_id: appId,
      },
    })

    return response
  } catch (error: any) {
    return {
      error: error.message,
    }
  }
}

export async function getAppsBasedOnIds(ids: string[]) {
  try {
    const apps = await db
      .select()
      .from(AppsTable)
      .where(inArray(AppsTable.short_id, ids))
      .orderBy(desc(AppsTable.created_at))

    return apps
  } catch (error) {
    redirect('/')
  }
}

export async function addDebugSession(api_model_id: string) {
  const { userId } = auth()
  if (!userId || !flags.enabledAIService) return null

  let res = await api.post<any, any>('/v1/chat/session', {
    model_id: api_model_id,
  })

  if (res.status !== 200) {
    serverLog.capture({
      distinctId: userId || '',
      event: 'ai_service_error:debug_session',
      properties: {
        message: res.message,
      },
    })
    throw new Error(`AI service error: ${res.message}`)
  }

  return res?.data?.session_id
}

export async function getDebugSessionId(tasks: WorkflowItem[]) {
  const { userId } = auth()
  if (!userId || !flags.enabledAIService) return null

  const chains = tasks.map(taskToApiFormatter)
  let res = await api.post<any, any>('/v1/models', {
    chains,
  })

  if (res.status !== 200) {
    serverLog.capture({
      distinctId: userId,
      event: 'ai_service_error:debug_app',
      properties: {
        message: res.message,
        chains,
      },
    })
    throw new Error(`AI service error: ${res.message}`)
  }

  const api_model_id = res?.data?.id
  return await addDebugSession(api_model_id)
}
