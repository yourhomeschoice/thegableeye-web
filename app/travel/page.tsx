import { CategoryLandingPage, type CategoryLandingConfig } from "@/components/category-landing-page";
import { getDevelopmentArticlePlacement, getDevelopmentTravelAdapterPlacement } from "@/lib/launch-baseline/article-placement";

// Launch placeholders only: do not reconnect the earlier test-article feed.
const config: CategoryLandingConfig = {
  category: "Travel",
  headline: "Travel, made clearer.",
  introduction:
    "Independent research and practical comparisons to help you choose how to stay connected, what to pack and what to take with you.",
  heroImage: "/images/Travel page pic.jpg",
  heroAlt: "Coastal town beside turquoise water and mountains",
  exploreHeadline: "Three ways to travel smarter.",
  recentHeadline: "Our recent travel picks",
  recentDescription: "Our latest Travel articles will appear here as they are published.",
  topics: [
    { id: "connectivity", name: "Connectivity", detail: "eSIMs, mobile data and staying connected abroad." },
    { id: "accessories", name: "Travel Accessories", detail: "Useful equipment for smoother journeys." },
    { id: "luggage", name: "Luggage", detail: "Suitcases, cabin bags and backpacks." },
  ],
  recentPicks: [
    { category: "Connectivity", title: "Choosing an eSIM for your next trip", description: "What to consider when comparing data allowances and validity." },
    { category: "Travel Accessories", title: "Travel accessories worth considering", description: "A look at charging equipment, adapters and practical essentials." },
    { category: "Luggage", title: "Finding luggage that suits your journey", description: "How to think about size, features and different bag styles." },
  ],
  sections: [
    {
      id: "connectivity", name: "Connectivity", detail: "eSIMs, mobile data and staying connected abroad.",
      guides: [
        { title: "Choosing an eSIM for your next trip", description: "Data allowances, validity and other practical considerations." },
        { title: "Understanding eSIM data plans", description: "A guide to plan sizes, trip lengths and everyday usage." },
        { title: "Staying connected while travelling", description: "Practical questions to consider before departure." },
      ],
    },
    {
      id: "accessories", name: "Travel Accessories", detail: "Useful equipment for smoother journeys.",
      guides: [
        { title: "Travel adapters explained", description: "Choosing adapters for different destinations and devices." },
        { title: "Power banks for travel", description: "Capacity, portability and charging considerations." },
        { title: "Everyday travel essentials", description: "Small accessories that may make packing more practical." },
      ],
    },
    {
      id: "luggage", name: "Luggage", detail: "Suitcases, cabin bags and backpacks.",
      guides: [
        { title: "Choosing cabin luggage", description: "Dimensions, storage and handling considerations." },
        { title: "Comparing suitcase styles", description: "Practical differences between common luggage designs." },
        { title: "Travel backpacks explained", description: "Capacity, organisation and carrying comfort." },
      ],
    },
  ],
};

export default async function TravelPage() {
  const developmentArticle = await getDevelopmentArticlePlacement();
  const travelAdapterArticle = await getDevelopmentTravelAdapterPlacement();

  return <CategoryLandingPage config={config} developmentArticle={developmentArticle} travelAdapterArticle={travelAdapterArticle} />;
}
