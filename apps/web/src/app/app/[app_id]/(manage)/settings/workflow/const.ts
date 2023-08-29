import { RocketIcon, WrenchIcon } from 'lucide-react'

import { TreeItem } from '@/components/dnd/types'

import { WorkflowItem } from './type'

export const DEFAULT_MAX_TOKENS = 2048
export const MAX_MAX_TOKENS = 4096

export const TYPE_MAP = {
  tool: {
    title: 'Tools',
    icon: WrenchIcon,
  },
  agent: {
    title: 'Agents',
    icon: RocketIcon,
  },
}

export const SUB_TYPE_MAP = {
  conversation_chain: {
    title: 'Conversation chain',
  },
  conversational_retrieval_qa_chain: {
    title: 'Conversational Retrieval QA',
  },
  self_checking_chain: {
    title: 'Self Checking',
  },
}

export const ADD_TASK_BUTTON_CONFIG = [
  {
    type: 'tool',
    title: 'Tools',
    desc: 'Some encapsulated tools to handle certain tasks.',
    children: [
      {
        title: 'Chains',
        children: [
          {
            subType: 'conversation_chain',
            title: 'Conversation',
            desc: 'Basic example of conversation with a Prompt Template and LLM Model',
          },
          {
            subType: 'conversational_retrieval_qa_chain',
            title: 'Conversational Retrieval QA',
            desc: 'Support uploading data sources and searching for answers from data sources',
          },
          {
            subType: 'self_checking_chain',
            title: 'Self Checking',
            desc: "Set the objective for the dialogue, and you can check whether the goal is achieved based on the conversation's context.",
          },
        ],
      },
    ],
  },
] satisfies {
  type: 'tool' | 'agent'
  title: string
  desc: string
  children: {
    title: string
    children: {
      subType: string
      title: string
      desc: string
    }[]
  }[]
}[]

export const TASK_DEFAULT_VALUE_MAP = {
  conversation_chain: {
    llm: {
      name: 'gpt-3.5-turbo',
      api_key: '',
      temperature: 0.9,
      max_tokens: DEFAULT_MAX_TOKENS,
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0,
    },
    prompt: {
      template: '',
      basic_prompt: `The following is a friendly conversation between a human and an AI. The AI is talkative and provides lots of specific details from its context. If the AI does not know the answer to a question, it truthfully says it does not know.
Current conversation:
[{chat_history}]
Human: [{question}]
AI:`,
    },
  },
  conversational_retrieval_qa_chain: {
    llm: {
      name: 'gpt-3.5-turbo',
      api_key: '',
      temperature: 0.9,
      max_tokens: DEFAULT_MAX_TOKENS,
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0,
    },
    prompt: {
      template: '',
      basic_prompt: `background: '''[{context}]'''
chat history: [{chat_history}]
Use the text separated by three quotation marks in the background to answer the question. Do not add any additional information. Make sure the answer is correct, do not output false content. If the answer cannot be found in the text, please write "The answer is not provided in the document".
[{question}]`,
    },
    retriever: {
      type: 'pinecone_hybrid_search',
    },
    data: {
      datasets: [],
    },
  },
  self_checking_chain: {
    llm: {
      name: 'gpt-3.5-turbo',
      api_key: '',
      temperature: 0.9,
      max_tokens: DEFAULT_MAX_TOKENS,
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0,
    },
    prompt: {
      template: '',
      target: '',
      check_prompt:
        'The goal is [{target}], and the content of the conversation is [{chat_history}]. Please determine if the dialogue has achieved the target. If so, only output "Yes" and do not provide any other explanations. If not, in order to achieve the goal, combine with the following dialogue and ask a question again.',
      follow_up_questions_num: 1,
    },
  },
}

export const DEFAULT_WORKFLOW_TREE: TreeItem[] = [
  { id: 'default_conversation_chain_id', children: [] },
]

export const DEFAULT_WORKFLOW_DATA: WorkflowItem[] = [
  {
    key: 0,
    id: 'default_conversation_chain_id',
    type: 'tool',
    subType: 'conversation_chain',
    formValueStr: JSON.stringify(TASK_DEFAULT_VALUE_MAP['conversation_chain']),
  },
]
