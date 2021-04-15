# react-ref-composer

This package provides a simple of combining several [React refs](https://reactjs.org/docs/refs-and-the-dom.html) into a single ref that can passed to a single component or DOM node. See [React issue #13029](https://github.com/facebook/react/issues/13029) for more details.

This is most useful when you want to keep a ref to a node inside your component and also forward it outside using [`React.forwardRef`](https://reactjs.org/docs/forwarding-refs.html) or pass to a library such as [`react-beautiful-dnd`](https://github.com/atlassian/react-beautiful-dnd).

Both React hooks and class components are supported.

## Hooks

`useRefComposer` is a hook for composing refs. Usage example:

```jsx
import { useRefComposer } from 'react-ref-composer'

export const MyComponent = React.forwardRef((props, outerRef) => {
  const innerRef = useRef()
  const composeRefs = useRefComposer()

  return <div ref={composeRefs(innerRef, outerRef)}>test</div>
})
```

Here `composeRef` is a function that you can call with any number of refs. Both object refs and callback refs are supported. The function returns a single "combined" callback ref.

Make sure to always call `composeRef` with the same number of arguments. In cases when conditional passing of a ref is required you can pass any falsy (`undefined`, `null`, `0`, `""` or `false`) value instead to temporary "turn off" the ref, e.g.:
```jsx
... ref={composeRefs(ref1, a && b && ref2)}
```

## Class components

Class components work very similarly, just use `createRefComposer` instead:

```js
import { createRefComposer } from 'react-ref-composer'

export class MyComponent {
  constructor(props) {
    super(props)
    this.composeRefs = createRefComposer()
  }

  render() {
    return <div ref={this.composeRefs(ref1, ref2, ......)}>test</div>
  }
}
```

Same rules for `composeRef` as above apply.

## Why another library?

Why create another library? The main problem with existing libraries, including [`compose-react-refs`](https://github.com/seznam/compose-react-refs), is that none of them handle changing only one of the passed refs correctly. Case in point:

```jsx
function MyComponent(){
  const composeRefs = useRefComposer()
  const ref1 = useCallback(div => console.log('ref1', div), [])
  const ref2 = useCallback(div => console.log('ref2', div), [])
  const ref3 = useCallback(div => console.log('ref3', div), [])
  const [flag, setFlag] = useState(true)

  function onSwitch() {
    console.log('switching')
    setFlag(f => !f)
  }

  return <div ref={composeRefs(ref1, flag ? ref2 : ref3)}>
    <button onClick={onSwitch}>Switch refs</button>
  </div>
}
```

This is what the expected output looks like when the user clicks the button:
```jsx
ref1 <div>
ref2 <div>
switching
ref2 null
ref3 <div>
```

So the old ref resets to `null` and the new ref is set to the DOM node as expected.

However with `compose-react-refs` and other similar libraries this happens:

```jsx
ref1 <div>
ref2 <div>
switching
ref1 null
ref2 null
ref1 <div>
ref3 <div>
```

Essentially `ref1` goes through reset/set cycle. This will trick the consumer of that ref into thinking that the component got unmounted and remounted again, which can be harmful in some cases (e.g. during drag-and-drop operation) and cause undesired behaviour.
