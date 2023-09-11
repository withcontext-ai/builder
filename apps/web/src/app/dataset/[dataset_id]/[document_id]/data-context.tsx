'use client'

import { createContext, PropsWithChildren, useContext } from 'react'

export type ChatMode = 'live' | 'debug' | 'history'

interface BaseContextType {
  documentId: string
  notedData?: any[]
  disabledData?: any[]
  datasetId: string
  defaultValues?: any
  isAdd: boolean
  step: number
  setStep?: (s: number) => void
}

export const DataContext = createContext<BaseContextType>({
  documentId: '',
  datasetId: '',
  isAdd: false,
  step: 1,
})

export const useDataContext = () => useContext(DataContext)

export const DataContextProvider = ({
  children,
  ...props
}: PropsWithChildren<BaseContextType>) => (
  <DataContext.Provider value={props}>{children}</DataContext.Provider>
)
