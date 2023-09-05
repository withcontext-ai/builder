'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Trash2 } from 'lucide-react'
import useSWRMutation from 'swr/mutation'

import { fetcher } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import ConfirmDialog from '@/components/confirm-dialog'

import BaseSideBar from '../../app/[app_id]/(manage)/sidebar'
import { SectionType } from './data/setting-page'

interface IProps {
  name: string
  datasetId?: string
  showMore?: boolean
}

function deleteDataset(url: string) {
  return fetcher(url, { method: 'DELETE' })
}

const SlideBar = ({ datasetId, name }: IProps) => {
  const searchParams = useSearchParams()
  const [open, setOpen] = useState(false)
  const { trigger, isMutating } = useSWRMutation(
    `/api/datasets/${datasetId}`,
    deleteDataset
  )
  const router = useRouter()

  const handelDelete = async () => {
    try {
      await trigger()
      router.push('/datasets')
      router.refresh()
    } catch (error) {}
  }
  return (
    <BaseSideBar>
      <div className="pl-3 text-sm font-medium uppercase text-slate-500">
        Datasets
      </div>

      <BaseSideBar.Link
        href={{
          pathname: `/dataset/${datasetId}/basics`,
          search: searchParams.toString(),
        }}
        name="Basics"
        desc=""
      />
      <BaseSideBar.Link
        href={{
          pathname: `/dataset/${datasetId}/data`,
          search: searchParams.toString(),
        }}
        name="Data"
        desc=""
      />

      <div className="mb-2 shrink-0 px-3">
        <div className="h-px bg-slate-200" />
      </div>

      <div className="py-3">
        <Button
          variant="ghost"
          size="lg"
          className="flex h-9 w-full items-center justify-between px-2 hover:bg-slate-200"
          onClick={() => setOpen(true)}
        >
          <span>Delete this Dataset</span>
          <Trash2 size={18} />
        </Button>
      </div>

      <ConfirmDialog
        open={open}
        onOpenChange={setOpen}
        title={`Delete “${name}” App?`}
        description={` Are you sure you want to delete "${name}” Dataset? This action
        cannot be undone.`}
        confirmText="Delete Dataset"
        loadingText="Deleting..."
        handleConfirm={handelDelete}
        isLoading={isMutating}
      />
    </BaseSideBar>
  )
}
export default SlideBar
