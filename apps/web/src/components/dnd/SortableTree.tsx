'use client'

import { useEffect, useMemo, useState } from 'react'
import type {
  DragEndEvent,
  DragMoveEvent,
  DragOverEvent,
  DragStartEvent,
  DropAnimation,
  Modifier,
  UniqueIdentifier,
} from '@dnd-kit/core'
import {
  closestCenter,
  defaultDropAnimation,
  DndContext,
  DragOverlay,
  MeasuringStrategy,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { createPortal } from 'react-dom'

import { useIsMounted } from '@/hooks/useIsMounted'

import { SortableTreeItem } from './SortableTreeItem'
import type { FlattenedItem, TreeItem } from './types'
// import { MENU_LENGTH_MAX_NUMBER } from '@/constants/editor';
// import { useModel } from 'umi';
// import { useMenuManagerContext } from './context';
import {
  buildTree,
  flattenTree,
  getChildCount,
  getProjection,
  removeChildrenOf,
  removeItem,
  setProperty,
} from './utilities'

const MENU_LENGTH_MAX_NUMBER = 100

const measuring = {
  droppable: {
    strategy: MeasuringStrategy.Always,
  },
}

const dropAnimationConfig: DropAnimation = {
  keyframes({ transform }) {
    return [
      { opacity: 1, transform: CSS.Transform.toString(transform.initial) },
      {
        opacity: 0,
        transform: CSS.Transform.toString({
          ...transform.final,
          x: transform.final.x + 5,
          y: transform.final.y + 5,
        }),
      },
    ]
  },
  easing: 'ease-out',
  sideEffects({ active }) {
    active.node.animate([{ opacity: 0 }, { opacity: 1 }], {
      duration: defaultDropAnimation.duration,
      easing: defaultDropAnimation.easing,
    })
  },
}

const adjustTranslate: Modifier = ({ transform }) => {
  return {
    ...transform,
    y: transform.y - 25,
  }
}

interface Props {
  collapsible?: boolean
  value?: TreeItem[]
  indentationWidth?: number
  indicator?: boolean
  removable?: boolean
  onChange?: (items: TreeItem[]) => void
  children?: React.ReactNode | ((id: UniqueIdentifier) => React.ReactNode)
}

export function SortableTree({
  collapsible,
  value = [],
  indicator = false,
  indentationWidth = 24,
  removable,
  onChange,
  children: childrenComponent,
}: Props) {
  // const { toggleMenuDialog } = useMenuManagerContext();
  // const { toggleMenuItem } = useModel('useEditPageModel', (model) => ({
  //   toggleMenuItem: model.toggleMenuItem,
  // }));

  const [items, setItems] = useState(() => value)
  const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null)
  const [overId, setOverId] = useState<UniqueIdentifier | null>(null)
  const [offsetLeft, setOffsetLeft] = useState(0)

  const flattenedItems = useMemo(() => {
    const flattenedTree = flattenTree(items)
    const collapsedItems = flattenedTree.reduce<UniqueIdentifier[]>(
      (acc, { children, collapsed, id }) =>
        collapsed && children.length ? [...acc, id] : acc,
      []
    )

    return removeChildrenOf(
      flattenedTree,
      activeId ? [activeId, ...collapsedItems] : collapsedItems
    )
  }, [activeId, items])

  const projected =
    activeId && overId
      ? getProjection(
          flattenedItems,
          activeId,
          overId,
          offsetLeft,
          indentationWidth
        )
      : null

  const sortedIds = useMemo(
    () => flattenedItems.map(({ id }) => id),
    [flattenedItems]
  )
  const activeItem = activeId
    ? flattenedItems.find(({ id }) => id === activeId)
    : null

  const isDragValid = useMemo(() => {
    if (projected) {
      if (projected?.depth === 0) return true
      if (projected?.depth === 1 && activeItem?.children?.length === 0)
        return true
    }
    return false
  }, [projected, activeItem])

  function handleDragStart({ active: { id: activeId } }: DragStartEvent) {
    setActiveId(activeId)
    setOverId(activeId)

    document.body.style.setProperty('cursor', 'grabbing')
  }

  function handleDragMove({ delta }: DragMoveEvent) {
    setOffsetLeft(delta.x)
  }

  function handleDragOver({ over }: DragOverEvent) {
    setOverId(over?.id ?? null)
  }

  function handleDragEnd({ active, over }: DragEndEvent) {
    resetState()

    if (isDragValid && projected && over) {
      const { depth, parentId } = projected
      const clonedItems: FlattenedItem[] = JSON.parse(
        JSON.stringify(flattenTree(items))
      )
      const overIndex = clonedItems.findIndex(({ id }) => id === over.id)
      const activeIndex = clonedItems.findIndex(({ id }) => id === active.id)
      const activeTreeItem = clonedItems[activeIndex]

      clonedItems[activeIndex] = { ...activeTreeItem, depth, parentId }

      const sortedItems = arrayMove(clonedItems, activeIndex, overIndex)
      const newItems = buildTree(sortedItems)

      if (newItems.length > MENU_LENGTH_MAX_NUMBER) {
        // Message.error(`最多支持${MENU_LENGTH_MAX_NUMBER}个一级菜单`);
      } else {
        setItems(newItems)
        onChange?.(newItems)
      }
    }
  }

  function handleDragCancel() {
    resetState()
  }

  function resetState() {
    setOverId(null)
    setActiveId(null)
    setOffsetLeft(0)

    document.body.style.setProperty('cursor', '')
  }

  function handleRemove(id: UniqueIdentifier) {
    setItems((items) => {
      const newItems = removeItem(items, id)
      onChange?.(newItems)
      return newItems
    })
  }

  function handleCollapse(id: UniqueIdentifier) {
    setItems((items) =>
      setProperty(items, id, 'collapsed', (value) => {
        return !value
      })
    )
  }

  useEffect(() => {
    setItems(value)
  }, [value])

  const isMounted = useIsMounted()

  return (
    <DndContext
      collisionDetection={closestCenter}
      measuring={measuring}
      onDragStart={handleDragStart}
      onDragMove={handleDragMove}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <SortableContext items={sortedIds} strategy={verticalListSortingStrategy}>
        {flattenedItems.map(
          ({
            id,
            // name,
            children,
            // hidden = false,
            collapsed,
            depth,
            // type,
            // value,
          }) => (
            <SortableTreeItem
              key={id}
              id={id}
              value={`${id}`}
              // hidden={hidden}
              depth={id === activeId && projected ? projected.depth : depth}
              indentationWidth={indentationWidth}
              indicator={indicator}
              collapsed={Boolean(collapsed && children.length)}
              onCollapse={
                collapsible && children.length
                  ? () => handleCollapse(id)
                  : undefined
              }
              onRemove={removable ? () => handleRemove(id) : undefined}
              isDragValid={isDragValid}
            >
              {typeof childrenComponent === 'function'
                ? childrenComponent(id)
                : childrenComponent}
            </SortableTreeItem>
          )
        )}
        {isMounted() &&
          createPortal(
            <DragOverlay
              dropAnimation={dropAnimationConfig}
              modifiers={indicator ? [adjustTranslate] : undefined}
            >
              {activeId && activeItem ? (
                <SortableTreeItem
                  id={activeId}
                  depth={activeItem.depth}
                  clone
                  childCount={getChildCount(items, activeId) + 1}
                  value={`${activeItem.id}`}
                  indentationWidth={indentationWidth}
                >
                  {typeof childrenComponent === 'function'
                    ? childrenComponent(activeId)
                    : childrenComponent}
                </SortableTreeItem>
              ) : null}
            </DragOverlay>,
            document.body
          )}
      </SortableContext>
    </DndContext>
  )
}
