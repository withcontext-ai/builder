import axios from 'axios'

import { getDataset } from '../actions'

export async function getApiDatasetId(dataset_id: string) {
  const dataset = await getDataset(dataset_id)
  const api_dataset_id = dataset?.api_dataset_id
  if (!api_dataset_id) return Promise.resolve([])
  return api_dataset_id
}

export async function getSegments(
  dataset_id: string,
  uid: string,
  search?: string,
  offset?: number,
  limit?: number
) {
  const api_dataset_id = await getApiDatasetId(dataset_id)
  const { data: res } = await axios({
    method: 'get',
    url: `${process.env.AI_SERVICE_API_BASE_URL}/v1/datasets/${api_dataset_id}/document/${uid}`,
    params: {
      offset: offset || 0,
      limit: limit || 100,
      query: search,
    },
  })
  if (res.status !== 200) {
    return
  }
  let data = res?.data
  console.log(data, '----segments')
  return data
}

export async function addSegment(
  dataset_id: string,
  uid: string,
  content: string
) {
  const api_dataset_id = await getApiDatasetId(dataset_id)
  const { data } = await axios.post(
    `${process.env.AI_SERVICE_API_BASE_URL}/v1/datasets/${api_dataset_id}/document/${uid}/segment`,
    content
  )
  if (data.status !== 200) {
    return
  }
  return { dataset_id, uid }
}

export async function editSegment(
  dataset_id: string,
  uid: string,
  segment_id: string,
  content: string
) {
  const api_dataset_id = await getApiDatasetId(dataset_id)
  const { data } = await axios.patch(
    `${process.env.AI_SERVICE_API_BASE_URL}/v1/datasets/${api_dataset_id}/document/${uid}/segment/${segment_id}`,
    content
  )
  if (data.status !== 200) {
    return
  }
  return { dataset_id, uid, segment_id }
}
