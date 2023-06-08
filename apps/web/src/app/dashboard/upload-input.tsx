'use client'

import { ChangeEvent } from 'react'
import axios from 'axios'

export default function UploadInput() {
  const uploadPhoto = async (e: ChangeEvent<HTMLInputElement>) => {
    try {
      const file = e.target.files?.[0]
      if (!file) return
      // const file = e.currentTarget.files?.[0]
      // const filename = encodeURIComponent(file.name)
      const res = await fetch(`/api/upload-url/gcs?id=abc`)
      const { url } = await res.json()
      const formData = new FormData()
      // const json = await res.json()
      console.log('url:', url)

      formData.append('file', file)
      // Object.entries({ file }).forEach(([key, value]) => {
      // })

      // const upload = await fetch(url, {
      //   method: 'POST',
      //   body: formData,
      // })

      // if (upload.ok) {
      //   console.log('Uploaded successfully!')
      // } else {
      //   console.error('Upload failed.')
      // }

      // axios
      //   .put(url, formData, {
      //     headers: {
      //       'Content-Type': 'multipart/form-data', // 设置请求头为 multipart/form-data
      //     },
      //     onUploadProgress: (progressEvent) => {
      //       // 监听上传进度
      //       // const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
      //       // console.log(percentCompleted);
      //       console.log('progressEvent:', progressEvent)
      //     },
      //   })
      //   .then((response) => {
      //     console.log(response.data)
      //   })
      //   .catch((error) => {
      //     console.error(error)
      //   })
    } catch (error) {
      console.log('error:', error)
      // <Error>
      //   <Code>SignatureDoesNotMatch</Code>
      //   <Message>
      //     The request signature we calculated does not match the signature you
      //     provided. Check your Google secret key and signing method.
      //   </Message>
      //   <StringToSign>
      //     GOOG4-RSA-SHA256 20230608T065907Z 20230608/auto/storage/goog4_request
      //     6c91db9ee2ff20039702aca1f0bb61d86fa75c27cedae6fc02cd24530f2bb5cd
      //   </StringToSign>
      //   <CanonicalRequest>
      //     PUT /context-builder/Chat.png
      //     X-Goog-Algorithm=GOOG4-RSA-SHA256&X-Goog-Credential=builder%40withcontextai.iam.gserviceaccount.com%2F20230608%2Fauto%2Fstorage%2Fgoog4_request&X-Goog-Date=20230608T065907Z&X-Goog-Expires=900&X-Goog-SignedHeaders=content-type%3Bhost
      //     content-type:multipart/form-data;
      //     boundary=----WebKitFormBoundaryguqdtNcyrAaWg1M1
      //     host:storage.googleapis.com content-type;host UNSIGNED-PAYLOAD
      //   </CanonicalRequest>
      // </Error>
    }
  }

  return <input onChange={uploadPhoto} type="file" />
}
