'use client'

import { Plus } from 'lucide-react'
import { UseFormReturn } from 'react-hook-form'

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

import AnnotatedForm from './noted-form'

interface IProps {
  form: UseFormReturn<any>
}

const AddAnnotatedData = ({ form }: IProps) => {
  return (
    <div>
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button type="button">
            <Plus size={16} />
            Add Annotated Data
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Add Annotated Data</AlertDialogTitle>
            <AlertDialogDescription>
              <AnnotatedForm form={form} />
              {/* <CheckboxReactHookFormMultiple /> */}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction>Add</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

export default AddAnnotatedData
