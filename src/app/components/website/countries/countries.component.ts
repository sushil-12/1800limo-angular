import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

export interface Country {
  name: string;
  flag: string;
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
    { name: 'Austria',        flag: '🇦🇹', region: 'Europe',        cities: 'Vienna, Salzburg, Graz, Innsbruck, Linz'              },
    { name: 'Belgium',        flag: '🇧🇪', region: 'Europe',        cities: 'Brussels, Antwerp, Bruges, Ghent'                     },
    { name: 'Croatia',        flag: '🇭🇷', region: 'Europe',        cities: 'Zagreb, Dubrovnik, Split, Rovinj'                     },
    { name: 'Czech Republic', flag: '🇨🇿', region: 'Europe',        cities: 'Prague'                                               },
    { name: 'Denmark',        flag: '🇩🇰', region: 'Europe',        cities: 'Copenhagen'                                           },
    { name: 'Finland',        flag: '🇫🇮', region: 'Europe',        cities: 'Helsinki'                                             },
    { name: 'France',         flag: '🇫🇷', region: 'Europe',        cities: 'Paris, Lyon, Marseille, Nice, Bordeaux, Toulouse, Strasbourg, Monaco' },
    { name: 'Germany',        flag: '🇩🇪', region: 'Europe',        cities: 'Berlin, Munich, Hamburg, Cologne, Frankfurt, Düsseldorf, Stuttgart'   },
    { name: 'Greece',         flag: '🇬🇷', region: 'Europe',        cities: 'Athens'                                               },
    { name: 'Hungary',        flag: '🇭🇺', region: 'Europe',        cities: 'Budapest'                                             },
    { name: 'Iceland',        flag: '🇮🇸', region: 'Europe',        cities: 'Reykjavík'                                            },
    { name: 'Ireland',        flag: '🇮🇪', region: 'Europe',        cities: 'Dublin, Cork'                                         },
    { name: 'Italy',          flag: '🇮🇹', region: 'Europe',        cities: 'Rome, Milan, Florence, Naples, Bologna, Turin, Venice, Palermo'       },
    { name: 'Luxembourg',     flag: '🇱🇺', region: 'Europe',        cities: 'Luxembourg City'                                      },
    { name: 'Malta',          flag: '🇲🇹', region: 'Europe',        cities: 'Valletta'                                             },
    { name: 'Netherlands',    flag: '🇳🇱', region: 'Europe',        cities: 'Amsterdam, Rotterdam, The Hague, Utrecht'             },
    { name: 'Norway',         flag: '🇳🇴', region: 'Europe',        cities: 'Oslo, Stavanger'                                      },
    { name: 'Poland',         flag: '🇵🇱', region: 'Europe',        cities: 'Warsaw, Kraków, Poznań'                               },
    { name: 'Portugal',       flag: '🇵🇹', region: 'Europe',        cities: 'Lisbon, Porto'                                        },
    { name: 'Serbia',         flag: '🇷🇸', region: 'Europe',        cities: 'Belgrade'                                             },
    { name: 'Slovenia',       flag: '🇸🇮', region: 'Europe',        cities: 'Ljubljana'                                            },
    { name: 'Spain',          flag: '🇪🇸', region: 'Europe',        cities: 'Madrid, Barcelona, San Sebastián, Valencia, Seville, Málaga, Bilbao, Girona' },
    { name: 'Sweden',         flag: '🇸🇪', region: 'Europe',        cities: 'Stockholm, Gothenburg'                                },
    { name: 'Switzerland',    flag: '🇨🇭', region: 'Europe',        cities: 'Zurich, Geneva, Basel, Lausanne'                      },
    { name: 'Türkiye',        flag: '🇹🇷', region: 'Europe',        cities: 'Istanbul, İzmir, Bodrum'                              },
    { name: 'United Kingdom', flag: '🇬🇧', region: 'Europe',        cities: 'London, Birmingham, Manchester, Edinburgh, Glasgow, Cardiff'          },

    // ── North America ────────────────────────────────────────────────────────
    { name: 'United States',  flag: '🇺🇸', region: 'North America', cities: 'New York, Chicago, San Francisco, Los Angeles, Washington D.C., Miami, Las Vegas' },
    { name: 'Canada',         flag: '🇨🇦', region: 'North America', cities: 'Toronto, Vancouver, Montreal'                         },
    { name: 'Mexico',         flag: '🇲🇽', region: 'North America', cities: 'Mexico City, Oaxaca'                                  },

    // ── South America ────────────────────────────────────────────────────────
    { name: 'Argentina',      flag: '🇦🇷', region: 'South America', cities: 'Buenos Aires, Mendoza'                                },
    { name: 'Brazil',         flag: '🇧🇷', region: 'South America', cities: 'São Paulo, Rio de Janeiro'                            },

    // ── Asia ─────────────────────────────────────────────────────────────────
    { name: 'China',          flag: '🇨🇳', region: 'Asia',          cities: 'Shanghai, Beijing, Guangzhou, Hangzhou'               },
    { name: 'Hong Kong',      flag: '🇭🇰', region: 'Asia',          cities: 'Hong Kong'                                            },
    { name: 'Macau',          flag: '🇲🇴', region: 'Asia',          cities: 'Macau'                                                },
    { name: 'India',          flag: '🇮🇳', region: 'Asia',          cities: 'Mumbai, New Delhi'                                    },
    { name: 'Indonesia',      flag: '🇮🇩', region: 'Asia',          cities: 'Bali'                                                 },
    { name: 'Japan',          flag: '🇯🇵', region: 'Asia',          cities: 'Tokyo, Osaka, Kyoto, Nara'                            },
    { name: 'Malaysia',       flag: '🇲🇾', region: 'Asia',          cities: 'Kuala Lumpur, Penang'                                 },
    { name: 'Singapore',      flag: '🇸🇬', region: 'Asia',          cities: 'Singapore'                                            },
    { name: 'South Korea',    flag: '🇰🇷', region: 'Asia',          cities: 'Seoul, Busan'                                         },
    { name: 'Thailand',       flag: '🇹🇭', region: 'Asia',          cities: 'Bangkok, Phuket'                                      },
    { name: 'Taiwan',         flag: '🇹🇼', region: 'Asia',          cities: 'Taipei, Taichung, Kaohsiung'                          },
    { name: 'Vietnam',        flag: '🇻🇳', region: 'Asia',          cities: 'Hanoi, Ho Chi Minh City, Da Nang'                     },

    // ── Middle East ──────────────────────────────────────────────────────────
    { name: 'Bahrain',        flag: '🇧🇭', region: 'Middle East',   cities: 'Manama'                                               },
    { name: 'UAE',            flag: '🇦🇪', region: 'Middle East',   cities: 'Dubai, Abu Dhabi'                                     },
    { name: 'Qatar',          flag: '🇶🇦', region: 'Middle East',   cities: 'Doha'                                                 },

    // ── Africa ───────────────────────────────────────────────────────────────
    { name: 'South Africa',   flag: '🇿🇦', region: 'Africa',        cities: 'Cape Town, Johannesburg'                              },
  ];

  get filteredCountries(): Country[] {
    if (this.selectedContinent === 'all') return this.countries;
    return this.countries.filter(c => c.region === this.selectedContinent);
  }

  setContinent(id: string): void {
    this.selectedContinent = id;
  }

  getFilteredCount(): number {
    return this.filteredCountries.length;
  }
}