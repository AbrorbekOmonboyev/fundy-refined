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
  user_signed_up: { uz: '👤 Yangi foydalanuvchi', ru: '👤 Новый пользователь', en: '👤 New user signed up' },
  page_feedback: { uz: '💬 Sahifa haqida fikr', ru: '💬 Отзыв о странице', en: '💬 Page feedback' },
  fb_bug: { uz: 'Nimadir ishlamayapti', ru: 'Что-то не работает', en: 'Something is broken' },
  fb_confusing: { uz: 'Tushunarsiz', ru: 'Непонятно', en: 'Unclear' },
  fb_idea: { uz: 'Taklif', ru: 'Идея', en: 'Idea' },
  fb_other: { uz: 'Boshqa', ru: 'Другое', en: 'Other' },
  adminOnly: {
    uz: 'Bu buyruq faqat Fundy admini uchun. Avval admin hisobini Sozlamalarda Telegramga ulang.',
    ru: 'Эта команда только для админа Fundy. Сначала подключите Telegram в настройках админ-аккаунта.',
    en: 'This command is for the Fundy admin only. Connect Telegram in the admin account settings first.',
  },
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
  if (/^\/getreports(@\w+)?$/i.test(msg.text.trim())) {
    await sendReport(msg.chat.id, lang);
    return;
  }
  if (/^\/video(@\w+)?$/i.test(msg.text.trim())) {
    await sendLaunchVideo(msg.chat.id, lang);
    return;
  }
  const code = /^\/start\s+([0-9a-f]{32})$/.exec(msg.text.trim())?.[1];
  if (!code) {
    await telegram('sendMessage', { chat_id: msg.chat.id, text: say('hello', lang) });
    return;
  }
  const { data: ok } = await db.rpc('telegram_link_chat', { p_code: code, p_chat_id: msg.chat.id });
  await telegram('sendMessage', { chat_id: msg.chat.id, text: say(ok ? 'linked' : 'badCode', lang) });
}

type ReportRow = {
  full_name: string;
  email: string;
  role: string;
  signed_up_at: string;
  contributed: number;
  contributions: number;
  projects: number;
  updates: number;
  comments: number;
};

const soum = (n: number) =>
  `${Math.round(n)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ' ')} soʻm`;
const csvCell = (v: unknown) => `"${String(v ?? '').replace(/"/g, '""')}"`;

/** /video — the 60 s stick-man story (Bek's bakery: crowdfunding + how Fundy works, made with /brag), only for a chat linked to an admin. */
const LAUNCH_VIDEO = `${SITE}/media/fundy-stickman.mp4`;
async function sendLaunchVideo(chatId: number, lang: string) {
  // Same admin check as /getreports: the database refuses chats not linked to an admin.
  const { error } = await db.rpc('telegram_admin_report', { p_chat_id: chatId });
  if (error) {
    await telegram('sendMessage', { chat_id: chatId, text: say('adminOnly', lang) });
    return;
  }
  const caption =
    "🎬 <b>Bek's Bakery: crowdfunding in one minute</b>\n\nBek has a great idea but no money, and a loan costs extra. " +
    'Many people each give a little instead — and on fundy.uz every project is checked and money is paid out stage by stage.';
  const sent = await telegram('sendVideo', {
    chat_id: chatId,
    video: LAUNCH_VIDEO,
    caption,
    parse_mode: 'HTML',
    supports_streaming: true,
    width: 1920,
    height: 1080,
    duration: 60,
  });
  // If Telegram can't take it as a video, send it as a file, and as a last resort the link.
  if (!sent.ok) {
    const doc = await telegram('sendDocument', { chat_id: chatId, document: LAUNCH_VIDEO, caption, parse_mode: 'HTML' });
    if (!doc.ok) await telegram('sendMessage', { chat_id: chatId, text: LAUNCH_VIDEO });
  }
}

/** /getreports — only for a chat linked to an admin (checked in the database). */
async function sendReport(chatId: number, lang: string) {
  const { data, error } = await db.rpc('telegram_admin_report', { p_chat_id: chatId });
  if (error) {
    await telegram('sendMessage', { chat_id: chatId, text: say('adminOnly', lang) });
    return;
  }
  const rows = (data ?? []) as ReportRow[];
  const raised = rows.reduce((s, r) => s + Number(r.contributed), 0);
  const backers = rows.filter(r => r.contributions > 0).length;
  const founders = rows.filter(r => r.projects > 0).length;
  const day = 86_400_000;
  const newWeek = rows.filter(r => Date.now() - new Date(r.signed_up_at).getTime() < 7 * day).length;
  const top = [...rows]
    .filter(r => Number(r.contributed) > 0)
    .sort((a, b) => Number(b.contributed) - Number(a.contributed))
    .slice(0, 10)
    .map((r, i) => `${i + 1}. ${escapeHtml(r.full_name || '—')} — ${soum(Number(r.contributed))}`);
  const latest = rows
    .slice(0, 10)
    .map(r => `• ${escapeHtml(r.full_name || '—')} — ${escapeHtml(r.email)} (${r.signed_up_at.slice(0, 10)})`);

  const text = [
    `📊 <b>Fundy hisobot</b> · ${new Date().toISOString().slice(0, 10)}`,
    '',
    `👥 Foydalanuvchilar: <b>${rows.length}</b> (oxirgi 7 kunda +${newWeek})`,
    `💚 Homiylar: <b>${backers}</b> · 🚀 Asoschilar: <b>${founders}</b>`,
    `💰 Jami hissa: <b>${soum(raised)}</b>`,
    '',
    top.length ? `<b>Eng koʻp hissa qoʻshganlar</b>\n${top.join('\n')}` : 'Hali hissa qoʻshilmagan.',
    '',
    `<b>Oxirgi roʻyxatdan oʻtganlar</b>\n${latest.join('\n') || '—'}`,
    '',
    'Toʻliq roʻyxat — ilova qilingan CSV faylda (Excelda ochiladi).',
  ].join('\n');
  await telegram('sendMessage', { chat_id: chatId, text: text.slice(0, 4000), parse_mode: 'HTML' });

  // Full list as a spreadsheet file (opens in Excel / Google Sheets).
  const header = [
    'Ism',
    'Email',
    'Rol',
    'Roʻyxatdan oʻtgan',
    'Hissa (soʻm)',
    'Toʻlovlar',
    'Loyihalar',
    'Yangiliklar',
    'Izohlar',
  ];
  const lines = rows.map(r =>
    [
      r.full_name,
      r.email,
      r.role,
      r.signed_up_at.slice(0, 16).replace('T', ' '),
      r.contributed,
      r.contributions,
      r.projects,
      r.updates,
      r.comments,
    ]
      .map(csvCell)
      .join(','),
  );
  const csv = '\uFEFF' + [header.map(csvCell).join(','), ...lines].join('\r\n'); // BOM so Excel shows Uzbek letters
  const form = new FormData();
  form.append('chat_id', String(chatId));
  form.append(
    'document',
    new Blob([csv], { type: 'text/csv' }),
    `fundy-users-${new Date().toISOString().slice(0, 10)}.csv`,
  );
  await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendDocument`, { method: 'POST', body: form });
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
    data: { name?: string; email?: string; page?: string; kind?: string; message?: string } | null;
    project_slug: string | null;
    project_title: string | null;
  }[]) {
    const isSignup = n.type === 'user_signed_up';
    const isFeedback = n.type === 'page_feedback';
    const url = isSignup
      ? `${SITE}/admin/users`
      : isFeedback
        ? `${SITE}/admin/messages?tab=feedback`
        : n.project_slug
          ? `${SITE}/projects/${n.project_slug}`
          : `${SITE}/dashboard/backer`;
    const title = isSignup
      ? `\n<b>${escapeHtml(n.data?.name || '—')}</b>\n${escapeHtml(n.data?.email ?? '')}`
      : isFeedback
        ? `\n<b>${escapeHtml(say(`fb_${n.data?.kind ?? 'other'}`, n.language))}</b> · ${escapeHtml(n.data?.page ?? '/')}\n\n${escapeHtml(n.data?.message ?? '')}`
        : n.project_title
          ? `\n<b>${escapeHtml(n.project_title)}</b>`
          : '';
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
