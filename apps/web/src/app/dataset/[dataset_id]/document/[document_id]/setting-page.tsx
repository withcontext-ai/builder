'use client'

import { useState } from 'react'
import { Check } from 'lucide-react'

import { cn } from '@/lib/utils'
import {
  AppInfoProps,
  DataSchemeProps,
  NotedDataProps,
} from '@/app/dataset/type'

import { DataContextProvider, useDataContext } from './data-context'
import DataForm from './data-form'

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

const Step = () => {
  const { step } = useDataContext()
  return (
    <div className="flex items-center gap-4">
      {steps?.map((item, index) => {
        return (
          <div key={item?.step} className="flex items-center gap-4">
            <div className="flex items-center gap-4">
              <div
                className={cn(
                  'flex h-10 w-10 items-center justify-center rounded-full border border-slate-900 text-center font-semibold',
                  step >= item?.step && 'bg-black  text-white'
                )}
              >
                {step > item?.step ? <Check /> : item?.step}
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

interface DataParams {
  datasetId: string
  document_id: string
  defaultValues: DataSchemeProps
  apps: NotedDataProps[]
}
const SettingPage = ({
  datasetId,
  document_id,
  defaultValues,
  apps,
}: DataParams) => {
  const [step, setStep] = useState(1)
  const isAdd = document_id === 'add'
  return (
    <div className="w-max-[600px] left-0  h-full w-full space-y-10 overflow-y-auto bg-white px-[140px] py-18">
      <div className="text-2xl font-semibold">
        {document_id === 'add' ? 'Add New' : 'Edit'} Data
      </div>
      <DataContextProvider
        notedData={apps || []}
        datasetId={datasetId}
        defaultValues={defaultValues}
        documentId={document_id}
        step={step}
        setStep={setStep}
        isAdd={isAdd}
      >
        <Step />
        <DataForm />
      </DataContextProvider>
    </div>
  )
}

export default SettingPage
