export interface GroupTravelFAQ {
    question: string;
    answer: string;
    category: 'requirements' | 'application' | 'earnings' | 'operations';
    isOpen?: boolean;
}

export const groupTravelMetaData = {
    title: "Group Travel Planner | 1-800-LIMO.COM",
    description: "Plan your group travel with 1-800-LIMO.COM. Find answers about motor coach rentals, group bookings, policy and fleet amenities.",
    keywords: "group travel planner, motor coach rental, charter bus FAQ, large group transportation"
};

export const GROUP_TRAVEL_CATEGORIES = [
    { id: 'all', label: 'All Questions', icon: 'bi-question-circle' },
    { id: 'requirements', label: 'Requirements', icon: 'bi-person-badge' },
    { id: 'application', label: 'Application Process', icon: 'bi-file-earmark-text' },
    { id: 'earnings', label: 'Earnings & Payment', icon: 'bi-currency-dollar' },
    { id: 'operations', label: 'Operations', icon: 'bi-briefcase' }
];

export const groupTravelFaqData: GroupTravelFAQ[] = [
    {
        category: 'requirements',
        question: "Why Travel by Bus or Motor Coach?",
        answer: `<p>Busses and Motor Coaches are safe and efficient. The Bureau of Transportation reports that buses are safer than cars and less polluting than traveling by air. A train is only safer.</p><p>Bureau of Transportation Statistics: https://www.bts.gov/</p><p>Buses, Mini-Buses, and Vans are a more efficient means of transportation providing door to door service, fewer vehicles on the road and decreasing air pollutants.</p><p>Buses are available to taxi your group around for your entire itinerary and we also offer handicap accessible vehicles, depending on availability. Buses are inexpensive when transporting groups compared to flying.</p>`
    },
    {
        category: 'requirements',
        question: "When is the final payment due?",
        answer: `<p>Final payment is due 10 to 30 days before departure.</p>`
    },
    {
        category: 'requirements',
        question: "What is the cancellation policy?",
        answer: `<p>Each of our affiliates operates a little differently but you should cancel at least 30 day in advance not to incur any cancelation penalty.</p>`
    },
    {
        category: 'requirements',
        question: "How soon should I book?",
        answer: `<p>We recommend booking 30 days in advance to reserve the nicest and newest buses. The less time, the fewer options you’ll have at your availability.</p>`
    },
    {
        category: 'requirements',
        question: "Do I need to tip the driver?",
        answer: `<p>It is our goal to make sure all of our drivers earn a living wage and to insure we have the best drivers available for your pleasure and safety. We never want to hear of a bad review, but your tip will be reduced or returned at your request and we’ll make sure our driver gets extra training to insure future bookings are met to your satisfaction.</p>`
    },
    {
        category: 'requirements',
        question: "Do I pay for parking, tolls and other fees?",
        answer: `<p>Our Quotebot is programmed to quote all-inclusive rates, but in those circumstances our algorithm or personalized service representative missed something, our affiliate will make sure that the final quote will be accurate. Our affiliate’s review every new booking for accuracy. Naturally, if you make extra stops or deviate from a planned route, there could be additional parking or tolls.</p>`
    },
    {
        category: 'requirements',
        question: "Do I need to book the hotel room for the driver?",
        answer: `<p>In most cases, yes, and we add a per diem charge for each night on the road. Some hotels will comp the driver’s stay when bringing in a large group. Ask your hotel group sales office if the driver’s room is accommodated and we will adjust your invoice accordingly.</p>`
    },
    {
        category: 'requirements',
        question: "Is alcohol or smoking allowed?",
        answer: `<p>You can search for a smoking bus or if alcohol is allowed on our Quotebot filter. There may be a refundable deposit to cover any unforeseen mishaps. Alcohol is not allowed on buses in Canada.</p>`
    },
    {
        category: 'requirements',
        question: "Can I purchase just one or two seats for a trip?",
        answer: `<p>Not at this time. We will be recruiting bus affiliates who do offer one person, two, or small group travel for concerts, political and sporting events, and other high demand, large crowd venues.</p>`
    },
    {
        category: 'application',
        question: "Charter Bus Amenities",
        answer: `<p>Our website or app is the easiest way to book. For those who wish to speak to customer service please call our toll-free number 1-800-LIMO.COM (1-800-546-6266) and chat with our helpdesk. You can also email info&#64;1800limo.com if you get a failed rate.</p>
        <p>You can use our Quotebot filter to search and book the ideal bus of choice by matching your every request or most of them.</p>
        <p>Search Amenitites in Quotebot Filter</p>
        <ul>
        <li>Qty - Quantity of the total number of specific vehicles you searched in their fleet.</li>
        <li>Seats and belts - The number of seats and seat belts available in each vehicle.</li>
        <li>Bus Types - We index all of the major bus makes and models. Not all bus types are available in every city. Use the Quotebot filter or send us an email Rate/Vehicle Request and one of our personalized service representatives will find exactly what you’re looking for.</li>
        <li>Year, Make, Color, Amenity – All of these features can be found on our Quotebot filter. You may see a range of years available. We will do our best to get exactly what you seek or as close as possible. Book early. Rate/Vehicle Request.</li>
        <li>OTR – Over the road buses, for long distance and overnight travel, can be chosen in the amenity choices on our Quotebot filter.</li>
        <li>Lavatory - Restroom on board.</li>
        <li>DVD - There are usually TV monitors both sides of the isle on board motor coaches. Wide screen TV can be found on Limo, Party Buses and some Sprinter Vans. Satellite TV are buses with special antenna and can be searched on our Quotebot amenity list.</li>
        <li>CD - CD player.</li>
        <li>PA - Public Address or Intercom system for touring and special announcements.</li>
        <li>ADA - Wheelchair elevator. Many smaller buses and vans are equipped with a ramp or lift.</li>
        <li>Alch - Alcohol permitted.</li>
        <li>One Way, Roundtrip, or Charter – We offer you more options than any other transportation company to get you or your group to and from your destination with any type vehicle using our Quotebot to search and book with the lowest available rate.</li>
        <li>2 - 6 Hour Min – The number of minimum hours is based by bus size and city. For local bus service, a 2 hour min can be booked. For longer distance or as directed local bookings are usually a 5 hour minimum. OTR buses are either by mileage or day rate.</li>
        <li>Day - Day rates are between 8 - 10 hours of local use.</li>
        <li>Mileage - The rate per mile to any two location, either locally, in-state, or out of state. Quotes are calculated either by a minimum rate and a mileage rate whichever is greater.</li>
        </ul>
        <p>Other amenities that can be found on buses are tables, booth-like seating, small beds, shades, carpeting, satellite and catered food. Mini-buses and vans have rear luggage compartments, reclining seats, captain chairs, and cargo trailers.</p>`
    },
    {
        category: 'earnings',
        question: "Bus Quote Results",
        answer: `<h4>Local Charters</h4>
        <ul>
        <li>Hours of use - Local travel is most commonly based on a minimum of hours. Each company is different and requires a minimum 2 - 6 hours. The time of year or special events may cause the minimum number of hours to increase beyond 6 hours.</li>
        <li>Minimum Rates and Mileage – Distance and route changes or length of time of the charter, by you, may change the subTotal Cost on your invoice.</li>
        <li>Additional Charges – There may be additional charges added to your invoice for additional service or amenity requests while on the road.</li>
        <li>Sales Tax - Our Quotebot calculates all-inclusive rates including any city, state tax or VAT.</li>
        </ul>
        <h4>OTR Charters</h4>
        <ul>
        <li>Driver Change - For every 10 hours of driving, or 15 hours of standby time, the law requires 10 consecutive hours of rest. If you plan on driving more than 10 hours, a mandatory driver change occurs. An extra fee from $300 to $1000 can be added to the invoice depending on the distance from the departure city were the change is made.</li>
        <li>Driver Change (long distance travel) – A driver can only driver so many hours pay day with rest. A driver change is necessary at an additional cost ($300-$900 depending on the diverted distance to pickup location).</li>
        <li>Additional Driver Suggestion – It is less expensive to hire a second driver per bus (an open seat must be available) at an hourly rate plus per diem to lessen the expense of changing drivers midway through the charter.</li>
        <li>Driver Hotel – The client usually pays for the hotel room, but many hotels will comp the room at no charge when you book for your group. Contact the hotel group sales office to ensure the room is comped.</li>
        <li>Gratuity - We automatically add 20%. The amount of the tip will be graciously reduced or refunded if not completely satisfied.</li>
        <li>Local Travel - The amount of local mileage allowed per day once the bus reaches the destination city.</li>
        <li>Mileage - Buses traveling out of the local area, one way are quoted in miles.</li>
        <li>Day Rate - The minimum charge per day if the per-mile charge is not more than the combined day rates.</li>
        <li>Sales Tax - CA has a 1% tax, and OH appx. 7.75%.</li>
        <li>Other expenses - Depending on your destination, you may encounter other fees such as bridge tolls or airport taxes, most companies include these in your initial quote, and some have you pay for them as they are incurred.</li>
        <li>Fuel Surcharge - We do not add a fuel charge. Our affiliates quote an all-inclusive rate when they accept your booking.</li>
        </ul>`
    },
    {
        category: 'operations',
        question: "Safety Regulations",
        answer: `<p>Drivers are required to carry a current DOT Physical Exam Card, follow DOT rules and regulations, and maintain a travel log. Some states require that they be certified for all school-sponsored trips, grades 12 and under. Motor Coaches are not required by state or federal law to have seatbelts.</p>
        <p>Individual owner operators including Taxi, Black Car, Limo drivers and Fleet/Coach owned operators are vetted through local city and state government background checks.</p>
        <p>Gig (Lyft/Uber) type drivers who drive with us will be required to obtain a state FOID card (Firearm Ownership Identification) card. 1-800-LIMO.COM believes this is the highest level of background check. We do not promote gun ownership, but rely on each State to inspect and vet the safest drivers. Driver safety is also verified with DMV (Driver Motor Vehicle) records in alliance with our insurance partners.</p>
        <p>More bus affiliates are either retrofitting seat belts into their older vehicles or buying new buses with seat belts installed. The United States Department of Transportation (USDOT) regulates the United States charter bus industry.</p>
        <p>The DOT regulation 395.10 restricts the number of hours the driver can operate the vehicle.</p>
        <ul>
        <li>10 Hour Rule. Cannot drive more than 10 hours following 8 consecutive hours off duty (except in emergencies)</li>
        <li>15 Hour Rule. After 15 hours on-duty (driving and non-driving tasks), the driver cannot continue operating the vehicle until 8 consecutive hours off-duty.</li>
        <li>70 Hour Rule. Driving cannot exceed 70 hours for 8 consecutive days.</li>
        </ul>
        <p>Canadian drivers are required to maintain a log for miles and hours of service. Alcohol is not allowed.</p>
        <p>The Commercial Vehicle Drivers Hours of Service Regulations (SOR/2005-313) Act restricts driving time.</p>
        <ul>
        <li>The drivers are not allowed to work more than 13 hours in a day.</li>
        <li>After driving 13 hours in a day, at least 8 consecutive hours of off-duty time is required before driving again.</li>
        <li>Drivers must have at least 10 hours off-duty per day. Daily off-duty time must include 2 hours that do not form part of an 8 consecutive hour off-duty period.</li>
        </ul>`
    }
];
