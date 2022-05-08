import { createApp } from 'vue'
import App from './App.vue'
import axios from './plugins/axios'
import router from './plugins/router'
import vuetify from './plugins/vuetify'
// import { loadFonts } from './plugins/webfontloader'

// loadFonts()

const app = createApp(App)

app.config.globalProperties.axios = axios
app.use(router)
  .use(vuetify)
  .mount('#app')
createApp(App)
