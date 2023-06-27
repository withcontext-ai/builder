import { Button } from '@/components/ui/button'
import Text from '@/components/ui/text'

interface IProps {
  appId: string
}

const WebIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    // xmlns:xlink="http://www.w3.org/1999/xlink"
  >
    <rect width="24" height="23.6448" fill="url(#pattern0)" />
    <defs>
      <pattern
        id="pattern0"
        patternContentUnits="objectBoundingBox"
        width="1"
        height="1"
      >
        <use
          href="#image0_365_6278"
          transform="scale(0.000925069 0.000938967)"
        />
      </pattern>
      <image id="image0_365_6278" width="1081" height="1065" />
    </defs>
  </svg>
)

const ShareApp = ({ appId }: IProps) => {
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
        <div>
          <Text>embed this App in</Text>
          <div className="flex gap-4">
            <Button variant="outline" className="h-12 w-12 rounded-full p-0">
              <WebIcon />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ShareApp
