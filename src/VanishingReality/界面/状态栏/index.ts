import { waitUntil } from 'async-wait-until';
import App from './App.vue';
import './global.css';

$(async () => {
  // MVU 必须先就绪，否则 store 读不到 stat_data。
  await waitGlobalInitialized('Mvu');
  // 变量由卡体的初始化脚本写入，可能比界面挂载更晚，所以等到它出现为止。
  await waitUntil(() => _.has(getVariables({ type: 'message' }), 'stat_data'), {
    timeout: 30_000,
  });
  createApp(App).use(createPinia()).mount('#app');
});
