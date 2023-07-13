'use client'

import { useState } from 'react'
import { Camera, Loader2 } from 'lucide-react'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { RcFile, UploadFile } from '@/components/upload/type'
import Upload from '@/components/upload/upload'

const UploadScenes = () => {
  const [files, setFiles] = useState<UploadFile[]>([])
  const [images, setImages] = useState<UploadFile[]>([])
  const [image, setImage] = useState<UploadFile[]>([])
  const [custom, setCustom] = useState<UploadFile[]>([])
  const [current, setCurrent] = useState<UploadFile[]>([])
  const [dragFile, setDragFile] = useState<UploadFile[]>([])
  const handleCurrent = (files: UploadFile[]) => {
    const latest = files?.length - 1
    const current = files?.[latest]
    setCurrent([current])
  }

  const handelRemoveImage = (file: UploadFile) => {
    const data = images?.filter((item) => item?.uid !== file?.uid)
    setImage([...data])
  }

  const handleRemove = (file: UploadFile) => {
    const data = files?.filter((item) => item?.uid !== file?.uid)
    setFiles(data)
  }

  const beforeUpload = (info: RcFile) => {
    if (info?.size > 1024 * 1024 * 5) {
      console.log('the file is larger than 5M')
      return false
    }
    return true
  }

  const disabled = current?.[0]?.status === 'uploading'
  return (
    <div className="w-[960px] space-y-8 p-6">
      <section className="flex w-[600px] flex-col justify-start space-y-3">
        <h1 className="text-xl	">pdf list</h1>
        <Upload
          fileList={files}
          accept=".pdf"
          beforeUpload={beforeUpload}
          // default just show removeIcon,if showUploadList=false show no icon
          showUploadList={{ showPreviewIcon: true, showDownloadIcon: true }}
          /***
           * default api is google cloud , just use handleFiles to get the uploadFiles you need
           * you can also to by onChange to use your own api
           *  */
          handleFiles={(files) => setFiles([...files])}
          onRemove={handleRemove}
        />
      </section>

      <section className="flex w-[600px] flex-col justify-start space-y-3">
        <h1 className="text-xl	"> show default image list</h1>
        <Upload
          listType="images-list"
          accept=".png,jpeg,.jpg,.webp"
          fileList={images}
          onRemove={(file) => handelRemoveImage(file)}
          handleFiles={(files: UploadFile[]) => setImages(files)}
        />
      </section>

      <section className="flex w-[600px] flex-col justify-start space-y-3">
        <h1 className="text-xl">
          image: one step: delete the image ,tow step:upload a new
        </h1>
        <Upload
          listType="image"
          fileList={image}
          accept=".png,jpeg,.jpg,.webp"
          handleFiles={(files) => setImage(files)}
          onRemove={(file) => setImage([])}
        />
      </section>

      <section className="flex w-[600px] flex-col justify-start space-y-3">
        <h1 className="text-xl">
          custom yourself: you can design your upload button or your fileList
          card
        </h1>
        <Upload
          listType="images-list"
          accept=".png,jpeg,.jpg,.webp"
          // showFileListCard : default true, if false you can design your own fileList card
          showFileListCard={false}
          fileList={custom}
          handleFiles={(files) => setCustom(files)}
        >
          <Button className="gap-2">
            upload images
            <Camera size={24} strokeWidth={2} />
          </Button>
        </Upload>
        <div className="flex gap-2">
          {custom?.map((image) => {
            return (
              <div
                className={cn(
                  'relative flex h-16 w-16 items-center justify-center rounded-lg border',
                  image?.status === 'uploading' ? 'bg-slate-200' : ''
                )}
                key={image?.uid}
              >
                {image.url && <img src={image?.url} alt="image" />}
                {image?.status === 'uploading' && (
                  <Loader2 className="animate-spin" />
                )}
              </div>
            )
          })}
        </div>
      </section>

      <section className="flex w-[600px] flex-col justify-start space-y-3">
        <h1 className="text-xl">
          update image: just one step upload a new and to update the current
        </h1>
        <div
          className={cn(
            'relative flex h-16 w-16 items-center justify-center rounded-lg border-0 bg-orange-600',
            current[0]?.status === 'error' ? 'border-[#ff4d4f]' : '',
            current[0]?.status === 'uploading' ? 'bg-gray-50' : '',
            current[0]?.status === 'success'
              ? 'border border-gray-100 bg-white'
              : ''
          )}
        >
          {current?.[0]?.url && <img src={current?.[0]?.url} alt="" />}
          {disabled && (
            <div className="bg-slate-100">
              <Loader2 className="h-3 w-3 animate-spin" />
            </div>
          )}
          <Upload
            listType="images-list"
            className="z-1 absolute bottom-[-8px] right-[-8px] h-6 w-6 gap-0 rounded-full border bg-white text-black"
            accept=".png,jpeg,.jpg,.webp"
            showFileListCard={false}
            fileList={current}
            disabled={disabled}
            handleFiles={handleCurrent}
          >
            <Button
              className="h-6 w-6 rounded-full"
              variant="outline"
              size="icon"
              disabled={disabled}
            >
              <Camera size={16} strokeWidth={2} />
            </Button>
          </Upload>
        </div>
      </section>

      <section className="flex w-[600px] flex-col justify-start space-y-3">
        <h1 className="text-xl">use your own api</h1>
        <Upload
          listType="images-list"
          accept=".png,jpeg,.jpg,.webp"
          action="your own form action url"
          //rc-upload doc: https://upload-react-component.vercel.app/
          onChange={({ file, fileList }) => {
            // handel the file
            console.log(file, fileList, '----onChange')
          }}
          onRemove={(file) => {
            console.log(file, '----remove the current file')
          }}
        />
      </section>

      <section className="flex w-[600px] flex-col justify-start space-y-3">
        <h1 className="text-xl">drag multiple files</h1>
        <Upload
          fileList={dragFile}
          listType="images-list"
          type="drag"
          accept=".png,jpeg,.jpg,.webp"
          handleFiles={(files) => setDragFile([...files])}
          // onRemove={handleRemove}
        />
      </section>
    </div>
  )
}

export default UploadScenes
