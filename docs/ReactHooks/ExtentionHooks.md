# 拓展hooks

## useCallback 缓存回调函数

### 普通的Hooks方式存在的问题

在React函数组件中，每一次的UI变化，都是通过重新执行整个函数来完成，这个和传统的Class函数有很大的区别。函数组件中并没有一个直接的方式在多次渲染之间维持一个状态。

还是上代码，通过代码能够看出来问题的所在：

```js
function Counter() {
  const [count, setCount] = useState(0);
  const handleIncrement = () => setCount(count + 1);
  // ...
  return <button onClick={handleIncrement}>+</button>
}
```

在这个例子中，实际上，组件状态每次发生变化的时候，函数组件都会重新执行一次。然后在每一次执行的过程中，handleIncrement这个函数都会重新创建并执行。这就意味着，即使count本身没有变化，也会因为其他的状态(state)发生变化而重新渲染（跟着props来走，props整个发生了变化就会触发），每次也都会重新创建这个函数。这样的执行，虽然不影响结果的正确性，但是这是没有必要的，增加了系统的开销。更重要的是：**每次创建新函数的方式会让接收事件处理函数的组件，需要重新渲染。**

### 需要达成的目标及解决方法

对于上面的例子来说，我们需要达成的目标就是：**只有当count发生变化的时候，我们才需要定义一个回调函数**，缓存这个函数从而不必要每次创建。这样就提升了性能。

下面就需要请出主角，useCallback，这个函数的api签名如下：

```js
useCallback(fn,deps)
```

那么上面的例子，我们需要观测，只有count变化的时候，才执行setCount的变化。可以这样改造我们的方法：

```js
function Counter() {
  const [count,setCount] = useState(0);
  const handleIncrement = () => useCallback(() => {
    setCount(count + 1)
  }, [count]); // 只有count发生变化的时候，才会重新创建回调函数
  return <button onClick={handleIncrement}>+</button>
}
```

在这里，我们把 count 这个 state ，作为一个依赖传递给 useCallback。这样，只有 count 发生变化的时候，才需要重新创建一个回调函数，这样就保证了组件不会创建重复的回调函数。而接收这个回调函数作为属性的组件，也不会频繁地需要重新渲染。