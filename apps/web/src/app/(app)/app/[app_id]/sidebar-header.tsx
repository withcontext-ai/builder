'use client'

import * as React from 'react'
import { useParams } from 'next/navigation'
import { omit } from 'lodash'

import { cn, getAvatarBgColor, getFirstLetter } from '@/lib/utils'
import { NewApp } from '@/db/apps/schema'
import AppSettingDialog from '@/components/app-setting-dialog'

interface IProps {
  isAdmin?: boolean
  isOwner?: boolean
  appDetail?: NewApp
}

export default function Header(props: IProps) {
  const { isAdmin = false, isOwner = false, appDetail } = props
  const { name, icon, description: desc } = appDetail as NewApp
  const { app_id } = useParams() as {
    app_id: string
  }
  const color = getAvatarBgColor(app_id)
  const defaultValues = omit(appDetail, [
    'api_model_id',
    'id',
    'short_id',
    'created_at',
    'updated_at',
    'created_by',
  ])
  return (
    <div>
      <div
        className={cn(
          'relative h-32 bg-cover bg-center',
          !icon && `bg-${color}-600`
        )}
        style={{
          ...(icon
            ? {
                backgroundImage: `url(${icon})`,
              }
            : {}),
        }}
      >
        {!icon && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-5xl font-extrabold text-white">
              {getFirstLetter(name)}
            </div>
          </div>
        )}
        <div className="sticky top-0 flex items-center justify-between bg-gradient-to-b from-black/50 to-transparent px-4 py-2.5 text-white">
          <h1 className="mr-2 truncate text-lg font-semibold">{name}</h1>
          <div className="hidden lg:block">
            <AppSettingDialog
              appId={app_id}
              name={name}
              defaultValues={defaultValues}
              isOwner={isOwner || isAdmin}
            />
          </div>
        </div>
      </div>
      {desc && (
        <div className="whitespace-pre-line break-words p-4 text-xs font-medium leading-5 text-slate-500">
          {desc}
        </div>
      )}
    </div>
  )
}
