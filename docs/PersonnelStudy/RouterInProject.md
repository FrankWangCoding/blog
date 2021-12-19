

# 从项目切入，浅谈react-router的使用及HashRouter的内部机制

## 为何想写这篇博文？

在我们组内的开发中，看到我们的现有的路由跳转的方式，很多都是使用window.location.href，历史原因导致很多代码都是这么写的。这种方式对于调试不够友好。（这是由于我们自己公司的工程配置，在线上环境下必须要加前缀，而本地调试的时候又必须要手动去掉前缀。例如我们组的卖家中心项目就是/seller#/，而这样是代理到了代理环境，而不是开发环境本身。）React是有三件套的，React、React-Router、Redux（以及Mobx等为代表的其它状态管理工具）。然而在我们项目中，用React-Router进行路由跳转的方式为之甚少。所以这引发了我的兴趣，便想把这个查清楚一些。

## 对于已有的window.location.href问题要怎么解决？

首先需要声明一个范围（免责声明），只对于同一个项目中由Router管控的页面可以这么跳，其它的不适用React-Router的跳转。

如果有上面的免责声明的限制，那么我们就可以对已有的项目进行如下改造。下面分两种情况进行讨论：

- 如果是类组件，使用WithRouter

withRouter是一个高阶组件，它会把类组件包装成一个高阶组件，在原来的基础上添加react-router的match、history、location三个对象（其实还有staticContext，只有SSR服务端的时候会用到这个属性）到我们的类组件中。这样对于我们层级较深的，没有直接和外层路由相连的组件，我们也可以直接对其进行路由操作。

下面我们举例子来看这个的用法：

1.首先，我们要把withRouter和RouterComponentProps导入进来。

```ts
import { RouteComponentProps, withRouter } from 'react-router-dom';
```

2.其次，我们要改变类组件的声明，需要继承RouteComponentProps。这样ts的类型检测才不会报错，否则后面我们用到props属性的时候，是拿不到history对象的。

```ts

interface IListDemoProps extends RouteComponentProps<void> {
  demoStore: DemoStore;
}

// 这里我们不能直接export出去，因为我们还需要用withRouter进行高阶组件的封装。
@observer
class ListDemo extends React.Component<IListDemoProps> {
  // ....里面是类的方法
}
```

3.再次，**是我们的核心**。将history对象从我们的属性中解构出来，然后使用push方法进行路由的替换。

变更前：
```ts
window.location.href = `/demo-href#/demo-edit?code=${code}&type=${type}`; // demo-href代表线上的前缀名
```

变更后：
```ts
const { history } = this.props;
history.push(`/demo-edit?code=${code}&type=${type}`);
```

4.最后，使用withRouter形成一个高阶组件。

```ts
export default withRouter(ListDemo);
```

注：withRouter的使用范围有两个限制。

​       第一个是类组件，只有在类组件中才能使用。

​       第二个是不直接与主页面的路由相连，才需要用withRouter高阶组件。如果当前的组件由Router直接管控，则直接使用属性上的history对象进行跳转即可，不需要用withRouter添加路由对象进去。

- 如果是Hooks组件，使用useHistory

React在16.8版本后推出了React Hooks，所以我们又多了一种写组件的方法，即Hooks组件。与之对应，我们也要对路由跳转的方法进行变更，所以useHistory横空出世。（注意：只有16.8之后的版本，且组件为Hooks组件才可以使用这个方法）

下面我们来看看useHistory在函数组件中是怎么使用的。

1.首先我们引入useHistory。

```ts
import { useHistory } from 'react-router-dom'
```

2.我们可以在函数组件声明一个对象，用来获取当前的路由。

```ts
// 当前路由，执行这个方法就得到了一个当前路由的实例
const history = useHistory();
```
然后，我们可以看一下这个对象里面有什么。

<img src="https://i.ibb.co/mXRdZjx/history-content.png"/>

3.获取到这个路由对象我们就可以全局来进行使用。如下是两个使用示例，也可以结合hooks来进行使用。

```ts
/**
  * 取消操作
  */
const cancel = () => {
  history.push('/demo/list');
};

/** 保存成功操作 **/
const saveSuccess = () => {
  // 前面还有部分业务代码，不主要，省略 //
  try {
    console.log('保存成功')
    setTimeout(() => {
      history.push('/demo/list');
    }, 2000);
  } catch (err) {
    console.log(error);
  }
}
```

- 如果跳转路由方法写到store里面，我们需要想办法放到组件执行

这里依然有一个历史问题要说明一下，我们的状态管理库用的是Mobx，而且很多的路由跳转都是在Mobx的类中进行的。所以这里就有一个很难解决的问题。我们应该怎样把这个"不正经"的路由切换方式，调整为我们需要的方式呢？对于这个问题，我有以下的两个思路来解决。

1. 将路由的跳转作为回调函数，从而解决此问题。

   比如这里的代码。

   ```tsx
   /** DemoInfo.tsx **/
   import { withRouter, RouteComponentProps } from 'react-router-dom';
   import DemoConfirm from './components/demo-confirm';
   interface IDemoProps extends RouteComponentProps<void> {
     demoStore: DemoStore; // contractManagePageSore
   }
   
   @observer
   class DemoInfo extends React.Component<IDemoProps, {}> {  
     /**
      * 提交页面数据
      */
     submitInfo() {
       const { demoStore } = this.props;
       /** 保存成功时的回调函数，设置并传入到store里面去 */
       const submitSuccessCallback = () => {
         history.push('/contract-manage');
       };
       /** 将回调函数作为参数进行传入，然后我们就可以进行调用 **/ 
       demoStore.submit(submitSuccessCallback);
     }
       
     /** 渲染 **/
     render() {
         return  
         	<DemoConfirm
           	closeModal={() => contractManagePageSore.toggleConfirmLayer()}
           	store={contractManagePageSore}
           	submit={() => this.submitContractManage()}
         	/>
     }
   }
   export default withRouter(ContractorInformation)
   
   /** DemoStore.ts **/ 
   class DemoStore {
     @action
     async submit(callback: () => void) {
         try {
           // 如果调用成功，就走跳转路由的回调函数
           // 这里只是个示例，其实还有其它的处理
           await this.publish();
           callback();
         } catch (err) {
           console.log(error);
         }
     }
   }
   ```
   
2. 将路由跳转的操作（点击、悬浮、失焦等和组件相关的）和数据的组装抽离开来。store中专职处理数据的封装，操作等还是放到组件来进行。

  ```tsx
/** Demo.tsx**/
interface IDemoStore extends RouteComponentProps<void> {
  demoStore: DemoStore;
}

@observer
class Demo extends React.Component<IDemoStore, {}> {
  render() {
    const { demo, history } = this.props;
    /** 取消方法，原来在store中的 */
    const cancel = () => {
      history.push('/demo-list');
    };
    /** 保存方法，原来在store中的 **/
    const save = async () => {
      const param = getParam();
      try {
        const result = await saveInfo(param);
        if (result) {
          console.log('保存成功');
          setTimeout(() => {
            history.push('/demo-list');
          }, 2000);
        }
      } catch (e) {
        console.log('保存失败');
      }
    };
    return (
      <div>
        <Button
          onClick={save}
        >
          保存
        </Button>
        <Button outline onClick={cancel}>
          取消
        </Button>
      </div>
    );
  }
}
export default withRouter(Operation);

/** DemoStore.ts **/
class DemoStore {
  /** 获取保存的参数 * */
  getParam = () => {
    return {
      id: this.shareId,
      shareStartTime: this.startTime?.valueOf() || 0,
      shareEndTime: this.endTime?.valueOf() || 0,
      remark: this.remark || undefined,
    };
  };
}
  ```

   

## 从项目整体切入，看看我们的Router是怎么运作的

### 分析我们项目的目录结构

从我们的项目来看，都用的是哈希路由（即HashRouter)。我们的脚手架创建出来的入口文件app.tsx，差不多是这样的一个结构。

```ts
import { Provider } from 'mobx-react';
import React from 'react';
import ReactDOM from 'react-dom';
import { HashRouter } from 'react-router-dom';
import { renderRoutes } from 'react-router-config';


import routes from './config/route';
import stores from './config/stores';
import './styles/index.scss';

ReactDOM.render(
  <HashRouter>
    <Provider {...stores}>{renderRoutes(routes)}</Provider>
  </HashRouter>,
  document.getElementById('root'),
);
```

这里我们不免对HashRouter的内部构造有一些兴趣，于是我们打开它的内部构造，结果发现了更玄妙的东西。

我们所知道的是，React提供了两种路由的方式，BrowserRouter和HashRouter（表面上看是带哈希符号即#和不带哈希符号的区别），react-router对它们处理方式也会有所不同。

### BrowserRouter && HashRouter

这里简单介绍一下他俩的区分吧：

- BrowserRouter在路径表现上无#，看起来是比较美观的。而HashRouter带#，看起来有点丑。
- BrowserRouter需要服务器渲染支持，不可单独由前端控制渲染。而HashRouter是由前端来进行控制渲染，不可走服务端渲染。二者是相反的。

以下代码只保留了主干部分。这里我们可以看到它们的代码结构几乎一模一样，区别只在于传入的history属性的方法不一样而已。都使用了history这个库，通过传入的history方法来判断是BrowserRouter还是HistoryRouter。

BrowserRouter源码：

```js
import React from "react";
import { Router } from "react-router";
import { createBrowserHistory as createHistory } from "history";

class BrowserRouter extends React.Component {
  history = createHistory(this.props);

  render() {
    return <Router history={this.history} children={this.props.children} />;
  }
}
export default BrowserRouter;
```

HashRouter源码：

```js
import React from "react";
import { Router } from "react-router";
import { createHashHistory as createHistory } from "history";

class HashRouter extends React.Component {
  history = createHistory(this.props);

  render() {
    return <Router history={this.history} children={this.props.children} />;
  }
}

export default HashRouter;
```

我们先看看Router给我们做了什么工作吧。然后我们会以createHashHistory为例，来进行history库的一些解读。

### Router的实现

下面我们先放一波Router源码：

```js
import React from "react";

import HistoryContext from "./HistoryContext.js";
import RouterContext from "./RouterContext.js";

/**
 * Router就是记录路由状态的context，它是一个组件，用于给它下面的子节点提供数据支撑
 */
class Router extends React.Component {
  static computeRootMatch(pathname) {
    return { path: "/", url: "/", params: {}, isExact: pathname === "/" };
  }
  
  constructor(props) {
    super(props);
    this.state = {
      location: props.history.location
    };
    this._isMounted = false; // 设定了加载的状态
    this._pendingLocation = null; // 缓存的路由，当初次加载的时候，会使用这个路由
	  // 这里其实BrowserRouter和HashRouter都走这里，它们都不是静态上下文。
    if (!props.staticContext) {
      this.unlisten = props.history.listen(location => {
        if (this._isMounted) {
          this.setState({ location });
        } else {
          this._pendingLocation = location; 
        }
      });
    }
  }
  
  componentDidMount() {
    this._isMounted = true; 
    if (this._pendingLocation) { 
      this.setState({ location: this._pendingLocation });
    }
  }

  componentWillUnmount() {
    if (this.unlisten) { 
      this.unlisten();
      this._isMounted = false;
      this._pendingLocation = null;
    }
  }

  render() {
    return (
      // Provider主要的功能就是为子组件提供数据支持，以便于子组件进行获取、更改、跳转。
      <RouterContext.Provider
        value={{
          history: this.props.history, // 即外部传入的history属性
          location: this.state.location, // 当前被设置的location
          match: Router.computeRootMatch(this.state.location.pathname), // 提供匹配的默认值，防止找不到匹配的组件，发生错误
          staticContext: this.props.staticContext // 如果是BrowserRouter和HashRouter其实都是null
        }}
      >
        <HistoryContext.Provider
          children={this.props.children || null} // children其实就是需要渲染的内容
          value={this.props.history}
        />
      </RouterContext.Provider>
    );
  }
}

export default Router;
```

下面我们从属性定义、生命周期函数、最终渲染三个维度来进行分析：

- 属性定义：

  - 引入的两个Context（RouterContext、HistoryContext）的作用：给子组件传递上下文，并提供属性给它们。从而子组件就能拿到它们传递的属性。

  - computeRootMatch：这个方法给了一个默认值，用于在匹配不到路由的时候进行默认的显示。

  - 状态：即location。记录的是当前所在的地址。

  - _isMounted：记录是否页面已经加载过路由。是一个标志位。

  - _pendingLocation：缓存的地址。初次加载路由的时候会用到这个值。如果没有加载路由，会将location状态初始化为这个路由。

  - unlisten：解除路由监听方法。是监听方法的返回值。当调用这个方法的时候，会解除对路由的监听。这里为啥unlisten方法是这样的？下面讲history库的时候会有说明，会解答这个问题。

- 生命周期函数

  - constructor：this.unlisten在这里注册了一个监听函数，如果已挂载，则当页面位置(回调函数参数)发生变化的时候，设置location为这个值。否则未挂载的话，就设置缓存的路由值为当前页面位置(回调函数参数)。写在contructor的原因是：子组件如果有Redirect的时候，我们知道，组件的挂载顺序是由子组件到父组件的，那么如果我们不在构造函数里面就进行监听的话，Redirect组件挂载完了，就直接跳转走了，父组件监听不到它的变化。所以这里将监听函数放在contructor里，其实是一种hack的写法，但是却也不得不为之。
  - componentDidMount：组件挂载。这里我们做的工作是，设置挂载状态为true，如果有缓存的路由值，那我们就把状态中的location值更新成这个值。
  - componentWillUnmount：组件卸载。这里我们做的工作是，取消对路由的监听，然后设置挂载状态为false，清空缓存的路由值。

- 最终渲染

  这里的最终渲染无非就是给下面的子组件提供了数据支撑，便于子组件进行获取、更改、跳转。详细的参见注释中的内容。

### 从传入的history对象，初步来分析history库

下面我们来单独说说这个传入的history对象，提到这个对象我们先来说说history这个库。

其实history这个库是相当于在原有的HTML5的history对象基础上，再加了一层封装。它不止适用于react项目中，也可以单独拿出来进行使用。下面我们来看一下这个对象返回给了我们什么内容。先看注释，然后再来详细拆解其中的实现。

```ts
  // 这个history就是它返回的值
  const history = {
    length: globalHistory.length, // 等同于window.history.length
    action: 'POP', // history的动作，枚举值REPLACE、POP、PUSH
    location: initialLocation, // 当前所在的路径对象，属性有:pathname、search、hash、state
    createHref, // 是一个创建哈希路径的方法
    push, // 跳转一个新地址，并将新地址入栈
    replace, // 将当前页面替换成一个新地址
    go, // 等同于window.history.go
    goBack, // 等同于window.history.go(-1)
    goForward, // 等同于window.history.go(1)
    block, // 阻止并提示的方法
    listen // 监听路由变化的方法
  }
```

### history库用到的工具类

在我们处理history对象的过程中，我们需要用到一个工具类函数，这个工具函数对应到源码中，是写在createTransitionManager.js这个文件中的。先看一下这个函数大体的轮廓是什么样子的吧。

```js
const createTransitionManager = () => {
  let prompt = null
  const setPrompt = (nextPrompt) => {
  }
  const confirmTransitionTo = (location, action, getUserConfirmation, callback) => {
  }
  let listeners = []
  const appendListener = (fn) => {
  }
  const notifyListeners = (...args) => {
  }
  return {
    setPrompt,
    confirmTransitionTo,
    appendListener,
    notifyListeners
  }
}
export default createTransitionManager
```

我们可以看出，这个工具类里面，提供了四个方法供外部进行调用。并且有两个内部共享的属性。

- prompt：记录提示的内容，根据提示内容的不同，从而进行不同方式的阻止操作。

- setPrompt：设置提示。这里接收的prompt的值的类型有点复杂，可以是布尔值、字符串、函数或者是null。默认值是false(从history实例上的block方法传过来的。代表含义是单纯的阻止，啥都不给提示)。如果是字符串或者函数代表的是提示内容，根据他们类型的不同，从而进行不同的提示。如果是null的话，则证明不进行阻止。我们可以看一下这里面是咋实现的。

  ```js
  /** 设置提示 */
  const setPrompt = (nextPrompt) => {
    warning(
      prompt == null,
      'A history supports only one prompt at a time'
    )

    prompt = nextPrompt

    return () => {
      if (prompt === nextPrompt)
        prompt = null
    }
  }
  ```

  warning是一个从外部导入的控制台提示库，如果前面的条件不符合，则提示后面的内容。其实这个工具类很简单，就是设置一个提示的值，然后返回一个闭包供清除提示，恢复成原来的值即可。我们一直都在说提示，也说提示有两种方式，看看history库官方给我们的用法，具体这个函数长啥样。（nextPrompt是从block方法传过来的，所以这里给的示例是block函数的）

  ```js
  // Register a simple prompt message that will be shown the
  // user before they navigate away from the current page.
  const unblock = history.block('Are you sure you want to leave this page?')

  // Or use a function that returns the message when it's needed.
  history.block((location, action) => {
    // The location and action arguments indicate the location
    // we're transitioning to and how we're getting there.

    // A common use case is to prevent the user from leaving the
    // page if there's a form they haven't submitted yet.
    if (input.value !== '')
      return 'Are you sure you want to leave this page?'
  })
  ```

  然后我们说的提示的具体模样就是下一张图，与window.confirm的参数类型是一样的。

  <img src="https://developer.mozilla.org/en-US/docs/Web/API/Window/confirm/firefoxcomfirmdialog_zpsf00ec381.png"/>

- confirmTransitionTo 确认是否跳转。该函数的名字的含义也很明确，就是根据提示内容的状态来确定是否变化路由。我们来看一下这里的代码。

  ```js
  /** 确认是否跳转 */
  const confirmTransitionTo = (location, action, getUserConfirmation, callback) => {
    // TODO: If another transition starts while we're still confirming
    // the previous one, we may end up in a weird state. Figure out the
    // best way to handle this.
    if (prompt != null) {
      // 执行弹窗内容，获取弹窗内容结果
      const result = typeof prompt === 'function' ? prompt(location, action) : prompt
      // 当弹窗的内容是string的时候，一般调用prompt之后，返回的都是string
      if (typeof result === 'string') {
        // 用户提示是函数，就执行
        if (typeof getUserConfirmation === 'function') {
          getUserConfirmation(result, callback)
        } else {
          warning(
            false,
            'A history needs a getUserConfirmation function in order to use a prompt message'
          )
          callback(true)
        }
      } else {
        // Return false from a transition hook to cancel the transition.
        callback(result !== false) // 否则，用户取消时，回调的值返回了false
      }
    } else {
      callback(true)
    }
  }
  ```
  
  上面我们谈到了prompt的四个类型的值，所以这里的逻辑判断其实就比较清晰了。
  
  - prompt不为null(这里排除了undefined，因为block函数默认值是false)，那就证明，我们有需要提示的内容，暂时需要阻拦一下。上面我们提过了，有两种prompt的方式，所以这里要判断是函数还是字符串，目的都是拿到这个执行的结果，都是字符串（一种情况除外，用户取消的时候，返回了false)。
  
    - 如果这个结果是字符串的话，并且getUserConfirmation的类型为函数，那我就执行这个函数。这里getUserConfirmation这里可以展开说一下。默认情况下，如果不是createMemoryHistory的情况下（服务器渲染）的情况下，这个参数是在history对象的props里面传下来的，默认值就是调用了window.confirm来进行提示的。不信我们可以看一下createBrowserHistory和createHashHistory的参数类型。如果我们不去重写这个属性的话，那它就是用的window.confirm进行提示，然后这个会返回true/false,然后走回调函数。
  
      ```js
      createBrowserHistory({
        basename: '',             // The base URL of the app (see below)
        forceRefresh: false,      // Set true to force full page refreshes
        keyLength: 6,             // The length of location.key
        // A function to use to confirm navigation with the user (see below)
        getUserConfirmation: (message, callback) => callback(window.confirm(message))
      })
      createHashHistory({
        basename: '',             // The base URL of the app (see below)
        hashType: 'slash',        // The hash type to use (see below)
        // A function to use to confirm navigation with the user (see below)
        getUserConfirmation: (message, callback) => callback(window.confirm(message))
      })
      ```
  
    - 如果getUserConfirmation不是函数的话，那我们就要给一个error提示了。history对象需要一个getUserConfirmation来进行一个提示。不阻止路由执行。
  
    - 如果result的返回类型不为string，那result也就是false，那也就是阻止路由执行，这里是用户取消了提示。
  
  - 如果prompt是null，这个是我们的初始情况。不阻止路由执行。
  
- listeners 是我们需要监听的路由集合。我们的两个内部方法appendListeners和notifyListeners都用到了这个。

  listener的具体类型是这样的，下面给一个例子，它的参数值包含两个属性，location即当前位置，action即前面提到的history的动作，包含三个枚举值。

  ```js
  const listener = (location, action) => {
    // location is an object like window.location
    console.log(action, location.pathname, location.state)
  }
  ```
  
- appendListeners 绑定监听函数到依赖数组中。我们来看一下这里的实现：

  ```js
  /** 绑定监听 */
  const appendListener = (fn) => {
    // 是否有效
    let isActive = true
    // 监听事件，发送通知的时候会用到
    const listener = (...args) => {
      // 这里有个状态控制，确认事件绑定的时候才有效
      // 否则解绑被调用的时候，这个是不走的
      if (isActive)
        fn(...args)
    }
    // 监听数组放入监听函数
    listeners.push(listener)
    // 这个返回值是解绑的时候需要执行的
    return () => {
      // 标志位置为false，以及删除需要解绑的函数
      isActive = false
      listeners = listeners.filter(item => item !== listener)
    }
  }
  ```
  
  这里用isActive来控制是否在监听状态中，注意的是，每一个listener单独控制一个isActive。当我们appendListener的时候，会将这个listener放入到我们的listeners依赖数组中，且返回解除当前listener的方法。当我们需要解除的时候，调用解除的方法，会将isActive标志位置为false，这样我们的listener就不会再执行，然后把当前的listener从依赖数组listeners中删去。
  
- notifyListeners   执行每一个listener方法，更新路由当前的位置和执行的动作。

  ```js
  /** 发送监听通知，实际上就是执行一遍每一个listener，刷新路由 */
  const notifyListeners = (...args) => {
    listeners.forEach(listener => listener(...args))
  }
  ```
### 聊完工具类，再看history对象中的属性

现在回过头来看我们history对象中的属性。

- location: 当前路由所在的位置。这个是由history内部对象维护的一个状态。当哈希值改变的时候，这个值也会改变。

- createHref：这个是一个公共方法，创建一个标准的路由哈希路径。下面我们看一下源码。

  ```js
  const createHref = (location) =>
    '#' + encodePath(basename + createPath(location))
  ```

  很简单，一句话搞定。可是我们看到有两个不认识的东西，encodePath和createPath是啥？

  encodePath是根据history传入的哈希类型来获取的加密路径的方法，createPath是根据location来进行标准化处理，返回一个标准的路径string字符串。我们来看看这两块的代码。

  ```js
  // stripLeadingSlash 如果第一位字符是/，则把它去掉，否则不变
  // addLeadingSlash 与前者相反，如果没有/，则加上/，否则不变
  // addLeadingSlash = (path) => path.charAt(0) === '/' ? path : '/' + path
  // stripLeadingSlash = (path) => path.charAt(0) === '/' ? path.substr(1) : path
  const HashPathCoders = {
    // 形如/#!/demo/path
    hashbang: {
      encodePath: (path) => path.charAt(0) === '!' ? path : '!/' + stripLeadingSlash(path),
      decodePath: stripLeadingSlash
    },
    // 形如/#demo/path
    noslash: {
      encodePath: stripLeadingSlash,
      decodePath: addLeadingSlash
    },
    // 形如 /#/demo/path
    slash: {
      encodePath: addLeadingSlash,
      decodePath: addLeadingSlash
    }
  }
  /** 这里是主函数的一部分 **/
  const createHashHistory = (props = {}) => {
    const {
      getUserConfirmation = getConfirmation,
      hashType = 'slash'
    } = props
      // 根据哈希类型获取编码和解码方法
    const { encodePath, decodePath } = HashPathCoders[hashType]
  }
  /** PathUtils.js 根据location生成标准化路径 **/
  export const createPath = (location) => {
    const { pathname, search, hash } = location
    let path = pathname || '/'
  
    if (search && search !== '?')
      path += (search.charAt(0) === '?' ? search : `?${search}`)
    
    if (hash && hash !== '#')
      path += (hash.charAt(0) === '#' ? hash : `#${hash}`)
  
    return path
  }
  ```

- pop、push、listen、block

  有人看到这里可能会问了，这四个为啥要放到一堆儿说呢？这里的内容不是很重要么？当然很重要，没毛病。这是我们history库的核心方法，玩history库就是玩的它们。但是他们存在共同的依赖。所以要讲他们之前，我们需要把他们共同的依赖要列出来。先列依赖，然后再分别逐一击破它们。

  - 依赖的公共属性和方法

    - forceNextPop

      标志位。值为true/false。这个标志我们是否有提示，需要进行阻断。

    - allPaths

      数组。值为所有路径的集合。

    - ignorePath

      字符串或者是null。这个标志是因为我们在push/replace的时候需要单独处理，如果存在这个标志，则有特殊处理，下面会说。

    - listenerCount

      数字。记录当前在用的监听路由的数量。

    - setState

      刷新当前history对象的location和action，并通知监听方法更新。别看名字和React里面的setState一样，干的根本不是同一个事。下面我们放这个方法的源码。

      ```js
      // 设置状态方法
      const setState = (nextState) => {
        /** 组装history对象 */
        Object.assign(history, nextState)
        /** 重新刷新history对象的长度，与全局history对象的长度保持一致 */
        history.length = globalHistory.length
        /** 通知组件更新，调用更新方法 */
        transitionManager.notifyListeners(
          history.location,
          history.action
        )
      }
      ```

      这里我们将history对象的方法，使用nextState更新，nextState方法里面有当前记录的location和action。然后更新history对象的长度，跟window.history对象的长度保持一致。(handleHashChange的时候，监听的是hashchange事件，window.history的值要同步过来)。然后通知全部的监听方法进行更新，刷新路由的history.location和history.action。

    - handleHashChange

      这个是全局的哈希值变化的监听方法，来看一下相应的源码。

      ```js
      /**
       * 获取哈希值
       * 这里官方文档给出的不能直接用window.location.hash的原因是
       * 火狐会在解码的时候会执行预解码，表现和其它浏览器不一致
       */
      const getHashPath = () => {
        // We can't use window.location.hash here because it's not
        // consistent across browsers - Firefox will pre-decode it!
        const href = window.location.href
        const hashIndex = href.indexOf('#')
        return hashIndex === -1 ? '' : href.substring(hashIndex + 1)
      }
      
      // 获取完整location对象
      const getDOMLocation = () => {
        let path = decodePath(getHashPath())
        // 如果存在基准url，要把基准url删掉
        if (basename)
          path = stripBasename(path, basename)
        // 返回完整的location对象
        // 这里返回了pathname,search,hash,state
        return createLocation(path)
      }
      
      /** 处理哈希值变化方法 */
      const handleHashChange = () => {
        const path = getHashPath()
        const encodedPath = encodePath(path)
      
        if (path !== encodedPath) {
          // Ensure we always have a properly-encoded hash.
          // 确保始终拥有正确编码的哈希值，保持一致
          replaceHashPath(encodedPath)
        } else {
          const location = getDOMLocation()
          const prevLocation = history.location
          // 如果是非弹窗状态或者是弹窗已确认的状态
          // 且location中的pathname,search,hash,state均没有变化
          // 那么就不处理
          if (!forceNextPop && locationsAreEqual(prevLocation, location))
            return // A hashchange doesn't always == location change.
          // 如果哈希值变化了，且这个和当前地址的值相等，那么也不进行处理
          // 因为我们在push/replace中处理过了
          if (ignorePath === createPath(location))
            return // Ignore this change; we already setState in push/replace.
          // 如果上面两种情况都不是，那么就执行下面的方法
          ignorePath = null
      
          handlePop(location)
        }
      }
      ```

      这里我们先比较了一波path和编码之后的encodePath是否相等，如果不等直接替换，替换完事之后，如果还处于监听状态的话（注意后面要说的checkDOMListeners），那么还是会走入下面的方法。所以重点分析else里面的逻辑。

      这里的比较：

      - 是非需要阻断状态，且当前的位置和之前的位置相等，则证明它不需要刷新。
      - 当前的位置在转成字符串路径之后和ignorePath相等的话，则证明它需要单独在replace/pop进行处理，也不管。
      - 否则就把ignorePath清空，执行handlePop。handlePop的逻辑我们在下面会说。

    - revertPop

      这个方法是在有提示的时候，用户点击了取消的时候会调用的方法。先说这个方法的原因是因为handlePop方法里面有这个方法的逻辑。

      ```js
      /**
       * 回滚路由地址
       */
      const revertPop = (fromLocation) => {
        const toLocation = history.location
      
        // TODO: We could probably make this more reliable by
        // keeping a list of paths we've seen in sessionStorage.
        // Instead, we just default to 0 for paths we don't know.
      
        let toIndex = allPaths.lastIndexOf(createPath(toLocation))
      
        if (toIndex === -1)
          toIndex = 0
      
        let fromIndex = allPaths.lastIndexOf(createPath(fromLocation))
      
        if (fromIndex === -1)
          fromIndex = 0
      
        const delta = toIndex - fromIndex
      
        if (delta) {
          forceNextPop = true
          // 这里其实会触发handlePop
          go(delta)
        }
      }
      ```

      这里我们拿到的fromLocation实际上是一个旧的值，它是一个浏览器要过去但是不应该跳转过去的值（我们放handlePop的源码会看到，这个实际上是用户选择取消要回滚原来路径操作的值），toLocation是我们现在history对象中的值。所以这两个的值是不一样的（因为没有调用setState）。然后我们拿这两个地址，在我们记录的总路径里面去比较，算出来差值。然后如果有差值，那么我们的需要阻断标志就是true，然后回滚原来的位置。回滚原来位置时，由于哈希值变化了，会触发handlePop。关于allPaths的维护，会在push和replace里面看到。

    - handlePop

      handlePop这里面其实是对全局的哈希变化的监听，由我们前面的分析可以得到，它实际上才是主要监听哈希值并执行的方法。下面我们看看源码吧。

      ```js
      /** 当哈希值变化的时候会走这里 */
      const handlePop = (location) => {
        if (forceNextPop) {
          forceNextPop = false
          setState()
        } else {
          const action = 'POP'
          transitionManager.confirmTransitionTo(location, action, getUserConfirmation, (ok) => {
            if (ok) {
              // 如果没有提示的情况，或者是用户确认了提示，则进行状态的变更
              setState({ action, location })
            } else {
              // 否则有提示，用户点击了取消，就走回滚方法
              revertPop(location)
            }
          })
        }
      }
      ```

      这里我们又一次看到了阻断标志。这里的阻断标志为true的时候，就是我们上面提到的revertPop中变化而来的。

      - 当阻断标志为true，那就证明了，用户取消了提示，不前进页面，原地刷新路由即可。
      - 否则变化动作标志为POP，因为我们对于REPLACE和PUSH的情况都单独处理了，不会出现这两种情况。然后我们需要去拿用户的提示状态，这个提示放在了我们之前的工具类里面（由block方法影响的，用的是同一个对象），这里面我们只关心回调的第四个参数的状态，如果是true，那就证明路由变化，需要刷新并通知，走setState。否则就是用户点击取消了，回滚路由。

    - pushHashPath

      这个就一行代码，只是变化了哈希值，没啥好说的。这里我们用到path的时候，传参已经被encodePath过了。

      ```js
      const pushHashPath = (path) =>
        window.location.hash = path
      ```

    - replaceHashPath

      这个上面有提到，是为了保证根据window.location.href获取的路径和encodePath后的路径的一致性，如果不一致用后者（这里其实没那么太理解，既然无论咋样都以后一个为准，那为啥要管前面呢？）

      ```js
      /**
       * 替换哈希值，这里这样处理的原因，同样是为了兼容火狐
       */
      const replaceHashPath = (path) => {
        const hashIndex = window.location.href.indexOf('#')
      
        window.location.replace(
          window.location.href.slice(0, hashIndex >= 0 ? hashIndex : 0) + '#' + path
        )
      }
      ```

    - checkDOMListeners

      这里我们监测的是是否有监听函数，如果有监听函数，则开启监听方法，如果没有了，那就关闭。

      ```js
      /** 这里listen和block走的是这个方法，监听dom的变化
       *  里面需要处理的是哈希值的变化
       */
      const checkDOMListeners = (delta) => {
        listenerCount += delta
      	// HashChangeEvent = 'hashchange'
        if (listenerCount === 1) {
          addEventListener(window, HashChangeEvent, handleHashChange)
        } else if (listenerCount === 0) {
          removeEventListener(window, HashChangeEvent, handleHashChange)
        }
      }
      ```

    - createLocation

      这个是在工具类的一个方法，但是由于也比较重要，所以拿出来讲。否则下面的push方法会看不太懂。

      ```js
      /** LocationUtils.js */
      /** 规范传入的路径，组装成一个location对象 */
      export const createLocation = (path, state, key, currentLocation) => {
        let location
        if (typeof path === 'string') {
          // Two-arg form: push(path, state)
          location = parsePath(path) // path是string的情况，就调用parsePath解析出location
          location.state = state
        } else {
          // One-arg form: push(location)
          location = { ...path } // 否则location是个对象，需要进行处理
          // 对pathname不存在的情况进行补充，确保规范
          if (location.pathname === undefined)
            location.pathname = ''
          // 对search进行补充，确保规范
          if (location.search) {
            if (location.search.charAt(0) !== '?')
              location.search = '?' + location.search
          } else {
            location.search = ''
          }
          // 对hash进行补充，确保规范
          if (location.hash) {
            if (location.hash.charAt(0) !== '#')
              location.hash = '#' + location.hash
          } else {
            location.hash = ''
          }
          // 如果state存在，但是location上的没有带上，那就给它带上
          if (state !== undefined && location.state === undefined)
            location.state = state
        }
      
        try {
          // 处理不规范的符号，例如emoji等
          location.pathname = decodeURI(location.pathname)
        } catch (e) {
          if (e instanceof URIError) {
            throw new URIError(
              'Pathname "' + location.pathname + '" could not be decoded. ' +
              'This is likely caused by an invalid percent-encoding.'
            )
          } else {
            throw e
          }
        }
        // 存在key就给key
        if (key)
          location.key = key
        // 如果传入了当前位置，则解析相对于当前位置的路径名，进行拼装
        if (currentLocation) {
          // Resolve incomplete/relative pathname relative to current location.
          if (!location.pathname) {
            location.pathname = currentLocation.pathname
          } else if (location.pathname.charAt(0) !== '/') {
            location.pathname = resolvePathname(location.pathname, currentLocation.pathname)
          }
        } else {
          // When there is no prior location and pathname is empty, set it to /
          if (!location.pathname) {
            location.pathname = '/'
          }
        }
        // 返回完整的位置对象
        return location
      }
      ```

      这里方法在try语句之前，分为了两个主要的分支，一种是path传的是string的情况，一种是path传的location对象({pathname:'',search:'',hash:'',state:''})。

      - 如果path是string的话，就把path字符串转成location的格式，便于后面进行处理。
      - 如果path不是string而本来就是location格式的话，我无法保证他们的准确性，所以进行标准化处理。

      然后我们统一处理完毕，拿到了一个location对象，开始对pathname进行格式化。如果有当前地址的情况，就基于当前地址来对路径进行补充，规范化处理，如果没有当前地址，且没有pathname的情况，那就给pathname赋值'/'。最后返回完整的路径对象。

  - push

    现在我们回过头来看push方法吧。就会清晰很多了。

    ```js
    const push = (path, state) => {
      // 哈希路由不支持state的变化，将被忽略  
      warning(
        state === undefined,
        'Hash history cannot push state; it is ignored'
      )
      // 动作定义为push
      const action = 'PUSH'
      // 拿到即将去的地址
      const location = createLocation(path, undefined, undefined, history.location)
    
      transitionManager.confirmTransitionTo(location, action, getUserConfirmation, (ok) => {
        if (!ok)
          return
        // 根据location拿到规范化的路径，这里做的就是各种拼接和转化及特殊情况的处理
        const path = createPath(location)
        // 拿到正确的哈希值，encodePath需要完整路径，basename+path是完整路径
        const encodedPath = encodePath(basename + path)
        // 比较哈希值是否变化
        const hashChanged = getHashPath() !== encodedPath
    
        if (hashChanged) {
          // We cannot tell if a hashchange was caused by a PUSH, so we'd
          // rather setState here and ignore the hashchange. The caveat here
          // is that other hash histories in the page will consider it a POP.
          // 记录需要被忽略的路径，避免重复操作
          ignorePath = path
          // 直接变化路由的哈希值即可
          pushHashPath(encodedPath)
          // 最后一次出现之前地址的位置
          const prevIndex = allPaths.lastIndexOf(createPath(history.location))
          // 将之前地址（包含本身）之前的调用栈保留起来
          const nextPaths = allPaths.slice(0, prevIndex === -1 ? 0 : prevIndex + 1)
          // 在该调用栈里面放入最新的地址
          nextPaths.push(path)
          // 更新调用栈
          allPaths = nextPaths
          // 刷新路由
          setState({ action, location })
        } else {
          // 否则提醒不能放入同一个路径
          warning(
            false,
            'Hash history cannot PUSH the same path; a new entry will not be added to the history stack'
          )
          // 原地刷新
          setState()
        }
      })
    }
    ```

    - 首先我们判断参数传参是否有state的变化，如果有则需要给出提示，因为哈希路由不支持state的变化。
    - 然后我们将action类型定义好为PUSH，location可以通过上面的createLocation方法来取得。
    - 我们还是用上面创建的确认是否跳转类来判断，如果非ok的情况，那就是存在提示且用户取消的情况，什么都不做就好。否则就是跳转到要去的地址， 那么就拿规范化的location，比较哈希值是否有变化。
      - 如果有变化，那就记录一下ignorePath，防止handleHashChange处理，变化哈希值，记录之前地址在全局路由列表中所在的最后一次的位置，并截断之后的数据，只要之前的（包括本身），将新地址加进来，作为新的全局路由列表(allPaths)。并且刷新路由。
      - 如果没有变化，那就给出警告并原地刷新。

  - replace

    replace和push大同小异，这里直接放源码了，不详细说明。

    ```js
    const replace = (path, state) => {
      warning(
        state === undefined,
        'Hash history cannot replace state; it is ignored'
      )
    
      const action = 'REPLACE'
      // 获取一个规范的当前地址对象
      const location = createLocation(path, undefined, undefined, history.location)
    
      transitionManager.confirmTransitionTo(location, action, getUserConfirmation, (ok) => {
        if (!ok)
          return
    
        const path = createPath(location)
        // 拿到正确的哈希值，这里是basename+path是因为要比较#后面的完整路径
        const encodedPath = encodePath(basename + path)
        // 比较哈希值是否变化
        const hashChanged = getHashPath() !== encodedPath
    
        if (hashChanged) {
          // We cannot tell if a hashchange was caused by a REPLACE, so we'd
          // rather setState here and ignore the hashchange. The caveat here
          // is that other hash histories in the page will consider it a POP.
          // 记录当前的path   
          ignorePath = path
          // 替换地址
          replaceHashPath(encodedPath)
        }
        // 找到之前的地址存储
        const prevIndex = allPaths.indexOf(createPath(history.location))
        // 如果能找到，那就把这个位置直接替换
        if (prevIndex !== -1)
          allPaths[prevIndex] = path
        // 刷新页面
        setState({ action, location })
      })
    }
    ```

  - listen

    **其实我们讲history库的原因就是因为这个listen。**它依赖于我们提到的checkDomListener。看一下它的代码：

    ```js
    const listen = (listener) => {
      // 这个值是一个解绑的闭包，被调用的时候就会解绑。
      const unlisten = transitionManager.appendListener(listener)
      // 调用listen的时候，会增加监听历史条目的改变事件
      checkDOMListeners(1)
      // 调用listen后，如果这个值被赋给一个变量，然后执行这个变量的时候
      // 那么一样，取消监听、解除listen。
      return () => {
        checkDOMListeners(-1)
        unlisten()
      }
    }
    ```

    我们在调用添加监听函数的时候，会拿到解绑监听函数。然后我们会记录监听的数目，在原有基础上加1，这样我们激活了前面的handleHashChange方法。调用监听函数的时候，返回值可以赋给一个变量作为解绑监听的函数，然后调用这个变量的时候，就执行了减少一个监听数目，并解绑监听的方法。

  - block

    block和listen某种程度上来说是一回事。看一下它的源码就知道了，也是依赖于checkDomListener。

    ```js
    const block = (prompt = false) => {
      const unblock = transitionManager.setPrompt(prompt)
      // 调用block之后，isBlocked这个标志位会变成true。
      // 并且开始监听历史条目的改变
      if (!isBlocked) {
        // 增加一个监听对象
        checkDOMListeners(1)
        isBlocked = true
      }
      // 调用block之后，如果这个值被赋给一个变量，然后再执行这个变量
      // 那么就会解除block，并且执行unblock，清除prompt
      return () => {
        if (isBlocked) {
          isBlocked = false
          // 减少一个监听对象
          checkDOMListeners(-1)
        }
    
        return unblock()
      }
    }
    ```

    当我们调用history.block的时候，如果不是阻塞状态的话，增加监听的数目，并且阻塞状态置为true，调用之后的返回值作为解除回调的函数。当解除回调的函数被调用的时候，如果是阻塞状态，就将阻塞状态还原，并减少监听的数目。然后清空提示。

    

    到这里我们的history库的部分讲差不多了，是不是有种恍如隔世的感觉？我们是从哪儿进来的？下面我们来回忆一下入口文件的内容，然后继续我们接下来的章节。

  
### 说一下renderRoutes

首先我们先再来看一下入口文件的内容。我们已经刚才解释完HashRouter里面干了什么。那么现在的内容就变成了Provider里面包裹的部分了。

```js
import { Provider } from 'mobx-react';
import React from 'react';
import ReactDOM from 'react-dom';
import { HashRouter } from 'react-router-dom';
import { renderRoutes } from 'react-router-config';


import routes from './config/route';
import stores from './config/stores';
import './styles/index.scss';

ReactDOM.render(
  <HashRouter>
    <Provider {...stores}>{renderRoutes(routes)}</Provider>
  </HashRouter>,
  document.getElementById('root'),
);
```

Provider将我们需要的stores都注入到了子组件里面去，提供了上下文，这里的使用方式其实可以参考前面的Provider的方式，大致功能一样，只不过做了一些特殊处理，有兴趣的可以参考我最后一个参考文档。这里不做详细说明。

然后inject就能拿到这个stores里面的内容，获取这里面的存储的属性和方法。也跟我们使用useContext的方式差不多，只不过它进行了更加细致的一些处理。

所以前面说的这些，其实不是我们这节要讲的正题。正题是renderRoutes这个函数是啥？以及它做了什么操作？先来看一下他接受的参数routes，这个是由我们的配置文件中导入进来的。

```ts
const routes: RouteConfig[] = [
  {
    path: '/',
    component: Loadable({
      loader: () => import('../layouts/NoSidebarLayout'),
      loading: Loading,
    }),
    routes: [      
      {
        path: '/home',
        exact: true,
        component: Loadable({
          loader: () => import('../pages/home'),
          loading: Loading,
        }),
      },
    ]
  }
]
```

然后再看renderRoutes做的动作。实际上只不过是把我们拿到的routes配置进行了一遍遍历，如果有routes配置，就将这个内容作为Switch组件的children。如果没有，就是null。仅此而已。

```ts
import React from "react";
import { Switch, Route } from "react-router";

// 这里的routes就是我们经常能看到的router.ts文件暴露的内容，也是我们路由的维护项
// 我们很熟悉的path、exact、component属性都是需要传入这里
// 然后进行渲染得到的路由，Switch组件是负责路由的匹配
// 判断当前的路径符合哪个，就显示哪个
function renderRoutes(routes, extraProps = {}, switchProps = {}) {
  return routes ? (
    <Switch {...switchProps}>
      {
        routes.map((route, i) => (
            <Route
              key={route.key || i}
              path={route.path}
              exact={route.exact}
              strict={route.strict}
              render={props =>
                route.render ? (
                  route.render({ ...props, ...extraProps, route: route })
                ) : (
                  <route.component {...props} {...extraProps} route={route} />
                )
              }
            />
      ))
      }
    </Switch>
  ) : null;
}

export default renderRoutes;
```

详细的看一下Switch和Route组件里面都有啥。老样子，我们依旧只看主干代码，对警告等无关紧要的内容忽略掉。
```js

/**
 * 用于渲染第一个匹配的Route的公共API
* The public API for rendering the first <Route> that matches.
*/
class Switch extends React.Component {
  render() {
    return (
      // context中可以拿到，history，location，match，staticContext属性，这个是我们从上面传下来的。
      <RouterContext.Consumer>
        {context => {
          const location = this.props.location || context.location;
          
          let element, match;
          
          React.Children.forEach(this.props.children, child => {
            if (match == null && React.isValidElement(child)) {
              element = child;
              const path = child.props.path || child.props.from;
              match = path
                ? matchPath(location.pathname, { ...child.props, path })
                : context.match;
            }
          });
          return match
            ? React.cloneElement(element, { location, computedMatch: match })
            : null;
        }}
      </RouterContext.Consumer>
    );
  }
}
```

看上面的代码可能有点乱，我们来一点点捋一捋。

- RouterContext.Consumer中我们可以拿到history，location，match，staticContext属性，这个是我们大的RouterContext中注入进来的。是我们可以直接拿到的，这个的内容我们可以通过context这个变量来取得。
- location这个变量的取值，是由于我们可以从属性外部传一个location属性，来指定我们匹配的location。当然默认的情况下是不传的，它就匹配上下文中传递下来的location。
- element是记录的需要遍历的子元素（这里是Route），match是我们匹配的时候需要传入的属性。
- 对我们的所有Route对象进行遍历，然后当match==null的时候（**这里注意undefined==null**)，就去根据拿到的路径去匹配拿到match的值。这里为啥会取path或者from属性？这是因为Redirect组件没有path，只有from属性。所以这里的加载路径只能根据from来取。
- 如果我们的match!=null的时候，那么if条件是一直进不去的，也就是空循环。因为我们已经找到了需要的match属性。
- 然后我们将我们找到的Route(即element)和我们的属性进行组装，然后就拿到了最终的需要的结果。
  
### 再看一下Route组件

```js
// 判断子节点个数是否为0
function isEmptyChildren(children) {
  return React.Children.count(children) === 0;
}

// Route组件
class Route extends React.Component {
  render() {
    return (
      <RouterContext.Consumer>
        {context => {
          const location = this.props.location || context.location; 
          // 其实在Switch中，我们已经传入了computedMatch。
          // 如果找不到这个属性，那我就找path，重新计算一遍匹配的路径（其实computedMatch也算的是这玩意儿）
          // 如果再找不到，那我就去取上下文的match
          const match = this.props.computedMatch 
            ? this.props.computedMatch // <Switch> already computed the match for us
            : this.props.path
            ? matchPath(location.pathname, this.props)
            : context.match;
          // 组合属性，准备传给子组件
          const props = { ...context, location, match };

          // 解构出来子节点、组件、render方法
          let { children, component, render } = this.props;

          // 对子节点为空的处理
          if (Array.isArray(children) && isEmptyChildren(children)) {
            children = null;
          }
          return (
            <RouterContext.Provider value={props}>
              {props.match
                ? children
                  ? typeof children === "function"
                    ? children(props)
                    : children
                  : component
                  ? React.createElement(component, props)
                  : render
                  ? render(props)
                  : null
                : typeof children === "function"
                ? children(props)
                : null}
            </RouterContext.Provider>
          );
        }}
      </RouterContext.Consumer>
    );
  }
}
```

继续一点点分析。

- 这里的location同样是可以从Route的属性传进来的，我们可以人为的干预让它本来不匹配的情况下，也能够让它进行匹配。如果没有显式传入location属性，那就是正常的从上下文取得的location。
- 这里的match实际上我们已经从Switch组件中可以拿到了，所以先判断有没有属性中传过来的computedMatch。默认情况下是有的，但是万一没有的话，我们还可以从path属性加工一遍，获得同样的computedMatch。如果连path属性都没有，那就拜拜了您嘞，我就直接拿上下文中的match，也就是默认值。
- 然后我们把上下文对象，location和match组装成一个对象，准备传给子组件。
- 然后我们解构出来子组件、组件和渲染方法，做一下空值的判断。
- 由我们上面对Switch组件的分析，match如果有的话，那就有且只有一个。
  - 如果match属性存在的话，那我就执行children里面的函数。
    - 执行children的函数的时候分两种情况，如果children是函数，那就把props传入进来，进行渲染，否则就代表它不是函数，其实也就是空节点。
    - 然后如果没有children，那也就是我们的最底层节点了。那就找component，然后把我们匹配的props和我们的component组装起来。
    - 然后component也没有，那就执行render。把props传入进来，进行渲染。
  - 如果match不存在的话，且children是函数，那我也要把props传入进来，进行渲染。
- 所以这里我们可以得出一个渲染的顺序，同样的子组件优先级的顺序为：component > render > children。表面上看上去children优先级最高，实际上并不是。

其实我们在讲述的过程中忽略了一个问题，那就是核心的一个方法没有讲。我们是咋匹配上然后拿到具体的match值，这个过程并不得而知。下面我们就来看看这个核心的方法matchPath。

```js
function matchPath(pathname, options = {}) {
  // 当配置项为数组或者字符串的时候，直接给一个path属性，值为配置项本身，并保存
  if (typeof options === "string" || Array.isArray(options)) {
    options = { path: options };
  }
  // 解构出来path、exact、strict、sensitive的属性，这些如果有配置就解构出来，没有就给默认值
  const { path, exact = false, strict = false, sensitive = false } = options;
  // 这一步操作是把路径变成统一的数组
  const paths = [].concat(path);

  return paths.reduce((matched, path) => {
    // 如果没有路径，且不为空字符串那就返回null
    if (!path && path !== "") return null;
    // 如果有匹配的，那我就不找了，返回即可
    if (matched) return matched;
    // 解构出来正则表达式和keys的值，下面有用
    const { regexp, keys } = compilePath(path, {
      end: exact,
      strict,
      sensitive
    });
    // 通过路径去匹配正则表达式
    const match = regexp.exec(pathname);
    // 如果没有匹配返回null
    if (!match) return null;
    // 如果匹配了，则解构出来url和其它的值
    const [url, ...values] = match;
    // 是否精准匹配
    const isExact = pathname === url;
    // 如果有精准匹配的条件，但是实际上没有精准匹配，则返回null
    if (exact && !isExact) return null;
    // 如果上述的校验都通过，则返回最终结果
    return {
      path, // the path used to match
      url: path === "/" && url === "" ? "/" : url, // the matched portion of the URL
      isExact, // whether or not we matched exactly
      params: keys.reduce((memo, key, index) => {
        memo[key.name] = values[index];
        return memo;
      }, {})
    };
  }, null);
}
```
- 首先，我们对于options是字符串和数组的情况进行预处理，把他们都统一成带path属性的对象。

- 然后，我们从options解构出来path、exact(头部匹配即匹配)、strict(必须完全匹配)、sensitive(区分大小写)四个属性，并拿到统一的path属性的值，并且将路径转为统一的数组。

- 然后我们对路径进行计算，reduce里面就是查找的过程（有reduce不懂的伙伴可以查找下api，这里不做相关说明）。先看整体里面干了啥，初值为null。当我们找到这个值的时候，那我就把这个值返回回来，作为下一次的结果。

  - 如果没有path且path不为空字符串的时候，那我就直接跳过这一次的查找。

  - 如果有匹配的，那我就直接返回已经匹配的即可，保证只匹配一次。

  - 然后根据strict、sensitive、exact属性，计算出来匹配出来的正则表达式和keys，这里的keys是动态路由的键值名的组合。(compilePath方法有点复杂，且依赖了第三方库，这里先不做详细说明吧)

  - 然后这里的match就是我们根据正则表达式匹配的路径。

    - 如果没有匹配，则直接跳过本次查找，进行下一次。

    - 如果匹配了，则解构出来url和其它的属性。

    - 然后isExact是判断是否精准匹配的一个标志。这里的url是把动态路由标志排除掉之后的结果，如果它匹配上了，应该是和原来的pathname是相等的。这里举一个例子，重点说一下带动态路由的情况。

      <img src="https://i.ibb.co/fpJHNM5/matchpath.png"/>

       上面这个例子我也是在网上找的，因为exec这个不是很熟悉，查了下mdn的文档才清楚，得到的第一个结果是全部的匹配，后面的都是括号中的分组捕获结果，而这个值刚好和我们需要的动态路由的属性值一样。所以url字段就是我们的第一个属性值，也就和pathname是相等的，第二个属性值...values，也就是我们其他的动态路由属性的属性值。

  - 最后就是返回最终匹配的路由的值。params里面做的就是把我们获取到的键值数组和我们的...values组装起来，然后作为一个新的对象进行返回。


### WithRouter && React Router Hooks

回到我们的下一个正题，需要看一下WithRouter的代码，看它具体做了什么工作，为啥就把不直接与路由相连的组件，就可以使用路由的方法了呢？

如果我们弄清楚上面的代码的话，那这个看起来就变得非常非常简单了。看了下面的代码，我们就可以明白为啥能获取到Router提供的属性了。

```js
import React from "react";
import hoistStatics from "hoist-non-react-statics";
import RouterContext from "./RouterContext.js";

/**
 * A public higher-order component to access the imperative API
 */
function withRouter(Component) {
  const displayName = `withRouter(${Component.displayName || Component.name})`;
  const C = props => {
    // 如果想要设置被withRouter包裹的组件的ref，就使用wrappedComponentRef
    const { wrappedComponentRef, ...remainingProps } = props;
    // 这里还是利用我们上面Router中提供的上下文，把属性传递进来，即history，location，match，staticContext属性。
    return (
      <RouterContext.Consumer>
        {context => {
          return (
            <Component
              {...remainingProps}
              {...context} 
              ref={wrappedComponentRef}
            />
          );
        }}
      </RouterContext.Consumer>
    );
  };

  C.displayName = displayName;
  C.WrappedComponent = Component;
  // 当给组件添加一个HOC时，原来的组件会被一个container组件包裹，这意味着新的组件不会有任何的静态方法
  // 为了解决这个问题，就可以在return之前，将静态方法拷贝到container组件上面。
  // 使用hoistStatics这个库是想把高阶组件和静态方法聚合起来
  return hoistStatics(C, Component);
}

export default withRouter;
```

下面我们再看看Hooks给我们提供的四个Router Hooks。其实他们每个方法里面都有一个版本的警告提示，如果判断组件不是函数的时候，会给出警告提示。不过这里为了简单，我把他们都删去了。
```js
import React from "react";
import RouterContext from "./RouterContext.js";
import HistoryContext from "./HistoryContext.js";
import matchPath from "./matchPath.js";

const useContext = React.useContext;

/** 获取history对象 **/
export function useHistory() {
  // 这里的HistoryContext，我们上面其实见过，这个上下文中，只有history对象的值，包含了若干属性。
  // 这个是我们调用useHistory钩子能够拿到history对象值的原因。
  return useContext(HistoryContext);
}

/** 获取location对象 **/
export function useLocation() {
  // 同理，这里的RouterContext，我们也见过，包含history，location，match，staticContext属性
  // 我们拿到了这里的location属性
  return useContext(RouterContext).location;
}

/** 获取路由参数，即动态路由 **/
export function useParams() {
  // 同理，这里的RouterContext，我们也见过，包含history，location，match，staticContext属性
  // 这里我们拿到了match属性
  const match = useContext(RouterContext).match;
  // 如果有match属性，则返回match属性里的参数，即动态路由里的值
  return match ? match.params : {};
}

/** 获取最接近匹配的路径的match对象 **/
export function useRouteMatch(path) {
  const location = useLocation();
  const match = useContext(RouterContext).match;
  return path ? matchPath(location.pathname, path) : match;
}
```

# 参考资料
1.[React-Router](https://github.com/remix-run/react-router)(https://github.com/remix-run/react-router)

2.[React Router源码浅析](https://zhuanlan.zhihu.com/p/106042913)(https://zhuanlan.zhihu.com/p/106042913)

3.[面试官，别再问我React-Router了！每一行源码我都看过了！](https://zhuanlan.zhihu.com/p/355075393)(https://zhuanlan.zhihu.com/p/355075393)

4.[手写React-Router源码，深入理解其原理](https://segmentfault.com/a/1190000023560665?sort=votes)(https://segmentfault.com/a/1190000023560665?sort=votes)

5.[react-router-config使用与路由鉴权](https://juejin.cn/post/6844904056805130254)(https://juejin.cn/post/6844904056805130254)

6.[StackOverFlow-history库中listen和unlisten的解答](https://stackoverflow.com/questions/45373742/detect-route-change-with-react-router)(https://stackoverflow.com/questions/45373742/detect-route-change-with-react-router)

7.[mobx-react中Provider和inject的使用与理解](https://segmentfault.com/a/1190000022592588)(https://segmentfault.com/a/1190000022592588)

