'use client'

import { ChangeEvent } from 'react'
import axios from 'axios'

export default function UploadInput() {
  const uploadPhoto = async (e: ChangeEvent<HTMLInputElement>) => {
    try {
      const file = e.currentTarget.files?.[0]
      if (!file) return

      const filename = encodeURIComponent(file.name)
      const res = await fetch(`/api/upload-url/gcp?filename=${filename}`)
      const { success, data } = await res.json()

      if (!success) return

      const { upload_url, upload_fields, file_url } = data as {
        provider: string
        upload_url: string
        upload_fields: { [key: string]: string }
        file_url: string
        file_path: string
      }

      const formData = new FormData()
      Object.entries({ ...upload_fields, file }).forEach(([key, value]) => {
        formData.append(key, value)
      })

      axios
        .post(upload_url, formData, {
          onUploadProgress: (progressEvent) => {
            console.log('progressEvent:', progressEvent)
          },
        })
        .then(() => {
          console.log('upload success:', file_url)
        })
        .catch((error) => {
          console.error(error)
        })
    } catch (error) {
      console.log('error:', error)
    }
  }

  return <input onChange={uploadPhoto} type="file" />
}
