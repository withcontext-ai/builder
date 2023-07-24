// deprecated file
import { UniqueIdentifier } from '@dnd-kit/core'
import { produce } from 'immer'
import { create } from 'zustand'

import { nanoid } from '@/lib/utils'
import { TreeItem } from '@/components/dnd/types'

export type WorkflowType = 'tool' | 'agent'

export type WorkflowItem = {
  id: string
  type: WorkflowType
  subType: string
  formValueStr: string
}

interface State {
  workflowTree: TreeItem[]
  workflowData: WorkflowItem[]
  selectedTaskId: string | null
  isWorkflowInitialized: boolean

  resetState: () => void
  setWorkflowTree: (tree: TreeItem[]) => void
  addTask: (type: WorkflowType, subType: string) => void
  selectTask: (id: string) => void
  removeTask: (id: string) => void
  editTaskFormValueStr: (id: string, formValue: string) => void
  initWorkflow: (tree: TreeItem[], data: WorkflowItem[]) => void
}

const defaultState = {
  isWorkflowInitialized: false,
  workflowTree: [],
  workflowData: [],
  selectedTaskId: null,
}

export const useSettingsStore = create<State>((set) => ({
  ...defaultState,

  resetState: () => {
    set(() => defaultState)
  },
  setWorkflowTree: (tree: TreeItem[]) => {
    set(
      produce((draft: State) => {
        draft.workflowTree = tree
      })
    )
  },
  addTask: (type: WorkflowType, subType: string) => {
    set(
      produce((draft: State) => {
        const id = nanoid()
        draft.workflowData.push({
          id,
          type,
          subType,
          formValueStr: '{}',
        })
        draft.workflowTree.push({
          id,
          children: [],
        })
      })
    )
  },
  selectTask: (id: string) => {
    set(
      produce((draft: State) => {
        draft.selectedTaskId = id
      })
    )
  },
  removeTask: (id: string) => {
    set(
      produce((draft: State) => {
        const deletedIds = getTreeItemIds(draft.workflowTree, id)
        draft.workflowData = draft.workflowData.filter(
          (item) => !deletedIds.includes(item.id)
        )
        deleteTreeItem(draft.workflowTree, id)
      })
    )
  },
  editTaskFormValueStr: (id: string, formValue: string) => {
    set(
      produce((draft: State) => {
        const idx = draft.workflowData.findIndex((item) => item.id === id)
        if (idx > -1) {
          draft.workflowData[idx].formValueStr = formValue
        }
      })
    )
  },
  initWorkflow: (tree: TreeItem[], data: WorkflowItem[]) => {
    set(
      produce((draft: State) => {
        console.log('isWorkflowInitialized')
        draft.isWorkflowInitialized = true
        draft.workflowTree = tree
        draft.workflowData = data
      })
    )
  },
}))

function getTreeItemIds(
  tree: TreeItem[],
  targetId: UniqueIdentifier,
  isTargetFound = false
): UniqueIdentifier[] {
  let result: UniqueIdentifier[] = []

  for (const item of tree) {
    if (isTargetFound || item.id === targetId) {
      result.push(item.id)
      if (item.children) {
        result = [...result, ...getTreeItemIds(item.children, targetId, true)]
      }
    } else if (item.children) {
      result = [...result, ...getTreeItemIds(item.children, targetId, false)]
    }
  }

  return result
}

function deleteTreeItem(tree: TreeItem[], id: UniqueIdentifier): boolean {
  for (let i = 0; i < tree.length; i++) {
    if (tree[i].id === id) {
      tree.splice(i, 1)
      return true
    } else if (tree[i].children) {
      if (deleteTreeItem(tree[i].children, id)) {
        return true
      }
    }
  }
  return false
}
