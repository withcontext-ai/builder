import React from 'react'
import { fireEvent, render } from '@testing-library/react'
import { nanoid } from 'ai'
import { expect, test } from 'vitest'

import '@testing-library/jest-dom'

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

  expect(getByTestId('chat-header')).toBeVisible()
  expect(getByTestId('chat-input')).toBeVisible()
  expect(getByTestId('chat-list')).toBeVisible()
})

test('test chat when enter press to send msg', () => {
  // TODO: why multi textarea
  const { getAllByPlaceholderText, queryByText, getByRole, getByTestId } =
    render(<Chat {...values} />)
  const textarea = getAllByPlaceholderText('Type a message')
  const input = 'hello, to test the textarea keypress'

  fireEvent.keyPress(textarea?.[0], {
    key: 'Enter',
    code: 13,
    charCode: 13,
    target: { value: input },
  })

  // add a new message
  expect(queryByText(input)).toBeDefined

  // show the message card
  expect(queryByText(values.app?.name || ''))?.toBeInTheDocument

  // loading status: waiting for response, can't keypress
  expect(getByRole('button')).toBeDisabled

  // show the stop generate button
  const stopButton = getByTestId('stop-generate-button')
  expect(stopButton).toBeVisible()
})

test('test chat when click button to send msg', () => {
  const { getByRole } = render(<Chat {...values} />)
  const button = getByRole('button')

  fireEvent.click(button)

  // loading status: waiting for response, can't keypress
  expect(getByRole('button')).toBeDisabled
})
