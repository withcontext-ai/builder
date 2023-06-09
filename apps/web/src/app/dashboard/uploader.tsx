'use client'

import axios from 'axios'

export default function Uploader() {
  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const file = e.currentTarget.files?.[0]
      if (!file) return

      const formData = new FormData()
      formData.append('file', file)

      axios
        .post('http://127.0.0.1:5000/upload', formData, {
          onUploadProgress: (progressEvent) => {
            console.log('progressEvent:', progressEvent)
          },
        })
        .then((res) => {
          console.log('upload success:', res)
        })
        .catch((error) => {
          console.error(error)
        })
    } catch (error) {
      console.log('error:', error)
    }
  }

  return <input type="file" onChange={handleChange} />
}
