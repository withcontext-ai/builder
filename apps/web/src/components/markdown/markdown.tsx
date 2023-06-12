import ReactMarkdown from 'react-markdown'
import rehypeHighlight from 'rehype-highlight'
// markdown plugins
import rehypeRaw from 'rehype-raw'
import remarkGfm from 'remark-gfm'

import { MarkDownProps } from './type'

export const CustomeMarkDown = (props: MarkDownProps) => {
  const { className, ...other } = props
  return (
    <div className={className}>
      {/* @ts-ignore */}
      <ReactMarkdown
        rehypePlugins={[
          rehypeRaw,
          rehypeHighlight,
          [remarkGfm, { singleTilde: false }],
        ]}
        components={MarkDownComponent}
        {...other}
      />
    </div>
  )
}

const MarkDownComponent = {
  h1: ({ ...props }) => <h1 {...props} />,
  h2: ({ ...props }) => <h2 {...props} />,
  h3: ({ ...props }) => <h3 {...props} />,
  h4: ({ ...props }) => <h4 {...props} />,
  h5: ({ ...props }) => <h5 {...props} />,
  h6: ({ ...props }) => <h6 {...props} />,
  p: ({ ...props }) => <p {...props} />,
  hr: ({ ...props }) => <h3 {...props} />,
  img: ({ ...props }) => <h3 {...props} />,
  a: ({ ...props }) => <a {...props} />,
}
