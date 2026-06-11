export interface ActivityLog {
  id: string;
  category: "Transport" | "Food" | "Energy" | "Shopping" | "Waste";
  name: string; // e.g., "Commute by Bike", "Plant-based Lunch"
  amount: number; // e.g., 12
  unit: string; // e.g., "km", "meals", "kWh", "items", "kg"
  co2Saved: number; // in kg
  timestamp: string; // ISO date
}

export interface Challenge {
  id: string;
  title: string;
  description: string;
  category: string;
  progressPercent: number;
  friendsJoined: Array<{ name: string; avatarUrl: string }>;
  joined: boolean;
}

export interface Goal {
  id: string;
  title: string;
  targetReduction: number; // e.g., 15%
  currentProgress: number; // e.g., 12%
  category: string;
}
