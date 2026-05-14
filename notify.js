export const config = { runtime: 'edge' };

const BOT_TOKEN = '8919491630:AAEEZsdmI947oIi-FNvjJEAxVtigtOzLFBs';
const CHAT_ID = '1789912994';

export default async function handler(req) {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return new Response('Bad request', { status: 400 });
  }

  const { event, bet } = body;
  if (!event || !bet) return new Response('Missing fields', { status: 400 });

  let text = '';

  if (event === 'created') {
    text =
      `🎲 *New Bet Created*\n\n` +
      `*${escMd(bet.title)}*\n` +
      `${escMd(bet.s1)} vs ${escMd(bet.s2)}\n\n` +
      `Odds: \`${escMd(bet.o)}\`\n` +
      `Creator stake: \`${bet.amt} TON\`\n` +
      `Opponent stake: \`${bet.cpAmt} TON\`\n` +
      `Pot: \`${bet.pot} TON\`\n\n` +
      `Bet ID: \`${bet.id}\`\n` +
      `Creator: \`${bet.creator}\``;
  } else if (event === 'accepted') {
    text =
      `✅ *Bet Accepted — Funds Locked*\n\n` +
      `*${escMd(bet.title)}*\n` +
      `${escMd(bet.s1)} vs ${escMd(bet.s2)}\n\n` +
      `Odds: \`${escMd(bet.o)}\`\n` +
      `Total pot: \`${bet.pot} TON\`\n\n` +
      `Bet ID: \`${bet.id}\`\n` +
      `Creator: \`${bet.creator}\`\n` +
      `Acceptor: \`${bet.cp}\``;
  } else if (event === 'disputed') {
    text =
      `⚠️ *Dispute — Arbiter Needed*\n\n` +
      `*${escMd(bet.title)}*\n` +
      `${escMd(bet.s1)} vs ${escMd(bet.s2)}\n\n` +
      `Pot: \`${bet.pot} TON\`\n` +
      `Bet ID: \`${bet.id}\`\n\n` +
      `Players submitted different results\\. Check Gamburu to settle\\.`;
  } else if (event === 'settled') {
    text =
      `🏆 *Bet Settled*\n\n` +
      `*${escMd(bet.title)}*\n` +
      `Winner: *${escMd(bet.winner)}*\n\n` +
      `Pot: \`${bet.pot} TON\`\n` +
      `Payout: \`${(bet.pot * 0.98).toFixed(4)} TON\`\n` +
      `Bet ID: \`${bet.id}\``;
  } else {
    return new Response('Unknown event', { status: 400 });
  }

  try {
    const res = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: CHAT_ID,
        text,
        parse_mode: 'MarkdownV2'
      })
    });
    const data = await res.json();
    if (!data.ok) throw new Error(data.description);
    return new Response(JSON.stringify({ ok: true }), { status: 200 });
  } catch (e) {
    console.error('Telegram error:', e);
    return new Response(JSON.stringify({ ok: false, error: e.message }), { status: 500 });
  }
}

function escMd(str) {
  return String(str).replace(/([_*[\]()~`>#+\-=|{}.!\\])/g, '\\$1');
}
