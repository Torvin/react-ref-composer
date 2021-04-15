import { render } from '@testing-library/react'
import React from 'react'
import { useRefComposer } from '../src'

it("doesn't call unchanged ref", () => {
  const ref1 = makeCountingRef()
  const ref2 = makeCountingRef()
  const ref3 = makeCountingRef()

  const res = render(<Test ref1={ref1} ref2={ref2} />)
  res.rerender(<Test ref1={ref1} ref2={ref3} />)
  const div = res.container.firstChild

  expect(ref1.getValues()).toEqual([div])
  expect(ref2.getValues()).toEqual([div, null])
  expect(ref3.getValues()).toEqual([div])

  res.unmount()
})

function Test({ ref1, ref2 }: { ref1: React.Ref<HTMLDivElement>, ref2: React.Ref<HTMLDivElement> }) {
  const ref = useRefComposer()
  return <div ref={ref(ref1, ref2)} />
}

function makeCountingRef() {
  const values: Array<HTMLDivElement | null> = []
  const ref = (arg: HTMLDivElement | null) => {
    values.push(arg)
  }

  return Object.assign(ref, {
    getValues() {
      return values
    },
  })
}
