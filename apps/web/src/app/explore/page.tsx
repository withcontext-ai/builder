import AppCard from '@/components/app-card'
import HomeSidebar from '@/components/home-sidebar'
import SidebarLayout from '@/components/sidebar-layout'

const LIST = [
  {
    id: 'CbfWtV8',
    title: 'App 1, App 1, App 1, App 1, App 1',
    description:
      'App 1 Description, App 1 Description, App 1 Description, App 1 Description, App 1 Description, App 1 Description, App 1 Description, App 1 Description, App 1 Description, App 1 Description, App 1 Description, App 1 Description,',
    icon: '',
  },
  {
    id: 'Utxx7ga',
    title: 'App 2',
    description: 'App 2 Description',
    icon: 'https://via.placeholder.com/100',
  },
  {
    id: 'GI6hAFE',
    title: 'App 3',
    description: 'App 3 Description',
    icon: 'https://via.placeholder.com/100',
  },
  {
    id: 'WMZeCI3',
    title: 'App 4',
    description: 'App 4 Description',
    icon: 'https://via.placeholder.com/100',
  },
  {
    id: 'gRBqVWJ',
    title: 'App 5',
    description: 'App 5 Description',
    icon: 'https://via.placeholder.com/100',
  },
  {
    id: 'Zq2go3j',
    title: 'App 6',
    description: 'App 6 Description',
    icon: 'https://via.placeholder.com/100',
  },
]

export default async function Page() {
  return (
    <SidebarLayout sidebar={<HomeSidebar />}>
      <div className="flex flex-col">
        <h1 className="px-6 py-3 font-medium">Explore</h1>
        <div className="m-full h-px bg-slate-100" />
        <div className="p-6">
          <h2 className="text-sm font-medium">All Categories</h2>
          <ul className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {LIST.map(({ id, title, description, icon }) => (
              <AppCard
                key={id}
                id={id}
                title={title}
                description={description}
                icon={icon}
              />
            ))}
          </ul>
        </div>
      </div>
    </SidebarLayout>
  )
}
