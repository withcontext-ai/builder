'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'

import useCopyToClipboard from '@/hooks/useCopyToClipboard'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import Text from '@/components/ui/text'

import { FacingIcon, InsIcon, NotionIcon, VersionIcon, WebIcon } from './icons'

const ShareApp = () => {
  const { app_id } = useParams()
  const [link, setLink] = useState<string>(`app/${app_id}/session`)
  const { copy } = useCopyToClipboard()
  const handleClick = () => {
    copy(link)
    console.log('------copied')
  }
  return (
    <div className="flex flex-col">
      <div className="flex gap-10 px-6 py-3">
        <Text variant="body1">Share App</Text>
        <Text className="text-slate-500">
          Your conversation will not be shared with others.
        </Text>
      </div>
      <div className="m-full h-px bg-slate-100" />
      <div className="pl-[155px] pt-[100px]">
        <div className="mb-6 gap-2">
          <Text>embed this App in</Text>
          <div className="flex w-full gap-4 ">
            <Button variant="outline" className="h-12 w-12 rounded-full p-0">
              <WebIcon />
            </Button>
            <Button variant="outline" className="h-12 w-12 rounded-full p-0">
              <VersionIcon />
            </Button>
            <Button variant="outline" className="h-12 w-12 rounded-full p-0">
              <NotionIcon />
            </Button>
            <Button variant="outline" className="h-12 w-12 rounded-full p-0">
              <FacingIcon />
            </Button>
            <Button variant="outline" className="h-12 w-12 rounded-full p-0">
              <InsIcon />
            </Button>
          </div>
        </div>
        <div className="gap-2">
          <Text>Or copy link</Text>
          <div className="flex gap-1">
            <Input
              className="w-[324px]"
              value={link}
              onChange={(e) => setLink(e?.target?.value)}
            />
            <Button onClick={handleClick}>Copy</Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ShareApp
