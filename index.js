const WebSocket = require("ws");
const wss = new WebSocket.Server({ port: 3001 });

let sessions = {}; // sessionId => [socket1, socket2]

wss.on("connection", (ws) => {
  let sessionId = null;

  ws.on("message", (msg) => {
    let data = {};
    try {
      data = JSON.parse(msg);
    } catch (e) {
      return;
    }

    if (data.type === "join" && data.session) {
      sessionId = data.session;
      if (!sessions[sessionId]) sessions[sessionId] = [];
      sessions[sessionId].push(ws);
    }

    if (sessionId && sessions[sessionId]) {
      sessions[sessionId].forEach((client) => {
        if (client !== ws && client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify(data));
        }
      });
    }
  });

  ws.on("close", () => {
    if (sessionId && sessions[sessionId]) {
      sessions[sessionId] = sessions[sessionId].filter((s) => s !== ws);
      if (sessions[sessionId].length === 0) delete sessions[sessionId];
    }
  });
});

