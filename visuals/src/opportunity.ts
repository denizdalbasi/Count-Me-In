export const CATEGORIES = [
  "Environment & Green Spaces",
  "Event Planning",
  "Food Security & Preparation",
  "Fundraising",
  "Health & Social Services",
  "Information Technology",
  "Mentorship & Teaching",
  "Sports & Recreation",
  "Others",
  "Arts, Culture & Heritage",
  "Communications & Marketing",
] as const;

export type Category = (typeof CATEGORIES)[number];

export type Opportunity = {
  id: number;
  title: string;
  org: string;
  category: Category;
  date: string;
  time: string;
  distance: number;
  latitude: number;
  longitude: number;
  location: string;
  description: string;
  minAge: number;
  maxAge: number;
  url: string;
};

export type Profile = {
  id: number;
  created_at: string;
  name: string;
  role: string;
  email: string;
  phone: number | string;
  password: string;
};

export type NewOpportunity = {
  organizationId: number;
  organizationName: string;
  category: Category;
  title: string;
  description: string;
  minAge: number;
  maxAge: number;
  url: string;
  locationName: string;
  address: string;
};
