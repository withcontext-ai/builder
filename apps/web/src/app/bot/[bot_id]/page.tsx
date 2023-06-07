import SidebarLayout from '@/components/sidebar-layout'

import BotSidebar from './sidebar'

export default function BotPage({ params }: { params: { bot_id: string } }) {
  const { bot_id } = params

  return (
    <SidebarLayout sidebar={<BotSidebar botId={bot_id} />}>
      Chat: {bot_id}
    </SidebarLayout>
  )
}
