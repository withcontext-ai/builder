import { fetcher } from '@/lib/utils'

import { ChatFeedbackType } from './types'

export default function submitFeedback(
  url: string,
  {
    arg,
  }: {
    arg: {
      session_id: string
      message_id: string
      content?: string
      type: ChatFeedbackType
    }
  }
) {
  fetcher(url, {
    method: 'POST',
    body: JSON.stringify(arg),
  })
}
