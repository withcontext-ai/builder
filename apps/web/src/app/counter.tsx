'use client'

import { useState } from 'react'

export default function Counter() {
  const [count, setCount] = useState(0)

  return (
    <div className="flex flex-col items-center justify-center w-full h-full space-y-4">
      <h1 className="text-6xl font-bold">{count}</h1>
      <div className="flex space-x-4">
        <button
          className="px-4 py-2 text-white bg-blue-500 rounded-md"
          onClick={() => setCount(count + 1)}
        >
          Increment
        </button>
        <button
          className="px-4 py-2 text-white bg-red-500 rounded-md"
          onClick={() => setCount(count - 1)}
        >
          Decrement
        </button>
      </div>
    </div>
  )
}
