import React from 'react'
import { fireEvent, render } from '@testing-library/react'
import { Message, nanoid } from 'ai'
import { expect, test } from 'vitest'

import Chat, { ChatProps } from '@/components/chat/page'

const values: ChatProps = {
  appIcon: '',
  appId: 'test-chat',
  appName: 'chat-testing',
  sessionName: 'without apiSessionId chat',
  sessionId: nanoid(),
}
test('test chat show the default UI', () => {
  const { getByRole } = render(<Chat {...values} />)
  expect(getByRole('chat-header')).toHaveLength
  expect(getByRole('chat-list')).toHaveLength
  expect(getByRole('chat-input')).toHaveLength
})

test('test chat when enter to send msg', () => {
  // const messages:Message[] = [{
  //   id:nanoid(),
  //   role:"user",
  //   createdAt:new Date(),
  //   content:'hello'
  // }]
  const { queryByText, getByRole } = render(<Chat {...values} />)
  const textarea = getByRole('textarea', { name: 'chat-textarea' })
  fireEvent.change(textarea, {
    target: { value: 'hello, to test the textarea keypress' },
  })
  fireEvent.keyPress(textarea, { key: 'Enter', code: 13, charCode: 13 })
  expect(queryByText('hello, to test the textarea keypress')).toBeDefined()
})
