import type { Article, Localized } from '@/content/types';

export const about: Localized<Article> = {
  uz: {
    kicker: 'Biz haqimizda',
    title: 'Nega biz Fundyʼni qurmoqdamiz',
    intro:
      'Fundy — Oʻzbekiston uchun foizsiz kraudfanding platformasi. Biz gʻoyasi bor odamlarni ularni qoʻllab-quvvatlashga tayyor hamjamiyat bilan bogʻlaymiz. Qarzsiz va foizsiz.',
    sections: [
      {
        id: 'why',
        heading: 'Nima uchun Fundy',
        paragraphs: [
          'Koʻplab tadbirkorlar, hunarmandlar va ijtimoiy tashabbuskorlar uchun bank krediti yoʻq yoki juda qimmat. Boshqalar esa foizli qarzni oʻz eʼtiqodiga zid deb biladi. Natijada yaxshi gʻoyalar amalga oshmay qoladi.',
          'Shu bilan birga, odamlar oʻz shahri, viloyati va mamlakatidagi loyihalarni qoʻllab-quvvatlashni xohlaydi. Faqat pul qayerga ketishini aniq bilishi kerak.',
        ],
      },
      {
        id: 'how',
        heading: 'Qanday ishlaymiz',
        bullets: [
          'Uch xil model: xayriya, mukofotli loyihalar va mushoraka (foyda va xavfni baham koʻrish).',
          'Har bir loyiha byudjeti soʻmma-soʻm eʼlon qilinadi.',
          'Loyihalar eʼlon qilinishidan oldin tekshiriladi va 100 ballik tizimda baholanadi.',
          'Mablagʻ bosqichma-bosqich, bajarilgan ish uchun beriladi.',
        ],
      },
      {
        id: 'for-uzbekistan',
        heading: 'Oʻzbekiston uchun yaratilgan',
        paragraphs: [
          'Fundy oʻzbek, rus va ingliz tillarida ishlaydi, barcha summalar soʻmda. Loyihalar 14 ta hudud boʻyicha: Qoraqalpogʻistondan Fargʻona vodiysigacha.',
        ],
      },
      {
        id: 'status',
        heading: 'Hozirgi holat',
        paragraphs: [
          'Fundy hozir demo versiyada. Barcha toʻlovlar simulyatsiya, haqiqiy pul yechilmaydi. Haqiqiy toʻlovlar faqat zarur huquqiy ruxsatlar, hamkor banklar va shariat boʻyicha maslahat kengashi tayyor boʻlgandan keyin ishga tushiriladi.',
          'Platforma qanday ishlashini koʻrsatish va fikr-mulohaza toʻplash uchun ochiq. Fikringiz boʻlsa, aloqa sahifasi orqali yozing.',
        ],
      },
    ],
  },
  ru: {
    kicker: 'О нас',
    title: 'Почему мы делаем Fundy',
    intro:
      'Fundy — беспроцентная краудфандинговая платформа для Узбекистана. Мы соединяем людей с идеями и сообщество, готовое их поддержать. Без долгов и без процентов.',
    sections: [
      {
        id: 'why',
        heading: 'Зачем нужен Fundy',
        paragraphs: [
          'Многим предпринимателям, ремесленникам и социальным активистам банковский кредит недоступен или слишком дорог. Другие считают процентный долг несовместимым со своими убеждениями. В итоге хорошие идеи так и остаются идеями.',
          'При этом люди хотят поддерживать проекты в своём городе, регионе и стране. Им просто нужно точно знать, куда идут деньги.',
        ],
      },
      {
        id: 'how',
        heading: 'Как мы работаем',
        bullets: [
          'Три модели: пожертвования, проекты с вознаграждением и мушарака (раздел прибыли и риска).',
          'Бюджет каждого проекта публикуется до последнего сума.',
          'Проекты проверяются до публикации и получают оценку по 100-балльной шкале.',
          'Деньги выдаются по этапам, за выполненную работу.',
        ],
      },
      {
        id: 'for-uzbekistan',
        heading: 'Сделано для Узбекистана',
        paragraphs: [
          'Fundy работает на узбекском, русском и английском языках, все суммы — в сумах. Проекты из всех 14 регионов — от Каракалпакстана до Ферганской долины.',
        ],
      },
      {
        id: 'status',
        heading: 'Текущий статус',
        paragraphs: [
          'Сейчас Fundy работает в демо-режиме. Все платежи симулируются, настоящие деньги не списываются. Реальные платежи появятся только после получения необходимых разрешений, подключения банков-партнёров и шариатского совета.',
          'Платформа открыта, чтобы показать, как всё работает, и собрать отзывы. Пишите нам через страницу контактов.',
        ],
      },
    ],
  },
  en: {
    kicker: 'About us',
    title: "Why we're building Fundy",
    intro:
      'Fundy is an interest-free crowdfunding platform for Uzbekistan. We connect people with ideas to a community ready to back them, without debt and without interest.',
    sections: [
      {
        id: 'why',
        heading: 'Why Fundy',
        paragraphs: [
          'For many entrepreneurs, artisans and community builders, a bank loan is out of reach or too expensive. Others see interest-based debt as incompatible with their beliefs. So good ideas stay ideas.',
          'At the same time, people want to support projects in their own city, region and country. They just need to know exactly where the money goes.',
        ],
      },
      {
        id: 'how',
        heading: 'How we work',
        bullets: [
          'Three models: donations, reward projects and Musharakah (sharing profit and risk).',
          "Every project's budget is published down to the last so'm.",
          'Projects are checked before they go live and scored out of 100.',
          'Money is released in stages, for work actually delivered.',
        ],
      },
      {
        id: 'for-uzbekistan',
        heading: 'Built for Uzbekistan',
        paragraphs: [
          "Fundy works in Uzbek, Russian and English, and every amount is in so'm. Projects come from all 14 regions, from Karakalpakstan to the Fergana Valley.",
        ],
      },
      {
        id: 'status',
        heading: 'Where we are now',
        paragraphs: [
          'Fundy is currently a demo. All payments are simulated. No real money is charged. Real payments will only start once the required licences, partner banks and a Shariah advisory board are in place.',
          'The platform is open so people can see how it works and share feedback. Write to us through the contact page.',
        ],
      },
    ],
  },
};
