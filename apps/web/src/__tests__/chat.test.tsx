import React, { useState } from 'react'
import { fireEvent, getByText, render, screen } from '@testing-library/react'
import { nanoid } from 'ai'
import { expect, test } from 'vitest'

import Chat, { ChatProps } from '@/components/chat/page'

test('test chat with no apiSessionId', () => {
  const values: ChatProps = {
    appIcon: '',
    appId: 'test-chat',
    appName: 'chat-testing',
    sessionName: 'without apiSessionId chat',
    sessionId: nanoid(),
  }
  const { queryByText } = render(<Chat {...values} />)
  // show the app-name
  expect(queryByText(values?.appName)).toBeNull()
  // enter to chat
  // fireEvent.mouseEnter(screen.queryByRole('textarea'))
})
