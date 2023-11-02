'use client'

import { useModal } from '@ebay/nice-modal-react'
import { PlusIcon } from 'lucide-react'

import { Button } from '@/components/ui/button'

import CreateDialog from './create-dataset'

const AddDatasetButton = () => {
  const modal = useModal(CreateDialog)

  return (
    <Button size="sm" onClick={() => modal.show()}>
      <PlusIcon className="mr-2 h-4 w-4" />
      Add Dataset
    </Button>
  )
}

export default AddDatasetButton
