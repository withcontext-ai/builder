import React from 'react'
import { fireEvent, render } from '@testing-library/react'
import { expect, test } from 'vitest'

import '@testing-library/jest-dom'

import TestChat from '@/app/demo/test-chat/page'

test('test chat show the default UI', () => {
  const { getByTestId } = render(<TestChat />)
  expect(getByTestId('chat-header')).toBeVisible()
  expect(getByTestId('chat-input')).toBeVisible()
  expect(getByTestId('chat-list')).toBeVisible()
})

test('test chat when enter press to send msg', () => {
  // TODO: why multi textarea
  const { getAllByPlaceholderText, queryByText, getByRole, getByTestId } =
    render(<TestChat />)
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

  // show the message card  app_name: chat-app
  expect(queryByText('chat-app'))?.toBeInTheDocument

  // loading status: waiting for response, can't keypress
  expect(getByRole('button')).toBeDisabled

  // show the stop generate button
  const stopButton = queryByText('Stop generating')
  expect(stopButton).not.toBeDisabled
})

test('test chat when click button to send msg', async () => {
  const { getByRole, queryByText } = render(<TestChat />)
  const button = getByRole('button')

  fireEvent.click(button)
  // loading status: waiting for response, can't keypress
  expect(getByRole('button')).toBeDisabled

  // show the stop generate button
  const stopButton = queryByText('Stop generating')
  expect(stopButton).not.toBeDisabled
})
