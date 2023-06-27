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
        className="h-32 bg-black bg-cover bg-center"
        style={{
          backgroundImage:
            "url('https://backend.withcontext.ai/backend/upload/2023/04/65947928-68d6-4f64-99d9-0b98578fe4c6.jpeg')",
        }}
      >
        <div className="flex items-center justify-between bg-gradient-to-b from-slate-500 to-transparent px-4 py-2.5 text-white">
          <h1 className="mr-2 truncate text-lg font-semibold">{name}</h1>
          <AppSettingDialog appId={appId} />
        </div>
      </div>
      <div className="p-4 text-xs font-medium text-slate-500">{desc}</div>
    </div>
  )
}
