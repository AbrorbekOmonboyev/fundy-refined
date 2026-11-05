-- Real, free-licence photos (Wikimedia Commons) for the 5 demo projects that had
-- pattern covers. Credits: src/data/photoCredits.ts (shown under the photo).
-- Only the demo projects are touched; on a fresh database this does nothing.
update public.projects p set cover_image_path = v.path
from (values
  ('aral-oasis-reforestation-saxaul', '/images/projects/aral-saxaul.jpg'),
  ('zarafshan-solar-cold-storage', '/images/projects/zarafshan-fruit.jpg'),
  ('chust-master-cutlery-works', '/images/projects/chust-knives.jpg'),
  ('registan-edtech-math-uzbek', '/images/projects/registan.jpg'),
  ('andijan-mobility-electric-cargo', '/images/projects/andijan-trike.jpg')
) as v(slug, path)
where p.slug = v.slug and p.cover_image_path like '/images/covers/%';
