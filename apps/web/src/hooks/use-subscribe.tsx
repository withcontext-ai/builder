import * as React from 'react'
import { Message } from 'ai'

import { initPusher } from '@/lib/pusher-client'

interface IProps {
  channelId: string
  eventName: string
}

export default function useSubscribe({ channelId, eventName }: IProps) {
  const [value, setValue] = React.useState<Message>()

  React.useEffect(() => {
    const pusher = initPusher()
    if (!pusher) return

    const channel = pusher.subscribe(channelId)

    channel.bind(eventName, setValue)

    return () => {
      if (channel) channel.unbind(eventName)
      if (pusher) pusher.unsubscribe(channelId)
    }
  }, [channelId, eventName])

  return value
}
