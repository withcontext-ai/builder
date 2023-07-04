import { RefObject } from 'react'
import { FormProps, UseFormReturn } from 'react-hook-form'

import SearchSelect from './search-select'

interface IProps {
  form: UseFormReturn
  ref?: RefObject<HTMLElement>
}
const types = [
  { label: 'Character TextSplitter', value: 'character textsplitter' },
  { label: 'Comming soon...', value: 'comming soon' },
] as const

const TextSplits = ({ form, ref }: IProps) => {
  return (
    <section id="splitters" className="w-full" ref={ref}>
      <div className="mb-6 text-2xl font-semibold leading-8">
        Text Splitters
      </div>
      <div className="mb-6	text-sm font-normal leading-6 text-slate-600">
        When you want to deal with long pieces of text, it is necessary to split
        up that text into chunks. As simple as this sounds, there is a lot of
        potential complexity here. Ideally, you want to keep the semantically
        related pieces of text together. What &quot;semantically related&quot;
        means could depend on the type of text. This notebook showcases several
        ways to do that.
      </div>
      <SearchSelect
        form={form}
        name="splitType"
        values={types}
        title="Text Splitters
"
      />
    </section>
  )
}

export default TextSplits
