import { createApp } from 'vue'
import App from './App.vue'
import { createVuetify } from 'vuetify'
import { getVuetifyBaseConfig } from 'sfc-common/plugins/vuetify'

createApp(App)
  .use(createVuetify(getVuetifyBaseConfig()))
  .mount('#app')