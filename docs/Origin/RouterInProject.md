# 从项目切入，浅谈Router、WithRouter、useHistory等React-Hooks的爱恨情仇

## 为何想写这篇博文？

在我们组内的开发中，看到我们的现有的路由跳转的方式，清一色的都是使用window.location.href。这种方式对于调试不够友好（在开发环境下必须要加前缀，而本地调试的时候又必须要手动去掉前缀，例如我们组的卖家中心项目就是/seller#/，而这样是代理到了代理环境，而不是开发环境本身。都说React是有三件套的，React、React-Router、Redux（以及Mobx等为代表的其它状态管理工具）。然而在我们项目中，用React-Router进行路由跳转的方式为之甚少。所以这引发了我的兴趣，便想把这个查清楚一些。

## 对于已有的window.location.href问题要怎么解决？

首先需要声明一个范围（免责声明），只对于同一个项目中的页面可以这么跳，其它的不适用React-Router的跳转。

如果有上面的免责声明的限制，那么我们就可以对已有的项目进行如下改造。下面分两种情况进行讨论：

- 如果是类组件，使用WithRouter

withRouter是一个高阶组件，它会把类组件包装成一个高阶组件，在原来的基础上添加react-router的match、history、location三个对象（其实还有staticContext，不过不常用）到我们的类组件中。这样对于我们层级较深的，没有直接和外层路由相连的组件，我们也可以直接对其进行路由操作。

下面我们举例子来看这个的用法：

1.首先，我们要把withRouter和RouterComponentProps导入进来。

```ts
import { RouteComponentProps, withRouter } from 'react-router-dom';
```

2.其次，我们要改变类组件的声明。这样ts的类型检测才不会报错，否则后面我们用到props属性的时候，是拿不到history对象的。

```ts

interface IApplicationRecordProps extends RouteComponentProps<void> {
  applicationRecordStore: ApplicationRecordStore;
}

// 这里我们不能直接export出去，因为我们还需要用withRouter进行高阶组件的封装。
@observer
class ListTable extends React.Component<IApplicationRecordProps, IDetailTableStates> {
  // ....里面是类的方法
}
```

3.再次，**是我们的核心**。我们要使用这个来进行路由跳转方式的替换。

变更前：
```ts
window.location.href = `/admin/merchant#/brand-info-edit?brandCode=${brandCode}&applyType=UPDATE`;
```

变更后：
```ts
const { history } = this.props;
history.push(`/brand-info-edit?brandCode=${brandCode}&applyType=UPDATE`);
```

4.最后，使用WithRouter形成一个高阶组件。

```ts
export default withRouter(ListTable);
```

注：withRouter的使用范围有两个限制。

​       第一个是类组件，只有在类组件中才能使用。

​       第二个是不直接与主页面的路由相连，才需要用withRouter高阶组件。如果当前的组件有Router，则直接使用Router即可，不需要用withRouter添加路由对象进去。

- 如果是函数组件，使用useHistory

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

<img src="./img/historyContent.png"/>

3.获取到这个路由对象我们就可以全局来进行使用。如下是两个使用示例，也可以结合hooks来进行使用。

```ts
/**
  * 取消操作
  */
const handleCancel = () => {
  history.push('/merchant/freeShipping/list');
};

/** 保存成功操作 **/
const saveSuccess = () => {
  // 前面还有部分业务代码，不主要，省略 //
  try {
    saveFlag.current = true;
    await savePolicies(saveRuleObjList);
    Toast.success('保存成功', 2000);
    setTimeout(() => {
      history.push('/merchant/freeShipping/list');
    }, 2000);
  } catch (err) {
    const error = err as AxiosError;
    Toast.error(error?.response?.data?.message || '保存失败', 2000);
    saveFlag.current = false;
  }
}
```

- 如果跳转路由方法写到store里面，我们需要想办法放到组件执行

我们的store是一个类，它并没有路由的这些方法，而路由的方法都是需要借助React组件来执行的，并没有直接的关联。所以对于这个问题，我有以下的两个思路来解决这个问题。

1. 在某个合适的时机传入跳转路由的方法，利用回调函数的机制来进行执行。

   比如这里是我们项目中的一段代码，拿它来举例。

   ```tsx
   /** ContactInformation.tsx **/
   import { withRouter, RouteComponentProps } from 'react-router-dom';
   interface IContractorInformationProps extends RouteComponentProps<void> {
     contractManagePageSore: ContractManagePageSore; // contractManagePageSore
   }
   
   @observer
   class ContractorInformation extends React.Component<IContractorInformationProps, {}> {
     componentDidMount() {
       const { contractManagePageSore } = this.props;
       contractManagePageSore.getSigningUser();
     }
       
     /**
      * 异步提交页面数据
      */
     async submitContractManage() {
       const { contractManagePageSore } = this.props;
       /** 保存成功时的回调函数，设置并传入到store里面去 */
       const submitSuccessCallback = () => {
         history.push('/contract-manage');
       };
       contractManagePageSore.setSubmitSuccessCallback(submitSuccessCallback);
       /** 上面一段为新增代码 **/ 
       contractManagePageSore.submitConfig();
     }
       
     /** 渲染 **/
     render() {
         return  
         	<SubmitConfigConfirm
           	closeModal={() => contractManagePageSore.toggleConfirmLayer()}
           	store={contractManagePageSore}
           	submit={() => this.submitContractManage()}
         	/>
     }
   }
   export default withRouter(ContractorInformation)
   /** contactManagePageSore.ts **/ 
   class ContractManagePageSore {
     /** 保存成功时的回调函数 */
     @observable submitSuccessCallback: (() => void) | null = null;
   
     /** 设置保存成功时的回调函数 */
     @action setSubmitSuccessCallback = (fn: () => void) => {
       this.submitSuccessCallback = fn;
     };
     /** 上面两个状态也是新增的 **/
     // 合同发布提交
     @action
     async submitConfig() {
       if (this.operationing) {
         this.operationing = false;
         try {
           const flag = await contractPublish(this.publishSigningParams);
           if (flag) {
             this.operationing = true;
             Toast.success('发布成功', 2000);
             // 这里从直接的跳转，变成了调用回调函数。
             if (submitSuccessCallback) {
                 setTimeout(() => {
                   // window.location.href = '/admin/merchant#/contract-manage';
                   submitSuccessCallback();
                 }, 2000);
             }
           } else {
             Toast.error('发布失败！', 2000);
           }
         } catch (err) {
           if (err.response.status === 409) {
             Toast.error(err.response.data, 2000);
           } else if (err.response.status === 504) {
             Toast.error('系统异常，请刷新重试~', 2000);
           } else {
             Toast.error('发布失败！', 2000);
           }
         }
       }
     }
   }
   ```

2. 我们可以将处理的方法或者方法处理的值，进行拆解或者移动到组件中来执行。这种适用于逻辑不复杂，需要整理逻辑代码不多的情况。

   其实在store中进行数据的组装是可以的，但是如果涉及到路由跳转的，尽量还是在组件上写方法进行组装数据。所以这种方式可能改动量就会有点大，需要进行数据的判断。但是也给我们提了个醒，如果不是只是单纯组装数据的工具类方法，需要对方法进行更细力度的拆分。将交互等内容，尽量放在组件的方法里面去完成。

   结合具体示例来看，我们要如何对其进行改造。下面的例子只是最简单的一种情况，可以参考改造难度进行发挥。
   
   旧代码：
   
  ```tsx
    /** Operation.tsx**/
    interface IMarketingDetailStore extends RouteComponentProps<void> {
      marketingDetailStore: MarketingDetailStore;
    }
    class Operation extends React.Component<IMarketingDetailStore, {}> {
      render() {
        const { marketingDetailStore, history } = this.props;
        /** 取消方法 */
        const cancel = () => {
          history.push('/marketing-sharing');
        };
        return (
          <div className={marketingDetailStyle.operationMargin}>
            <Button
              className={marketingDetailStyle.operationSave}
              onClick={marketingDetailStore.saveSetting}
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
    
    /** MarketingDetailStore.ts **/
    class MarketingDetailStore {
      /**
        * 保存配置
      */
      saveSetting = async () => {
        if (!this.startTime || !this.endTime) {
          Toast.error('请设置活动时间', 2000);
          return;
        }
        const param: IProductShareRequest = {
          id: this.shareId,
          shareStartTime: this.startTime.valueOf(),
          shareEndTime: this.endTime.valueOf(),
          remark: this.remark || undefined,
        };
        try {
          const result = await saveDetailInfo(param);
          if (result) {
            Toast.success('保存成功', 2000);
            setTimeout(() => {
              window.location.href = '/admin/merchant#/marketing-sharing';
            }, 2000);
          }
        } catch (e) {
          Toast.error('保存失败', 2000);
        }
      };
    }
  ```
​       新代码：

  ```tsx
    /** Operation.tsx**/
    interface IMarketingDetailStore extends RouteComponentProps<void> {
      marketingDetailStore: MarketingDetailStore;
    }
    class Operation extends React.Component<IMarketingDetailStore, {}> {
    render() {
      const { marketingDetailStore, history } = this.props;
      /** 取消方法 */
      const cancel = () => {
        history.push('/marketing-sharing');
      };
      /** 将store中的方法提出来到这里 **/
      const save = async () => {
        const { startTime, endTime, getParam } = marketingDetailStore;
        if (!startTime || !endTime) {
          Toast.error('请设置活动时间', 2000);
          return;
        }
        const param = getParam();
        try {
          const result = await saveDetailInfo(param);
          if (result) {
            Toast.success('保存成功', 2000);
            setTimeout(() => {
              window.location.href = '/admin/merchant#/marketing-sharing';
            }, 2000);
          }
        } catch (e) {
          Toast.error('保存失败', 2000);
        }
      };
      return (
        <div className={marketingDetailStyle.operationMargin}>
          <Button
            className={marketingDetailStyle.operationSave}
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

        
    /** MarketingDetailStore.ts **/
    class MarketingDetailStore {
      /** 获取查询参数 * */
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

从我们的项目来看，都用的是哈希路由（即HashRouter)。我们的脚手架创建出来的入口文件app.tsx，差不多是这样的一个结构。

```ts
import { Provider } from 'mobx-react';
import React from 'react';
import ReactDOM from 'react-dom';
import { HashRouter } from 'react-router-dom';
import { renderRoutes } from 'react-router-config';
import '@casstime/bricks/lib/styles/bricks.scss';

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

以下代码只保留了主干部分。这里我们可以看到它们的代码结构几乎一模一样，区别只在于传入的history属性的方法不一样而已。都使用了history这个库，通过传入的history方法来判断是BrowserRouter还是HistoryRouter。那么我们分两个部分展开去讲。分别分析Router组件和简单看一下createBrowserHistory和createHashHistory给我们带来了什么特性。

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

Router源码：
```js
import React from "react";

// 这两个只是提供一个普通的上下文，用来创建一个Context而已
// 都调用了createNamedContext这个方法。用于向下传递共享的属性
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
    // 初始状态值是通过传入的history对象来拿到的。
    this.state = {
      location: props.history.location
    };

    // This is a bit of a hack. We have to start listening for location
    // changes here in the constructor in case there are any <Redirect>s
    // on the initial render. If there are, they will replace/push when
    // they mount and since cDM fires in children before parents, we may
    // get a new location before the <Router> is mounted.
    // 这个是一个比较hack的地方。因为子组件会比父组件更早渲染完成, 以及<Redirect>的存在, 若是在<Router>的
    // componentDidMount生命周期中对history.location进行监听, 则有可能在监听
    // 事件注册之前, history.location已经由于<Redirect>发生了多次改变, 因此我们
    // 需要在<Router>的constructor中就注册监听事件
    this._isMounted = false; // 设定了加载完毕的状态
    this._pendingLocation = null; // 是否是在读取中的路由

    if (!props.staticContext) { // 这里其实BrowserRouter和HashRouter都走这里，它们都不是静态上下文
      // 这里其实注册了一个函数，用于全局监听路由的变化（注册即监听）。
      // 这个是history库提供的机制。可以理解为window.addEventListener。执行这个函数相当于取消监听。
      // You can make use of history.listen() function when trying to detect the route change.
      this.unlisten = props.history.listen(location => {
        if (this._isMounted) { // 如果已经加载过路由了，那我就直接跳转位置就好了
          this.setState({ location });
        } else {
          this._pendingLocation = location; // 如果是初次加载，则需要暂存一下存储的路由位置，以便于组件加载的时候，能获取到这个地址
        }
      });
    }
  }

  componentDidMount() {
    this._isMounted = true; // 加载完成的时候，就设置已经加载状态为true
    if (this._pendingLocation) { // 这个就是pendingLocation的意义，如果组件没有加载成功的时候，它能从这里面获取值，去设置
      this.setState({ location: this._pendingLocation });
    }
  }

  componentWillUnmount() {
    // 如果unlisten存在，就执行unlisten()，取消了对路由的监听。并设置加载和pendingLocation为初始化状态
    // You can unlisten by calling (`this.unlisten()`).
    if (this.unlisten) { 
      this.unlisten();
      this._isMounted = false;
      this._pendingLocation = null;
    }
  }

  render() {
    return (
      // 主要的功能就是为子组件提供数据支持，以便于子组件进行获取、更改、跳转。
      <RouterContext.Provider
        value={{
          history: this.props.history, // 即外部传入的history属性
          location: this.state.location, // 当前被设置的location
          match: Router.computeRootMatch(this.state.location.pathname), // path params url isExact四个属性
          staticContext: this.props.staticContext // 如果是BrowserRouter和HashRouter其实都是null
        }}
      >
        <HistoryContext.Provider
          children={this.props.children || null}
          value={this.props.history}
        />
      </RouterContext.Provider>
    );
  }
}

export default Router;
```

createBrowserHistory和createHashHistory这里我们只是看看它的返回值有什么内容，看一下它的类型。不作为重点进行讲述。有兴趣的可以看一下源码（ps.因为源码实在太长了，我感觉需要单列一篇单独研究）

createBrowserHistory和createHashHistory中返回的内容基本是一致的，它们的不同区别主要是对路径的处理上。具体参阅源码，这里不进行赘述。（后面等我搞明白了，补一篇叙述吧）

我们可以看到熟悉的go，push，以及刚才我们用到的listen等方法都能看到，都是这个对象暴露出来的。
```ts
  // 这个history就是它返回的值
  let history: HashHistory = {
    get action() {
      return action;
    },
    get location() {
      return location;
    },
    createHref,
    push,
    replace,
    go,
    back() {
      go(-1);
    },
    forward() {
      go(1);
    },
    listen(listener) {
      return listeners.push(listener);
    },
    block(blocker) {
      let unblock = blockers.push(blocker);

      if (blockers.length === 1) {
        window.addEventListener(BeforeUnloadEventType, promptBeforeUnload);
      }

      return function() {
        unblock();

        // Remove the beforeunload listener so the document may
        // still be salvageable in the pagehide event.
        // See https://html.spec.whatwg.org/#unloading-documents
        if (!blockers.length) {
          window.removeEventListener(BeforeUnloadEventType, promptBeforeUnload);
        }
      };
    }
  };
```

再次回到我们的app.tsx文件，我们可以看到有一个renderRoutes。那这个又是咋回事呢？实际上它只不过是把我们的路由列表map了一下，然后生成若干个Route组件而已。

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
      {routes.map((route, i) => (
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
      ))}
    </Switch>
  ) : null;
}

export default renderRoutes;
```
详细的看一下Route组件里面都有啥。老样子，我们依旧只看主干代码，对警告等无关紧要的内容忽略掉。
```js
  //switch核心模块
  let match, child;
  React.Children.forEach(children, element => {
    if (match == null && React.isValidElement(element)) {
      const {
        path: pathProp,
        exact,
        strict,
        sensitive,
        from
      } = element.props;
      const path = pathProp || from;

      child = element;
      match = matchPath(
        location.pathname,
        { path, exact, strict, sensitive },
        route.match
      );
    }
  });

  return match
    ? React.cloneElement(child, { location, computedMatch: match })
    : null;
```

```js
// Route组件
class Route extends React.Component {
  render() {
    return (
      // 这里声明了一个消费者，那么我们就可以拿到ReactContext.Provider里面的值
      // 即history，location，match，staticContext属性。
      <RouterContext.Consumer>
        {context => {
          // 在Switch下面的话，location会传入。如果没有location，则会用Provider提供的location
          const location = this.props.location || context.location; 
          // 如果是在Switch下面，就会传入这个属性。
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
          // 一系列的判断和渲染
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
    // 解构出一个ref，用于单独去引用这个dom，具体原因不太明确
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
  // 使用hoistStatics这个库是想把高阶组件和静态方法聚合起来
  return hoistStatics(C, Component);
}

export default withRouter;
```

下面我们再看看Hooks给我们提供的四个Router Hooks。其实他们每个方法里面都有一个版本的警告提示，如果判断组件不是函数的时候，会给出警告提示。不过这里为了简单，我把他们都删去了
```js
import React from "react";
import RouterContext from "./RouterContext.js";
import HistoryContext from "./HistoryContext.js";
import matchPath from "./matchPath.js";

const useContext = React.useContext;

export function useHistory() {
  // 这里的HistoryContext，我们上面其实见过，这个上下文中，只有history对象的值，包含了若干属性。
  // 这个是我们调用useHistory钩子能够拿到history对象值的原因。
  return useContext(HistoryContext);
}

export function useLocation() {
  // 同理，这里的RouterContext，我们也见过，包含history，location，match，staticContext属性
  // 我们拿到了这里的location属性
  return useContext(RouterContext).location;
}

export function useParams() {
  // 同理，这里的RouterContext，我们也见过，包含history，location，match，staticContext属性
  // 这里我们拿到了match属性
  const match = useContext(RouterContext).match;
  // 如果有match属性，则返回match属性里的参数，即动态路由里的值
  return match ? match.params : {};
}

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