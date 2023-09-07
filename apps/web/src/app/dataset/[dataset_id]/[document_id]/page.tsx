'use client'

import { useEffect, useState } from 'react'
import { omit } from 'lodash'
import useSWRMutation from 'swr/mutation'

import { fetcher } from '@/lib/utils'

import SettingPage from './setting-page'

interface IProps {
  params: { dataset_id: string; document_id: string }
  defaultValues: any
}

async function getData(url: string) {
  return fetcher(url, {
    method: 'GET',
  })
}
const defaultValues = {
  dataConfig: {
    loaderType: 'pdf',
    splitType: 'character',
    files: [],
    chunkSize: 1000,
    chunkOverlap: 0,
  },
}

const EditPage = ({ params }: IProps) => {
  const { dataset_id, document_id } = params
  const [values, setValue] = useState({
    dataConfig: {
      loaderType: 'pdf',
      splitType: 'character',
      files: [],
      chunkSize: 1000,
      chunkOverlap: 0,
    },
  })

  const search = new URLSearchParams({
    ...params,
  }).toString()
  const { trigger, isMutating, data } = useSWRMutation(
    `/api/datasets/document?${search}`,
    getData
  )

  useEffect(() => {
    trigger().then((res) => {
      setValue({ dataConfig: { ...res?.config, files: res?.files } })
    })
  }, [trigger])
  return (
    <div className="h-full overflow-auto">
      <div className="w-[600px]">
        {/* Desktop version, can edit */}
        <SettingPage
          defaultValues={values}
          datasetId={dataset_id}
          document_id={document_id}
        />

        {/* Mobile version, view only */}
        {/* <DatasetViewer
        name={datasetDetail?.name}
        config={datasetDetail?.config || {}}
      /> */}
      </div>
    </div>
  )
}
export default EditPage
