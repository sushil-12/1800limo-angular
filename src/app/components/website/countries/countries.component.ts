import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

export interface Country {
  name: string;
  code: string;
  region: string;
  cities: string;
}

export interface Continent {
  id: string;
  label: string;
  icon: string;
}

@Component({
  selector: 'app-countries',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './countries.component.html',
  styleUrls: ['./countries.component.scss']
})
export class CountriesComponent {

  stats = [
    { value: '47',    label: 'Countries'    },
    { value: '5',     label: 'Continents'   },
    { value: '1,754', label: 'Cities'       },
    { value: '24/7',  label: 'Service'      },
  ];

  continents: Continent[] = [
    { id: 'all',           label: 'All Regions',    icon: 'bi-globe'         },
    { id: 'Europe',        label: 'Europe',          icon: 'bi-building'      },
    { id: 'North America', label: 'North America',   icon: 'bi-map'           },
    { id: 'South America', label: 'South America',   icon: 'bi-map'           },
    { id: 'Asia',          label: 'Asia',            icon: 'bi-sun'           },
    { id: 'Middle East',   label: 'Middle East',     icon: 'bi-geo-alt'       },
    { id: 'Africa',        label: 'Africa',          icon: 'bi-tree'          },
  ];

  selectedContinent = 'all';

 countries: Country[] = [
  // ── Europe ──────────────────────────────────────────────────────────────
  { name: 'Austria',        code: 'at', region: 'Europe',        cities: 'Vienna, Salzburg, Graz, Innsbruck, Linz'              },
  { name: 'Belgium',        code: 'be', region: 'Europe',        cities: 'Brussels, Antwerp, Bruges, Ghent'                     },
  { name: 'Croatia',        code: 'hr', region: 'Europe',        cities: 'Zagreb, Dubrovnik, Split, Rovinj'                     },
  { name: 'Czech Republic', code: 'cz', region: 'Europe',        cities: 'Prague'                                               },
  { name: 'Denmark',        code: 'dk', region: 'Europe',        cities: 'Copenhagen'                                           },
  { name: 'Finland',        code: 'fi', region: 'Europe',        cities: 'Helsinki'                                             },
  { name: 'France',         code: 'fr', region: 'Europe',        cities: 'Paris, Lyon, Marseille, Nice, Bordeaux, Toulouse, Strasbourg, Monaco' },
  { name: 'Germany',        code: 'de', region: 'Europe',        cities: 'Berlin, Munich, Hamburg, Cologne, Frankfurt, Düsseldorf, Stuttgart'   },
  { name: 'Greece',         code: 'gr', region: 'Europe',        cities: 'Athens'                                               },
  { name: 'Hungary',        code: 'hu', region: 'Europe',        cities: 'Budapest'                                             },
  { name: 'Iceland',        code: 'is', region: 'Europe',        cities: 'Reykjavík'                                            },
  { name: 'Ireland',        code: 'ie', region: 'Europe',        cities: 'Dublin, Cork'                                         },
  { name: 'Italy',          code: 'it', region: 'Europe',        cities: 'Rome, Milan, Florence, Naples, Bologna, Turin, Venice, Palermo'       },
  { name: 'Luxembourg',     code: 'lu', region: 'Europe',        cities: 'Luxembourg City'                                      },
  { name: 'Malta',          code: 'mt', region: 'Europe',        cities: 'Valletta'                                             },
  { name: 'Netherlands',    code: 'nl', region: 'Europe',        cities: 'Amsterdam, Rotterdam, The Hague, Utrecht'             },
  { name: 'Norway',         code: 'no', region: 'Europe',        cities: 'Oslo, Stavanger'                                      },
  { name: 'Poland',         code: 'pl', region: 'Europe',        cities: 'Warsaw, Kraków, Poznań'                               },
  { name: 'Portugal',       code: 'pt', region: 'Europe',        cities: 'Lisbon, Porto'                                        },
  { name: 'Serbia',         code: 'rs', region: 'Europe',        cities: 'Belgrade'                                             },
  { name: 'Slovenia',       code: 'si', region: 'Europe',        cities: 'Ljubljana'                                            },
  { name: 'Spain',          code: 'es', region: 'Europe',        cities: 'Madrid, Barcelona, San Sebastián, Valencia, Seville, Málaga, Bilbao, Girona' },
  { name: 'Sweden',         code: 'se', region: 'Europe',        cities: 'Stockholm, Gothenburg'                                },
  { name: 'Switzerland',    code: 'ch', region: 'Europe',        cities: 'Zurich, Geneva, Basel, Lausanne'                      },
  { name: 'Türkiye',        code: 'tr', region: 'Europe',        cities: 'Istanbul, İzmir, Bodrum'                              },
  { name: 'United Kingdom', code: 'gb', region: 'Europe',        cities: 'London, Birmingham, Manchester, Edinburgh, Glasgow, Cardiff'          },

  // ── North America ────────────────────────────────────────────────────────
  { name: 'United States',  code: 'us', region: 'North America', cities: 'New York, Chicago, San Francisco, Los Angeles, Washington D.C., Miami, Las Vegas' },
  { name: 'Canada',         code: 'ca', region: 'North America', cities: 'Toronto, Vancouver, Montreal'                         },
  { name: 'Mexico',         code: 'mx', region: 'North America', cities: 'Mexico City, Oaxaca'                                  },

  // ── South America ────────────────────────────────────────────────────────
  { name: 'Argentina',      code: 'ar', region: 'South America', cities: 'Buenos Aires, Mendoza'                                },
  { name: 'Brazil',         code: 'br', region: 'South America', cities: 'São Paulo, Rio de Janeiro'                            },

  // ── Asia ─────────────────────────────────────────────────────────────────
  { name: 'China',          code: 'cn', region: 'Asia',          cities: 'Shanghai, Beijing, Guangzhou, Hangzhou'               },
  { name: 'Hong Kong',      code: 'hk', region: 'Asia',          cities: 'Hong Kong'                                            },
  { name: 'Macau',          code: 'mo', region: 'Asia',          cities: 'Macau'                                                },
  { name: 'India',          code: 'in', region: 'Asia',          cities: 'Mumbai, New Delhi'                                    },
  { name: 'Indonesia',      code: 'id', region: 'Asia',          cities: 'Bali'                                                 },
  { name: 'Japan',          code: 'jp', region: 'Asia',          cities: 'Tokyo, Osaka, Kyoto, Nara'                            },
  { name: 'Malaysia',       code: 'my', region: 'Asia',          cities: 'Kuala Lumpur, Penang'                                 },
  { name: 'Singapore',      code: 'sg', region: 'Asia',          cities: 'Singapore'                                            },
  { name: 'South Korea',    code: 'kr', region: 'Asia',          cities: 'Seoul, Busan'                                         },
  { name: 'Thailand',       code: 'th', region: 'Asia',          cities: 'Bangkok, Phuket'                                      },
  { name: 'Taiwan',         code: 'tw', region: 'Asia',          cities: 'Taipei, Taichung, Kaohsiung'                          },
  { name: 'Vietnam',        code: 'vn', region: 'Asia',          cities: 'Hanoi, Ho Chi Minh City, Da Nang'                     },

  // ── Middle East ──────────────────────────────────────────────────────────
  { name: 'Bahrain',        code: 'bh', region: 'Middle East',   cities: 'Manama'                                               },
  { name: 'UAE',            code: 'ae', region: 'Middle East',   cities: 'Dubai, Abu Dhabi'                                     },
  { name: 'Qatar',          code: 'qa', region: 'Middle East',   cities: 'Doha'                                                 },

  // ── Africa ───────────────────────────────────────────────────────────────
  { name: 'South Africa',   code: 'za', region: 'Africa',        cities: 'Cape Town, Johannesburg'                              },
];

  get filteredCountries(): Country[] {
    const list = this.selectedContinent === 'all'
      ? this.countries
      : this.countries.filter(c => c.region === this.selectedContinent);

    return list.sort((a, b) => a.name.localeCompare(b.name));
  }

  setContinent(id: string): void {
    this.selectedContinent = id;
  }

  getFilteredCount(): number {
    return this.filteredCountries.length;
  }
}