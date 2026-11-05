import type { Article, Localized } from '@/content/types';

const UPDATED = '2026-11-05';

export const privacy: Localized<Article> = {
  uz: {
    kicker: 'Maxfiylik siyosati',
    title: 'Maxfiylik siyosati',
    intro: "Qanday ma'lumotlarni yig'amiz, nima uchun va ular qayerda saqlanadi — oddiy tilda.",
    draftNote:
      "Loyiha matni. Bu siyosat demo versiya uchun tayyorlangan va haqiqiy ishga tushirishdan oldin yurist tomonidan, jumladan shaxsga doir ma'lumotlar to'g'risidagi qonunchilik talablari bo'yicha ko'rib chiqiladi.",
    updated: UPDATED,
    sections: [
      {
        id: 'collect',
        heading: "Qanday ma'lumotlarni yig'amiz",
        bullets: [
          'Hisob: ism, elektron pochta, parol (shifrlangan holda), shahar, viloyat, tanlangan til. Google orqali kirsangiz — Google bergan ism va email.',
          "Asoschi profili: ko'rsatiladigan ism, lavozim, tashkilot, ro'yxat raqami, tajriba, o'zingiz haqingizda.",
          "Hujjatlar: ko'rib chiqish uchun yuklangan fayllar (masalan, guvohnoma, biznes reja).",
          'Faollik: hissalar (demo), saqlangan loyihalar, izohlar, yangiliklar, bildirishnomalar.',
          'Aloqa xabarlari: aloqa formasida yozgan ism, email va matn.',
          "Texnik ma'lumotlar: xizmat ko'rsatuvchilarimiz yozib boradigan IP manzil va brauzer turi.",
        ],
      },
      {
        id: 'why',
        heading: 'Nima uchun',
        bullets: [
          "Hisobingizni yaratish va himoya qilish, tizimga kirishni ta'minlash.",
          "Loyihalarni ko'rsatish, ko'rib chiqish va firibgarlikning oldini olish.",
          'Sizga bildirishnoma va xizmat xatlarini yuborish.',
          'Platformani yaxshilash va xatolarni tuzatish.',
        ],
        paragraphs: ["Biz ma'lumotlaringizni sotmaymiz va reklama uchun ishlatmaymiz."],
      },
      {
        id: 'visible',
        heading: "Boshqalar nimani ko'radi",
        paragraphs: [
          "Ismingiz, shahringiz va rasmingiz izohlar va asoschi profilida ko'rinadi. Elektron pochtangiz va hujjatlaringiz hech qachon ochiq ko'rsatilmaydi. Hissa qo'shayotganda \"ismimni ko'rsatmang\" ni tanlashingiz mumkin.",
        ],
      },
      {
        id: 'where',
        heading: "Ma'lumotlar qayerda saqlanadi",
        paragraphs: [
          "Hozir ma'lumotlar xizmat ko'rsatuvchilarimiz serverlarida saqlanadi: Supabase (ma'lumotlar bazasi va fayllar, Singapur) va Vercel (sayt). Bu O'zbekistondan tashqarida joylashgan.",
          "Haqiqiy ishga tushirishdan oldin ma'lumotlarni saqlash joyi O'zbekiston qonunchiligi talablariga muvofiqlashtiriladi.",
        ],
      },
      {
        id: 'browser',
        heading: 'Brauzeringizda nima saqlanadi',
        paragraphs: [
          'Tizimga kirganingizni eslab qolish va tanlagan tilingizni saqlash uchun brauzer xotirasidan (localStorage) foydalanamiz. Reklama yoki kuzatuv cookie-fayllaridan foydalanmaymiz.',
        ],
      },
      {
        id: 'rights',
        heading: 'Sizning huquqlaringiz',
        bullets: [
          'Ma\'lumotlaringizni ko\'rish va tuzatish — "Sozlamalar" sahifasida.',
          'Hisobni o\'chirish — "Sozlamalar" sahifasida. Hissa yoki loyihasi bor hisoblar moliyaviy hisobot uchun saqlanadi; ularni yopish uchun biz bilan bog\'laning.',
          "Ma'lumotlaringiz nusxasini so'rash yoki boshqa savollar — aloqa sahifasi orqali.",
        ],
      },
      {
        id: 'changes',
        heading: "O'zgarishlar",
        paragraphs: ["Siyosat o'zgarsa, ushbu sahifadagi sana yangilanadi va muhim o'zgarishlar haqida xabar beramiz."],
      },
    ],
  },
  ru: {
    kicker: 'Политика конфиденциальности',
    title: 'Политика конфиденциальности',
    intro: 'Какие данные мы собираем, зачем и где они хранятся — простыми словами.',
    draftNote:
      'Черновик. Эта политика подготовлена для демо-версии и будет проверена юристом до реального запуска, в том числе на соответствие законодательству о персональных данных.',
    updated: UPDATED,
    sections: [
      {
        id: 'collect',
        heading: 'Какие данные мы собираем',
        bullets: [
          'Аккаунт: имя, почта, пароль (в зашифрованном виде), город, регион, выбранный язык. При входе через Google — имя и почта из Google.',
          'Профиль автора: отображаемое имя, роль, организация, регистрационный номер, опыт, информация о себе.',
          'Документы: файлы, загруженные для проверки (например, свидетельство, бизнес-план).',
          'Активность: вклады (демо), сохранённые проекты, комментарии, новости, уведомления.',
          'Обращения: имя, почта и текст, отправленные через форму контактов.',
          'Технические данные: IP-адрес и тип браузера, которые записывают наши провайдеры.',
        ],
      },
      {
        id: 'why',
        heading: 'Зачем',
        bullets: [
          'Чтобы создать и защитить ваш аккаунт и обеспечить вход.',
          'Чтобы показывать и проверять проекты и предотвращать мошенничество.',
          'Чтобы отправлять уведомления и служебные письма.',
          'Чтобы улучшать платформу и исправлять ошибки.',
        ],
        paragraphs: ['Мы не продаём ваши данные и не используем их для рекламы.'],
      },
      {
        id: 'visible',
        heading: 'Что видят другие',
        paragraphs: [
          'Ваше имя, город и фото видны рядом с комментариями и в профиле автора. Почта и документы никогда не показываются публично. При поддержке проекта можно выбрать «Не показывать моё имя».',
        ],
      },
      {
        id: 'where',
        heading: 'Где хранятся данные',
        paragraphs: [
          'Сейчас данные хранятся на серверах наших провайдеров: Supabase (база данных и файлы, Сингапур) и Vercel (сайт). Это за пределами Узбекистана.',
          'До реального запуска место хранения данных будет приведено в соответствие с требованиями законодательства Узбекистана.',
        ],
      },
      {
        id: 'browser',
        heading: 'Что хранится в браузере',
        paragraphs: [
          'Мы используем память браузера (localStorage), чтобы помнить вход и выбранный язык. Рекламные и следящие cookie мы не используем.',
        ],
      },
      {
        id: 'rights',
        heading: 'Ваши права',
        bullets: [
          'Просматривать и исправлять данные — на странице «Настройки».',
          'Удалить аккаунт — на странице «Настройки». Аккаунты с вкладами или проектами сохраняются для финансовой отчётности; чтобы закрыть их, свяжитесь с нами.',
          'Запросить копию данных или задать вопрос — через страницу контактов.',
        ],
      },
      {
        id: 'changes',
        heading: 'Изменения',
        paragraphs: ['Если политика изменится, дата на этой странице обновится, а о важных изменениях мы сообщим.'],
      },
    ],
  },
  en: {
    kicker: 'Privacy Policy',
    title: 'Privacy Policy',
    intro: 'What data we collect, why, and where it is stored — in plain language.',
    draftNote:
      'Draft. This policy was prepared for the demo and will be reviewed by a lawyer before a real launch, including against personal data law requirements.',
    updated: UPDATED,
    sections: [
      {
        id: 'collect',
        heading: 'What we collect',
        bullets: [
          'Account: name, email, password (stored encrypted), city, region, chosen language. If you sign in with Google — the name and email Google provides.',
          'Founder profile: display name, role, organisation, registration number, experience, bio.',
          'Documents: files uploaded for review (for example a certificate or business plan).',
          'Activity: contributions (demo), saved projects, comments, updates, notifications.',
          'Messages: the name, email and text you send through the contact form.',
          'Technical data: IP address and browser type, recorded by our service providers.',
        ],
      },
      {
        id: 'why',
        heading: 'Why',
        bullets: [
          'To create and protect your account and let you sign in.',
          'To show and review projects and prevent fraud.',
          'To send you notifications and service emails.',
          'To improve the platform and fix problems.',
        ],
        paragraphs: ['We do not sell your data or use it for advertising.'],
      },
      {
        id: 'visible',
        heading: 'What others can see',
        paragraphs: [
          'Your name, city and photo appear next to your comments and on a founder profile. Your email and documents are never shown publicly. When backing a project you can choose “Don’t show my name”.',
        ],
      },
      {
        id: 'where',
        heading: 'Where data is stored',
        paragraphs: [
          'Today data is stored with our service providers: Supabase (database and files, Singapore) and Vercel (the website). These are outside Uzbekistan.',
          'Before a real launch, where data is stored will be brought in line with the requirements of Uzbek law.',
        ],
      },
      {
        id: 'browser',
        heading: 'What is stored in your browser',
        paragraphs: [
          'We use browser storage (localStorage) to keep you signed in and remember your language. We do not use advertising or tracking cookies.',
        ],
      },
      {
        id: 'rights',
        heading: 'Your rights',
        bullets: [
          'See and correct your data — on the Settings page.',
          'Delete your account — on the Settings page. Accounts with contributions or projects are kept for financial records; contact us to close them.',
          'Ask for a copy of your data or anything else — through the contact page.',
        ],
      },
      {
        id: 'changes',
        heading: 'Changes',
        paragraphs: [
          'If this policy changes, the date on this page is updated and we will announce important changes.',
        ],
      },
    ],
  },
};
