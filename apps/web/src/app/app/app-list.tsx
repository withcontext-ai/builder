import AppItem, { AppItemProps } from './app-item'

const data = [
  {
    appId: 's1',
    appName: 'app1',
    desc: 'It includes activities that allow new employees to complete an initial new-hire orientation process, as well as learn about the organization and its structure, culture, vision, mission and values.',
    creator: 'tom',
    isDelete: false,
    image:
      '	https://backend.withcontext.ai/backend/upload/2023/04/65947928-68d6-4f64-99d9-0b98578fe4c6.jpeg',
  },
  {
    appId: 's2',
    appName: 'app2',
    desc: 'It includes activities that allow new employees to complete an initial new-hire orientation process, as well as learn about the organization and its structure, culture, vision, mission and values.',
    creator: 'jeanne',
    isDelete: true,
    image:
      '	https://backend.withcontext.ai/backend/upload/2023/04/65947928-68d6-4f64-99d9-0b98578fe4c6.jpeg',
  },
]
interface AppListProps {
  apps?: AppItemProps[]
}
const AppLists = ({ apps = data }: AppListProps) => {
  apps = [...data, ...data, ...data, ...data]
  return (
    <div className="xs:grid-cols-1 grid max-w-[1200px] gap-2 p-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
      {apps?.map((app) => {
        return <AppItem {...app} key={app?.appId} />
      })}
    </div>
  )
}

export default AppLists
