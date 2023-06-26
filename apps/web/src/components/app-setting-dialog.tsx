'use client'

import { useState } from 'react'
import {
  ChevronDown,
  ChevronUp,
  PlusIcon,
  Settings,
  Share,
  Trash2,
} from 'lucide-react'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

import { Button } from './ui/button'

interface IProps {
  appId: string
}

const AppSettingDialog = ({ appId }: IProps) => {
  const [open, setOpen] = useState<boolean>(false)
  const menus = [
    {
      icon: <Settings size={16} />,
      name: 'App Setting',
      link: `/app/${appId}/settings/workflow`,
    },
    {
      icon: <Share size={16} />,
      name: 'Share',
      link: `/app/${appId}/settings/share`,
    },
    {
      icon: <Trash2 size={16} color="#EF4444" />,
      name: 'Delete App',
      link: '',
    },
  ]
  return (
    <DropdownMenu open={open} onOpenChange={(open) => setOpen(open)}>
      <DropdownMenuTrigger asChild>
        <Button onClick={() => setOpen(true)} className="bg-white">
          {open ? <ChevronDown /> : <ChevronUp />}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuLabel>My Account</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem>Profile</DropdownMenuItem>
        <DropdownMenuItem>Billing</DropdownMenuItem>
        <DropdownMenuItem>Team</DropdownMenuItem>
        <DropdownMenuItem>Subscription</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default AppSettingDialog
