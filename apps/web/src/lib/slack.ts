import { WebClient } from '@slack/web-api'

export const createSlackClient = (token: string) => new WebClient(token)
