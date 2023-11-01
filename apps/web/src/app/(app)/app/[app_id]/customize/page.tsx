import { GitForkIcon } from 'lucide-react'

import { cn } from '@/lib/utils'
import { NewApp } from '@/db/apps/schema'
import { Button } from '@/components/ui/button'
import CreateAppDialog from '@/components/create-app-dialog'

interface IProps {
  isAdmin?: boolean
  isOwner?: boolean
  appDetail?: NewApp
}
const Customize = async (props: IProps) => {
  const { isAdmin, isOwner, appDetail: defaultValues } = props
  const { name, description, icon } = defaultValues as NewApp
  return (
    <div className={cn(!isAdmin || !isOwner ? 'block' : 'hidden')}>
      <CreateAppDialog
        defaultValues={{ name, description, icon }}
        isCopy
        dialogTrigger={
          <Button
            className="h-11 w-full justify-start gap-2 rounded-lg p-0 px-2 hover:bg-slate-200"
            variant="ghost"
            type="button"
          >
            <GitForkIcon size="20" />
            Customize
          </Button>
        }
      />
    </div>
  )
}

export default Customize
