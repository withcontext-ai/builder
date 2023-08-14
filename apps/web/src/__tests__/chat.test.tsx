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
  console.log(chatList, '---chatList')
})

// test('test chat when enter to send msg', () => {
//   // const messages:Message[] = [{
//   //   id:nanoid(),
//   //   role:"user",
//   //   createdAt:new Date(),
//   //   content:'hello'
//   // }]
//   const { queryByText, getByRole } = render(<Chat {...values} />)
//   const textarea = getByRole('textarea', { name: 'chat-textarea' })
//   fireEvent.change(textarea, {
//     target: { value: 'hello, to test the textarea keypress' },
//   })
//   fireEvent.keyPress(textarea, { key: 'Enter', code: 13, charCode: 13 })
//   expect(queryByText('hello, to test the textarea keypress')).toBeDefined()
// })
