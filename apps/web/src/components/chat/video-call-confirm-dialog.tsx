import { PhoneCallIcon, PhoneIcon } from 'lucide-react'

import { cn, getAvatarBgColor, getFirstLetter } from '@/lib/utils'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

interface IProps {
  appId: string
  appName: string
  appIcon?: string
}

export default function VideoCallConfirmDialog({
  appId,
  appName,
  appIcon,
}: IProps) {
  const color = getAvatarBgColor(appId || '')

  return (
    <Dialog open>
      <DialogContent className="gap-6 sm:max-w-[268px]">
        <DialogHeader className="space-y-4">
          <DialogTitle>
            <div className="flex items-center space-x-4">
              <Avatar
                className={cn(
                  'relative h-12 w-12',
                  appIcon ? 'bg-white' : `bg-${color}-600`
                )}
              >
                <AvatarImage src={appIcon} alt={appName} />
                <AvatarFallback className="bg-transparent text-white">
                  {getFirstLetter(appName)}
                </AvatarFallback>
              </Avatar>
              <div className="font-medium">{appName}</div>
            </div>
          </DialogTitle>
          <DialogDescription>
            I want to communicate with you via video call, please accept.
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-between">
          <Button className="bg-green-600 hover:bg-green-600/90 focus-visible:ring-green-600">
            <PhoneCallIcon className="mr-2 h-4 w-4" />
            Accept
          </Button>
          <Button className="bg-red-600 hover:bg-red-600/90 focus-visible:ring-red-600">
            <PhoneIcon className="mr-2 h-4 w-4" />
            Decline
          </Button>
        </div>

        <div className="absolute right-4 top-4 z-10 h-4 w-4 bg-white" />
      </DialogContent>
    </Dialog>
  )
}

// <VideoCallConfirmDialog
//   appId={appId}
//   appName={appName}
//   appIcon={appIcon}
// />
