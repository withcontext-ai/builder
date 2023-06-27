interface IProps {
  appId: string
  name: string
  desc: string
  icon: string
}

export default function Header({ appId, name, desc, icon }: IProps) {
  return (
    <div>
      <div className="h-32 bg-black">
        <div className="flex items-center justify-between px-4 py-2.5 text-white">
          <h1 className="text-lg font-semibold">{name}</h1>
          <div>下拉框</div>
        </div>
      </div>
      <div className="p-4 text-xs font-medium text-slate-500">{desc}</div>
    </div>
  )
}
