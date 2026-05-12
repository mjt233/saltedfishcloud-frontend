// Styles
import '@mdi/font/css/materialdesignicons.css'
import 'vuetify/styles'
import { aliases,mdi } from 'vuetify/iconsets/mdi'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'

// Vuetify
import { createVuetify } from 'vuetify'
import colors from 'vuetify/util/colors'

const themeColor = colors.indigo
const baseColor = {
  error: '#B00020',
  info: themeColor.accent1, // '#2196F3',
  success: '#4CAF50',
  warning: '#FB8C00',
  background: '#FFFFFF',
  surface: '#FFFFFF'
}
const defaultTheme = {
  dark: false,
  colors: {
    header: themeColor.base,
    primary: themeColor.base,
    'primary-darken-1': themeColor.darken1,
    secondary: themeColor.lighten4,
    'secondary-darken-1': '#018786',
    ...baseColor,
    ...themeColor
  }
  // colors: {
  //   background: '#FFFFFF',
  //   // surface: '#3F51B5',
  //   header: indigo.darken1, // '#3F51B5',
  //   surface: '#FFFFFF',
  //   primary: indigo.base, // '#5c6bc0',
  //   'primary-darken-1': '#3700B3',
  //   secondary: '#03DAC6',
  //   'secondary-darken-1': '#018786',
  //   error: '#B00020',
  //   info: '#2196F3',
  //   success: '#4CAF50',
  //   warning: '#FB8C00',
  //   ...indigo
  // }
}

export function getVuetifyBaseConfig() {
  const defaultDensity = 'compact'
  const formDefaultVariant = 'underlined'
  return {
    theme: {
      defaultTheme: 'default',
      themes: {
        default: defaultTheme
      }
    },
    defaults: {
      VApp: { density: defaultDensity },
      VAppBar: { density: 'comfortable' },
      VListItem: { density: defaultDensity },
      VTextField: { variant: formDefaultVariant, color: 'primary' },
      VSelect: { variant: formDefaultVariant, color: 'primary' },
      VTextarea: { variant: formDefaultVariant, color: 'primary' },
      VSwitch: { hideDetails: true, color: 'primary' },
      VCheckbox: { hideDetails: true, color: 'primary' },
      VSlider: { color: 'primary' },
      VRow: { gap: '8px' }
    }
  }
}

export default createVuetify({
  ...getVuetifyBaseConfig(),
  components,
  directives,
  icons: {
    defaultSet: 'mdi',
    aliases,
    sets: {
      mdi
    }
  }
})
