# 拓展Hooks

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

下面就需要请出主角，useCallback，这个函数的API签名如下：

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

## useMemo 缓存计算的结果

useMemo的API签名如下：

```js

useMemo(fn, deps)

```

这里的fn是产生数据所需的一个计算函数（可以类比vue中的computed）。通常来说fn会使用deps中声明的一个变量来生成一个结果，从而渲染出最终的UI。

即：**如果某个数据是通过其它数据计算得到的，那么只有当用到的数据，也就是依赖的数据发生变化的时候，才应该需要重新计算**

这里还是直接上代码：

```js
import React, { useState, useEffect } from "react";

export default function SearchUserList() {
  const [users, setUsers] = useState(null);
  const [searchKey, setSearchKey] = useState("");

  useEffect(() => {
    const doFetch = async () => {
      // 组件首次加载时发请求获取用户数据
      const res = await fetch("https://reqres.in/api/users/");
      setUsers(await res.json());
    };
    doFetch();
  }, []);
  let usersToShow = null;

  if (users) {
    // 无论组件为何刷新，这里一定会对数组做一次过滤的操作，会有重复的计算
    // 因为没有之前的数据作比较，这里必然是会走的
    usersToShow = users.data.filter((user) =>
      user.first_name.includes(searchKey),
    );
  }

  return (
    <div>
      <input
        type="text"
        value={searchKey}
        onChange={(evt) => setSearchKey(evt.target.value)}
      />
      <ul>
        {usersToShow &&
          usersToShow.length > 0 &&
          usersToShow.map((user) => {
            return <li key={user.id}>{user.first_name}</li>;
          })}
      </ul>
    </div>
  );
}
```

这里模拟了一个检索的功能，根据文本框的输入来搜索列表的信息。但是由于我们判断的只是user的列表是否为空，所以每次都会进行重复的计算，userToShow这个值都会重新被赋值，发生改变。然而我们并不想这样，我们期待的只是当user和searchKey发生改变的时候，才触发这个值的变化。不想要那么多无用的计算，浪费性能。所以这里就可以用到useMemo这个Hook来实现这个逻辑，将usersToShow可以改造成下面的方式：

```js
const userToShow = useMemo(() => {
  if(!users) return null;
  return users.data.filter((user) =>
    user.first_name.includes(searchKey),
  );
},[users, searchKey]) // 当users和searchKey发生改变的时候，才进行重新计算，否则不会重新计算
```

useMemo还有一个重要的功能：**避免子组件的重复渲染。** 还是拿上面的例子进行举例，如果页面的很多地方都要用到userToShow这个变量的话，每当userToShow变化，就会进行重新渲染。而当我们使用了useMemo，缓存了上一次的结果，避免了userToShow的不必要的变化，就可以避免很多不必要的组件刷新，从而提升了性能。

如果我们这个时候把useMemo和useCallback结合来看，useMemo是可以实现useCallback的功能的。（即useMemo可以缓存一个函数，从而实现了useCallback的功能），拿下面的例子来进行举例：
```js
 const myEventHandler = useMemo(() => {
   // 返回一个函数作为缓存结果
   return () => {
     // 在这里进行事件处理
   }
 }, [dep1, dep2]);
 ```
从本质上来说，useCallback和useMemo都做了同一件事：**建立了一个绑定某个结果到依赖数据的关系。只有当依赖变了，这个结果才需要被重新得到。**

## useRef 在多次渲染之间共享数据

函数组件缺少了一种能力，就是多次渲染之间，保存常量（其实也不是常量，就是不受函数控制而已）的能力。即：**可以在多次渲染之间共享数据。** 

在类组件中，我们可以定义类的成员变量，使得我们可以在对象上的成员属性去保存一些数据。然而在函数组件中，我们是没有这样的空间去保存数据的。所以就有useRef这样一个Hooks的产生。（即多次渲染中，不变的数据可以给到这里）

下面是useRef的API签名
```js
const myRefContainer = useRef(initialValue);
```

可以把useRef看作是在函数组件之外创建的一个容器空间。在这个容器上，我们可以通过唯一的一个current属性设置一个值，从而在函数组件的多次渲染共享这个值。（大白话：我这个变量不受函数组件的控制，你函数组件爱咋玩咋玩，我不跟你走，除非你主动改变我这上面的current值）

下面是一个useRef使用的具体例子：

```js

import React, { useState, useCallback, useRef } from "react";

export default function Timer() {
  // 定义 time state 用于保存计时的累积时间
  // 用于界面上的时间的显示，开始计时的时候会同步展示
  const [time, setTime] = useState(0);

  // 定义 timer 这样一个容器用于在跨组件渲染之间保存一个变量
  // 其实是保存函数返回的id值，从而便于clearTimeout进行清除
  // 并不需要频繁变化，只需要开始的时候存一下就好了，所以用一个不受控的useRef来存就好。
  const timer = useRef(null);

  // 开始计时的事件处理函数
  const handleStart = useCallback(() => {
    // 使用 current 属性设置 ref 的值
    // 只有每次开始的时候记录就好，记录id值就可以
    timer.current = window.setInterval(() => {
      setTime((time) => time + 1);
    }, 100);
  }, []);

  // 暂停计时的事件处理函数
  const handlePause = useCallback(() => {
    // 使用 clearInterval 来停止计时
    // 因为clear事件的参数是需要清空的id值，需要完全对应，这个时候去取timer.current就可以
    window.clearInterval(timer.current);
    timer.current = null;
  }, []);

  return (
    <div>
      {time / 10} seconds.
      <br />
      <button onClick={handleStart}>Start</button>
      <button onClick={handlePause}>Pause</button>
    </div>
  );
}
```

同时，使用useRef保存的数据是与UI渲染无关的，所以当ref的值发生变化的时候，不会触发组件的重新渲染（前面提到的非受控就是如此，不受函数的控制，比较自由），这个也是useRef区别于useState的地方。

除了存储跨渲染的数据之外，useRef还有一个重要的功能，就是**保存某个DOM节点的引用。** 当我们需要对DOM进行操作的时候就可以使用useRef这个Hook。（这个用法和类组件中的createRef相似） 

```js

function TextInputWithFocusButton() {
  const inputEl = useRef(null);
  const onButtonClick = () => {
    // current 属性指向了真实的 input 这个 DOM 节点，从而可以调用 focus 方法
    inputEl.current.focus();
  };
  return (
    <>
      <input ref={inputEl} type="text" />
      <button onClick={onButtonClick}>Focus the input</button>
    </>
  );
}
```

这段代码是 React 官方文档提供的一个例子，可以看到 ref 这个属性提供了获得 DOM 节点的能力，并利用 useRef 保存了这个节点的应用。这样的话，一旦 input 节点被渲染到界面上，那我们通过 inputEl.current 就能访问到真实的 DOM 节点的实例了。

## useContext 定义全局状态

用于跨层次或者同层级组件之间进行数据的共享，即全局状态管理。

React提供一个Context机制，这样所有从这个组件衍生出来的组件，都能访问到这个Context，从而进行访问和修改这个Context。那么在函数组件里，我们就可以使用useContext这样一个Hook来管理Context。

useContext函数原型如下：

```js
const value = useContext(MyContext); // MyContext为创建的Context，作为公用的上下文信息，在子组件中可以取得这个值
```

而我们创建Context的API是这样用的：

```js
const MyContext = React.createContext(initialValue); //这样我们创建了一个上下文信息。可以通过导入的方式来引用同一个信息，从而进行值的修改
```

创建出来的这个MyContext是有一个Provider属性的，可以有一个value值，应用到它所管控的所有上下文中，这样我们useContext获取到的，就是这个value的值。比如下面的这个例子。
```js
const themes = {
  light: {
    foreground: "#000000",
    background: "#eeeeee"
  },
  dark: {
    foreground: "#ffffff",
    background: "#222222"
  }
};
// 创建一个 Theme 的 Context，其实如果是多文件的情况，可以对它单独进行文件管理进行导出。默认的主题是浅色。
const ThemeContext = React.createContext(themes.light);
function App() {
  // 整个应用使用 ThemeContext.Provider 作为根组件
  return (
    // 使用 themes.dark 作为当前 Context，它下面所管控的所有的组件如果用到了这个上下文，都会进行变化。
    // 在这个例子里面，只有Toolbar
    <ThemeContext.Provider value={themes.dark}>
      <Toolbar />
    </ThemeContext.Provider>
  );
}

// 在 Toolbar 组件中使用一个会使用 Theme 的 Button
function Toolbar(props) {
  return (
    <div>
      <ThemedButton />
    </div>
  );
}

// 在 Theme Button 中使用 useContext 来获取当前的主题
function ThemedButton() {
  const theme = useContext(ThemeContext); // 在这里拿到了这个上下文，也就是我们在外面传递的深色。
  return (
    <button style={{
      background: theme.background,
      color: theme.foreground
    }}>
      I am styled by theme context!
    </button>
  );
}
```

这里当Context发生变化的时候，它下面的数据都会自动刷新，重新进行渲染。这也是为什么React设计如此复杂的机制的问题，而不是简单的用一个全局变量的原因了。

当我们想对主题色进行动态切换，如果我们清楚这个原理，那么思路也就变得比较简单，只需要动态改变创建的上下文的value值即可。那么下面的例子就是一个实现。
```js
// ...
function App() {
  // 使用 state 来保存 theme 从而可以动态修改
  const [theme, setTheme] = useState("light");

  // 切换 theme 的回调函数
  const toggleTheme = useCallback(() => {
    setTheme((theme) => (theme === "light" ? "dark" : "light"));
  }, []);

  return (
    // 使用 theme state 作为当前 Context
    <ThemeContext.Provider value={themes[theme]}>
      <button onClick={toggleTheme}>Toggle Theme</button>
      <Toolbar />
    </ThemeContext.Provider>
  );
}
```

全局变量是一把双刃剑，它可以方便在组件间共享数据，但也有如下缺点：
 - 会让调试变得困难，因为你很难跟踪某个 Context 的变化究竟是如何产生的。
 - 让组件的复用变得困难，因为一个组件如果使用了某个 Context，它就必须确保被用到的地方一定有这个 Context 的 Provider 在其父组件的路径上。

所以在 React 的开发中，除了像 Theme、Language 等一目了然的需要全局设置的变量外，我们很少会使用 Context 来做太多数据的共享。需要再三强调的是，Context 更多的是提供了一个强大的机制，**让 React 应用具备定义全局的响应式数据的能力。** 

## useReducer 以动作来控制状态

注：这部分内容来自于React官方文档。

useReducer是useState的替代方案。它比useState的好处在于，当state的逻辑较为复杂且包含多个子值或者下一个state依赖于之前的state时，它的适用度要比useState更广。它接收一个形如 (state, action) => newState 的 reducer，并返回当前的 state 以及与其配套的 dispatch 方法。
useReducer也可以给触发深更新的组件做性能优化。（这个涉及到useContext和useReducer的联用，可以模拟Redux的效果）

个人理解是有点类似于批量操作的意思，这个dispatch的方法，是可以进行批量的状态变更的。如果某个状态是依赖于其它状态的之前的状态，这个也是可以取到的。

下面是官方文档的代码示例：
```js
const initialState = {count: 0};

function reducer(state, action) {
  switch (action.type) {
    case 'increment':
      return {count: state.count + 1};
    case 'decrement':
      return {count: state.count - 1};
    default:
      throw new Error();
  }
}

function Counter() {
  const [state, dispatch] = useReducer(reducer, initialState);
  return (
    <>
      Count: {state.count}
      <button onClick={() => dispatch({type: 'decrement'})}>-</button>
      <button onClick={() => dispatch({type: 'increment'})}>+</button>
    </>
  );
}
```

注：dispatch的标识是稳定的，可以在useEffect和useCallback等需要依赖的地方省略它。

### 指定初始化state

我们也可以使用useReducer来初始化state的值。初始化值的方式有两种。将初始 state 作为第二个参数传入 useReducer 是最简单的方法。

```js
 const [state, dispatch] = useReducer(
    reducer,
    {count: initialCount}
  );
```

- 惰性初始化

需要将初始化的函数作为第三个参数传入，作为一个初始化的状态创建函数。


```js
// 初始化的状态创建函数，当页面加载的时候，会从这里传入值
function init(initialCount) {
  return {count: initialCount};
}

// 管理了需要执行的动作，即action
function reducer(state, action) {
  switch (action.type) {
    case 'increment':
      return {count: state.count + 1};
    case 'decrement':
      return {count: state.count - 1};
    case 'reset':
      return init(action.payload);
    default:
      throw new Error();
  }
}

function Counter({initialCount}) {
  const [state, dispatch] = useReducer(reducer, initialCount, init);
  // dispatch的原型就是这样的，传入一个action，action中包含的是动作的类型（type），和需要设置的值（payload）
  // 下面的reset实际上调用了init方法，reducer和dispatch是关联的，reducer负责action的管理，dispatch负责action的发出
  return (
    <>
      Count: {state.count}
      <button
        onClick={() => dispatch({type: 'reset', payload: initialCount})}>
        Reset
      </button>
      <button onClick={() => dispatch({type: 'decrement'})}>-</button>
      <button onClick={() => dispatch({type: 'increment'})}>+</button>
    </>
  );
}
```

- 跳过dispatch

如果 Reducer Hook 的返回值与当前 state 相同，React 将跳过子组件的渲染及副作用的执行。（React 使用 Object.is 比较算法 来比较 state。）

需要注意的是，React 可能仍需要在跳过渲染前再次渲染该组件。不过由于 React 不会对组件树的“深层”节点进行不必要的渲染，所以大可不必担心。

