import { PassThrough } from 'stream'
import {
  cleanup,
  queryByText,
  render,
  renderHook,
  waitFor,
} from '@testing-library/react'
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

import Chat from '@/components/chat/page'

import { commonTestWrapper } from '../../../test/utils'

describe('Chat', () => {
  global.fetch = mockChat()
  function mockChat() {
    const mockMessages = [
      ['hello', 'world', 'thisis', 'atest'],
      ['hello', 'world', 'message2'],
    ]
    let i = 0
    return vi.fn().mockImplementation(
      (path: string) =>
        new Promise((res) => {
          if (path === '/api/chat') {
            const stream = new ReadableStream({
              start: async (controller) => {
                const encoder = new TextEncoder()
                const mockMessage = mockMessages[i++]
                mockMessage.forEach((m) =>
                  controller.enqueue(encoder.encode(m))
                )
                setTimeout(() => {
                  controller.close()
                }, 1000)
              },
            })
            res(new Response(stream))
          }
        })
    )
  }

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
      commonTestWrapper(
        <Chat
          workflow={[]}
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
    )
  })

  afterEach(() => {
    cleanup()
  })

  test('matches snapshot', () => {
    const { asFragment } = component
    expect(asFragment()).toMatchSnapshot()
  })

  test('send message and regenerate', async () => {
    const { queryByTestId } = component
    const sendButton = queryByTestId('send')!
    const input = queryByTestId('input')!

    expect(queryByTestId('send')).toBeInTheDocument()

    expect(sendButton).toBeDisabled()

    await user.click(input)

    await user.keyboard('hello, to test the textarea keypress')

    expect(sendButton).not.toBeDisabled()

    await user.click(sendButton)

    expect(input.textContent).toBe('')

    expect(sendButton).toBeDisabled()

    await waitFor(() => {
      expect(queryByTestId('stop')!).toBeInTheDocument()
    })
    await waitFor(() => {
      expect(component.queryByText('helloworldthisisatest')).toBeInTheDocument()
    })

    await waitFor(() => {
      const regen = component.queryByText('Regenerate response')!
      expect(regen).toBeInTheDocument()
      user.click(regen)
    })

    await waitFor(() => {
      const stop = queryByTestId('stop')!
      expect(stop).toBeInTheDocument()
      user.click(stop)
    })

    await waitFor(() => {
      const regen = component.queryByText('Regenerate response')!
      expect(regen).toBeInTheDocument()
    })

    // await waitFor(() => {
    //   expect(component.queryByText('helloworldmessage2')).toBeInTheDocument()
    // })
  })
})
