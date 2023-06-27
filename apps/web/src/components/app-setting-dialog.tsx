'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ChevronDown, ChevronUp, Settings, Share, Trash2 } from 'lucide-react'

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
} from '@/components/ui/altert-dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

import { Button } from './ui/button'

interface IProps {
  appId: string
}

const AppSettingDialog = ({ appId }: IProps) => {
  const [open, setOpen] = useState<boolean>(false)
  const [deleteDialog, setDeleteDialog] = useState<boolean>(false)
  const menus = [
    {
      icon: <Settings size={16} />,
      name: 'App Setting',
      link: `/app/${appId}/settings`,
    },
    {
      icon: <Share size={16} />,
      name: 'Share',
      link: ` /app/${appId}/share`,
    },
    {
      icon: <Trash2 size={16} color="#EF4444" />,
      name: 'Delete App',
      link: '',
    },
  ]
  return (
    <>
      <DropdownMenu open={open}>
        <DropdownMenuTrigger asChild>
          <Button
            onClick={() => setOpen(true)}
            className="h-8 w-8 bg-white p-0 text-black"
            variant="outline"
          >
            {!open ? <ChevronDown /> : <ChevronUp />}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="h-[112px] w-[220px]" align="end">
          {menus?.map((item, index) => {
            return (
              <DropdownMenuItem
                key={item?.name}
                className="cursor-pointer"
                onClick={() => {
                  setOpen(false)
                  if (index === 2) {
                    setDeleteDialog(true)
                  }
                }}
              >
                <Link
                  href={item?.link}
                  className={cn(
                    'flex w-full	gap-2	text-sm font-medium',
                    index === 2
                      ? 'text-red-500 hover:text-red-500'
                      : 'text-slate-700'
                  )}
                >
                  {item?.icon} {item?.name}
                </Link>
              </DropdownMenuItem>
            )
          })}
        </DropdownMenuContent>
      </DropdownMenu>
      <AlertDialog
        open={deleteDialog}
        onOpenChange={(open: boolean) => setDeleteDialog(open)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Delete &quot;AI Interview&quot; App?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete “AI Interview” App? This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction className="bg-red-500 text-white">
              Delete App
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

export default AppSettingDialog
