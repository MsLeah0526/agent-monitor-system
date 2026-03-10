/**
 * Main entry point for WebSocket Server
 * Starts the WebSocket server with all services
 */

require('dotenv').config();
const WebSocketServer = require('./websocket-server.js');

const PORT = process.env.WS_PORT || 8080;

console.log('Starting Agent Monitor WebSocket Server...');
console.log(`Port: ${PORT}`);

const wsServer = new WebSocketServer(PORT);

wsServer.start();

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\nShutting down gracefully...');
  wsServer.stop();
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\nShutting down gracefully...');
  wsServer.stop();
  process.exit(0);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught exception:', error);
  wsServer.stop();
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled rejection:', reason);
});
