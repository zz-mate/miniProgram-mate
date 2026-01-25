const express = require('express');
const cors = require('cors');
const { qianWenSendMsg } = require('./api/qianwen');

const app = express();
const PORT = process.env.PORT || 3000;

// 中间件
app.use(cors());
app.use(express.json());

// 路由
app.post('/api/qianwen/send', qianWenSendMsg);

// 启动服务器
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

module.exports = app;