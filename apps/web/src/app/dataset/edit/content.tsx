import { useRef } from 'react'

import { SectionType } from './page'

interface IProps {
  selected?: string
  setSelected?: (s: string) => void
  sections?: SectionType[]
}

const DatasetContent = ({ setSelected, sections }: IProps) => {
  const mainRef = useRef<HTMLDivElement>(null)
  const listener = () => {
    console.log('--scroll')
  }

  // Get all sections that have an ID defined

  // Add an event listener listening for scroll

  return (
    <div
      ref={mainRef}
      className="relative h-full w-full overflow-y-auto"
      onScroll={() => {
        listener()
      }}
    >
      <section id="loaders" className="h-[200px]">
        <h1>loaders</h1>
      </section>
      <section id="splitters" className="h-[400px]">
        <h1>splitters</h1>
      </section>
      <section id="models" className="h-[400px]">
        <h1>models</h1>
      </section>
      <section id="stores" className="h-[400px]">
        <h1>stores</h1>
      </section>
      <section id="retrievers" className="h-[400px]">
        <h1>retrievers</h1>
      </section>
    </div>
  )
}
export default DatasetContent
