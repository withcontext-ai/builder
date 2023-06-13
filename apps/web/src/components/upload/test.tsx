'use client'

import { useState } from 'react'
import axios from 'axios'

import { UploadFile } from './type'
import Upload from './upload'

const TestUpload = ({
  listType,
}: {
  listType: 'image' | 'pdf' | 'images-list'
}) => {
  const [files, setFiles] = useState<UploadFile[]>([])

  const changeFile = async (file: UploadFile, filelist: UploadFile[]) => {
    const index = filelist?.indexOf(
      // @ts-ignore
      (item: { uid: any }) => item?.uid === file?.uid
    )
    if (index !== -1) {
      filelist[index] = file
    }
  }
  const onChange = async ({
    file,
    fileList,
  }: {
    file: UploadFile
    fileList: UploadFile[]
  }) => {
    file.status = 'uploading'
    file.percent = 0
    changeFile(file, fileList)
    setFiles([...files, ...fileList])
    if (!file) return
    const filename = encodeURIComponent(file?.name || '')
    const res = await fetch(`/api/upload-url/gcp?filename=${filename}`)
    const { success, data, error } = await res.json()
    if (!success) {
      file.status = 'error'
      changeFile(file, fileList)
      setFiles([...files, ...fileList])
    }

    const { upload_url, upload_fields, file_url } = data as {
      provider: string
      upload_url: string
      upload_fields: { [key: string]: string }
      file_url: string
      file_path: string
    }
    const formData = new FormData()
    Object.entries({ ...upload_fields, file: file?.originFileObj }).forEach(
      ([key, value]) => {
        // @ts-ignore
        formData.append(key, value)
      }
    )

    axios
      .post(upload_url, formData, {
        onUploadProgress: (progressEvent) => {
          file.status = 'uploading'
          console.log('progressEvent:', progressEvent)
          const { progress = 0 } = progressEvent
          file.percent = progress * 100
          changeFile(file, fileList)
          setFiles([...files, ...fileList])
        },
      })
      .then(() => {
        file.status = 'success'
        file.url = file_url
        changeFile(file, fileList)
        setFiles([...files, ...fileList])
      })
      .catch((error) => {
        file.status = 'error'
        console.error(error)
      })
  }

  const handleRemove = (file: UploadFile) => {
    const data = files?.filter((item) => item?.uid !== file?.uid)
    setFiles(data)
  }

  // @ts-ignore
  return (
    <Upload
      fileList={files}
      // @ts-ignore
      onChange={onChange}
      action=""
      listType={listType || 'pdf'}
      onRemove={handleRemove}
      customRequest={() => {}}
    />
  )
}

export default TestUpload
