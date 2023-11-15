import { PropsWithChildren } from 'react'
import { Camera, UploadCloud, UploadIcon } from 'lucide-react'

import { cn } from '@/lib/utils'

import { ListTypeProps, UploadFile } from './type'

interface IProps {
  listType?: ListTypeProps
  type?: 'select' | 'drag'
  mergedFileList: UploadFile<any>[]
  bgColor?: string
  isUploading?: boolean
}

const DragButton = (
  <div
    className="
flex h-20 w-[440px] items-center justify-center gap-4 rounded-lg border border-dashed bg-slate-50 text-base transition delay-150 ease-in-out hover:shadow-md"
  >
    <UploadCloud />
    <div className="flex gap-1">
      Drag and drop file, or<span className="font-semibold">Browse</span>
    </div>
  </div>
)

const Wrapper = (
  props: PropsWithChildren<{ className?: string; disabled?: boolean }>
) => (
  <div
    className={cn(
      'flex items-center justify-center rounded-md text-sm font-medium ',
      props?.disabled && 'pointer-events-none opacity-50',
      props?.className
    )}
  >
    {props?.children}
  </div>
)

const FilesUploadButton = (
  <Wrapper>
    <UploadIcon size={16} strokeWidth={3} />
    <span className="pl-2">Upload File</span>
  </Wrapper>
)

const UploadButton = ({
  listType,
  type,
  mergedFileList,
  bgColor,
  isUploading,
  children,
}: IProps & PropsWithChildren) => {
  if (type === 'drag') return DragButton
  // type=select
  if (listType === 'files') return FilesUploadButton
  if (listType === 'image') {
    return (
      <Wrapper className="z-1 h-16 w-16 bg-slate-50">
        {children || <Camera size={28} />}
      </Wrapper>
    )
  }
  if (listType === 'update-image') {
    return (
      <Wrapper
        disabled={isUploading}
        className={cn(
          'relative z-10 flex h-16 w-16 items-center justify-center rounded-lg border p-0',
          mergedFileList?.length === 0
            ? `bg-${bgColor}-600 text-white`
            : 'border-none',
          `hover:${bgColor ? `bg-${bgColor}-600` : 'bg-white'}`,
          'hover:text-white'
        )}
      >
        {children}
        <div className="z-1 absolute bottom-[-8px] right-[-8px] flex h-6 w-6  items-center justify-center rounded-full border bg-white text-black">
          <Camera size={16} strokeWidth={2} />
        </div>
      </Wrapper>
    )
  }
}

export default UploadButton
