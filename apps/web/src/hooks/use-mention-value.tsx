import { useCallback, useState } from 'react'

function useMentionsValue(initialValue: string, initialSelected?: string[]) {
  const [value, setValue] = useState(initialValue)
  const [selected, setSelected] = useState(initialSelected)
  const onChange = useCallback(
    (newValue: string) => setValue(newValue),
    [setValue]
  )
  const onAdd = useCallback((...args: any) => {
    const data = [...args]?.filter((item) => typeof item === 'string')
    setSelected([...data])
  }, [])

  return { value, onChange, onAdd, selected }
}

export default useMentionsValue
