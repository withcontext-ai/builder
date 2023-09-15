// via https://github.com/vercel-labs/slacker/blob/main/pages/api/response.ts
import { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      response_type: 'ephemeral',
      text: 'This endpoint only accepts POST requests',
    })
  }

  const payload = JSON.parse(req.body.payload)
  console.log('payload:', payload)

  return res.status(200).json({ success: true })
}
