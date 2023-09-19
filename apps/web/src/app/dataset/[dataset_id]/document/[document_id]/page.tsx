import {
  getDataInfo,
  getDocuments,
  getNotedData,
} from '@/db/datasets/documents/action'
import { getDocumentByTable, getDocumentDetail } from '@/db/documents/action'

import SettingPage from './setting-page'
import { omit, pick } from 'lodash';

interface IProps {
  params: { dataset_id: string; document_id: string }
}
export default async function Page({ params }: IProps) {
  const { dataset_id, document_id } = params
  const { data: apps = [] } = await getNotedData()
  const documents = await getDocuments({ dataset_id })

  const { data } = await getDataInfo(dataset_id, document_id)
  // const files = data?.files?.filter((item: any) => item?.type === 'pdf')
  // const notedData = data?.files?.filter(
  //   (item: any) => item?.type === 'annotated data'
  // )  
  
  const detail= await getDocumentDetail(document_id)

  const type = detail?.type
  const isPdf = type==='pdf'
  const current = pick(detail,['type', 'url','name','icon', 'uid'])
  const files = isPdf?current:[]
  const notedData = !isPdf?current||[]
  const defaultValues = {
 
      splitConfig:detail?.config?.splitConfig
      files,
      notedData,
    ,
  }


  console.log(detail, '----document_id', document_id)
  return (
    <div className="h-full overflow-auto">
      <div className="w-full">
        {/* Desktop version, can edit */}
        <SettingPage
          defaultValues={defaultValues}
          datasetId={dataset_id}
          document_id={document_id}
          apps={apps}
          documents={documents?.documents}
        />
      </div>
    </div>
  )
}
