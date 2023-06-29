import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export interface AppItemProps {
  appId?: string
  appName?: string
  desc?: string
  creator?: string
  image?: string
}
const AppItem = ({ appName, desc, creator, image }: AppItemProps) => {
  return (
    <div className="h-[278px] cursor-pointer">
      <Card className="h-[278px] p-3">
        <CardHeader className="p-0">
          <div className="flex flex-col">
            <div className="relative">
              <img
                src={image}
                alt="image"
                width="100px"
                height="100px"
                className="absolute top-0 z-[1] rounded-lg"
              />
              <div className="absolute top-[50px] z-0 h-[1px] w-full bg-slate-100 " />
            </div>
          </div>
        </CardHeader>
        <CardContent className="mt-[104px] p-0">
          <div className="text-sm font-normal leading-5 text-slate-500">
            {creator}
          </div>
          <CardTitle className="mb-1 leading-7">{appName}</CardTitle>
          <div className="line-clamp-4 text-xs font-medium leading-5 text-slate-500	">
            {desc}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default AppItem
