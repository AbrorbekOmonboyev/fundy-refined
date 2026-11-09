/**
 * Free-licence photos from Wikimedia Commons used for the demo projects.
 * CC BY / CC BY-SA require naming the author and licence; the project page
 * shows this under the cover photo. CC0 needs nothing, but we credit anyway.
 */
export type PhotoCredit = { author: string; license: string; source: string };

export const PHOTO_CREDITS: Record<string, PhotoCredit> = {
  '/images/projects/rashidov-classroom.jpg': {
    author: 'Kamol Azzam (cropped)',
    license: 'CC BY-SA 4.0',
    source: 'https://commons.wikimedia.org/wiki/File:O%CA%BBquv_xonasi.jpg',
  },
  '/images/projects/aral-saxaul.jpg': {
    author: 'Humoyun Mehridinov',
    license: 'CC BY-SA 4.0',
    source: 'https://commons.wikimedia.org/wiki/File:Saxaul_(lat._Haloxylon).jpg',
  },
  '/images/projects/zarafshan-fruit.jpg': {
    author: 'LBM1948',
    license: 'CC BY-SA 4.0',
    source: 'https://commons.wikimedia.org/wiki/File:Mercado_de_Chorsu_05.jpg',
  },
  '/images/projects/chust-knives.jpg': {
    author: 'Madina Habiyaliyeva',
    license: 'CC BY 4.0',
    source: 'https://commons.wikimedia.org/wiki/File:Chust_pichoq.jpg',
  },
  '/images/projects/registan.jpg': {
    author: 'Bernard Gagnon',
    license: 'CC0',
    source: 'https://commons.wikimedia.org/wiki/File:Registan_01.jpg',
  },
  '/images/projects/andijan-trike.jpg': {
    author: 'Jean Housen',
    license: 'CC BY-SA 4.0',
    source: 'https://commons.wikimedia.org/wiki/File:20230606_Tashkent223.jpg',
  },
};

/** The credit for a cover, matched by the end of its URL (works for full URLs too). */
export function photoCredit(url: string | null | undefined): PhotoCredit | null {
  if (!url) return null;
  const key = Object.keys(PHOTO_CREDITS).find(k => url.endsWith(k));
  return key ? PHOTO_CREDITS[key] : null;
}
