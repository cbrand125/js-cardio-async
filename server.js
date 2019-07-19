const http = require('http');
const handleRoutes = require('./router');

// create server object
const server = http.createServer();

// set event handler for requests to server
server.on('request', handleRoutes);

// actually start the server to start listening for events (like requests)
server.listen(5000, () => console.log('Server listening on port 5000'));
