'use client'

import { useRouter } from 'next/navigation'
import { useSWRConfig } from 'swr'
import useSWRMutation from 'swr/mutation'

import { fetcher } from '@/lib/utils'

function removeApp(url: string) {
  return fetcher(url, { method: 'DELETE' })
}

export default function Title({ appId }: { appId: string }) {
  const router = useRouter()
  const { mutate } = useSWRConfig()
  const { trigger, isMutating } = useSWRMutation(
    `/api/apps/${appId}`,
    removeApp
  )

  return (
    <h1
      className="p-4 text-2xl font-semibold"
      onClick={async () => {
        const json = await trigger()
        console.log('json:', json)
        mutate('/api/me/apps')
        router.push('/explore')
      }}
    >
      App: {appId}
    </h1>
  )
}
