import { ReactNode } from 'react-markdown/lib/ast-to-react'

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

interface IProps {
  children?: ReactNode
  content?: string
}

export function SectionTooltip({ children, content }: IProps) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>{children}</TooltipTrigger>
        <TooltipContent>
          <p className="font-normal">{content}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
