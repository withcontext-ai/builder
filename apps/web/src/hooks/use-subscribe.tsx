import * as React from 'react'

import { initPusher } from '@/lib/pusher-client'

interface IProps {
  channelId: string
  eventName: string
  onAdd: (val: any) => void
}

export default function useSubscribe({ channelId, eventName, onAdd }: IProps) {
  React.useEffect(() => {
    const pusher = initPusher()
    if (!pusher) return

    const channel = pusher.subscribe(channelId)

    channel.bind(eventName, onAdd)

    return () => {
      if (channel) channel.unbind(eventName)
      if (pusher) pusher.unsubscribe(channelId)
    }
  }, [channelId, eventName, onAdd])
}
