import ReactMarkdown from 'react-markdown'
import rehypeHighlight from 'rehype-highlight'
// markdown plugins
import rehypeRaw from 'rehype-raw'
import remarkGfm from 'remark-gfm'

import Typography from '@/components/ui/typography'

import { MarkdownProps } from './type'

export const MarkDown = (props: MarkdownProps) => {
  const { className, showCustomeCard: showCustomerCard, ...others } = props
  return (
    <div className={`${className}`}>
      {/* @ts-ignore */}
      <ReactMarkdown
        components={markdownComponent}
        rehypePlugins={[
          rehypeRaw,
          rehypeHighlight,
          [remarkGfm, { singleTilde: false }],
        ]}
        {...others}
      />
      {showCustomerCard && <CustomerCard />}
    </div>
  )
}

export const CustomerCard = () => {
  return (
    <div className="">
      <div>Context summary title</div>
      <div>summary content area</div>
      <div>button action area</div>
    </div>
  )
}

const markdownComponent = {
  h1: ({ ...props }) => <Typography variant="h1" {...props} />,
  h2: ({ ...props }) => <Typography variant="h2" {...props} />,
  h3: ({ ...props }) => <Typography variant="h3" {...props} />,
  h4: ({ ...props }) => <Typography variant="h4" {...props} />,
  h5: ({ ...props }) => <Typography variant="h5" {...props} />,
  h6: ({ ...props }) => <Typography variant="h6" {...props} />,
  p: ({ ...props }) => (
    <Typography variant="body2" {...props} className="break-words" />
  ),
  img: ({ ...props }) => (
    <img
      style={{ display: 'inline-block', marginBottom: -3 }}
      alt={props.alt}
      src={props.src}
      {...props}
    />
  ),
  a: ({ ...props }) => {
    const isHttp = props.href.includes('http')
    const isPdf = props.node.properties.href.includes('pdf')
    if (isPdf) {
      return <div>preview pdf</div>
    }
    return <div>this is http link</div>
  },
}
