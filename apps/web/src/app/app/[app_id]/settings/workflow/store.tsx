'use client'

import * as React from 'react'
import { UniqueIdentifier } from '@dnd-kit/core'
import { produce } from 'immer'
import { createStore, useStore } from 'zustand'

import { nanoid } from '@/lib/utils'
import { TreeItem } from '@/components/dnd/types'

import { WorkflowItem, WorkflowType } from './type'

interface WorkflowProps {
  workflowTree: TreeItem[]
  workflowData: WorkflowItem[]
  publishedWorkflowTree: TreeItem[]
  publishedWorkflowData: WorkflowItem[]
  selectedTaskId: string | null
}

interface WorkflowState extends WorkflowProps {
  resetCount: number
  setWorkflowTree: (tree: TreeItem[]) => void
  addTask: (type: WorkflowType, subType: string) => void
  selectTask: (id: string) => void
  removeTask: (id: string) => void
  editTaskFormValueStr: (id: string, formValue: string) => void
  resetWorkflow: () => void
  publishWorkflow: () => void
}

type WorkflowStore = ReturnType<typeof createWorkflowStore>

const createWorkflowStore = (initProps?: Partial<WorkflowProps>) => {
  const defaultProps: WorkflowProps = {
    workflowTree: [],
    workflowData: [],
    publishedWorkflowTree: [],
    publishedWorkflowData: [],
    selectedTaskId: null,
  }
  return createStore<WorkflowState>()((set) => ({
    ...defaultProps,
    ...initProps,

    resetCount: 0,

    setWorkflowTree: (tree: TreeItem[]) => {
      set(
        produce((draft: WorkflowState) => {
          draft.workflowTree = tree
        })
      )
    },
    addTask: (type: WorkflowType, subType: string) => {
      set(
        produce((draft: WorkflowState) => {
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
        produce((draft: WorkflowState) => {
          draft.selectedTaskId = id
        })
      )
    },
    removeTask: (id: string) => {
      set(
        produce((draft: WorkflowState) => {
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
        produce((draft: WorkflowState) => {
          const idx = draft.workflowData.findIndex((item) => item.id === id)
          if (idx > -1) {
            draft.workflowData[idx].formValueStr = formValue
          }
        })
      )
    },
    resetWorkflow: () => {
      set(
        produce((draft: WorkflowState) => {
          draft.workflowTree = draft.publishedWorkflowTree
          draft.workflowData = draft.publishedWorkflowData
          draft.resetCount = draft.resetCount + 1
        })
      )
    },
    publishWorkflow: () => {
      set(
        produce((draft: WorkflowState) => {
          draft.publishedWorkflowTree = draft.workflowTree
          draft.publishedWorkflowData = draft.workflowData
        })
      )
    },
  }))
}

const WorkflowContext = React.createContext<WorkflowStore | null>(null)

type WorkflowProviderProps = React.PropsWithChildren<WorkflowProps>

export function WorkflowProvider({
  children,
  ...props
}: WorkflowProviderProps) {
  const storeRef = React.useRef<WorkflowStore>()
  if (!storeRef.current) {
    storeRef.current = createWorkflowStore(props)
  }
  return (
    <WorkflowContext.Provider value={storeRef.current}>
      {children}
    </WorkflowContext.Provider>
  )
}

export function useWorkflowContext<T>(
  selector: (state: WorkflowState) => T,
  equalityFn?: (left: T, right: T) => boolean
): T {
  const store = React.useContext(WorkflowContext)
  if (!store) throw new Error('Missing WorkflowContext.Provider in the tree')
  return useStore(store, selector, equalityFn)
}

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
