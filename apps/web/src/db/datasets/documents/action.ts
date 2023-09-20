import { auth } from '@clerk/nextjs'
import axios from 'axios'
import { omit, pick } from 'lodash'

import { getApps } from '@/db/apps/actions'
import { NewApp } from '@/db/apps/schema'
import { DataProps } from '@/app/dataset/[dataset_id]/settings/documents/utils'
import { NotedDataProps } from '@/app/dataset/type'

import { getDataset, getDatasets, getEditParams } from '../actions'
import { NewDataset } from '../schema'

export async function getDocuments({ dataset_id }: { dataset_id: string }) {
  const datasetDetail = await getDataset(dataset_id)
  const { updated_at, status } = datasetDetail
  const config = datasetDetail?.config || {}
  // @ts-ignore
  const documents = datasetDetail?.config?.files || []
  documents?.map((item: DataProps) => {
    item.updated_at = item?.updated_at || updated_at
    item.status = item.status || status
  })
  return { documents, updated_at, status, config }
}

// get data info
export async function getDataInfo(dataset_id: string, uid: string) {
  const { documents } = await getDocuments({ dataset_id })
  const detail = documents?.find((item: DataProps) => item?.uid === uid)
  const fileConfig = pick(detail, [
    'loaderType',
    'splitType',
    'chunkSize',
    'chunkOverlap',
  ])
  const defaultConfig = {
    loaderType: 'pdf',
    splitType: 'character',
    chunkSize: 1000,
    chunkOverlap: 0,
  }
  return {
    success: true,
    data: {
      dataset_id,
      files: [detail],
      config:
        Object.entries(fileConfig)?.length !== 0 ? fileConfig : defaultConfig,
      name: detail?.name,
      type: detail?.type,
    },
  }
}

export async function getNotedData() {
  const apps = await getApps()
  const data = apps?.reduce((m: NotedDataProps[], item: NewApp) => {
    const cur = pick(item, ['name', 'icon', 'short_id'])
    // @ts-ignore
    cur.uid = item.api_model_id
    m.push(cur)
    return m
  }, [])
  return {
    success: true,
    data,
  }
}

export async function getDataSplitPreview(
  datasetId: string,
  newValue: Partial<NewDataset>,
  uid: string,
  preview: number
) {
  const { userId } = auth()
  if (!userId) return Promise.resolve([])
  const { api_dataset_id, editParams } = await getEditParams(
    datasetId,
    newValue
  )
  if (api_dataset_id && editParams) {
    let { data: res } = await axios.patch(
      `${process.env.AI_SERVICE_API_BASE_URL}/v1/datasets/${api_dataset_id}?preview=${preview}&uid=${uid}`,
      editParams
    )
    if (res.status !== 200) {
      return Promise.resolve([])
    }
    return Promise.resolve(res?.data)
  }
  return Promise.resolve([])
}

export async function getDatasetByApiId(api_dataset_id: string) {
  const datasets = await getDatasets()
  const dataset = datasets?.find(
    (item: Partial<NewDataset>) => item?.api_dataset_id === api_dataset_id
  )
  return dataset
}
