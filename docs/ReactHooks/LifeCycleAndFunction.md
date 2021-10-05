# 如何正确的理解函数组件的生命周期

从Class组件切换到函数组件的思考方式是需要一个过程的。Class组件定义了各种的生命周期函数，它定义了组件在每个阶段会进行的动作。而函数组件则更加纯粹和自然一些。我们所需要关注的只是变量的改变即可。所以这里就需要引出一个问题，我们应该如何从Class组件切换到函数组件的思考方式呢？

## 忘掉Class组件的声明周期

Class组件现在仍然大量存在，这有两点原因：

- 一是 React 团队尽最大努力保持 API 的稳定，不希望给你造成一种 Class 组件将被废弃的感觉。
- 二是大量的存量应用其实还都是用 Class 组件实现的，无论是对于维护者还是加入者来说，了解 Class 组件都是很有必要的。

但是函数组件和Class组件的开发方式是有很大的不同的。如果是从Class组件切换到Hooks的方式，最重要的就是忘掉Class组件中的生命周期的概念，不要将原有的Class组件的开发习惯映射到函数组件中。

为理解函数组件的执行过程，不妨思考一下React的本质：**Model到View的映射。**假设状态永远不变，那么函数组件实际上是相当一个模板引擎，只执行一次。但是React本身就是为了动态的状态变化而设计的。而引起变化的原因基本上只有两个：

1.用户操作产生的事件。比如点击了某个按钮。

2.副作用产生的事件，比如发起某个请求正确返回了。

这两个事件本身不会导致组件的重新渲染。但是我们在这两个事件处理函数中，一定是因为改变了某个状态，这个状态可能是State或者Context，从而导致了UI的重新渲染。

对于第一种情况，其实函数组件和 Class 组件的思路几乎完全一样：通过事件处理函数来改变某个状态。对于第二种情况，在函数组件中则是通过useEffect这个Hooks更加直观和语义化的方式来进行描述。对应到Class组件，则是通过手动判断Props或者State的变化来执行的。

比如如下两段代码，Class组件和函数组件的实现方式是不同的。

Class组件：
```js

class BlogView extends React.Component {
  // ...
  componentDidMount() {
    // 组件第一次加载时去获取 Blog 数据
    fetchBlog(this.props.id);
  }
  componentDidUpdate(prevProps) {
    if (prevProps.id !== this.props.id) {
      // 当 Blog 的 id 发生变化时去获取博客文章
      fetchBlog(this.props.id);
    }
  }
  // ...
}
```
函数组件：
```js

function BlogView({ id }) {
  useEffect(() => {
    // 当 id 变化时重新获取博客文章
    fetchBlog(id);
  }, [id]); // 定义了依赖项 id
}
```

可以看到，在函数组件中需要思考的方式永远是：当某个状态发生变化的时候，我要做什么。而不是在某个生命周期里面我要做什么。也就是，我们只需要观察状态的改变本身，整理和观察哪些操作会引起状态的变化就可以了。

## 重新思考组件的生命周期

在传统的类组件中，有专门定义的生命周期方法用于执行不同的逻辑，那么它们在函数组件的存在的形式又是什么样的呢？

### 构造函数

在类组件中有一个方法叫constructor，在里面我们会做一些初始化的事情，比如设置State的初始状态，或者定义一些类的实例成员。

而现在，函数组件只是一个函数，那么也就没有构造函数的说法了。

那么在函数组件中，我们应该如何去做一些初始化的事情呢？答案是：函数组件基本没有统一的初始化需要，因为Hooks会负责自己的初始化。比如 useState 这个 Hook，接收的参数就是定义的 State 初始值。而在过去的类组件中，你通常需要在构造函数中直接设置 this.state ，也就是设置某个值来完成初始化。

但是要注意了，我提到的“基本上没有初始化需要”，也就是并不是完全没有。严格来说，虽然需求不多，但类组件中构造函数能做的不只是初始化 State，还可能有其它的逻辑。那么如果一定要在函数组件中实现构造函数应该怎么做呢？

那么我们就需要看构造函数的本质是什么了，需要干的是啥，其实就是：在所有其它代码执行之前的一次性初始化工作。那么目标就变得很明确了：**就是一次性的代码执行。**

虽然没有直接的机制能直接做到这一点，但是可以借助useRef这一个钩子，实现一个useSingleton这样一次性执行某段代码的自定义Hook(其实这个在react-use这个库也有类似实现，具体可以参考useFirstMountState这个方法，方式可能不太一样，但是能达到例子中需要实现的效果，可以自行发挥脑洞思考)。代码如下：
```js

import { useRef } from 'react';

// 创建一个自定义 Hook 用于执行一次性代码
function useSingleton(callback) {
  // 用一个 called ref 标记 callback 是否执行过
  const called = useRef(false);
  // 如果已经执行过，则直接返回
  if (called.current) return;
  // 第一次调用时直接执行
  callBack();
  // 设置标记为已执行过
  called.current = true;
}
```

使用这个自定义Hook:

```js

import useSingleton from './useSingleton';

const MyComp = () => {
  // 使用自定义 Hook
  useSingleton(() => {
    console.log('这段代码只执行一次');
  });

  return (
    <div>My Component</div>
  );
};
```

可以看出，这个Hook的核心逻辑就是定义只执行一次的代码。而是否在所有代码之前执行，则取决于在哪里调用。可以说，它的功能其实是包含了构造函数的功能的。

所以在日常开发中，无需将功能映射到传统的生命周期的构造函数的概念。而是从函数的角度出发，思考功能如何实现。

### 三种常用的生命周期方法

在类组件中，componentDidMount，componentWillUnmount，componentDidUpdate这三个生命周期方法可以说是开发最常用到的。而在函数组件中，useEffect基本等价于是三个生命周期方法的集合。

下面的代码展示了这个的用法：

```js
useEffect(() => {
  // componentDidMount + componentDidUpdate
  console.log('这里基本等价于 componentDidMount + componentDidUpdate');
  return () => {
    // componentWillUnmount
    console.log('这里基本等价于 componentWillUnmount');
  }
}, [deps])
```

之所以说是基本等价于而没有说是完全等价，有两个原因：

1.useEffect这个Hook接收的callback，只有在依赖项变化的时候才会执行。而Class组件中的componentDidUpdate中则是一定会执行的。这样看来其实Hooks的机制更具有语义化一些，因为过去在componentDidUpdate中，我们通常需要判断某个状态是否发生变化，然后才执行对应的逻辑。

2.callback返回的函数在下一次依赖项发生变化、组件销毁的时候执行（实际上是一个加强），而传统的componentWillUnmount只会在组件销毁的时候执行。

第2点相对来说比较难理解，通过下面的例子可以进行进一步的佐证。

```js

import React, { useEffect } from 'react';
import comments from './comments';

function BlogView({ id }) {
  const handleCommentsChange = useCallback(() => {
    // 处理评论变化的通知
  }, []);
  useEffect(() => {
    // 获取博客内容
    fetchBlog(id);
    // 监听指定 id 的博客文章的评论变化通知
    const listener = comments.addListener(id, handleCommentsChange);
    
    return () => {
      // 当 id 发生变化时，移除之前的监听
      comments.removeListener(listener);
    };
  }, [id, handleCommentsChange])
}
```

可以比较清楚的看到，useEffect接收的返回值是一个回调函数，这个回调函数不仅在组件销毁的时候执行，而是在Effect重新执行前，都会执行，它用来清除上一次Effect的执行结果。

理解这一点很重要，useEffect返回的回调函数，只是清理当前执行的Effect本身。这其实是更加语义化的，因此不必将其映射到componentWillUnmount。只需要记住它的作用就是清理上一次Effect的结果就行。

## 其它的生命周期方法

刚才列举了几个 Class 组件中最为常用的生命周期方法，并介绍了对于同样的需求，在函数组件中应该如何去用 Hooks 的机制重新思考它们的实现。这已经能覆盖绝大多数的应用场景了。

但是 Class 组件中还有其它一些比较少用的方法，比如 getSnapshotBeforeUpdate, componentDidCatch, getDerivedStateFromError。比较遗憾的是目前 Hooks 还没法实现这些功能。因此如果必须用到，你的组件仍然需要用类组件去实现。

## 已有项目是否应该迁移到Hooks？

答案是完全没必要。

有如下两方面原因：

1.类组件和函数组件可以互相引用。

2.Hooks 很容易就能转换成高阶组件，并供类组件使用。