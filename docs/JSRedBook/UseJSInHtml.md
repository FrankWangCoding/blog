# 在HTML中使用Javascript

## &lt;script&gt;标签的6个属性
- async: 可选属性。表示应该立即下载此脚本。但不应该妨碍页面中的其他操作。例如下载其他资源或等待加载其他脚本，只对外部脚本文件有效。
- charset: 可选属性。表示通过src属性制定对代码对字符集（通常会被忽略）
- defer: 可选属性。表示脚本可以延迟到文档完全被解析和显示之后再执行。只对外部脚本文件有效。
- language: 已废弃。
- src: 可选。表示包含要执行代码的外部文件。
- type: 必选但非必需。默认值为type/javascript

个人觉得最重要的属性就是async和defer，要区分他们的用途。

## 标签的位置
现代浏览器一般都把全部Javascript引用放在`<body>`页面元素的后面。目的是为了加快页面的加载速度。原因是Javascript会阻塞加载，如果放在head位置，则必须等javascript加载完毕后才会加载页面，性能差，会导致页面延迟和空白。
```html
  <!DOCTYPE html>
  <html>
    <head></head>
    <body>
      <!-- 前面是dom元素，最后在dom后面再写script标签-->
      <script>
       // 放在这里而不是放在html标签后面是因为规范，最新的规范要求放在这里。
       // 而且这里也确实符合dom全部加载完毕之后再进行加载script的约定。
      </script>
    <body>
  </html>
```

## 延迟脚本(defer属性)
- 在`<script>`元素中设置defer属性，相当于告诉浏览器立即下载。但是延迟执行。
- 在遇到`</html>`标签之后再执行。
- 在现实情况中，延迟脚本不一定会按照执行顺序执行，也不一定会在DomContentLoaded事件触发前执行。因此最好只包含一个defer脚本。
- 把延迟脚本放在页面底部是最佳选择。

## 异步脚本(async属性)
- 标记为async的脚本并不保证按照指定它们的先后顺序执行。
- 建议异步脚本不要在加载期间修改dom。 
- 异步脚本一定会在页面load事件前执行，但可能会在DomContentLoaded触发之前/之后执行。（DomContentLoaded的时机先于load事件）

## 使用外部script文件的优点
- 可维护性：将所有需要引入的js文件放入一个文件夹中，维护会轻松很多。
- 可缓存：浏览器能根据具体的设置缓存链接的所有外部Javascript文件。也就是说，如果有两个页面加载的是同一个文件，那么该文件只需要加载一次。
- 适应未来：无需使用XHTML或者注释hack。

## 文档模式
- 混杂模式（即其他网站上常说的怪异模式），是指浏览器按照自己的方式来解析代码，页面以宽松的向后兼容的方式显示。不同浏览器在这种模式下的行为差异非常大。以下三种情况都会导致混杂模式：
   - 有过渡DTD但是没有URI
   - DTD不存在
   - DTD错误
- 标准模式（也称严格模式），是指浏览器按照W3C标准来解析代码，一种严格要求的DTD，排版和JS运作模式均是以该浏览器支持的最高标准运行。
  我们通常认为的标注模式，其实分为标准模式和准标准模式。后者是由IE提出的。两者的区别在于处理图片间隙的时候。
  标准模式的开启方法：
  ```html
    <!-- HTML 4.01 严格式 -->
    <!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01//EN"
    "http://www.w3.org/TR/html4/strict.dtd">

    <!-- XHTML 1.0 严格式 -->
    <!DOCTYPE HTML PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN"
    "http://www.w3.org/TR/xhtml1-strict.dtd">

    <!-- html5 -->
    <!DOCTYPE html>
  ```
  准标准模式，可以通过过渡性或者框架集型文档类型来触发：
  ```html
    <!-- HTML 4.01 过渡型 -->
    <!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN"
    "http://www.w3.org/TR/html4/loose.dtd">

    <!-- HTML 4.01 框架集型 -->
    <!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Frameset//EN"
    "http://www.w3.org/TR/html4/frameset.dtd">

    <!-- XHTML 1.0 过渡型 -->
    <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN"
    "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">

    <!-- XHTML 1.0 框架集型 -->
    <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Frameset//EN"
    "http://www.w3.org/TR/xhtml1/DTD/xhtml1-frameset.dtd">
  ```
  个人认为，无需记住上面的几种写法，只需要记住标准模式和怪异模式的区别。什么模式是标准模式、什么模式是混杂模式能区分出来即可。
## noscript
用于在不支持Javascript的浏览器上显示替代的内容。
该元素的内容在下述条件任一成立时，会显示出来：
  - 浏览器不支持脚本
  - 浏览器支持脚本，但脚本被禁用。