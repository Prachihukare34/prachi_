const WebSocket = require('ws');
const wss = new WebSocket.Server({ port: 8080 });

let messageHistory = [];

wss.on('connection', function connection(ws) {
  ws.send(JSON.stringify({ type: 'history', data: messageHistory }));

  ws.on('message', function incoming(data) {
    const msg = JSON.parse(data);

    if (msg.type === 'message') {
      messageHistory.push(msg.data);
      if (messageHistory.length > 100) messageHistory.shift(); // limit history
      wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify({ type: 'message', data: msg.data }));
        }
      });
    }

    if (msg.type === 'typing') {
      wss.clients.forEach(client => {
        if (client !== ws && client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify({ type: 'typing', user: msg.user }));
        }
      });
    }
  });
});

console.log('✅ Server running on ws://localhost:8080');
