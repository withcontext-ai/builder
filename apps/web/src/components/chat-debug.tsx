import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'

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
        <Button variant="outline">Open</Button>
      </SheetTrigger>
      <SheetContent className="mt-[10%] h-4/5 w-[569px]">
        <SheetHeader>
          <SheetTitle className="flex justify-between">
            Debug <Button variant="outline">Restart</Button>
          </SheetTitle>
        </SheetHeader>
        <Chat {...values} showHeader={false} />
        <SheetFooter></SheetFooter>
      </SheetContent>
    </Sheet>
  )
}

export default ChatDebug
