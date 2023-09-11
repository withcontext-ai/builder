'use client'

import { useState } from 'react'

import { cn } from '@/lib/utils'

import DataForm from './data-form'

interface StepProps {
  active: number
}

const steps = [
  {
    step: 1,
    text: 'Document Loaders',
  },
  {
    step: 2,
    text: 'Text Splitter',
  },
  {
    step: 3,
    text: 'Preview',
  },
]

const Step = ({ active }: StepProps) => {
  return (
    <div className="flex items-center gap-4">
      {steps?.map((item, index) => {
        return (
          <div key={item?.step} className="flex items-center gap-4">
            <div className="flex items-center gap-4">
              <div
                className={cn(
                  'flex h-10 w-10 items-center justify-center rounded-full border text-center',
                  active === item?.step && 'bg-black  text-white'
                )}
              >
                {item?.step}
              </div>
              <div>{item?.text}</div>
            </div>
            {index !== steps?.length - 1 && (
              <div className="h-px w-8 bg-slate-400" />
            )}
          </div>
        )
      })}
    </div>
  )
}

interface DataProps {
  datasetId: string
  document_id: string
  defaultValues: any
}
const SettingPage = ({ datasetId, document_id, defaultValues }: DataProps) => {
  const [active, setActive] = useState(1)
  return (
    <div className="insert-0 w-max-[600px] fixed left-0 z-10 h-full w-full space-y-10 overflow-y-auto bg-white px-[140px] py-18">
      <div className="text-2xl font-semibold">
        {document_id === 'add' ? 'Add' : 'Edit'} New Data
      </div>
      <Step active={active} />
      <DataForm
        active={active}
        defaultValues={defaultValues}
        documentId={document_id}
        setActive={setActive}
        datasetId={datasetId}
      />
    </div>
  )
}

export default SettingPage
