import { defineConfig, presetIcons } from 'unocss'

export default defineConfig({
  presets: [
    presetIcons({ 
      warn: true,
      prefix: 'tp-',
      extraProperties: {
        'display': 'inline-block',
        'vertical-align': 'middle', 
      },
    }),
  ],
})

