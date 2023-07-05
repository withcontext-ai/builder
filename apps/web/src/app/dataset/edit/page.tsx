'use client'

import { RefObject, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'

import DatasetForm from './dataset-form'
import SlideBar from './slidebar'

export interface SectionType {
  ref?: RefObject<HTMLElement>
  title: string
  name: string
}

const DatasetSetting = () => {
  const [selected, setSelected] = useState<string>('#loaders')
  const [error, setError] = useState<string>('')
  const [saved, setSaved] = useState<boolean>(false)
  const router = useRouter()

  const handleGoBack = () => {
    if (!saved) {
      setError('Your changes have not been published yet!')
    } else {
      router.back()
    }
  }

  const handleSelected = (cur: string) => {
    setSelected(cur)
  }
  return (
    <div className="fixed inset-0 flex h-full w-full bg-white">
      <div className="w-[276px] border-r border-slate-200 bg-slate-50">
        <SlideBar
          handleGoBack={handleGoBack}
          handleSelected={handleSelected}
          selected={selected}
        />
      </div>
      <DatasetForm
        setSelected={setSelected}
        error={error}
        setError={setError}
        setSaved={setSaved}
      />
    </div>
  )
}

export default DatasetSetting
