import { useCallback, useRef } from 'react'

type Ref<T> = React.Ref<T> | undefined | false | 0 | ''

export function useRefComposer<T>() {
  const ref = useRef<T | null>(null)
  const prevRefs = useRef<Ref<T>[]>()

  const cb = useCallback((val: T | null) => {
    ref.current = val
    prevRefs.current!.forEach(ref => updateRef(ref, val))
  }, [])

  return useCallback((...refs: Ref<T>[]) => {
    if (prevRefs.current) {
      if (prevRefs.current.length !== refs.length) {
        throw new Error(`args length mismatch: old length: ${prevRefs.current.length}, new length: ${refs.length}`)
      }

      for (let i = 0; i < refs.length; i++) {
        const oldRef = prevRefs.current[i]
        if (oldRef !== refs[i]) {
          updateRef(oldRef, null)
        }
      }

      for (let i = 0; i < refs.length; i++) {
        const oldRef = prevRefs.current[i]
        const newRef = refs[i]
        if (oldRef !== newRef) {
          prevRefs.current[i] = newRef
          updateRef(newRef, ref.current)
        }
      }
    }

    prevRefs.current = refs
    return cb
  }, [cb])
}

export function createRefComposer<T>() {
  let ref: T | null = null
  let prevRefs: Ref<T>[]

  const cb = (val: T | null) => {
    ref = val
    prevRefs.forEach(ref => updateRef(ref, val))
  }

  return (...refs: Ref<T>[]) => {
    if (prevRefs) {
      if (prevRefs.length !== refs.length) {
        throw new Error(`args length mismatch: old length: ${prevRefs.length}, new length: ${refs.length}`)
      }

      for (let i = 0; i < refs.length; i++) {
        const oldRef = prevRefs[i]
        if (oldRef !== refs[i]) {
          updateRef(oldRef, null)
        }
      }

      for (let i = 0; i < refs.length; i++) {
        const oldRef = prevRefs[i]
        const newRef = refs[i]
        if (oldRef !== newRef) {
          prevRefs[i] = newRef
          updateRef(newRef, ref)
        }
      }
    }

    prevRefs = refs
    return cb
  }
}

function updateRef<T>(ref: Ref<T>, value: T | null) {
  if (!ref) { return }

  if (typeof ref === 'function') {
    ref(value)
  } else if ('current' in ref) {
    (ref as React.MutableRefObject<T | null>).current = value
  } else {
    throw new Error('First argument should be a React ref or a falsy value.')
  }
}
