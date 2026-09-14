export interface FAQ {
    question: string;
    answer: string;
    category: 'booking' | 'payment' | 'fleet' | 'policies';
    isOpen?: boolean;
}

export const customerFaqMetaData = {
    title: "Customer FAQ | 1-800-LIMO.COM",
    description: "Find answers to frequently asked questions about booking, payments, fleet, and policies at 1-800-LIMO.COM.",
    keywords: "customer FAQ, limo service questions, booking limo, premium transportation FAQ"
};

export const customerFaqData: FAQ[] = [
    {
        category: 'policies',
        question: "Who can join 1-800-LIMO.COM?",
        answer: "Any consumer or driver can join, but not everyone will be able to stay. Users and drivers will be rated by their friendliness and appreciation. We only want the best customers and drivers who enjoy the features, advantages and benefits that 1-800-LIMO.COM offers its members."
    },
    {
        category: 'fleet',
        question: "What is 1-800-LIMO.COM?",
        answer: "1-800-LIMO.COM matches great customers with the best drivers and nicest vehicles in every city you travel. We cater to demanding customers who appreciate great drivers who will provide you with the personalized, worry-free travel experience you expect. We offer more features, advantages and benefits than any other ground transportation provider and at the lowest available cost."
    },
    {
        category: 'payment',
        question: "Who sets the rates?",
        answer: "1-800-LIMO.COM is different on many levels. Our independent drivers set their own rates. They can raise and lower their rates in real-time depending on actual demand. We will never surge price. Our objective is for drivers to charge a fair and competitive rate all of the time."
    },
    {
        category: 'payment',
        question: "What does the rate include?",
        answer: "The rate quoted is all-inclusive. Tip, tax, tolls, extra stops, baby seat, booster seat and bike racks will be listed in that rate. Additional charges may apply if changes are made in route."
    },
    {
        category: 'booking',
        question: "Do I get a confirmation?",
        answer: "Yes, we send a confirmation to your email address and/or phone."
    },
    {
        category: 'booking',
        question: "Why did I get a failed quote from the Quotbot?",
        answer: "Our software algorithm was designed to quote a rate for any destination and in any vehicle. However, there are areas that we do not have coverage yet."
    },
    {
        category: 'fleet',
        question: "What types of vehicles and services does 1-800-LIMO.COM offer?",
        answer: "Our system will display all available vehicle types that match the number of passengers and luggage. It is critical you enter the correct numbers to ensure that you receive the needed vehicle. We want to make sure the proper vehicle will be quoted and dispatched to safely transport you and your party to your destination."
    },
    {
        category: 'fleet',
        question: "Can I book a handicap accessible vehicle?",
        answer: "Yes, we currently offer handicap vehicles in certain cities and will expand to every major city in the future. We’ll be able to dispatch both lift and ramp vehicles to accommodate any size chair, manual or motorized. Our drivers will also happily transport any service animal. We do not provide oxygen."
    },
    {
        category: 'fleet',
        question: "Which cities does 1-800-LIMO serve?",
        answer: "We provide service in every major city and surrounding areas on all major continents. As more drivers join, we will be able to cover you seamlessly no matter where you travel."
    },
    {
        category: 'booking',
        question: "How can a make a reservation?",
        answer: "The easiest way to book is through our website or app. For those who wish to speak to a person, call our toll-free number 1-800-LIMO.COM (1-800-546-6266) and speak with our helpdesk. You can email if you get a failed rate info@1800limo.com."
    },
    {
        category: 'policies',
        question: "What is the cancellation policy?",
        answer: "Each type vehicle has a different cancellation policy. We realize unforeseen things happen and will work closely with our drivers if you cancel sooner, but we cannot guarantee a cancellation fee will not be charged.<br><br>Many simple airport transfers and business charters in smaller vehicles require at least 24 hours.<br>Larger vehicles, the day of the week, the time of the year or special event may require a minimum of 1 week for most charters and up to 4 weeks for specialty vehicles for weddings and proms."
    },
    {
        category: 'payment',
        question: "What are all-inclusive rates?",
        answer: "Our Quotebot is programmed to quote as close of a total as possible, which includes; the base rate, plus any special amenities, tip, taxes, tolls, and extra stops. We want to be totally transparent on rates, policies and procedures. We want you to be totally satisfied with all we do for you."
    },
    {
        category: 'fleet',
        question: "What is a private car?",
        answer: "A private car ride is reserved exclusively for you and your party. You will not share the vehicle with other passengers, and there will be no scheduled stops to pick up or drop off other riders. You can travel directly to your destination with the privacy and convenience of a dedicated vehicle."
    },
    {
        category: 'fleet',
        question: "What is the difference between Share Ride (not available at this time)?",
        answer: "A share ride is when you share a ride with a stranger, like in airplane, boat or rail. Multiple stops are scheduled along the same route. We normally only allow up to three stops total for most vehicles. You will be notified if a share rider cancels and if only a private car is available. All taxes and tolls will be split by all parties."
    },
    {
        category: 'fleet',
        question: "What is the difference between Limo, Taxi, Black Car and Ride Share?",
        answer: "No matter which vehicle and driver you book from 1-800-LIMO.COM, we assure you it matches your every requirement.<br><br>A limo generally implies a stretched vehicle, sedan, SUV, sport utility.<br>Taxis are the only livery vehicle that can be hailed on-demand without an app and are metered by distance and time.<br>Black cars are generally a sedan, SUV or sport utility vehicle and require a reservation either on-demand or prearranged.<br>Ride-Share are gig drivers using their personal vehicle. They can be ordered by app, call or other digital correspondence only."
    },
    {
        category: 'fleet',
        question: "What is a shuttle service?",
        answer: "Shuttle service is a vehicle, usual a van or minibus or motor coach, that transports a group of people and makes multiple stops along the way that are either scheduled or random depending upon the exact shuttle service requested."
    },
    {
        category: 'fleet',
        question: "How do I communicate with dispatch?",
        answer: "You can text or international call (001) (708-205-6607), email (info@1800limo.com), or call our toll-free number (1-800-546-6266) 24/7/365."
    }
];
