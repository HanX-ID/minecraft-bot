const mineflayer = require('mineflayer');
const socks = require('socks').SocksClient;
const HttpsProxyAgent = require('https-proxy-agent');
const fs = require('fs');
const readline = require('readline');

const proxies = fs.readFileSync('proxy.txt', 'utf-8').trim().split('\n');

function randName() {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let name = '';
  for (let i = 0; i < 8; i++) name += chars[Math.floor(Math.random() * chars.length)];
  return name;
}

function randomWalk(bot) {
  const move = ['forward', 'back', 'left', 'right'];
  const act = move[Math.floor(Math.random() * move.length)];
  bot.setControlState(act, true);
  setTimeout(() => {
    bot.setControlState(act, false);
  }, Math.random() * 2000 + 1000);
}

function randomChat(bot) {
  const msgs = ['hi', 'halo', 'lag?', 'anjir', 'hahaha', 'test', 'wkwk'];
  bot.chat(msgs[Math.floor(Math.random() * msgs.length)]);
}

function createBot(ip, port, version, proxy) {
  const name = randName();
  if (proxy.startsWith('socks')) {
    const [host, p] = proxy.split(':').slice(1);
    socks.createConnection({
      command: 'connect',
      destination: { host: ip, port: port },
      proxy: { ipaddress: host, port: parseInt(p), type: 5 }
    }, (err, info) => {
      if (err || !info.socket) return;
      const bot = mineflayer.createBot({
        username: name,
        version,
        socket: info.socket
      });
      setupBot(bot);
    });
  } else {
    const agent = new HttpsProxyAgent(`http://${proxy}`);
    const bot = mineflayer.createBot({
      username: name,
      version,
      host: ip,
      port: port,
      agent
    });
    setupBot(bot);
  }
}

function setupBot(bot) {
  bot.on('spawn', () => {
    console.log(`[+] ${bot.username}`);
    setInterval(() => randomWalk(bot), Math.random() * 5000 + 5000);
    setInterval(() => {
      if (Math.random() < 0.5) randomChat(bot);
    }, Math.random() * 10000 + 10000);
  });

  bot.on('end', () => {
    console.log(`[-] ${bot.username}`);
  });

  bot.on('error', () => {});
}

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.question('Server IP: ', ip => {
  rl.question('Port: ', port => {
    rl.question('Jumlah Bot: ', count => {
      rl.question('Versi Minecraft: ', version => {
        for (let i = 0; i < parseInt(count); i++) {
          setTimeout(() => {
            const proxy = proxies[i % proxies.length];
            createBot(ip, parseInt(port), version, proxy);
          }, i * (Math.random() * 2000 + 1000));
        }
        rl.close();
      });
    });
  });
});