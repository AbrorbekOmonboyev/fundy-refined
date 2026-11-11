-- =============================================================================
-- HACKATHON SHOWCASE, part 2: 3 more made-up donation projects (marked is_demo).
-- Run after showcase.sql. Founders and backers are the @demo.fundy.uz accounts.
-- These are not real people or organisations. Remove with showcase-remove.sql.
-- =============================================================================
begin;

insert into public.founder_profiles
  (user_id, display_name, role_title, organization, location, bio, experience_years, registration_number, is_verified, verified_at, verified_by)
values
  ('9c36e9a0-54c9-4357-a79e-a5b901cdec43', 'Rustam Ergashev', 'Jamgʻarma rahbari', '"Mehr bogʻi" xayriya jamgʻarmasi', 'Fargʻona', 'Qishloq xoʻjaligi muhandisi. 9 yildan beri Fargʻona vodiysidagi mehribonlik uylari bilan ishlaydi.', 9, 'NNT reyestri № 2210394 (Adliya vazirligi)', true, '2026-10-01T08:00:00.000Z', null),
  ('cca93be9-595d-4ba6-a7f0-d4354eb1f827', 'Nodira Ergasheva', 'Usta toʻquvchi, oʻquv markazi rahbari', '"Ipak yoʻli ayollari" NNT', 'Samarqand', '15 yillik tajribaga ega usta toʻquvchi. Nogironligi bor ayollarga hunar oʻrgatadi.', 15, 'NNT reyestri № 1987412 (Adliya vazirligi)', true, '2026-10-01T08:00:00.000Z', null),
  ('a16c7fb3-aa6f-47d7-af1a-2bbb21de2220', 'Mohira Ergasheva', 'Koordinator', '"Saxovat" oziq-ovqat banki', 'Navoiy', 'Ijtimoiy xodim. 6 yildan beri Navoiy viloyatida kam taʼminlangan oilalarga yordam tarqatadi.', 6, 'NNT reyestri № 2304117 (Adliya vazirligi)', true, '2026-10-01T08:00:00.000Z', null);

insert into public.projects
  (id, owner_id, slug, model, category_id, region_id, location, cover_image_path, original_language,
   target_amount, min_contribution, duration_days, status, is_featured, submitted_at, reviewed_at, reviewed_by,
   starts_at, ends_at, created_at, is_demo)
values
  ('6dc99f3f-7cb2-5121-8afc-4d26714746a3', '9c36e9a0-54c9-4357-a79e-a5b901cdec43', 'fergana-childrens-home-greenhouse', 'donation', 'social', 'fergana', 'Margʻilon, Fargʻona viloyati', '/images/fergana-agro.jpg', 'uz', 48000000, 10000, 31, 'active', false, now() - interval '15 days', now() - interval '13 days', null, now() - interval '12 days', now() + interval '19 days', now() - interval '20 days', true),
  ('c86eff9c-1df6-544e-bcfd-a1868091e78a', 'cca93be9-595d-4ba6-a7f0-d4354eb1f827', 'samarkand-ikat-school-for-women', 'donation', 'education', 'samarkand', 'Samarqand', '/images/samarkand-craft.jpg', 'uz', 36000000, 10000, 31, 'active', true, now() - interval '23 days', now() - interval '21 days', null, now() - interval '20 days', now() + interval '11 days', now() - interval '28 days', true),
  ('58b724c9-3c17-5ff3-bfa5-c8701b0a8339', 'a16c7fb3-aa6f-47d7-af1a-2bbb21de2220', 'navoi-winter-food-packs', 'donation', 'social', 'navoi', 'Navoiy viloyati', '/images/projects/zarafshan-fruit.jpg', 'uz', 60000000, 10000, 32, 'active', false, now() - interval '9 days', now() - interval '7 days', null, now() - interval '6 days', now() + interval '26 days', now() - interval '14 days', true);

insert into public.project_translations (project_id, language, title, tagline, summary, story, risks)
values
  ('6dc99f3f-7cb2-5121-8afc-4d26714746a3', 'uz', 'Margʻilondagi bolalar uyi uchun issiqxona', '62 nafar bola uchun yil boʻyi yangi sabzavot va bolalarga dehqonchilik darslari.', 'Margʻilondagi 23-sonli mehribonlik uyi hovlisida 300 kv. metrlik issiqxona quramiz. U yiliga 6 tonnagacha pomidor, bodring va koʻkat beradi, bolalar esa oʻzlari ekib oʻstirishni oʻrganadi.', 'Mehribonlik uyida 62 nafar bola yashaydi. Qishda yangi sabzavot qimmat, shuning uchun ovqatlanishda ular kam boʻladi.

Issiqxona bu muammoni hal qiladi: hosil oshxonaga ketadi, ortiqchasi mahalla bozorida sotilib, tushgan pul uyning ehtiyojlariga sarflanadi. Har hafta katta yoshdagi bolalar uchun agronom bilan dehqonchilik darsi boʻladi.

Har bir bosqichdan keyin cheklar va rasmlarni shu sahifada eʼlon qilamiz.', 'Qishki sovuqda isitish xarajati rejadan oshishi mumkin. Shuning uchun byudjetga issiqlik izolyatsiyasi va zaxira isitgich kiritilgan.'),
  ('6dc99f3f-7cb2-5121-8afc-4d26714746a3', 'en', 'A greenhouse for a children''s home in Margilan', 'Fresh vegetables all year for 62 children, and farming lessons they can keep.', 'We are building a 300 m² greenhouse in the yard of children''s home No. 23 in Margilan. It will grow up to 6 tonnes of tomatoes, cucumbers and greens a year, and the children learn to grow food themselves.', '62 children live at the home. In winter fresh vegetables are expensive, so there are few of them on the table.

The greenhouse fixes that: the harvest goes to the kitchen, and anything left over is sold at the local market to pay for the home''s needs. Every week the older children have a farming lesson with an agronomist.

After each stage we publish the receipts and photos on this page.', 'Heating can cost more than planned in a cold winter, so the budget includes insulation and a backup heater.'),
  ('6dc99f3f-7cb2-5121-8afc-4d26714746a3', 'ru', 'Теплица для детского дома в Маргилане', 'Свежие овощи круглый год для 62 детей и уроки земледелия.', 'Мы строим теплицу на 300 м² во дворе детского дома № 23 в Маргилане. Она даст до 6 тонн помидоров, огурцов и зелени в год, а дети научатся выращивать еду сами.', 'В детском доме живут 62 ребёнка. Зимой свежие овощи дорогие, поэтому на столе их мало.

Теплица решает это: урожай идёт на кухню, а излишки продаются на местном рынке, и деньги идут на нужды дома. Каждую неделю старшие дети занимаются с агрономом.

После каждого этапа мы публикуем чеки и фото на этой странице.', 'Холодной зимой отопление может стоить дороже плана, поэтому в бюджет заложены утепление и резервный обогреватель.'),
  ('c86eff9c-1df6-544e-bcfd-a1868091e78a', 'uz', 'Nogironligi bor ayollar uchun bepul ikat maktabi', 'Samarqandda 40 nafar ayolga 6 oylik toʻquvchilik kursi va ishga joylashishda yordam.', 'Samarqandda nogironligi bor 40 nafar ayol uchun bepul ikat toʻquvchilik kursini ochamiz. 8 ta dastgoh, ipak va usta-murabbiylar haqi shu yigʻimdan toʻlanadi.', 'Nogironligi bor ayollarning koʻpchiligi uydan chiqmasdan ishlay oladigan kasb izlaydi. Ikat toʻquvchilik shunday kasb: dastgoh uyda turadi, mahsulot esa yaxshi sotiladi.

Kurs 6 oy davom etadi. Har bir guruhda 10 nafar ayol oʻqiydi. Kurs oxirida eng yaxshi bitiruvchilar dastgohni uyiga olib ketadi va bizning hunarmandlar uyushmasiga buyurtma asosida ishlaydi.

Pul bosqichma-bosqich beriladi, har bir bosqich hisoboti shu sahifada.', 'Baʼzi oʻquvchilar uchun transport qiyin boʻlishi mumkin. Byudjetda taksi xarajatlari koʻzda tutilgan.'),
  ('c86eff9c-1df6-544e-bcfd-a1868091e78a', 'en', 'A free ikat school for women with disabilities', 'A 6-month weaving course for 40 women in Samarkand, with help finding work.', 'We are opening a free ikat weaving course in Samarkand for 40 women with disabilities. This campaign pays for 8 looms, silk and the master weavers who teach.', 'Many women with disabilities look for a trade they can do without leaving home. Ikat weaving is one: the loom stays at home and the cloth sells well.

The course runs for 6 months, 10 women per group. At the end the best graduates take a loom home and weave to order for our craft association.

The money is paid out stage by stage, and each stage''s report is on this page.', 'Getting to class can be hard for some students, so the budget covers taxi rides.'),
  ('c86eff9c-1df6-544e-bcfd-a1868091e78a', 'ru', 'Бесплатная школа икат для женщин с инвалидностью', 'Шестимесячный курс ткачества для 40 женщин в Самарканде и помощь с работой.', 'Мы открываем в Самарканде бесплатный курс ткачества икат для 40 женщин с инвалидностью. Сбор оплачивает 8 станков, шёлк и работу мастеров-наставниц.', 'Многие женщины с инвалидностью ищут ремесло, которым можно заниматься дома. Икат — такое ремесло: станок стоит дома, а ткань хорошо продаётся.

Курс длится 6 месяцев, по 10 женщин в группе. В конце лучшие выпускницы забирают станок домой и ткут на заказ для нашего ремесленного объединения.

Деньги выдаются по этапам, отчёт по каждому этапу — на этой странице.', 'Некоторым ученицам трудно добираться, поэтому в бюджет заложено такси.'),
  ('58b724c9-3c17-5ff3-bfa5-c8701b0a8339', 'uz', 'Navoiyda 400 oilaga qishki oziq-ovqat toʻplami', 'Har bir toʻplamda bir oylik un, guruch, yogʻ, quruq meva va choy.', 'Navoiy viloyatidagi 400 ta kam taʼminlangan oilaga qishki oziq-ovqat toʻplamlarini yetkazamiz. Oilalar roʻyxati mahalla fuqarolar yigʻinlari bilan birga tuzilgan.', 'Qish oylarida ish kamayadi, oziq-ovqat esa qimmatlaydi. Koʻp bolali va keksa oilalar uchun bu eng qiyin vaqt.

Har bir toʻplamda bir oylik un, guruch, yogʻ, shakar, quruq meva va choy bor. Mahsulotlarni ulgurji narxda mahalliy fermerlardan olamiz, shuning uchun bitta toʻplam 150 000 soʻmga tushadi.

Tarqatish kunlari rasm va roʻyxatlarni (ismlarsiz) shu sahifada eʼlon qilamiz.', 'Narxlar oshsa, toʻplamlar soni biroz kamayishi mumkin. Har qanday oʻzgarishni yangiliklarda yozamiz.'),
  ('58b724c9-3c17-5ff3-bfa5-c8701b0a8339', 'en', 'Winter food packs for 400 families in Navoi', 'Each pack holds a month of flour, rice, oil, dried fruit and tea.', 'We are delivering winter food packs to 400 low-income families in Navoi region. The family list was drawn up with the local mahalla committees.', 'In winter there is less work and food costs more. For large families and elderly people it is the hardest time of year.

Each pack holds a month of flour, rice, oil, sugar, dried fruit and tea. We buy at wholesale prices from local farmers, so one pack costs 150,000 so’m.

On delivery days we publish photos and lists (without names) on this page.', 'If prices rise, we may deliver slightly fewer packs. Any change will be posted in the updates.'),
  ('58b724c9-3c17-5ff3-bfa5-c8701b0a8339', 'ru', 'Зимние продуктовые наборы для 400 семей в Навои', 'В каждом наборе — месячный запас муки, риса, масла, сухофруктов и чая.', 'Мы доставим зимние продуктовые наборы 400 малообеспеченным семьям Навоийской области. Список семей составлен вместе с махаллинскими комитетами.', 'Зимой работы меньше, а еда дороже. Для многодетных семей и пожилых людей это самое трудное время.

В каждом наборе — месячный запас муки, риса, масла, сахара, сухофруктов и чая. Мы покупаем у местных фермеров по оптовой цене, поэтому один набор стоит 150 000 сумов.

В дни раздачи мы публикуем фото и списки (без имён) на этой странице.', 'Если цены вырастут, наборов может быть немного меньше. Обо всех изменениях напишем в новостях.');

insert into public.budget_items (id, project_id, position, category, description, amount)
values
  ('871275ef-3df9-5fb4-b6ca-0025e7adb52c', '6dc99f3f-7cb2-5121-8afc-4d26714746a3', 0, 'Karkas va polikarbonat', 'Ruxlangan poʻlat karkas, 8 mm polikarbonat qoplama', 21000000),
  ('f2c8c1a4-af81-5a8d-9b99-dfb54da4aa89', '6dc99f3f-7cb2-5121-8afc-4d26714746a3', 1, 'Sugʻorish va isitish', 'Tomchilatib sugʻorish, issiqlik izolyatsiyasi, zaxira isitgich', 14000000),
  ('96e4196b-9988-58c6-9b85-a3d33d03fcd4', '6dc99f3f-7cb2-5121-8afc-4d26714746a3', 2, 'Urugʻ, tuproq va asboblar', 'Birinchi ikki mavsum uchun koʻchat, tuproq va bolalar uchun asboblar', 7000000),
  ('b750cbc3-9f1f-5dab-884c-10f8e331cec9', '6dc99f3f-7cb2-5121-8afc-4d26714746a3', 3, 'Agronom va darslar', 'Bir yillik haftalik darslar va montaj nazorati', 6000000),
  ('b39c4834-1fea-5c41-89fa-7024cb6553df', 'c86eff9c-1df6-544e-bcfd-a1868091e78a', 0, 'Toʻquv dastgohlari', '8 ta qoʻl dastgohi va taʼmirlash', 16000000),
  ('a7f4951c-d157-5659-9ee6-a0066ac07789', 'c86eff9c-1df6-544e-bcfd-a1868091e78a', 1, 'Ipak va boʻyoqlar', 'Margʻilon xom ipagi, tabiiy boʻyoqlar', 9000000),
  ('f77e2a93-4737-5313-8eba-1af12060135a', 'c86eff9c-1df6-544e-bcfd-a1868091e78a', 2, 'Murabbiylar haqi', 'Ikki usta-murabbiy, 6 oy', 8000000),
  ('370149d1-fe50-5023-833e-743941eb936e', 'c86eff9c-1df6-544e-bcfd-a1868091e78a', 3, 'Transport', 'Oʻquvchilar uchun taksi', 3000000),
  ('036a9f02-9f7d-5e17-a42c-65c438219d94', '58b724c9-3c17-5ff3-bfa5-c8701b0a8339', 0, 'Oziq-ovqat mahsulotlari', '400 ta toʻplam: un, guruch, yogʻ, shakar, quruq meva, choy', 52000000),
  ('a6a77b53-47b4-5556-a1c9-0dcf2c0e82d9', '58b724c9-3c17-5ff3-bfa5-c8701b0a8339', 1, 'Qadoqlash', 'Qoplar va qutilar', 3000000),
  ('22d6846a-213f-5f50-b9c5-840e19e9466b', '58b724c9-3c17-5ff3-bfa5-c8701b0a8339', 2, 'Yetkazib berish', 'Tumanlarga transport va yuk tashish', 5000000);

insert into public.milestones (id, project_id, position, title, description, target_label, release_percent)
values
  ('ae8f8a67-b36d-5492-8b9f-a46dc5e36ba7', '6dc99f3f-7cb2-5121-8afc-4d26714746a3', 0, 'Poydevor va karkas', 'Hovlini tekislash, poydevor quyish, karkasni oʻrnatish.', '1-oy', 45),
  ('4edf69fe-a6e8-582f-a1a2-a528b2e79a88', '6dc99f3f-7cb2-5121-8afc-4d26714746a3', 1, 'Sugʻorish va isitish', 'Tomchilatib sugʻorish va isitish tizimini ulash.', '2-oy', 35),
  ('a784e95a-f338-5ea8-9277-f3b995f9e992', '6dc99f3f-7cb2-5121-8afc-4d26714746a3', 2, 'Birinchi ekin va darslar', 'Birinchi koʻchatlarni ekish, bolalar uchun darslarni boshlash.', '3-oy', 20),
  ('22639bcb-5069-5fc1-a1d2-31a76670d130', 'c86eff9c-1df6-544e-bcfd-a1868091e78a', 0, 'Dastgohlar va xona', 'Dastgohlarni sotib olish va oʻquv xonasini jihozlash.', '1-oy', 50),
  ('fd56af3d-3bed-5d2f-ab62-c32ce0faec83', 'c86eff9c-1df6-544e-bcfd-a1868091e78a', 1, 'Birinchi guruh', 'Birinchi 20 nafar ayol bilan darslarni boshlash.', '2-oy', 30),
  ('4a7f58a2-c43c-5315-8486-b8f1f4d4b893', 'c86eff9c-1df6-544e-bcfd-a1868091e78a', 2, 'Ikkinchi guruh va bitiruv', 'Ikkinchi guruh, bitiruv koʻrgazmasi va dastgohlarni topshirish.', '6-oy', 20),
  ('6365bffe-12c7-54ec-9ba2-0e47e6e079f4', '58b724c9-3c17-5ff3-bfa5-c8701b0a8339', 0, 'Birinchi 200 ta toʻplam', 'Mahsulot xaridi va birinchi 200 oilaga tarqatish.', 'dekabr', 50),
  ('e3fa16e1-6fea-5c83-b232-444200fa4199', '58b724c9-3c17-5ff3-bfa5-c8701b0a8339', 1, 'Qolgan 200 ta toʻplam', 'Ikkinchi xarid va qolgan oilalarga tarqatish.', 'yanvar', 50);

insert into public.evaluations
  (project_id, business_plan_score, team_score, market_score, financial_score, risk_score, confidence, summary,
   strengths, risks, is_published, evaluated_by, evaluated_at)
values
  ('6dc99f3f-7cb2-5121-8afc-4d26714746a3', 18, 19, 17, 18, 18, 'high', 'Mehribonlik uyi bilan hamkorlik xati va hovli maydoni tekshirildi. Byudjet bozor narxlariga mos.', array['Jamgʻarma 9 yildan beri shu uy bilan ishlaydi', 'Hosil oshxonaga ketadi, ortiqchasi uyga daromad beradi'], array['Qishda isitish xarajati oshishi mumkin'], true, null, now() - interval '14 days'),
  ('c86eff9c-1df6-544e-bcfd-a1868091e78a', 19, 20, 18, 18, 19, 'high', 'NNT maqomi va oʻquv xonasi ijarasi tekshirildi. Murabbiylarning ishlari koʻrib chiqildi.', array['Rahbar 15 yillik tajribaga ega usta', 'Bitiruvchilarga buyurtma bilan ish beriladi'], array['Transport baʼzi oʻquvchilar uchun qiyin'], true, null, now() - interval '22 days'),
  ('58b724c9-3c17-5ff3-bfa5-c8701b0a8339', 17, 18, 18, 17, 18, 'high', 'Oilalar roʻyxati mahalla yigʻinlari bilan solishtirildi. Narxlar ulgurji bozor narxlariga mos.', array['Roʻyxat mahalla bilan birga tuzilgan', 'Har bir toʻplam narxi ochiq hisoblangan'], array['Narx oshsa, toʻplamlar soni kamayishi mumkin'], true, null, now() - interval '8 days');

-- Simulated donations (they add up to each project's raised_amount)
insert into public.contributions (id, project_id, backer_id, amount, reward_tier_id, payment_method, equity_share_pct, created_at)
values
  ('151cbcda-e905-5356-b195-6e6046972931', '6dc99f3f-7cb2-5121-8afc-4d26714746a3', '46a5a2d6-555e-4957-a757-98ec069fe910', 230000, null, 'click', null, now() - interval '8192 minutes'),
  ('7ae277fc-9b10-561a-855b-b29a00fd9b3e', '6dc99f3f-7cb2-5121-8afc-4d26714746a3', '4d5264fb-f76a-40d1-af78-bc94d2674000', 2810000, null, 'click', null, now() - interval '16815 minutes'),
  ('73c832c4-7772-595a-8c66-ddda2fa29b43', '6dc99f3f-7cb2-5121-8afc-4d26714746a3', '2bb09c9a-af67-43bb-ab16-cbb313891a1e', 90000, null, 'click', null, now() - interval '7534 minutes'),
  ('abd69c09-3168-568d-b092-fdc14577a62b', '6dc99f3f-7cb2-5121-8afc-4d26714746a3', '2575b78c-bd03-4862-ad63-74245bb9b3d9', 200000, null, 'click', null, now() - interval '7365 minutes'),
  ('649808ff-2035-5004-992e-6f189c2208fe', '6dc99f3f-7cb2-5121-8afc-4d26714746a3', '77794def-1761-46c5-ac98-d0a8a32f881e', 130000, null, 'click', null, now() - interval '11131 minutes'),
  ('35ecf9a3-28f7-5a80-b0ae-1a15bb715498', '6dc99f3f-7cb2-5121-8afc-4d26714746a3', 'd2414282-e020-448a-a4d1-310a3300571e', 250000, null, 'payme', null, now() - interval '15092 minutes'),
  ('0e2f5cea-3ab4-5fec-90e4-89957b850c99', '6dc99f3f-7cb2-5121-8afc-4d26714746a3', '47ec018a-4bd3-4b24-a856-4ffd95e26d37', 490000, null, 'payme', null, now() - interval '6937 minutes'),
  ('107ac043-f52b-5916-977a-9702f2b67b15', '6dc99f3f-7cb2-5121-8afc-4d26714746a3', '1c212dc7-fec4-4752-afeb-fb8df9846570', 100000, null, 'uzcard', null, now() - interval '8099 minutes'),
  ('26ed62f3-2c04-5851-8e4b-c759427bd06e', '6dc99f3f-7cb2-5121-8afc-4d26714746a3', '06078fa3-7d1b-46dc-a2e4-c745818c795a', 1190000, null, 'humo', null, now() - interval '5041 minutes'),
  ('11b9ea16-0f11-5698-aeaa-6f220fbf91ec', '6dc99f3f-7cb2-5121-8afc-4d26714746a3', '588005da-2905-425a-ae66-61316a782823', 210000, null, 'humo', null, now() - interval '12097 minutes'),
  ('5f556c67-cac7-5d6e-8ef1-bff4b9961462', '6dc99f3f-7cb2-5121-8afc-4d26714746a3', '09b0e645-064d-4381-a5c1-2c11183712d3', 480000, null, 'click', null, now() - interval '11867 minutes'),
  ('48fd26ec-182b-5328-bef5-c4f8c1596b96', '6dc99f3f-7cb2-5121-8afc-4d26714746a3', '9837d566-61b8-4f5e-a6d3-33ffdf45ce8e', 560000, null, 'payme', null, now() - interval '11888 minutes'),
  ('fa9480a0-fcbc-5ed7-9d34-58e41a73466c', '6dc99f3f-7cb2-5121-8afc-4d26714746a3', 'c6061c76-0539-48f3-aaaf-0e2907ec7328', 230000, null, 'payme', null, now() - interval '16771 minutes'),
  ('a725c66d-88c6-5dec-9961-f33e7ec41168', '6dc99f3f-7cb2-5121-8afc-4d26714746a3', '623b4eb8-d197-4002-a65c-996875431fab', 120000, null, 'humo', null, now() - interval '5440 minutes'),
  ('aa9ecad3-2b73-527e-b3a3-01502e92c5a3', '6dc99f3f-7cb2-5121-8afc-4d26714746a3', '911aa87c-6169-4791-a923-c83eb9c5f978', 190000, null, 'humo', null, now() - interval '84 minutes'),
  ('ce2137c4-47c2-50d3-bd7b-826ce61928a2', '6dc99f3f-7cb2-5121-8afc-4d26714746a3', '6a751648-6f04-48b0-ae3e-3a1c8cc3f4c6', 620000, null, 'payme', null, now() - interval '9647 minutes'),
  ('98d52fd5-73c9-5443-bba7-62043cea976b', '6dc99f3f-7cb2-5121-8afc-4d26714746a3', 'fd69bb22-d183-48c0-a0a8-34e685751bf6', 110000, null, 'click', null, now() - interval '14457 minutes'),
  ('1c0e1372-84c1-518e-8c75-fca9d8eb0dd0', '6dc99f3f-7cb2-5121-8afc-4d26714746a3', '2c31541c-e0ff-445f-a011-58eaced6ef4a', 1750000, null, 'uzcard', null, now() - interval '744 minutes'),
  ('0eb674ce-97db-5359-a598-84ac5878fc78', '6dc99f3f-7cb2-5121-8afc-4d26714746a3', '70592a76-79cd-48c1-a50c-92cca1e6f73b', 440000, null, 'click', null, now() - interval '8068 minutes'),
  ('b51a4cc1-d195-598a-a82d-869cac476484', '6dc99f3f-7cb2-5121-8afc-4d26714746a3', '4f826160-c990-4afc-aac9-3324314bd02b', 3150000, null, 'payme', null, now() - interval '7767 minutes'),
  ('1c04b100-14f8-591d-ada4-36d206a82a9e', '6dc99f3f-7cb2-5121-8afc-4d26714746a3', 'd1dba897-4360-4b98-a30b-7604794f3983', 170000, null, 'click', null, now() - interval '8946 minutes'),
  ('a27fe1b3-6bd1-557b-9392-0b96d7d3dbf3', '6dc99f3f-7cb2-5121-8afc-4d26714746a3', 'ed6f9399-f49c-4bce-a9da-bbeb14874c21', 920000, null, 'payme', null, now() - interval '9903 minutes'),
  ('4f4cb9dc-2dfb-5bf1-b87f-bff39247c1c7', '6dc99f3f-7cb2-5121-8afc-4d26714746a3', 'c429b3e6-ea95-44a4-ada8-8a8611dc2f1e', 500000, null, 'uzcard', null, now() - interval '1370 minutes'),
  ('4f3a8bb9-bc96-5ed3-a088-d3ff9e8c414b', '6dc99f3f-7cb2-5121-8afc-4d26714746a3', 'd2a323f9-e2d5-44fe-aaac-76c8e3b4c466', 110000, null, 'click', null, now() - interval '17220 minutes'),
  ('069a54d6-b9f7-5797-b1cf-e49de12425d0', '6dc99f3f-7cb2-5121-8afc-4d26714746a3', '28ecdec8-e62d-4818-abda-a3a84e388a90', 330000, null, 'payme', null, now() - interval '11979 minutes'),
  ('1df326f7-0689-56b3-84cb-c88d5a02801a', '6dc99f3f-7cb2-5121-8afc-4d26714746a3', '60009ad6-94cb-48f8-ad86-a0633f892646', 1270000, null, 'click', null, now() - interval '8150 minutes'),
  ('f36f8e30-01a6-5497-b5e8-424de3c173b5', '6dc99f3f-7cb2-5121-8afc-4d26714746a3', '56df55e6-dfb6-4f5d-afcf-e2acac688dcd', 120000, null, 'payme', null, now() - interval '13005 minutes'),
  ('79e892e4-d186-5db1-869d-2d3a20b3a75b', '6dc99f3f-7cb2-5121-8afc-4d26714746a3', 'dc396389-1736-45b0-a4a5-f2e88e3339d7', 3450000, null, 'click', null, now() - interval '5914 minutes'),
  ('a5401b39-c8c3-5e21-a879-7986c1951933', '6dc99f3f-7cb2-5121-8afc-4d26714746a3', '163869bb-e972-4833-aacc-14d987b600c9', 170000, null, 'humo', null, now() - interval '10561 minutes'),
  ('07190fc5-cfa7-5851-b4d2-a9bd71caf4bf', '6dc99f3f-7cb2-5121-8afc-4d26714746a3', '6ab2452a-ab5e-4ed4-af9c-41628aa94826', 130000, null, 'payme', null, now() - interval '7503 minutes'),
  ('c49e94c2-26c1-5ae1-8189-5086fdbf451e', '6dc99f3f-7cb2-5121-8afc-4d26714746a3', 'd558ae35-7c11-4541-a10a-2a35348844b6', 110000, null, 'humo', null, now() - interval '6665 minutes'),
  ('5d706c2b-9f33-5283-be88-7f67596353f4', '6dc99f3f-7cb2-5121-8afc-4d26714746a3', 'f4f336c7-fab5-49a6-ad51-25abd3549190', 120000, null, 'uzcard', null, now() - interval '6887 minutes'),
  ('7aff2977-8ea3-5d83-9785-4706890bbd12', '6dc99f3f-7cb2-5121-8afc-4d26714746a3', '9c9f5cfa-e5e0-4d3d-aa2c-25d0e6c7c2fa', 560000, null, 'click', null, now() - interval '3032 minutes'),
  ('135728b2-8094-5d65-9752-3ca12702d3b9', '6dc99f3f-7cb2-5121-8afc-4d26714746a3', '6bc3403a-a500-49fe-a029-7a5522369342', 120000, null, 'payme', null, now() - interval '8884 minutes'),
  ('9ca241a2-6b63-50e8-bb1c-e4786959f232', '6dc99f3f-7cb2-5121-8afc-4d26714746a3', 'efa25e2e-904e-44fb-adf5-2cb7654a4f57', 1290000, null, 'click', null, now() - interval '12818 minutes'),
  ('6fa5ebaa-c9cd-5603-8193-65a8d5488257', '6dc99f3f-7cb2-5121-8afc-4d26714746a3', 'ab79dff8-144b-43fc-a443-7a76ed7f2f27', 190000, null, 'click', null, now() - interval '8156 minutes'),
  ('171503c2-e99c-59a8-a520-b9b39e26ee09', '6dc99f3f-7cb2-5121-8afc-4d26714746a3', '089c2ed4-dfb2-4ef8-a1e4-20ab263ada9d', 100000, null, 'uzcard', null, now() - interval '6738 minutes'),
  ('3524b390-d9c8-59a6-993c-72578078ccba', '6dc99f3f-7cb2-5121-8afc-4d26714746a3', '186a0a2d-4dec-48bc-a503-554196bf63dd', 1080000, null, 'payme', null, now() - interval '11434 minutes'),
  ('f75c00f3-2ff5-5b4b-a0dd-e7f2d6aa9d70', '6dc99f3f-7cb2-5121-8afc-4d26714746a3', '82ca6dee-3e78-4e0c-a165-fa0d6978608d', 600000, null, 'click', null, now() - interval '12948 minutes'),
  ('7f8e0df3-74c8-5506-8cfe-679b9a894d6e', '6dc99f3f-7cb2-5121-8afc-4d26714746a3', 'f8a26fdb-6b48-46e7-a016-7cf7a5ae6657', 190000, null, 'payme', null, now() - interval '15186 minutes'),
  ('8fcd9d2c-8868-5433-a62f-885795a18bfe', '6dc99f3f-7cb2-5121-8afc-4d26714746a3', '12313c7f-d7b3-4147-a8e8-17ae0f567110', 230000, null, 'uzcard', null, now() - interval '14450 minutes'),
  ('5cf4d61c-1a89-55ec-ba97-60f0aabb36f5', '6dc99f3f-7cb2-5121-8afc-4d26714746a3', '10a297f9-3d9a-4bac-a261-045189545ad0', 2560000, null, 'payme', null, now() - interval '10959 minutes'),
  ('d6558006-75b6-5a4b-b225-9f50fe633b1a', '6dc99f3f-7cb2-5121-8afc-4d26714746a3', '90d25171-7d11-4e71-a03c-599f93c75e16', 190000, null, 'click', null, now() - interval '16606 minutes'),
  ('62cb859e-b68d-5212-bd7e-898b206881c4', '6dc99f3f-7cb2-5121-8afc-4d26714746a3', '0e1e9087-bfa4-49d7-a2d1-4b43151722f3', 100000, null, 'click', null, now() - interval '2998 minutes'),
  ('664d52f4-c5cb-55fa-b5a0-4964f1b599db', '6dc99f3f-7cb2-5121-8afc-4d26714746a3', 'dfd9caf8-b3e6-4cc3-a31b-1c9cf6755a49', 90000, null, 'payme', null, now() - interval '11196 minutes'),
  ('2f031bff-8ac2-546d-abc8-5475185a27b1', '6dc99f3f-7cb2-5121-8afc-4d26714746a3', '0a4dffa8-7df5-4d68-a358-0ade4dc5458d', 240000, null, 'click', null, now() - interval '2867 minutes'),
  ('9257f50f-bd53-5030-96aa-e7276ca8acaf', '6dc99f3f-7cb2-5121-8afc-4d26714746a3', 'd5c557bc-26dc-4523-abb2-c8e8826de8a8', 530000, null, 'payme', null, now() - interval '10804 minutes'),
  ('81038018-eed3-5d56-ad4d-7c8af813c17d', '6dc99f3f-7cb2-5121-8afc-4d26714746a3', '34a77526-2976-48c7-a7d2-96bb4cca0830', 110000, null, 'payme', null, now() - interval '8486 minutes'),
  ('bb388056-291d-5d9e-8b60-047be2309f9c', '6dc99f3f-7cb2-5121-8afc-4d26714746a3', '0913607e-bb9c-45e5-ae13-e67daebf1061', 110000, null, 'uzcard', null, now() - interval '5840 minutes'),
  ('7a61b00f-9817-5be5-a680-12713ae933de', '6dc99f3f-7cb2-5121-8afc-4d26714746a3', '51de0787-6fe1-4e7c-ab99-042c42777453', 620000, null, 'payme', null, now() - interval '7963 minutes'),
  ('e17e65bb-a0f4-5abb-b583-37e1b7e5f86c', '6dc99f3f-7cb2-5121-8afc-4d26714746a3', '740fe0d5-202c-4ac9-aeeb-bbec1eb542cf', 830000, null, 'humo', null, now() - interval '6071 minutes'),
  ('9ffc7a97-27a9-5939-b2b0-c97e46586dd7', '6dc99f3f-7cb2-5121-8afc-4d26714746a3', '7fee0e3c-ed61-46c7-ad6c-09b2a0b90625', 230000, null, 'uzcard', null, now() - interval '14509 minutes'),
  ('6a8032fa-b0f5-5a49-aeb2-242d79ac9dcc', 'c86eff9c-1df6-544e-bcfd-a1868091e78a', 'efa25e2e-904e-44fb-adf5-2cb7654a4f57', 1050000, null, 'payme', null, now() - interval '12546 minutes'),
  ('824d2ff0-10cc-58c5-b20a-2afa65875dc2', 'c86eff9c-1df6-544e-bcfd-a1868091e78a', '623b4eb8-d197-4002-a65c-996875431fab', 1560000, null, 'click', null, now() - interval '25514 minutes'),
  ('e7dbb6d0-e8a6-5113-a551-1e5658bf5c7f', 'c86eff9c-1df6-544e-bcfd-a1868091e78a', 'd1dba897-4360-4b98-a30b-7604794f3983', 1180000, null, 'payme', null, now() - interval '27748 minutes'),
  ('e934228a-54b3-5679-926b-e0e48529dbcf', 'c86eff9c-1df6-544e-bcfd-a1868091e78a', '003732f7-1301-4a66-ac3f-9c74e208a75d', 60000, null, 'click', null, now() - interval '21933 minutes'),
  ('5dc18628-f573-5c5a-b374-f630e6f51afc', 'c86eff9c-1df6-544e-bcfd-a1868091e78a', '611e69a0-e1a3-4382-a61e-f19e8aec4205', 1610000, null, 'payme', null, now() - interval '5484 minutes'),
  ('aa7a60d8-644a-5033-a48d-e74532881402', 'c86eff9c-1df6-544e-bcfd-a1868091e78a', '9a4c5a46-89da-4b36-ac03-9711c582ff46', 250000, null, 'humo', null, now() - interval '10536 minutes'),
  ('d0dc953a-b750-591b-8253-bb4c2b36db5f', 'c86eff9c-1df6-544e-bcfd-a1868091e78a', 'b9799643-12e2-494f-af5b-1603cc42708d', 300000, null, 'uzcard', null, now() - interval '10206 minutes'),
  ('2612cc90-2f74-5454-82bf-a87ed2addb06', 'c86eff9c-1df6-544e-bcfd-a1868091e78a', '28ecdec8-e62d-4818-abda-a3a84e388a90', 60000, null, 'payme', null, now() - interval '23295 minutes'),
  ('ff215869-993a-59b2-a662-965fb68a1650', 'c86eff9c-1df6-544e-bcfd-a1868091e78a', '0a15a1a4-369d-4531-ac57-75f068d1373b', 60000, null, 'click', null, now() - interval '12375 minutes'),
  ('df59967b-4442-5603-93e2-dba40155afcd', 'c86eff9c-1df6-544e-bcfd-a1868091e78a', '6a751648-6f04-48b0-ae3e-3a1c8cc3f4c6', 200000, null, 'click', null, now() - interval '10191 minutes'),
  ('f063e224-8572-5165-8367-07cfb7e96a96', 'c86eff9c-1df6-544e-bcfd-a1868091e78a', 'dfd9caf8-b3e6-4cc3-a31b-1c9cf6755a49', 90000, null, 'uzcard', null, now() - interval '12179 minutes'),
  ('4002143a-d34b-573e-88a1-67ae6795de2a', 'c86eff9c-1df6-544e-bcfd-a1868091e78a', 'f7b0f35d-bb24-4511-a528-354c3ddfb033', 590000, null, 'click', null, now() - interval '16482 minutes'),
  ('48b16a53-26eb-55c2-9eee-a2dd6e44f0b7', 'c86eff9c-1df6-544e-bcfd-a1868091e78a', '588005da-2905-425a-ae66-61316a782823', 1140000, null, 'click', null, now() - interval '5218 minutes'),
  ('8a143222-63a3-5329-a5d6-0d82b8882980', 'c86eff9c-1df6-544e-bcfd-a1868091e78a', '4f826160-c990-4afc-aac9-3324314bd02b', 40000, null, 'uzcard', null, now() - interval '1900 minutes'),
  ('054d77d9-eca9-55ad-8dc1-414fe2b74a90', 'c86eff9c-1df6-544e-bcfd-a1868091e78a', '911aa87c-6169-4791-a923-c83eb9c5f978', 50000, null, 'payme', null, now() - interval '19794 minutes'),
  ('c5a282ea-ef5d-5a47-bf60-252593ab562a', 'c86eff9c-1df6-544e-bcfd-a1868091e78a', '3a3dcdc2-a25d-4f40-afe0-e147bee2a306', 200000, null, 'click', null, now() - interval '25781 minutes'),
  ('1fc0443c-17f2-562f-b1a0-3b6fd5cecaf8', 'c86eff9c-1df6-544e-bcfd-a1868091e78a', '77794def-1761-46c5-ac98-d0a8a32f881e', 60000, null, 'uzcard', null, now() - interval '3406 minutes'),
  ('851a5be5-e4cb-5eaf-a2bb-a0f8e444dabe', 'c86eff9c-1df6-544e-bcfd-a1868091e78a', '10a297f9-3d9a-4bac-a261-045189545ad0', 1630000, null, 'uzcard', null, now() - interval '21360 minutes'),
  ('42ea6793-6a03-5f43-ba2f-6793a365f76d', 'c86eff9c-1df6-544e-bcfd-a1868091e78a', '12313c7f-d7b3-4147-a8e8-17ae0f567110', 250000, null, 'humo', null, now() - interval '5814 minutes'),
  ('e52ce05e-2408-53e1-bf75-66d4ba86c834', 'c86eff9c-1df6-544e-bcfd-a1868091e78a', '37a6516a-2214-4142-a328-ea46085196f8', 990000, null, 'payme', null, now() - interval '14207 minutes'),
  ('ccd6449f-f5a2-55dd-b446-95f2e3b05ccf', 'c86eff9c-1df6-544e-bcfd-a1868091e78a', '51de0787-6fe1-4e7c-ab99-042c42777453', 570000, null, 'uzcard', null, now() - interval '14334 minutes'),
  ('521ddf0f-6635-5ef4-a692-ba817c2123dd', 'c86eff9c-1df6-544e-bcfd-a1868091e78a', '23374980-e34c-4f3c-a688-1dcf24d1af52', 1890000, null, 'uzcard', null, now() - interval '12090 minutes'),
  ('77b6e28a-aaf8-5697-b9e5-8f298eda587f', 'c86eff9c-1df6-544e-bcfd-a1868091e78a', '4d5264fb-f76a-40d1-af78-bc94d2674000', 50000, null, 'humo', null, now() - interval '21146 minutes'),
  ('c53f1aae-40cb-5195-89d1-f77e22293720', 'c86eff9c-1df6-544e-bcfd-a1868091e78a', '186a0a2d-4dec-48bc-a503-554196bf63dd', 1460000, null, 'payme', null, now() - interval '23889 minutes'),
  ('118c5e68-baf9-5a7e-b8fb-296462daa1f5', 'c86eff9c-1df6-544e-bcfd-a1868091e78a', '2691ae49-8c6f-4207-a545-63b70cf99d47', 60000, null, 'click', null, now() - interval '12931 minutes'),
  ('71db6557-40d0-5ba3-b54d-a8d733ff9721', 'c86eff9c-1df6-544e-bcfd-a1868091e78a', '2bb09c9a-af67-43bb-ab16-cbb313891a1e', 110000, null, 'payme', null, now() - interval '4562 minutes'),
  ('d2df7e87-79e8-5a33-af88-73d5c60f6c2c', 'c86eff9c-1df6-544e-bcfd-a1868091e78a', '0913607e-bb9c-45e5-ae13-e67daebf1061', 60000, null, 'humo', null, now() - interval '5560 minutes'),
  ('017c126a-c5eb-5354-8120-1b26e4004189', 'c86eff9c-1df6-544e-bcfd-a1868091e78a', '7448a15f-9afe-4b7e-a98d-98ce0a779a7e', 230000, null, 'uzcard', null, now() - interval '27780 minutes'),
  ('0d3a8d16-7977-5df4-99c5-80f44ae84092', 'c86eff9c-1df6-544e-bcfd-a1868091e78a', 'c93338c4-2c27-43cc-a917-e750eff06b6c', 50000, null, 'uzcard', null, now() - interval '4463 minutes'),
  ('66888dc8-9149-5806-bc2e-c8f2300e0625', 'c86eff9c-1df6-544e-bcfd-a1868091e78a', '76c0bff0-8c5e-4670-a55a-c72a6db96dc8', 240000, null, 'payme', null, now() - interval '27745 minutes'),
  ('cc6610f3-53d8-5b34-8937-8737f0b21528', 'c86eff9c-1df6-544e-bcfd-a1868091e78a', 'dc396389-1736-45b0-a4a5-f2e88e3339d7', 50000, null, 'click', null, now() - interval '13871 minutes'),
  ('d0269c48-5c4d-50c6-855b-21e3304ffd9d', 'c86eff9c-1df6-544e-bcfd-a1868091e78a', '1c7481bf-bbb4-444f-ad4d-2cbf03f09a05', 60000, null, 'uzcard', null, now() - interval '14839 minutes'),
  ('5a186ac4-1e3b-50bf-990c-2deb9d29f869', 'c86eff9c-1df6-544e-bcfd-a1868091e78a', '34a77526-2976-48c7-a7d2-96bb4cca0830', 130000, null, 'payme', null, now() - interval '23344 minutes'),
  ('d93717a7-a3ef-5540-bcb4-f4d82b257b8f', 'c86eff9c-1df6-544e-bcfd-a1868091e78a', 'c6061c76-0539-48f3-aaaf-0e2907ec7328', 1810000, null, 'payme', null, now() - interval '4457 minutes'),
  ('0ab701ab-1bcb-5da4-9320-1a188673bc62', 'c86eff9c-1df6-544e-bcfd-a1868091e78a', '0e1e9087-bfa4-49d7-a2d1-4b43151722f3', 100000, null, 'payme', null, now() - interval '15085 minutes'),
  ('a7fdc10b-41fc-5092-8ddf-5c8a16c2bde6', 'c86eff9c-1df6-544e-bcfd-a1868091e78a', '509e5294-be0e-4a69-a727-5f2f8f17a0a9', 630000, null, 'click', null, now() - interval '12734 minutes'),
  ('1cb089f8-5a23-5e81-960b-6181f6a0bd9b', 'c86eff9c-1df6-544e-bcfd-a1868091e78a', '82ca6dee-3e78-4e0c-a165-fa0d6978608d', 110000, null, 'uzcard', null, now() - interval '18292 minutes'),
  ('e5121625-d34d-59de-88cc-26b75b895bba', 'c86eff9c-1df6-544e-bcfd-a1868091e78a', '9837d566-61b8-4f5e-a6d3-33ffdf45ce8e', 130000, null, 'click', null, now() - interval '22954 minutes'),
  ('4e5b7e66-e06c-5f0c-ba60-b5d04b3e154f', 'c86eff9c-1df6-544e-bcfd-a1868091e78a', 'd2a323f9-e2d5-44fe-aaac-76c8e3b4c466', 130000, null, 'payme', null, now() - interval '19576 minutes'),
  ('66e97cf0-f863-5259-8ab2-fcacff89ba29', 'c86eff9c-1df6-544e-bcfd-a1868091e78a', '163869bb-e972-4833-aacc-14d987b600c9', 220000, null, 'humo', null, now() - interval '21661 minutes'),
  ('8402d6a2-1a48-5117-9cb8-c9c33ecb3312', 'c86eff9c-1df6-544e-bcfd-a1868091e78a', '1b807681-1ea7-4014-ae10-3f717fd293a4', 120000, null, 'uzcard', null, now() - interval '5689 minutes'),
  ('3385640f-bf0e-5a20-9017-128f583533a4', 'c86eff9c-1df6-544e-bcfd-a1868091e78a', '90d25171-7d11-4e71-a03c-599f93c75e16', 250000, null, 'click', null, now() - interval '27001 minutes'),
  ('81aa666e-80af-5597-92a3-96ae4fa058d8', 'c86eff9c-1df6-544e-bcfd-a1868091e78a', 'd2414282-e020-448a-a4d1-310a3300571e', 210000, null, 'uzcard', null, now() - interval '23337 minutes'),
  ('724d57af-0b09-5341-8ccf-94ace9d2619c', 'c86eff9c-1df6-544e-bcfd-a1868091e78a', '8fd8799b-afe2-4369-aa92-08d6233ebb38', 50000, null, 'click', null, now() - interval '19357 minutes'),
  ('3d5727db-a324-592d-823b-36d604587347', 'c86eff9c-1df6-544e-bcfd-a1868091e78a', '98cc769d-fc42-489c-a7e9-d49d2da9b314', 1170000, null, 'click', null, now() - interval '23129 minutes'),
  ('34e16386-5bd0-54be-896a-8c5cc395247e', 'c86eff9c-1df6-544e-bcfd-a1868091e78a', 'df4f201e-7b88-4c9d-ac14-ae4fcf24c2a8', 120000, null, 'click', null, now() - interval '14445 minutes'),
  ('941d886e-2552-5b02-8714-a3ecb23b90ae', 'c86eff9c-1df6-544e-bcfd-a1868091e78a', '7fee0e3c-ed61-46c7-ad6c-09b2a0b90625', 1720000, null, 'click', null, now() - interval '7182 minutes'),
  ('0c099a14-fe6d-5453-b7e9-8253010161d0', 'c86eff9c-1df6-544e-bcfd-a1868091e78a', '6ab2452a-ab5e-4ed4-af9c-41628aa94826', 300000, null, 'click', null, now() - interval '23299 minutes'),
  ('8adfad80-7406-5c55-bca8-98e3fc7e56ab', 'c86eff9c-1df6-544e-bcfd-a1868091e78a', '089c2ed4-dfb2-4ef8-a1e4-20ab263ada9d', 120000, null, 'payme', null, now() - interval '13246 minutes'),
  ('4f9fd9c4-e9a6-5c86-a349-829925a9a02c', 'c86eff9c-1df6-544e-bcfd-a1868091e78a', '06078fa3-7d1b-46dc-a2e4-c745818c795a', 210000, null, 'payme', null, now() - interval '22062 minutes'),
  ('83d46161-3c22-565c-a0f6-9039e29ee6a2', 'c86eff9c-1df6-544e-bcfd-a1868091e78a', '70592a76-79cd-48c1-a50c-92cca1e6f73b', 150000, null, 'click', null, now() - interval '19092 minutes'),
  ('d97eafb6-d31e-5dcb-bcda-b0e44d9bf638', 'c86eff9c-1df6-544e-bcfd-a1868091e78a', '03630be7-c283-4bb7-aca8-10f5c301c485', 50000, null, 'click', null, now() - interval '17936 minutes'),
  ('101bc2e5-5d5b-56b8-83b7-3366d9c1c213', 'c86eff9c-1df6-544e-bcfd-a1868091e78a', '09b0e645-064d-4381-a5c1-2c11183712d3', 220000, null, 'payme', null, now() - interval '23592 minutes'),
  ('baf8105e-629c-509c-8be4-89d09ab7e5c3', 'c86eff9c-1df6-544e-bcfd-a1868091e78a', '8d85a241-20cd-41ad-ae08-d808715ebd15', 260000, null, 'payme', null, now() - interval '21876 minutes'),
  ('9926e319-2dfb-5276-9634-412fb708a4b8', 'c86eff9c-1df6-544e-bcfd-a1868091e78a', 'fd69bb22-d183-48c0-a0a8-34e685751bf6', 60000, null, 'payme', null, now() - interval '10983 minutes'),
  ('003fe380-6203-5870-84fe-3fae07a341ba', 'c86eff9c-1df6-544e-bcfd-a1868091e78a', '1c212dc7-fec4-4752-afeb-fb8df9846570', 890000, null, 'payme', null, now() - interval '16147 minutes'),
  ('5d3bb02c-a6f4-53bd-92b5-4cb106594f11', 'c86eff9c-1df6-544e-bcfd-a1868091e78a', '7ac6cb80-fee7-4635-af2b-c9e6b4e9be77', 60000, null, 'uzcard', null, now() - interval '25058 minutes'),
  ('54eac80a-2ebe-519a-8ee5-97fc71a3ad52', 'c86eff9c-1df6-544e-bcfd-a1868091e78a', 'ab79dff8-144b-43fc-a443-7a76ed7f2f27', 200000, null, 'payme', null, now() - interval '27158 minutes'),
  ('1cb414ab-a891-5c34-bbe9-12ede8c7d0dc', 'c86eff9c-1df6-544e-bcfd-a1868091e78a', '740fe0d5-202c-4ac9-aeeb-bbec1eb542cf', 110000, null, 'click', null, now() - interval '26822 minutes'),
  ('323a6a22-2e45-58f2-9e6e-994ac684483e', 'c86eff9c-1df6-544e-bcfd-a1868091e78a', 'd053e9cc-475b-4cd4-a349-b8b6feaade8d', 280000, null, 'payme', null, now() - interval '1277 minutes'),
  ('f74850a6-042a-5302-981b-748776413dc3', 'c86eff9c-1df6-544e-bcfd-a1868091e78a', 'f8a26fdb-6b48-46e7-a016-7cf7a5ae6657', 800000, null, 'payme', null, now() - interval '14100 minutes'),
  ('6fbed8cb-6f77-57d8-9a01-2dc26af7e871', 'c86eff9c-1df6-544e-bcfd-a1868091e78a', '07e9aa6f-17f5-4a93-a150-c345d247683c', 310000, null, 'click', null, now() - interval '26262 minutes'),
  ('333dca98-5846-55a7-8bf0-c15d28cb7e37', 'c86eff9c-1df6-544e-bcfd-a1868091e78a', '56df55e6-dfb6-4f5d-afcf-e2acac688dcd', 60000, null, 'payme', null, now() - interval '10786 minutes'),
  ('3daec993-51bb-5078-9848-a9a76b3dc1db', 'c86eff9c-1df6-544e-bcfd-a1868091e78a', '56072666-73ef-45cb-ab6d-6fd5d63f2d04', 60000, null, 'humo', null, now() - interval '23427 minutes'),
  ('310ee2e1-a2c4-5746-b636-ec363c43fd94', 'c86eff9c-1df6-544e-bcfd-a1868091e78a', '18675401-98f9-4d56-a09d-8810e7eac494', 520000, null, 'humo', null, now() - interval '14359 minutes'),
  ('e4b2df7f-d663-5c89-91a1-13fa21115799', 'c86eff9c-1df6-544e-bcfd-a1868091e78a', '2c31541c-e0ff-445f-a011-58eaced6ef4a', 1280000, null, 'payme', null, now() - interval '28089 minutes'),
  ('466a4bdf-5e7f-559c-a524-d9505afead35', 'c86eff9c-1df6-544e-bcfd-a1868091e78a', '47ec018a-4bd3-4b24-a856-4ffd95e26d37', 120000, null, 'click', null, now() - interval '26299 minutes'),
  ('4d490862-2607-571c-a58b-6b4ba30a7638', '58b724c9-3c17-5ff3-bfa5-c8701b0a8339', '8d85a241-20cd-41ad-ae08-d808715ebd15', 140000, null, 'humo', null, now() - interval '3904 minutes'),
  ('3c07566c-17ae-56e5-a175-e3eda08ca19a', '58b724c9-3c17-5ff3-bfa5-c8701b0a8339', '186a0a2d-4dec-48bc-a503-554196bf63dd', 330000, null, 'payme', null, now() - interval '1160 minutes'),
  ('a0a09073-a59f-549d-a9a5-773b1d4ae242', '58b724c9-3c17-5ff3-bfa5-c8701b0a8339', '003732f7-1301-4a66-ac3f-9c74e208a75d', 1550000, null, 'click', null, now() - interval '6014 minutes'),
  ('f3133fe5-ffec-547e-b6fe-7101bc9c3843', '58b724c9-3c17-5ff3-bfa5-c8701b0a8339', 'df4f201e-7b88-4c9d-ac14-ae4fcf24c2a8', 140000, null, 'click', null, now() - interval '7226 minutes'),
  ('42ad91d2-0558-5f0c-88b2-0e6d466a36ac', '58b724c9-3c17-5ff3-bfa5-c8701b0a8339', '1c7481bf-bbb4-444f-ad4d-2cbf03f09a05', 160000, null, 'uzcard', null, now() - interval '3149 minutes'),
  ('c27524b0-7a97-5834-b10e-4a666f5c7c3e', '58b724c9-3c17-5ff3-bfa5-c8701b0a8339', '03630be7-c283-4bb7-aca8-10f5c301c485', 820000, null, 'humo', null, now() - interval '5759 minutes'),
  ('9d5d2e64-6bcd-571e-a2c0-c7117ec0d688', '58b724c9-3c17-5ff3-bfa5-c8701b0a8339', '56df55e6-dfb6-4f5d-afcf-e2acac688dcd', 240000, null, 'payme', null, now() - interval '128 minutes'),
  ('f111ee03-32a4-5134-9857-130fa80efc10', '58b724c9-3c17-5ff3-bfa5-c8701b0a8339', 'b8ec5e47-ab48-41cf-a344-cf155a1d9ee7', 150000, null, 'click', null, now() - interval '5104 minutes'),
  ('2cdadecc-d511-561e-a7cf-a79ddb1959d3', '58b724c9-3c17-5ff3-bfa5-c8701b0a8339', '23374980-e34c-4f3c-a688-1dcf24d1af52', 650000, null, 'uzcard', null, now() - interval '7904 minutes'),
  ('8eec2149-a044-5dde-8d98-f92bd6bcd09a', '58b724c9-3c17-5ff3-bfa5-c8701b0a8339', '611e69a0-e1a3-4382-a61e-f19e8aec4205', 390000, null, 'uzcard', null, now() - interval '2465 minutes'),
  ('232a0d8a-3fe7-5b27-95e8-344bde85f86f', '58b724c9-3c17-5ff3-bfa5-c8701b0a8339', '740fe0d5-202c-4ac9-aeeb-bbec1eb542cf', 3110000, null, 'click', null, now() - interval '6570 minutes'),
  ('188cd376-583f-524d-a044-d5019e637f11', '58b724c9-3c17-5ff3-bfa5-c8701b0a8339', '22a23e86-d8fd-48e4-a0e1-0c37a861d8d0', 250000, null, 'click', null, now() - interval '2473 minutes'),
  ('e52b112e-42bc-5f5d-8c26-456d961f6f60', '58b724c9-3c17-5ff3-bfa5-c8701b0a8339', 'dc396389-1736-45b0-a4a5-f2e88e3339d7', 150000, null, 'humo', null, now() - interval '37 minutes'),
  ('b7aba8bd-de5e-546f-847e-1e8b543fe4d0', '58b724c9-3c17-5ff3-bfa5-c8701b0a8339', '10a297f9-3d9a-4bac-a261-045189545ad0', 620000, null, 'click', null, now() - interval '3590 minutes'),
  ('a522be0d-9e5a-589f-b529-34f3c16314d7', '58b724c9-3c17-5ff3-bfa5-c8701b0a8339', '9c9f5cfa-e5e0-4d3d-aa2c-25d0e6c7c2fa', 330000, null, 'humo', null, now() - interval '6444 minutes'),
  ('c65b4ce2-8fa3-56de-9f0d-a8ff6425cc13', '58b724c9-3c17-5ff3-bfa5-c8701b0a8339', '18675401-98f9-4d56-a09d-8810e7eac494', 3460000, null, 'uzcard', null, now() - interval '4030 minutes'),
  ('b1a136bd-39b8-5127-9ec2-74e64bc243ab', '58b724c9-3c17-5ff3-bfa5-c8701b0a8339', 'd2a323f9-e2d5-44fe-aaac-76c8e3b4c466', 130000, null, 'uzcard', null, now() - interval '8212 minutes'),
  ('1d41c35f-c669-519a-966c-958337c74c7b', '58b724c9-3c17-5ff3-bfa5-c8701b0a8339', 'c429b3e6-ea95-44a4-ada8-8a8611dc2f1e', 110000, null, 'click', null, now() - interval '1290 minutes'),
  ('0714a9eb-ceab-5aa4-8721-e0eeeea11cf7', '58b724c9-3c17-5ff3-bfa5-c8701b0a8339', '562e6b0a-4be0-476c-af14-adeac04605b0', 110000, null, 'click', null, now() - interval '3281 minutes'),
  ('4663f089-3781-58fa-9b36-a2a29ac4632e', '58b724c9-3c17-5ff3-bfa5-c8701b0a8339', '0e1e9087-bfa4-49d7-a2d1-4b43151722f3', 740000, null, 'humo', null, now() - interval '6642 minutes'),
  ('7201c6cf-694d-56ab-b3d5-6a54e6b6a759', '58b724c9-3c17-5ff3-bfa5-c8701b0a8339', '0a15a1a4-369d-4531-ac57-75f068d1373b', 320000, null, 'uzcard', null, now() - interval '6687 minutes'),
  ('e1720406-ebb5-5b49-ab8a-33434a07bf46', '58b724c9-3c17-5ff3-bfa5-c8701b0a8339', '509e5294-be0e-4a69-a727-5f2f8f17a0a9', 3400000, null, 'payme', null, now() - interval '3908 minutes'),
  ('34133614-c7c5-5468-989b-8c1db4cc919a', '58b724c9-3c17-5ff3-bfa5-c8701b0a8339', '844c4d0d-7076-4f95-a778-49dca8cd4290', 240000, null, 'click', null, now() - interval '5336 minutes'),
  ('bbd6e4a8-227b-52d0-918d-13729ae66890', '58b724c9-3c17-5ff3-bfa5-c8701b0a8339', '77794def-1761-46c5-ac98-d0a8a32f881e', 680000, null, 'payme', null, now() - interval '6182 minutes'),
  ('62e94e85-ddec-53e9-91f0-c347c08f60fe', '58b724c9-3c17-5ff3-bfa5-c8701b0a8339', '1c212dc7-fec4-4752-afeb-fb8df9846570', 280000, null, 'humo', null, now() - interval '8360 minutes'),
  ('bd354dcf-940d-5ee3-a43c-1ed4a0f12856', '58b724c9-3c17-5ff3-bfa5-c8701b0a8339', '70592a76-79cd-48c1-a50c-92cca1e6f73b', 170000, null, 'payme', null, now() - interval '146 minutes'),
  ('ada55b7c-0b08-5378-b15f-e9deae6149fa', '58b724c9-3c17-5ff3-bfa5-c8701b0a8339', '12313c7f-d7b3-4147-a8e8-17ae0f567110', 360000, null, 'humo', null, now() - interval '2583 minutes'),
  ('4922f36e-f100-53e5-84f5-7caae7e341e2', '58b724c9-3c17-5ff3-bfa5-c8701b0a8339', 'dfd9caf8-b3e6-4cc3-a31b-1c9cf6755a49', 120000, null, 'click', null, now() - interval '8420 minutes'),
  ('f83cfcbe-d938-52df-8f44-76d96092e3be', '58b724c9-3c17-5ff3-bfa5-c8701b0a8339', '90d25171-7d11-4e71-a03c-599f93c75e16', 1130000, null, 'click', null, now() - interval '2973 minutes'),
  ('783280a2-9a61-5cbb-bd20-7316b7359c86', '58b724c9-3c17-5ff3-bfa5-c8701b0a8339', '60009ad6-94cb-48f8-ad86-a0633f892646', 1270000, null, 'humo', null, now() - interval '35 minutes'),
  ('e8800699-ca9d-5dad-9bd7-0f2a4b9d95f1', '58b724c9-3c17-5ff3-bfa5-c8701b0a8339', '51de0787-6fe1-4e7c-ab99-042c42777453', 120000, null, 'payme', null, now() - interval '6158 minutes'),
  ('87e7d0ad-be64-5cf3-91c2-67976f2fbcaf', '58b724c9-3c17-5ff3-bfa5-c8701b0a8339', '98cc769d-fc42-489c-a7e9-d49d2da9b314', 170000, null, 'click', null, now() - interval '8482 minutes'),
  ('eaf00b67-3dab-5388-ba17-8155c469eb3f', '58b724c9-3c17-5ff3-bfa5-c8701b0a8339', '911aa87c-6169-4791-a923-c83eb9c5f978', 330000, null, 'click', null, now() - interval '1497 minutes'),
  ('ce3fedc7-5159-5380-a08a-85b1f38657c8', '58b724c9-3c17-5ff3-bfa5-c8701b0a8339', '9a4c5a46-89da-4b36-ac03-9711c582ff46', 240000, null, 'humo', null, now() - interval '7029 minutes'),
  ('d9fbb70a-7e4b-5f9f-9d90-fc7bfd944b21', '58b724c9-3c17-5ff3-bfa5-c8701b0a8339', 'd053e9cc-475b-4cd4-a349-b8b6feaade8d', 540000, null, 'humo', null, now() - interval '7887 minutes'),
  ('a2a3ecbc-bf81-506d-9be3-b9bfc847ed90', '58b724c9-3c17-5ff3-bfa5-c8701b0a8339', '06078fa3-7d1b-46dc-a2e4-c745818c795a', 230000, null, 'click', null, now() - interval '6854 minutes'),
  ('1cdd813a-ce99-577a-b333-fed5dff949e2', '58b724c9-3c17-5ff3-bfa5-c8701b0a8339', '2575b78c-bd03-4862-ad63-74245bb9b3d9', 3170000, null, 'uzcard', null, now() - interval '937 minutes'),
  ('02419a08-611f-5de1-b10c-fb37957889ce', '58b724c9-3c17-5ff3-bfa5-c8701b0a8339', 'f8a26fdb-6b48-46e7-a016-7cf7a5ae6657', 710000, null, 'click', null, now() - interval '1076 minutes'),
  ('055e7bb0-8be1-5cf9-9d04-e6031343f01f', '58b724c9-3c17-5ff3-bfa5-c8701b0a8339', 'd5c557bc-26dc-4523-abb2-c8e8826de8a8', 780000, null, 'humo', null, now() - interval '2593 minutes'),
  ('c85d4926-023e-5ced-8e25-8bb70abc5a9b', '58b724c9-3c17-5ff3-bfa5-c8701b0a8339', 'ed6f9399-f49c-4bce-a9da-bbeb14874c21', 120000, null, 'payme', null, now() - interval '806 minutes'),
  ('f36105ba-20a5-51a0-8318-c89e41a06998', '58b724c9-3c17-5ff3-bfa5-c8701b0a8339', 'f4f336c7-fab5-49a6-ad51-25abd3549190', 240000, null, 'uzcard', null, now() - interval '7632 minutes');

-- Totals come from the contributions themselves.
update public.projects p
set raised_amount = t.total, backer_count = t.backers
from (select project_id, sum(amount) as total, count(distinct backer_id) as backers
      from public.contributions group by project_id) t
where p.id = t.project_id and p.id in ('6dc99f3f-7cb2-5121-8afc-4d26714746a3', 'c86eff9c-1df6-544e-bcfd-a1868091e78a', '58b724c9-3c17-5ff3-bfa5-c8701b0a8339');

alter table public.project_updates disable trigger notify_new_update;
alter table public.comments disable trigger notify_new_comment;

insert into public.project_updates (id, project_id, author_id, title, body, created_at)
values
  ('02403427-fde4-525f-845c-d852b5284a50', '6dc99f3f-7cb2-5121-8afc-4d26714746a3', '9c36e9a0-54c9-4357-a79e-a5b901cdec43', 'Hovli tekislandi, poydevor quyildi', 'Rahmat! Birinchi mablagʻ bilan hovlini tekisladik va poydevorni quydik. Keyingi hafta karkas keladi. Cheklarni bosqich hisobotida koʻrasiz.', now() - interval '4 days'),
  ('2ed5ed5f-b0b7-531a-abed-3a4bd10d5f4e', 'c86eff9c-1df6-544e-bcfd-a1868091e78a', 'cca93be9-595d-4ba6-a7f0-d4354eb1f827', 'Dastgohlar keldi!', 'Sakkizta dastgohning hammasi keldi va oʻrnatildi. Birinchi guruhga 20 nafar ayol yozildi, darslar dushanba kuni boshlanadi.', now() - interval '6 days'),
  ('c383279c-da67-5677-bb3a-8431913e54f4', '58b724c9-3c17-5ff3-bfa5-c8701b0a8339', 'a16c7fb3-aa6f-47d7-af1a-2bbb21de2220', 'Birinchi xarid kelishildi', 'Uchta fermer bilan ulgurji narxda shartnoma tuzdik. Birinchi 200 ta toʻplam dekabr boshida tarqatiladi.', now() - interval '2 days');

insert into public.comments (id, project_id, author_id, parent_id, body, created_at)
values
  ('2dc51c38-6161-595c-b185-43a60d72e1c9', '6dc99f3f-7cb2-5121-8afc-4d26714746a3', '46a5a2d6-555e-4957-a757-98ec069fe910', null, 'Bolalar uchun ajoyib ish. Ozgina boʻlsa ham qoʻshildim!', now() - interval '6 days'),
  ('10dde624-050d-5f19-8ac8-be02e995d150', 'c86eff9c-1df6-544e-bcfd-a1868091e78a', 'efa25e2e-904e-44fb-adf5-2cb7654a4f57', null, 'Onam ham toʻquvchi edi. Bu ishni qoʻllab-quvvatlaganimdan xursandman.', now() - interval '10 days'),
  ('fe42c2d0-681d-5528-a6eb-71d30110e837', '58b724c9-3c17-5ff3-bfa5-c8701b0a8339', '8d85a241-20cd-41ad-ae08-d808715ebd15', null, 'Qishda bu juda kerak. Rahmat sizlarga!', now() - interval '3 days');

alter table public.project_updates enable trigger notify_new_update;
alter table public.comments enable trigger notify_new_comment;

-- Nothing here should reach anyone’s bell or Telegram.
delete from public.notifications where user_id in (select id from auth.users where email like '%@demo.fundy.uz');

commit;
