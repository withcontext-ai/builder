'use client'

import { createContext, PropsWithChildren, useContext } from 'react'

import { DataBaseProps, DataSchemeProps } from '@/app/dataset/type'

interface DocumentContextType {
  documentId: string
  notedData?: DataBaseProps[]
  datasetId: string
  defaultValues?: DataSchemeProps
  isAdd: boolean
  step: number
  setStep?: (s: number) => void
}

export const DataContext = createContext<DocumentContextType>({
  documentId: '',
  datasetId: '',
  isAdd: false,
  step: 1,
})

export const useDataContext = () => useContext(DataContext)

export const DataContextProvider = ({
  children,
  ...props
}: PropsWithChildren<DocumentContextType>) => (
  <DataContext.Provider value={props}>{children}</DataContext.Provider>
)
