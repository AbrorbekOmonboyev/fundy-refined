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
    title: 'AgroSmart Fargʻona: quyosh energiyali gidroponik issiqxonalar',
    tagline:
      'Quva tumanida suvni 78% kam sarflaydigan issiqxona — Fargʻona va Toshkent bozorlari uchun pomidor va qalampir.',
    description:
      'Quva tumanida tomga oʻrnatilgan quyosh panellari bilan ishlaydigan gidroponik issiqxonalar quramiz. Yer osti suvi 78% kam sarflanadi, pomidor va bolgar qalampiri hosili esa ikki baravar oshadi.',
    story: `Fargʻona vodiysida suv yildan-yilga kamaymoqda, ariq usulida sugʻorish esa suvning katta qismini isrof qiladi. Biz Quvadagi tajriba issiqxonamizda ikki mavsum yopiq tsiklli gidroponikani sinab koʻrdik: kimyoviy chiqindi yoʻq, suv sarfi toʻrt barobar kam.

Endi har biri 1 200 kv. metrlik uchta tijorat issiqxonasini qurmoqchimiz. Mablagʻ poʻlat karkas, polikarbonat, quyosh panellari va sugʻorish uskunalariga ketadi.

Bu mushoraka loyihasi: sarmoyadorlar 5 yil davomida tekshirilgan sof foydaning 28 foizini har chorakda oladi. Zarar boʻlsa, u ham kiritilgan ulushga qarab taqsimlanadi. Muddat oxirida kooperativ aʼzolari ulushni sotib olishi mumkin.`,
    risks:
      'Fargʻonada qishda harorat baʼzan -10°C gacha tushadi. Shuning uchun ikki qavatli issiqlik izolyatsiyasi va pellet isitgichlar oʻrnatamiz. Yoʻlda hosil buzilmasligi uchun vakuum qadoqlashdan foydalanamiz.',
    location: 'Quva, Fargʻona viloyati',
    imageUrl: '/images/fergana-agro.jpg',
    founder: {
      name: 'Azizbek Rahimov',
      role: 'Asoschi, agronom',
      organization: '"AgroSmart Fargʻona" MChJ',
      location: 'Fargʻona',
      bio: 'Toshkent davlat agrar universiteti bitiruvchisi. 11 yildan beri Oʻzbekiston va Turkiyada issiqxona tizimlarini quradi.',
      registration: 'MChJ guvohnomasi № 309812490 (Fargʻona shahri)',
    },
    budget: [
      ['Issiqxona karkasi va qoplamasi', 'Ruxlangan poʻlat arkalar va UV-chidamli polikarbonat'],
      ['Quyosh panellari va akkumulyator', '15 kVt quyosh panellari, gibrid invertor, batareyalar'],
      ['Tomchilatib sugʻorish va oʻgʻitlash', 'Avtomatik dozatorlar, nasoslar, EC/pH datchiklari'],
      ['Koʻchat va substrat', 'Sertifikatlangan GMOsiz urugʻlar va mineral paxta bloklari'],
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
        'Poʻlat karkasni oʻrnatish, polikarbonat bilan qoplash, panellarni ulash.',
        month(2),
      ],
      [
        'Sugʻorish tizimi va birinchi ekin',
        'Tomchilatib sugʻorishni oʻrnatish, oʻgʻit sinovi, birinchi koʻchatlarni ekish.',
        month(3),
      ],
      [
        'Birinchi hosil va yetkazib berish',
        'Toshkentdagi hamkor doʻkonlarga 12 tonna oliy navli hosil topshirish.',
        month(5),
      ],
    ],
    projected: '2,5 mln soʻm ulushga yiliga ~540–650 ming soʻm',
    evaluation: {
      summary:
        'Fargʻona va Toshkent ulgurji bozorlari bilan tuzilgan yetkazib berish shartnomalari tasdiqlandi. Yer ijarasi hujjatlari va kredit tarixi tekshirildi — muammo yoʻq.',
      strengths: [
        'Asoschining Quvada qurgan oldingi issiqxonalari joyida koʻrildi',
        'Suv tejash har oylik kommunal xarajatni ~70% kamaytiradi',
        'Toshkentdagi 2 ta distribyutor bilan oldindan kelishuv bor',
      ],
      risks: [
        'Qishki sovuqda qoʻshimcha isitish zaxirasi kerak',
        'Sovutgichli transport yoʻlda ushlanib qolsa, hosil buzilishi mumkin',
      ],
    },
    updates: [
      [
        'Poydevor tayyor, quyosh panellari yetib keldi',
        'Quvadagi poydevor toʻliq qotdi. Kecha texnik guruhimiz quyosh panellari va invertorlarni tekshirdi — barcha elektr sinovlaridan oʻtdi.',
      ],
    ],
    comments: [
      {
        author: 'Farrux Temirov',
        city: 'Toshkent',
        body: 'Poydevor ishlari zoʻr ketyapti. Choraklik foyda qachon toʻlanadi?',
        reply:
          'Assalomu alaykum, Farrux! Har chorak yopilgandan keyin 15 kun ichida, tekshirilgan savdo hisoboti bilan birga toʻlanadi.',
      },
    ],
  },

  'silkroad-samarkand-ikat-weavers': {
    title: 'Samarqand atlas va kulolchilik ustaxonasi',
    tagline: '24 nafar usta toʻquvchi va kulolga zamonaviy uskunalar, 18 nafar yosh shogirdga ish oʻrgatamiz.',
    description:
      'Samarqanddagi ustalar kooperativi tabiiy boʻyoqli ipak abrbandi matolar va anʼanaviy kobalt sirli sopol buyumlar ishlab chiqarishni kengaytiradi hamda 18 nafar yosh shogird tayyorlaydi.',
    story: `Qoʻlda toʻqilgan ipak atlas va sirli sopol — Buyuk ipak yoʻlidan qolgan meros. Lekin ustalarda koʻpincha xom ipakni ulgurji sotib olish, tejamkor elektr pech olish va buyumni yaxshi qadoqlash uchun pul yetmaydi.

Kooperativimiz 24 nafar usta oilasini bitta ustaxonaga birlashtirdi. Margʻilon pillasini toʻgʻridan-toʻgʻri olamiz va tutunsiz elektr pechga oʻtamiz — eski sir retseptlari saqlanib qoladi.

Homiylar raqamlangan buyumlar oladi: qoʻlda toʻqilgan ipak roʻmol, usta muhri bosilgan sopol toʻplam va Samarqanddagi ustaxonamizda master-klass.`,
    risks:
      'Bir metr ipakni qoʻlda toʻqish 4–6 soat oladi. Mukofotlar oʻz vaqtida yetishi uchun dastgohlarni 8 nafar katta usta oʻrtasida taqsimladik.',
    location: 'Samarqand',
    imageUrl: '/images/samarkand-craft.jpg',
    founder: {
      name: 'Dilnoza Karimova',
      role: 'Kooperativ rahbari, usta toʻquvchi',
      organization: 'Samarqand hunarmandlar uyushmasi',
      location: 'Samarqand',
      bio: '19 yillik tajribaga ega usta toʻquvchi. Oʻzbek amaliy sanʼatini YUNESKO koʻrgazmalarida namoyish etgan.',
      registration: 'YaTT guvohnomasi № 419203814 (Samarqand)',
    },
    budget: [
      ['Margʻilon xom ipagi va tabiiy boʻyoqlar', 'Ishlov berilmagan pilla ipagi, oʻsimlik va mineral boʻyoqlar'],
      ['Elektr kulolchilik pechi', '1200°C gacha qiziydigan, raqamli boshqaruvli pech'],
      ['Shogirdlar stipendiyasi va oʻquv materiallari', '18 nafar shogirdga 6 oy davomida oylik yordam'],
      ['Qadoqlash va sovgʻa qutilari', 'Yogʻoch sovgʻa qutilari va pochta qutilari'],
      ['Suratga olish va naqshlar arxivi', 'Anʼanaviy naqsh nomlari va kelib chiqishini hujjatlashtirish'],
    ],
    milestones: [
      [
        'Ipak xarid qilish va boʻyoq tayyorlash',
        '140 kg xom ipak olish; yongʻoq, ruyan va anor poʻstidan boʻyoq tayyorlash.',
        month(1),
      ],
      ['Pech oʻrnatish va sinov', 'Elektr pechni ustaxonaga ulash, kobalt sirni sinab koʻrish.', month(2)],
      [
        'Mukofotlarni toʻqish va sifat nazorati',
        'Barcha roʻmollarni toʻqib boʻlish, sopol laganlarga muhr bosish.',
        month(3),
      ],
      [
        'Qadoqlash va yetkazib berish',
        'Sugʻurtalangan posilkalarni Oʻzbekiston boʻylab va chet elga joʻnatish.',
        month(4),
      ],
    ],
    rewards: [
      {
        title: 'Samarqand kobalt piyolasi va likopchasi',
        description: 'Qoʻlda yasalgan, anʼanaviy Samarqand naqshli sopol piyola. Usta imzosi bilan.',
        items: ['Sopol piyola', 'Likopcha', 'Kelib chiqish sertifikati'],
        delivery: '2026-yil dekabr',
      },
      {
        title: 'Qoʻlda toʻqilgan ipak atlas roʻmol (180×50 sm)',
        description: 'Tabiiy boʻyoqlar bilan, yogʻoch dastgohda toʻqilgan "bodom" naqshli sof ipak roʻmol.',
        items: ['Sof ipak roʻmol', 'Yogʻoch sovgʻa qutisi', 'Samarqand toʻquvchilari haqida kitobcha'],
        delivery: '2027-yil yanvar',
      },
      {
        title: 'Master-klass va 7 qismli sopol toʻplam',
        description:
          'Osh uchun katta lagan va 6 ta piyola, hamda Samarqanddagi ustaxonada yarim kunlik shaxsiy mashgʻulot.',
        items: ['Katta lagan (38 sm)', '6 ta piyola', '4 soatlik master-klass', 'Uyushmada umrbod 15% chegirma'],
        delivery: '2027-yil yanvar',
      },
    ],
    evaluation: {
      summary:
        'Ustalarning ishlab chiqarish hajmi tasdiqlangan. Mukofotlar tannarxi aniq hisoblangan, loyiha hunarmandchilikni rivojlantirish dasturiga mos.',
      strengths: [
        'Asoschi YUNESKO koʻrgazmalarida qatnashgan, tan olingan usta',
        'Mahalliy xaridorlar va sayyohlardan barqaror talab bor',
        'Margʻilon ipak ishlab chiqaruvchilaridan toʻgʻridan-toʻgʻri xarid — vositachi ustamasi yoʻq',
      ],
      risks: [
        'Tabiiy boʻyoq rangini saqlash uchun xona harorati nazorat qilinishi kerak',
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
        body: 'Ustalarimizni qoʻllab-quvvatlaganimdan xursandman! Roʻmol uchun homiy boʻlsak, ustaxonaga borsak boʻladimi?',
        reply:
          'Albatta, Gulnora opa! Samarqandga kelganingizda barcha homiylarni choy va shirinlik bilan kutib olamiz.',
      },
    ],
  },

  'tashkent-stem-robotics-lab': {
    title: 'Chilonzorda bolalar uchun bepul robototexnika laboratoriyasi',
    tagline:
      'Toshkent davlat maktablarining 600 dan ortiq oʻquvchisiga robototexnika va dasturlashni bepul oʻrgatamiz.',
    description:
      'Chilonzor tumanida ochiq laboratoriya: kam taʼminlangan oilalar farzandlari uchun robototexnika, 3D bosma va dasturlash boʻyicha bepul mashgʻulotlar.',
    story: `Toshkentda minglab maktab oʻquvchilari muhandis boʻlishni orzu qiladi. Ammo kavsharlash stansiyasi, osillograf va 3D printer bor toʻgaraklar koʻp oilalar uchun qimmat.

Chilonzordagi 320 kv. metrlik binoni laboratoriyaga aylantirmoqdamiz. Hokimiyat binoni bepul berdi. Mashgʻulotlar, uskunalar va murabbiylar — hammasi tekin.

Yigʻilgan pulning hammasi uskunaga ketadi: 20 ta Arduino/ESP32 ish joyi, 6 ta 3D printer, himoya vositalari va oʻzbek hamda rus tilidagi oʻquv qoʻllanmalar.`,
    risks:
      'Bolalar bilan ishlaganda uskunalar tez eskiradi. Byudjetning 15 foizi ehtiyot qismlarga ajratilgan. Kavsharlashdan oldin har bir oʻquvchi xavfsizlik boʻyicha yoʻriqnomadan oʻtadi.',
    location: 'Chilonzor, Toshkent',
    imageUrl: '/images/tashkent-robotics.jpg',
    founder: {
      name: 'Jasur Bekmurodov',
      role: 'Asoschi, robototexnika oʻqituvchisi',
      organization: '"Kelajak muhandislari" NNT',
      location: 'Toshkent',
      bio: 'Toshkentdagi Inha universiteti bitiruvchisi. 7 yildan beri yoshlar uchun muhandislik olimpiadalari tashkil qiladi.',
      registration: 'NNT reyestri № 1948203 (Adliya vazirligi)',
    },
    budget: [
      [
        '20 ta ish joyi va mikrokontroller toʻplamlari',
        'ESP32 platalari, datchiklar, multimetrlar, kavsharlash stansiyalari',
      ],
      ['3D printerlar', '6 ta 3D printer va 100 kg biologik parchalanadigan PLA ip'],
      ['Oʻzbek tilidagi oʻquv dasturi', 'Rasmli qoʻllanmalar va onlayn topshiriqlar'],
      ['Xavfsizlik va mebel', 'Antistatik stollar, tutun soʻrgich, himoya koʻzoynaklari'],
      ['Yillik musobaqa jamgʻarmasi', 'Toshkent yoshlari oʻrtasida robot-rover musobaqasi uchun materiallar'],
    ],
    milestones: [
      [
        'Chilonzordagi xonani taʼmirlash',
        'Alohida elektr tarmogʻi, kuchlanish himoyasi va antistatik pol yotqizish.',
        month(1),
      ],
      [
        'Uskunalarni olish va oʻrnatish',
        '20 ta kavsharlash stansiyasi, 3D printerlarni yigʻish va ESP32 toʻplamlarini sinash.',
        month(2),
      ],
      [
        'Birinchi guruh — 150 oʻquvchi',
        'Qabulni ochish; oʻrinlarning bir qismi davlat maktabi oʻquvchilariga.',
        month(3),
      ],
      [
        'Ochiq kun va koʻrgazma',
        'Oʻquvchilar yasagan issiqxona datchiklari va mini-roverlarni ota-onalarga koʻrsatish.',
        month(5),
      ],
    ],
    evaluation: {
      summary:
        'Taʼlimga taʼsiri katta. NNT maqomi tekshirildi, hokimiyat bilan bepul bino boʻyicha shartnoma tasdiqlandi.',
      strengths: [
        'Inha va Turin universitetlari bitiruvchilaridan iborat koʻngilli jamoa',
        'Toʻlov yoʻqligi sababli har qanday oila farzandi qatnasha oladi',
        'Uskunalar 5 yildan ortiq, koʻp guruhlar uchun ishlatiladi',
      ],
      risks: ['Kavsharlash uchlari, tishli gʻildiraklar kabi sarf materiallarini doim toʻldirish kerak'],
    },
    updates: [
      [
        'Antistatik pol yotqizildi, 20 ta stol keldi',
        'Sizning yordamingiz bilan Chilonzordagi xona haqiqiy laboratoriyaga aylandi! ESP32 va Arduino platalarining birinchi partiyasi bojxonadan kechikmasdan oʻtdi.',
      ],
    ],
    comments: [
      {
        author: 'Shahnoza Yusupova',
        city: 'Toshkent',
        body: '12 yoshli qizim mashgʻulotlar boshlanishini intiqlik bilan kutyapti! Qoʻllab-quvvatlaganimdan faxrlanaman.',
      },
    ],
  },

  'aral-oasis-reforestation-saxaul': {
    title: 'Orol qurigan tubiga 50 000 saksovul',
    tagline: 'Moʻynoqda tuzli changni toʻxtatadigan saksovul toʻsigʻini ekamiz: 13 000 soʻm — bitta koʻchat.',
    description:
      'Moʻynoq tumanida chuqur ildizli qora saksovul ekib, qumni mustahkamlaymiz va tuzli chang boʻronlarini kamaytiramiz.',
    story: `Orol dengizi qurib, oʻrnida Orolqum choʻli paydo boʻldi. Har yili u yerdan havoga 75 million tonnadan ortiq tuz va chang koʻtariladi. Qora saksovulning ildizi 12 metr chuqurlikka boradi — qumni ushlab, namlikni saqlaydi.

Qoraqalpoq davlat universiteti olimlari bilan birga GPS yordamida egat ochib ekish usulini ishlab chiqdik. Ogʻir sharoitda ham koʻchatlarning 82 foizi tutib ketadi.

Har 13 000 soʻm bitta sertifikatlangan koʻchatni ekish va ikki yil parvarishlashga yetadi. Homiylar oʻz uchastkasining GPS koordinatalari va har yili sunʼiy yoʻldosh orqali oʻsimlik qoplami hisobotini oladi.`,
    risks:
      'Erta bahordagi boʻronlar yangi koʻchatlarni qum bilan koʻmib yuborishi mumkin. Shuning uchun koʻchatlarni tuzli shamoldan toʻsadigan pogʻonali kichik ariqlarga ekamiz.',
    location: 'Moʻynoq, Qoraqalpogʻiston',
    imageUrl: '/images/projects/aral-saxaul.jpg',
    founder: {
      name: 'Temur Dauletov',
      role: 'Ekolog, loyiha rahbari',
      organization: '"Orolni yashillashtirish" tashabbusi',
      location: 'Nukus',
      bio: '24 yildan beri Qoraqalpogʻiston va Ustyurtda choʻl ekologiyasi va tuproqni tiklash bilan shugʻullanadi.',
      registration: 'Ilmiy-tadqiqot markazi № 049281',
    },
    budget: [
      ['50 000 ta sertifikatlangan saksovul koʻchati', 'Qoʻngʻirotdagi choʻl koʻchatxonasida yetishtirilgan'],
      ['Traktor yoqilgʻisi va egat ochish', 'Qumda ekish texnikasi uchun yoqilgʻi va taʼmirlash'],
      ['Mahalliy ekish brigadalari', 'Moʻynoqning 30 nafar aholisiga mavsumiy ish haqi'],
      ['Sunʼiy yoʻldosh va dron monitoringi', 'Dron parvozlari va Sentinel-2 suratlari tahlili'],
    ],
    milestones: [
      ['Koʻchatlarni chiniqtirish', 'Qoʻngʻirot koʻchatxonasida 50 000 ta ikki yillik koʻchatni saralash.', month(1)],
      ['Birinchi ekish — 25 000 daraxt', 'Janubiy qismdagi 4B uchastkasiga ekish.', month(2)],
      ['Ikkinchi ekish — 25 000 daraxt', 'Shimoliy himoya chizigʻini ekib boʻlish.', month(3)],
      [
        'Bahorgi sanoq va ochiq hisobot',
        'Tutgan daraxtlar xaritasini va homiylar uchun GPS sahifani eʼlon qilish.',
        month(6),
      ],
    ],
    evaluation: {
      summary:
        'Ilmiy asosi mustahkam, bir daraxt narxi ochiq hisoblangan. Viloyat oʻrmon xoʻjaligi qoʻllab-quvvatlaydi.',
      strengths: [
        '20 yilda sinalgan, 82% tutish natijasini beradigan usul',
        'Moʻynoq aholisi uchun ish oʻrinlari',
        'Sunʼiy yoʻldosh orqali ochiq tekshiruv',
      ],
      risks: ['Erta bahordagi issiq kunlarda namlik saqlovchi gel kerak boʻladi'],
    },
    updates: [
      [
        '4B uchastkasiga 25 000 koʻchat ekildi!',
        'Jamoamiz sovuq choʻl shamoliga qaramay janubiy uchastkani muddatidan oldin ekib boʻldi. Oktabr yomgʻirlaridan keyin tuproq namligi aynan kerakli darajada.',
      ],
    ],
    comments: [
      {
        author: 'Otabek Mirzoyev',
        city: 'Navoiy',
        body: 'Orol — hammamizning masʼuliyatimiz. Temur aka, umringizni shu ishga bagʻishlaganingiz uchun rahmat.',
      },
    ],
  },

  'zarafshan-solar-cold-storage': {
    title: 'Zarafshon: quyosh energiyasida ishlaydigan meva omborlari',
    tagline: 'Navoiy va Buxoro bogʻdorlari uchun 150 tonnalik sovutgichli omborlar — elektr tarmogʻiga bogʻliq emas.',
    description:
      'Kichik fermerlar hosilni mavsumda arzonga sotib yubormasligi uchun bogʻlar yonida quyosh energiyali sovutgich omborlar quramiz. Toʻlov — har bir yashik uchun.',
    story: `Uzum, anor va oʻrik yetishtiramiz, lekin kichik oilaviy xoʻjaliklar hosilning 30 foizigacha qismini yoʻqotadi. Saqlash joyi yoʻqligi uchun terim paytida eng past narxda sotishga majbur boʻladi.

Zarafshon vodiysida bogʻlar yonida 150 tonnalik modulli sovutgich omborlar quramiz. Ular quyosh panellari va muzli issiqlik akkumulyatorida ishlaydi: elektr oʻchsa ham ichkarida doim 0–4°C.

Bu mushoraka loyihasi: sarmoyadorlar ombor egalaridan biriga aylanadi va yashik saqlash hamda saralash xizmatlaridan tushgan tekshirilgan foydaning 26 foizini yiliga ikki marta oladi.`,
    risks:
      'Uskunani chetdan olib kelish muddati oʻzgarishi mumkin. Shuning uchun barcha sovutgich uskunalarini Toshkentdagi rasmiy distribyutorlar orqali, ishlab chiqaruvchi kafolati bilan oldik.',
    location: 'Karmana, Navoiy viloyati',
    imageUrl: '/images/projects/zarafshan-fruit.jpg',
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
      ['Sanoat kompressorlari', 'Ekologik toza R290 sovutkichli, tezligi oʻzgaruvchan agregatlar'],
      ['Saralash tarozilari va namlik datchiklari', 'Avtomatik tarozilar, simsiz harorat datchiklari'],
      ['Ruxsatnomalar va oʻrnatish', 'Elektr tarmogʻiga ulanish ruxsati va poydevor ekspertizasi'],
    ],
    milestones: [
      [
        'Yer ishlari va beton maydon',
        'Navoiydagi 1 000 kv. metrlik uchastkani tekislash, armaturali beton quyish.',
        month(1),
      ],
      [
        'Kamera va quyosh panellari',
        'Izolyatsiyalangan devorlarni yigʻish, 45 kVt panellar uchun tayanchlar oʻrnatish.',
        month(2),
      ],
      [
        'Kompressorlarni ishga tushirish',
        'Haroratni -1°C gacha tushirish va elektr oʻchganda 36 soat sovuq saqlanishini sinash.',
        month(3),
      ],
      ['Fermerlardan birinchi hosil', '150 tonnalik omborni Navoiy uzumi va anori bilan toʻldirish.', month(4)],
    ],
    projected: '5 mln soʻm ulushga yiliga ~1,1–1,4 mln soʻm',
    evaluation: {
      summary:
        'Navoiy va Buxoroda hosildan keyingi saqlash joyi yetishmasligi tasdiqlangan, daromad har yili takrorlanadi. Kompaniya Navoiy erkin iqtisodiy zonasida toʻgʻri roʻyxatdan oʻtgan.',
      strengths: [
        'Muzli akkumulyator tufayli elektr toʻlovlari deyarli yoʻq',
        'Karmana tumanidagi 18 ta uzumzor egasi bilan niyat bayonnomasi imzolangan',
        'Mablagʻ koʻchmas mulk va uskuna koʻrinishida saqlanadi',
      ],
      risks: ['Yozgi terim va qishki taʼmirlash oylari orasida daromad oʻzgarib turadi'],
    },
    updates: [
      [
        'Karmanada sovutgich kamera devorlari tayyor',
        '150 mm qalinlikdagi kamera devorlari germetik yopildi. Keyingi hafta tomga 45 kVt quyosh panellari oʻrnatiladi.',
      ],
    ],
    comments: [
      {
        author: 'Nodirbek Yusupov',
        city: 'Toshkent',
        body: '15 mln soʻm (demo) bilan qoʻshildim. Toza texnologiya fermerlarning haqiqiy muammosini hal qilayotgani yoqdi.',
      },
    ],
  },

  'chust-master-cutlery-works': {
    title: 'Chust pichogʻi: qoʻlda toblangan damask poʻlat',
    tagline: 'Chust pichoqchilik anʼanasini damask poʻlat bilan boyitamiz — oshxona va kolleksiya uchun.',
    description:
      'Namangan viloyati Chust shahridagi 12 nafar usta pichoqchiga gidravlik bolgʻa va jilolash uskunalari olib beramiz.',
    story: `Chust pichogʻi jez naqshi va shox dastasi bilan butun dunyoga mashhur. Asrlar davomida ular qoʻlda, bolgʻa bilan toblanib keladi.

Bugungi oshxonada raqobatlashish uchun ustalarimiz anʼanaviy Chust dastasini koʻp qatlamli, yuqori uglerodli damask poʻlat bilan birlashtirmoqda.

Homiylar har biri raqamlangan, qoʻlda yasalgan pichoq oladi: oshxona pichogʻi, osh uchun anʼanaviy pichoq va Chust ustalari tikkan charm gʻilof.`,
    risks:
      'Har bir pichoq qoʻlda yasaladi, shuning uchun damask naqshi va yogʻoch tolasi biroz farq qiladi — bu haqiqiy qoʻl mehnatining belgisi.',
    location: 'Chust, Namangan viloyati',
    imageUrl: '/images/projects/chust-knives.jpg',
    founder: {
      name: 'Mansur Poʻlatov',
      role: 'Usta pichoqchi, uyushma oqsoqoli',
      organization: 'Chust pichoqchilar uyushmasi',
      location: 'Chust, Namangan viloyati',
      bio: 'Beshinchi avlod Chust pichoqchisi. Ishlari Oʻzbekiston davlat tarix muzeyida saqlanadi.',
      registration: 'YaTT guvohnomasi № 920194812 (Namangan)',
    },
    budget: [
      ['Damask poʻlat zagotovkalari', '67 qatlamli poʻlat va jez zagotovkalar'],
      ['Gidravlik press va jilolash dastgohlari', '25 tonnalik press va tasmali jilolash dastgohlari'],
      ['Yongʻoq yogʻochi va shox dastalar', 'Quritilgan Fargʻona yongʻogʻi va ishlov berilgan suyak'],
      ['Charm gʻiloflar va qadoq', 'Qoʻlda tikilgan charm gʻiloflar, jez parchinlar'],
      ['Xavfsizlik va shamollatish', 'Respiratorlar va oʻchoq ustidagi soʻrgʻich'],
    ],
    milestones: [
      [
        'Ustaxonani yangilash va press oʻrnatish',
        '25 tonnalik pressni tebranishga chidamli poydevorga oʻrnatish.',
        month(1),
      ],
      [
        'Damask poʻlatni toblash',
        'Homiylar uchun birinchi 150 ta raqamlangan tigʻni bolgʻalash va shakllantirish.',
        month(2),
      ],
      ['Dasta oʻrnatish va charxlash', 'Yongʻoq dastalarni oʻrnatish va tigʻni 14° burchakda charxlash.', month(3)],
      ['Homiylarga yetkazib berish', 'Sugʻurtalangan qutilarni barcha homiylar manziliga joʻnatish.', month(4)],
    ],
    rewards: [
      {
        title: 'Anʼanaviy Chust pichogʻi (12 sm)',
        description: 'Jilolangan jez va suyak dastali, charx toshida qoʻlda oʻtkirlangan 12 sm li pichoq.',
        items: ['Chust pichogʻi', 'Boʻrtma naqshli charm gʻilof', 'Charx tosh'],
        delivery: '2026-yil dekabr',
      },
      {
        title: 'Osh pichogʻi, katta (22 sm)',
        description: '67 qatlamli damask tigʻ va Fargʻona yongʻogʻidan dasta. Osh tayyorlash va goʻsht uchun.',
        items: ['Katta Chust pichogʻi', 'Yogʻoch sovgʻa qutisi', 'Haqiqiylik sertifikati'],
        delivery: '2027-yil yanvar',
      },
    ],
    evaluation: {
      summary:
        'Mashhur hunarmandchilik brendi, ustalar mahorati tasdiqlangan. Oshpazlar orasida Oʻzbekistonda ham, chet elda ham talab yuqori.',
      strengths: [
        'Markaziy Osiyoda tan olingan, asrlik oilaviy hunar',
        'Xomashyoni toʻgʻridan-toʻgʻri olish bir dona tannarxini 35% kamaytiradi',
      ],
      risks: ['Har bir tigʻning oʻtkirligini alohida tekshirish kerak'],
    },
    updates: [
      [
        'Birinchi 50 ta damask zagotovka tayyor — naqshi patday',
        'Mansur usta birinchi partiyani toblab boʻldi. Nikelli va uglerodli qatlamlar orasidagi naqsh juda chiroyli chiqdi.',
      ],
    ],
    comments: [],
  },

  'registan-edtech-math-uzbek': {
    title: 'Registon: oʻzbek tilida moslashuvchan matematika',
    tagline: '5–11-sinflar uchun davlat dasturiga mos, oʻyin shaklidagi matematika ilovasi.',
    description:
      '10 000 dan ortiq masala, oʻzbek tilidagi animatsion video darslar va 50 ta davlat maktabi uchun avtomatik bilim tekshiruvi.',
    story: `Xorijiy matematika ilovalari koʻp, lekin ular Oʻzbekiston maktab dasturiga mos emas va oʻzbek tilida tabiiy gapirmaydi.

Registon arzon Android telefonlarda ham, sekin internetda ham bemalol ishlaydigan yengil ilova yaratmoqda. Oʻqituvchi har bir oʻquvchi qaysi mavzuni oʻzlashtirganini real vaqtda koʻradi.

Bu notijorat loyiha: Samarqand, Qashqadaryo va Surxondaryo qishloqlaridagi 12 000 nafar oʻquvchi ilovadan bepul foydalanadi.`,
    risks:
      'Qishloq maktablarida internet tez-tez uziladi. Ilova internetsiz ishlaydi va natijalarni aloqa tiklanganda sinxronlaydi.',
    location: 'Samarqand va Toshkent',
    imageUrl: '/images/projects/registan.jpg',
    founder: {
      name: 'Shahnoza Qosimova',
      role: 'Oʻquv dasturi rahbari',
      organization: '"Registon raqamli" jamgʻarmasi',
      location: 'Samarqand',
      bio: 'Xalqaro matematika olimpiadasi sovrindorlarining murabbiyi, 12 yillik tajribaga ega pedagog.',
      registration: 'NNT № 2049182 (Maktabgacha va maktab taʼlimi vazirligi hamkori)',
    },
    budget: [
      ['Oʻzbek tilidagi video darslar va ovoz yozish', 'Toshkent studiyasida 120 ta animatsion video'],
      ['Dasturlash va masalalar tizimi', 'Internetsiz ishlaydigan yengil veb-ilova va tahlil'],
      ['50 maktabda oʻqituvchilar uchun seminar', '150 nafar oʻqituvchi uchun yuzma-yuz mashgʻulotlar'],
      ['2 yillik server va mahalliy tarmoq', 'Mobil internetda trafik hisoblanmasligi uchun TAS-IX orqali'],
    ],
    milestones: [
      ['5–8-sinflar dasturi tayyor', 'Barcha masalalarni davlat taʼlim standartlariga moslashtirish.', month(1)],
      ['Sinov versiyasi 10 ta maktabda', 'Samarqand tumanidagi 1 200 nafar oʻquvchiga ilovani berish.', month(2)],
      [
        'Ovozlashtirish va toʻliq ishga tushirish',
        'Yuqori sinflar uchun algebra va geometriya boʻlimlarini chiqarish.',
        month(3),
      ],
      [
        'Yil yakuni olimpiadasi va natijalar',
        'Oʻquvchilar bilimi qanchalik oshganini homiylarga eʼlon qilish.',
        month(6),
      ],
    ],
    evaluation: {
      summary:
        'Ijtimoiy taʼsiri yuqori. Viloyat taʼlim boshqarmalari bilan hamkorlik yoʻlga qoʻyilgan, sinov bosqichida oʻquvchilar darslarni oxirigacha oʻtgan.',
      strengths: [
        'Oʻzbek tilidagi, mahalliy hayotga yaqin kontent — bu boʻshliqni toʻldiradi',
        'Bir oʻquvchiga yiliga taxminan 7 500 soʻm sarflanadi',
      ],
      risks: ['Maktablarda internet uzilib turgani uchun internetsiz rejim ishonchli boʻlishi kerak'],
    },
    updates: [
      [
        '7-sinf geometriyasi boʻyicha interaktiv darslar sinovga chiqdi',
        'Endi oʻquvchilar 3D shakllarni ekranda aylantirib koʻra oladi, hamma narsa oʻzbek tilida ovozli tushuntiriladi.',
      ],
    ],
    comments: [],
  },

  'andijan-mobility-electric-cargo': {
    title: 'Andijon: uch gʻildirakli elektr yuk mototsikllari',
    tagline: 'Bozor savdogarlari va fermerlar uchun Andijonda yigʻilgan elektr yuk mototsikllari.',
    description:
      'Shovqinli, benzin yeydigan yuk mototsikllari oʻrniga oddiy 220V rozetkadan bir kechada quvvatlanib, 600 kg yuk tashiydigan elektr mototsikllar.',
    story: `Bozorlarda va dehqon xoʻjaliklarida uch gʻildirakli yuk mototsikllari meva-sabzavot, mato va non tashishda juda muhim. Ammo benzin va tez-tez taʼmirlash haydovchilarga qimmatga tushadi.

Andijon Mobility mahalliy poʻlat rama va litiy-temir-fosfat batareyali elektr mototsikllar yasaydi. Bir kilometr yoʻl benzinli mototsikldan 80% arzonga tushadi.

Bu mushoraka loyihasi: Andijonda 200 ta mototsikl yigʻadigan liniya quramiz. Sarmoyadorlar mototsikl sotuvi va batareya almashtirish xizmatidan tushgan sof foydaning 24 foizini oladi.`,
    risks:
      'Batareya elementlarini olib kelish temir yoʻl kechikishlariga bogʻliq boʻlishi mumkin. Andijondagi omborimizda 60 kunlik zaxira saqlaymiz.',
    location: 'Andijon',
    imageUrl: '/images/projects/andijan-trike.jpg',
    founder: {
      name: 'Sardor Mirzayev',
      role: 'Asoschi, bosh muhandis',
      organization: '"Andijan Mobility" MChJ',
      location: 'Andijon',
      bio: 'Asakadagi avtomobil zavodida 12 yil ishlab chiqarish va dvigatel sinovlari bilan shugʻullangan.',
      registration: 'MChJ guvohnomasi № 309482103 (Andijon sanoat zonasi)',
    },
    budget: [
      ['Batareyalar va elektr motorlar', '48V 100Ah LiFePO4 batareyalar va 2,5 kVt motor-gʻildiraklar'],
      ['Rama yasash va payvandlash moslamalari', 'Gidravlik quvur bukish va payvandlash stanoklari'],
      ['Ehtiyot qismlar va osma', 'Ressorlar, disk tormozlar, teshilmaydigan shinalar'],
      ['Yigʻuv liniyasi va sinov', 'Sinov stendi va diagnostika uskunalari'],
      ['Sertifikatlash', '"Oʻzstandart" sertifikati va yoʻl sinovlari'],
    ],
    milestones: [
      ['Yigʻuv moslamalarini ishga tushirish', 'Andijondagi sexda rama yigʻish moslamalarini oʻrnatish.', month(1)],
      ['Birinchi 30 ta mototsikl', '30 ta tijorat mototsiklini yigʻish va stendda sinash.', month(2)],
      ['Bozorda sinov', 'Andijon markaziy bozoridagi haydovchilarga 20 ta sinov mototsiklini berish.', month(4)],
      ['Seriyali ishlab chiqarish', 'Oyiga 50 ta mototsikl ishlab chiqarish va buyurtmalarni bajarish.', month(6)],
    ],
    projected: '5 mln soʻm ulushga yiliga ~1,2–1,4 mln soʻm',
    evaluation: {
      summary:
        'Mahalliy ishlab chiqarish iqtisodi puxta hisoblangan. Bozor yuk tashuvchilari kooperativlaridan talab katta.',
      strengths: [
        'Asaka avtomobil zavodidan kelgan kuchli muhandislik tajribasi',
        'Benzinli mototsiklga nisbatan arzonligi sababli xaridor 7 oyda xarajatini qoplaydi',
      ],
      risks: ['Batareya yetkazib berish oʻzgarib turadi — mahalliy zaxira kerak'],
    },
    updates: [
      [
        'Rama 1 000 kg yuk sinovidan oʻtdi',
        'Mustahkamlangan rama ruxsat etilgan yukdan 1,5 baravar ogʻir yuk ostida ham egilmadi. Batareya mahkamlagichlari sertifikatlandi.',
      ],
    ],
    comments: [],
  },
};
