import Link from 'next/link'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export interface AppItemProps {
  appId?: string
  appName?: string
  desc?: string
  creator?: string
  image?: string
}
const AppItem = ({ appName, desc, creator, image, appId }: AppItemProps) => {
  return (
    <Link className="h-[278px] cursor-pointer" href={`/app/${appId}`}>
      <Card className="h-[278px]">
        <CardHeader className="p-0">
          <div className="flex flex-col py-3">
            <div className="relative">
              <img
                src={image}
                alt="image"
                width="100px"
                height="100px"
                className="absolute top-0 z-[1] mx-3 rounded-lg"
              />
              <div className="absolute top-[50px] z-0 h-[1px] w-full bg-slate-100 " />
            </div>
          </div>
        </CardHeader>
        <CardContent className="mt-[84px] p-3">
          <div className="text-sm font-normal leading-5 text-slate-500">
            {creator}
          </div>
          <CardTitle className="mb-1 leading-7">{appName}</CardTitle>
          <div className="line-clamp-4 text-xs font-medium leading-5 text-slate-500	">
            {desc}
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}

export default AppItem
