'use client'

import { RefObject, useRef, useState } from 'react'

import DatasetForm from './dataset-form'
import SlideBar from './slidebar'

export interface SectionType {
  ref?: RefObject<HTMLElement>
  title: string
  name: string
}

const DatasetSetting = () => {
  const [selected, setSelected] = useState<string>('loaders')
  const nameRef = useRef<HTMLAnchorElement>(null)
  const loadersRef = useRef<HTMLAnchorElement>(null)
  const splittersRef = useRef<HTMLAnchorElement>(null)

  const modelsRef = useRef<HTMLAnchorElement>(null)

  const storesRef = useRef<HTMLAnchorElement>(null)
  const retrieversRef = useRef<HTMLAnchorElement>(null)
  const sections: SectionType[] = [
    {
      title: 'Dataset Name',
      ref: nameRef,
      name: '#dataset-name',
    },
    {
      title: 'Document Loaders',
      ref: loadersRef,
      name: '#loaders',
    },
    {
      title: 'Text Splitters',
      ref: splittersRef,
      name: '#splitters',
    },
    {
      title: 'Text Embedding Models',
      ref: modelsRef,
      name: '#models',
    },
    {
      title: ' Vector Stores',
      ref: storesRef,
      name: '#stores',
    },
    {
      title: 'Retrievers',
      ref: retrieversRef,
      name: '#retrievers',
    },
  ]
  return (
    <div className="fixed inset-0 flex h-full w-full bg-white">
      <div className="w-[276px] border-r border-slate-200 bg-slate-50">
        <SlideBar
          selected={selected}
          setSelected={setSelected}
          sections={sections}
        />
      </div>
      <DatasetForm sections={sections} />
    </div>
  )
}

export default DatasetSetting
