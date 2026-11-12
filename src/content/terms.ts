import type { Article, Localized } from '@/content/types';

const UPDATED = '2026-11-05';

export const terms: Localized<Article> = {
  uz: {
    kicker: 'Foydalanish shartlari',
    title: 'Foydalanish shartlari',
    intro: 'Fundyʼdan foydalanish orqali siz quyidagi shartlarga rozilik bildirasiz. Iltimos, diqqat bilan oʻqing.',
    draftNote:
      'Loyiha matni. Bu shartlar demo versiya uchun tayyorlangan va haqiqiy ishga tushirishdan oldin yurist tomonidan koʻrib chiqiladi.',
    updated: UPDATED,
    sections: [
      {
        id: 'service',
        heading: '1. Xizmat haqida',
        paragraphs: [
          'Fundy — loyiha asoschilarini ularni qoʻllab-quvvatlovchilar bilan bogʻlaydigan onlayn platforma. Fundy loyihalarning oʻzini amalga oshirmaydi va ularning natijasiga kafolat bermaydi.',
          'Hozirgi demo versiyada barcha toʻlovlar simulyatsiya: haqiqiy pul yechilmaydi va oʻtkazilmaydi.',
        ],
      },
      {
        id: 'accounts',
        heading: '2. Hisob',
        bullets: [
          'Hisob ochish uchun 18 yoshdan katta boʻlishingiz kerak.',
          'Toʻgʻri maʼlumot kiriting va parolingizni maxfiy saqlang. Hisobingizdagi harakatlar uchun siz javobgarsiz.',
          'Bir kishi — bitta hisob. Boshqa shaxs nomidan hisob ochish taqiqlanadi.',
        ],
      },
      {
        id: 'founders',
        heading: '3. Loyiha asoschilari uchun qoidalar',
        bullets: [
          'Loyiha, byudjet, bosqichlar va xavflar haqidagi barcha maʼlumotlar haqqoniy va toʻliq boʻlishi kerak.',
          'Yuklangan hujjatlar haqiqiy boʻlishi va sizga tegishli boʻlishi kerak.',
          'Mablagʻ faqat eʼlon qilingan byudjetga muvofiq ishlatilishi kerak.',
          'Homiylarni muntazam yangiliklar bilan xabardor qilib turing va bosqichlarni bajarilganini isbotlang.',
          'Fundy loyihani tushuntirishsiz rad etish, oʻzgartirish soʻrash yoki toʻxtatish huquqiga ega.',
        ],
      },
      {
        id: 'backers',
        heading: '4. Homiylar uchun',
        bullets: [
          'Qoʻllab-quvvatlash — bu loyihaga ishonch, xarid emas. Mukofotlar kechikishi yoki oʻzgarishi mumkin.',
          'Mushoraka hamkorligida foyda ham, zarar ham taqsimlanadi; daromad kafolatlanmagan.',
          'Fundyʼdagi maʼlumotlar moliyaviy, investitsion yoki diniy maslahat emas. Qaror qabul qilishdan oldin mustaqil maslahat oling.',
        ],
      },
      {
        id: 'content',
        heading: '5. Kontent va xulq-atvor',
        bullets: [
          'Haqoratli, yolgʻon, noqonuniy yoki reklama xarakteridagi kontent joylashtirish taqiqlanadi.',
          'Boshqalarning mualliflik huquqi va shaxsiy maʼlumotlarini hurmat qiling.',
          'Siz joylashtirgan matn va rasmlar sizga tegishli boʻlib qoladi; ularni platformada koʻrsatish uchun Fundyʼga ruxsat berasiz.',
          'Fundy qoidalarni buzgan kontentni yashirishi va hisoblarni bloklashi mumkin.',
        ],
      },
      {
        id: 'liability',
        heading: '6. Javobgarlik',
        paragraphs: [
          'Fundy platformani «boricha» taqdim etadi. Qonun ruxsat bergan darajada Fundy loyihalarning muvaffaqiyatsizligi, kechikishi yoki asoschilar harakatlari uchun javobgar emas.',
        ],
      },
      {
        id: 'changes',
        heading: '7. Oʻzgarishlar va qoʻllaniladigan qonun',
        paragraphs: [
          'Shartlar oʻzgarishi mumkin; muhim oʻzgarishlar haqida sayt orqali xabar beramiz. Ushbu shartlarga Oʻzbekiston Respublikasi qonunchiligi qoʻllaniladi.',
          'Savollar boʻlsa, aloqa sahifasi orqali yozing.',
        ],
      },
    ],
  },
  ru: {
    kicker: 'Условия использования',
    title: 'Условия использования',
    intro: 'Пользуясь Fundy, вы соглашаетесь с этими условиями. Пожалуйста, прочитайте их внимательно.',
    draftNote: 'Черновик. Эти условия подготовлены для демо-версии и будут проверены юристом до реального запуска.',
    updated: UPDATED,
    sections: [
      {
        id: 'service',
        heading: '1. О сервисе',
        paragraphs: [
          'Fundy — онлайн-платформа, которая соединяет авторов проектов с теми, кто готов их поддержать. Fundy не реализует проекты сам и не гарантирует их результат.',
          'В текущей демо-версии все платежи — симуляция: настоящие деньги не списываются и не переводятся.',
        ],
      },
      {
        id: 'accounts',
        heading: '2. Аккаунт',
        bullets: [
          'Чтобы создать аккаунт, вам должно быть не меньше 18 лет.',
          'Указывайте верные данные и храните пароль в тайне. Вы отвечаете за действия в своём аккаунте.',
          'Один человек — один аккаунт. Создавать аккаунт от имени другого лица запрещено.',
        ],
      },
      {
        id: 'founders',
        heading: '3. Правила для авторов проектов',
        bullets: [
          'Все сведения о проекте, бюджете, этапах и рисках должны быть правдивыми и полными.',
          'Загружаемые документы должны быть подлинными и принадлежать вам.',
          'Средства должны расходоваться только согласно опубликованному бюджету.',
          'Регулярно информируйте сторонников новостями и подтверждайте выполнение этапов.',
          'Fundy вправе отклонить проект, запросить изменения или приостановить его без объяснения причин.',
        ],
      },
      {
        id: 'backers',
        heading: '4. Для сторонников',
        bullets: [
          'Поддержка — это доверие проекту, а не покупка. Вознаграждения могут задерживаться или меняться.',
          'В партнёрстве мушарака делятся и прибыль, и убытки; доход не гарантирован.',
          'Информация на Fundy не является финансовой, инвестиционной или религиозной консультацией. Перед решением получите независимую консультацию.',
        ],
      },
      {
        id: 'content',
        heading: '5. Контент и поведение',
        bullets: [
          'Запрещено размещать оскорбительный, ложный, незаконный или рекламный контент.',
          'Уважайте авторские права и персональные данные других людей.',
          'Тексты и изображения остаются вашими; вы разрешаете Fundy показывать их на платформе.',
          'Fundy может скрывать контент, нарушающий правила, и блокировать аккаунты.',
        ],
      },
      {
        id: 'liability',
        heading: '6. Ответственность',
        paragraphs: [
          'Fundy предоставляет платформу «как есть». В пределах, допустимых законом, Fundy не отвечает за неудачу, задержку проектов или действия их авторов.',
        ],
      },
      {
        id: 'changes',
        heading: '7. Изменения и применимое право',
        paragraphs: [
          'Условия могут меняться; о важных изменениях мы сообщим на сайте. К этим условиям применяется законодательство Республики Узбекистан.',
          'Если есть вопросы, напишите нам через страницу контактов.',
        ],
      },
    ],
  },
  en: {
    kicker: 'Terms of Use',
    title: 'Terms of Use',
    intro: 'By using Fundy you agree to these terms. Please read them carefully.',
    draftNote: 'Draft. These terms were prepared for the demo and will be reviewed by a lawyer before a real launch.',
    updated: UPDATED,
    sections: [
      {
        id: 'service',
        heading: '1. The service',
        paragraphs: [
          'Fundy is an online platform that connects project founders with people willing to back them. Fundy does not carry out the projects itself and does not guarantee their outcome.',
          'In the current demo all payments are simulated: no real money is charged or transferred.',
        ],
      },
      {
        id: 'accounts',
        heading: '2. Your account',
        bullets: [
          'You must be at least 18 to create an account.',
          'Give accurate information and keep your password secret. You are responsible for activity in your account.',
          'One person, one account. Creating an account in someone else’s name is not allowed.',
        ],
      },
      {
        id: 'founders',
        heading: '3. Rules for founders',
        bullets: [
          'Everything you state about the project, budget, milestones and risks must be true and complete.',
          'Documents you upload must be genuine and belong to you.',
          'Money may only be used according to the published budget.',
          'Keep backers informed with regular updates and show proof when milestones are done.',
          'Fundy may reject a project, ask for changes or suspend it without giving reasons.',
        ],
      },
      {
        id: 'backers',
        heading: '4. For backers',
        bullets: [
          'Backing is support for a project, not a purchase. Rewards can be delayed or change.',
          'In a Musharakah partnership profits and losses are shared; returns are not guaranteed.',
          'Information on Fundy is not financial, investment or religious advice. Get independent advice before deciding.',
        ],
      },
      {
        id: 'content',
        heading: '5. Content and behaviour',
        bullets: [
          'Abusive, false, illegal or advertising content is not allowed.',
          'Respect other people’s copyright and personal data.',
          'Texts and images you post remain yours; you allow Fundy to show them on the platform.',
          'Fundy may hide content that breaks these rules and block accounts.',
        ],
      },
      {
        id: 'liability',
        heading: '6. Liability',
        paragraphs: [
          'Fundy provides the platform “as is”. To the extent the law allows, Fundy is not liable for projects that fail or are delayed, or for what founders do.',
        ],
      },
      {
        id: 'changes',
        heading: '7. Changes and governing law',
        paragraphs: [
          'These terms may change; we will announce important changes on the site. These terms are governed by the laws of the Republic of Uzbekistan.',
          'Questions? Write to us through the contact page.',
        ],
      },
    ],
  },
};
