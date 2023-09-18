'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeftIcon } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/tabs'

import Basics from './basics'
import Documents from './documents'

interface IProps {
  name: string
  config: Record<string, any>
}

const ViewPage = (props: IProps) => {
  const router = useRouter()

  function handleGoBack() {
    router.push('/datasets')
  }
  return (
    <div className="block overflow-y-auto lg:hidden">
      <div className="sticky top-0 flex h-12 items-center gap-x-6 border-b border-slate-200 bg-white px-4">
        <Button
          variant="ghost"
          size="icon"
          className="-m-2.5"
          onClick={handleGoBack}
        >
          <ArrowLeftIcon className="h-4 w-4" />
        </Button>
        <h1 className="text-sm font-medium">Dataset</h1>
      </div>
      <div className="p-6">
        <Tabs defaultValue="data">
          <TabsList>
            <TabsTrigger value="basics">Basics</TabsTrigger>
            <TabsTrigger value="data">Data</TabsTrigger>
          </TabsList>
          <TabsContent value="basics">
            <Basics {...props} />
          </TabsContent>
          <TabsContent value="data">
            <Documents documents={props?.config?.files || []} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

export default ViewPage
