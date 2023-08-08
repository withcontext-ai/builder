import * as React from 'react'
import { Message } from 'ai'

interface IProps {
  setMessages: (messages: Message[]) => void
  oldMessages: Message[]
  newMessage?: Message
}

export default function useAddMessage({
  setMessages,
  oldMessages,
  newMessage,
}: IProps) {
  const addMessage = React.useCallback(
    (message: Message) => {
      setMessages([...oldMessages, message])
    },
    [setMessages, oldMessages]
  )
  const addMessageRef = React.useRef(addMessage)
  React.useEffect(() => {
    addMessageRef.current = addMessage
  }, [addMessage])

  React.useEffect(() => {
    if (newMessage) {
      addMessageRef.current?.(newMessage)
    }
  }, [newMessage])
}
