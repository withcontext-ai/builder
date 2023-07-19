import { Play } from 'lucide-react'

import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'

import Chat from './chat/page'
import { Button } from './ui/button'

const ChatDebug = () => {
  const values = {
    sessionId: '',
    sessionName: '1',
    appName: '222',
    appIcon:
      'https://backend.withcontext.ai/backend/upload/2023/04/65947928-68d6-4f64-99d9-0b98578fe4c6.jpeg',
    appId: '11',
  }
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button>
          <Play />
          Enter Debug
        </Button>
      </SheetTrigger>
      <SheetContent className="bottom-6 right-6 top-auto h-4/5 sm:w-full md:w-full lg:w-[569px]">
        <Chat {...values} isDebug />
      </SheetContent>
    </Sheet>
  )
}

export default ChatDebug
