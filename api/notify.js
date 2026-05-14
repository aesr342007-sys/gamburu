No — the file only has the first line plus the file tree. You need to paste the full `notify.js` code after that `require` line. The rest of the function got deleted.

Paste the complete file:

```js
const fetch = require('node-fetch');

const BOT_TOKEN = '8919491630:AAEEZsdmI947oIi-FNvjJEAxVtigtOzLFBs';
const CHAT_ID = '1789912994';

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).send('Method not allowed');
  }

  const { event, bet } = req.body || {};
  if (!event || !bet) return res.status(400).send('Missing fields');

  let text = '';
  if (event === 'created') {
    text = `🎲 *New Bet Created*\n\n*${esc(bet.title)}*\n${esc(bet.s1)} vs ${esc(bet.s2)}\n\nOdds: \`${esc(bet.o)}\`\nCreator stake: \`${bet.amt} TON\`\nOpponent stake: \`${bet.cpAmt} TON\`\n\nBet ID: \`${bet.id}\`\nCreator: \`${bet.creator}\``;
  } else if (event === 'accepted') {
    text = `✅ *Bet Accepted — Funds Locked*\n\n*${esc(bet.title)}*\n${esc(bet.s1)} vs ${esc(bet.s2)}\n\nTotal pot: \`${bet.pot} TON\`\n\nBet ID: \`${bet.id}\`\nAcceptor: \`${bet.cp}\``;
  } else if (event === 'disputed') {
    text = `⚠️ *Dispute — Arbiter Needed*\n\n*${esc(bet.title)}*\n${esc(bet.s1)} vs ${esc(bet.s2)}\n\nPot: \`${bet.pot} TON\`\nBet ID: \`${bet.id}\`\n\nPlayers submitted different results\\. Go settle it\\.`;
  } else if (event === 'settled') {
    text = `🏆 *Bet Settled*\n\n*${esc(bet.title)}*\nWinner: *${esc(bet.winner)}*\n\nPot: \`${bet.pot} TON\`\nPayout: \`${(bet.pot * 0.98).toFixed(4)} TON\`\nBet ID: \`${bet.id}\``;
  } else {
    return res.status(400).send('Unknown event');
  }

  try {
    const r = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: CHAT_ID, text, parse_mode: 'MarkdownV2' })
    });
    const data = await r.json();
    if (!data.ok) throw new Error(data.description);
    res.status(200).json({ ok: true });
  } catch (e) {
    console.error('Telegram error:', e.message);
    res.status(500).json({ ok: false, error: e.message });
  }
};

function esc(str) {
  return String(str).replace(/([_*[\]()~`>#+\-=|{}.!\\])/g, '\\$1');
}
```
