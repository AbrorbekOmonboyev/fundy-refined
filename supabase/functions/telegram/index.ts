/**
 * Fundy's Telegram bot (Supabase Edge Function).
 *
 * Two jobs:
 *   1. Telegram calls us (webhook) when someone opens the bot with /start <code>:
 *      we link that chat to the Fundy account that asked for the code.
 *   2. Every minute the database (pg_cron) asks us to send new notifications.
 *
 * Secrets (Supabase → Edge Functions → Secrets):
 *   TELEGRAM_BOT_TOKEN       from @BotFather
 *   TELEGRAM_WEBHOOK_SECRET  any long random text; also given to Telegram in setWebhook
 * SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are provided by Supabase automatically.
 *
 * Deploy: npx supabase functions deploy telegram --no-verify-jwt
 */
import { createClient } from 'npm:@supabase/supabase-js@2.49.4';

// The bot token from @BotFather (either name works).
const BOT_TOKEN = Deno.env.get('TELEGRAM_BOT_TOKEN') ?? Deno.env.get('TELEGRAM_WEBHOOK_TOKEN') ?? '';
const WEBHOOK_SECRET = Deno.env.get('TELEGRAM_WEBHOOK_SECRET') ?? '';
const SITE = 'https://www.fundy.uz';
const db = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!, {
  auth: { persistSession: false },
});

type Lang = 'uz' | 'ru' | 'en';

const TEXT: Record<string, Record<Lang, string>> = {
  linked: {
    uz: '✅ Telegram Fundy hisobingizga ulandi. Endi bildirishnomalar shu yerga keladi.',
    ru: '✅ Telegram подключён к вашему аккаунту Fundy. Уведомления будут приходить сюда.',
    en: '✅ Telegram is linked to your Fundy account. Notifications will arrive here.',
  },
  badCode: {
    uz: 'Havola eskirgan. Fundy → Sozlamalar → «Telegramni ulash» tugmasini qayta bosing.',
    ru: 'Ссылка устарела. Нажмите «Подключить Telegram» в настройках Fundy ещё раз.',
    en: 'This link has expired. Press "Connect Telegram" in your Fundy settings again.',
  },
  hello: {
    uz: 'Salom! Bu Fundy bildirishnomalari boti. Ulash uchun: fundy.uz → Sozlamalar → «Telegramni ulash».',
    ru: 'Здравствуйте! Это бот уведомлений Fundy. Чтобы подключить: fundy.uz → Настройки → «Подключить Telegram».',
    en: 'Hi! This is the Fundy notifications bot. To connect: fundy.uz → Settings → "Connect Telegram".',
  },
  project_approved: {
    uz: '🎉 Loyihangiz tasdiqlandi va eʼlon qilindi',
    ru: '🎉 Ваш проект одобрен и опубликован',
    en: '🎉 Your project was approved and is live',
  },
  project_changes_requested: {
    uz: '✏️ Loyihangizga oʻzgartirish soʻraldi',
    ru: '✏️ В проекте попросили изменения',
    en: '✏️ Changes were requested on your project',
  },
  project_rejected: { uz: 'Loyihangiz rad etildi', ru: 'Проект отклонён', en: 'Your project was not approved' },
  project_ended: { uz: '🏁 Kampaniya yakunlandi', ru: '🏁 Сбор завершён', en: '🏁 The campaign has ended' },
  new_contribution: { uz: '💚 Yangi homiy', ru: '💚 Новый сторонник', en: '💚 New backer' },
  contribution_confirmed: {
    uz: '✅ Hissangiz qabul qilindi',
    ru: '✅ Ваш вклад принят',
    en: '✅ Your contribution was received',
  },
  new_comment: { uz: '💬 Yangi izoh', ru: '💬 Новый комментарий', en: '💬 New comment' },
  comment_reply: { uz: '💬 Izohingizga javob', ru: '💬 Ответ на ваш комментарий', en: '💬 A reply to your comment' },
  new_update: { uz: '📣 Loyihada yangilik', ru: '📣 Новость проекта', en: '📣 Project update' },
  milestone_approved: {
    uz: '🏗 Bosqich bajarildi — keyingi qism berildi',
    ru: '🏗 Этап выполнен — выдана следующая часть',
    en: '🏗 Stage done — the next part was released',
  },
  milestone_submitted: {
    uz: '📎 Asoschi bosqich dalilini yubordi',
    ru: '📎 Автор отправил подтверждение этапа',
    en: '📎 A founder sent proof for a stage',
  },
  milestone_returned: {
    uz: '↩️ Bosqich dalili qaytarildi',
    ru: '↩️ Подтверждение этапа вернули',
    en: '↩️ Stage proof was sent back',
  },
  open: { uz: 'Ochish', ru: 'Открыть', en: 'Open' },
  other: {
    uz: '🔔 Fundy’da yangi bildirishnoma',
    ru: '🔔 Новое уведомление на Fundy',
    en: '🔔 New notification on Fundy',
  },
};

const say = (key: string, lang: string) => {
  const l: Lang = lang === 'ru' || lang === 'en' ? lang : 'uz';
  return (TEXT[key] ?? TEXT.other)[l];
};

async function telegram(method: string, body: unknown) {
  const res = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/${method}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  return { ok: res.ok, status: res.status };
}

const escapeHtml = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/** 1. Messages people send to the bot. */
async function handleUpdate(update: {
  message?: { chat: { id: number }; text?: string; from?: { language_code?: string } };
}) {
  const msg = update.message;
  if (!msg?.text) return;
  const lang = msg.from?.language_code ?? 'uz';
  const code = /^\/start\s+([0-9a-f]{32})$/.exec(msg.text.trim())?.[1];
  if (!code) {
    await telegram('sendMessage', { chat_id: msg.chat.id, text: say('hello', lang) });
    return;
  }
  const { data: ok } = await db.rpc('telegram_link_chat', { p_code: code, p_chat_id: msg.chat.id });
  await telegram('sendMessage', { chat_id: msg.chat.id, text: say(ok ? 'linked' : 'badCode', lang) });
}

/** 2. Send what's waiting. */
async function sendPending() {
  const { data: rows, error } = await db.rpc('telegram_pending', { p_limit: 50 });
  if (error || !rows?.length) return 0;
  const sent: string[] = [];
  for (const n of rows as {
    id: string;
    chat_id: number;
    type: string;
    language: string;
    project_slug: string | null;
    project_title: string | null;
  }[]) {
    const url = n.project_slug ? `${SITE}/projects/${n.project_slug}` : `${SITE}/dashboard/backer`;
    const title = n.project_title ? `\n<b>${escapeHtml(n.project_title)}</b>` : '';
    const res = await telegram('sendMessage', {
      chat_id: n.chat_id,
      text: `${say(n.type, n.language)}${title}`,
      parse_mode: 'HTML',
      reply_markup: { inline_keyboard: [[{ text: say('open', n.language), url }]] },
    });
    if (res.ok) sent.push(n.id);
    else if (res.status === 403) await db.rpc('telegram_forget_chat', { p_chat_id: n.chat_id }); // user blocked the bot
  }
  if (sent.length) await db.rpc('telegram_mark_sent', { p_ids: sent });
  return sent.length;
}

Deno.serve(async req => {
  // One-time setup: open …/functions/v1/telegram?setup=<TELEGRAM_WEBHOOK_SECRET> in a browser.
  // It tells Telegram to send the bot's messages here.
  const setup = new URL(req.url).searchParams.get('setup');
  if (req.method === 'GET' && setup) {
    if (!BOT_TOKEN || !WEBHOOK_SECRET || setup !== WEBHOOK_SECRET) return new Response('forbidden', { status: 403 });
    const res = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/setWebhook`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        url: `${Deno.env.get('SUPABASE_URL')}/functions/v1/telegram`,
        secret_token: WEBHOOK_SECRET,
        allowed_updates: ['message'],
      }),
    });
    return new Response(res.ok ? 'Fundy bot is connected ✅' : `Telegram said: ${await res.text()}`, {
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });
  }

  if (req.method !== 'POST' || !BOT_TOKEN) return new Response('ok');

  // Telegram webhook: it sends our secret in this header.
  const telegramSecret = req.headers.get('x-telegram-bot-api-secret-token');
  if (telegramSecret !== null) {
    if (!WEBHOOK_SECRET || telegramSecret !== WEBHOOK_SECRET) return new Response('forbidden', { status: 403 });
    await handleUpdate(await req.json());
    return new Response('ok');
  }

  // Scheduled job from the database.
  const body = await req.json().catch(() => ({}));
  if (body?.task === 'send') {
    const { data: ok } = await db.rpc('telegram_cron_secret_ok', { p_secret: String(body.secret ?? '') });
    if (!ok) return new Response('forbidden', { status: 403 });
    const count = await sendPending();
    return Response.json({ sent: count });
  }
  return new Response('ok');
});
