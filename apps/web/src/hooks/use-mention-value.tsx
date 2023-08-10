import { useCallback, useState } from 'react'

function useMentionsValue(initialValue: string) {
  const [value, setValue] = useState(initialValue)

  const onChange = useCallback(
    (newValue: string) => setValue(newValue),
    [setValue]
  )
  const onAdd = useCallback((...args: any) => console.log(...args), [])

  return { value, onChange, onAdd }
}

export default useMentionsValue
