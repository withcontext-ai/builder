import { PropsWithChildren } from 'react'

import ExploreList from '@/components/explore-list'
import AppLayout from '@/components/layouts/app-layout'
import NavSidebar from '@/components/nav-sidebar'

import ResponsiveLayout from '../../components/layouts/responsive-layout'

const Layout = ({ children }: PropsWithChildren) => {
  return (
    <AppLayout>
      <ResponsiveLayout
        pageTitle="Explore"
        sidebar={
          <NavSidebar title="Explore">
            <ExploreList />
          </NavSidebar>
        }
      >
        {children}
      </ResponsiveLayout>
    </AppLayout>
  )
}

export default Layout
