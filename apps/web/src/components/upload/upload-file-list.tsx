import { cn } from '@/lib/utils'

import { FileCard, ImageCard } from './component'
import { FilePercent, UploadFile, UploadProps } from './type'

interface IProps extends UploadProps {
  mergedFileList: UploadFile<any>[]
  process: FilePercent[]
  onRemove: (file: UploadFile<any>) => void
}

const UploadFileList = ({
  listType,
  mergedFileList,
  process,
  fileType,
  listProps,
  onRemove,
  ...props
}: IProps) => {
  const showFiles = listType === 'files' || listType === 'update-file'
  const latestIndex = mergedFileList?.length - 1
  const _mergedFileList =
    listType === 'update-image' ? [mergedFileList[latestIndex]] : mergedFileList
  const hiddenList = listType === 'update-image' || listType === 'image'
  return (
    <div
      className={cn(
        'flex w-full gap-2',
        listType === 'images-list' ? 'flex-row flex-wrap' : 'flex-col',
        hiddenList && 'hidden'
      )}
    >
      {_mergedFileList?.map((file: UploadFile) => {
        const percent = process?.filter((item) => item?.uid === file?.uid)?.[0]
          ?.percent
        return showFiles ? (
          <FileCard
            {...props}
            className={cn(file?.type !== fileType ? 'hidden' : 'block')}
            file={file}
            onRemove={() => onRemove(file)}
            listProps={listProps}
            key={file?.uid}
            progress={percent}
          />
        ) : (
          <ImageCard
            {...props}
            file={file}
            onRemove={() => onRemove(file)}
            listProps={listProps}
            key={file?.uid}
            progress={percent}
          />
        )
      })}
    </div>
  )
}

export default UploadFileList
