import { useEffect, useRef } from 'react'

import { SectionType } from './page'

interface IProps {
  selected?: string
  setSelected?: (s: string) => void
  sections?: SectionType[]
}
const thresholdArray = () => {
  const threshold = []
  for (let i = 0; i <= 1; i += 0.01) threshold.push(i)
  return threshold
}

const observerOptions = {
  root: null,
  rootMargin: '0px',
  threshold: thresholdArray() || 0.7,
}

const DatasetContent = ({ setSelected, sections }: IProps) => {
  const observerRef = useRef<IntersectionObserver>()
  const listener = () => {
    observerRef.current = new IntersectionObserver(
      observerCallback,
      observerOptions
    )
    // @ts-ignore
    sections?.map((item) => observer.observe(item?.ref?.current))
  }

  function observerCallback(entries: any, observer: any) {
    entries.forEach((entry: any) => {
      if (entry.isIntersecting && entry?.intersectionRatio) {
        // how to chose the active
      }
    })
  }
  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      observerCallback,
      observerOptions
    )
    sections?.map((item) =>
      observerRef.current?.observe(item?.ref?.current as HTMLElement)
    )
  }, [sections])
  return (
    <div onScroll={listener} className="relative h-full w-full overflow-y-auto">
      <section id="#dataset-name">dataset-name</section>
      <section id="loaders" className="h-[200px]" ref={sections?.[0]?.ref}>
        <h1>loaders</h1>
      </section>
      <section id="splitters" className="h-[400px]" ref={sections?.[1]?.ref}>
        <h1>splitters</h1>
      </section>
      <section id="models" className="h-[400px]" ref={sections?.[2]?.ref}>
        <h1>models</h1>
      </section>
      <section id="stores" className="h-[400px]" ref={sections?.[3]?.ref}>
        <h1>stores</h1>
      </section>
      <section id="retrievers" className="h-[400px]" ref={sections?.[4]?.ref}>
        <h1>retrievers</h1>
      </section>
    </div>
  )
}
export default DatasetContent
