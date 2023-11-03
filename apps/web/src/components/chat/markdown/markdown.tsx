import ReactMarkdown from 'react-markdown'
// markdown plugins
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'

import { cn } from '@/lib/utils'

import { CodeBlock, programmingLanguages } from './code-block'
import { MarkdownProps } from './type'

export const Markdown = (props: MarkdownProps) => {
  const {
    className,
    showCustomerCard: showCustomerCard,
    isUser,
    ...others
  } = props
  return (
    <ReactMarkdown
      className={cn(
        'prose break-words dark:prose-invert prose-p:leading-relaxed prose-pre:p-0',
        isUser ? 'text-white' : 'text-black'
      )}
      components={{
        p({ children }) {
          return (
            <p className="prose-sm mb-2 font-normal last:mb-0">{children}</p>
          )
        },
        li({ children }) {
          return <li className="prose-sm">{children}</li>
        },
        code({ node, className, children, ...props }) {
          const match = /language-(\w+)/.exec(className || '')
          const type = className?.split('-')?.[1] || ''
          const isCode = programmingLanguages?.[type]
          if (isCode && match) {
            return (
              <CodeBlock
                language={match[1]}
                value={String(children).replace(/\n$/, '')}
                {...props}
              />
            )
          }
          return (
            <span
              {...props}
              className={cn(className, isUser ? 'text-white' : 'text-black')}
            >
              {children}
            </span>
          )
        },
        a({ ...props }) {
          return (
            <a
              {...props}
              target="_blank"
              className={isUser ? 'text-white' : 'text-black'}
            />
          )
        },
      }}
      remarkPlugins={[remarkGfm, remarkMath]}
      {...others}
    />
  )
}
