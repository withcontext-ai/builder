import React, { useState } from 'react'
import { fireEvent, getByText, render, screen } from '@testing-library/react'
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
  const { queryByText, getByRole } = render(<Chat {...values} />)
  const textarea = getByRole('chat-textarea')
  // const messages:Message[] = [{
  //   id:nanoid(),
  //   role:"user",
  //   createdAt:new Date(),
  //   content:'hello'
  // }]
  fireEvent.keyPress(textarea, { key: 'Enter', code: 13, charCode: 13 })
})
