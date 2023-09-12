import NiceModal, { useModal } from '@ebay/nice-modal-react'

import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'

interface IProps {
  title: string
  description: string
  isLoading: boolean
  confirmText: string
  loadingText: string
}

export default NiceModal.create(
  ({ title, description, isLoading, confirmText, loadingText }: IProps) => {
    const modal = useModal()

    function onOpenChange(open: boolean) {
      if (!open) {
        modal.hide()
        setTimeout(() => {
          modal.remove()
        }, 1000)
      }
    }

    async function handleConfirm() {
      console.log('1')
      await modal.resolve()
      console.log('4')
      modal.hide()
      setTimeout(() => {
        modal.remove()
      }, 1000)
    }

    return (
      <AlertDialog open={modal.visible} onOpenChange={onOpenChange}>
        <AlertDialogContent className="max-md:max-w-[calc(100%-32px)]">
          <AlertDialogHeader className="min-w-0">
            <AlertDialogTitle className="break-words">{title}</AlertDialogTitle>
            <AlertDialogDescription className="break-words">
              {description}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <Button
              variant="destructive"
              onClick={handleConfirm}
              disabled={isLoading}
            >
              {isLoading ? loadingText : confirmText}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    )
  }
)
