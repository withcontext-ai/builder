'use client'

import { Button } from '@/components/ui/button'

export default function FormActions() {
  return (
    <div className="fixed bottom-4 left-[276px] mx-4">
      <div className="flex h-18 w-[600px] max-w-md items-center justify-end space-x-2 rounded-lg border border-slate-100 bg-background px-4 shadow-md lg:max-w-lg xl:max-w-xl 2xl:max-w-full">
        <Button type="button" variant="ghost">
          Reset
        </Button>
        <Button type="submit">Publish</Button>
      </div>
    </div>
  )
}
