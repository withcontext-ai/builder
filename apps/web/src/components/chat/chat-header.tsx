import { Zap } from 'lucide-react'

import { IconBox } from '../upload/component'

const ChatHeader = () => {
  return (
    <div className=" w-full border-b border-[#F1F5F9] ">
      <div className="flex w-full items-center justify-between px-8 pb-3">
        <div className="flex">chat 1</div>
        <div className="flex">
          <IconBox>
            <Zap />
          </IconBox>
        </div>
      </div>
    </div>
  )
}

export default ChatHeader
