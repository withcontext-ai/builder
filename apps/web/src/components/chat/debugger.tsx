import { useDeferredValue, useState } from 'react'
import ReactJson from 'react-json-view'

import { Button } from '../ui/button'
import { useChat } from './useChat'

const ChatDebugger = () => {
  const chat = useChat()
  const deferred = useDeferredValue(chat)
  const [collapsed, setCollapsed] = useState(true)
  return (
    <div className="fixed right-0 top-0 z-50 h-1/2 w-1/2 overflow-scroll ">
      <Button onClick={() => setCollapsed(!collapsed)}>Collapse</Button>
      {collapsed && (
        <div className="bg-white p-4">
          <div className="">Curr</div>
          <ReactJson src={chat} />
        </div>
      )}
      {/* <div className="">PrevRR</div>
      <ReactJson src={defered} /> */}
    </div>
  )
}

export default ChatDebugger
