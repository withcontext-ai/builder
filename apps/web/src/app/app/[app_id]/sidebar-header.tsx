import AppSettingDialog from '@/components/app-setting-dialog'

interface IProps {
  appId: string
  name: string
  desc: string
  icon: string
}

export default function Header({ appId, name, desc, icon }: IProps) {
  return (
    <div>
      <div
        className="h-32 bg-cover bg-center"
        style={{
          ...(icon
            ? {
                backgroundImage: `url(${icon})`,
              }
            : {}),
        }}
      >
        <div className="flex items-center justify-between bg-gradient-to-b from-slate-500 to-transparent px-4 py-2.5 text-white">
          <h1 className="mr-2 truncate text-lg font-semibold">{name}</h1>
          <AppSettingDialog appId={appId} name={name} />
        </div>
      </div>
      <div className="p-4 text-xs font-medium text-slate-500">{desc}</div>
    </div>
  )
}
