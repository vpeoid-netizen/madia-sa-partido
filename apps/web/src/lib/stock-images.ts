import type { Place } from '@madia/domain';
import { matchPlaceNameStock } from './place-name-stock';

export interface StockImage {
  url: string;
  attribution: string;
}

const ATTR = 'Wikimedia Commons — CC-licensed reference photo for Partido Area';

/** Municipality-scoped Wikimedia photos (all ten Partido LGUs). */
const STOCK_BY_MUNICIPALITY: Record<string, StockImage[]> = {
  'MADIA-MUN-CAR': [
    { url: 'https://upload.wikimedia.org/wikipedia/commons/0/04/Caramoan_Gota_Beach_Front_I.jpg', attribution: 'Wikimedia Commons — Gota Beach, Caramoan' },
    { url: 'https://upload.wikimedia.org/wikipedia/commons/2/21/Caramoan_Peninsula%2C_Camarines_Sur.jpg', attribution: 'Wikimedia Commons — Caramoan Peninsula (JannahTepace, CC BY-SA 4.0)' },
    { url: 'https://upload.wikimedia.org/wikipedia/commons/7/7f/Manlawi_Sandbar%2C_Caramoan_Island%2C_Camarines_Sur.jpg', attribution: 'Wikimedia Commons — Manlawi Sandbar' },
    { url: 'https://upload.wikimedia.org/wikipedia/commons/5/5e/Lahos_Island.jpg', attribution: 'Wikimedia Commons — Lahos Island' },
    { url: 'https://upload.wikimedia.org/wikipedia/commons/b/b6/Sabitang_Laya_Island.jpg', attribution: 'Wikimedia Commons — Sabitang Laya Island' },
  ],
  'MADIA-MUN-GAR': [
    { url: 'https://upload.wikimedia.org/wikipedia/commons/0/09/An_Island_in_Garchitorena.jpg', attribution: 'Wikimedia Commons — Island, Garchitorena' },
    { url: 'https://commons.wikimedia.org/wiki/Special:FilePath/A_Lagoon_in_Garchitorena.jpg?width=1600', attribution: 'Wikimedia Commons — Lagoon, Garchitorena' },
    { url: 'https://commons.wikimedia.org/wiki/Special:FilePath/The_beauty_of_Le_Isla_Pighaluban_in_Garchitorena%2C_Camarines_Sur%2C_Bicol%2C_Philippines.jpg?width=1600', attribution: 'Wikimedia Commons — Le Isla Pighaluban, Garchitorena' },
  ],
  'MADIA-MUN-GOA': [
    { url: 'https://upload.wikimedia.org/wikipedia/commons/1/17/Goa_Church%2C_Cam_Sur%2C_Mar_2026_%281%29.jpg', attribution: 'Wikimedia Commons — Goa Church' },
    { url: 'https://upload.wikimedia.org/wikipedia/commons/e/e9/Road_going_to_Goa%2C_Camarines_Sur.JPG', attribution: 'Wikimedia Commons — Road to Goa' },
    { url: 'https://commons.wikimedia.org/wiki/Special:FilePath/Goa_Church%2C_Camarines_Sur.jpg?width=1600', attribution: 'Wikimedia Commons — Goa Church exterior' },
  ],
  'MADIA-MUN-LAG': [
    { url: 'https://commons.wikimedia.org/wiki/Special:FilePath/Kinahulogan_Falls%2C_Lagonoy.jpg?width=1600', attribution: 'Wikimedia Commons — Kinahulogan Falls, Lagonoy' },
    { url: 'https://upload.wikimedia.org/wikipedia/commons/4/48/Close-up_details_of_Sts._Philip_and_James_the_Apostle_Parish%2C_Lagonoy%2C_Camarines_Sur.jpg', attribution: 'Wikimedia Commons — Lagonoy parish church' },
  ],
  'MADIA-MUN-PRE': [
    { url: 'https://upload.wikimedia.org/wikipedia/commons/3/36/Presentacion_town_in_Camarines_Sur.jpg', attribution: 'Wikimedia Commons — Presentacion town' },
    { url: 'https://commons.wikimedia.org/wiki/Special:FilePath/Aguirangan_Island_in_Camarines_Sur_02.jpg?width=1600', attribution: 'Wikimedia Commons — Aguirangan Island' },
    { url: 'https://commons.wikimedia.org/wiki/Special:FilePath/View_of_Rose_Island.jpg?width=1600', attribution: 'Wikimedia Commons — Rose Island' },
  ],
  'MADIA-MUN-SAG': [
    { url: 'https://commons.wikimedia.org/wiki/Special:FilePath/Nato_Beach%2C_Sag%C3%B1ay%2C_Camarines_Sur.jpg?width=1600', attribution: 'Wikimedia Commons — Nato Beach, Sagñay' },
    { url: 'https://commons.wikimedia.org/wiki/Special:FilePath/Church_of_Sag%C3%B1ay%2C_Camarines_Sur.jpg?width=1600', attribution: 'Wikimedia Commons — Sagñay church' },
    { url: 'https://commons.wikimedia.org/wiki/Special:FilePath/Atulayan_Island_01.jpg?width=1600', attribution: 'Wikimedia Commons — Atulayan Island' },
  ],
  'MADIA-MUN-SJO': [
    { url: 'https://commons.wikimedia.org/wiki/Special:FilePath/Sabang_Beach%2C_San_Jose%2C_Camarines_Sur_(2022).jpg?width=1600', attribution: 'Wikimedia Commons — Sabang Beach, San Jose' },
    { url: 'https://upload.wikimedia.org/wikipedia/commons/5/54/St._Joseph_Parish_Church%2C_San_Jose%2C_Camarines_Sur.jpg', attribution: 'Wikimedia Commons — St. Joseph Parish Church' },
  ],
  'MADIA-MUN-SIR': [
    { url: 'https://upload.wikimedia.org/wikipedia/commons/d/d2/Angelica_Beach_in_Siruma%2C_Camarines_Sur.jpg', attribution: 'Wikimedia Commons — Angelica Beach, Siruma' },
    { url: 'https://upload.wikimedia.org/wikipedia/commons/b/bc/Siruma%2C_Camarines_Sur.jpg', attribution: 'Wikimedia Commons — Siruma coastline' },
  ],
  'MADIA-MUN-TIG': [
    { url: 'https://commons.wikimedia.org/wiki/Special:FilePath/Tumagiti_Falls%2C_Mount_Isarog.jpg?width=1600', attribution: 'Wikimedia Commons — Tumagiti Falls, Tigaon' },
    { url: 'https://commons.wikimedia.org/wiki/Special:FilePath/Consosep%2C_Mount_Isarog_National_Park_-_Tigaon.jpg?width=1600', attribution: 'Wikimedia Commons — Consosep, Mount Isarog' },
    { url: 'https://upload.wikimedia.org/wikipedia/commons/0/05/Tigaon_Public_Market%2C_Camarines_Sur.jpg', attribution: 'Wikimedia Commons — Tigaon Public Market' },
    { url: 'https://upload.wikimedia.org/wikipedia/commons/4/4f/Don_Pascual_P._Leelin_Sr._Park%2C_Tigaon%2C_Cam_Sur%2C_Mar_2026.jpg', attribution: 'Wikimedia Commons — Tigaon town park' },
  ],
  'MADIA-MUN-TIN': [
    { url: 'https://upload.wikimedia.org/wikipedia/commons/4/4f/Caloco_Beach_of_Tinambac%2C_Camarines_Sur.jpg', attribution: 'Wikimedia Commons — Caloco Beach, Tinambac' },
    { url: 'https://upload.wikimedia.org/wikipedia/commons/f/f4/Caloco_Beach_at_Tinambac%2C_Camarines_Sur_1.jpg', attribution: 'Wikimedia Commons — Caloco Beach view' },
    { url: 'https://upload.wikimedia.org/wikipedia/commons/b/bf/Magnificant_view_of_the_beach_in_Caloco_Beach%2C_Tinambac%2C_Camarines_Sur%2C_Philippines.jpg', attribution: 'Wikimedia Commons — Caloco Beach panorama' },
    { url: 'https://commons.wikimedia.org/wiki/Special:FilePath/San_Pascual_Baylon_Parish_Church.JPG?width=1600', attribution: 'Wikimedia Commons — Tinambac church' },
  ],
};

/** Keyword → thematic Wikimedia photos for smarter matching. */
const STOCK_BY_KEYWORD: { pattern: RegExp; images: StockImage[] }[] = [
  {
    pattern: /beach|sandbar|shore|coast|bay/i,
    images: [
      { url: 'https://upload.wikimedia.org/wikipedia/commons/0/04/Caramoan_Gota_Beach_Front_I.jpg', attribution: ATTR },
      { url: 'https://upload.wikimedia.org/wikipedia/commons/4/4f/Caloco_Beach_of_Tinambac%2C_Camarines_Sur.jpg', attribution: ATTR },
      { url: 'https://upload.wikimedia.org/wikipedia/commons/d/d2/Angelica_Beach_in_Siruma%2C_Camarines_Sur.jpg', attribution: ATTR },
    ],
  },
  {
    pattern: /island|islet/i,
    images: [
      { url: 'https://upload.wikimedia.org/wikipedia/commons/5/5e/Lahos_Island.jpg', attribution: ATTR },
      { url: 'https://upload.wikimedia.org/wikipedia/commons/b/b6/Sabitang_Laya_Island.jpg', attribution: ATTR },
      { url: 'https://upload.wikimedia.org/wikipedia/commons/0/09/An_Island_in_Garchitorena.jpg', attribution: ATTR },
      { url: 'https://commons.wikimedia.org/wiki/Special:FilePath/Atulayan_Island_01.jpg?width=1600', attribution: ATTR },
    ],
  },
  {
    pattern: /lagoon|cove|marine|snorkel|dive/i,
    images: [
      { url: 'https://commons.wikimedia.org/wiki/Special:FilePath/A_Lagoon_in_Garchitorena.jpg?width=1600', attribution: ATTR },
      { url: 'https://upload.wikimedia.org/wikipedia/commons/7/7f/Manlawi_Sandbar%2C_Caramoan_Island%2C_Camarines_Sur.jpg', attribution: ATTR },
    ],
  },
  {
    pattern: /falls|waterfall|cascade/i,
    images: [
      { url: 'https://commons.wikimedia.org/wiki/Special:FilePath/Tumagiti_Falls%2C_Mount_Isarog.jpg?width=1600', attribution: ATTR },
      { url: 'https://commons.wikimedia.org/wiki/Special:FilePath/Kinahulogan_Falls%2C_Lagonoy.jpg?width=1600', attribution: ATTR },
    ],
  },
  {
    pattern: /festival|fiesta|celebration|samhod|carahan/i,
    images: [
      { url: 'https://upload.wikimedia.org/wikipedia/commons/a/a1/Halamanan_Festival.jpg', attribution: 'Wikimedia Commons — Philippine street festival (CC BY-SA 4.0)' },
      { url: 'https://upload.wikimedia.org/wikipedia/commons/5/51/Pasayahan_Festival.jpg', attribution: 'Wikimedia Commons — Philippine festival parade (CC BY-SA 4.0)' },
      { url: 'https://upload.wikimedia.org/wikipedia/commons/3/36/Presentacion_town_in_Camarines_Sur.jpg', attribution: 'Wikimedia Commons — Presentacion town celebration setting' },
      { url: 'https://upload.wikimedia.org/wikipedia/commons/4/4f/Don_Pascual_P._Leelin_Sr._Park%2C_Tigaon%2C_Cam_Sur%2C_Mar_2026.jpg', attribution: 'Wikimedia Commons — Tigaon town park' },
    ],
  },
  {
    pattern: /church|parish|shrine|chapel/i,
    images: [
      { url: 'https://upload.wikimedia.org/wikipedia/commons/1/17/Goa_Church%2C_Cam_Sur%2C_Mar_2026_%281%29.jpg', attribution: ATTR },
      { url: 'https://upload.wikimedia.org/wikipedia/commons/5/54/St._Joseph_Parish_Church%2C_San_Jose%2C_Camarines_Sur.jpg', attribution: ATTR },
      { url: 'https://commons.wikimedia.org/wiki/Special:FilePath/Church_of_Sag%C3%B1ay%2C_Camarines_Sur.jpg?width=1600', attribution: ATTR },
    ],
  },
  {
    pattern: /hill|mount|isarog|viewpoint|lighthouse|park|national/i,
    images: [
      { url: 'https://upload.wikimedia.org/wikipedia/commons/2/21/Caramoan_Peninsula%2C_Camarines_Sur.jpg', attribution: ATTR },
      { url: 'https://commons.wikimedia.org/wiki/Special:FilePath/Consosep%2C_Mount_Isarog_National_Park_-_Tigaon.jpg?width=1600', attribution: ATTR },
      { url: 'https://upload.wikimedia.org/wikipedia/commons/4/4f/Don_Pascual_P._Leelin_Sr._Park%2C_Tigaon%2C_Cam_Sur%2C_Mar_2026.jpg', attribution: ATTR },
    ],
  },
  {
    pattern: /spring|sulfur|hot/i,
    images: [
      { url: 'https://commons.wikimedia.org/wiki/Special:FilePath/Consosep%2C_Mount_Isarog_National_Park_-_Tigaon.jpg?width=1600', attribution: ATTR },
      { url: 'https://commons.wikimedia.org/wiki/Special:FilePath/Tumagiti_Falls%2C_Mount_Isarog.jpg?width=1600', attribution: ATTR },
    ],
  },
  {
    pattern: /market|food|restaurant|grill|seafood|café|cafe|dining/i,
    images: [
      { url: 'https://upload.wikimedia.org/wikipedia/commons/c/cf/Inihaw_na_Pusit_DSCF4327.jpg', attribution: 'Wikimedia Commons — Inihaw na pusit (CC BY-SA 4.0)' },
      { url: 'https://upload.wikimedia.org/wikipedia/commons/6/65/Adobong_pusit.jpg', attribution: 'Wikimedia Commons — Adobong pusit (CC BY-SA 4.0)' },
      { url: 'https://upload.wikimedia.org/wikipedia/commons/e/ef/Kinilaw_of_Northern_Mindanao.jpg', attribution: 'Wikimedia Commons — Kinilaw (CC BY-SA 4.0)' },
      { url: 'https://upload.wikimedia.org/wikipedia/commons/0/05/Tigaon_Public_Market%2C_Camarines_Sur.jpg', attribution: ATTR },
    ],
  },
  {
    pattern: /resort|hotel|lodge|inn|stay|accommodation|villa/i,
    images: [
      { url: 'https://upload.wikimedia.org/wikipedia/commons/0/04/Caramoan_Gota_Beach_Front_I.jpg', attribution: ATTR },
      { url: 'https://upload.wikimedia.org/wikipedia/commons/2/21/Caramoan_Peninsula%2C_Camarines_Sur.jpg', attribution: ATTR },
      { url: 'https://commons.wikimedia.org/wiki/Special:FilePath/Nato_Beach%2C_Sag%C3%B1ay%2C_Camarines_Sur.jpg?width=1600', attribution: ATTR },
    ],
  },
  {
    pattern: /transport|route|road|terminal|port|boat|ferry/i,
    images: [
      { url: 'https://upload.wikimedia.org/wikipedia/commons/e/e9/Road_going_to_Goa%2C_Camarines_Sur.JPG', attribution: ATTR },
      { url: 'https://upload.wikimedia.org/wikipedia/commons/b/b6/Sabitang_Laya_Island.jpg', attribution: ATTR },
    ],
  },
  {
    pattern: /service|guide|tour|visitor|information/i,
    images: [
      { url: 'https://upload.wikimedia.org/wikipedia/commons/3/36/Presentacion_town_in_Camarines_Sur.jpg', attribution: ATTR },
      { url: 'https://upload.wikimedia.org/wikipedia/commons/0/05/Tigaon_Public_Market%2C_Cam_Sur%2C_Mar_2026.jpg', attribution: ATTR },
    ],
  },
  {
    pattern: /facility|toilet|parking|viewing|picnic|shelter/i,
    images: [
      { url: 'https://upload.wikimedia.org/wikipedia/commons/4/4f/Don_Pascual_P._Leelin_Sr._Park%2C_Tigaon%2C_Cam_Sur%2C_Mar_2026.jpg', attribution: ATTR },
      { url: 'https://upload.wikimedia.org/wikipedia/commons/0/05/Tigaon_Public_Market%2C_Camarines_Sur.jpg', attribution: ATTR },
    ],
  },
];

const STOCK_BY_RECORD_TYPE: Record<string, StockImage[]> = {
  attraction: [
    { url: 'https://upload.wikimedia.org/wikipedia/commons/2/21/Caramoan_Peninsula%2C_Camarines_Sur.jpg', attribution: ATTR },
    { url: 'https://upload.wikimedia.org/wikipedia/commons/5/5e/Lahos_Island.jpg', attribution: ATTR },
    { url: 'https://upload.wikimedia.org/wikipedia/commons/7/7f/Manlawi_Sandbar%2C_Caramoan_Island%2C_Camarines_Sur.jpg', attribution: ATTR },
    { url: 'https://commons.wikimedia.org/wiki/Special:FilePath/Tumagiti_Falls%2C_Mount_Isarog.jpg?width=1600', attribution: ATTR },
    { url: 'https://upload.wikimedia.org/wikipedia/commons/b/bf/Magnificant_view_of_the_beach_in_Caloco_Beach%2C_Tinambac%2C_Camarines_Sur%2C_Philippines.jpg', attribution: ATTR },
  ],
  cultural_site: [
    { url: 'https://upload.wikimedia.org/wikipedia/commons/1/17/Goa_Church%2C_Cam_Sur%2C_Mar_2026_%281%29.jpg', attribution: ATTR },
    { url: 'https://upload.wikimedia.org/wikipedia/commons/5/54/St._Joseph_Parish_Church%2C_San_Jose%2C_Camarines_Sur.jpg', attribution: ATTR },
    { url: 'https://commons.wikimedia.org/wiki/Special:FilePath/Church_of_Sag%C3%B1ay%2C_Camarines_Sur.jpg?width=1600', attribution: ATTR },
    { url: 'https://upload.wikimedia.org/wikipedia/commons/4/48/Close-up_details_of_Sts._Philip_and_James_the_Apostle_Parish%2C_Lagonoy%2C_Camarines_Sur.jpg', attribution: ATTR },
  ],
  accommodation: [
    { url: 'https://upload.wikimedia.org/wikipedia/commons/0/04/Caramoan_Gota_Beach_Front_I.jpg', attribution: ATTR },
    { url: 'https://upload.wikimedia.org/wikipedia/commons/2/21/Caramoan_Peninsula%2C_Camarines_Sur.jpg', attribution: ATTR },
    { url: 'https://commons.wikimedia.org/wiki/Special:FilePath/Nato_Beach%2C_Sag%C3%B1ay%2C_Camarines_Sur.jpg?width=1600', attribution: ATTR },
    { url: 'https://upload.wikimedia.org/wikipedia/commons/4/4f/Caloco_Beach_of_Tinambac%2C_Camarines_Sur.jpg', attribution: ATTR },
  ],
  restaurant: [
    { url: 'https://upload.wikimedia.org/wikipedia/commons/c/cf/Inihaw_na_Pusit_DSCF4327.jpg', attribution: 'Wikimedia Commons — Inihaw na pusit (CC BY-SA 4.0)' },
    { url: 'https://upload.wikimedia.org/wikipedia/commons/6/65/Adobong_pusit.jpg', attribution: 'Wikimedia Commons — Adobong pusit (CC BY-SA 4.0)' },
    { url: 'https://upload.wikimedia.org/wikipedia/commons/e/ef/Kinilaw_of_Northern_Mindanao.jpg', attribution: 'Wikimedia Commons — Kinilaw (CC BY-SA 4.0)' },
    { url: 'https://upload.wikimedia.org/wikipedia/commons/0/0c/Sinaing_na_Tulingan_sa_palayok.jpg', attribution: 'Wikimedia Commons — Sinaing na tulingan (CC BY-SA 4.0)' },
  ],
  festival_event: [
    { url: 'https://upload.wikimedia.org/wikipedia/commons/a/a1/Halamanan_Festival.jpg', attribution: 'Wikimedia Commons — Philippine street festival (CC BY-SA 4.0)' },
    { url: 'https://upload.wikimedia.org/wikipedia/commons/5/51/Pasayahan_Festival.jpg', attribution: 'Wikimedia Commons — Philippine festival parade (CC BY-SA 4.0)' },
    { url: 'https://upload.wikimedia.org/wikipedia/commons/3/36/Presentacion_town_in_Camarines_Sur.jpg', attribution: 'Wikimedia Commons — Presentacion town' },
    { url: 'https://upload.wikimedia.org/wikipedia/commons/4/4f/Don_Pascual_P._Leelin_Sr._Park%2C_Tigaon%2C_Cam_Sur%2C_Mar_2026.jpg', attribution: 'Wikimedia Commons — Tigaon town park' },
  ],
  transportation_route: [
    { url: 'https://upload.wikimedia.org/wikipedia/commons/e/e9/Road_going_to_Goa%2C_Camarines_Sur.JPG', attribution: ATTR },
    { url: 'https://upload.wikimedia.org/wikipedia/commons/b/b6/Sabitang_Laya_Island.jpg', attribution: ATTR },
    { url: 'https://upload.wikimedia.org/wikipedia/commons/5/5e/Lahos_Island.jpg', attribution: ATTR },
  ],
  tourism_service: [
    { url: 'https://upload.wikimedia.org/wikipedia/commons/3/36/Presentacion_town_in_Camarines_Sur.jpg', attribution: ATTR },
    { url: 'https://upload.wikimedia.org/wikipedia/commons/0/05/Tigaon_Public_Market%2C_Cam_Sur%2C_Mar_2026.jpg', attribution: ATTR },
    { url: 'https://commons.wikimedia.org/wiki/Special:FilePath/Sabang_Beach%2C_San_Jose%2C_Camarines_Sur_(2022).jpg?width=1600', attribution: ATTR },
  ],
  facility: [
    { url: 'https://upload.wikimedia.org/wikipedia/commons/4/4f/Don_Pascual_P._Leelin_Sr._Park%2C_Tigaon%2C_Cam_Sur%2C_Mar_2026.jpg', attribution: ATTR },
    { url: 'https://upload.wikimedia.org/wikipedia/commons/0/05/Tigaon_Public_Market%2C_Camarines_Sur.jpg', attribution: ATTR },
    { url: 'https://upload.wikimedia.org/wikipedia/commons/0/05/Tigaon_Public_Market%2C_Cam_Sur%2C_Mar_2026.jpg', attribution: ATTR },
  ],
};

function hashRecordId(recordId?: string | null): number {
  if (!recordId) return 0;
  let hash = 0;
  for (let i = 0; i < recordId.length; i += 1) {
    hash = (hash * 31 + recordId.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

function placeImageKey(place: Place): string {
  return (
    place.record_id ||
    place.application_page_route ||
    `${place.record_type}:${place.official_name || place.municipality_id || 'partido'}`
  );
}

function pickFromPool(key: string, pool: StockImage[]): StockImage {
  return pool[hashRecordId(key) % pool.length];
}

function placeSearchText(place: Place): string {
  return [
    place.official_name,
    place.alternate_or_local_name,
    place.category,
    place.subcategory,
    place.municipality,
    place.barangay,
    place.short_description,
  ]
    .filter(Boolean)
    .join(' ');
}

const PARISH_CHURCH_BY_MUNICIPALITY: Record<string, StockImage> = {
  'MADIA-MUN-GOA': { url: 'https://upload.wikimedia.org/wikipedia/commons/1/17/Goa_Church%2C_Cam_Sur%2C_Mar_2026_%281%29.jpg', attribution: 'Wikimedia Commons — Goa Church' },
  'MADIA-MUN-LAG': { url: 'https://upload.wikimedia.org/wikipedia/commons/4/48/Close-up_details_of_Sts._Philip_and_James_the_Apostle_Parish%2C_Lagonoy%2C_Camarines_Sur.jpg', attribution: 'Wikimedia Commons — Lagonoy parish church' },
  'MADIA-MUN-SAG': { url: 'https://commons.wikimedia.org/wiki/Special:FilePath/Church_of_Sag%C3%B1ay%2C_Camarines_Sur.jpg?width=1600', attribution: 'Wikimedia Commons — Sagñay church' },
  'MADIA-MUN-SJO': { url: 'https://upload.wikimedia.org/wikipedia/commons/5/54/St._Joseph_Parish_Church%2C_San_Jose%2C_Camarines_Sur.jpg', attribution: 'Wikimedia Commons — St. Joseph Parish Church, San Jose' },
  'MADIA-MUN-TIN': { url: 'https://commons.wikimedia.org/wiki/Special:FilePath/San_Pascual_Baylon_Parish_Church.JPG?width=1600', attribution: 'Wikimedia Commons — Tinambac parish church' },
};

function scenicMunicipalityPool(municipalityId: string): StockImage[] {
  return (STOCK_BY_MUNICIPALITY[municipalityId] || []).filter(
    (image) => !/church|parish/i.test(`${image.url} ${image.attribution}`),
  );
}

function matchFestivalStock(place: Place): StockImage | null {
  const text = placeSearchText(place);
  const isParishFiesta = /parish fiesta|religious feast|patron saint|saint |our lady/i.test(text);

  if (isParishFiesta && place.municipality_id && PARISH_CHURCH_BY_MUNICIPALITY[place.municipality_id]) {
    return PARISH_CHURCH_BY_MUNICIPALITY[place.municipality_id];
  }

  if (place.municipality_id) {
    const scenic = scenicMunicipalityPool(place.municipality_id);
    if (scenic.length > 0) {
      return pickFromPool(placeImageKey(place), scenic);
    }
  }

  return null;
}

function matchCulturalSiteStock(place: Place): StockImage | null {
  if (place.record_type !== 'cultural_site') return null;
  const text = placeSearchText(place);
  if (/church|parish|chapel|shrine/i.test(text) && place.municipality_id) {
    const parish = PARISH_CHURCH_BY_MUNICIPALITY[place.municipality_id];
    if (parish) return parish;
  }
  return matchPlaceNameStock(place);
}

function matchMunicipalityKeywordStock(place: Place): StockImage | null {
  if (!place.municipality_id) return null;
  const pool = STOCK_BY_MUNICIPALITY[place.municipality_id];
  if (!pool?.length) return null;

  const text = placeSearchText(place);
  for (const entry of STOCK_BY_KEYWORD) {
    if (!entry.pattern.test(text)) continue;
    const scoped = pool.filter((image) =>
      entry.images.some((candidate) => candidate.url === image.url),
    );
    if (scoped.length > 0) {
      return pickFromPool(placeImageKey(place), scoped);
    }
  }
  return null;
}

function matchMunicipalityScenicStock(place: Place): StockImage | null {
  if (!place.municipality_id) return null;
  const scenic = scenicMunicipalityPool(place.municipality_id);
  if (scenic.length === 0) return null;
  return pickFromPool(placeImageKey(place), scenic);
}

function matchMunicipalityStock(place: Place): StockImage | null {
  if (!place.municipality_id) return null;
  const pool = STOCK_BY_MUNICIPALITY[place.municipality_id];
  if (!pool?.length) return null;
  return pickFromPool(placeImageKey(place), pool);
}

function matchRecordTypeStock(place: Place): StockImage | null {
  const municipalOnly = new Set([
    'restaurant',
    'accommodation',
    'tourism_service',
    'facility',
    'transportation_route',
  ]);
  if (place.municipality_id && municipalOnly.has(place.record_type)) {
    return matchMunicipalityScenicStock(place);
  }

  if (place.municipality_id) {
    const scenic = matchMunicipalityScenicStock(place);
    if (scenic) return scenic;
  }

  const pool = STOCK_BY_RECORD_TYPE[place.record_type];
  if (!pool?.length) return null;
  return pickFromPool(placeImageKey(place), pool);
}

export function getStockImageForPlace(place: Place): StockImage | null {
  if (place.record_type === 'festival_event') {
    return matchFestivalStock(place);
  }

  if (place.record_type === 'cultural_site') {
    return matchCulturalSiteStock(place) || matchMunicipalityKeywordStock(place) || matchMunicipalityStock(place);
  }

  return (
    matchPlaceNameStock(place) ||
    matchMunicipalityKeywordStock(place) ||
    matchMunicipalityStock(place) ||
    matchRecordTypeStock(place)
  );
}
