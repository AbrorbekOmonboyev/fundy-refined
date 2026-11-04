-- =============================================================================
-- Reference data needed in every environment (not demo data).
-- =============================================================================

insert into public.categories (id, name_uz, name_ru, name_en, sort_order) values
  ('technology',  'Texnologiya',                  'Технологии',                'Technology',          1),
  ('agriculture', 'Qishloq xo''jaligi',           'Сельское хозяйство',        'Agriculture',         2),
  ('crafts',      'Hunarmandchilik',              'Ремёсла',                   'Artisanal & Crafts',  3),
  ('education',   'Ta''lim',                      'Образование',               'Education',           4),
  ('healthcare',  'Sog''liqni saqlash',           'Здравоохранение',           'Healthcare',          5),
  ('clean-energy','Toza energiya',                'Чистая энергия',            'Clean Energy',        6),
  ('food',        'Oziq-ovqat va pazandachilik',  'Еда и кулинария',           'Food & Culinary',     7),
  ('social',      'Ijtimoiy loyihalar',           'Социальные проекты',        'Social Impact',       8);

-- The 12 regions, the Republic of Karakalpakstan and Tashkent city.
insert into public.regions (id, name_uz, name_ru, name_en, sort_order) values
  ('tashkent-city',   'Toshkent shahri',                     'город Ташкент',                     'Tashkent City',              1),
  ('tashkent',        'Toshkent viloyati',                   'Ташкентская область',               'Tashkent Region',            2),
  ('andijan',         'Andijon viloyati',                    'Андижанская область',               'Andijan Region',             3),
  ('bukhara',         'Buxoro viloyati',                     'Бухарская область',                 'Bukhara Region',             4),
  ('fergana',         'Farg''ona viloyati',                  'Ферганская область',                'Fergana Region',             5),
  ('jizzakh',         'Jizzax viloyati',                     'Джизакская область',                'Jizzakh Region',             6),
  ('kashkadarya',     'Qashqadaryo viloyati',                'Кашкадарьинская область',           'Kashkadarya Region',         7),
  ('khorezm',         'Xorazm viloyati',                     'Хорезмская область',                'Khorezm Region',             8),
  ('namangan',        'Namangan viloyati',                   'Наманганская область',              'Namangan Region',            9),
  ('navoi',           'Navoiy viloyati',                     'Навоийская область',                'Navoi Region',              10),
  ('samarkand',       'Samarqand viloyati',                  'Самаркандская область',             'Samarkand Region',          11),
  ('surkhandarya',    'Surxondaryo viloyati',                'Сурхандарьинская область',          'Surkhandarya Region',       12),
  ('syrdarya',        'Sirdaryo viloyati',                   'Сырдарьинская область',             'Syrdarya Region',           13),
  ('karakalpakstan',  'Qoraqalpog''iston Respublikasi',      'Республика Каракалпакстан',         'Republic of Karakalpakstan',14);
