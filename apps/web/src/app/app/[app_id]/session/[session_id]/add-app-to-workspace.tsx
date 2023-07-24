'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { useSWRConfig } from 'swr'
import useSWRMutation from 'swr/mutation'

import { fetcher } from '@/lib/utils'
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

function addToWorkspace(url: string, { arg }: { arg: { app_id: string } }) {
  return fetcher(url, {
    method: 'POST',
    body: JSON.stringify(arg),
  })
}

interface IProps {
  appId: string
  archived?: boolean
}

export default function AddAppToWorkspace({ appId, archived = false }: IProps) {
  // const { mutate } = useSWRConfig()
  const { trigger } = useSWRMutation(`/api/me/workspace`, addToWorkspace)
  const [open, setOpen] = React.useState(archived)
  const router = useRouter()
  React.useEffect(() => {
    // async function init() {
    //   const result = await trigger({ app_id: appId })
    // }

    // init()
    trigger({ app_id: appId })
  }, [appId, trigger, archived, router])

  // shared app is removed
  const handleOk = () => {
    router.push('/explore')
    setOpen(false)
  }
  return (
    <div>
      <AlertDialog open={open}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>App not Found</AlertDialogTitle>
            <AlertDialogDescription>
              This app has been deleted by the author.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={handleOk}>OK</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
