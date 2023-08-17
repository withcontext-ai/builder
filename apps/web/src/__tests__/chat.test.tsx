import {
  fireEvent,
  getByText,
  render,
  renderHook,
  screen,
} from '@testing-library/react'
import { enableFetchMocks } from 'jest-fetch-mock'
import { beforeEach, expect, test } from 'vitest'

import '@testing-library/jest-dom'

import { useChat } from 'ai/react'

import TestChat from '@/app/demo/test-chat/page'

enableFetchMocks()

test('test chat show the default UI', () => {
  const { queryByText, getByPlaceholderText } = render(<TestChat />)

  // chat header, session-name
  expect(queryByText('test-chat-session')).toBeDisabled

  // chat list

  // chat input
  expect(getByPlaceholderText('Type a message')).toBeInTheDocument
  expect(queryByText('send')).toBeInTheDocument
})

// test('test chat when enter press to send msg', () => {
//   // TODO: why multi textarea
//   const { getAllByPlaceholderText, queryByText, getByRole } = render(
//     <TestChat />
//   )
//   const textarea = getAllByPlaceholderText('Type a message')
//   const input = 'hello, to test the textarea keypress'

//   fireEvent.keyPress(textarea?.[0], {
//     key: 'Enter',
//     code: 13,
//     charCode: 13,
//     target: { value: input },
//   })

//   // add a new message
//   expect(queryByText(input)).toBeDefined

//   // show the message card  app_name: chat-app
//   expect(queryByText('chat-app'))?.toBeInTheDocument

//   // loading status: waiting for response, can't keypress
//   expect(getByRole('button')).toBeDisabled

//   // show the stop generate button
//   const stopButton = queryByText('Stop generating')
//   expect(stopButton).not.toBeDisabled
// })

// test('test chat when click button to send msg', async () => {
//   const { getByRole, queryByText } = render(<TestChat />)
//   const button = getByRole('button')

//   fireEvent.click(button)
//   // loading status: waiting for response, can't keypress
//   expect(getByRole('button')).toBeDisabled

//   // show the stop generate button
//   const stopButton = queryByText('Stop generating')
//   expect(stopButton).not.toBeDisabled
// })

test('test useChat', async () => {
  const { result } = renderHook(() =>
    useChat({
      id: 'test-chat',
      body: {
        appId: 'YhTq4Xx29aDZ',
        sessionId: 'srQuAKvgZR7W',
        apiSessionId: '21486acbbd393f8a6131a9009d6aae4d',
      },
    })
  )

  expect(result?.current?.isLoading).toBeFalsy
  expect(result?.current?.messages).not.toHaveLength
})
