const WebSocket = require("ws");
const wss = new WebSocket.Server({ port: 3001 });

const sessions = {};

wss.on("connection", (ws) => {
  let sessionId = null;

  ws.on("message", (message) => {
    let data;
    try {
      data = JSON.parse(message);
    } catch (err) {
      console.error("Invalid JSON:", err);
      return;
    }

    if (data.type === "join") {
      sessionId = data.session;
      if (!sessions[sessionId]) sessions[sessionId] = [];
      sessions[sessionId].push(ws);
    }

    if (data.type === "signal" && sessionId) {
      const others = sessions[sessionId].filter(s => s !== ws);
      others.forEach(s => {
        if (s.readyState === WebSocket.OPEN) {
          s.send(JSON.stringify({ type: "signal", signal: data.signal }));
        }
      });
    }
  });

  ws.on("close", () => {
    if (sessionId && sessions[sessionId]) {
      sessions[sessionId] = sessions[sessionId].filter(s => s !== ws);
      if (sessions[sessionId].length === 0) delete sessions[sessionId];
    }
  });
});
