const http = require('http');
const handleRoutes = require('./router');

const server = http.createServer();

server.on('request', handleRoutes);

server.listen(5000, () => console.log('Server listening on port 5000'));
