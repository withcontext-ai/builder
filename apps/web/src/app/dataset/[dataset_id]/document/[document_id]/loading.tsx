import { Skeleton } from '@/components/ui/skeleton'

export default function Loading() {
  return (
    <div className="mx-[140px] my-18 h-full w-[600px] space-y-10">
      <Skeleton className="h-8 w-[200px]" />
      <Skeleton className="h-10 w-full" />
      <div className="space-y-4">
        <Skeleton className="h-[96px] w-full" />
        <Skeleton className="h-[66px] w-[332px]" />
        <Skeleton className="h-[200px] w-full" />
      </div>
      <Skeleton className="h-10 w-full" />
    </div>
  )
}
