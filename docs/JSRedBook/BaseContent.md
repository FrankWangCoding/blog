# 基本概念
## 语法
- 区分大小写：意味着变量名test和Test是两个不同的变量。
- 标识符：标识符是可以按照如下规则组成的一个或者多个字符。
  - 第一个字符必须是一个字母、下划线(_)或者美元符号($)
  - 其他字符可以是字母、下划线、美元符号或者数字。  

总结：数字不能作为标识符的首位，而字母、下划线、美元符号均可以作为标识符的任意位置出现。  
注意：不能把关键字、保留字、true、false和null作为标识符。（关键字和保留字后面有相应的概念说明）
- 注释：在Javascript中沿用了c语言风格的注释，即如下格式：
  - 单行注释
  ```js
    /// 单行注释
  ```
  - 多行注释
  ```js
    /*
     * 这是一个多行
     * （块级）注释(中间两个星号非必须，只是提高可读性)
     */
  ```
- 严格模式：如果要在整个脚本中启用严格模式，可以在脚本顶部添加如下代码：
  ```js
    "use scrict";
  ```
  也可以在函数内部第一行包含这个编译指示，这样就可以指定该函数在严格模式下执行。
  ```js
    function doSomething () {
      "use scrict";
      // 函数体
    }
  ```
- 语句：
  - 以分号结尾。如果省略分号，则由解析器确定语句的结尾。
  - 使用代码块可以让编程意图更加清晰，也能降低代码出错的几率。
## 关键字和保留字
关键字：这些关键字可用于表示控制语句的开始或者结束。或者用于执行特定操作等。
| # | # | # | # |
|:-:|:-:|:-:|:-: |
break | do | instanceof | typeof |
case | else | new | var |
catch | finally | return | void |
continue | for | switch | while |
debugger | function | this | with |
default | if | throw | delete |
in | try |
保留字：ECMA-262还描述了另外一组不能作为标识符的保留字。它们可能在未来会用作关键字。
| # | # | # | # |
|:-:|:-:|:-:|:-:|
abstract | enum | int | short|
boolean | export | interface | static |
byte | extends | long | super |
char | final | native | synchronized |
class | float | package | throws |
const | goto | private | transient |
debugger | implements | protected | volatile |
double | import | public 
在ES5中在非严格模式下把运行时的保留字缩减为以下这些：
| # | # | # | # |
|:-:|:-:|:-:|:-:|
class | enum | extends | super |
const | export | import |
在严格模式下，ES5还对以下的保留字施加了限制：
| # | # | # |
|:-:|:-:|:-:|
implements | package | public |
interface | private | static |
let | protected | yield |
为了保证兼容性，尽量不要用以上的关键字和保留字。防止发生意料之外的错误。
## 变量
- ECMAScript的变量是松散类型的，就是可以用来保存任何类型的数据。每个变量仅仅是一个保存值的占位符而已。定义变量时要用var操作符，后面跟变量名：
  ```js 
    var message;
  ```
- 使用var操作符定义的变量将成为定义该变量作用域的局部变量，如果没有赋任何值，那么该值默认为undefined
- 可以在变量值的同时修改值的类型，但是这种做法是不推荐的。
  ```js
    var message = "hi";
    message = 100; // 有效但是不推荐
  ```
- 如果在函数中使用var定义了一个变量，那么这个变量在函数退出后被销毁。
- 省略var运算符，可以创建一个全局变量，但是这种做法是不推荐的。因为全局变量很难维护，也会由于相应变量不会马上就有定义而导致不必要的混乱
  ```js
    function test () {
      message = "hi" // 全局变量，不推荐使用
    }
    test();
    alert(message); // "hi"
  ```
- 定义多个变量，只需要用逗号隔开即可。
  ```js
    var message = 'hi',
        found = false, 
        age = 29
  ```
## 数据类型
ECMAScript中有五种（实际上现在为6种，es6中新增了Symbol）简单数据类型（也称基本数据类型）:Undefined,Null,Boolean,Number,String和一种复杂数据类型：Object。
- typeof运算符

使用typeof可能返回下列某个字符串。
  - 如果这个值为定义，返回"undefined"。
  - 如果这个值是布尔值，返回"boolean"。
  - 如果这个值是字符串，返回"string"。
  - 如果这个值是数值，返回"number"。
  - 如果这个值是对象或者null，返回"object"。
  - 如果这个值是函数，返回"function"

注: 
1. typeof是一个操作符而不是函数。
2. typeof(null)的结果是object，这个可以算作一个bug，也可以理解成null是一个空对象的指针，但是它并不是一个对象。

- undefined类型
  - 它只有一个值，即特殊的undefined。
  - 如果一个变量声明但是没有初始化，那么它的值是undefined。
  - typeof未初始化和未声明的变量都是undefined。
  - 建议声明即赋值初始化。

- null类型
  - 它同样也只有一个值，即特殊的null。
  - 从逻辑的角度上看，null表示一个空对象指针。
  - 如果定义的变量准备在将来保存对象，那么最好将该变量初始化为null而不是其他值。这样的目的是只要检查null值就可以看变量是否已经保存了一个对象的引用。
  ```js
    if (car!= null) {
      // 对car对象执行某些操作
    }
  ```
  - undefined值是派生自null的，所以有:
  ```js
    null == undefined // true
  ```

- Boolean类型
  将一个值转换为对应的Boolean类型的值，实际上都调用了Boolean()函数。下表给出各种数据类型及对应的转换规则。
  | 数据类型 | 转换为true的值 | 转换为false的值
  |:-:|:-:|:-:|
  Boolean | true | false |
  String | 任何非空字符串 | ""(空字符串) |
  Number | 任何非零数字值（包括无穷大）| 0和NaN |
  Object | 任何对象 | null(虽然严格说null并不是Object类型) |
  Undefined | (不存在这样的值) | undefined
  因为存在自动执行的Boolean转换，所以知道在流控制语句中使用的是什么变量至关重要。

- Number类型
  - 不同进制的数字的表示
    1. 十进制：直接用数字表示就可以。
    ```js
      var intNum = 55; // 整数
    ```

    2. 八进制：八进制字面值的第一位必须是0，然后是八进制序列（0～7）。如果字面值中的值超过了范围，那么前导0将被忽略。后面的数值当作十进制来解析。
    ```js
      var octalNum1 = 070; // 八进制的56
      var octalNum2 = 079; // 无效的八进制数值---解析为79
      var octalNum3 = 08; // 无效的八进制数值---解析为8
    ```
    注：八进制字面量在严格模式下是无效的，会导致支持该模式的Javascript引擎抛出错误。

    3. 十六进制：十六进制字面量的前两位必须是0x，后面接任何十六进制数字（0～9及A～F）。其中，A～F可以大写也可以小写。
    ```js
      var hexNum = 0xA; // 十六进制的10
      var hexNum = 0x1f; // 十六进制的31
    ```
  - 浮点数值
    1. 所谓浮点数值就是该数值中必须包含一个小数点。并且小数点后面必须至少有一位数字。虽然小数点前面可以没有整数，但是这种写法并不推荐。
    ```js
      var floatNum1 = 1.1;
      var floatNum2 = 0.1;
      var floatNum3 = .1; // 有效，但不推荐
    ```
    2. 如果小数点后面没有跟数字，那么这个值将作为整数值保存。同样，如果浮点数本身表示的就是一个整数，那么该值也会转换为整数。
    ```js
      var floatNum1 = 1.; // 小数点后面没有数字---解析为1
      var floatNum2 = 10.0; // 整数---解析为10
    ```
    3. 极大或者极小的值可以用e表示法（科学计数法）表示。
    ```js
      var floatNum1 = 3.125e7 // 等于31250000
    ```
    4. 浮点数值的最高精度为17位小数，但是进行算数计算的时候，其精确性远不如整数。
    ```js
      if(a + b == 0.3) { // 不要做这样的测试，有个很经典的例子就是，0.1 + 0.2 = 0.30000000000000004
        alert('You got 0.3')
      }
    ```
    5. 数值范围
       - 超过Number.MAX_VALUE的正值会被转换成Infinity,负值会被转换成-Infinity
       - 如果某次计算返回了正或负的Infinity值，那么该值将无法参与下次计算。判断某个值是否是有穷的（即最小值到最大值之间）可以用isFinite()函数
        ```js
          var result = Number.MAX_VALUE + Number.MAX_VALUE;
          alert(result); // Infinity
          alert(isFinite(result)); // false
        ```
       - Number.NEGATIVE_INFINITY: -Infinity，Number.POSITIVE_INFINITY:Infinity(正无穷和负无穷)

       - Number.MAX_VALUE的值为：Infinity（通常情况下这个值为1.7976931348623157e+308)

       - Number.MIN_VALUE的值为：通常情况下这个值为5e-324
  - NaN(非数值)
    1. 任何涉及NaN操作都返回NaN
    2. NaN和任何值都不相等，包括它自身
    3. 判断一个值是否不是数字可以用isNaN函数，这个函数接收一个参数，该参数可以是任何类型，而该函数会帮我们确定这个参数是否不是数值。isNaN接收到这个参数后，会尝试先将它转换为数值，而任何不能被转化的数值的值都会导致这个函数返回true。
    ```js
      alert(isNaN(NaN)); // true
      alert(isNaN(10)); // false(10是一个数值)
      alert(isNaN("10")); // false(可以被转化成数值10)
      alert(isNaN("blue")); // true
      alert(isNaN(true)); // false(可以被转化成数值1)
    ```
  - 数值转换
  数值转换共有三个函数：Number(),ParseInt(),ParseFloat()
  Number的转换规则如下：
    1. 如果是Boolean值，true和false将分别会转换成1和0。
    2. 如果是数字值，只是简单的传入和返回。
    3. 如果是null值，返回0。
    4. 如果是undefined，返回NaN。
    5. 如果是字符串则遵循如下规则：
       - 如果字符串中只包括数字，则将其转换为十进制数值，即"1"变为1，"123"变成123，"011"变成11（前导0可以被忽略，带正负号也可以被转换）
       - 如果字符串中包含有效的浮点格式，如"1.1"，则将其转换成对应的浮点数值（同样可以忽略前导0，正负号可以被转换）
       - 如果字符串中包含有效的十六进制格式，例如："oxf"，则将其转换成相同大小的十进制整数。
       - 如果字符串是空的，不包含任何字符，则将其转换为0。
       - 如果字符串中包含除上述格式之外的字符，则将其转成NaN。
    6. 如果是对象，则调用对象的valueOf()方法，然后依次按照前面的规则转换返回的值。如果转换的结果为NaN,则调用对象的toString()方法，然后再次依照前面的规则转换返回的字符串值。
    ```js
      var num1 = Number("hello world"); // NaN
      var num2 = Number(""); // 0
      var num3 = Number("000011"); // 11
      var num4 = Number(true); // 1
    ```
  由于Number()函数在转换字符串时比较复杂且不够合理。处理整数的时候，更常用的是parseInt()函数。



