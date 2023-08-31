import { cleanup, render, renderHook } from '@testing-library/react'
import user from '@testing-library/user-event'
import {
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  test,
  vi,
} from 'vitest'

import Chat from '@/components/chat'

describe('Chat', () => {
  let component: ReturnType<typeof render>
  beforeAll(() => {
    vi.mock('@clerk/nextjs', () => ({
      useUser: () => ({
        firstName: 'test',
        lastName: 'user',
        fullName: 'test user',
      }),
    }))
  })

  beforeEach(() => {
    component = render(
      <Chat
        app={{
          name: 'chat-app',
          short_id: 'YhTq4Xx29aDZ',
          icon: '',
          enable_video_interaction: false,
          opening_remarks: null,
        }}
        mode="live"
        session={{
          api_session_id: '21486acbbd393f8a6131a9009d6aae4d',
          short_id: 'srQuAKvgZR7W',
          name: 'test-chat-session',
        }}
      />
    )
  })

  afterEach(() => {
    cleanup()
  })

  test('matches snapshot', () => {
    const { asFragment } = component
    expect(asFragment()).toMatchSnapshot()
  })

  test('send message', async () => {
    const { queryByTestId } = component
    const sendButton = queryByTestId('send')!

    expect(queryByTestId('send')).toBeInTheDocument()

    expect(sendButton).toBeDisabled()

    await user.click(queryByTestId('input')!)

    await user.keyboard('hello, to test the textarea keypress')

    expect(sendButton).not.toBeDisabled()

    await user.click(sendButton)

    expect(sendButton).toBeDisabled()

    const stopButton = queryByTestId('stop')!
    console.log(stopButton)

    expect(stopButton).toBeInTheDocument()

    user.click(stopButton)

    expect(sendButton).not.toBeDisabled()
  })
})
