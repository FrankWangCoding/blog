module.exports = {
  base: '/blog/',
  title: '爬坑中的王小二',
  description: '个人的一些总结，随意写写',
  head: [
    ['link', { rel: 'icon', href: '/image/favicon.ico' }]
  ],
  themeConfig: {
    lastUpdated: '最后更新时间',
    sidebarDepth: 3,
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
        title: 'React Hooks',
        collapsable: true, // 是否折叠
        children: [  // 具体文章内容的路径
          '/ReactHooks/BaseHooks.md',
          '/ReactHooks/ExtensionHooks.md',
          '/ReactHooks/LifeCycleAndFunction.md'
        ]
      }, {
        title: '个人的零零碎碎的总结',
        collapsable: true,
        children: [
          '/PersonnelStudy/RouterInProject.md'
        ]
      }
    ],
    markdown: {
      // 显示代码块行号
      lineNumbers: true
    },
  }
}
