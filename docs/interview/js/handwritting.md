# 手写题整理

## 1. 手写call

- 思路1（纯es5）

> 总体思路是添加一个属性挂载我们当前的this(即调用方函数)，使用eval的方式其实是模拟了es6的拓展运算符，最后别忘了删除这个挂载的属性

```js
Function.prototype.newCall = function (context) {
  // 基本思路是，context拿到调用call方法的函数，然后将函数执行，再删除调用函数的这个属性
  // 第三版添加
  var context = context || window;
  context.func = this;
  // 第二版改造
  var args = [];
  // 从1开始是忽略掉thisArg
  for(var i = 1; i < arguments.length; i++) {
    // 注意这里要拼成的是'arguments[1]'、’arguments[2]’这种
    // 我们要借助eval，而eval就是这么用的
    args.push('arguments['+i+']');
  }
  // 第二版替换，为了解决带参数的问题
  // eval('context.func(' + args + ')');
  // 第三版更改
  var result = eval('context.func(' + args + ')');
  delete context.func;
  return result;
```

- 思路2（es6）
> 其实和思路1差不多，但是写法更加简洁明确。
```js
Function.prototype.newCall = function(context) {
  // 1. 判断执行对象为函数
  if (typeof this !== 'function') {
    console.error('this is not a function');
  }
  // 2. 获取执行函数的参数
  let args = [...arguments].slice(1);
  let result = null;

  // 3. 传入值判断，是否有值，如果没有，默认为window
  if(!context) {
    context = window;
  }
  const tempSymbol = Symbol();
  // 4. 执行对象挂载到上下文上
  context[tempSymbol] = this;
  // 5. 在上下文中执行调用对象并且执行函数
  result = context[tempSymbol](...args);
  // 6. 将上下文复原
  delete context[tempSymbol];
  // 7. 返回5的结果
  return result;
}
```

## 2. 手写apply

- 思路1
> 和call的实现方式大同小异
```js
Function.prototype.newApply = function(context,arr) {
  // 判断调用方是否为函数
  if(typeof this !== 'function') {
    throw new TypeError('this is not a function');
  }
  // 如果有上下文就用上下文，没有上下文就用window
  var context = context || window;
  // 在上下文上挂载一个属性，当然这个其实应该用symbol更好一些，以免冲突
  context.func = this;

  var args = [];
  var result;
  // 如果没有传arr，即没有参数，则表明是直接调用
  if (!arr) {
    result = context.func();
  } else {
    // 否则就需要依次构造调用参数
    for (var i = 0 ; i < arr.length; i++) {
      args.push('arr[' + i + ']');
    }
    // 进行调用
    result = eval('context.func(' + args + ')');
  }
  // 需要删除我们自己挂载的这个属性
  delete context.func;
  return result;
}
```

- 思路2
> 使用es6来实现，思路更加简洁

```js
Function.prototype.newApply = function(context) {
  // 类型检测，是否是函数
  if (typeof this !== 'function') {
    throw new Error('this is not a function');
  }
  // 参数检测
  let _context = context || window;
  // 临时进行挂载
  _context.func = this;
  // 获取参数列表 
  let args = Array.prototype.slice.call(arguments);
  // 因为第一个参数是this，所以我们要获取第二个参数是否存在，然后分别执行
  let result = args[1] ? _context.func(...args[1]) : _context.func();
  // 删除我们自己挂载的属性
  delete _context.func;
  // 返回结果
  return result;
}
```

- 思路3
> 该方法较为复杂，考虑了很多边界情况，使用了Function函数来进行实现

```js
Function.prototype.applyFn = function apply(thisArg, argsArray){ // `apply` 方法的 `length` 属性是 `2`。
  // 1.如果 `IsCallable(func)` 是 `false`, 则抛出一个 `TypeError` 异常。
  if(typeof this !== 'function'){
      throw new TypeError(this + ' is not a function');
  }
  // 2.如果 argArray 是 null 或 undefined, 则
  // 返回提供 thisArg 作为 this 值并以空参数列表调用 func 的 [[Call]] 内部方法的结果。
  if(typeof argsArray === 'undefined' || argsArray === null){
      argsArray = [];
  }
  // 3.如果 Type(argArray) 不是 Object, 则抛出一个 TypeError 异常 .
  if(argsArray !== new Object(argsArray)){
      throw new TypeError('CreateListFromArrayLike called on non-object');
  }
  if(typeof thisArg === 'undefined' || thisArg === null){
      // 在外面传入的 thisArg 值会修改并成为 this 值。
      // ES3: thisArg 是 undefined 或 null 时它会被替换成全局对象 浏览器里是window
      thisArg = getGlobalObject();
  }
  // ES3: 所有其他值会被应用 ToObject 并将结果作为 this 值，这是第三版引入的更改。
  thisArg = new Object(thisArg);
  var __fn = '__' + new Date().getTime();
  // 万一还是有 先存储一份，删除后，再恢复该值
  var originalVal = thisArg[__fn];
  // 是否有原始值
  var hasOriginalVal = thisArg.hasOwnProperty(__fn);
  thisArg[__fn] = this;
  // 9.提供 `thisArg` 作为 `this` 值并以 `argList` 作为参数列表，调用 `func` 的 `[[Call]]` 内部方法，返回结果。
  // ES6版
  // var result = thisArg[__fn](...args);
  var code = generateFunctionCode(argsArray.length);
  var result = (new Function(code))(thisArg, __fn, argsArray);
  delete thisArg[__fn];
  if(hasOriginalVal){
      thisArg[__fn] = originalVal;
  }
  return result;
};
```

## 3. 手写bind

- 思路1（基于apply已经实现的基础上）

```js
Function.prototype.newBind = function() {
  // 1. 获取调用的函数，是谁调用的bind
  const _this = this;
  const args = Array.prototype.slice.call(arguments);
  // 2. 获取原绑定函数的this，同时改变args的内容
  const newThis = args.shift();
  return function() {
    // 3. 返回原函数执行结果，传参不变
    return _this.apply(newThis, args);
  }
}

```

- 思路2（从0开始实现，思路更为严密）
```js
Function.prototype.newBind = function bind(thisArg){
  if(typeof this !== 'function'){
      throw new TypeError(this + ' must be a function');
  }
  // 存储调用bind的函数本身
  var self = this;
  // 去除thisArg的其他参数 转成数组
  var args = [].slice.call(arguments, 1);
  var bound = function(){
      // bind返回的函数 的参数转成数组
      var boundArgs = [].slice.call(arguments);
      var finalArgs = args.concat(boundArgs);
      // new 调用时，其实this instanceof bound判断也不是很准确。es6 new.target就是解决这一问题的。
      // bind返回的函数如果作为构造函数，搭配new关键字出现的话，我们的绑定this就需要“被忽略”
      if(this instanceof bound){
          // 这里是实现上文描述的 new 的第 1, 2, 4 步
          // 1.创建一个全新的对象
          // 2.并且执行[[Prototype]]链接
          // 4.通过`new`创建的每个对象将最终被`[[Prototype]]`链接到这个函数的`prototype`对象上。
          // self可能是ES6的箭头函数，没有prototype，所以就没必要再指向做prototype操作。
          if(self.prototype){
              // ES5 提供的方案 Object.create()
              // bound.prototype = Object.create(self.prototype);
              // 但 既然是模拟ES5的bind，那浏览器也基本没有实现Object.create()
              // 所以采用 MDN ployfill方案 https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Object/create
              function Empty(){}
              Empty.prototype = self.prototype;
              bound.prototype = new Empty();
          }
          // 这里是实现上文描述的 new 的第 3 步
          // 3.生成的新对象会绑定到函数调用的`this`。
          var result = self.apply(this, finalArgs);
          // 这里是实现上文描述的 new 的第 5 步
          // 5.如果函数没有返回对象类型`Object`(包含`Functoin`, `Array`, `Date`, `RegExg`, `Error`)，
          // 那么`new`表达式中的函数调用会自动返回这个新的对象。
          var isObject = typeof result === 'object' && result !== null;
          var isFunction = typeof result === 'function';
          if(isObject || isFunction){
              return result;
          }
          return this;
      }
      else{
          // apply修改this指向，把两个函数的参数合并传给self函数，并执行self函数，返回执行结果
          return self.apply(thisArg, finalArgs);
      }
  };
  return bound;
}
```
