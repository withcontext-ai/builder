import { ClassValue, clsx } from 'clsx'
import ms from 'ms'
import { customAlphabet } from 'nanoid'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function isImage(url: string) {
  return /\.(jpg|jpeg|png|webp|avif|gif|svg)$/.test(url)
}

export const timeAgo = (timestamp: Date, timeOnly?: boolean): string => {
  if (!timestamp) return 'never'
  return `${ms(Date.now() - new Date(timestamp).getTime())}${
    timeOnly ? '' : ' ago'
  }`
}

export const nanoid = customAlphabet(
  '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz',
  7
) // 7-character random string

export const getFirstLetter = (str: string) => str.charAt(0).toUpperCase()

export const BASE_URL =
  process.env.VERCEL_URL || process.env.VERCEL_BRANCH_URL
    ? `https://${
        process.env.VERCEL_ENV === 'production'
          ? process.env.VERCEL_URL
          : process.env.VERCEL_BRANCH_URL
      }`
    : 'http://localhost:3000'

export const fetcher = (...args: Parameters<typeof fetch>) =>
  fetch(...args)
    .then((res) => res.json())
    .then((res) => res?.data)
