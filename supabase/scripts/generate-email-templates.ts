/**
 * Builds the login emails (supabase/templates/*.html) in Fundy's brand,
 * in Uzbek, Russian and English.
 *
 *   npm run email:generate     then     npx supabase config push
 *
 * Each email picks the language the user chose at sign-up ({{ .Data.language }}),
 * falling back to Uzbek. Supabase fills in {{ .ConfirmationURL }} etc.
 * Email apps don't support modern CSS, so this is table layout with inline styles.
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const SITE = 'https://fundy-refined-b8z3.vercel.app';
const LOGO = `${SITE}/brand/fundy-logo-email.png`;
const INK = '#15122B';
const BRAND = '#B5F23D';
const MUTED = '#5B6175';
const PAGE = '#F4F6FB';

type Lang = 'uz' | 'ru' | 'en';
type Copy = { heading: string; text: string; button: string; fallback: string; ignore: string };

const FOOTER: Record<Lang, string> = {
  uz: "Fundy — O'zbekiston uchun foizsiz kraudfanding. Demo versiya: haqiqiy pul yechilmaydi.",
  ru: 'Fundy — беспроцентный краудфандинг для Узбекистана. Демо-версия: настоящие деньги не списываются.',
  en: 'Fundy — interest-free crowdfunding for Uzbekistan. Demo version: no real money is charged.',
};

const EMAILS: Record<string, { subject: string; copy: Record<Lang, Copy> }> = {
  confirmation: {
    subject: 'Fundy: emailingizni tasdiqlang · Подтвердите почту · Confirm your email',
    copy: {
      uz: {
        heading: "Fundy'ga xush kelibsiz!",
        text: 'Hisobingizni faollashtirish uchun elektron pochtangizni tasdiqlang.',
        button: 'Emailni tasdiqlash',
        fallback: 'Tugma ishlamasa, bu havolani brauzerga nusxalang:',
        ignore: "Agar siz Fundy'da ro'yxatdan o'tmagan bo'lsangiz, bu xatni e'tiborsiz qoldiring.",
      },
      ru: {
        heading: 'Добро пожаловать в Fundy!',
        text: 'Подтвердите почту, чтобы активировать аккаунт.',
        button: 'Подтвердить почту',
        fallback: 'Если кнопка не работает, скопируйте ссылку в браузер:',
        ignore: 'Если вы не регистрировались в Fundy, просто проигнорируйте это письмо.',
      },
      en: {
        heading: 'Welcome to Fundy!',
        text: 'Confirm your email to activate your account.',
        button: 'Confirm email',
        fallback: "If the button doesn't work, copy this link into your browser:",
        ignore: "If you didn't sign up for Fundy, you can ignore this email.",
      },
    },
  },
  magic_link: {
    subject: 'Fundy: kirish havolasi · Ссылка для входа · Your sign-in link',
    copy: {
      uz: {
        heading: 'Fundy’ga kirish',
        text: 'Hisobingizga kirish uchun quyidagi tugmani bosing. Havola bir marta ishlaydi.',
        button: 'Kirish',
        fallback: 'Tugma ishlamasa, bu havolani brauzerga nusxalang:',
        ignore: "Agar siz kirishni so'ramagan bo'lsangiz, bu xatni e'tiborsiz qoldiring.",
      },
      ru: {
        heading: 'Вход в Fundy',
        text: 'Нажмите кнопку, чтобы войти в аккаунт. Ссылка работает один раз.',
        button: 'Войти',
        fallback: 'Если кнопка не работает, скопируйте ссылку в браузер:',
        ignore: 'Если вы не запрашивали вход, проигнорируйте это письмо.',
      },
      en: {
        heading: 'Sign in to Fundy',
        text: 'Click the button to sign in. The link works once.',
        button: 'Sign in',
        fallback: "If the button doesn't work, copy this link into your browser:",
        ignore: "If you didn't ask to sign in, you can ignore this email.",
      },
    },
  },
  recovery: {
    subject: 'Fundy: parolni tiklash · Сброс пароля · Reset your password',
    copy: {
      uz: {
        heading: 'Parolni tiklash',
        text: 'Yangi parol tanlash uchun quyidagi tugmani bosing.',
        button: 'Yangi parol tanlash',
        fallback: 'Tugma ishlamasa, bu havolani brauzerga nusxalang:',
        ignore:
          "Agar siz parolni tiklashni so'ramagan bo'lsangiz, bu xatni e'tiborsiz qoldiring — parolingiz o'zgarmaydi.",
      },
      ru: {
        heading: 'Сброс пароля',
        text: 'Нажмите кнопку, чтобы выбрать новый пароль.',
        button: 'Выбрать новый пароль',
        fallback: 'Если кнопка не работает, скопируйте ссылку в браузер:',
        ignore: 'Если вы не запрашивали сброс, проигнорируйте письмо — пароль не изменится.',
      },
      en: {
        heading: 'Reset your password',
        text: 'Click the button to choose a new password.',
        button: 'Choose a new password',
        fallback: "If the button doesn't work, copy this link into your browser:",
        ignore: "If you didn't ask for this, ignore this email — your password stays the same.",
      },
    },
  },
  email_change: {
    subject: 'Fundy: yangi emailni tasdiqlang · Подтвердите новую почту · Confirm your new email',
    copy: {
      uz: {
        heading: 'Yangi emailni tasdiqlang',
        text: "Fundy hisobingiz uchun elektron pochtani {{ .NewEmail }} ga o'zgartirishni tasdiqlang.",
        button: "O'zgartirishni tasdiqlash",
        fallback: 'Tugma ishlamasa, bu havolani brauzerga nusxalang:',
        ignore: "Agar siz buni so'ramagan bo'lsangiz, bu xatni e'tiborsiz qoldiring.",
      },
      ru: {
        heading: 'Подтвердите новую почту',
        text: 'Подтвердите смену почты вашего аккаунта Fundy на {{ .NewEmail }}.',
        button: 'Подтвердить смену',
        fallback: 'Если кнопка не работает, скопируйте ссылку в браузер:',
        ignore: 'Если вы этого не запрашивали, проигнорируйте письмо.',
      },
      en: {
        heading: 'Confirm your new email',
        text: 'Confirm changing your Fundy account email to {{ .NewEmail }}.',
        button: 'Confirm change',
        fallback: "If the button doesn't work, copy this link into your browser:",
        ignore: "If you didn't ask for this, you can ignore this email.",
      },
    },
  },
};

function body(c: Copy, lang: Lang): string {
  return `
              <h1 style="margin:0 0 12px;font-size:24px;line-height:1.25;color:${INK};font-family:Arial,Helvetica,sans-serif;">${c.heading}</h1>
              <p style="margin:0 0 24px;font-size:16px;line-height:1.5;color:${INK};">${c.text}</p>
              <table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr><td style="border-radius:999px;background:${INK};">
                <a href="{{ .ConfirmationURL }}" style="display:inline-block;padding:14px 28px;font-size:15px;font-weight:bold;color:#FFFFFF;text-decoration:none;border-radius:999px;">${c.button}</a>
              </td></tr></table>
              <p style="margin:24px 0 6px;font-size:13px;line-height:1.5;color:${MUTED};">${c.fallback}</p>
              <p style="margin:0 0 24px;font-size:12px;line-height:1.5;word-break:break-all;"><a href="{{ .ConfirmationURL }}" style="color:${INK};">{{ .ConfirmationURL }}</a></p>
              <p style="margin:0;font-size:13px;line-height:1.5;color:${MUTED};">${c.ignore}</p>
            </td></tr>
            <tr><td style="padding:20px 32px;background:${PAGE};font-size:12px;line-height:1.5;color:${MUTED};">${FOOTER[lang]}</td></tr>`;
}

function template(copy: Record<Lang, Copy>): string {
  // printf avoids an error when .Data.language is missing (older accounts).
  const lang = '(printf "%v" .Data.language)';
  return `<!doctype html>
<html>
  <body style="margin:0;padding:0;background:${PAGE};font-family:Arial,Helvetica,sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${PAGE};padding:24px 12px;">
      <tr><td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:560px;background:#FFFFFF;border-radius:24px;overflow:hidden;">
          <tr><td style="background:${BRAND};padding:24px 32px;">
            <img src="${LOGO}" width="140" alt="Fundy" style="display:block;width:140px;height:auto;border:0;" />
          </td></tr>
          <tr><td style="padding:32px;">
{{ if eq ${lang} "ru" }}${body(copy.ru, 'ru')}
{{ else if eq ${lang} "en" }}${body(copy.en, 'en')}
{{ else }}${body(copy.uz, 'uz')}
{{ end }}
        </table>
      </td></tr>
    </table>
  </body>
</html>
`;
}

const dir = join(import.meta.dirname, '..', 'templates');
mkdirSync(dir, { recursive: true });
for (const [name, email] of Object.entries(EMAILS)) {
  writeFileSync(join(dir, `${name}.html`), template(email.copy));
  console.log(`supabase/templates/${name}.html  —  "${email.subject}"`);
}
