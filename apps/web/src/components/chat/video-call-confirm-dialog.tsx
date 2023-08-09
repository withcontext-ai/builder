import * as React from 'react'
import { PhoneCallIcon, PhoneIcon } from 'lucide-react'
import { useCountdown } from 'usehooks-ts'

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

import { useChatContext } from './chat-context'

interface IProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAccept: () => void
  onDecline: () => void
}

export default function VideoCallConfirmDialog({
  open,
  onOpenChange,
  onAccept,
  onDecline,
}: IProps) {
  const { app } = useChatContext()
  const { short_id: appId, icon: appIcon, name: appName } = app ?? {}
  const color = getAvatarBgColor(appId || '')

  const [count, { startCountdown }] = useCountdown({
    countStart: 5,
  })

  React.useEffect(() => {
    if (open) startCountdown()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  React.useEffect(() => {
    if (count === 0) onDecline()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [count])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
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
                {appName && (
                  <AvatarFallback className="bg-transparent text-white">
                    {getFirstLetter(appName)}
                  </AvatarFallback>
                )}
              </Avatar>
              <div className="font-medium">{appName}</div>
            </div>
          </DialogTitle>
          <DialogDescription>
            I want to communicate with you via video call, please accept.
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-between">
          <Button
            className="bg-green-600 hover:bg-green-600/90 focus-visible:ring-green-600"
            onClick={onAccept}
          >
            <PhoneCallIcon className="mr-2 h-4 w-4" />
            Accept
          </Button>
          <Button
            className="bg-red-600 hover:bg-red-600/90 focus-visible:ring-red-600"
            onClick={onDecline}
          >
            <PhoneIcon className="mr-2 h-4 w-4" />
            Decline
          </Button>
        </div>

        <div className="absolute right-4 top-4 z-10 h-4 w-4 bg-white" />
      </DialogContent>
    </Dialog>
  )
}
