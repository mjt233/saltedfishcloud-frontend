import { createApp } from 'vue'
import App from './App.vue'
import axios from './plugins/axios'
import router from './plugins/router'

const app = createApp(App)

app.config.globalProperties.axios = axios
app.use(router).mount('#app')
