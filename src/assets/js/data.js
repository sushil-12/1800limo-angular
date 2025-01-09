const time_values = [
	{
		display_value: "12:00 AM - 0000 h",
		return_value: "00:00:00",
	},
	{
		display_value: "12:15 AM - 0015 h",
		return_value: "00:15:00",
	},
	{
		display_value: "12:30 AM - 0030 h",
		return_value: "00:30:00",
	},
	{
		display_value: "12:45 AM - 0045 h",
		return_value: "00:45:00",
	},
	{
		display_value: "1:00 AM - 0100 h",
		return_value: "1:00:00",
	},
	{
		display_value: "1:15 AM - 0115 h",
		return_value: "1:15:00",
	},
	{
		display_value: "1:30 AM - 0130 h",
		return_value: "1:30:00",
	},
	{
		display_value: "1:45 AM - 0145 h",
		return_value: "1:45:00",
	},
	{
		display_value: "2:00 AM - 0200 h",
		return_value: "2:00:00",
	},
	{
		display_value: "2:15 AM - 0215 h",
		return_value: "2:15:00",
	},
	{
		display_value: "2:30 AM - 0230 h",
		return_value: "2:30:00",
	},
	{
		display_value: "2:45 AM - 0245 h",
		return_value: "2:45:00",
	},
	{
		display_value: "3:00 AM - 0300 h",
		return_value: "3:00:00",
	},
	{
		display_value: "3:15 AM - 0315 h",
		return_value: "3:15:00",
	},
	{
		display_value: "3:30 AM - 0330 h",
		return_value: "3:30:00",
	},
	{
		display_value: "3:45 AM - 0345 h",
		return_value: "3:45:00",
	},
	{
		display_value: "4:00 AM - 0400 h",
		return_value: "4:00:00",
	},
	{
		display_value: "4:15 AM - 0415 h",
		return_value: "4:15:00",
	},
	{
		display_value: "4:30 AM - 0430 h",
		return_value: "4:30:00",
	},
	{
		display_value: "4:45 AM - 0445 h",
		return_value: "4:45:00",
	},
	{
		display_value: "5:00 AM - 0500 h",
		return_value: "5:00:00",
	},
	{
		display_value: "5:15 AM - 0515 h",
		return_value: "5:15:00",
	},
	{
		display_value: "5:30 AM - 0530 h",
		return_value: "5:30:00",
	},
	{
		display_value: "5:45 AM - 0545 h",
		return_value: "5:45:00",
	},
	{
		display_value: "6:00 AM - 0600 h",
		return_value: "6:00:00",
	},
	{
		display_value: "6:15 AM - 0615 h",
		return_value: "6:15:00",
	},
	{
		display_value: "6:30 AM - 0630 h",
		return_value: "6:30:00",
	},
	{
		display_value: "6:45 AM - 0645 h",
		return_value: "6:45:00",
	},
	{
		display_value: "7:00 AM - 0700 h",
		return_value: "7:00:00",
	},
	{
		display_value: "7:15 AM - 0715 h",
		return_value: "7:15:00",
	},
	{
		display_value: "7:30 AM - 0730 h",
		return_value: "7:30:00",
	},
	{
		display_value: "7:45 AM - 0745 h",
		return_value: "7:45:00",
	},
	{
		display_value: "8:00 AM - 0800 h",
		return_value: "8:00:00",
	},
	{
		display_value: "8:15 AM - 0815 h",
		return_value: "8:15:00",
	},
	{
		display_value: "8:30 AM - 0830 h",
		return_value: "8:30:00",
	},
	{
		display_value: " 8:45 AM - 0845 h",
		return_value: "8:45:00",
	},
	{
		display_value: "9:00 AM - 0900 h",
		return_value: "9:00:00",
	},
	{
		display_value: "9:15 AM - 0915 h",
		return_value: "9:15:00",
	},
	{
		display_value: "9:30 AM - 0930 h",
		return_value: "9:30:00",
	},
	{
		display_value: "9:45 AM - 0945 h",
		return_value: "9:45:00",
	},
	{
		display_value: "10:00 AM - 1000 h",
		return_value: "10:00:00",
	},
	{
		display_value: "10:15 AM - 1015 h",
		return_value: "10:15:00",
	},
	{
		display_value: "10:30 AM - 1030 h",
		return_value: "10:30:00",
	},
	{
		display_value: "10:45 AM - 1045 h",
		return_value: "10:45:00",
	},
	{
		display_value: "11:00 AM - 1100 h",
		return_value: "11:00:00",
	},
	{
		display_value: "11:15 AM - 1115 h",
		return_value: "11:15:00",
	},
	{
		display_value: "11:30 AM - 1130 h",
		return_value: "11:30:00",
	},
	{
		display_value: "11:45 AM - 1145 h",
		return_value: "11:45:00",
	},
	{
		display_value: "12:00 PM - 1200 h",
		return_value: "12:00:00",
	},
	{
		display_value: "12:15 PM - 1215 h",
		return_value: "12:15:00",
	},
	{
		display_value: "12:30 PM - 1230 h",
		return_value: "12:30:00",
	},
	{
		display_value: "12:45 PM - 1245 h",
		return_value: "12:45:00",
	},
	{
		display_value: "1:00 PM - 1300 h",
		return_value: "13:00:00",
	},
	{
		display_value: "1:15 PM - 1315 h",
		return_value: "13:15:00",
	},
	{
		display_value: "1:30 PM - 1330 h",
		return_value: "13:30:00",
	},
	{
		display_value: "1:45 PM - 1345 h",
		return_value: "13:45:00",
	},
	{
		display_value: "2:00 PM - 1400 h",
		return_value: "14:00:00",
	},
	{
		display_value: "2:15 PM - 1415 h",
		return_value: "14:15:00",
	},
	{
		display_value: "2:30 PM - 1430 h",
		return_value: "14:30:00",
	},
	{
		display_value: "2:45 PM - 1445 h",
		return_value: "14:45:00",
	},
	{
		display_value: "3:00 PM - 1500 h",
		return_value: "15:00:00",
	},
	{
		display_value: "3:15 PM - 1515 h",
		return_value: "15:15:00",
	},
	{
		display_value: "3:30 PM - 1530 h",
		return_value: "15:30:00",
	},
	{
		display_value: "3:45 PM - 1545 h",
		return_value: "15:45:00",
	},
	{
		display_value: "4:00 PM - 1600 h",
		return_value: "16:00:00",
	},
	{
		display_value: "4:15 PM - 1615 h",
		return_value: "16:15:00",
	},
	{
		display_value: "4:30 PM - 1630 h",
		return_value: "16:30:00",
	},
	{
		display_value: "4:45 PM - 1645 h",
		return_value: "16:45:00",
	},
	{
		display_value: "5:00 PM - 1700 h",
		return_value: "17:00:00",
	},
	{
		display_value: "5:15 PM - 1715 h",
		return_value: "17:15:00",
	},
	{
		display_value: "5:30 PM - 1730 h",
		return_value: "17:30:00",
	},
	{
		display_value: "5:45 PM - 1745 h",
		return_value: "17:45:00",
	},
	{
		display_value: "6:00 PM - 1800 h",
		return_value: "18:00:00",
	},
	{
		display_value: "6:15 PM - 1815 h",
		return_value: "18:15:00",
	},
	{
		display_value: "6:30 PM - 1830 h",
		return_value: "18:30:00",
	},
	{
		display_value: "6:45 PM - 1845 h",
		return_value: "18:45:00",
	},
	{
		display_value: "7:00 PM - 1900 h",
		return_value: "19:00:00",
	},
	{
		display_value: "7:15 PM - 1915 h",
		return_value: "19:15:00",
	},
	{
		display_value: "7:30 PM - 1930 h",
		return_value: "19:30:00",
	},
	{
		display_value: "7:45 PM - 1945 h",
		return_value: "19:45:00",
	},
	{
		display_value: "8:00 PM - 2000 h",
		return_value: "20:00:00",
	},
	{
		display_value: "8:15 PM - 2015 h",
		return_value: "20:15:00",
	},
	{
		display_value: "8:30 PM - 2030 h",
		return_value: "20:30:00",
	},
	{
		display_value: "8:45 PM - 2045 h",
		return_value: "20:45:00",
	},
	{
		display_value: "9:00 PM - 2100 h",
		return_value: "21:00:00",
	},
	{
		display_value: "9:15 PM - 2115 h",
		return_value: "21:15:00",
	},
	{
		display_value: "9:30 PM - 2130 h",
		return_value: "21:30:00",
	},
	{
		display_value: "9:45 PM - 2145 h",
		return_value: "21:45:00",
	},
	{
		display_value: "10:00 PM - 2200 h",
		return_value: "22:00:00",
	},
	{
		display_value: "10:15 PM - 2215 h",
		return_value: "22:15:00",
	},
	{
		display_value: "10:30 PM - 2230 h",
		return_value: "22:30:00",
	},
	{
		display_value: "10:45 PM - 2245 h",
		return_value: "22:45:00",
	},
	{
		display_value: "11:00 PM - 2300 h",
		return_value: "23:00:00",
	},
	{
		display_value: "11:15 PM - 2315 h",
		return_value: "23:15:00",
	},
	{
		display_value: "11:30 PM - 2330 h",
		return_value: "23:30:00",
	},
	{
		display_value: "11:45 PM - 2345 h",
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

const reportsYear = [
	{
        "id": "2025",
        "value": "2025"
    },
    {
        "id": "2024",
        "value": "2024"
    },
    {
        "id": "2023",
		"value": "2023"
	},
    {
        "id": "2022",
        "value": "2022"
    }
]

const reportsStatus = [
    {
        "id": "Paid",
        "value": "Paid"
    },
	{
        "id": "Assigned",
        "value": "Assigned"
    },
    {
        "id": "Cancelled",
		"value": "Cancelled"
	},
    {
        "id": "Pending",
        "value": "Pending"
    }
]

export const constant_data = {
	time_values,
	hour_values,
	countries,
	personallist,
	reportsYear,
	reportsStatus
}