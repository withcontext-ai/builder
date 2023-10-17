import React from 'react'
import NiceModal from '@ebay/nice-modal-react'

import useNiceModal from '@/hooks/use-nice-modal'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import List from '@/components/list'

const tabs = [
  { id: 'account', title: 'Account' },
  { id: 'chat-apps', title: 'Chat apps' },
]

interface IProps {
  defaultTab?: string
}

export default NiceModal.create(({ defaultTab = 'account' }: IProps) => {
  const { modal, onOpenChange } = useNiceModal()
  const [tab, setTab] = React.useState(defaultTab)

  const onClickBuilder = (id: string) => () => {
    setTab(id)
  }

  return (
    <Dialog open={modal.visible} onOpenChange={onOpenChange}>
      <DialogContent className="flex min-h-[640px] max-w-[980px] flex-col p-0">
        <div className="flex h-[200px] flex-1">
          <div className="w-[200px] border-r border-slate-200">
            <h1 className="px-6 py-4 text-lg font-semibold">Settings</h1>
            <div className="px-2">
              <List
                value={tabs}
                selectedId={tab}
                onClickBuilder={onClickBuilder}
              />
            </div>
          </div>
          <div className="flex-1">{tab}</div>
        </div>
      </DialogContent>
    </Dialog>
  )
})
