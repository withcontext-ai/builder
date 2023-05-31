'use client'

import { useState } from 'react'

export default function Counter() {
  const [count, setCount] = useState(0)

  return (
    <div className="flex h-full w-full flex-col items-center justify-center space-y-4">
      <h1 className="text-6xl font-bold">{count}</h1>
      <div className="flex space-x-4">
        <button
          className="rounded-md bg-blue-500 px-4 py-2 text-white"
          onClick={() => setCount(count + 1)}
        >
          Increment
        </button>
        <button
          className="rounded-md bg-red-500 px-4 py-2 text-white"
          onClick={() => setCount(count - 1)}
        >
          Decrement
        </button>
      </div>
    </div>
  )
}
