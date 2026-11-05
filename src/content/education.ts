import type { Article, Localized } from '@/content/types';

export const education: Localized<Article> = {
  uz: {
    kicker: "Ta'lim",
    title: 'Foizsiz moliyalashtirish qanday ishlaydi',
    intro:
      "Fundy'dagi uch model — xayriya, mukofot va mushoraka — haqida qisqa qo'llanma. Oxirida mushoraka kalkulyatori bor: foyda va zarar qanday taqsimlanishini o'zingiz sinab ko'ring.",
    sections: [
      {
        id: 'riba',
        heading: 'Nima uchun foizsiz',
        paragraphs: [
          "Oddiy kreditda qarz oluvchi biznes muvaffaqiyatli bo'ladimi yoki yo'qmi, oldindan belgilangan foizni to'laydi. Islom moliyasida bunday kafolatlangan foyda (ribo) taqiqlanadi: daromad faqat haqiqiy faoliyat va xavfni baham ko'rishdan kelishi kerak.",
          "Fundy'da hech kim foiz to'lamaydi va olmaydi. Pul xayriya, mahsulot uchun oldindan to'lov yoki haqiqiy foyda va zararni baham ko'radigan hamkorlik sifatida beriladi.",
        ],
      },
      {
        id: 'models',
        heading: 'Uch model',
        bullets: [
          "Xayriya — hech narsa kutmasdan yordam berasiz. Maktablar, sog'liqni saqlash, ekologiya kabi ijtimoiy loyihalar uchun.",
          "Mukofot — loyihani qo'llab-quvvatlab, evaziga mahsulot yoki sovg'a olasiz (masalan, hunarmand buyumi). Bu oldindan buyurtmaga o'xshaydi.",
          "Mushoraka — biznesda hamkorga aylanasiz. Kelishilgan ulushda foyda olasiz va zararni ham sarmoyangizga mutanosib ravishda baham ko'rasiz.",
        ],
      },
      {
        id: 'musharakah',
        heading: "Fundy'da mushoraka bosqichma-bosqich",
        bullets: [
          "Asoschi shartlarni e'lon qiladi: homiylar ulushi (masalan, sof foydaning 25%), minimal sarmoya, to'lov davriyligi va hamkorlik muddati.",
          'Fundy jamoasi loyihani tekshiradi va baholaydi.',
          'Siz sarmoya kiritasiz. Sizning ulushingiz — sarmoyangizning loyiha maqsadiga nisbati.',
          "Mablag' bosqichma-bosqich, bajarilgan ish uchun beriladi.",
          "Biznes muntazam ravishda tekshirilgan natijalar bo'yicha foydani taqsimlaydi. Zarar yili bo'lsa, zarar kapitalga mutanosib ravishda taqsimlanadi.",
          'Muddat oxirida asoschi ulushingizni kelishilgan tartibda qaytarib sotib olishi mumkin.',
        ],
      },
      {
        id: 'mudarabah',
        heading: 'Mushoraka va muzoraba farqi',
        paragraphs: [
          "Mushorakada har ikki tomon kapital kiritadi va biznesni birgalikda yuritishi mumkin. Muzorabada homiylar faqat kapital beradi, asoschi esa mehnati bilan qatnashadi. Har ikkisida foyda kelishilgan nisbatda bo'linadi; muzorabada moliyaviy zararni odatda kapital egasi ko'taradi (agar asoschi beparvolik qilmagan bo'lsa).",
        ],
      },
      {
        id: 'glossary',
        heading: "Qisqa lug'at",
        bullets: [
          'Ribo — kafolatlangan foiz; islom moliyasida taqiqlangan.',
          "Bosqich — loyihaning ma'lum qismi; bajarilgach, mablag'ning bir qismi beriladi.",
          'Baholash — Fundy jamoasining 100 ballik bahosi: biznes reja, jamoa, bozor, moliya va xavflar.',
          'Sof foyda — barcha xarajatlardan keyin qolgan foyda.',
        ],
      },
      {
        id: 'disclaimer',
        heading: 'Muhim eslatma',
        paragraphs: [
          "Bu sahifa umumiy ma'lumot beradi va moliyaviy, investitsion yoki diniy maslahat emas. Fundy shartnomalari haqiqiy ishga tushirishdan oldin shariat bo'yicha maslahat kengashi tomonidan ko'rib chiqiladi. Demo versiyada haqiqiy pul yechilmaydi.",
        ],
      },
    ],
  },
  ru: {
    kicker: 'Обучение',
    title: 'Как работает беспроцентное финансирование',
    intro:
      'Короткий гид по трём моделям Fundy — пожертвованиям, вознаграждениям и мушараке. В конце — калькулятор мушараки: проверьте сами, как делятся прибыль и убытки.',
    sections: [
      {
        id: 'riba',
        heading: 'Почему без процентов',
        paragraphs: [
          'В обычном кредите заёмщик платит заранее установленный процент — независимо от того, успешен бизнес или нет. В исламских финансах такая гарантированная прибыль (риба) запрещена: доход должен идти от реальной деятельности и разделённого риска.',
          'На Fundy никто не платит и не получает проценты. Деньги даются как пожертвование, предоплата за продукт или партнёрство с разделом реальной прибыли и убытков.',
        ],
      },
      {
        id: 'models',
        heading: 'Три модели',
        bullets: [
          'Пожертвование — вы помогаете, ничего не ожидая взамен. Для социальных проектов: школы, здравоохранение, экология.',
          'Вознаграждение — вы поддерживаете проект и получаете продукт или подарок (например, изделие мастера). Похоже на предзаказ.',
          'Мушарака — вы становитесь партнёром бизнеса. Получаете согласованную долю прибыли и делите убытки пропорционально вложениям.',
        ],
      },
      {
        id: 'musharakah',
        heading: 'Мушарака на Fundy по шагам',
        bullets: [
          'Автор публикует условия: долю сторонников (например, 25% чистой прибыли), минимальную сумму, график выплат и срок партнёрства.',
          'Команда Fundy проверяет и оценивает проект.',
          'Вы вкладываете деньги. Ваша доля — отношение ваших вложений к цели проекта.',
          'Средства выдаются по этапам, за выполненную работу.',
          'Бизнес регулярно распределяет прибыль по проверенным результатам. В убыточный год убыток делится пропорционально капиталу.',
          'В конце срока автор может выкупить вашу долю на согласованных условиях.',
        ],
      },
      {
        id: 'mudarabah',
        heading: 'Мушарака и мудараба',
        paragraphs: [
          'В мушараке капитал вносят обе стороны, и вести бизнес они могут вместе. В мударабе сторонники дают только капитал, а автор участвует трудом. В обоих случаях прибыль делится в согласованной пропорции; в мударабе финансовые убытки обычно несёт владелец капитала (если автор не допустил небрежности).',
        ],
      },
      {
        id: 'glossary',
        heading: 'Краткий словарь',
        bullets: [
          'Риба — гарантированный процент; запрещён в исламских финансах.',
          'Этап — часть проекта; после выполнения выдаётся часть средств.',
          'Оценка — 100-балльная оценка команды Fundy: бизнес-план, команда, рынок, финансы и риски.',
          'Чистая прибыль — прибыль после всех расходов.',
        ],
      },
      {
        id: 'disclaimer',
        heading: 'Важно',
        paragraphs: [
          'Эта страница носит общий характер и не является финансовой, инвестиционной или религиозной консультацией. Договоры Fundy будут проверены шариатским советом до реального запуска. В демо-версии настоящие деньги не списываются.',
        ],
      },
    ],
  },
  en: {
    kicker: 'Learn',
    title: 'How interest-free funding works',
    intro:
      "A short guide to Fundy's three models — donations, rewards and Musharakah. At the end there's a Musharakah calculator: try for yourself how profit and loss are shared.",
    sections: [
      {
        id: 'riba',
        heading: 'Why no interest',
        paragraphs: [
          'With a normal loan the borrower pays a fixed interest rate whether the business succeeds or not. Islamic finance forbids such guaranteed gain (riba): returns must come from real activity and shared risk.',
          'On Fundy nobody pays or earns interest. Money is given as a donation, as an advance payment for a product, or as a partnership that shares real profits and losses.',
        ],
      },
      {
        id: 'models',
        heading: 'Three models',
        bullets: [
          'Donation — you help without expecting anything back. For social projects such as schools, healthcare and the environment.',
          'Reward — you back a project and receive a product or gift in return (for example an artisan piece). Much like a pre-order.',
          'Musharakah — you become a partner in a business. You receive an agreed share of profits and share losses in proportion to what you put in.',
        ],
      },
      {
        id: 'musharakah',
        heading: 'Musharakah on Fundy, step by step',
        bullets: [
          "The founder publishes the terms: the backers' share (for example 25% of net profit), the minimum amount, how often profit is paid and how long the partnership lasts.",
          "Fundy's team checks and evaluates the project.",
          "You invest. Your share is your investment divided by the project's goal.",
          'Money is released in stages, for work delivered.',
          'The business shares profit regularly, based on checked results. In a loss year the loss is shared in proportion to capital.',
          'At the end of the term the founder may buy back your share on agreed terms.',
        ],
      },
      {
        id: 'mudarabah',
        heading: 'Musharakah vs Mudarabah',
        paragraphs: [
          'In Musharakah both sides put in capital and may run the business together. In Mudarabah backers provide only capital and the founder contributes work. In both, profit is split in an agreed ratio; in Mudarabah financial losses are usually borne by the capital provider (unless the founder was negligent).',
        ],
      },
      {
        id: 'glossary',
        heading: 'Short glossary',
        bullets: [
          'Riba — guaranteed interest; forbidden in Islamic finance.',
          'Milestone — a part of the project; when done, part of the money is released.',
          "Evaluation — Fundy's 100-point score: business plan, team, market, financials and risk.",
          'Net profit — profit left after all costs.',
        ],
      },
      {
        id: 'disclaimer',
        heading: 'Important',
        paragraphs: [
          "This page is general information, not financial, investment or religious advice. Fundy's contracts will be reviewed by a Shariah advisory board before a real launch. In the demo no real money is charged.",
        ],
      },
    ],
  },
};
