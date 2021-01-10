module.exports = {
  base: '/blog/',
  title: '爬坑中的王小二',
  description: '个人的一些总结，随意写写',
  head: [
    ['link', { rel: 'icon', href: '/image/favicon.ico' }]
  ],
  themeConfig: {
    lastUpdated: '最后更新时间',
    nav: [
      {
        text: '首页',
        link: '/'
      }, {
        text: '博客',
        link: '/JSRedBook/Base.md',
      }
    ],
    sidebar: [
      {
        title: 'JavaScript高级程序设计笔记',
        collapsable: true, // 是否折叠
        children: [  // 具体文章内容的路径
          '/JSRedBook/Base.md',
          '/JSRedBook/UseJSInHtml.md',
          '/JSRedBook/BaseContent.md'
        ]
      }, {
        title: '前端面试修炼手册',
        collapsable: true, // 是否折叠
        children: [
          '/FrontendInterview/JavascriptBase.md'
        ]
      }, {
        title: '优秀博客记录',
        collapsable: true, 
        children: [
          '/UsefulBlogs/UsefulBlogs.md'
        ]
      }
    ],
    markdown: {
      // 显示代码块行号
      lineNumbers: true
    },
  }
}
