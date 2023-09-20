import { redirect } from 'next/navigation'

import { auth } from '@/lib/auth'
import { getDataset } from '@/db/datasets/actions'
import { getDocuments, getNotedData } from '@/db/datasets/documents/action'

import SettingPage from '../[document_id]/setting-page'

const defaultValues = {
  loaderType: 'pdf',
  splitType: 'character',
  files: [],
  notedData: [],
  chunkSize: 1000,
  chunkOverlap: 0,
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
        <SettingPage
          defaultValues={defaultValues}
          datasetId={dataset_id}
          document_id={'add'}
          apps={apps?.data || []}
          documents={documents?.documents}
        />
      </div>
    </div>
  )
}
export default DatasetEdit
