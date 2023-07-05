'use client'

import { useRouter } from 'next/navigation'
import { ArrowLeftIcon } from 'lucide-react'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

import { SectionType } from './page'

interface IProps {
  handleGoBack: () => void
  selected: string
  handleSelected: (s: string) => void
}
const sections: SectionType[] = [
  {
    title: 'Dataset Name',
    name: '#dataset-name',
  },
  {
    title: 'Document Loaders',
    name: '#loaders',
  },
  {
    title: 'Text Splitters',
    name: '#splitters',
  },
  {
    title: 'Text Embedding Models',
    name: '#models',
  },
  {
    title: ' Vector Stores',
    name: '#stores',
  },
  {
    title: 'Retrievers',
    name: '#retrievers',
  },
]

const SlideBar = ({ handleGoBack, handleSelected, selected }: IProps) => {
  return (
    <div>
      <div className="flex items-center space-x-2 px-4 py-3">
        <Button
          variant="outline"
          className="h-8 w-8 p-0"
          onClick={handleGoBack}
        >
          <ArrowLeftIcon className="h-4 w-4" />
        </Button>
        <div className="text-lg font-semibold">Back</div>
      </div>
      <div className="mt-4 space-y-2 px-3 py-2">
        <div className="text-sm font-medium uppercase text-slate-500">
          DATASETS
        </div>
        <div className="flex flex-col gap-1	text-sm	font-medium">
          {sections?.map((item: SectionType) => (
            <a
              key={item?.title}
              href={item?.name}
              onClick={() => handleSelected(item?.name)}
              className={cn(
                'p-3 hover:rounded-md hover:bg-slate-200',
                selected === item?.name ? 'rounded-md bg-slate-200' : ''
              )}
            >
              {item?.title}
            </a>
          ))}
        </div>
      </div>
    </div>
  )
}
export default SlideBar
