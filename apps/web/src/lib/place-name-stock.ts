import type { Place } from '@madia/domain';
import type { StockImage } from './stock-images';

/** Verified Wikimedia photos matched to place names within the correct municipality. */
const RULES: Array<{
  pattern: RegExp;
  municipalityId?: string;
  image: StockImage;
}> = [
  {
    pattern: /\bgota\b/i,
    municipalityId: 'MADIA-MUN-CAR',
    image: {
      url: 'https://upload.wikimedia.org/wikipedia/commons/0/04/Caramoan_Gota_Beach_Front_I.jpg',
      attribution: 'Photo by Francis Charles Brioso, CC BY-SA 4.0, via Wikimedia Commons',
    },
  },
  {
    pattern: /manlawi/i,
    municipalityId: 'MADIA-MUN-CAR',
    image: {
      url: 'https://upload.wikimedia.org/wikipedia/commons/7/7f/Manlawi_Sandbar%2C_Caramoan_Island%2C_Camarines_Sur.jpg',
      attribution: 'Photo by JannahTepace, CC BY-SA 4.0, via Wikimedia Commons',
    },
  },
  {
    pattern: /lahos/i,
    municipalityId: 'MADIA-MUN-CAR',
    image: {
      url: 'https://upload.wikimedia.org/wikipedia/commons/5/5e/Lahos_Island.jpg',
      attribution: 'Photo by Itsmateoduh, CC BY-SA 4.0, via Wikimedia Commons',
    },
  },
  {
    pattern: /sabitang/i,
    municipalityId: 'MADIA-MUN-CAR',
    image: {
      url: 'https://upload.wikimedia.org/wikipedia/commons/b/b6/Sabitang_Laya_Island.jpg',
      attribution: 'Photo by Judith.arendaing, CC BY-SA 4.0, via Wikimedia Commons',
    },
  },
  {
    pattern: /matukad|caramoan peninsula/i,
    municipalityId: 'MADIA-MUN-CAR',
    image: {
      url: 'https://upload.wikimedia.org/wikipedia/commons/2/21/Caramoan_Peninsula%2C_Camarines_Sur.jpg',
      attribution: 'Photo by JannahTepace, CC BY-SA 4.0, via Wikimedia Commons',
    },
  },
  {
    pattern: /atulayan/i,
    municipalityId: 'MADIA-MUN-SAG',
    image: {
      url: 'https://commons.wikimedia.org/wiki/Special:FilePath/Atulayan_Island_01.jpg?width=1600',
      attribution: 'Photo by Maffeth.opiana, CC BY-SA 4.0, via Wikimedia Commons',
    },
  },
  {
    pattern: /cagbalogo|nato beach/i,
    municipalityId: 'MADIA-MUN-SAG',
    image: {
      url: 'https://commons.wikimedia.org/wiki/Special:FilePath/Nato_Beach%2C_Sag%C3%B1ay%2C_Camarines_Sur.jpg?width=1600',
      attribution: 'Wikimedia Commons — Nato Beach, Sagñay',
    },
  },
  {
    pattern: /aguirangan|rose island/i,
    municipalityId: 'MADIA-MUN-PRE',
    image: {
      url: 'https://commons.wikimedia.org/wiki/Special:FilePath/Aguirangan_Island_in_Camarines_Sur_02.jpg?width=1600',
      attribution: 'Photo by Irvin Parco Sto. Tomas, CC BY-SA 4.0, via Wikimedia Commons',
    },
  },
  {
    pattern: /sabang/i,
    municipalityId: 'MADIA-MUN-SJO',
    image: {
      url: 'https://commons.wikimedia.org/wiki/Special:FilePath/Sabang_Beach%2C_San_Jose%2C_Camarines_Sur_(2022).jpg?width=1600',
      attribution: 'Photo by Ralff Nestor Nacor, CC BY-SA 4.0, via Wikimedia Commons',
    },
  },
  {
    pattern: /angelica/i,
    municipalityId: 'MADIA-MUN-SIR',
    image: {
      url: 'https://upload.wikimedia.org/wikipedia/commons/d/d2/Angelica_Beach_in_Siruma%2C_Camarines_Sur.jpg',
      attribution: 'Wikimedia Commons — Angelica Beach, Siruma',
    },
  },
  {
    pattern: /tumagit/i,
    municipalityId: 'MADIA-MUN-TIG',
    image: {
      url: 'https://commons.wikimedia.org/wiki/Special:FilePath/Tumagiti_Falls%2C_Mount_Isarog.jpg?width=1600',
      attribution: 'Photo by Irvin Parco Sto. Tomas, CC BY-SA 4.0, via Wikimedia Commons',
    },
  },
  {
    pattern: /consosep|isarog/i,
    municipalityId: 'MADIA-MUN-TIG',
    image: {
      url: 'https://commons.wikimedia.org/wiki/Special:FilePath/Consosep%2C_Mount_Isarog_National_Park_-_Tigaon.jpg?width=1600',
      attribution: 'Wikimedia Commons — Consosep, Mount Isarog National Park',
    },
  },
  {
    pattern: /caloco/i,
    municipalityId: 'MADIA-MUN-TIN',
    image: {
      url: 'https://upload.wikimedia.org/wikipedia/commons/4/4f/Caloco_Beach_of_Tinambac%2C_Camarines_Sur.jpg',
      attribution: 'Wikimedia Commons — Caloco Beach, Tinambac',
    },
  },
  {
    pattern: /kinahulogan/i,
    municipalityId: 'MADIA-MUN-LAG',
    image: {
      url: 'https://commons.wikimedia.org/wiki/Special:FilePath/Kinahulogan_Falls%2C_Lagonoy.jpg?width=1600',
      attribution: 'Wikimedia Commons — Kinahulogan Falls, Lagonoy',
    },
  },
  {
    pattern: /pighaluban/i,
    municipalityId: 'MADIA-MUN-GAR',
    image: {
      url: 'https://commons.wikimedia.org/wiki/Special:FilePath/The_beauty_of_Le_Isla_Pighaluban_in_Garchitorena%2C_Camarines_Sur%2C_Bicol%2C_Philippines.jpg?width=1600',
      attribution: 'Wikimedia Commons — Le Isla Pighaluban, Garchitorena',
    },
  },
  {
    pattern: /lagoon/i,
    municipalityId: 'MADIA-MUN-GAR',
    image: {
      url: 'https://commons.wikimedia.org/wiki/Special:FilePath/A_Lagoon_in_Garchitorena.jpg?width=1600',
      attribution: 'Wikimedia Commons — Lagoon, Garchitorena',
    },
  },
];

function placeLabel(place: Place): string {
  return [
    place.official_name,
    place.alternate_or_local_name,
    place.category,
    place.subcategory,
    place.short_description,
  ]
    .filter(Boolean)
    .join(' ');
}

export function matchPlaceNameStock(place: Place): StockImage | null {
  const label = placeLabel(place);
  for (const rule of RULES) {
    if (rule.municipalityId && place.municipality_id !== rule.municipalityId) continue;
    if (!rule.pattern.test(label)) continue;
    return rule.image;
  }
  return null;
}
