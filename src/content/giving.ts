import type { Article, Localized } from '@/content/types';

/** The Learn page while Fundy is donation-only (src/lib/focus.ts). The full model guide is in education.ts. */
export const giving: Localized<Article> = {
  uz: {
    kicker: 'Taʼlim',
    title: 'Fundyʼda xayriya qanday ishlaydi',
    intro:
      'Fundy — Oʻzbekistondagi ezgu loyihalar uchun xayriya platformasi. Har bir yigʻim tekshiriladi, pul bosqichma-bosqich beriladi va har bir bosqich boʻyicha xarajatlar hisoboti eʼlon qilinadi.',
    sections: [
      {
        id: 'giving',
        heading: 'Xayriya qanday amalga oshadi',
        bullets: [
          'Loyihani tanlang va istalgan summani xayriya qiling (kamida 10 000 soʻm).',
          'Click, Payme, Uzcard yoki Humo orqali toʻlang.',
          'Loyiha yangiliklari va bosqichlar hisobotini kuzatib boring.',
        ],
      },
      {
        id: 'checks',
        heading: 'Yigʻimlar qanday tekshiriladi',
        bullets: [
          'Tashkilotchining shaxsi OneID orqali (OneID ulanguncha — video qoʻngʻiroq orqali) tasdiqlanadi.',
          'Har bir loyihada soʻmdagi byudjet va bosqichlar boʻladi: nima qilinadi, qachon va pulning qancha qismi.',
          '«Tasdiqlangan fond» belgisi: jamoamiz fondning roʻyxatdan oʻtish raqamini tekshirgan va u loyiha sahifasida koʻrsatiladi.',
        ],
      },
      {
        id: 'money',
        heading: 'Pul qayerga ketadi',
        paragraphs: [
          'Pul birdaniga emas, bosqichma-bosqich beriladi. Tashkilotchi bosqichni yakunlagach, qancha sarflanganini yozadi va cheklar rasmini yuklaydi. Fundy tekshirgach, hisobot loyiha sahifasida hammaga ochiq boʻladi va keyingi qism beriladi.',
        ],
      },
      {
        id: 'fees',
        heading: 'Komissiya va ixtiyoriy hissa',
        paragraphs: [
          'Fundy xayriyalardan komissiya olmaydi: loyiha xayriyangizning hammasini oladi. Toʻlov paytida xohlasangiz Fundyʼga ixtiyoriy hissa qoʻshishingiz mumkin — u platformani yuritishga ketadi va loyiha summasiga qoʻshilmaydi.',
        ],
      },
      {
        id: 'receipts',
        heading: 'Kvitansiya',
        paragraphs: [
          'Har bir xayriyadan keyin saqlash yoki chop etish mumkin boʻlgan kvitansiya olasiz. Barcha kvitansiyalar «Mening hissalarim» sahifasida turadi.',
        ],
      },
      {
        id: 'disclaimer',
        heading: 'Muhim eslatma',
        paragraphs: ['Bu demo versiya: toʻlovlar simulyatsiya qilinadi, haqiqiy pul yechilmaydi.'],
      },
    ],
  },
  ru: {
    kicker: 'Обучение',
    title: 'Как работают пожертвования на Fundy',
    intro:
      'Fundy — платформа пожертвований на добрые дела в Узбекистане. Каждый сбор проверяется, деньги выдаются по этапам, и по каждому этапу публикуется отчёт о расходах.',
    sections: [
      {
        id: 'giving',
        heading: 'Как сделать пожертвование',
        bullets: [
          'Выберите проект и пожертвуйте любую сумму (от 10 000 сумов).',
          'Оплатите через Click, Payme, Uzcard или Humo.',
          'Следите за новостями проекта и отчётами по этапам.',
        ],
      },
      {
        id: 'checks',
        heading: 'Как мы проверяем сборы',
        bullets: [
          'Личность организатора подтверждается через OneID (пока OneID не подключён — по видеозвонку).',
          'У каждого проекта есть бюджет в сумах и этапы: что будет сделано, когда и какая часть денег.',
          'Отметка «Проверенный фонд»: наша команда проверила регистрационный номер фонда, и он указан на странице проекта.',
        ],
      },
      {
        id: 'money',
        heading: 'Куда идут деньги',
        paragraphs: [
          'Деньги выдаются не сразу, а по этапам. Завершив этап, организатор указывает, сколько потрачено, и загружает фото чеков. После проверки Fundy отчёт открывается всем на странице проекта, и выдаётся следующая часть.',
        ],
      },
      {
        id: 'fees',
        heading: 'Комиссия и добровольная поддержка',
        paragraphs: [
          'Fundy не берёт комиссию с пожертвований: проект получает всю сумму. При оплате вы можете по желанию добавить поддержку Fundy — она идёт на работу платформы и не входит в сумму проекта.',
        ],
      },
      {
        id: 'receipts',
        heading: 'Квитанция',
        paragraphs: [
          'После каждого пожертвования вы получаете квитанцию, которую можно сохранить или распечатать. Все квитанции есть на странице «Мои взносы».',
        ],
      },
      {
        id: 'disclaimer',
        heading: 'Важно',
        paragraphs: ['Это демо-версия: платежи симулируются, настоящие деньги не списываются.'],
      },
    ],
  },
  en: {
    kicker: 'Learn',
    title: 'How giving works on Fundy',
    intro:
      'Fundy is a donation platform for good causes in Uzbekistan. Every campaign is checked, money is paid out stage by stage, and each stage comes with a report of what was spent.',
    sections: [
      {
        id: 'giving',
        heading: 'How to donate',
        bullets: [
          'Pick a campaign and give any amount (from 10,000 so’m).',
          'Pay with Click, Payme, Uzcard or Humo.',
          'Follow the campaign’s updates and its stage reports.',
        ],
      },
      {
        id: 'checks',
        heading: 'How we check campaigns',
        bullets: [
          'The organiser’s identity is confirmed with OneID (by video call until OneID is connected).',
          'Every campaign has a budget in so’m and stages: what gets done, when, and what share of the money.',
          '“Verified fund”: our team has checked the fund’s registration number, and it is shown on the campaign page.',
        ],
      },
      {
        id: 'money',
        heading: 'Where the money goes',
        paragraphs: [
          'Money is paid out in stages, not all at once. When the organiser finishes a stage, they enter how much was spent and upload photos of the receipts. Once Fundy checks it, the report is public on the campaign page and the next part is released.',
        ],
      },
      {
        id: 'fees',
        heading: 'Fees and the optional tip',
        paragraphs: [
          'Fundy takes no commission on donations: the campaign gets your whole donation. When you pay you can add an optional tip for Fundy. It keeps the platform running and is not counted towards the campaign.',
        ],
      },
      {
        id: 'receipts',
        heading: 'Receipts',
        paragraphs: [
          'After every donation you get a receipt you can save or print. All your receipts are on the “My contributions” page.',
        ],
      },
      {
        id: 'disclaimer',
        heading: 'Important',
        paragraphs: ['This is a demo: payments are simulated and no real money is charged.'],
      },
    ],
  },
};
