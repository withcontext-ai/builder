import React from 'react'
import { fireEvent, render, screen } from '@testing-library/react'
import { Message, nanoid } from 'ai'
import { expect, test } from 'vitest'

import Chat, { ChatProps } from '@/components/chat/page'

const values: ChatProps = {
  app: {
    icon: '',
    name: 'test-chat',
    short_id: 'test-chat',
    opening_remarks: '',
    enable_video_interaction: false,
  },
  session: { short_id: nanoid(), api_session_id: '', name: 'chat-session' },
  mode: 'live',
}

test('test chat show the default UI', () => {
  const { getByTestId } = render(<Chat {...values} />)
  const chatList = expect(getByTestId('chat-list'))
  expect(getByTestId('chat-header')).toBeTruthy
  expect(getByTestId('chat-input')).toBeTruthy
  chatList.toBeTruthy
  // TODD: check the chatList heigh
})

test('test chat when enter to send msg', () => {
  // const messages:Message[] = [{
  //   id:nanoid(),
  //   role:"user",
  //   createdAt:new Date(),
  //   content:'hello'
  // }]
  const { getAllByPlaceholderText } = render(<Chat {...values} />)
  const textarea = getAllByPlaceholderText('Type a message')
  const input = 'hello, to test the textarea keypress'

  fireEvent.keyPress(textarea?.[0], {
    key: 'Enter',
    code: 13,
    charCode: 13,
    target: { value: input },
  })
})
