import * as React from 'react'
import NiceModal, { useModal } from '@ebay/nice-modal-react'
import { SlackIcon, TrashIcon } from 'lucide-react'
import useSWR from 'swr'

import { fetcher } from '@/lib/utils'
import useNiceModal from '@/hooks/use-nice-modal'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'

interface IProps {}

const SlackDialog = NiceModal.create(({}: IProps) => {
  const { modal, closeModal, onOpenChange } = useNiceModal()

  const { data: teamList } = useSWR<string[]>('/api/me/slack/teams', fetcher)

  return (
    <Dialog open={modal.visible} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Use Context at Slack</DialogTitle>
          <DialogDescription>
            Allow team members to chat with your app while they&apos;re on
            Slack.
          </DialogDescription>
        </DialogHeader>
        <ul role="list" className="-mx-2 space-y-1">
          {teamList?.map(
            ({ app_id, team_id, team_name, team_url, team_icon }: any) => (
              <li key={`${app_id}-${team_id}`}>
                <div className="group relative flex items-center gap-x-2 rounded-md p-2 text-sm font-medium text-slate-900">
                  <span className="truncate">{team_name}</span>
                  <Button
                    variant="outline"
                    size="sm"
                    className="absolute right-2 hidden group-hover:flex"
                  >
                    Add to Slack workspace
                  </Button>
                </div>
              </li>
            )
          )}
        </ul>
      </DialogContent>
    </Dialog>
  )
})

export default function Slack() {
  const modal = useModal(SlackDialog)

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button variant="outline" size="icon" onClick={() => modal.show()}>
          <SlackIcon />
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        <p className="max-w-xs">Slack</p>
      </TooltipContent>
    </Tooltip>
  )
}
