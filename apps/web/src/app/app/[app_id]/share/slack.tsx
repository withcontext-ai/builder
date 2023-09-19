import * as React from 'react'
import NiceModal, { useModal } from '@ebay/nice-modal-react'
import { SlackIcon } from 'lucide-react'
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
import { Switch } from '@/components/ui/switch'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'

interface IProps {}

const redirect_uri = `${process.env.NEXT_PUBLIC_BASE_URL}/api/webhook/slack/redirect_uri`

export const authorizeUrl = `https://slack.com/oauth/v2/authorize?client_id=${
  process.env.NEXT_PUBLIC_SLACK_CLIENT_ID
}&scope=app_mentions:read,chat:write,im:history,users:read,users:read.email,team:read&user_scope=&redirect_uri=${encodeURIComponent(
  redirect_uri
)}`

function TeamCard({
  icon,
  name,
  url,
}: {
  icon: string
  name: string
  url: string
}) {
  return (
    <div className="flex items-center space-x-4 rounded-md border p-4">
      <img alt="slack team icon" src={icon} className="h-8 w-8 rounded" />
      <div className="flex-1 space-y-1">
        <p className="text-sm font-medium leading-none">{name}</p>
        <p className="text-sm text-muted-foreground">{url}</p>
      </div>
      <Switch />
    </div>
  )
}

const SlackDialog = NiceModal.create(({}: IProps) => {
  const { modal, closeModal, onOpenChange } = useNiceModal()

  const { data: teamList = [] } = useSWR<string[]>(
    '/api/me/slack/teams',
    fetcher,
    { revalidateOnFocus: true, keepPreviousData: true }
  )

  return (
    <Dialog open={modal.visible} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Slack</DialogTitle>
          <DialogDescription>
            Allow team members to chat with your app
          </DialogDescription>
        </DialogHeader>

        <a href={authorizeUrl} target="_blank">
          <img
            alt="Add to Slack"
            height="40"
            width="139"
            src="https://platform.slack-edge.com/img/add_to_slack.png"
            srcSet="https://platform.slack-edge.com/img/add_to_slack.png 1x, https://platform.slack-edge.com/img/add_to_slack@2x.png 2x"
          />
        </a>

        <div className="space-y-2">
          {teamList.map(
            ({ app_id, team_id, team_name, team_url, team_icon }: any, idx) => (
              <TeamCard
                key={`${app_id}-${team_id}-${idx}`}
                icon={team_icon}
                name={team_name}
                url={team_url}
              />
            )
          )}
        </div>
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
