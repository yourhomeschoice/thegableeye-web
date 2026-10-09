import { CategoryLandingPage, type CategoryLandingConfig } from "@/components/category-landing-page";
import { getDevelopmentCoffeeEspressoPlacement, getDevelopmentFridgeFreezerPlacement } from "@/lib/launch-baseline/article-placement";

// Launch placeholders only: no Supabase or test-article publication feed.
const config: CategoryLandingConfig = {
  category: "Home",
  headline: "Home choices, made clearer.",
  introduction: "Independent research and practical comparisons to help you choose equipment and essentials for everyday living.",
  heroImage: "/images/home page pic.jpg",
  heroAlt: "Cup of coffee beside an espresso machine",
  exploreHeadline: "Explore the essentials for home.",
  recentHeadline: "Our recent home picks",
  recentDescription: "Our latest Home articles will appear here as they are published.",
  topics: [
    { id: "coffee", name: "Coffee Machines", detail: "Coffee-making equipment for different routines." },
    { id: "kitchen", name: "Kitchen Appliances", detail: "Practical appliances for everyday cooking." },
    { id: "essentials", name: "Home Essentials", detail: "Useful equipment for living spaces and daily tasks." }
  ],
  recentPicks: [
    { category: "Coffee Machines", title: "Choosing a home espresso machine", description: "Considerations for space, budget and daily use." },
    { category: "Kitchen Appliances", title: "Choosing a countertop appliance", description: "Size, functions and everyday usability." },
    { category: "Home Essentials", title: "Choosing everyday home essentials", description: "What to prioritise for practical use." }
  ],
  sections: [
    { id: "coffee", name: "Coffee Machines", detail: "Find the equipment that suits your coffee routine.", guides: [
      { title: "Choosing a home espresso machine", description: "Considerations for space, budget and daily use." },
      { title: "Coffee machine types explained", description: "How common brewing methods differ." },
      { title: "Coffee equipment essentials", description: "Accessories and upkeep to consider." }
    ] },
    { id: "kitchen", name: "Kitchen Appliances", detail: "Understanding practical features before buying.", guides: [
      { title: "Choosing a countertop appliance", description: "Size, functions and everyday usability." },
      { title: "Kitchen appliance features explained", description: "Which specifications deserve attention." },
      { title: "Planning a practical kitchen setup", description: "Matching equipment to available space." }
    ] },
    { id: "essentials", name: "Home Essentials", detail: "Useful comparisons for daily living.", guides: [
      { title: "Choosing everyday home essentials", description: "What to prioritise for practical use." },
      { title: "Home storage considerations", description: "Comparing capacity, size and flexibility." },
      { title: "Understanding home product features", description: "How to assess materials and maintenance." }
    ] }
  ],
};

export default async function Page() {
  const fridgeFreezerArticle = await getDevelopmentFridgeFreezerPlacement();
  const coffeeEspressoArticle = await getDevelopmentCoffeeEspressoPlacement();
  return <CategoryLandingPage config={config} travelAdapterArticle={fridgeFreezerArticle} coffeeArticle={coffeeEspressoArticle} />;
}
