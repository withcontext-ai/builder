import { PropsWithChildren } from 'react'

import AppLayout from '@/components/layouts/app-layout'
import MineList from '@/components/mine-list'
import NavSidebar from '@/components/nav-sidebar'

import ResponsiveLayout from '../../components/layouts/responsive-layout'

const Layout = ({ children }: PropsWithChildren) => {
  return (
    <AppLayout>
      <ResponsiveLayout
        pageTitle="My Apps"
        sidebar={
          <NavSidebar title="My Space">
            <MineList />
          </NavSidebar>
        }
      >
        {children}
      </ResponsiveLayout>
    </AppLayout>
  )
}

export default Layout
