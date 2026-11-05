import type { Article, Localized } from '@/content/types';

export const trust: Localized<Article> = {
  uz: {
    kicker: 'Ishonch va xavfsizlik',
    title: 'Pulingiz qanday himoyalanadi',
    intro:
      "Fundy'da har bir loyiha tekshiriladi, har bir byudjet ochiq va mablag' faqat bajarilgan ish uchun beriladi. Mana qanday ishlaydi — va nimalarni bilishingiz kerak.",
    sections: [
      {
        id: 'review',
        heading: 'Loyihalar qanday tekshiriladi',
        paragraphs: ["Loyiha e'lon qilinishidan oldin Fundy ko'rib chiqish jamoasi:"],
        bullets: [
          "Asoschini va uning tashkiloti ro'yxatdan o'tganligini (MChJ, YaTT yoki STIR) tekshiradi.",
          "Hujjatlarni ko'rib chiqadi: ro'yxatdan o'tganlik guvohnomasi, biznes reja, moliyaviy hisobotlar.",
          'Byudjet maqsadga aniq teng ekanini va bosqichlar mantiqiy ekanini tekshiradi.',
          "Loyihani beshta yo'nalish bo'yicha baholaydi (har biri 0–20 ball): biznes reja, jamoa, bozor, moliya va xavflarni boshqarish.",
        ],
      },
      {
        id: 'verified',
        heading: '"Tasdiqlangan asoschi" belgisi',
        paragraphs: [
          "Belgi asoschining shaxsi va ro'yxatdan o'tganligi hujjatlar bilan tasdiqlanganini bildiradi. Bu loyiha muvaffaqiyatli bo'lishiga kafolat emas.",
          "Adminlar o'z loyihalarini baholay olmaydi va o'zlarini tasdiqlay olmaydi — buni boshqa admin qilishi shart.",
        ],
      },
      {
        id: 'milestones',
        heading: "Mablag' bosqichma-bosqich beriladi",
        paragraphs: [
          "Har bir loyiha ishni bosqichlarga bo'ladi va har bir bosqich uchun mablag'ning qancha qismi berilishini ko'rsatadi. Asoschi bosqich bajarilganini isbotlaydi, jamoamiz uni tekshiradi — shundan keyingina keyingi qism beriladi.",
          "Demo versiyada pul harakatlanmaydi; bosqichlar jarayonni ko'rsatish uchun simulyatsiya qilinadi.",
        ],
      },
      {
        id: 'risks',
        heading: "Bilishingiz kerak bo'lgan xavflar",
        bullets: [
          "Loyihalar muvaffaqiyatsiz bo'lishi mumkin. Tekshiruv xavfni kamaytiradi, lekin yo'q qilmaydi.",
          'Mukofotlarni yetkazish kechikishi mumkin.',
          "Mushoraka — hamkorlik: foyda va zararni baham ko'rasiz. Daromad kafolatlanmagan, sarmoyaning bir qismi yoki barchasi yo'qolishi mumkin.",
          "Faqat yo'qotishga tayyor bo'lgan miqdorda qo'llab-quvvatlang.",
        ],
      },
      {
        id: 'report',
        heading: 'Muammo haqida xabar berish',
        paragraphs: [
          'Agar loyiha yoki izoh shubhali ko\'rinsa, aloqa sahifasi orqali "Muammo haqida xabar berish" mavzusini tanlab yozing. Adminlar har bir xabarni ko\'rib chiqadi; nomaqbul izohlar yashiriladi, qoidabuzar foydalanuvchilar bloklanadi.',
          "Har bir admin harakati o'zgartirib bo'lmaydigan jurnalga yoziladi.",
        ],
      },
      {
        id: 'data',
        heading: "Ma'lumotlaringiz",
        paragraphs: [
          "Elektron pochtangiz boshqalarga ko'rsatilmaydi. Hujjatlar maxfiy saqlanadi — ularni faqat siz va ko'rib chiqish jamoasi ko'radi. Batafsil — Maxfiylik siyosatida.",
        ],
      },
    ],
  },
  ru: {
    kicker: 'Доверие и безопасность',
    title: 'Как защищены ваши деньги',
    intro:
      'В Fundy каждый проект проходит проверку, каждый бюджет открыт, а деньги выдаются только за выполненную работу. Вот как это устроено — и что важно знать.',
    sections: [
      {
        id: 'review',
        heading: 'Как проверяются проекты',
        paragraphs: ['Перед публикацией команда проверки Fundy:'],
        bullets: [
          'Проверяет автора и регистрацию его организации (ООО, ИП или ИНН).',
          'Изучает документы: свидетельство о регистрации, бизнес-план, финансовую отчётность.',
          'Проверяет, что бюджет точно равен цели, а этапы логичны.',
          'Оценивает проект по пяти направлениям (0–20 баллов каждое): бизнес-план, команда, рынок, финансы и управление рисками.',
        ],
      },
      {
        id: 'verified',
        heading: 'Значок «Проверенный автор»',
        paragraphs: [
          'Значок означает, что личность автора и регистрация подтверждены документами. Это не гарантия успеха проекта.',
          'Администраторы не могут оценивать собственные проекты и подтверждать сами себя — это должен сделать другой администратор.',
        ],
      },
      {
        id: 'milestones',
        heading: 'Деньги выдаются по этапам',
        paragraphs: [
          'Каждый проект делит работу на этапы и указывает, какая часть средств выдаётся за каждый. Автор подтверждает выполнение этапа, наша команда проверяет — и только тогда выдаётся следующая часть.',
          'В демо-версии деньги не движутся; этапы симулируются, чтобы показать процесс.',
        ],
      },
      {
        id: 'risks',
        heading: 'Риски, о которых нужно знать',
        bullets: [
          'Проекты могут не достичь успеха. Проверка снижает риск, но не устраняет его.',
          'Доставка вознаграждений может задерживаться.',
          'Мушарака — это партнёрство: вы делите и прибыль, и убытки. Доход не гарантирован, можно потерять часть или все вложения.',
          'Поддерживайте проекты только той суммой, которую готовы потерять.',
        ],
      },
      {
        id: 'report',
        heading: 'Как сообщить о проблеме',
        paragraphs: [
          'Если проект или комментарий выглядит подозрительно, напишите нам через страницу контактов, выбрав тему «Сообщить о проблеме». Администраторы рассматривают каждое обращение; неуместные комментарии скрываются, нарушители блокируются.',
          'Каждое действие администратора записывается в журнал, который нельзя изменить.',
        ],
      },
      {
        id: 'data',
        heading: 'Ваши данные',
        paragraphs: [
          'Ваша почта не показывается другим. Документы хранятся закрыто — их видите только вы и команда проверки. Подробнее — в Политике конфиденциальности.',
        ],
      },
    ],
  },
  en: {
    kicker: 'Trust & Safety',
    title: 'How your money is protected',
    intro:
      'On Fundy every project is checked, every budget is public, and money is released only for work delivered. Here is how it works — and what you should know.',
    sections: [
      {
        id: 'review',
        heading: 'How projects are checked',
        paragraphs: ["Before a project goes live, Fundy's review team:"],
        bullets: [
          "Checks the founder and their organisation's registration (MChJ, YaTT or TIN).",
          'Reviews documents: registration certificate, business plan, financial statements.',
          'Checks that the budget exactly matches the goal and the milestones make sense.',
          'Scores the project in five areas (0–20 each): business plan, team, market, financials and risk management.',
        ],
      },
      {
        id: 'verified',
        heading: 'The "Verified founder" badge',
        paragraphs: [
          "The badge means the founder's identity and registration were confirmed with documents. It is not a guarantee that the project will succeed.",
          'Admins cannot evaluate their own projects or verify themselves — another admin must do it.',
        ],
      },
      {
        id: 'milestones',
        heading: 'Money is released in stages',
        paragraphs: [
          'Every project splits the work into milestones and states how much of the money each one releases. The founder shows proof that a milestone is done, our team checks it — and only then is the next part released.',
          'In the demo no money moves; milestones are simulated to show the process.',
        ],
      },
      {
        id: 'risks',
        heading: 'Risks you should know',
        bullets: [
          'Projects can fail. Reviews reduce the risk; they do not remove it.',
          'Reward deliveries can be delayed.',
          'Musharakah is a partnership: you share profits and losses. Returns are not guaranteed, and you can lose part or all of what you put in.',
          'Only back projects with money you can afford to lose.',
        ],
      },
      {
        id: 'report',
        heading: 'Reporting a problem',
        paragraphs: [
          'If a project or comment looks wrong, write to us through the contact page and choose "Report a problem". Admins review every report; inappropriate comments are hidden and rule-breakers are blocked.',
          'Every admin action is written to a log that cannot be changed.',
        ],
      },
      {
        id: 'data',
        heading: 'Your data',
        paragraphs: [
          'Your email is never shown to others. Documents are stored privately — only you and the review team can see them. Details are in the Privacy Policy.',
        ],
      },
    ],
  },
};
