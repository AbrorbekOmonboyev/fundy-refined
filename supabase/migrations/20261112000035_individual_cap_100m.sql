-- Owner's decision 2026-11-12: a person's first fundraiser may raise up to 100,000,000 so'm (was 50M).
update private.settings set value = '100000000' where key = 'individual_first_cap';
insert into private.settings (key, value) values ('individual_first_cap', '100000000')
on conflict (key) do nothing;
