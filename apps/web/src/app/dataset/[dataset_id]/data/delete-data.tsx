import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Trash } from 'lucide-react'
import useSWRMutation from 'swr/mutation'

import { fetcher } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import ConfirmDialog from '@/components/confirm-dialog'

function deleteData(
  url: string,
  { arg }: { arg: { dataset_id: string; uid: string } }
) {
  return fetcher(url, {
    method: 'DELETE',
    body: JSON.stringify(arg),
  })
}

interface IProps {
  datasetId: string
  uid: string
}

const DeleteData = ({ datasetId, uid }: IProps) => {
  const [open, setOpen] = useState(false)
  const router = useRouter()
  const { trigger, isMutating } = useSWRMutation(
    `/api/datasets/document`,
    deleteData
  )

  const handelDelete = () => {
    trigger({ dataset_id: datasetId, uid }).then((res) => {
      setOpen(false)
      router.refresh()
    })
  }

  return (
    <div>
      <Button
        size="icon"
        variant="outline"
        className="text-red-600"
        onClick={() => setOpen(true)}
      >
        <Trash size={18} />
      </Button>
      <ConfirmDialog
        open={open}
        onOpenChange={setOpen}
        title="Delete Data?"
        description={` Are you sure you want to delete this data? This action cannot be undone.`}
        confirmText="Delete Data"
        loadingText="Deleting..."
        handleConfirm={handelDelete}
        isLoading={isMutating}
      />
    </div>
  )
}

export default DeleteData
