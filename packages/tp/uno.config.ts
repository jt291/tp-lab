import { defineConfig, presetIcons, presetAttributify } from 'unocss'

export default defineConfig({
  presets: [
    presetAttributify({}),
    presetIcons({ 
      warn: true,
      prefix: 'tp-',
      collections: {
        tabler: () => import('@iconify-json/tabler/icons.json').then(i => i.default),
      },
      customizations: {
        customize(props) {
          props.width = '1em'
          props.height = '1em'
          return props
        }
      },
      extraProperties: {
        'display': 'inline-block',
        'vertical-align': 'middle'
      }
    }),
  ],
})

