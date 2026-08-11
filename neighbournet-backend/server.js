require('dotenv').config();
const http = require('http');
const app = require('./src/app');
const connectDB = require('./src/config/db');
require('./src/config/redis');
const { initSocket } = require('./src/services/socket.service');
const { startCronJobs } = require('./src/services/cron.service');

const PORT = process.env.PORT || 5000;

const httpServer = http.createServer(app);
initSocket(httpServer);

connectDB().then(() => {
  httpServer.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    startCronJobs();
  });
});