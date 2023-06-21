'use client'

import { FormEvent, useMemo, useState } from 'react'
import { useChat } from 'ai/react'
import { findLastIndex } from 'lodash'

import { useScrollToBottom } from '@/hooks/useScrollToBottom'

import ChatCard from './chat-card'
import ChatHeader from './chat-header'
import ChatInput from './chat-input'
import ChatList from './chat-list'

interface IProps {
  sessionId: string
}

const Chat = ({ sessionId }: IProps) => {
  // waiting useChat api onResponse
  const [waiting, setWaiting] = useState<boolean>(false)
  const { scrollRef, autoScroll, setAutoScroll } = useScrollToBottom()

  const { messages, input, setInput, handleSubmit, isLoading, reload, stop } =
    useChat({
      id: sessionId,
      onResponse: (res) => {
        setWaiting(false)
      },
    })

  const submit = (event: FormEvent<HTMLFormElement>) => {
    if (input && !isLoading) {
      if (!autoScroll) {
        setAutoScroll(true)
      }
      setWaiting(true)
      handleSubmit(event)
    }
  }

  const handelReload = () => {
    if (!autoScroll) {
      setAutoScroll(true)
    }
    reload()
    setWaiting(true)
  }

  const showResend = useMemo(() => {
    const hasResponse = messages?.filter(
      (item) => item?.role === 'assistant' && item?.content
    )
    let index = -1
    if (hasResponse?.length) {
      index = findLastIndex(messages, (item) => item?.role === 'user')
    }
    return index !== -1
  }, [messages])
  return (
    <div className="flex h-full w-full flex-col">
      <ChatHeader />
      <ChatList
        messages={messages}
        waiting={waiting}
        scrollRef={scrollRef}
        setAutoScroll={setAutoScroll}
      />
      <ChatInput
        input={input}
        setInput={setInput}
        handleSubmit={submit}
        isLoading={isLoading}
        showResend={showResend}
        reload={handelReload}
        stop={stop}
      />
    </div>
  )
}

export default Chat
