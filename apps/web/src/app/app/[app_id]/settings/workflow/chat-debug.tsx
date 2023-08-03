'use client'

import { useState } from 'react'
import { Play } from 'lucide-react'
import useSWRMutation from 'swr/mutation'

import { fetcher, nanoid } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import Chat from '@/components/chat/page'

import { useWorkflowContext } from './store'
import { WorkflowItem } from './type'

function getApiSessionId(url: string, { arg }: { arg: WorkflowItem[] }) {
  return fetcher(url, {
    method: 'POST',
    body: JSON.stringify(arg),
  })
}

const ChatDebug = (values: { appName: string; appIcon: string }) => {
  const [open, setOpen] = useState(false)
  const [sessionId, setSessionId] = useState('')
  const workflowData = useWorkflowContext((state) => state.workflowData)
  const changedFlow = useWorkflowContext((state) => state.changedFlow)
  const [clicked, setClicked] = useState(false)
  const { trigger } = useSWRMutation(`/api/debug`, getApiSessionId)
  const [apiSessionId, setApiSessionId] = useState('')
  const handleClick = () => {
    // workflow changed to generate new session
    if (changedFlow || !clicked) {
      trigger(workflowData).then((res) => {
        setApiSessionId(res?.api_session_id)
        setOpen(true)
        setClicked(true)
        setSessionId(nanoid())
      })
    }
  }
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button onClick={handleClick}>
          <Play size={16} />
          Enter Debug
        </Button>
      </SheetTrigger>
      <SheetContent className="bottom-6 right-6 top-auto h-4/5 w-11/12 sm:max-w-xl md:max-w-xl">
        <Chat
          {...values}
          isDebug
          apiSessionId={apiSessionId}
          appId=""
          sessionId={sessionId}
          setSessionId={setSessionId}
          sessionName=""
        />
      </SheetContent>
    </Sheet>
  )
}

export default ChatDebug
