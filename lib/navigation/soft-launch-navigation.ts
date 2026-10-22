export const softLaunchNavigation = [
  {
    label: "Home",
    href: "/home/",
    subcategories: [
      { label: "Kitchen", href: "/home/#kitchen" },
      { label: "Appliances", href: "/home/#appliances" },
      { label: "All About Coffee", href: "/home/#all-about-coffee" },
    ],
  },
  {
    label: "Travel",
    href: "/travel/",
    subcategories: [
      { label: "Connectivity", href: "/travel/#connectivity" },
      { label: "Travel Essentials", href: "/travel/#travel-essentials" },
      { label: "Luggage & Bags", href: "/travel/#luggage-and-bags" },
    ],
  },
  {
    label: "Outdoor",
    href: "/outdoor/",
    subcategories: [
      { label: "Camping", href: "/outdoor/#camping" },
      { label: "Hiking & Walking", href: "/outdoor/#hiking-and-walking" },
      { label: "Outdoor Gear", href: "/outdoor/#outdoor-gear" },
    ],
  },
  {
    label: "Lifestyle",
    href: "/lifestyle/",
    subcategories: [
      { label: "Personal Care", href: "/lifestyle/#personal-care" },
      { label: "Fitness & Wellbeing", href: "/lifestyle/#fitness-and-wellbeing" },
      { label: "Everyday Essentials", href: "/lifestyle/#everyday-essentials" },
    ],
  },
] as const;
