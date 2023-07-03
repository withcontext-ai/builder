'use client'

import { ArrowLeftIcon } from 'lucide-react'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

interface IProps {
  selected?: string
}

const SlideBar = ({ selected = 'loaders' }: IProps) => {
  const handleGoBack = () => {
    // router.back()
    console.log('---goBack')
  }
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
          <a
            href="#loaders"
            className={cn(
              'p-3 hover:rounded-md hover:bg-slate-200',
              selected === 'loaders' ? 'rounded-md bg-slate-200' : ''
            )}
          >
            Document Loaders
          </a>
          <a
            href="#splitters"
            className={cn(
              'p-3 hover:rounded-md hover:bg-slate-200',
              selected === 'splitters' ? 'rounded-md bg-slate-200' : ''
            )}
          >
            Text Splitters
          </a>
          <a
            href="#models"
            className={cn(
              'p-3 hover:rounded-md hover:bg-slate-200',
              selected === 'models' ? 'rounded-md bg-slate-200' : ''
            )}
          >
            Text Embedding Models
          </a>
          <a
            href="#stores"
            className={cn(
              'p-3 hover:rounded-md hover:bg-slate-200',
              selected === 'stores' ? 'rounded-md bg-slate-200' : ''
            )}
          >
            Vector Stores
          </a>
          <a
            href="#retrievers"
            className={cn(
              'p-3 hover:rounded-md hover:bg-slate-200',
              selected === 'retrievers' ? 'rounded-md bg-slate-200' : ''
            )}
          >
            Retrievers
          </a>
        </div>
      </div>
    </div>
  )
}
export default SlideBar
