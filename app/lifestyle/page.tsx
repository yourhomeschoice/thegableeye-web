import { CategoryLandingPage, type CategoryLandingConfig } from "@/components/category-landing-page";

// Launch placeholders only: no Supabase or test-article publication feed.
const config: CategoryLandingConfig = {
  category: "Lifestyle",
  headline: "Everyday life, made clearer.",
  introduction: "Independent research and practical comparisons for outdoor activities, family needs and useful everyday purchases.",
  heroImage: "/images/lifestyle page pic.jpg",
  heroAlt: "Editorial collage featuring travel, home and technology",
  exploreHeadline: "Explore more of everyday life.",
  recentHeadline: "Our recent lifestyle picks",
  recentDescription: "Our latest Lifestyle articles will appear here as they are published.",
  topics: [
    { id: "outdoor", name: "Outdoor", detail: "Equipment for time spent outside." },
    { id: "family", name: "Family", detail: "Useful products for family routines." },
    { id: "everyday", name: "Everyday Living", detail: "Practical purchases for day-to-day life." }
  ],
  recentPicks: [
    { category: "Outdoor", title: "Choosing outdoor essentials", description: "Features worth considering before heading out." },
    { category: "Family", title: "Choosing useful family products", description: "Practical features for shared routines." },
    { category: "Everyday Living", title: "Choosing practical everyday products", description: "Features that matter in regular use." }
  ],
  sections: [
    { id: "outdoor", name: "Outdoor", detail: "Equipment and accessories for different activities.", guides: [
      { title: "Choosing outdoor essentials", description: "Features worth considering before heading out." },
      { title: "Everyday outdoor equipment", description: "Balancing portability, durability and use." },
      { title: "Outdoor accessories explained", description: "Practical details to compare." }
    ] },
    { id: "family", name: "Family", detail: "Thoughtful guidance for everyday family needs.", guides: [
      { title: "Choosing useful family products", description: "Practical features for shared routines." },
      { title: "Family essentials explained", description: "What to consider before buying." },
      { title: "Comparing everyday family gear", description: "Storage, portability and maintenance." }
    ] },
    { id: "everyday", name: "Everyday Living", detail: "Useful comparisons beyond the essentials.", guides: [
      { title: "Choosing practical everyday products", description: "Features that matter in regular use." },
      { title: "Everyday accessories explained", description: "Small purchases and practical trade-offs." },
      { title: "Making considered purchases", description: "Comparing needs, longevity and upkeep." }
    ] }
  ],
};

export default function Page() {
  return <CategoryLandingPage config={config} />;
}
