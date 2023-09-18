import { getDataset } from '@/db/datasets/actions'

import SlideBar from './sidebar'

export const runtime = 'edge'

interface IProps {
  children: React.ReactNode
  params: { dataset_id: string }
}

export default async function SettingsLayout({ children, params }: IProps) {
  const { dataset_id } = params
  const datasetDetail = await getDataset(dataset_id)
  return (
    <div className="flex h-full w-full bg-white">
      <div className="hidden w-[276px] shrink-0 border-r border-slate-200 bg-slate-50 lg:block">
        <SlideBar datasetId={dataset_id} name={datasetDetail?.name} />
      </div>
      <div className="flex-1">{children}</div>
    </div>
  )
}
