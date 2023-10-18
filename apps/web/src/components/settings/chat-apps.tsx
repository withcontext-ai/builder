import { Share2Icon } from 'lucide-react'

import { Button } from '@/components/ui/button'
import LogosSlackIcon from '@/components/icons/LogosSlackIcon'

import SlackTeamList from './slack-team-list'

export default function ChatApps() {
  return (
    <div className="space-y-8 px-6 py-4">
      <h2 className="text-lg font-semibold">Chat apps</h2>
      <div className="space-y-4">
        <h3 className="font-normal">Connect to chat apps</h3>
        <div className="space-y-2">
          <div className="rounded-lg border border-slate-200 bg-gray-50 p-3">
            <div className="flex items-center justify-between">
              <div className="ml-1 flex items-center">
                <LogosSlackIcon className="mr-4 h-6 w-6 shrink-0" />
                <div className="font-medium">Slack</div>
              </div>
              <Button>
                <Share2Icon className="mr-2 h-4 w-4" />
                Connect
              </Button>
            </div>
            <SlackTeamList />
          </div>
        </div>
      </div>
    </div>
  )
}
