import type { MutableRefObject } from 'react'
import type { UniqueIdentifier } from '@dnd-kit/core'

export interface TreeItem {
  id: UniqueIdentifier
  children: TreeItem[]
  collapsed?: boolean
}

export type TreeItems = TreeItem[]

export interface FlattenedItem extends TreeItem {
  parentId: UniqueIdentifier | null
  depth: number
  index: number
}

export type SensorContext = MutableRefObject<{
  items: FlattenedItem[]
  offset: number
}>

export interface MenuItem {
  id: string
  name: string
  type: 'page' | 'url'
  value: string // page_id | url
  pageValue?: string
  urlValue?: string
  hidden?: boolean
  collapsed?: boolean
  children: MenuItem[]
}

export interface FlattenedMenuItem extends MenuItem {
  parentId: string | number | null
  depth: number
  index: number
}
