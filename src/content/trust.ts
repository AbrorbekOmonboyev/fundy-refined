import type { Article, Localized } from '@/content/types';

export const trust: Localized<Article> = {
  uz: {
    kicker: 'Ishonch va xavfsizlik',
    title: 'Pulingiz qanday himoyalanadi',
    intro:
      'Fundyʼda har bir loyiha tekshiriladi, har bir byudjet ochiq va mablagʻ faqat bajarilgan ish uchun beriladi. Quyida qanday ishlashini va nimalarni bilishingiz kerakligini tushuntiramiz.',
    sections: [
      {
        id: 'review',
        heading: 'Loyihalar qanday tekshiriladi',
        paragraphs: ['Loyiha eʼlon qilinishidan oldin Fundy koʻrib chiqish jamoasi:'],
        bullets: [
          'Asoschining shaxsini OneID orqali (ulanguncha esa videoqoʻngʻiroqda) va, agar tashkilot boʻlsa, uning roʻyxatdan oʻtganligini (MChJ, YaTT, NNT yoki STIR) tekshiradi. Kompaniyasi yoʻq asoschi birinchi toʻlovdan oldin roʻyxatdan oʻtadi; mushorakada sarmoyadorlar MChJ ochilgandan keyingina toʻlaydi.',
          'Hujjatlarni koʻrib chiqadi: roʻyxatdan oʻtganlik guvohnomasi, biznes reja, moliyaviy hisobotlar.',
          'Byudjet maqsadga aniq teng ekanini va bosqichlar mantiqiy ekanini tekshiradi.',
          'Loyihani beshta yoʻnalish boʻyicha baholaydi (har biri 0–20 ball): biznes reja, jamoa, bozor, moliya va xavflarni boshqarish.',
        ],
      },
      {
        id: 'verified',
        heading: '«Tasdiqlangan asoschi» belgisi',
        paragraphs: [
          'Belgi asoschining shaxsi va roʻyxatdan oʻtganligi hujjatlar bilan tasdiqlanganini bildiradi. Bu loyiha muvaffaqiyatli boʻlishiga kafolat emas.',
          'Adminlar oʻz loyihalarini baholay olmaydi va oʻzlarini tasdiqlay olmaydi. Buni boshqa admin qilishi shart.',
        ],
      },
      {
        id: 'milestones',
        heading: 'Mablagʻ bosqichma-bosqich beriladi',
        paragraphs: [
          'Har bir loyiha ishni bosqichlarga boʻladi va har bir bosqich uchun mablagʻning qancha qismi berilishini koʻrsatadi. Asoschi bosqich bajarilganini isbotlaydi, jamoamiz uni tekshiradi va shundan keyingina keyingi qism beriladi.',
          'Demo versiyada pul harakatlanmaydi; bosqichlar jarayonni koʻrsatish uchun simulyatsiya qilinadi.',
        ],
      },
      {
        id: 'risks',
        heading: 'Bilishingiz kerak boʻlgan xavflar',
        bullets: [
          'Loyihalar muvaffaqiyatsiz boʻlishi mumkin. Tekshiruv xavfni kamaytiradi, lekin yoʻq qilmaydi.',
          'Mukofotlarni yetkazish kechikishi mumkin.',
          'Mushoraka — hamkorlik: foyda va zararni baham koʻrasiz. Daromad kafolatlanmagan, sarmoyaning bir qismi yoki barchasi yoʻqolishi mumkin.',
          'Faqat yoʻqotishga tayyor boʻlgan miqdorda qoʻllab-quvvatlang.',
        ],
      },
      {
        id: 'report',
        heading: 'Muammo haqida xabar berish',
        paragraphs: [
          'Agar loyiha yoki izoh shubhali koʻrinsa, aloqa sahifasi orqali «Muammo haqida xabar berish» mavzusini tanlab yozing. Adminlar har bir xabarni koʻrib chiqadi; nomaqbul izohlar yashiriladi, qoidabuzar foydalanuvchilar bloklanadi.',
          'Har bir admin harakati oʻzgartirib boʻlmaydigan jurnalga yoziladi.',
        ],
      },
      {
        id: 'data',
        heading: 'Maʼlumotlaringiz',
        paragraphs: [
          'Elektron pochtangiz boshqalarga koʻrsatilmaydi. Hujjatlar maxfiy saqlanadi, ularni faqat siz va koʻrib chiqish jamoasi koʻradi. Batafsil maʼlumot Maxfiylik siyosatida.',
        ],
      },
    ],
  },
  ru: {
    kicker: 'Доверие и безопасность',
    title: 'Как защищены ваши деньги',
    intro:
      'В Fundy каждый проект проходит проверку, каждый бюджет открыт, а деньги выдаются только за выполненную работу. Ниже рассказываем, как это устроено и что важно знать.',
    sections: [
      {
        id: 'review',
        heading: 'Как проверяются проекты',
        paragraphs: ['Перед публикацией команда проверки Fundy:'],
        bullets: [
          'Проверяет личность автора через OneID (пока он не подключён, по видеозвонку) и, если есть организация, её регистрацию (ООО, ИП, ННО или ИНН). Автор без компании регистрируется до первой выплаты; в мушараке инвесторы платят только после регистрации ООО.',
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
          'Администраторы не могут оценивать собственные проекты и подтверждать сами себя. Это должен сделать другой администратор.',
        ],
      },
      {
        id: 'milestones',
        heading: 'Деньги выдаются по этапам',
        paragraphs: [
          'Каждый проект делит работу на этапы и указывает, какая часть средств выдаётся за каждый. Автор подтверждает выполнение этапа, наша команда проверяет, и только тогда выдаётся следующая часть.',
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
          'Ваша почта не показывается другим. Документы хранятся закрыто, их видите только вы и команда проверки. Подробнее в Политике конфиденциальности.',
        ],
      },
    ],
  },
  en: {
    kicker: 'Trust & Safety',
    title: 'How your money is protected',
    intro:
      'On Fundy every project is checked, every budget is public, and money is released only for work delivered. Here is how it works and what you should know.',
    sections: [
      {
        id: 'review',
        heading: 'How projects are checked',
        paragraphs: ["Before a project goes live, Fundy's review team:"],
        bullets: [
          "Checks the founder's identity with OneID (by video call until OneID is connected) and, if they have an organisation, its registration (MChJ, YaTT, NNT or TIN). A founder without a company registers before the first payout; in Musharakah, investors pay only after the MChJ is registered.",
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
          'Admins cannot evaluate their own projects or verify themselves. Another admin must do it.',
        ],
      },
      {
        id: 'milestones',
        heading: 'Money is released in stages',
        paragraphs: [
          'Every project splits the work into milestones and states how much of the money each one releases. The founder shows proof that a milestone is done, our team checks it, and only then is the next part released.',
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
          'Your email is never shown to others. Documents are stored privately, and only you and the review team can see them. Details are in the Privacy Policy.',
        ],
      },
    ],
  },
};
