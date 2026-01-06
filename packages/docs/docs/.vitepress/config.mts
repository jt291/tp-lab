import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config

export default defineConfig({
  lang: 'fr-FR',
  title: "tp-lab",
  description: "Bibliothèque de composants Web à vocation pédagogique",
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    logo: '/images/tp-logo.svg',
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Examples', link: '/markdown-examples' }
    ],

    sidebar: [
      {
        text: 'Examples',
        items: [
          { text: 'Markdown Examples', link: '/markdown-examples' },
          { text: 'Runtime API Examples', link: '/api-examples' }
        ]
      }
    ],

    socialLinks: [
      { icon: 'github', link: 'https://github.com/vuejs/vitepress' }
    ]
  },
  markdown: {
    lineNumbers: true,
    math: true,
    image: {
      lazyLoading: true
    },
    container: {
      tipLabel: 'ASTUCE',
      warningLabel: 'ATTENTION',
      dangerLabel: 'DANGER',
      infoLabel: 'INFO',
      detailsLabel: 'DÉTAILS'
    }
  }
})
