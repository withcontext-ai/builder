import { ReactNode } from 'react'

import { TooltipProvider } from '@/components/ui/tooltip'

export const commonTestWrapper = (children: ReactNode) => {
  return <TooltipProvider>{children}</TooltipProvider>
}
