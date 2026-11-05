/**
 * Uzbek text for the 8 demo projects (the site's main language).
 * The English originals stay in mockProjects.ts and become the English translation.
 *
 * Lists follow the same order as in mockProjects.ts (budget lines, milestones,
 * rewards, updates, comments), because the database rows are matched by position.
 * Names here are the display names; database ids still come from the English
 * names, so renaming never creates new people.
 */

export type UzProject = {
  title: string;
  tagline: string;
  description: string;
  story: string;
  risks: string;
  location: string;
  imageUrl: string;
  founder: { name: string; role: string; organization: string; location: string; bio: string; registration: string };
  budget: [category: string, description: string][];
  milestones: [title: string, description: string, when: string][];
  rewards?: { title: string; description: string; items: string[]; delivery: string }[];
  /** Profit forecast in so'm (never an annual % rate — Musharakah is not interest). */
  projected?: string;
  evaluation: { summary: string; strengths: string[]; risks: string[] };
  updates: [title: string, body: string][];
  comments: { author: string; city: string; body: string; reply?: string }[];
};

const month = (n: number) => `${n}-oy`;

export const UZ_PROJECTS: Record<string, UzProject> = {
  'agrosmart-fergana-greenhouse': {
    title: "AgroSmart Farg'ona: quyosh energiyali gidroponik issiqxonalar",
    tagline:
      "Quva tumanida suvni 78% kam sarflaydigan issiqxona — Farg'ona va Toshkent bozorlari uchun pomidor va qalampir.",
    description:
      "Quva tumanida tomga o'rnatilgan quyosh panellari bilan ishlaydigan gidroponik issiqxonalar quramiz. Yer osti suvi 78% kam sarflanadi, pomidor va bolgar qalampiri hosili esa ikki baravar oshadi.",
    story: `Farg'ona vodiysida suv yildan-yilga kamaymoqda, ariq usulida sug'orish esa suvning katta qismini isrof qiladi. Biz Quvadagi tajriba issiqxonamizda ikki mavsum yopiq tsiklli gidroponikani sinab ko'rdik: kimyoviy chiqindi yo'q, suv sarfi to'rt barobar kam.

Endi har biri 1 200 kv. metrlik uchta tijorat issiqxonasini qurmoqchimiz. Mablag' po'lat karkas, polikarbonat, quyosh panellari va sug'orish uskunalariga ketadi.

Bu mushoraka loyihasi: sarmoyadorlar 5 yil davomida tekshirilgan sof foydaning 28 foizini har chorakda oladi. Zarar bo'lsa, u ham kiritilgan ulushga qarab taqsimlanadi. Muddat oxirida kooperativ a'zolari ulushni sotib olishi mumkin.`,
    risks:
      "Farg'onada qishda harorat ba'zan -10°C gacha tushadi. Shuning uchun ikki qavatli issiqlik izolyatsiyasi va pellet isitgichlar o'rnatamiz. Yo'lda hosil buzilmasligi uchun vakuum qadoqlashdan foydalanamiz.",
    location: "Quva, Farg'ona viloyati",
    imageUrl: '/images/fergana-agro.jpg',
    founder: {
      name: 'Azizbek Rahimov',
      role: 'Asoschi, agronom',
      organization: '"AgroSmart Farg\'ona" MChJ',
      location: "Farg'ona",
      bio: "Toshkent davlat agrar universiteti bitiruvchisi. 11 yildan beri O'zbekiston va Turkiyada issiqxona tizimlarini quradi.",
      registration: "MChJ guvohnomasi № 309812490 (Farg'ona shahri)",
    },
    budget: [
      ['Issiqxona karkasi va qoplamasi', "Ruxlangan po'lat arkalar va UV-chidamli polikarbonat"],
      ['Quyosh panellari va akkumulyator', '15 kVt quyosh panellari, gibrid invertor, batareyalar'],
      ["Tomchilatib sug'orish va o'g'itlash", 'Avtomatik dozatorlar, nasoslar, EC/pH datchiklari'],
      ["Ko'chat va substrat", "Sertifikatlangan GMOsiz urug'lar va mineral paxta bloklari"],
      ['Ish haqi va transport', 'Mahalliy ishchilar, montaj nazorati, tashish'],
    ],
    milestones: [
      [
        'Yer tekislash va poydevor',
        'Quvadagi yer uchastkasida beton poydevor va drenaj ariqlarini tayyorlash.',
        month(1),
      ],
      [
        'Karkas va quyosh panellari',
        "Po'lat karkasni o'rnatish, polikarbonat bilan qoplash, panellarni ulash.",
        month(2),
      ],
      [
        "Sug'orish tizimi va birinchi ekin",
        "Tomchilatib sug'orishni o'rnatish, o'g'it sinovi, birinchi ko'chatlarni ekish.",
        month(3),
      ],
      [
        'Birinchi hosil va yetkazib berish',
        "Toshkentdagi hamkor do'konlarga 12 tonna oliy navli hosil topshirish.",
        month(5),
      ],
    ],
    projected: "2,5 mln so'm ulushga yiliga ~540–650 ming so'm",
    evaluation: {
      summary:
        "Farg'ona va Toshkent ulgurji bozorlari bilan tuzilgan yetkazib berish shartnomalari tasdiqlandi. Yer ijarasi hujjatlari va kredit tarixi tekshirildi — muammo yo'q.",
      strengths: [
        "Asoschining Quvada qurgan oldingi issiqxonalari joyida ko'rildi",
        'Suv tejash har oylik kommunal xarajatni ~70% kamaytiradi',
        'Toshkentdagi 2 ta distribyutor bilan oldindan kelishuv bor',
      ],
      risks: [
        "Qishki sovuqda qo'shimcha isitish zaxirasi kerak",
        "Sovutgichli transport yo'lda ushlanib qolsa, hosil buzilishi mumkin",
      ],
    },
    updates: [
      [
        'Poydevor tayyor, quyosh panellari yetib keldi',
        "Quvadagi poydevor to'liq qotdi. Kecha texnik guruhimiz quyosh panellari va invertorlarni tekshirdi — barcha elektr sinovlaridan o'tdi.",
      ],
    ],
    comments: [
      {
        author: 'Farrux Temirov',
        city: 'Toshkent',
        body: "Poydevor ishlari zo'r ketyapti. Choraklik foyda qachon to'lanadi?",
        reply:
          "Assalomu alaykum, Farrux! Har chorak yopilgandan keyin 15 kun ichida, tekshirilgan savdo hisoboti bilan birga to'lanadi.",
      },
    ],
  },

  'silkroad-samarkand-ikat-weavers': {
    title: 'Samarqand atlas va kulolchilik ustaxonasi',
    tagline: "24 nafar usta to'quvchi va kulolga zamonaviy uskunalar, 18 nafar yosh shogirdga ish o'rgatamiz.",
    description:
      "Samarqanddagi ustalar kooperativi tabiiy bo'yoqli ipak abrbandi matolar va an'anaviy kobalt sirli sopol buyumlar ishlab chiqarishni kengaytiradi hamda 18 nafar yosh shogird tayyorlaydi.",
    story: `Qo'lda to'qilgan ipak atlas va sirli sopol — Buyuk ipak yo'lidan qolgan meros. Lekin ustalarda ko'pincha xom ipakni ulgurji sotib olish, tejamkor elektr pech olish va buyumni yaxshi qadoqlash uchun pul yetmaydi.

Kooperativimiz 24 nafar usta oilasini bitta ustaxonaga birlashtirdi. Marg'ilon pillasini to'g'ridan-to'g'ri olamiz va tutunsiz elektr pechga o'tamiz — eski sir retseptlari saqlanib qoladi.

Homiylar raqamlangan buyumlar oladi: qo'lda to'qilgan ipak ro'mol, usta muhri bosilgan sopol to'plam va Samarqanddagi ustaxonamizda master-klass.`,
    risks:
      "Bir metr ipakni qo'lda to'qish 4–6 soat oladi. Mukofotlar o'z vaqtida yetishi uchun dastgohlarni 8 nafar katta usta o'rtasida taqsimladik.",
    location: 'Samarqand',
    imageUrl: '/images/samarkand-craft.jpg',
    founder: {
      name: 'Dilnoza Karimova',
      role: "Kooperativ rahbari, usta to'quvchi",
      organization: 'Samarqand hunarmandlar uyushmasi',
      location: 'Samarqand',
      bio: "19 yillik tajribaga ega usta to'quvchi. O'zbek amaliy san'atini YUNESKO ko'rgazmalarida namoyish etgan.",
      registration: 'YaTT guvohnomasi № 419203814 (Samarqand)',
    },
    budget: [
      ["Marg'ilon xom ipagi va tabiiy bo'yoqlar", "Ishlov berilmagan pilla ipagi, o'simlik va mineral bo'yoqlar"],
      ['Elektr kulolchilik pechi', '1200°C gacha qiziydigan, raqamli boshqaruvli pech'],
      ["Shogirdlar stipendiyasi va o'quv materiallari", '18 nafar shogirdga 6 oy davomida oylik yordam'],
      ["Qadoqlash va sovg'a qutilari", "Yog'och sovg'a qutilari va pochta qutilari"],
      ['Suratga olish va naqshlar arxivi', "An'anaviy naqsh nomlari va kelib chiqishini hujjatlashtirish"],
    ],
    milestones: [
      [
        "Ipak xarid qilish va bo'yoq tayyorlash",
        "140 kg xom ipak olish; yong'oq, ruyan va anor po'stidan bo'yoq tayyorlash.",
        month(1),
      ],
      ["Pech o'rnatish va sinov", "Elektr pechni ustaxonaga ulash, kobalt sirni sinab ko'rish.", month(2)],
      [
        "Mukofotlarni to'qish va sifat nazorati",
        "Barcha ro'mollarni to'qib bo'lish, sopol laganlarga muhr bosish.",
        month(3),
      ],
      [
        'Qadoqlash va yetkazib berish',
        "Sug'urtalangan posilkalarni O'zbekiston bo'ylab va chet elga jo'natish.",
        month(4),
      ],
    ],
    rewards: [
      {
        title: 'Samarqand kobalt piyolasi va likopchasi',
        description: "Qo'lda yasalgan, an'anaviy Samarqand naqshli sopol piyola. Usta imzosi bilan.",
        items: ['Sopol piyola', 'Likopcha', 'Kelib chiqish sertifikati'],
        delivery: '2026-yil dekabr',
      },
      {
        title: "Qo'lda to'qilgan ipak atlas ro'mol (180×50 sm)",
        description: "Tabiiy bo'yoqlar bilan, yog'och dastgohda to'qilgan \"bodom\" naqshli sof ipak ro'mol.",
        items: ["Sof ipak ro'mol", "Yog'och sovg'a qutisi", "Samarqand to'quvchilari haqida kitobcha"],
        delivery: '2027-yil yanvar',
      },
      {
        title: "Master-klass va 7 qismli sopol to'plam",
        description:
          "Osh uchun katta lagan va 6 ta piyola, hamda Samarqanddagi ustaxonada yarim kunlik shaxsiy mashg'ulot.",
        items: ['Katta lagan (38 sm)', '6 ta piyola', '4 soatlik master-klass', 'Uyushmada umrbod 15% chegirma'],
        delivery: '2027-yil yanvar',
      },
    ],
    evaluation: {
      summary:
        'Ustalarning ishlab chiqarish hajmi tasdiqlangan. Mukofotlar tannarxi aniq hisoblangan, loyiha hunarmandchilikni rivojlantirish dasturiga mos.',
      strengths: [
        "Asoschi YUNESKO ko'rgazmalarida qatnashgan, tan olingan usta",
        'Mahalliy xaridorlar va sayyohlardan barqaror talab bor',
        "Marg'ilon ipak ishlab chiqaruvchilaridan to'g'ridan-to'g'ri xarid — vositachi ustamasi yo'q",
      ],
      risks: [
        "Tabiiy bo'yoq rangini saqlash uchun xona harorati nazorat qilinishi kerak",
        'Sopolni tashish uchun mustahkam qadoq kerak',
      ],
    },
    updates: [
      [
        'Elektr pechda birinchi sinov — birorta nuqsonsiz',
        'Kecha kulol ustamiz Mahmud aka 1 180°C dagi birinchi kuydirishdan keyin pech eshigini ochdi. Laganlardagi kobalt rang juda yorqin chiqdi.',
      ],
    ],
    comments: [
      {
        author: 'Gulnora Aliyeva',
        city: 'Buxoro',
        body: "Ustalarimizni qo'llab-quvvatlaganimdan xursandman! Ro'mol uchun homiy bo'lsak, ustaxonaga borsak bo'ladimi?",
        reply:
          'Albatta, Gulnora opa! Samarqandga kelganingizda barcha homiylarni choy va shirinlik bilan kutib olamiz.',
      },
    ],
  },

  'tashkent-stem-robotics-lab': {
    title: 'Chilonzorda bolalar uchun bepul robototexnika laboratoriyasi',
    tagline:
      "Toshkent davlat maktablarining 600 dan ortiq o'quvchisiga robototexnika va dasturlashni bepul o'rgatamiz.",
    description:
      "Chilonzor tumanida ochiq laboratoriya: kam ta'minlangan oilalar farzandlari uchun robototexnika, 3D bosma va dasturlash bo'yicha bepul mashg'ulotlar.",
    story: `Toshkentda minglab maktab o'quvchilari muhandis bo'lishni orzu qiladi. Ammo kavsharlash stansiyasi, osillograf va 3D printer bor to'garaklar ko'p oilalar uchun qimmat.

Chilonzordagi 320 kv. metrlik binoni laboratoriyaga aylantirmoqdamiz. Hokimiyat binoni bepul berdi. Mashg'ulotlar, uskunalar va murabbiylar — hammasi tekin.

Yig'ilgan pulning hammasi uskunaga ketadi: 20 ta Arduino/ESP32 ish joyi, 6 ta 3D printer, himoya vositalari va o'zbek hamda rus tilidagi o'quv qo'llanmalar.`,
    risks:
      "Bolalar bilan ishlaganda uskunalar tez eskiradi. Byudjetning 15 foizi ehtiyot qismlarga ajratilgan. Kavsharlashdan oldin har bir o'quvchi xavfsizlik bo'yicha yo'riqnomadan o'tadi.",
    location: 'Chilonzor, Toshkent',
    imageUrl: '/images/tashkent-robotics.jpg',
    founder: {
      name: 'Jasur Bekmurodov',
      role: "Asoschi, robototexnika o'qituvchisi",
      organization: '"Kelajak muhandislari" NNT',
      location: 'Toshkent',
      bio: 'Toshkentdagi Inha universiteti bitiruvchisi. 7 yildan beri yoshlar uchun muhandislik olimpiadalari tashkil qiladi.',
      registration: 'NNT reyestri № 1948203 (Adliya vazirligi)',
    },
    budget: [
      [
        "20 ta ish joyi va mikrokontroller to'plamlari",
        'ESP32 platalari, datchiklar, multimetrlar, kavsharlash stansiyalari',
      ],
      ['3D printerlar', '6 ta 3D printer va 100 kg biologik parchalanadigan PLA ip'],
      ["O'zbek tilidagi o'quv dasturi", "Rasmli qo'llanmalar va onlayn topshiriqlar"],
      ['Xavfsizlik va mebel', "Antistatik stollar, tutun so'rgich, himoya ko'zoynaklari"],
      ["Yillik musobaqa jamg'armasi", "Toshkent yoshlari o'rtasida robot-rover musobaqasi uchun materiallar"],
    ],
    milestones: [
      [
        "Chilonzordagi xonani ta'mirlash",
        "Alohida elektr tarmog'i, kuchlanish himoyasi va antistatik pol yotqizish.",
        month(1),
      ],
      [
        "Uskunalarni olish va o'rnatish",
        "20 ta kavsharlash stansiyasi, 3D printerlarni yig'ish va ESP32 to'plamlarini sinash.",
        month(2),
      ],
      [
        "Birinchi guruh — 150 o'quvchi",
        "Qabulni ochish; o'rinlarning bir qismi davlat maktabi o'quvchilariga.",
        month(3),
      ],
      [
        "Ochiq kun va ko'rgazma",
        "O'quvchilar yasagan issiqxona datchiklari va mini-roverlarni ota-onalarga ko'rsatish.",
        month(5),
      ],
    ],
    evaluation: {
      summary:
        "Ta'limga ta'siri katta. NNT maqomi tekshirildi, hokimiyat bilan bepul bino bo'yicha shartnoma tasdiqlandi.",
      strengths: [
        "Inha va Turin universitetlari bitiruvchilaridan iborat ko'ngilli jamoa",
        "To'lov yo'qligi sababli har qanday oila farzandi qatnasha oladi",
        "Uskunalar 5 yildan ortiq, ko'p guruhlar uchun ishlatiladi",
      ],
      risks: ["Kavsharlash uchlari, tishli g'ildiraklar kabi sarf materiallarini doim to'ldirish kerak"],
    },
    updates: [
      [
        'Antistatik pol yotqizildi, 20 ta stol keldi',
        "Sizning yordamingiz bilan Chilonzordagi xona haqiqiy laboratoriyaga aylandi! ESP32 va Arduino platalarining birinchi partiyasi bojxonadan kechikmasdan o'tdi.",
      ],
    ],
    comments: [
      {
        author: 'Shahnoza Yusupova',
        city: 'Toshkent',
        body: "12 yoshli qizim mashg'ulotlar boshlanishini intiqlik bilan kutyapti! Qo'llab-quvvatlaganimdan faxrlanaman.",
      },
    ],
  },

  'aral-oasis-reforestation-saxaul': {
    title: 'Orol qurigan tubiga 50 000 saksovul',
    tagline: "Mo'ynoqda tuzli changni to'xtatadigan saksovul to'sig'ini ekamiz: 13 000 so'm — bitta ko'chat.",
    description:
      "Mo'ynoq tumanida chuqur ildizli qora saksovul ekib, qumni mustahkamlaymiz va tuzli chang bo'ronlarini kamaytiramiz.",
    story: `Orol dengizi qurib, o'rnida Orolqum cho'li paydo bo'ldi. Har yili u yerdan havoga 75 million tonnadan ortiq tuz va chang ko'tariladi. Qora saksovulning ildizi 12 metr chuqurlikka boradi — qumni ushlab, namlikni saqlaydi.

Qoraqalpoq davlat universiteti olimlari bilan birga GPS yordamida egat ochib ekish usulini ishlab chiqdik. Og'ir sharoitda ham ko'chatlarning 82 foizi tutib ketadi.

Har 13 000 so'm bitta sertifikatlangan ko'chatni ekish va ikki yil parvarishlashga yetadi. Homiylar o'z uchastkasining GPS koordinatalari va har yili sun'iy yo'ldosh orqali o'simlik qoplami hisobotini oladi.`,
    risks:
      "Erta bahordagi bo'ronlar yangi ko'chatlarni qum bilan ko'mib yuborishi mumkin. Shuning uchun ko'chatlarni tuzli shamoldan to'sadigan pog'onali kichik ariqlarga ekamiz.",
    location: "Mo'ynoq, Qoraqalpog'iston",
    imageUrl: '/images/covers/aral-saxaul.svg',
    founder: {
      name: 'Temur Dauletov',
      role: 'Ekolog, loyiha rahbari',
      organization: '"Orolni yashillashtirish" tashabbusi',
      location: 'Nukus',
      bio: "24 yildan beri Qoraqalpog'iston va Ustyurtda cho'l ekologiyasi va tuproqni tiklash bilan shug'ullanadi.",
      registration: 'Ilmiy-tadqiqot markazi № 049281',
    },
    budget: [
      ["50 000 ta sertifikatlangan saksovul ko'chati", "Qo'ng'irotdagi cho'l ko'chatxonasida yetishtirilgan"],
      ["Traktor yoqilg'isi va egat ochish", "Qumda ekish texnikasi uchun yoqilg'i va ta'mirlash"],
      ['Mahalliy ekish brigadalari', "Mo'ynoqning 30 nafar aholisiga mavsumiy ish haqi"],
      ["Sun'iy yo'ldosh va dron monitoringi", 'Dron parvozlari va Sentinel-2 suratlari tahlili'],
    ],
    milestones: [
      ["Ko'chatlarni chiniqtirish", "Qo'ng'irot ko'chatxonasida 50 000 ta ikki yillik ko'chatni saralash.", month(1)],
      ['Birinchi ekish — 25 000 daraxt', 'Janubiy qismdagi 4B uchastkasiga ekish.', month(2)],
      ['Ikkinchi ekish — 25 000 daraxt', "Shimoliy himoya chizig'ini ekib bo'lish.", month(3)],
      [
        'Bahorgi sanoq va ochiq hisobot',
        "Tutgan daraxtlar xaritasini va homiylar uchun GPS sahifani e'lon qilish.",
        month(6),
      ],
    ],
    evaluation: {
      summary:
        "Ilmiy asosi mustahkam, bir daraxt narxi ochiq hisoblangan. Viloyat o'rmon xo'jaligi qo'llab-quvvatlaydi.",
      strengths: [
        '20 yilda sinalgan, 82% tutish natijasini beradigan usul',
        "Mo'ynoq aholisi uchun ish o'rinlari",
        "Sun'iy yo'ldosh orqali ochiq tekshiruv",
      ],
      risks: ["Erta bahordagi issiq kunlarda namlik saqlovchi gel kerak bo'ladi"],
    },
    updates: [
      [
        "4B uchastkasiga 25 000 ko'chat ekildi!",
        "Jamoamiz sovuq cho'l shamoliga qaramay janubiy uchastkani muddatidan oldin ekib bo'ldi. Oktabr yomg'irlaridan keyin tuproq namligi aynan kerakli darajada.",
      ],
    ],
    comments: [
      {
        author: 'Otabek Mirzoyev',
        city: 'Navoiy',
        body: "Orol — hammamizning mas'uliyatimiz. Temur aka, umringizni shu ishga bag'ishlaganingiz uchun rahmat.",
      },
    ],
  },

  'zarafshan-solar-cold-storage': {
    title: 'Zarafshon: quyosh energiyasida ishlaydigan meva omborlari',
    tagline: "Navoiy va Buxoro bog'dorlari uchun 150 tonnalik sovutgichli omborlar — elektr tarmog'iga bog'liq emas.",
    description:
      "Kichik fermerlar hosilni mavsumda arzonga sotib yubormasligi uchun bog'lar yonida quyosh energiyali sovutgich omborlar quramiz. To'lov — har bir yashik uchun.",
    story: `Uzum, anor va o'rik yetishtiramiz, lekin kichik oilaviy xo'jaliklar hosilning 30 foizigacha qismini yo'qotadi. Saqlash joyi yo'qligi uchun terim paytida eng past narxda sotishga majbur bo'ladi.

Zarafshon vodiysida bog'lar yonida 150 tonnalik modulli sovutgich omborlar quramiz. Ular quyosh panellari va muzli issiqlik akkumulyatorida ishlaydi: elektr o'chsa ham ichkarida doim 0–4°C.

Bu mushoraka loyihasi: sarmoyadorlar ombor egalaridan biriga aylanadi va yashik saqlash hamda saralash xizmatlaridan tushgan tekshirilgan foydaning 26 foizini yiliga ikki marta oladi.`,
    risks:
      "Uskunani chetdan olib kelish muddati o'zgarishi mumkin. Shuning uchun barcha sovutgich uskunalarini Toshkentdagi rasmiy distribyutorlar orqali, ishlab chiqaruvchi kafolati bilan oldik.",
    location: 'Karmana, Navoiy viloyati',
    imageUrl: '/images/covers/zarafshan-cold.svg',
    founder: {
      name: 'Bobur Alimov',
      role: 'Boshqaruvchi hamkor',
      organization: '"Zarafshon Green Tech" MChJ',
      location: 'Navoiy',
      bio: 'Qayta tiklanuvchi energiya muhandisi. 14 yildan beri yirik quyosh elektr stansiyalari va sanoat sovutgichlari loyihalarida ishlaydi.',
      registration: 'MChJ guvohnomasi № 308194821 (Navoiy erkin iqtisodiy zonasi)',
    },
    budget: [
      ['Izolyatsiyalangan sovutgich kamera', 'PIR sendvich-panellar, germetik eshiklar, beton maydon'],
      [
        'Quyosh panellari (45 kVt) va muzli akkumulyator',
        'Ikki tomonlama quyosh modullari va issiqlik akkumulyatorlari',
      ],
      ['Sanoat kompressorlari', "Ekologik toza R290 sovutkichli, tezligi o'zgaruvchan agregatlar"],
      ['Saralash tarozilari va namlik datchiklari', 'Avtomatik tarozilar, simsiz harorat datchiklari'],
      ["Ruxsatnomalar va o'rnatish", "Elektr tarmog'iga ulanish ruxsati va poydevor ekspertizasi"],
    ],
    milestones: [
      [
        'Yer ishlari va beton maydon',
        'Navoiydagi 1 000 kv. metrlik uchastkani tekislash, armaturali beton quyish.',
        month(1),
      ],
      [
        'Kamera va quyosh panellari',
        "Izolyatsiyalangan devorlarni yig'ish, 45 kVt panellar uchun tayanchlar o'rnatish.",
        month(2),
      ],
      [
        'Kompressorlarni ishga tushirish',
        "Haroratni -1°C gacha tushirish va elektr o'chganda 36 soat sovuq saqlanishini sinash.",
        month(3),
      ],
      ['Fermerlardan birinchi hosil', "150 tonnalik omborni Navoiy uzumi va anori bilan to'ldirish.", month(4)],
    ],
    projected: "5 mln so'm ulushga yiliga ~1,1–1,4 mln so'm",
    evaluation: {
      summary:
        "Navoiy va Buxoroda hosildan keyingi saqlash joyi yetishmasligi tasdiqlangan, daromad har yili takrorlanadi. Kompaniya Navoiy erkin iqtisodiy zonasida to'g'ri ro'yxatdan o'tgan.",
      strengths: [
        "Muzli akkumulyator tufayli elektr to'lovlari deyarli yo'q",
        'Karmana tumanidagi 18 ta uzumzor egasi bilan niyat bayonnomasi imzolangan',
        "Mablag' ko'chmas mulk va uskuna ko'rinishida saqlanadi",
      ],
      risks: ["Yozgi terim va qishki ta'mirlash oylari orasida daromad o'zgarib turadi"],
    },
    updates: [
      [
        'Karmanada sovutgich kamera devorlari tayyor',
        "150 mm qalinlikdagi kamera devorlari germetik yopildi. Keyingi hafta tomga 45 kVt quyosh panellari o'rnatiladi.",
      ],
    ],
    comments: [
      {
        author: 'Nodirbek Yusupov',
        city: 'Toshkent',
        body: "15 mln so'm (demo) bilan qo'shildim. Toza texnologiya fermerlarning haqiqiy muammosini hal qilayotgani yoqdi.",
      },
    ],
  },

  'chust-master-cutlery-works': {
    title: "Chust pichog'i: qo'lda toblangan damask po'lat",
    tagline: "Chust pichoqchilik an'anasini damask po'lat bilan boyitamiz — oshxona va kolleksiya uchun.",
    description:
      "Namangan viloyati Chust shahridagi 12 nafar usta pichoqchiga gidravlik bolg'a va jilolash uskunalari olib beramiz.",
    story: `Chust pichog'i jez naqshi va shox dastasi bilan butun dunyoga mashhur. Asrlar davomida ular qo'lda, bolg'a bilan toblanib keladi.

Bugungi oshxonada raqobatlashish uchun ustalarimiz an'anaviy Chust dastasini ko'p qatlamli, yuqori uglerodli damask po'lat bilan birlashtirmoqda.

Homiylar har biri raqamlangan, qo'lda yasalgan pichoq oladi: oshxona pichog'i, osh uchun an'anaviy pichoq va Chust ustalari tikkan charm g'ilof.`,
    risks:
      "Har bir pichoq qo'lda yasaladi, shuning uchun damask naqshi va yog'och tolasi biroz farq qiladi — bu haqiqiy qo'l mehnatining belgisi.",
    location: 'Chust, Namangan viloyati',
    imageUrl: '/images/covers/chust-knives.svg',
    founder: {
      name: "Mansur Po'latov",
      role: 'Usta pichoqchi, uyushma oqsoqoli',
      organization: 'Chust pichoqchilar uyushmasi',
      location: 'Chust, Namangan viloyati',
      bio: "Beshinchi avlod Chust pichoqchisi. Ishlari O'zbekiston davlat tarix muzeyida saqlanadi.",
      registration: 'YaTT guvohnomasi № 920194812 (Namangan)',
    },
    budget: [
      ["Damask po'lat zagotovkalari", "67 qatlamli po'lat va jez zagotovkalar"],
      ['Gidravlik press va jilolash dastgohlari', '25 tonnalik press va tasmali jilolash dastgohlari'],
      ["Yong'oq yog'ochi va shox dastalar", "Quritilgan Farg'ona yong'og'i va ishlov berilgan suyak"],
      ["Charm g'iloflar va qadoq", "Qo'lda tikilgan charm g'iloflar, jez parchinlar"],
      ['Xavfsizlik va shamollatish', "Respiratorlar va o'choq ustidagi so'rg'ich"],
    ],
    milestones: [
      [
        "Ustaxonani yangilash va press o'rnatish",
        "25 tonnalik pressni tebranishga chidamli poydevorga o'rnatish.",
        month(1),
      ],
      [
        "Damask po'latni toblash",
        "Homiylar uchun birinchi 150 ta raqamlangan tig'ni bolg'alash va shakllantirish.",
        month(2),
      ],
      ["Dasta o'rnatish va charxlash", "Yong'oq dastalarni o'rnatish va tig'ni 14° burchakda charxlash.", month(3)],
      ['Homiylarga yetkazib berish', "Sug'urtalangan qutilarni barcha homiylar manziliga jo'natish.", month(4)],
    ],
    rewards: [
      {
        title: "An'anaviy Chust pichog'i (12 sm)",
        description: "Jilolangan jez va suyak dastali, charx toshida qo'lda o'tkirlangan 12 sm li pichoq.",
        items: ["Chust pichog'i", "Bo'rtma naqshli charm g'ilof", 'Charx tosh'],
        delivery: '2026-yil dekabr',
      },
      {
        title: "Osh pichog'i, katta (22 sm)",
        description: "67 qatlamli damask tig' va Farg'ona yong'og'idan dasta. Osh tayyorlash va go'sht uchun.",
        items: ["Katta Chust pichog'i", "Yog'och sovg'a qutisi", 'Haqiqiylik sertifikati'],
        delivery: '2027-yil yanvar',
      },
    ],
    evaluation: {
      summary:
        "Mashhur hunarmandchilik brendi, ustalar mahorati tasdiqlangan. Oshpazlar orasida O'zbekistonda ham, chet elda ham talab yuqori.",
      strengths: [
        'Markaziy Osiyoda tan olingan, asrlik oilaviy hunar',
        "Xomashyoni to'g'ridan-to'g'ri olish bir dona tannarxini 35% kamaytiradi",
      ],
      risks: ["Har bir tig'ning o'tkirligini alohida tekshirish kerak"],
    },
    updates: [
      [
        'Birinchi 50 ta damask zagotovka tayyor — naqshi patday',
        "Mansur usta birinchi partiyani toblab bo'ldi. Nikelli va uglerodli qatlamlar orasidagi naqsh juda chiroyli chiqdi.",
      ],
    ],
    comments: [],
  },

  'registan-edtech-math-uzbek': {
    title: "Registon: o'zbek tilida moslashuvchan matematika",
    tagline: "5–11-sinflar uchun davlat dasturiga mos, o'yin shaklidagi matematika ilovasi.",
    description:
      "10 000 dan ortiq masala, o'zbek tilidagi animatsion video darslar va 50 ta davlat maktabi uchun avtomatik bilim tekshiruvi.",
    story: `Xorijiy matematika ilovalari ko'p, lekin ular O'zbekiston maktab dasturiga mos emas va o'zbek tilida tabiiy gapirmaydi.

Registon arzon Android telefonlarda ham, sekin internetda ham bemalol ishlaydigan yengil ilova yaratmoqda. O'qituvchi har bir o'quvchi qaysi mavzuni o'zlashtirganini real vaqtda ko'radi.

Bu notijorat loyiha: Samarqand, Qashqadaryo va Surxondaryo qishloqlaridagi 12 000 nafar o'quvchi ilovadan bepul foydalanadi.`,
    risks:
      'Qishloq maktablarida internet tez-tez uziladi. Ilova internetsiz ishlaydi va natijalarni aloqa tiklanganda sinxronlaydi.',
    location: 'Samarqand va Toshkent',
    imageUrl: '/images/covers/registan-math.svg',
    founder: {
      name: 'Shahnoza Qosimova',
      role: "O'quv dasturi rahbari",
      organization: '"Registon raqamli" jamg\'armasi',
      location: 'Samarqand',
      bio: 'Xalqaro matematika olimpiadasi sovrindorlarining murabbiyi, 12 yillik tajribaga ega pedagog.',
      registration: "NNT № 2049182 (Maktabgacha va maktab ta'limi vazirligi hamkori)",
    },
    budget: [
      ["O'zbek tilidagi video darslar va ovoz yozish", 'Toshkent studiyasida 120 ta animatsion video'],
      ['Dasturlash va masalalar tizimi', 'Internetsiz ishlaydigan yengil veb-ilova va tahlil'],
      ["50 maktabda o'qituvchilar uchun seminar", "150 nafar o'qituvchi uchun yuzma-yuz mashg'ulotlar"],
      ['2 yillik server va mahalliy tarmoq', 'Mobil internetda trafik hisoblanmasligi uchun TAS-IX orqali'],
    ],
    milestones: [
      ['5–8-sinflar dasturi tayyor', "Barcha masalalarni davlat ta'lim standartlariga moslashtirish.", month(1)],
      ['Sinov versiyasi 10 ta maktabda', "Samarqand tumanidagi 1 200 nafar o'quvchiga ilovani berish.", month(2)],
      [
        "Ovozlashtirish va to'liq ishga tushirish",
        "Yuqori sinflar uchun algebra va geometriya bo'limlarini chiqarish.",
        month(3),
      ],
      [
        'Yil yakuni olimpiadasi va natijalar',
        "O'quvchilar bilimi qanchalik oshganini homiylarga e'lon qilish.",
        month(6),
      ],
    ],
    evaluation: {
      summary:
        "Ijtimoiy ta'siri yuqori. Viloyat ta'lim boshqarmalari bilan hamkorlik yo'lga qo'yilgan, sinov bosqichida o'quvchilar darslarni oxirigacha o'tgan.",
      strengths: [
        "O'zbek tilidagi, mahalliy hayotga yaqin kontent — bu bo'shliqni to'ldiradi",
        "Bir o'quvchiga yiliga taxminan 7 500 so'm sarflanadi",
      ],
      risks: ["Maktablarda internet uzilib turgani uchun internetsiz rejim ishonchli bo'lishi kerak"],
    },
    updates: [
      [
        "7-sinf geometriyasi bo'yicha interaktiv darslar sinovga chiqdi",
        "Endi o'quvchilar 3D shakllarni ekranda aylantirib ko'ra oladi, hamma narsa o'zbek tilida ovozli tushuntiriladi.",
      ],
    ],
    comments: [],
  },

  'andijan-mobility-electric-cargo': {
    title: "Andijon: uch g'ildirakli elektr yuk mototsikllari",
    tagline: "Bozor savdogarlari va fermerlar uchun Andijonda yig'ilgan elektr yuk mototsikllari.",
    description:
      "Shovqinli, benzin yeydigan yuk mototsikllari o'rniga oddiy 220V rozetkadan bir kechada quvvatlanib, 600 kg yuk tashiydigan elektr mototsikllar.",
    story: `Bozorlarda va dehqon xo'jaliklarida uch g'ildirakli yuk mototsikllari meva-sabzavot, mato va non tashishda juda muhim. Ammo benzin va tez-tez ta'mirlash haydovchilarga qimmatga tushadi.

Andijon Mobility mahalliy po'lat rama va litiy-temir-fosfat batareyali elektr mototsikllar yasaydi. Bir kilometr yo'l benzinli mototsikldan 80% arzonga tushadi.

Bu mushoraka loyihasi: Andijonda 200 ta mototsikl yig'adigan liniya quramiz. Sarmoyadorlar mototsikl sotuvi va batareya almashtirish xizmatidan tushgan sof foydaning 24 foizini oladi.`,
    risks:
      "Batareya elementlarini olib kelish temir yo'l kechikishlariga bog'liq bo'lishi mumkin. Andijondagi omborimizda 60 kunlik zaxira saqlaymiz.",
    location: 'Andijon',
    imageUrl: '/images/covers/andijan-trikes.svg',
    founder: {
      name: 'Sardor Mirzayev',
      role: 'Asoschi, bosh muhandis',
      organization: '"Andijan Mobility" MChJ',
      location: 'Andijon',
      bio: "Asakadagi avtomobil zavodida 12 yil ishlab chiqarish va dvigatel sinovlari bilan shug'ullangan.",
      registration: 'MChJ guvohnomasi № 309482103 (Andijon sanoat zonasi)',
    },
    budget: [
      ['Batareyalar va elektr motorlar', "48V 100Ah LiFePO4 batareyalar va 2,5 kVt motor-g'ildiraklar"],
      ['Rama yasash va payvandlash moslamalari', 'Gidravlik quvur bukish va payvandlash stanoklari'],
      ['Ehtiyot qismlar va osma', 'Ressorlar, disk tormozlar, teshilmaydigan shinalar'],
      ["Yig'uv liniyasi va sinov", 'Sinov stendi va diagnostika uskunalari'],
      ['Sertifikatlash', '"O\'zstandart" sertifikati va yo\'l sinovlari'],
    ],
    milestones: [
      ["Yig'uv moslamalarini ishga tushirish", "Andijondagi sexda rama yig'ish moslamalarini o'rnatish.", month(1)],
      ['Birinchi 30 ta mototsikl', "30 ta tijorat mototsiklini yig'ish va stendda sinash.", month(2)],
      ['Bozorda sinov', 'Andijon markaziy bozoridagi haydovchilarga 20 ta sinov mototsiklini berish.', month(4)],
      ['Seriyali ishlab chiqarish', 'Oyiga 50 ta mototsikl ishlab chiqarish va buyurtmalarni bajarish.', month(6)],
    ],
    projected: "5 mln so'm ulushga yiliga ~1,2–1,4 mln so'm",
    evaluation: {
      summary:
        'Mahalliy ishlab chiqarish iqtisodi puxta hisoblangan. Bozor yuk tashuvchilari kooperativlaridan talab katta.',
      strengths: [
        'Asaka avtomobil zavodidan kelgan kuchli muhandislik tajribasi',
        'Benzinli mototsiklga nisbatan arzonligi sababli xaridor 7 oyda xarajatini qoplaydi',
      ],
      risks: ["Batareya yetkazib berish o'zgarib turadi — mahalliy zaxira kerak"],
    },
    updates: [
      [
        "Rama 1 000 kg yuk sinovidan o'tdi",
        "Mustahkamlangan rama ruxsat etilgan yukdan 1,5 baravar og'ir yuk ostida ham egilmadi. Batareya mahkamlagichlari sertifikatlandi.",
      ],
    ],
    comments: [],
  },
};
