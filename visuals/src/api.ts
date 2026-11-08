import {
  CATEGORIES,
  type Category,
  type NewOpportunity,
  type Opportunity,
  type Profile,
} from "./opportunity";

// Point directly to your running FastAPI backend
const API_BASE = "http://127.0.0.1:8000";

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    // FastAPI puts error messages in "detail"
    throw new Error(typeof data?.detail === "string" ? data.detail : "Something went wrong");
  }
  return data as T;
}

type SupabaseOpportunity = {
  id: number;
  created_at?: string;
  title: string;
  description: string;
  "organization-id"?: number;
  "category-id"?: number;
  "location-name"?: string;
  "min-age"?: number;
  "max-age"?: number;
  url: string;
  latitude: number;
  longitude: number;
  distance?: number;
  active: boolean;
  // Enriched fields from your backend middleware
  orgName?: string;
  categoryName?: string;
};

function categoryFromId(id: number): Category {
  return CATEGORIES[id - 1] ?? "Others";
}

function validCategory(value: string): Opportunity["category"] {
  return CATEGORIES.includes(value as Opportunity["category"])
    ? (value as Opportunity["category"])
    : "Others";
}

function convertOpportunity(item: SupabaseOpportunity, organizationName?: string): Opportunity {
  return {
    id: item.id,
    title: item.title,
    description: item.description,
    location: item["location-name"] ?? "Vancouver, BC",
    org: item.orgName ?? organizationName ?? "Organization unavailable",
    category: validCategory(item.categoryName ?? (item["category-id"] ? categoryFromId(item["category-id"]) : "Others")),
    date: item.created_at ? new Date(item.created_at).toLocaleDateString() : "Flexible",
    time: "Flexible hours",
    distance: item.distance ?? 0,
    latitude: item.latitude ?? 49.2827,
    longitude: item.longitude ?? -123.1207,
    minAge: item["min-age"] ?? 16,
    maxAge: item["max-age"] ?? 70,
    url: item.url ?? "#",
  };
}

export const api = {
  // Opportunities - matches FastAPI routes exactly
  getOpportunities: async (title: string = "", age: string = "", timeFilter: string = "") => {
  const params = new URLSearchParams();

  if (title.trim()) {
    params.set("title", title.trim());
  }

  if (age.trim()) {
    params.set("minAge", age.trim());
    params.set("maxAge", age.trim());
  }

  if (timeFilter && timeFilter !== "Any time") {
    params.set("time_filter", timeFilter);
  }

  const url = `/opportunities${params.toString() ? `?${params.toString()}` : ""}`;

  const data = await request<SupabaseOpportunity[]>(url);
  return data.map((item) => convertOpportunity(item));
},
  
  createOpportunity: async (opportunity: NewOpportunity) => {
    const categoryId = CATEGORIES.indexOf(opportunity.category) + 1;
    const data = await request<{ message: string; data: SupabaseOpportunity[] }>("/opportunities", {
      method: "POST",
      body: JSON.stringify({
        orgName: opportunity.organizationName,
        "category-id": categoryId,
        title: opportunity.title,
        description: opportunity.description,
        "min-age": opportunity.minAge,
        "max-age": opportunity.maxAge,
        url: opportunity.url,
        active: true,
        "location-name": `${opportunity.locationName} — ${opportunity.address}`,
        longitude: -123.1207,
        latitude: 49.2827,
      }),
    });
    
    const createdItem = data.data && data.data.length > 0 ? data.data[0] : (data as unknown as SupabaseOpportunity);
    return convertOpportunity(createdItem, opportunity.organizationName);
  },

  getProfiles: () => request<Profile[]>("/profiles"),

  // Accounts - matches FastAPI /signup and /login routes
  signup: (body: { role: string; name: string; email: string; phone: string; password: string }) =>
    request<{ message: string; user: Profile }>("/signup", { method: "POST", body: JSON.stringify(body) }),
    
  signin: (body: { email: string; password: string }) =>
    request<{ message: string; user: Profile }>("/login", { method: "POST", body: JSON.stringify(body) }),

  // Added `login` alias so both signin and login naming conventions work seamlessly
  login: (body: { email: string; password: string }) =>
    request<{ message: string; user: Profile }>("/login", { method: "POST", body: JSON.stringify(body) }),
    
  getProfile: async () => {
    const profiles = await request<Profile[]>("/profiles");
    return profiles[0] ?? { name: "Taylor Morgan", email: "taylor@example.com", phone: "(555) 014-2836", role: "volunteer" };
  },
};