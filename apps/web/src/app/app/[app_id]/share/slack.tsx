import * as React from 'react'
import { useParams } from 'next/navigation'
import NiceModal, { useModal } from '@ebay/nice-modal-react'
import { SlackIcon } from 'lucide-react'
import useSWR from 'swr'

import { fetcher } from '@/lib/utils'
import { SlackTeamApp } from '@/db/slack_team_apps/schema'
import { SlackTeam } from '@/db/slack_teams/schema'
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
  checked,
  onCheckedChange,
}: {
  icon: string
  name: string
  url: string
  checked: boolean
  onCheckedChange: (checked: boolean) => void
}) {
  return (
    <div className="flex items-center space-x-4 rounded-md border p-4">
      <img alt="slack team icon" src={icon} className="h-8 w-8 rounded" />
      <div className="flex-1 space-y-1">
        <p className="text-sm font-medium leading-none">{name}</p>
        <p className="text-sm text-muted-foreground">{url}</p>
      </div>
      <Switch checked={checked} onCheckedChange={onCheckedChange} />
    </div>
  )
}

interface ISlackDialogProps {
  context_app_id: string
}

const SlackDialog = NiceModal.create(
  ({ context_app_id }: ISlackDialogProps) => {
    const { modal, closeModal, onOpenChange } = useNiceModal()

    const { data: teamList = [] } = useSWR<Partial<SlackTeam>[]>(
      '/api/me/slack/teams',
      fetcher,
      { revalidateOnFocus: true, keepPreviousData: true }
    )

    const { data: linkedTeamList = [] } = useSWR<Partial<SlackTeamApp>[]>(
      `/api/slack/linked-teams/${context_app_id}`,
      fetcher,
      { revalidateOnFocus: true, keepPreviousData: true }
    )

    const checkIsLinked = React.useCallback(
      (app_id: string, team_id: string) =>
        linkedTeamList.some(
          (linkedTeam) =>
            linkedTeam.app_id === app_id && linkedTeam.team_id === team_id
        ),
      [linkedTeamList]
    )

    const checkedChangeHandler = React.useCallback(
      (app_id: string, team_id: string, context_app_id: string) =>
        (checked: boolean) => {
          if (checked) {
            console.log('link app:', app_id, team_id, context_app_id)
          } else {
            console.log('unlink app:', app_id, team_id, context_app_id)
          }
        },
      []
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

          <div className="flex">
            <a href={authorizeUrl} target="_blank">
              <img
                alt="Add to Slack"
                height="40"
                width="139"
                src="https://platform.slack-edge.com/img/add_to_slack.png"
                srcSet="https://platform.slack-edge.com/img/add_to_slack.png 1x, https://platform.slack-edge.com/img/add_to_slack@2x.png 2x"
              />
            </a>
          </div>

          <div className="space-y-2">
            {teamList.map(
              (
                { app_id, team_id, team_name, team_url, team_icon }: any,
                idx
              ) => (
                <TeamCard
                  key={`${app_id}-${team_id}-${idx}`}
                  icon={team_icon}
                  name={team_name}
                  url={team_url}
                  checked={checkIsLinked(app_id, team_id)}
                  onCheckedChange={checkedChangeHandler(
                    app_id,
                    team_id,
                    context_app_id
                  )}
                />
              )
            )}
          </div>
        </DialogContent>
      </Dialog>
    )
  }
)

interface IProps {
  appId: string
}

export default function Slack({ appId }: IProps) {
  const modal = useModal(SlackDialog)

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          onClick={() => modal.show({ context_app_id: appId })}
        >
          <SlackIcon />
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        <p className="max-w-xs">Slack</p>
      </TooltipContent>
    </Tooltip>
  )
}
