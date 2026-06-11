import { ActivityLog, Challenge, Goal } from "./types";

export const INITIAL_LOG_TEMPLATES = [
  { id: "t1", category: "Transport" as const, name: "Commute by Bike", unit: "km", baseSavedPerUnit: 0.1, iconName: "Bike" },
  { id: "t2", category: "Food" as const, name: "Plant-based Lunch", unit: "meals", baseSavedPerUnit: 3.2, iconName: "Beef" },
  { id: "t3", category: "Energy" as const, name: "Off-grid Solar Charge", unit: "kWh", baseSavedPerUnit: 0.4, iconName: "Sun" },
  { id: "t4", category: "Shopping" as const, name: "Second-hand Bag", unit: "items", baseSavedPerUnit: 4.8, iconName: "ShoppingBag" },
  { id: "t5", category: "Waste" as const, name: "Composting Organic Waste", unit: "kg", baseSavedPerUnit: 0.8, iconName: "FileText" },
];

export const INITIAL_LOGS: ActivityLog[] = [
  {
    id: "l1",
    category: "Transport",
    name: "Commute by Bike",
    amount: 12,
    unit: "km",
    co2Saved: 1.2,
    timestamp: new Date().toISOString(),
  },
  {
    id: "l2",
    category: "Food",
    name: "Plant-based Lunch",
    amount: 1,
    unit: "meals",
    co2Saved: 3.2,
    timestamp: new Date().toISOString(),
  }
];

export const INITIAL_CHALLENGES: Challenge[] = [
  {
    id: "c1",
    title: "Walk to Work",
    description: "Exchange your daily commute with a refreshing walk. Build group habits with friends!",
    category: "Transport",
    progressPercent: 74,
    friendsJoined: [
      { name: "Siddharth", avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop" },
      { name: "Aria", avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop" },
      { name: "Kaelen", avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop" }
    ],
    joined: false,
  },
  {
    id: "c2",
    title: "Meatless Mondays",
    description: "Skip meat on Mondays to reduce dietary footprint by up to 15%.",
    category: "Food",
    progressPercent: 40,
    friendsJoined: [
      { name: "Aria", avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop" },
      { name: "David", avatarUrl: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=100&h=100&fit=crop" }
    ],
    joined: true,
  },
  {
    id: "c3",
    title: "Zero Waste Week",
    description: "Attempt to generate zero single-use plastic package waste.",
    category: "Waste",
    progressPercent: 0,
    friendsJoined: [],
    joined: false,
  }
];

export const INITIAL_GOALS: Goal[] = [
  { id: "g1", title: "Reduce Carbon Footprint by 20%", targetReduction: 20, currentProgress: 14, category: "Overall" },
  { id: "g2", title: "Increase Walking Commutes", targetReduction: 10, currentProgress: 8, category: "Transport" },
];
