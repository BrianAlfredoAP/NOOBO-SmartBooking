import { useEffect, useState } from 'react'

export default function useLocalStorageState(key, initialValue) {
  const [value, setValue] = useState(() => {
    try {
      const saved = window.localStorage.getItem(key)
      return saved === null ? initialValue : JSON.parse(saved)
    } catch {
      return initialValue
    }
  })

  useEffect(() => {
    try { window.localStorage.setItem(key, JSON.stringify(value)) } catch { /* Keep the demo functional when storage is blocked. */ }
  }, [key, value])

  return [value, setValue]
}
