export type IChatAttachment = {
  name: string
  size: number
  type: string
  path: string
  preview: string
  dateCreated: Date
  dateModified: Date
}

export type IChatTextMessage = {
  id: string
  body: string
  contentType: 'text' | 'interview_summary' | 'image' | 'document_summary'
  attachments: IChatAttachment[]
  createdAt: Date
  senderId: string
  parentMsgId: string
}

export type IChatImageMessage = {
  id: string
  body: string
  contentType: 'image' | 'text' | 'interview_summary' | 'document_summary'
  attachments: IChatAttachment[]
  createdAt: Date
  senderId: string
  parentMsgId: string
}

export type IChatMessage = IChatTextMessage | IChatImageMessage
