import { TreeItem } from '@/components/dnd/types'

import { DEFAULT_MAX_TOKENS } from './const'
import { WorkflowItem } from './type'

export const TaskDefaultValueMap = {
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
        'The goal is [{target}], and the content of the conversation is [{dialogue}]. Please determine if the dialogue has achieved the target. If so, only output "Yes" and do not provide any other explanations. If not, in order to achieve the goal, combine with the following dialogue and ask a question again.',
      follow_up_questions_num: 1,
    },
  },
}

export const defaultWorkflowTree: TreeItem[] = [
  { id: 'default_conversation_chain_id', children: [] },
]

export const defaultWorkflowData: WorkflowItem[] = [
  {
    key: 0,
    id: 'default_conversation_chain_id',
    type: 'tool',
    subType: 'conversation_chain',
    formValueStr: `{"llm":{"name":"gpt-3.5-turbo","api_key":"","temperature":0.9,"max_tokens":${DEFAULT_MAX_TOKENS},"top_p":1,"frequency_penalty":0,"presence_penalty":0},"prompt":{"template":""}}`,
  },
]
