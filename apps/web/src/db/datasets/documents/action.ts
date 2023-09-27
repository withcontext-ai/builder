import { auth } from '@clerk/nextjs'
import { omit, pick } from 'lodash'

import { getApps } from '@/db/apps/actions'
import { NewApp } from '@/db/apps/schema'
import { DataProps, DocumentProps } from '@/app/dataset/type'

import { getDataset, getEditParams } from '../actions'
import { NewDataset } from '../schema'

export async function getDocuments({ dataset_id }: { dataset_id: string }) {
  const datasetDetail = (await getDataset(dataset_id)) as NewDataset
  const { updated_at, status } = datasetDetail
  const config = datasetDetail?.config || {}
  const basicsConfig = omit(config, [
    'splitType',
    'chunkSize',
    'chunkOverlap',
    'loaderType',
    'files',
  ])
  // @ts-ignore
  const documents = datasetDetail?.config?.files || []
  return {
    documents,
    updated_at,
    status,
    config,
    name: datasetDetail?.name,
    basicsConfig,
  }
}

// get data info
export async function getDataInfo(dataset_id: string, uid: string) {
  const { documents } = await getDocuments({ dataset_id })
  const detail = documents?.find((item: DataProps) => item?.uid === uid)
  const splitConfig = pick(detail, ['splitType', 'chunkSize', 'chunkOverlap'])

  const fileConfig = { ...splitConfig, loaderType: detail?.type }
  return {
    success: true,
    data: {
      dataset_id,
      files: [detail],
      config: fileConfig,
      name: detail?.name,
      type: detail?.type,
    },
  }
}

export async function getNotedData() {
  const apps = await getApps()
  const data = apps?.reduce((m: DocumentProps[], item: NewApp) => {
    const cur = pick(item, ['name', 'icon', 'short_id', 'uid']) as DocumentProps
    cur.uid = item.api_model_id || ''
    cur.type = 'annotated_data'
    m.push(cur)
    return m
  }, [])
  return {
    success: true,
    data,
  }
}

export async function getDataSplitPreview(
  datasetId: string,
  newValue: Partial<NewDataset>,
  uid: string,
  preview: number
) {
  const { userId } = auth()
  if (!userId) return Promise.resolve([])
  const { api_dataset_id, editParams } = await getEditParams(
    datasetId,
    newValue
  )
  if (api_dataset_id && editParams) {
    const data = await fetch(
      `${process.env.AI_SERVICE_API_BASE_URL}/v1/datasets/${api_dataset_id}?preview=${preview}&uid=${uid}`,
      {
        headers: {
          'Content-Type': 'application/json',
        },
        method: 'PATCH',
        body: JSON.stringify(editParams),
      }
    ).then((res) => res.json())
    Promise.resolve(data)
  }
  return Promise.resolve([])
}
