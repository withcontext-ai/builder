import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { pick } from 'lodash'
import { Camera, UploadCloud, Upload as UploadIcon } from 'lucide-react'
import RcUpload from 'rc-upload'
import type { UploadProps as RcUploadProps } from 'rc-upload'
import { flushSync } from 'react-dom'

import { cn, nanoid } from '@/lib/utils'

import { Button } from '../ui/button'
import { ImageFile, PDFFile } from './component'
import {
  AbortRef,
  BeforeUploadValueType,
  FilePercent,
  RcFile,
  UploadChangeParam,
  UploadFile,
  UploadProps,
} from './type'
import { changeToUploadFile, file2Obj, FileProps, uploadFile } from './utils'

const Upload = (props: UploadProps) => {
  const {
    fileList,
    maxCount,
    onChange,
    onDrop,
    accept,
    bgText = '',
    bgColor = 'slate',
    action = '',
    multiple = true,
    type = 'select',
    listType = 'pdf',
    listProps = true,
    fileType,
    data,
    className,
    disabled: mergedDisabled,
    customRequest = () => {},
    onChangeFileList,
    beforeUpload,
    setUploading,
  } = props
  const upload = React.useRef<RcUpload>(null)
  const files = changeToUploadFile(fileList || []) as UploadFile<any>[]
  // check is uploading
  const [isUploading, setIsUploading] = useState(false)
  // record the beforeUpload status, only isValid to fetch the google cloud api
  const [isValid, setIsValid] = useState<
    BeforeUploadValueType | Promise<BeforeUploadValueType>
  >(true)
  const [mergedFileList, setMergedFileList] = useState<UploadFile<any>[]>(files)
  const [_, setDragState] = React.useState<string>('drop')
  // abort axios request
  const aborts = useRef<AbortRef>([])
  const [process, setProcess] = useState<FilePercent[]>([])

  const unloadCallback = (event: BeforeUnloadEvent) => {
    event.preventDefault()
    event.returnValue = ''
    return ''
  }

  const handleEndConcert = () => {
    aborts?.current?.forEach((item) => item?.control?.abort())
  }

  useEffect(() => {
    setUploading?.(isUploading)
  }, [isUploading, setUploading])

  // browner close to conform when uploading
  useEffect(() => {
    if (isUploading) {
      window.addEventListener('beforeunload', unloadCallback)
      window.addEventListener('unload', handleEndConcert)
    }
    return () => {
      window.removeEventListener('beforeunload', unloadCallback)
      window.removeEventListener('unload', handleEndConcert)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isUploading])

  const onInternalChange = useCallback(
    (file: UploadFile, changedFileList: UploadFile[]) => {
      let cloneList = [...changedFileList]
      // Cut to match count
      if (maxCount === 1) {
        cloneList = cloneList.slice(-1)
      } else if (maxCount) {
        cloneList = cloneList.slice(0, maxCount)
      }
      // Prevent React18 auto batch since input[upload] trigger process at same time
      // which makes fileList closure problem
      flushSync(() => {
        setMergedFileList(cloneList)
      })
      const changeInfo: UploadChangeParam<UploadFile> = {
        file: file as UploadFile,
        fileList: cloneList,
      }

      flushSync(() => {
        // google api for upload
        if (isValid) {
          uploadFile({
            aborts: aborts,
            setMergedFileList,
            ...changeInfo,
            onChangeFileList,
            setIsUploading,
            fileType,
            setProcess,
          })
        }
      })
    },

    [maxCount, isValid, onChangeFileList, fileType]
  )
  const mergedBeforeUpload = async (file: RcFile, fileListArgs: RcFile[]) => {
    let parsedFile: File | Blob | string = file
    if (beforeUpload) {
      const result = await beforeUpload(file, fileListArgs)
      setIsValid(result)
      if (result === false) {
        return false
      }
    }

    return parsedFile as RcFile
  }

  const onBatchStart: RcUploadProps['onBatchStart'] = (batchFileInfoList) => {
    const objectFileList = batchFileInfoList.map((info) =>
      file2Obj(info.file as RcFile, fileType)
    )
    const newFileList = mergedFileList.concat(objectFileList)

    objectFileList.forEach((fileObj) => {
      const clone = Object.assign(fileObj, { uid: nanoid() })
      onInternalChange(clone, newFileList)
    })
  }

  const handleRemove = useCallback((file: UploadFile) => {
    setMergedFileList((files: UploadFile<any>[]) => {
      const removedFileList = files?.filter(
        (item: UploadFile) => item?.uid !== file?.uid
      )
      if (removedFileList?.length) {
        // to abort the current axios request
        const current = aborts?.current?.find((item) => item?.uid === file?.uid)
        current?.control?.abort()

        // handle fileList
        const removed = removedFileList?.reduce(
          (m: FileProps[], item: UploadFile) => {
            m.push(pick(item, ['url', 'uid', 'type', 'name']))
            return m
          },
          []
        )
        onChangeFileList?.(removed)
      } else {
        onChangeFileList?.([])
      }

      return removedFileList
    })
  }, [])

  const onFileDrop = (e: React.DragEvent<HTMLDivElement>) => {
    setDragState(e.type)
    if (e.type === 'drop') {
      onDrop?.(e)
    }
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const rcUploadProps = {
    onBatchStart,
    ...props,
    data,
    multiple,
    action,
    accept,
    disabled: mergedDisabled,
    onChange,
    customRequest,
    beforeUpload: mergedBeforeUpload,
  } as RcUploadProps

  // Remove id to avoid open by label when trigger is hidden
  if (!props?.children || mergedDisabled) {
    delete rcUploadProps.id
  }

  const showUpdateImageList = useMemo(() => {
    const latest = mergedFileList[mergedFileList?.length - 1]
    return mergedFileList?.length !== 0 ? (
      <ImageFile {...props} file={latest} listProps={false} key={latest?.uid} />
    ) : (
      bgText
    )
  }, [bgText, mergedFileList, props])

  const selectDefaultButton = React.useMemo(() => {
    if (listType === 'files') {
      return (
        <Button type="button">
          <UploadIcon size={16} strokeWidth={3} />
          <span className="pl-2">Upload File</span>
        </Button>
      )
    }
    if (listType === 'update-image') {
      return (
        <Button
          type="button"
          variant="outline"
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
          {showUpdateImageList}
          <div className="z-1 absolute bottom-[-8px] right-[-8px] flex h-6 w-6  items-center justify-center rounded-full border bg-white text-black">
            <Camera size={16} strokeWidth={2} />
          </div>
        </Button>
      )
    } else {
      return (
        <Button
          type="button"
          variant="outline"
          className="z-1 h-16 w-16 bg-slate-50 "
        >
          <Camera size={28} />
        </Button>
      )
    }
  }, [bgColor, isUploading, listType, mergedFileList, showUpdateImageList])
  const defaultButton = React.useMemo(() => {
    // 上传按钮的默认样式
    if (type === 'drag') {
      return (
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
    }
    return selectDefaultButton
  }, [selectDefaultButton, type])

  const showUploadIcon = React.useMemo(() => {
    const file = mergedFileList?.find(
      (item: UploadFile) => item?.type === fileType
    )
    const showImage = listType === 'image' && mergedFileList?.length !== 0
    const image = mergedFileList[0]
    const showOnePdf = listType === 'update-file' && type === 'drag' && file
    return showImage ? (
      <ImageFile
        key={image?.url || image?.uid}
        file={image}
        onRemove={handleRemove}
        className={cn('h-16 w-16', className)}
        listProps={listProps}
      />
    ) : showOnePdf ? (
      <PDFFile
        {...props}
        className={cn(file?.type !== fileType ? 'hidden' : 'block')}
        file={file}
        onRemove={handleRemove}
        listProps={listProps}
        key={file?.uid}
      />
    ) : (
      <RcUpload {...rcUploadProps} ref={upload}>
        {props?.children || defaultButton}
      </RcUpload>
    )
  }, [
    mergedFileList,
    listType,
    type,
    handleRemove,
    className,
    listProps,
    props,
    fileType,
    rcUploadProps,
    defaultButton,
  ])
  return (
    <div>
      <div
        className={cn(
          'flex cursor-pointer flex-col items-start justify-start',
          listType === 'image' ? 'gap-0' : 'gap-2',
          listType === 'files' || listType === 'update-file'
            ? 'h-full w-full'
            : 'h-16 w-16',
          className
        )}
        onClick={onFileDrop}
      >
        {showUploadIcon}

        <div
          className={cn(
            'flex w-full gap-2',
            listType === 'images-list' ? 'flex-row flex-wrap' : 'flex-col'
          )}
        >
          {(listType === 'files' || listType === 'images-list') &&
            mergedFileList?.map((file: UploadFile) => {
              const percent = process?.filter(
                (item) => item?.uid === file?.uid
              )?.[0]?.percent
              return listType !== 'images-list' ? (
                <PDFFile
                  {...props}
                  className={cn(file?.type !== fileType ? 'hidden' : 'block')}
                  file={file}
                  onRemove={handleRemove}
                  listProps={listProps}
                  key={file?.uid}
                  progress={percent}
                />
              ) : (
                <ImageFile
                  {...props}
                  file={file}
                  onRemove={handleRemove}
                  listProps={listProps}
                  key={file?.uid}
                  progress={percent}
                />
              )
            })}
        </div>
      </div>
    </div>
  )
}

export default Upload
