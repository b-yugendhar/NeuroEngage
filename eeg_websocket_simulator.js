import { execSync } from 'child_process';
import http from 'http';
let WebSocketServer;
try {
  const wsModule = await import('ws');
  WebSocketServer = wsModule.WebSocketServer;
} catch (e) {
  console.log('"ws" package not found. Installing now to start the simulator...');
  try {
    execSync('npm install ws --no-save', { stdio: 'inherit' });
    const wsModule = await import('ws');
    WebSocketServer = wsModule.WebSocketServer;
    console.log('"ws" installed successfully.\n');
  } catch (err) {
    console.error(' Failed to auto-install "ws". Please run: npm install ws');
    process.exit(1);
  }
}
const PORT = 8081;
const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('NeuroEngage EEG WebSocket Simulator is running.');
});

const wss = new WebSocketServer({ server });

wss.on('connection', (ws) => {
  console.log('Client connected to EEG simulator');
  
  let timeCount = 30;
  // Stream data packets every 1 second
  const interval = setInterval(() => {
    // Generate realistic fluctuating EEG frequencies and states
    const baseAlpha=Math.random() * 5 + 8;     // 8-13 Hz
    const baseBeta=Math.random() * 12 + 13;    // 13-25 Hz
    const baseGamma=Math.random() * 20 + 25;   // 25-45 Hz
    const alphaNorm=(baseAlpha - 8) / 5;
    const betaNorm=(baseBeta - 13) / 12;
    const gammaNorm=(baseGamma - 25) / 20;
    const focus=Math.min(100, Math.max(0, (alphaNorm * 60) + ((1 - betaNorm) * 40) + (Math.random() * 10 - 5)));
    const attention=Math.min(100, Math.max(0, (gammaNorm * 70) + (alphaNorm * 30) + (Math.random() * 10 - 5)));

    const packet = {
      time: timeCount++,
      alpha: Number(baseAlpha.toFixed(2)),
      beta: Number(baseBeta.toFixed(2)),
      gamma: Number(baseGamma.toFixed(2)),
      focus: Number(focus.toFixed(1)),
      attention: Number(attention.toFixed(1)),
      timestamp: Date.now()
    };

    console.log(' Sending packet:', JSON.stringify(packet));
    ws.send(JSON.stringify(packet));
  }, 1000);

  ws.on('close',()=>{
    console.log(' Client disconnected');
    clearInterval(interval);
  });
});

server.listen(PORT, () => {
  console.log(`EEG WebSocket Simulator running at ws://localhost:${PORT}`);
  console.log('Keep this terminal running and point your NeuroEngage client here to stream live data.');
});
