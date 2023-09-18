import { PdfImage } from '@/components/upload/component'

import NotedDataCard from '../../document/[document_id]/noted-data-card'

export function Title({ children }: { children: React.ReactNode }) {
  return <div className="text-lg font-semibold">{children}</div>
}

export function Item({
  label,
  value,
  type,
}: {
  label: string
  value: string | any[]
  type?: string
}) {
  if (type === 'files' && Array.isArray(value)) {
    return (
      <div className="space-y-2">
        {value.map(
          ({
            name,
            url,
            type,
            uid,
            icon,
          }: {
            name: string
            url: string
            type: string
            uid: string
            icon: string
          }) => (
            <File key={url} name={name} type={type} icon={icon} uid={uid} />
          )
        )}
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <div className="text-base font-medium">{label}</div>
      <div className="text-sm">{value || '-'}</div>
    </div>
  )
}

export function File({
  name,
  type,
  icon = '',
  uid,
}: {
  name: string
  type: string
  icon?: string
  uid: string
}) {
  return (
    <div className="flex h-16 max-w-sm items-center space-x-2 rounded-lg border border-slate-200 px-6">
      <div className="shrink-0">
        {type === 'pdf' ? (
          <PdfImage id="mobile" />
        ) : (
          <NotedDataCard data={{ name, uid, icon }} isAdd={false} />
        )}
      </div>
      <div className="truncate text-sm font-medium">{name}</div>
    </div>
  )
}
