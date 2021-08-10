# Hooks简介和基本Hooks使用

## Why we need Hooks?

### Class VS Function
之前我们使用React时，是使用Class作为组件的载体的。但是使用Class组件是有点牵强的。原因如下： 
- 基本没有用到继承的特性。
- 没有用到类的实例。不会去new一个组件的实例出来。

而之前我们用的函数组件，虽然能够直观的展示UI内容，但是有一个问题。函数内部无法保存内部状态，必须是纯函数才可以。所以这就限制了函数组件的使用。

### 所以我们需要是什么？

是一个根据状态变化的函数组件。然而函数与对象不同，并没有一个实例的对象能够在多次执行之间保存状态，势必需要一个额外的空间来存储状态，观察的变化，并能触发状态的重新渲染。再进一步思考，我们是不是需要的就是这样的一个机制，能够将外部的数据绑定在函数上，当这个绑定的数据发生变化的时候，函数触发重新渲染机制即可呢？那么这个机制就是Hooks。

### Hooks的定义

在React中，Hooks是把某个目标结果钩到某个可能会变化的数据源或者事件源上，那么当被钩到的数据或事件发生变化时，产生这个目标结果的代码会重新执行，产生更新后的结果。

### Hooks的好处

- 逻辑复用
  由于Hooks关注的只是变量的变化带来的影响，所以我们可以把原来Class组件内部相同逻辑的代码整合到一起，形成一个Hooks即可。当观测到改变时，重新渲染页面。这种机制，简洁直观，不会产生额外的组件节点。
- 有助于关注分离
  在原有的Class方法中，我们有时不得不把组件的生命周期填充相同的逻辑代码。而在Hooks中，我们可以认为它是三个生命周期的结合，只需要关注变量的改变本身即可。完整的体现了React的思想，从state到view，更简单直接。

### 从类组件如何过渡到Hooks组件？
  如果使用过类组件的话，那么我们要做的就是彻底忘掉生命周期，直接考虑在Hooks中实现即可。无需关心哪一种写法对应哪一个生命周期，只需要关注变量本身即可。

## 两个基本Hooks：useState和useEffect
### useState: 让函数具有维持状态的能力
  state是React中的一个核心机制。useState这个Hook就是用来管理state的（其实和类组件里面的this.state是一样的，只是换一种写法而已）。它可以使得函数组件具有维持状态的能力。每一次重新渲染之间，这个状态是共享的。
  下面是一个使用useState组件的例子：
  ```js
  import React, { useState } from 'react';

  function Example() {
    // 创建一个保存 count 的 state，并给初始值 0
    const [count, setCount] = useState(0);

    return (
      <div>
        <p>{count}</p>
        <button onClick={() => setCount(count + 1)}>
          +
        </button>
      </div>
    );
  }
  ```
  从中可以看出的用法如下：
  - useState(initialState)中的值是创建state的初始值，它可以是任意值，任意类型。
  - useState()的返回值是有两个元素的数组，一个是变量本身，另一个是设置变量的方法。注意变量本身是只读的，只能用设置变量的方法来改变变量，直接给变量赋值的操作是非法的。
  - 如果需要创建多个state，则需要多次调用useState来进行创建。

  useState和类组件中this.state的异同
  - 类组件中的this.state只能有一个，即类内唯一的状态管理对象，通过多个键值对来进行状态的设置。而useState可以设置多个，每一个数组都对应着一个状态和设置状态的方法。
  - useState相对于类组件中的this.state语义化更强，代码更加容易理解。

  state创建需要遵循的原则：**永远不要保存可以通过计算得到的值**，换句话说，如果这个值能直接取到，或者通过方法能够处理，且不需要维持状态，那么就没必要创建state。

  state也有自己的弊端，即**一旦组件有自己状态，意味着组件如果重新创建，就需要有恢复状态的过程，这通常会让组件变得更复杂**，比如一个组件想在服务器端请求获取一个用户列表并显示，如果把读取到的数据放到本地的 state 里，那么每个用到这个组件的地方，就都需要重新获取一遍。（组件创建的时候，都会默认使用初始值，而不会保存之前的状态值。如果需要保存之前的状态值的话，需要用到store等机制来进行处理）

### useEffect: 执行副作用

  useEffect用来执行一段副作用，so，副作用？这是个啥玩意儿？通常来说，副作用是指**一段和当前执行结果无关的的代码。**即在函数组件当次的渲染过程中，useEffect中的代码执行是不影响渲染出来的UI的（不影响UI本身的渲染，例如DOM元素、组件等，但可以使得其中的数据变化）。

  useEffect接收两个参数，函数签名如下：
  ```js
    useEffect(callback,dependencies)
  ```
  - 第一个参数callback为要执行的函数，第二个参数dependencies是依赖项数组。这个选项是可选的。
  - 如果不指定dependencies，那么callback就会在每一次函数组件执行完后都执行
  - 如果指定dependencies，那么只有依赖项中的值发生变化的时候，它才会执行。
  - 当指定dependencies时，基本类型无需注意什么。但引用类型需要注意，hooks中的比较是浅比较，一定要注意多层级的情况下，确定数组需要比较的dependencies数组中指定的变量的地址发生了变化，否则并不会应用该副作用。

  虽然说useEffect从使用上可以类比Class组件中的ComponentDidMount、ComponentDidUpdate和ComponentWillUnmount三个声明周期方法。但是建议彻底遗忘Class的声明周期，因为这个的使用和Hooks毫无关联，甚至会干扰到对Hooks本身的理解。所以只需要记住一点即可：**useEffect是每次组件render完后判断依赖是否发生变化并执行即可。**

  下面有一个比较好的示例：

  ```js
  import React, { useState, useEffect } from "react";
  function BlogView({ id }) {
    // 设置一个本地 state 用于保存 blog 内容
    const [blogContent, setBlogContent] = useState(null);

    useEffect(() => {
      // useEffect 的 callback 要避免直接的 async 函数，需要封装一下
      const doAsync = async () => {
        // 当 id 发生变化时，将当前内容清楚以保持一致性
        setBlogContent(null);
        // 发起请求获取数据
        const res = await fetch(`/blog-content/${id}`);
        // 将获取的数据放入 state
        setBlogContent(await res.text());
      };
      doAsync();
    }, [id]); // 使用 id 作为依赖项，变化时则执行副作用

    // 如果没有 blogContent 则认为是在 loading 状态
    const isLoading = !blogContent;
    return <div>{isLoading ? "Loading..." : blogContent}</div>;
  }
  ```

  useEffect还有两个特殊的用法：
  - 没有依赖项。则每一次render后都会重新执行，上面已经提过此用法。
  - 空数组作为依赖项，则只在首次执行时触发。对应到Class组件就是ComponentDidMount。

  此外，useEffect还**允许返回一个函数，用于在组件销毁的时候做一些清理的动作**。这个机制就几乎等价于类组件的componentWillUnmount。

### 理解Hooks中的依赖

  定义Hooks中的依赖项时需要注意的点：
  - 依赖项中定义的变量是一定在回调函数中用到的，否则声明依赖项是没有意义的。
  - 依赖项一般是一个常量数组，而不是一个变量。因为一般在创建callback的时候，其实已经非常清除需要用到哪些依赖项。
  - React会使用浅比较来对比依赖项是否发生变化。所以需要特别注意数组和对象类型。如果是每次创建一个新对象，即使和之前的值是等价的（着重要关注地址是否相等，而不是只关注值，引用类型尤其需要注意这一点，切记！)，也会认为是依赖项发生了变化。这是一个刚开始使用Hooks很容易导致Bug发生的地方。
  
  下面有请我们的错误示例：
  ```js
    function Sample() {
      // 这里在每次组件执行时创建了一个新数组
      const todos = [{ text: 'Learn hooks.'}];
      useEffect(() => {
        console.log('Todos changed.'); // 会不断输出这行内容
      }, [todos]);
    }
  ```

### 掌握Hooks的使用规则

  - 只能在函数组件的顶级作用域使用
  - 只能在函数组件或其他Hooks中使用

  如何理解顶级作用域？

  所谓顶级作用域，就是Hooks不能在循环、条件判断或者嵌套函数内执行，而必须是在顶层。同时Hooks在组件的多次渲染之间，必须按照顺序被执行。（Hooks内部其实维护了一个对应组件的执行列表，便于在多次渲染之间保持Hooks的状态，并对比）。

  这条规律可以总结如下：①所有Hooks必须执行到。②必须按顺序执行。

  如何理解只能在函数组件或其他Hooks中使用？

  Hooks 作为专门为函数组件设计的机制，使用的情况只有两种，一种是在函数组件内，另外一种则是在自定义的 Hooks 里面。可以将Hooks封装成高阶组件，从而让类组件调用。这个是Hooks组件和类组件能互通的机制之一。