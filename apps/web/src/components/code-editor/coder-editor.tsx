'use client'

import AceEditor from 'react-ace'

import 'brace/mode/json'
import 'brace/theme/tomorrow'

import { UseFormReturn } from 'react-hook-form'

import { languages, themes } from './const'

languages.forEach((lang) => {
  require(`brace/mode/${lang}`)
})

themes.forEach((theme) => require(`brace/theme/${theme}`))

interface IProps {
  name?: string
  form?: UseFormReturn<any>
  defaultValue?: string
  className?: string
  mode?: (typeof languages)[number]
  theme?: (typeof languages)[number]
}

const CodeEditor = ({ defaultValue, className, name, theme, mode }: IProps) => {
  return (
    <div>
      Code Editor
      <AceEditor
        mode={mode || 'json'}
        theme={theme || 'monokai'}
        name={name}
        className={className}
        fontSize={14}
        showPrintMargin={true}
        showGutter={true}
        highlightActiveLine={true}
        value={defaultValue}
        setOptions={{
          enableBasicAutocompletion: false,
          enableLiveAutocompletion: false,
          enableSnippets: false,
          showLineNumbers: true,
          tabSize: 2,
        }}
      />
    </div>
  )
}

export default CodeEditor
