import { createApp } from 'vue'
import { zIndexManager } from 'resizable-widget';
import './style.css'
import App from './App.vue'
// import ElementPlus from 'element-plus'
// import 'element-plus/dist/index.css'
import 'element-plus/theme-chalk/el-message.css'
import 'element-plus/theme-chalk/el-message-box.css'
import 'element-plus/theme-chalk/el-notification.css'
import './tailwind-output.css'
// import zhCn from 'element-plus/dist/locale/zh-cn.mjs'
import router from './router'
import './router/leave-down.js'
import './entries.js'
import './user.js'
import './drv.js'
import './secret-elementary.js'
import './webmanifest.js'
import './ipcman.js'

globalThis.appid = 'top.clspd.diary'
globalThis.uuid = 'fddd697a-d914-4e6b-82f4-52bf7bab296b'

zIndexManager.config(3001, 3300);

if (globalThis.navigator.serviceWorker && typeof globalThis.navigator.serviceWorker.register === 'function') {
    globalThis.navigator.serviceWorker.register('/sw.js', { scope: '/' });
}


const app = createApp(App)
// app.use(ElementPlus, {
//     locale: zhCn,
// })
app.use(router)
app.mount('#app')

import('./hotkey_manager.js');
