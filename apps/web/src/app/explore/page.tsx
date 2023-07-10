import AppCard from '@/components/app-card'
import RootLayout from '@/components/root-layout'
import RootSidebar from '@/components/root-sidebar'

const LIST = [
  {
    id: 'CQolMcS',
    name: 'Employee Handbook',
    description:
      "This is an employee handbook AI Bot. You can consult Context on company's vacation, benefits, corporate cultures, etc.",
    icon: 'https://storage.googleapis.com/context-builder/public-tmp/yvz6XUK.jpeg',
  },
  {
    id: 'wV8w8mV',
    name: 'Onboarding',
    description:
      'This AI Bot can help new employees quickly understand the schedules and goals of their first day and first month.',
    icon: 'https://storage.googleapis.com/context-builder/public-tmp/n8fgLWX.jpeg',
  },
  {
    id: 'VtTNc8h',
    name: 'TikTok User Guide',
    description:
      'This user guide AI Bot can help you quickly learn how to use TikTok.',
    icon: 'https://storage.googleapis.com/context-builder/public-tmp/EVoNO2l.jpeg',
  },
]

export default async function Page() {
  return (
    <RootLayout
      sidebar={<RootSidebar />}
      pageTitle="Explore"
      mainClassnames="lg:pl-[312px]"
    >
      <div className="flex flex-col">
        <h1 className="hidden border-b border-slate-100 px-6 py-3 font-medium lg:block">
          Explore
        </h1>
        <div className="p-6">
          <h2 className="text-sm font-medium">All Categories</h2>
          <ul className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {LIST.map(({ id, name, description, icon }) => (
              <AppCard
                key={id}
                id={id}
                name={name}
                description={description}
                icon={icon}
              />
            ))}
          </ul>
        </div>
      </div>
    </RootLayout>
  )
}
