import { ReactNode } from 'react'

import { cn } from '@/lib/utils'

type IProps = {
  variant?: Variant
  children?: ReactNode
  style?: string
}

type Variant =
  | 'h1'
  | 'h2'
  | 'h3'
  | 'h4'
  | 'h5'
  | 'h6'
  | 'subtitle1'
  | 'subtitle2'
  | 'body1'
  | 'body2'
  | 'caption'
  | 'button'
  | 'overline'

const Typography = ({ variant, children, style }: IProps) => {
  const subtile = ['subtitle1', 'subtitle2']
  const body = ['body1', 'body2']
  const content = () => {
    if (variant === 'h1') {
      return (
        <h1 className={cn(`text-6xl font-extrabold text-gray-800 ${style}`)}>
          {children}
        </h1>
      )
    }
    if (variant === 'h2') {
      return (
        <h2 className={cn(`text-5xl font-extrabold text-gray-800 ${style}`)}>
          {children}
        </h2>
      )
    }
    if (variant === 'h3') {
      return (
        <h3 className={cn(`text-3xl font-bold text-gray-800 ${style}`)}>
          {children}
        </h3>
      )
    }
    if (variant === 'h4') {
      return (
        <h4 className={cn(`text-base font-bold text-gray-800 ${style}`)}>
          {children}
        </h4>
      )
    }
    if (variant === 'h5') {
      return (
        <h5 className={cn(`text-xl font-bold text-gray-800 ${style}`)}>
          {children}
        </h5>
      )
    }
    if (variant === 'h6') {
      return (
        <h6 className={cn(`text-lg font-bold text-gray-800	${style}`)}>
          {children}
        </h6>
      )
    }
    if (variant && subtile?.includes(variant)) {
      return (
        <p
          className={cn(
            `font-semibold ${
              variant === 'subtitle1' ? 'text-base' : 'text-sm'
            } ${style}`
          )}
        >
          {children}
        </p>
      )
    }
    if (variant && body?.includes(variant)) {
      return (
        <p
          className={cn(
            `font-normal ${
              variant === 'body1' ? 'text-base' : 'text-sm'
            } ${style}`
          )}
        >
          {children}
        </p>
      )
    }
    if (variant === 'caption') {
      return <p className={cn(`text-xs font-normal ${style}`)}>{children}</p>
    } else {
      return <p className={cn(`text-sm font-normal ${style}`)}>{children}</p>
    }
  }
  return <>{content()}</>
}

export default Typography
