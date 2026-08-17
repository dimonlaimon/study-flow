import React from 'react'
import ReactDOM from 'react-dom/client'
import vkBridge from '@vkontakte/vk-bridge'
import App from '@/App.jsx'
import '@/index.css'

// Инициализируем VK Bridge сразу — VK ждёт этот сигнал при загрузке
vkBridge.send('VKWebAppInit').catch(() => {});

ReactDOM.createRoot(document.getElementById('root')).render(
  <App />
)
