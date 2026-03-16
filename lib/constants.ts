export const NAV_LINKS = [
    { label: "About", href: "#about" },
    { label: "What is Micromouse", href: "#micromouse" },
    { label: "Timeline", href: "#timeline" },
    { label: "Sponsors", href: "#sponsors" },
    { label: "Register", href: "#register" },
];

export const HERO_STATS = [
    { icon: "🏁", label: "Competition Day: June 20, 2026" },
    { icon: "🤖", label: "Autonomous Micromouse Robots" },
    { icon: "🎓", label: "University of Moratuwa" },
];

export const ABOUT_FEATURES = [
    { icon: "💡", label: "Innovation in Robotics" },
    { icon: "🧩", label: "Algorithmic Problem-Solving" },
    { icon: "⚙️", label: "Embedded Systems Development" },
    { icon: "🔧", label: "Practical Engineering Skills" },
    { icon: "🤝", label: "Team Collaboration" },
];

export const MICROMOUSE_STATS = [
    { title: "Fully Autonomous", description: "No remote control" },
    { title: "Sensor-Driven", description: "IR or ultrasonic sensors" },
    { title: "Algorithm-Powered", description: "Flood-fill & more" },
];

export const TIMELINE_EVENTS = [
    {
        number: "01",
        title: "Registration Opens",
        date: "April 4th, 2026",
    },
    {
        number: "02",
        title: "Registration Closes",
        date: "May 5th, 2026",
    },
    {
        number: "03",
        title: "Competition Day",
        date: "June 20th, 2026",
    },
];

export const ORGANIZERS = [
    {
        title: "IEEE Robotics & Automation Society",
        subtitle: "Student Branch Chapter — University of Moratuwa",
        description:
            "Dedicated to advancing robotics and automation through innovation, education, and research. Fostering collaboration through technical events, publications, and research initiatives.",
        tag: "IEEE RAS",
    },
    {
        title: "IEEE Women in Engineering",
        subtitle: "Student Branch Affinity Group — University of Moratuwa",
        description:
            "Dedicated to uplifting women engineers by promoting gender diversity in engineering. Connecting over 30,000 members in more than 100 countries.",
        tag: "IEEE WIE",
    },
];

export interface SponsorTier {
    tier: string;
    amount: string;
    color: string;
    perks: string[];
    icon: string;
}

export const SPONSOR_TIERS: SponsorTier[] = [
    {
        tier: "Title Partner",
        amount: "LKR 150,000",
        color: "#EAF6FF",
        icon: "👑",
        perks: [
            "Exclusive naming rights",
            "Logo on all materials",
            "Opening ceremony speech",
            "Premium booth space",
        ],
    },
    {
        tier: "Gold Partner",
        amount: "LKR 100,000",
        color: "#F4C430",
        icon: "🥇",
        perks: [
            "Logo on banners & website",
            "Social media features",
            "Booth at competition",
            "Certificate of partnership",
        ],
    },
    {
        tier: "Silver Partner",
        amount: "LKR 75,000",
        color: "#A9D6E5",
        icon: "🥈",
        perks: [
            "Logo on website",
            "Social media mentions",
            "Brand visibility at event",
        ],
    },
    {
        tier: "Workshop Partner",
        amount: "LKR 75,000",
        color: "#61A5C2",
        icon: "🔬",
        perks: [
            "Brand in workshop materials",
            "Logo on certificates",
            "Mention in pre-event promotions",
        ],
    },
    {
        tier: "Gift Partner",
        amount: "LKR 50,000",
        color: "#2C7DA0",
        icon: "🎁",
        perks: [
            "Brand on gift items",
            "Logo on website",
            "Social media shoutout",
        ],
    },
    {
        tier: "Banking Partner",
        amount: "LKR 45,000",
        color: "#1B4965",
        icon: "🏦",
        perks: [
            "Logo on financial materials",
            "Mention during event",
            "Website logo placement",
        ],
    },
    {
        tier: "In-Kind",
        amount: "Negotiable",
        color: "#0D2233",
        icon: "🤝",
        perks: [
            "Custom partnership package",
            "Flexible contribution options",
            "Brand acknowledgment",
        ],
    },
];


export const PAST_EVENTS = [
    {
        title: "BotTalk",
        description:
            "A panel discussion where robotics and technology experts discussed industry insights, advancements, and future opportunities with the audience.",
    },
    {
        title: "Gammaddata IEEE Api",
        description:
            "A school workshop series introducing students to robotics and basic STEM concepts through interactive sessions and demonstrations.",
    },
    {
        title: "Robotics Day",
        description:
            "An exhibition showcasing University of Moratuwa robotics projects, with keynote sessions from RoboticGen and Zone24 featuring live robot demonstrations.",
    },
];

// Countdown target dates
export const REGISTRATION_OPEN_DATE = new Date("2026-04-04T00:00:00+05:30");
export const COMPETITION_DATE = new Date("2026-06-20T00:00:00+05:30");
