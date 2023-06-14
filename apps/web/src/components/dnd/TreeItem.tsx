'use client'

// import type { ActionProps } from 'fbm-ui';
// import { Actions, DragIndicatorIcon } from 'fbm-ui';
import type { HTMLAttributes } from 'react'
import React, { forwardRef } from 'react'
import clsx from 'clsx'
import { GripVerticalIcon } from 'lucide-react'

// import styles from './TreeItem.less';

export interface Props extends Omit<HTMLAttributes<HTMLLIElement>, 'id'> {
  childCount?: number
  clone?: boolean
  collapsed?: boolean
  depth: number
  disableInteraction?: boolean
  disableSelection?: boolean
  ghost?: boolean
  handleProps?: any
  indicator?: boolean
  indentationWidth: number
  value: string
  onCollapse?: () => void
  onRemove?: () => void
  wrapperRef?: (node: HTMLLIElement) => void
  isDragValid?: boolean
  // actions?: ActionProps[];
}

export const TreeItem = forwardRef<HTMLDivElement, Props>(
  (
    {
      childCount,
      clone,
      depth,
      disableSelection,
      disableInteraction,
      ghost,
      handleProps,
      indentationWidth,
      indicator,
      collapsed,
      hidden,
      onCollapse,
      onRemove,
      style,
      value,
      wrapperRef,
      isDragValid = false,
      // actions,
      ...props
    },
    ref
  ) => {
    const [isHovered, setIsHovered] = React.useState(false)

    return (
      <li
        // className={clsx(
        //   styles.Wrapper,
        //   clone && styles.clone,
        //   ghost && styles.ghost,
        //   indicator && styles.indicator,
        //   disableSelection && styles.disableSelection,
        //   disableInteraction && styles.disableInteraction,
        //   !isDragValid && styles.invalid,
        // )}
        ref={wrapperRef}
        style={
          {
            '--spacing': `${indentationWidth * depth}px`,
          } as React.CSSProperties
        }
        {...props}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* <div className={styles.TreeItem} ref={ref} style={style}> */}
        <div ref={ref} style={style}>
          {/* <div className={styles.DragIcon}> */}
          <div>
            <GripVerticalIcon
              sx={{ cursor: 'grab', '&:focus': { outline: 'none' } }}
              {...handleProps}
            />
          </div>
          {/* <span className={clsx(styles.Text, hidden && styles.Hidden)}>{value}</span> */}
          <span>{value}</span>
          {/* {!clone && onRemove && <CloseIcon onClick={onRemove} sx={{ cursor: 'pointer' }} />} */}
          {/* {isHovered && !clone && actions && <Actions actions={actions} />} */}
          {clone && childCount && childCount > 1 ? (
            // <span className={styles.Count}>{childCount}</span>
            <span>{childCount}</span>
          ) : null}
        </div>
      </li>
    )
  }
)

TreeItem.displayName = 'TreeItem'
