// Styles
import '@mdi/font/css/materialdesignicons.css'
import 'vuetify/styles'
import { aliases,mdi } from 'vuetify/lib/iconsets/mdi'

// Vuetify
import { createVuetify } from 'vuetify'

const defaultTheme = {
  dark: false,
  colors: {
    background: '#FFFFFF',
    surface: '#3F51B5',
    primary: '#5c6bc0',
    'primary-darken-1': '#3700B3',
    secondary: '#03DAC6',
    'secondary-darken-1': '#018786',
    error: '#B00020',
    info: '#2196F3',
    success: '#4CAF50',
    warning: '#FB8C00',
  }
}

export default createVuetify({
  icons: {
    defaultSet: 'mdi',
    aliases,
    sets: {
      mdi
    }
  },
  theme: {
    defaultTheme: 'default',
    themes: {
      default: defaultTheme
    }
  }
})
  
  // https://vuetifyjs.com/en/introduction/why-vuetify/#feature-guides
// )
