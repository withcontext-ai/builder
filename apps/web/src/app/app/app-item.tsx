import { useMemo } from 'react'
import Link from 'next/link'

import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export interface AppItemProps {
  appId?: string
  appName?: string
  desc?: string
  creator?: string
  image?: string
  isDelete?: boolean
}
const AppItem = ({
  appName,
  desc,
  creator,
  image,
  appId,
  isDelete,
}: AppItemProps) => {
  const itemCard = useMemo(
    () => (
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
        <CardContent className="mt-[84px] p-3 text-left	">
          <div className="text-sm font-normal leading-5 text-slate-500">
            {creator}
          </div>
          <CardTitle className="mb-1 leading-7">{appName}</CardTitle>
          <div className="line-clamp-4 text-xs font-medium leading-5 text-slate-500	">
            {desc}
          </div>
        </CardContent>
      </Card>
    ),
    [appName, creator, desc, image]
  )
  return (
    <>
      {isDelete ? (
        <AlertDialog>
          <AlertDialogTrigger className="flex justify-start">
            {itemCard}
          </AlertDialogTrigger>

          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>App not Found</AlertDialogTitle>
              <AlertDialogDescription>
                This app has been deleted by the author.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="bg-primary text-white">
                OK
              </AlertDialogCancel>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      ) : (
        <Link className="h-[278px] cursor-pointer" href={`/app/${appId}`}>
          {itemCard}
        </Link>
      )}
    </>
  )
}

export default AppItem
