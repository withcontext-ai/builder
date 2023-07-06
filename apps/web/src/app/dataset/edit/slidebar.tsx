'use client'

import { useState } from 'react'
import { ArrowLeftIcon, Trash2 } from 'lucide-react'

import { cn } from '@/lib/utils'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'

import { SectionType } from './page'

interface IProps {
  handleGoBack: () => void
  selected: string
  showMore?: boolean
  handleSelected: (s: string) => void
}
const sections: SectionType[] = [
  {
    title: 'Dataset Name',
    name: 'dataset-name',
  },
  {
    title: 'Document Loaders',
    name: 'loaders',
  },
]
const moreSessions = [
  {
    title: 'Text Splitters',
    name: 'splitters',
  },
  {
    title: 'Text Embedding Models',
    name: 'models',
  },
  {
    title: ' Vector Stores',
    name: 'stores',
  },
]

const SlideBar = ({
  handleGoBack,
  handleSelected,
  selected,
  showMore,
}: IProps) => {
  const data = showMore ? [...sections, ...moreSessions] : sections
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
          {data?.map((item: SectionType) => (
            <a
              key={item?.title}
              href={`#${item?.name}`}
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
      <div className="m-full h-px bg-slate-100" />
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <div className="w-full px-3 py-4">
            <Button variant="ghost">
              <Trash2 size={18} />
              Delete this Dataset
            </Button>
          </div>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Dataset?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete “Customer Service Documentation”
              Dataset? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction className="bg-red-500 text-white hover:bg-red-500">
              Delete Dataset
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
export default SlideBar
