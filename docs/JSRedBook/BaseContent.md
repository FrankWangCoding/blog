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

  parseInt函数在转换字符串时会忽略前面的空格，直到找到第一个非空格字符。如果第一个不是数字字符或者负号，会返回NaN.如果第一个是数字字符，则会继续解析第二个字符，直到所有的字符都解析完全或者遇到一个非数字字符。如果字符串中的第一个数字是数字字符，parseInt()也能够识别出各种整数形式。

    ```js
    var num1 = parseInt("1234blue"); // 1234
    var num2 = parseInt(""); // NaN
    var num3 = parseInt("0xA"); //10（十六进制数）
    var num4 = parseInt("22.5"); // 22
    var num5 = parseInt("070"); // 56（八进制数）
    var num6 = parseInt("70"); // 70（十进制数）
    var num7 = parseInt("0xf"); // 15（十六进制数）
    ```
  处理八进制数时，ES3和ES5存在分歧，ES3会当成八进制来解析，ES5则会认为前导零无效。
  ```js
  var num5 = parseInt("070"); // ES3->56，ES5->70
  ```
  为了消除上述现象造成的疑惑，可以为这个函数提供第二个参数，即需要转换的进制数。可以保证得到正确的结果。
  ```js
  var num = parseInt("0xAF",16); // 175
  ```
  注：如果指定了16作为第二个参数，那么字符串可以不带前面的0x。
  ```js
  var num1 = parseInt("AF",16); // 175
  var num2 = parseInt("AF"); // NaN
  ```
  指定基数也会影响到转换的输出结果。
  ```js
  var num1 = parseInt("10",2); // 2(按照二进制进行解析)
  var num2 = parseInt("10",8); // 8(按照八进制进行解析)
  var num3 = parseInt("10",10); // 10(按照十进制进行解析)
  var num4 = parseInt("10",16); // 16(按照十六进制进行解析)
  ```
  为了避免错误的解析，建议无论什么情况下都要指定基数。

- String类型
  - 可以由双引号或者单引号表示。但是要成对出现。
  ```js
    var firstName = "Nicholas"
    var lastName = 'Zakas'
  ```
  - 要把一个值转换为字符串由两种方式。分别为toString()和String()。
    1. toString()
       - 数值、布尔值、对象和字符串值都有toString()方法。但null和undefined没有这个方法。
       - 多数情况下调用toString()方法不必传递参数，但是调用数值的toString()方法时可以传递一个参数，输出数值的基数。通过传递基数，可以输出二进制、八进制、十六进制等其它有效进制表示的字符串值。
      ```js
      var num = 10;
      alert(num.toString()); // "10"
      alert(num.toString(2)); // "1010"
      alert(num.toString(8)); // "12"
      alert(num.toString(10)); // "10"
      alert(num.toString(16)); // "a"
      ```
    2. String()
    
    在不知道要转换的值是不是null和undefined的情况下，可以使用转型函数String(),这个函数能够将任何值转成一个字符串。
       - 如果值有toString()方法，则调用该方法（没有参数）并返回相应的结果。
       - 如果值是null，则返回"null"。
       - 如果值是undefined，则返回"undefined"
    ```js
    var value1 = 10;
    var value2 = true;
    var value3 = null;
    var value4;
    alert(String(value1)); // "10"
    alert(String(value2)); // "true"
    alert(String(value3)); // "null"
    alert(String(value4)); // "undefined"
    ```

- Object类型
  创建Object类型的实例并为其添加属性和（或）方法，就可以创建自定义对象。
  ```js
  var o = new Object();
  var p = new Object; // 可以省略圆括号，但不推荐
  ```
  Object的每个实例都有下面的属性和方法：
  - constructor：保存着用于创建当前对象的函数。
  - hasOwnProperty(propertyName):用于检查给定的属性在当前对象的实例中（而不是实例的原型中）是否存在。propertyName必须以字符串形式指定。
  - propertyIsEnumerable(propertyName):用于检查传入的对象是否能够使用for-in语句来枚举。和hasOwnProperty一样，作为参数的属性名必须以字符串形式指定。
  - isPrototypeOf(object):用于检查传入的对象是否是当前对象的原型。
  - toLocaleString():返回对象的字符串表示，该字符串与执行环境的时区相对应。
  - toString():返回对象的字符串表示。
  - valueOf():返回对象的字符串、数值或布尔值表示。通常与toString()方法的返回值相同。
## 操作符
- 一元操作符
只能操作一个值的操作符叫一元运算符。
  1. 递增和递减操作符
  递增和递减操作符借鉴自c语言。分为前置型和后置型。
     - 前置型：变量的值是在语句被求值之前被改变。
     - 后置型：变量的值是在语句被求值之后被改变。
     直接上代码来演示这种情况。

      前置型
      ```js
      var age = 29;
      var anotherAge = --age + 2;
      alert(age); // 28
      alert(anotherAge) // 30，在求和之前age先自行改变，然后再进行求和操作的计算。
      var num1 = 2;
      var num2 = 20;
      var num3 = --num1 + num2; // 21，同样，在num1和num2相加的时候，num1先自减。
      var num4 = num1 + num2; //21
      ```
      
      后置型
      ```js
      var num1 = 2;
      var num2 = 20;
      var num3 = num1-- + num2; // 等于22，因为num3是由没有变化前的num1+num2而来，然后num1自减。
      var num4 = num1 + num2; // 等于21，同上，num1已经自减完毕，求和。
      ```

  在应用于不同的值时，递增和递减运算符遵循下列规则：
     - 在应用于一个包含有效数字字符的字符串时，先将其转换为数字值，再执行减一的操作，字符串变量变成数值变量。
     - 在应用于一个不包含有效数字字符的字符串时，将变量的值设置为NaN。字符串变量变成数值变量。
     - 在应用于布尔值false时，先将其转换为0再执行加减1的操作。布尔值变量变成数值变量。
     - 在应用于布尔值true时，先将其转换成为1再执行加减1的操作。布尔值变量变成数值变量。
     - 在应用于浮点数值时，执行加减1的操作。
     - 在应用于对象时，先调用对象的valueOf()方法以取得一个可供操作的值。然后对该值应用前述规则。如果结果是NaN，则在调用toString()方法后再应用前述规则。对象变量变成数值变量。

    ```js
    var s1 = "2";
    var s2 = "z";
    var b = false;
    var f = 1.1;
    var o = function () {
      valueOf:function () {
        return -1;
      }
    };
    s1++; // 值变成数值3
    s2++; // 值变成NaN
    b++; // 值变成数值1
    f--; // 值变成0.10000000000000009（由于浮点舍入错误所致）
    o--; // 值变成数值-2
    ```

  2. 一元加和减运算符
     - 一元加操作符以一个加号（+）表示，放在数值前面，对数值不会产生任何影响。不过对非数值应用一元加操作符时，该操作符会像Number()转型函数一样对这个值进行转换。即，布尔值false和true会转换为0或1，字符串值会被按照一组特殊的规则进行转换，对象是先调用他们的valueOf()和（或）toString()方法，再转换得到的值。
     ```js
     var s1 = "01"
     var s2 = "1.1"
     var s3 = "z";
     var b = false;
     var f = 1.1;
     var o = {
       valueOf:function() {
         return -1;
       }
     }
     s1 = +s1; // 值变成数值1
     s2 = +s2; // 值变成数值1.1
     s3 = +s3; // 值变成NaN
     b = +b; // 值变成0
     f = +f; // 值未变，仍然是1.1
     o = +o; // 值变成数值-1
     ```
     - 一元减操作符主要用于表示负数，例如将1转换成-1。它和一元加操作符的遵循的规则是一样的，只不过在于正负号的区别。
     ```js
     // 对于整数类型来说
     var num = 25;
     num = -num;
     ```

     ```js
     // 对于浮点数和其它类型来说
     var s1 = "01";
     var s2 = "1.1";
     var s3 = "z";
     var b = false;
     var f = 1.1;
     var o = {
       valueOf: function () {
         return -1;
       }
     }
     s1 = -s1; // 值变成了数值-1
     s2 = -s2; // 值变成了数值-1.1
     s3 = -s3; // 值变成了NaN
     b = -b; // 值变成了数值0
     f = -f; // 值变成了数值-1.1
     o = -o; // 值变成了数值1
     ```

- 位操作符
   1. 按位非（NOT）

   按位非用一个波浪线（~）来表示，按位非执行的结果就是返回数值的反码。该操作与二进制有关。
   ```js
   var num1 = 25; // 二进制00000000000000000000000000011001
   var num2 = ~num1; // 二进制11111111111111111111111111100110
   alert(num2);
   ```
   按位操作的本质是：操作数的负值再减去1。而且按位非是在数值表示的最底层操作，所以速度更快。
   2. 按位与（AND）
   按位与运算符由一个和号字符（&）表示，它有两个操作符数。本质上讲，按位与操作就是将两个数值的每一位对齐，然后根据下表的规则，对相同位置进行AND操作。
   | 第一个数值的位 | 第二个数值的位 | 结果
   |:-:|:-:|:-:|
   1 | 1 | 1 |
   1 | 0 | 0 |
   0 | 1 | 0 |
   0 | 0 | 0 |

   看一个按位与的例子
   ```js
  /*分析过程：
   *  25 = 0000 0000 0000 0000 0000 0000 0001 1001
   *   3 = 0000 0000 0000 0000 0000 0000 0000 0011
   * 结果 = 0000 0000 0000 0000 0000 0000 0000 0001
   */
   var result = 25 & 3;
   alert(result); // 1
   ```
   3.按位或（OR）
   按位或运算符由一个竖线符号（|）表示，同样也有两个操作数。按位或操作遵循下面这个真值表。
   | 第一个数值的位 | 第二个数值的位 | 结果
   |:-:|:-:|:-:|
   1 | 1 | 1 |
   1 | 0 | 1 |
   0 | 1 | 1 |
   0 | 0 | 0 |

   再看一个按位或的例子
   ```js
   /* 分析过程：
    *  25 = 0000 0000 0000 0000 0000 0000 0001 1001
    *   3 = 0000 0000 0000 0000 0000 0000 0000 0011
    * 结果 = 0000 0000 0000 0000 0000 0000 0001 1011
    */
   var result = 25 | 3;
   alert(result); // 27
   ```
   4.按位异或（XOR）
   按位异或操作符由一个插入符号（^）来表示，也有两个操作数。按位异或遵循下面的真值表。
   | 第一个数值的位 | 第二个数值的位 | 结果
   |:-:|:-:|:-:|
   1 | 1 | 0 |
   1 | 0 | 1 |
   0 | 1 | 1 |
   0 | 0 | 0 |
   同样再举相同的例子来看异或的结果
   ```js
   /* 分析过程:
    *  25 = 0000 0000 0000 0000 0000 0000 0001 1001
    *   3 = 0000 0000 0000 0000 0000 0000 0000 0011
    * 结果 = 0000 0000 0000 0000 0000 0000 0001 1010
    */
   var result = 25 | 3;
   alert(result); // 26
   ```

   5. 左移
   左移操作符由两个小于号（<<）表示，这个操作符会将数值的所有位向左移动指定的位数，然后多出的空位以0填充。
   ```js
   var oldValue = 2;
   var newValue = oldValue << 5; // 64，向右移动5位，相当于乘了2e5，也就是32，即2*32 = 64
   ```

   6. 有符号的右移
   有符号的右移操作符由两个大于号（>>）表示，这个操作符会将数值向右移动，但保留符号位（即正负号标记）。有符号的右移操作与左移操作恰好相反，即如果将64向右移动5位，则会变回2。
   ```js
   var oldValue = 64;
   var newValue = oldValue >> 5; // 2
   ```
   
   7. 无符号右移
   无符号右移操作符由三个大于号（>>>）表示。对正数来说，无符号右移结果与有符号相同。
   对负数则有所不同：
     - 无符号右移是以0来填充空位，而不是像有符号右移那样，以符号位的值来填充空位。
     - 无符号右移会把负数的二进制码当成正数的二进制码。
   ```js
   /* 过程分析：-64的二进制表示是：1111 1111 1111 1111 1111 1111 1100 0000
    * 向右移动五位 变成0000 0111 1111 1111 1111 1111 1111 1110
    * 这个计算的结果就是134217726
    */
   var oldValue = -64;
   var newValue = oldValue >>> 5; // 134217726
   ```
- 布尔操作符
   布尔运算符一共包括三个：非（NOT）、与（AND）和或（OR）。

   1. 逻辑非

   逻辑非运算符由一个叹号（！）表示，可以应用于ECMA中的任何值。逻辑非运算符首先会将它的操作数转换为一个布尔值，然后对其求反。逻辑非遵循如下规则：
    - 如果操作数是一个对象，返回false。
    - 如果操作数是一个空字符串，返回true。
    - 如果操作数是一个非空字符串，返回false。
    - 如果操作数是一个数0，返回true。
    - 如果操作数是任何非0数值（包括Infinity），返回false。
    - 如果操作数是null，返回true。
    - 如果操作数是NaN，返回true。
    - 如果操作数是undefined，返回true。
     
    ```js
    alert(!false); // true
    alert(!"blue"); // false
    alert(!0); // true
    alert(!NaN); // true
    alert(!""); // true
    alert(!12345); // false
    ```

    逻辑非也可以用于将一个值转换为与其相对应的布尔值。同时使用两个逻辑非可以实现这样的转换，结果与直接使用Boolean()函数相同。
    ```js
    alert(!!"blue"); // true
    alert(!!0); // false
    alert(!!NaN); //false
    alert(!!""); // false
    alert(!!12345) // true
    ```

   2. 逻辑与

   逻辑与操作符由两个和号（&&）表示，有两个操作数。 

   ```js
   var result = true && false;
   ```

   逻辑与的真值表如下:

   | 第一个操作数 | 第二个操作数 | 结果 |
   |:-:|:-:|:-:|
   true | true | true |
   true | false | false |
   false | true | false |
   false | false | false |

   逻辑与操作符可以应用于任何类型的操作数，而不仅仅是布尔值。在有一个操作数不是布尔值的情况下，逻辑与操作就不一定返回布尔值。此时它遵循如下规则：

    - 如果第一个操作数是对象，则返回第二个操作数。
    - 如果第二个操作数是对象，则只有在第一个操作数的求值结果为true情况下才会返回该对象。
    - 如果两个操作数都是对象，则返回第二个操作数。
    - 如果第一个操作数是null，则返回null。
    - 如果第一个操作数是NaN，则返回NaN。
    - 如果第一个操作数是undefined，则返回undefined。

   逻辑与运算符属于短路操作，一旦第一个操作数能决定结果就不会往后走。在逻辑与中，如果使用未定义的值会有发生错误的情况出现。
   ```js
   var found = true;
   var result = (found && someUndefinedVariable); // 这里会报错
   alert(result); // 这行不会执行
   ```
   但是如果上个例子的found值设置为false，这里就会发生短路，后面的值不再验证。
   ```js
   var found = false;
   var result = (found && someUndefinedVariable); //不会报错
   alert(result); // false
   ```

   3.逻辑或

   逻辑或操作符由两个竖线符号（||）表示，有两个操作数。

   ```js
   var result = true || false;
   ```

   逻辑或的真值表如下：

   | 第一个操作数 | 第二个操作数 | 结果
   |:-:|:-:|:-:|
   true | true | true |
   true | false | true |
   false | true | true |
   false | false | false |

   与逻辑与操作相似，如果一个操作数不是布尔值，逻辑或也不一定返回布尔值。此时有以下规则：

    - 如果第一个操作数是对象，则返回第一个操作数。
    - 如果第一个操作数的求值结果为false，则返回第二个操作数、
    - 如果两个操作数都是对象，则返回第一个操作数。
    - 如果两个操作数都是null，则返回null。
    - 如果两个操作数都是NaN，则返回NaN。
    - 如果两个操作数都是undefined，则返回undefined。

   与逻辑与操作符相似，逻辑或操作符也是短路运算符。也就是说，如果第一个操作数的求值结果为true，那么不会对第二个操作数求值。在逻辑或运算中使用未定义的值，同样会有报错的情况出现。
   ```js
   var found = false;
   var result = (found || someUndefinedVariable); // 这里会报错
   alert(result) // 这一行不会执行
   ```
   但是如果上述例子的found是true，这里就会发生短路，就不会对第二个操作求值。
   ```js
   var found = true;
   var result = (found || someUndefinedValuable); // 不会发生错误
   alert(result) // true
   ```
   可以利用上面的这种行为来避免变量赋值null或者undefined值。例如：
   ```js
   var myObject = preferredObject || backupObject
   ```

   只要有一个值不是null或者undefined，那么结果就返回第一个有效的值。
   
   
   







