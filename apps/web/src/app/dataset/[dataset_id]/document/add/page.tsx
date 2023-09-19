import { redirect } from 'next/navigation'

import { auth } from '@/lib/auth'
import { getDataset } from '@/db/datasets/actions'
import { getDocuments, getNotedData } from '@/db/datasets/documents/action'

import SettingPage from '../[document_id]/setting-page'

const defaultValues = {
  loaderType: 'pdf',
  files: [],
  notedData: [],
  splitConfig: {
    chunkSize: 1000,
    chunkOverlap: 0,
    splitType: 'character',
  },
}

interface IProps {
  params: { dataset_id: string }
}
const DatasetEdit = async ({ params }: IProps) => {
  const { dataset_id } = params
  const { userId } = auth()
  const datasetDetail = await getDataset(dataset_id)
  const apps = await getNotedData()
  const documents = await getDocuments({ dataset_id })

  if (datasetDetail.created_by !== userId) {
    redirect('/')
  }

  return (
    <div className="h-full overflow-auto">
      <div className="w-full">
        {/* Desktop version, can edit */}
        <SettingPage
          defaultValues={defaultValues}
          datasetId={dataset_id}
          document_id={'add'}
          apps={apps?.data || []}
          documents={documents?.documents}
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
export default DatasetEdit
