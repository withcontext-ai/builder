import SearchSelect from './search-select'
import { SessionProps } from './text-spliter'

const types = [
  { label: 'OpenAI Embedding', value: 'openAI embedding' },
  { label: 'Comming soon...', value: 'comming soon' },
]

const TextEmbedding = ({ form, ref }: SessionProps) => {
  return (
    <section id="models" className="w-full" ref={ref}>
      <div className="mb-6 text-2xl font-semibold leading-8">
        Text Embedding Models
      </div>
      <div className="mb-6	text-sm font-normal leading-6 text-slate-600">
        The Embeddings class is a class designed for interfacing with text
        embedding models. There are lots of embedding model providers (OpenAI,
        Cohere, Hugging Face, etc) - this class is designed to provide a
        standard interface for all of them.
      </div>
      <SearchSelect
        form={form}
        name="embeddingType"
        values={types}
        title="Text Embedding Models"
      />
    </section>
  )
}
export default TextEmbedding
