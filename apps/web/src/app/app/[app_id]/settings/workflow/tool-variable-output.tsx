'use client'

import { useState } from 'react'
import { Mention, MentionsInput } from 'react-mentions'

import MentionInputStyle from './mention-style/mentionsInputStyle'

import './mention-style/mentionInput.css'

const ToolVariableMentions = () => {
  const [prompt, setPrompt] = useState('')
  const users = [
    {
      id: 'isaac',
      display: 'Isaac Newton',
    },
    {
      id: 'sam',
      display: 'Sam Victor',
    },
    {
      id: 'emma',
      display: 'emmanuel@nobody.com',
    },
  ]

  return (
    <MentionsInput
      value={prompt}
      onChange={(e) => setPrompt(e?.target?.value)}
      // style={MentionInputStyle}
      className="mentions"
      // className="flex min-h-[80px] w-full resize-none rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
    >
      <Mention
        className="mentions__mention"
        data={users}
        trigger={'{'}
        displayTransform={(id, display) => {
          return `{${display}}`
        }}
      />
    </MentionsInput>
  )
}

export default ToolVariableMentions
