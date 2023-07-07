'use client'

import { useParams } from 'next/navigation'

import DatasetSetting from '../../settings/page'

const DatasetEdit = () => {
  const { dataset_id: datasetId } = useParams()
  console.log(datasetId, '--datasetId')
  // get defaultValue by datasetId
  // const defaultValue =
  return <DatasetSetting />
}
export default DatasetEdit
