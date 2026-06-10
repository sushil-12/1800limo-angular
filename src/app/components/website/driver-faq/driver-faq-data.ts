export interface FAQ {
    question: string;
    answer: string;
    category: 'requirements' | 'application' | 'earnings' | 'operations';
    isOpen?: boolean;
}

export const driverFaqMetaData = {
    title: "Driver FAQ | 1-800-LIMO.COM",
    description: "Learn how to join 1-800-LIMO.COM as a driver. Find answers to requirements, application processes, earnings, and operations.",
    keywords: "driver FAQ, driving for 1-800-LIMO, chauffeur jobs, limo driver requirements"
};

export const driverFaqData: FAQ[] = [
    {
        category: 'operations',
        question: "What is 1-800-LIMO.COM?",
        answer: "1-800-LIMO.COM Is an online, global free-market ground transportation platform. Competition is good for everyone. Show your best profile. We designed our platform around great drivers with the nicest vehicles. We made it simple to use and to work similarly to Match.com and eBay Motors. We match great drivers with great customers who appreciate consistent quality, worry-free ground transportation at competitive, not cheap rates."
    },
    {
        category: 'requirements',
        question: "Who can join 1-800-LIMO.COM?",
        answer: "Any consumer or driver can join, but not everyone will be able to stay. Users and drivers will be rated by their friendliness and appreciation. We only want the best customers and drivers who enjoy the features, advantages and benefits that 1-800-LIMO.COM offers its members."
    },
    {
        category: 'application',
        question: "How do I join 1-800-LIMO.COM and is there a cost?",
        answer: "We are looking for only the best drivers with nicer, newer, larger vehicles. Our customers are looking for you! Keep your independence, set your own schedule and set your own rates. Keep your tips. You control your own rates and can change them in real-time depending on demand. There is no surge pricing. You can stay driving with us as long as you get a thumbs up rating from our travelers. 3 thumbs down ratings and you're out (or fix the problem). You can accept or reject any booking. You'll be able to do both on-demand and prearranged rides (you’ll earn more per ride) and see pickup and drop off locations when you get a new booking. There are no surprises working with 1-800-LIMO.COM. We’re all about keeping great drivers on the road doing what you do best! We’ll keep you happy and loyal."
    },
    {
        category: 'application',
        question: "Which documents do I need to fully register?",
        answer: `Taxi, Limo, Gig Drivers
<ul>
<li>Photo of Driver license.</li>
<li>Photo of Head and Shoulder – You want to look your best and wear the clothes you wear for work. Dress professionally.</li>
<li>Photos of your vehicle – front and rear side views, interior front and rear seating, front and rear view of specialty vehicles (vans, minibuses, party buses, motor coaches.</li>
<li>Photo of rear license plate.</li>
<li>Photo of Proof of Insurance – add 1-800-LIMO.COM as additional insurance.</li>
<li>Photo of Permits - city license, state licenses (if applicable), window sticker permits for airports and sea ports.</li>
<li>Gig Drivers
<ul>
<li>All gig drivers need proof of finger print document, city license.</li>
<li>Proof of 4.5 – 5-star rating screen from your Uber or Lyft app.</li>
<li>Gig drivers must have a minimum of three months driving experience.</li>
</ul>
</li>
</ul>
Fleet/Coach Operators 
<ul>
<li>Photo of State/City Permits</li>
<li>ICC number (if applicable)</li>
<li>Proof of insurance</li>
<li>Pictures of vehicles</li>
</ul>`
    },
    {
        category: 'earnings',
        question: "What are the driver benefits?",
        answer: `1-800-LIMO.COM wants to improve your efficiencies and increase your income. 
<ul>
<li>You’ll earn more per mile and per hour driving with us.</li>
<li>With our free software and app, you can view your past, present and future bookings. You can also view your daily, weekly, monthly and annual income statement.</li>
<li>We’ll send you business that fits your schedule. Set your own hours and rates. We work as a team.</li>
<li>You can accept or reject any booking.</li>
<li>Our customers know a competitive rate and will tip extra if they like you. The best compliment is if they ask for you again.</li>
<li>Be as competitive as the market demands. You can change your rates in real time.</li>
<li>You’ll get paid in 3 business days after funds are collected from the client.</li>
<li>You are responsible for all local, state and federal taxes.</li>
<li>Be friendly, stay in a good mood, be helpful with luggage and the door, appreciate their patronage, befriend the clients we send you and turn them into repeat customers.</li>
</ul>`
    },
    {
        category: 'operations',
        question: "Will 1-800-LIMO use autonomous vehicles?",
        answer: "NO, but we believe autonomous vehicles can serve a purpose in a limited capacity."
    },
    {
        category: 'earnings',
        question: "Is there any profit sharing or other benefits?",
        answer: "Not at this time."
    },
    {
        category: 'requirements',
        question: "What vehicle can I use?",
        answer: "You can use any 4-door vehicle for commercial use that is allowed by city ordinance and state law. See our vehicle registration screen for a detailed list. The best vehicles are those that seat up to four passengers comfortably and carry a minimum of two large luggage."
    },
    {
        category: 'operations',
        question: "How do I get new bookings?",
        answer: "We’ll send an email and a text alert for pre-arranged and on-demand bookings. You can either Accept or Reject without penalty."
    },
    {
        category: 'operations',
        question: "How do I communicate with dispatch",
        answer: "Call 1-800-LIMO.COM (+1-800-5466-266) or text 708-205-6607."
    },
    {
        category: 'operations',
        question: "How do I communicate with the customer?",
        answer: "You can text or call from the information on the reservation."
    },
    {
        category: 'requirements',
        question: "Do I need driver training?",
        answer: "No but it never hurts to refresh yourself by reading the “Rules of the Road” for your state. Gig drivers must have at least 3 months driving experience with Uber or Lyft and be rated 4.5 stars or higher to join 1-800-LIMO.COM."
    },
    {
        category: 'requirements',
        question: "What is expected of me as a Back Car, Limo, Taxi, Gig or Fleet driver?",
        answer: "Honesty, integrity, professionalism and good behavior. You represent yourself first but also 1-800-LIMO.COM. Keep a neat appearance and keep your car clean."
    },
    {
        category: 'operations',
        question: "Can I solicit the passenger for personal business?",
        answer: "No, drivers nor customers should solicit each other."
    },
     {
        category: 'earnings',
        question: "How much commission do I pay?",
        answer: "We take a 25% commission – taxes, tolls, and any other expenses are paid by the client to you directly. You are responsible for paying all local, state and federal taxes."
    },
    {
        category: 'earnings',
        question: "Is there surge pricing",
        answer: "No, there is no surge pricing."
    },
    {
        category: 'operations',
        question: "What is the cancellation policy?",
        answer: "If you reject or cancel a booking within a 2-hour minimum, we will do our best to cover that booking for the same rate and vehicle and explain to the client. If we cannot cover that booking for the same rate and vehicle, you will be responsible for the difference in price to the clients. Do not accept a booking if you are going to be late or may have to cancel."
    },
    {
        category: 'earnings',
        question: "How and when do I get paid?",
        answer: "You will receive a direct deposit within 3 business days from the date funds are received from the client."
    },
    {
        category: 'operations',
        question: "Can I reject a booking?",
        answer: "You can reject any booking at any time."
    },
    {
        category: 'operations',
        question: "Why do I get rated by the customer?",
        answer: "We want you always to be at your best. Customers want consistency and worry-free travel"
    },
    {
        category: 'operations',
        question: "Can I be fired?",
        answer: "Yes, you and the client can “fire” each other."
    },
    {
        category: 'operations',
        question: "Can I accept a booking then reject the same booking later?",
        answer: "Yes, you can accept and reject a booking but you must allow sufficient time for us to cover with another driver. If we cannot cover at the same price, you are responsible for the difference. If we cannot cover at all, you can be deleted as a driver."
    },
    {
        category: 'application',
        question: "Why do I have to give my social security number or EIN?",
        answer: "We need your SSN for proof of ID, for banking purposes and tax returns."
    }
];
