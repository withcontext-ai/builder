'use client'

import { RefObject, useRef, useState } from 'react'

import DatasetContent from './content'
import SlideBar from './slidebar'

export interface SectionType {
  ref: RefObject<HTMLAnchorElement>
  title: string
  name: string
}

const DatasetSetting = () => {
  const [selected, setSelected] = useState<string>('loaders')
  const loadersRef = useRef<HTMLAnchorElement>(null)
  const splittersRef = useRef<HTMLAnchorElement>(null)

  const modelsRef = useRef<HTMLAnchorElement>(null)

  const storesRef = useRef<HTMLAnchorElement>(null)
  const retrieversRef = useRef<HTMLAnchorElement>(null)
  const sections: SectionType[] = [
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
      <div className="flex-1">
        <DatasetContent sections={sections} />
      </div>
    </div>
  )
}

export default DatasetSetting
