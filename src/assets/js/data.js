const time_values = [
	{
		display_value: "h 1200 - 12:00 AM",
		return_value: "00:00:00",
	},
	{
		display_value: "h 1215 - 12:15 AM",
		return_value: "00:15:00",
	},
	{
		display_value: "h 1230 - 12:30 AM",
		return_value: "00:30:00",
	},
	{
		display_value: "h 1245 - 12:45 AM",
		return_value: "00:45:00",
	},
	{
		display_value: "h 0100 - 1:00 AM",
		return_value: "1:00:00",
	},
	{
		display_value: "h 0115 - 1:15 AM",
		return_value: "1:15:00",
	},
	{
		display_value: "h 0130 - 1:30 AM",
		return_value: "1:30:00",
	},
	{
		display_value: "h 0145 - 1:45 AM",
		return_value: "1:45:00",
	},
	{
		display_value: "h 0200 - 2:00 AM",
		return_value: "2:00:00",
	},
	{
		display_value: "h 0215 - 2:15 AM",
		return_value: "2:15:00",
	},
	{
		display_value: "h 0230 - 2:30 AM",
		return_value: "2:30:00",
	},
	{
		display_value: "h 0245 - 2:45 AM",
		return_value: "2:45:00",
	},
	{
		display_value: "h 0300 - 3:00 AM",
		return_value: "3:00:00",
	},
	{
		display_value: "h 0315 - 3:15 AM",
		return_value: "3:15:00",
	},
	{
		display_value: "h 0330 - 3:30 AM",
		return_value: "3:30:00",
	},
	{
		display_value: "h 0345 - 3:45 AM",
		return_value: "3:45:00",
	},
	{
		display_value: "h 0400 - 4:00 AM",
		return_value: "4:00:00",
	},
	{
		display_value: "h 0415 - 4:15 AM",
		return_value: "4:15:00",
	},
	{
		display_value: "h 0430 - 4:30 AM",
		return_value: "4:30:00",
	},
	{
		display_value: "h 0445 - 4:45 AM",
		return_value: "4:45:00",
	},
	{
		display_value: "h 0500 - 5:00 AM",
		return_value: "5:00:00",
	},
	{
		display_value: "h 0515 - 5:15 AM",
		return_value: "5:15:00",
	},
	{
		display_value: "h 0530 - 5:30 AM",
		return_value: "5:30:00",
	},
	{
		display_value: "h 0545 - 5:45 AM",
		return_value: "5:45:00",
	},
	{
		display_value: "h 0600 - 6:00 AM",
		return_value: "6:00:00",
	},
	{
		display_value: "h 0615 - 6:15 AM",
		return_value: "6:15:00",
	},
	{
		display_value: "h 0630 - 6:30 AM",
		return_value: "6:30:00",
	},
	{
		display_value: "h 0645 - 6:45 AM",
		return_value: "6:45:00",
	},
	{
		display_value: "h 0700 - 7:00 AM",
		return_value: "7:00:00",
	},
	{
		display_value: "h 0715 - 7:15 AM",
		return_value: "7:15:00",
	},
	{
		display_value: "h 0730 - 7:30 AM",
		return_value: "7:30:00",
	},
	{
		display_value: "h 0745 - 7:45 AM",
		return_value: "7:45:00",
	},
	{
		display_value: "h 0800 - 8:00 AM",
		return_value: "8:00:00",
	},
	{
		display_value: "h 0815 - 8:15 AM",
		return_value: "8:15:00",
	},
	{
		display_value: "h 0830 - 8:30 AM",
		return_value: "8:30:00",
	},
	{
		display_value: "h 0845 - 8:45 AM",
		return_value: "8:45:00",
	},
	{
		display_value: "h 0900 - 9:00 AM",
		return_value: "9:00:00",
	},
	{
		display_value: "h 0915 - 9:15 AM",
		return_value: "9:15:00",
	},
	{
		display_value: "h 0930 - 9:30 AM",
		return_value: "9:30:00",
	},
	{
		display_value: "h 0945 - 9:45 AM",
		return_value: "9:45:00",
	},
	{
		display_value: "h 1000 - 10:00 AM",
		return_value: "10:00:00",
	},
	{
		display_value: "h 1015 - 10:15 AM",
		return_value: "10:15:00",
	},
	{
		display_value: "h 1030 - 10:30 AM",
		return_value: "10:30:00",
	},
	{
		display_value: "h 1045 - 10:45 AM",
		return_value: "10:45:00",
	},
	{
		display_value: "h 1100 - 11:00 AM",
		return_value: "11:00:00",
	},
	{
		display_value: "h 1115 - 11:15 AM",
		return_value: "11:15:00",
	},
	{
		display_value: "h 1130 - 11:30 AM",
		return_value: "11:30:00",
	},
	{
		display_value: "h 1145 - 11:45 AM",
		return_value: "11:45:00",
	},
	{
		display_value: "12:00 PM - h 1200",
		return_value: "12:00:00",
	},
	{
		display_value: "12:15 PM - h 1215",
		return_value: "12:15:00",
	},
	{
		display_value: "12:30 PM - h 1230",
		return_value: "12:30:00",
	},
	{
		display_value: "12:45 PM - h 1245",
		return_value: "12:45:00",
	},
	{
		display_value: "1:00 PM - h 1300",
		return_value: "13:00:00",
	},
	{
		display_value: "1:15 PM - h 1315",
		return_value: "13:15:00",
	},
	{
		display_value: "1:30 PM - h 1330",
		return_value: "13:30:00",
	},
	{
		display_value: "1:45 PM - h 1345",
		return_value: "13:45:00",
	},
	{
		display_value: "2:00 PM - h 1400",
		return_value: "14:00:00",
	},
	{
		display_value: "2:15 PM - h 1415",
		return_value: "14:15:00",
	},
	{
		display_value: "2:30 PM - h 1430",
		return_value: "14:30:00",
	},
	{
		display_value: "2:45 PM - h 1445",
		return_value: "14:45:00",
	},
	{
		display_value: "3:00 PM - h 1500",
		return_value: "15:00:00",
	},
	{
		display_value: "3:15 PM - h 1515",
		return_value: "15:15:00",
	},
	{
		display_value: "3:30 PM - h 1530",
		return_value: "15:30:00",
	},
	{
		display_value: "3:45 PM - h 1545",
		return_value: "15:45:00",
	},
	{
		display_value: "4:00 PM - h 1600",
		return_value: "16:00:00",
	},
	{
		display_value: "4:15 PM - h 1615",
		return_value: "16:15:00",
	},
	{
		display_value: "4:30 PM - h 1630",
		return_value: "16:30:00",
	},
	{
		display_value: "4:45 PM - h 1645",
		return_value: "16:45:00",
	},
	{
		display_value: "5:00 PM - h 1700",
		return_value: "17:00:00",
	},
	{
		display_value: "5:15 PM - h 1715",
		return_value: "17:15:00",
	},
	{
		display_value: "5:30 PM - h 1730",
		return_value: "17:30:00",
	},
	{
		display_value: "5:45 PM - h 1745",
		return_value: "17:45:00",
	},
	{
		display_value: "6:00 PM - h 1800",
		return_value: "18:00:00",
	},
	{
		display_value: "6:15 PM - h 1815",
		return_value: "18:15:00",
	},
	{
		display_value: "6:30 PM - h 1830",
		return_value: "18:30:00",
	},
	{
		display_value: "6:45 PM - h 1845",
		return_value: "18:45:00",
	},
	{
		display_value: "7:00 PM - h 1900",
		return_value: "19:00:00",
	},
	{
		display_value: "7:15 PM - h 1915",
		return_value: "19:15:00",
	},
	{
		display_value: "7:30 PM - h 1930",
		return_value: "19:30:00",
	},
	{
		display_value: "7:45 PM - h 1945",
		return_value: "19:45:00",
	},
	{
		display_value: "8:00 PM - h 2000",
		return_value: "20:00:00",
	},
	{
		display_value: "8:15 PM - h 2015",
		return_value: "20:15:00",
	},
	{
		display_value: "8:30 PM - h 2030",
		return_value: "20:30:00",
	},
	{
		display_value: "8:45 PM - h 2045",
		return_value: "20:45:00",
	},
	{
		display_value: "9:00 PM - h 2100",
		return_value: "21:00:00",
	},
	{
		display_value: "9:15 PM - h 2115",
		return_value: "21:15:00",
	},
	{
		display_value: "9:30 PM - h 2130",
		return_value: "21:30:00",
	},
	{
		display_value: "9:45 PM - h 2145",
		return_value: "21:45:00",
	},
	{
		display_value: "10:00 PM - h 2200",
		return_value: "22:00:00",
	},
	{
		display_value: "10:15 PM - h 2215",
		return_value: "22:15:00",
	},
	{
		display_value: "10:30 PM - h 2230",
		return_value: "22:30:00",
	},
	{
		display_value: "10:45 PM - h 2245",
		return_value: "22:45:00",
	},
	{
		display_value: "11:00 PM - h 2300",
		return_value: "23:00:00",
	},
	{
		display_value: "11:15 PM - h 2315",
		return_value: "23:15:00",
	},
	{
		display_value: "11:30 PM - h 2330",
		return_value: "23:30:00",
	},
	{
		display_value: "11:45 PM - h 2345",
		return_value: "23:45:00",
	}
];


const hour_values = [
	{
		return_value: 2,
		display_value: "2 Hours Minimum"
	},
	{
		return_value: 3,
		display_value: "3 Hours"
	},
	{
		return_value: 4,
		display_value: "4 Hours"
	},
	{
		return_value: 5,
		display_value: "5 Hours"
	},
	{
		return_value: 6,
		display_value: "6 Hours"
	},
	{
		return_value: 7,
		display_value: "7 Hours"
	},
	{
		return_value: 8,
		display_value: "8 Hours"
	},
	{
		return_value: 9,
		display_value: "9 Hours"
	},
	{
		return_value: 24,
		display_value: "1 Day"
	},
	{
		return_value: 48,
		display_value: "2 Days"
	},
	{
		return_value: 72,
		display_value: "3 Days"
	},
	{
		return_value: 96,
		display_value: "4 Days"
	},
	{
		return_value: 120,
		display_value: "5 Days"
	},
	{
		return_value: 144,
		display_value: "6 Days"
	},
	{
		return_value: 168,
		display_value: "7 Days"
	},
	{
		return_value: 192,
		display_value: "8 Days"
	},
	{
		return_value: 216,
		display_value: "9 Days"
	},
	{
		return_value: 240,
		display_value: "10 Days"
	},
	{
		return_value: 264,
		display_value: "11 Days"
	},
	{
		return_value: 288,
		display_value: "12 Days"
	},
	{
		return_value: 312,
		display_value: "13 Days"
	},
	{
		return_value: 336,
		display_value: "14 Days"
	},
	{
		return_value: 360,
		display_value: "15 Days"
	},
	{
		return_value: 384,
		display_value: "16 Days"
	},
	{
		return_value: 408,
		display_value: "17 Days"
	},
	{
		return_value: 432,
		display_value: "18 Days"
	},
	{
		return_value: 456,
		display_value: "19 Days"
	},
	{
		return_value: 480,
		display_value: "20 Days"
	},
	{
		return_value: 504,
		display_value: "21 Days"
	},
	{
		return_value: 528,
		display_value: "22 Days"
	},
	{
		return_value: 552,
		display_value: "23 Days"
	},
	{
		return_value: 576,
		display_value: "24 Days"
	},
	{
		return_value: 600,
		display_value: "25 Days"
	},
	{
		return_value: 624,
		display_value: "26 Days"
	},
	{
		return_value: 648,
		display_value: "27 Days"
	},
	{
		return_value: 672,
		display_value: "28 Days"
	},
	{
		return_value: 696,
		display_value: "29 Days"
	},
	{
		return_value: 720,
		display_value: "30 Days"
	},
	{
		return_value: 744,
		display_value: "31 Days"
	}
]


const countries = [
	"Argentina",
	"Australia",
	"Austria",
	"Belgium",
	"Bolivia",
	"Brazil",
	"Bulgaria",
	"Canada",
	"Chile",
	"Colombia",
	"Croatia",
	"Cyprus",
	"Czech Republic",
	"Denmark",
	"Dominican Republic",
	"Egypt",
	"Estonia",
	"Finland",
	"France",
	"Germany",
	"Greece",
	"Hong Kong",
	"Hungary",
	"India",
	"Iceland",
	"Indonesia",
	"Ireland",
	"Israel",
	"Italy",
	"Japan",
	"Latvia",
	"Liechtenstein",
	"Lithuania",
	"Luxembourg",
	"Malaysia",
	"Malta",
	"Mexico",
	"Netherlands",
	"New Zealand",
	"Norway",
	"Paraguay",
	"Peru",
	"Poland",
	"Portugal",
	"Romania",
	"Singapore",
	'Slovakia',
	"Slovenia",
	"Spain",
	"Sweden",
	"Switzerland",
	"Trinidad Tobago",
	"United Arab Emirates",
	"United Kingdom",
	"United States",
	"Uruguay"
];


const personallist = [
	"Airport Transfers",
	"City to City Transfers",
	"Cruise Ports",
	"Festivals, Excursions and Tours",
	"Multi Mix Vehicle Transfers and Charters",
	"Non-Emergency Medical Transfers",
	"Conventions & Shopping",
	"Corporate Accounts Welcome",
	"Individuals and Couples",
	"Memorial Services",
	"Small and Large Group Transfers",
	"Travel Agent Friendly",
	"Handicap"
];

export const constant_data = {
	time_values,
	hour_values,
	countries,
	personallist
}