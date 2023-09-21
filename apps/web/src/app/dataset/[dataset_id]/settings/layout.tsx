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
    <div className="fixed hidden h-full w-full overflow-hidden bg-white lg:flex">
      <div className="w-[276px] shrink-0 border-r border-slate-200 bg-slate-50">
        <SlideBar datasetId={dataset_id} name={datasetDetail?.name} />
      </div>
      <div className="w-full">{children}</div>
    </div>
  )
}
