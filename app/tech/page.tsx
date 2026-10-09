import { CategoryLandingPage, type CategoryLandingConfig } from "@/components/category-landing-page";

// Launch placeholders only: no Supabase or test-article publication feed.
const config: CategoryLandingConfig = {
  category: "Tech",
  headline: "Technology, made clearer.",
  introduction: "Independent research and practical comparisons to help you choose the devices and technology that fit your everyday needs.",
  heroImage: "/images/tech page pic.jpg",
  heroAlt: "Laptop on a bright minimalist desk",
  exploreHeadline: "Explore everyday technology.",
  recentHeadline: "Our recent tech picks",
  recentDescription: "Our latest Tech articles will appear here as they are published.",
  topics: [
    { id: "laptops", name: "Laptops", detail: "Computers for work, study and everyday use." },
    { id: "smartphones", name: "Smartphones", detail: "Practical features and phone comparisons." },
    { id: "accessories", name: "Tech Accessories", detail: "Chargers, peripherals and useful everyday extras." }
  ],
  recentPicks: [
    { category: "Laptops", title: "Choosing a laptop for everyday use", description: "The features that matter for daily computing." },
    { category: "Smartphones", title: "Choosing your next smartphone", description: "Battery life, cameras and everyday usability." },
    { category: "Tech Accessories", title: "Choosing a USB-C charger", description: "Power ratings, ports and compatibility." }
  ],
  sections: [
    { id: "laptops", name: "Laptops", detail: "Practical guidance for choosing a laptop.", guides: [
      { title: "Choosing a laptop for everyday use", description: "The features that matter for daily computing." },
      { title: "Understanding laptop specifications", description: "Making sense of memory, storage and performance." },
      { title: "Laptops for work and study", description: "Practical considerations for different routines." }
    ] },
    { id: "smartphones", name: "Smartphones", detail: "Comparing the features you actually use.", guides: [
      { title: "Choosing your next smartphone", description: "Battery life, cameras and everyday usability." },
      { title: "Smartphone storage explained", description: "What to consider when choosing capacity." },
      { title: "Understanding phone features", description: "Practical differences beyond headline specifications." }
    ] },
    { id: "accessories", name: "Tech Accessories", detail: "Small additions that can make technology easier to use.", guides: [
      { title: "Choosing a USB-C charger", description: "Power ratings, ports and compatibility." },
      { title: "Everyday laptop accessories", description: "Useful extras for a desk or travel bag." },
      { title: "Wireless accessories explained", description: "Practical considerations for keyboards, mice and more." }
    ] }
  ],
};

export default function Page() {
  return <CategoryLandingPage config={config} />;
}
