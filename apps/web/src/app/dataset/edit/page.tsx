import DatasetContent from './content'
import SlideBar from './slidebar'

const DatasetSetting = () => {
  return (
    <div className="fixed inset-0 flex h-full w-full bg-white">
      <div className="w-[276px] border-r border-slate-200 bg-slate-50">
        <SlideBar />
      </div>
      <div className="flex-1">
        <DatasetContent />
      </div>
    </div>
  )
}

export default DatasetSetting
