import { useEffect, useMemo, useState, type CSSProperties, type ReactNode } from "react";
import AddOpportunityPage from "./AddOpportunityPage";
import { api } from "./api";
import { distanceInMiles, type Coordinates } from "./map";
import { CATEGORIES, type Opportunity, type Profile } from "./opportunity";

type Page="browse" | "signin" | "signup" | "detail" | "profile" | "saved" | "add-opportunity";
type IconName =
  | "arrow"
  | "bookmark"
  | "calendar"
  | "check"
  | "chevron"
  | "clock"
  | "close"
  | "heart"
  | "leaf"
  | "location"
  | "mail"
  | "menu"
  | "phone"
  | "search"
  | "spark"
  | "user"
  | "users";

const mockOpportunities: Opportunity[] = [
  {
    id: 1,
    title: "Community garden spring clean",
    org: "Grow Together",
    category: "Environment & Green Spaces",
    date: "Sat, May 18",
    time: "9:00 AM–12:00 PM",
    distance: 1.2,
    latitude: 43.6678,
    longitude: -79.352,
    location: "Riverdale Community Garden",
    description:
      "Help prepare shared garden beds for the new season and meet neighbours who love growing local food.",
    minAge: 16,
    maxAge: 70,
    url: "https://example.com/garden",
  },
  {
    id: 2,
    title: "Saturday food pantry team",
    org: "Neighbourhood Table",
    category: "Food Security & Preparation",
    date: "Sat, May 18",
    time: "1:00–4:00 PM",
    distance: 2.4,
    latitude: 43.662,
    longitude: -79.378,
    location: "St. James Community Hall",
    description:
      "Sort donations, pack grocery boxes, and welcome community members at our weekly pantry.",
    minAge: 18,
    maxAge: 65,
    url: "https://example.com/food-pantry",
  },
  {
    id: 3,
    title: "After-school reading buddies",
    org: "Bright Futures",
    category: "Mentorship & Teaching",
    date: "Tue, May 21",
    time: "3:30–5:30 PM",
    distance: 3.1,
    latitude: 43.666,
    longitude: -79.344,
    location: "Eastside Library",
    description:
      "Spend an afternoon reading with elementary students and helping them build confidence.",
    minAge: 18,
    maxAge: 80,
    url: "https://example.com/reading",
  },
  {
    id: 4,
    title: "Dog shelter social hour",
    org: "Paws & People",
    category: "Others",
    date: "Sun, May 26",
    time: "10:00 AM–1:00 PM",
    distance: 5.8,
    latitude: 43.655,
    longitude: -79.385,
    location: "City Animal Shelter",
    description:
      "Give shelter dogs exercise, attention, and enrichment while they wait for their new homes.",
    minAge: 18,
    maxAge: 70,
    url: "https://example.com/animal-shelter",
  },
];

function Icon({ name, size = 20 }: { name: IconName; size?: number }) {
  const paths: Record<IconName, ReactNode> = {
    arrow: (
      <>
        <path d="M5 12h14" />
        <path d="m13 6 6 6-6 6" />
      </>
    ),
    bookmark: (
      <path d="M6 4.75A1.75 1.75 0 0 1 7.75 3h8.5A1.75 1.75 0 0 1 18 4.75V21l-6-3.5L6 21Z" />
    ),
    calendar: (
      <>
        <path d="M6 2v4M18 2v4M3 9h18" />
        <rect x="3" y="4" width="18" height="17" rx="2" />
      </>
    ),
    check: <path d="m5 12 4 4L19 6" />,
    chevron: <path d="m8 10 4 4 4-4" />,
    clock: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 2" />
      </>
    ),
    close: <path d="M6 6l12 12M18 6 6 18" />,
    heart: (
      <path d="M20.8 5.8a5.4 5.4 0 0 0-7.6 0L12 7l-1.2-1.2a5.4 5.4 0 1 0-7.6 7.6L12 22l8.8-8.6a5.4 5.4 0 0 0 0-7.6Z" />
    ),
    leaf: (
      <>
        <path d="M20 4C12 4 5 7 5 14c0 3 2 5 5 5 7 0 10-7 10-15Z" />
        <path d="M4 21c3-6 7-9 12-12" />
      </>
    ),
    location: (
      <>
        <path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z" />
        <circle cx="12" cy="10" r="2.5" />
      </>
    ),
    mail: (
      <>
        <rect x="3" y="5" width="18" height="14" rx="2" />
        <path d="m3 7 9 6 9-6" />
      </>
    ),
    menu: (
      <>
        <path d="M4 7h16M4 12h16M4 17h16" />
      </>
    ),
    phone: (
      <path d="M7 3H4a1 1 0 0 0-1 1c0 9.4 7.6 17 17 17a1 1 0 0 0 1-1v-3l-4-1-1.5 2a15 15 0 0 1-9.5-9.5L8 7Z" />
    ),
    search: (
      <>
        <circle cx="11" cy="11" r="7" />
        <path d="m20 20-4-4" />
      </>
    ),
    spark: (
      <>
        <path d="m12 3 1.4 4.6L18 9l-4.6 1.4L12 15l-1.4-4.6L6 9l4.6-1.4Z" />
        <path d="m19 15 .6 2.4L22 18l-2.4.6L19 21l-.6-2.4L16 18l2.4-.6Z" />
      </>
    ),
    user: (
      <>
        <circle cx="12" cy="8" r="4" />
        <path d="M4 21c.8-5 3.5-7 8-7s7.2 2 8 7" />
      </>
    ),
    users: (
      <>
        <path d="M16 20c-.5-3.2-2.4-5-5.5-5S5.5 16.8 5 20" />
        <circle cx="10.5" cy="9" r="3.5" />
        <path d="M17 11c2.7.4 4 1.9 4.5 4.5M16 5.5a3 3 0 0 1 0 5.8" />
      </>
    ),
  };
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {paths[name]}
    </svg>
  );
}

function Button({
  children,
  variant = "primary",
  className = "",
  onClick,
  type = "button",
  style,
  disabled = false,
}: {
  children: ReactNode;
  variant?: "primary" | "secondary" | "quiet";
  className?: string;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  type?: "button" | "submit";
  style?: CSSProperties;
  disabled?: boolean;
}) {
  return (
    <button
      type={type}
      className={`button button--${variant} ${className}`}
      onClick={onClick}
      style={style}
      disabled={disabled}
    >
      {children}
    </button>
  );
}

function Field({
  label,
  icon,
  name,
  type = "text",
  placeholder,
  defaultValue,
  readOnly = false,
  required = false,
}: {
  label: string;
  icon: IconName;
  name?: string;
  type?: string;
  placeholder?: string;
  defaultValue?: string;
  readOnly?: boolean;
  required?: boolean;
}) {
  return (
    <label className="field">
      <span>{label}</span>
      <span className="field__control">
        <Icon name={icon} size={18} />
        <input
          name={name}
          type={type}
          placeholder={placeholder}
          defaultValue={defaultValue}
          readOnly={readOnly}
          required={required}
        />
      </span>
    </label>
  );
}

function Header({
  page,
  go,
  showAddOpportunity,
  loggedIn,
  onSignOut,
}: {
  page: Page;
  go: (page: Page) => void;
  showAddOpportunity: boolean;
  loggedIn: boolean;
  onSignOut: () => void;
}) {
  return (
    <header className="header">
      <div className="shell header__inner">
        <button className="brand" onClick={() => go("browse")} aria-label="Count me in home">
          <span className="brand__mark">
            <Icon name="heart" size={19} />
          </span>
          <span>count me in</span>
        </button>
        <nav className="nav" aria-label="Main navigation">
          <button
            className={page === "browse" || page === "detail" ? "active" : ""}
            onClick={() => go("browse")}
          >
            Browse
          </button>
          <button className={page === "saved" ? "active" : ""} onClick={() => go("saved")}>
            Saved
          </button>
          <button className={page === "profile" ? "active" : ""} onClick={() => go("profile")}>
            Profile
          </button>
        </nav>
        {showAddOpportunity && (
          <Button className="header__add" onClick={() => go("add-opportunity")}>
            Add Opportunities
          </Button>
        )}
        <div className="header__auth">
          {loggedIn ? (
            <Button variant="secondary" onClick={onSignOut}>
              Sign out
            </Button>
          ) : (
            <>
              <Button variant="secondary" onClick={() => go("signin")}>
                Sign in
              </Button>
              <Button onClick={() => go("signup")}>Register</Button>
            </>
          )}
        </div>
        <button className="mobile-menu" aria-label="Open menu">
          <Icon name="menu" />
        </button>
      </div>
    </header>
  );
}

function Tag({ category }: { category: Opportunity["category"] }) {
  const tone = CATEGORIES.indexOf(category) % 4;
  return <span className={`tag tag--tone-${tone}`}>{category}</span>;
}

function OpportunityCard({
  opportunity,
  saved,
  selected,
  onSave,
  onSelect,
  onDetails,
}: {
  opportunity: Opportunity;
  saved: boolean;
  selected?: boolean;
  onSave: () => void;
  onSelect?: () => void;
  onDetails: () => void;
}) {
  return (
    <article className={`opportunity-card ${selected ? "is-selected" : ""}`} onClick={onSelect}>
      <div className="card__top">
        <Tag category={opportunity.category} />
        <button
          className={`save-button ${saved ? "is-saved" : ""}`}
          aria-label={
            saved ? `Remove ${opportunity.title} from saved` : `Save ${opportunity.title}`
          }
          aria-pressed={saved}
          onClick={(event) => {
            event.stopPropagation();
            onSave();
          }}
        >
          <Icon name="bookmark" size={19} />
        </button>
      </div>
      <h3>{opportunity.title}</h3>
      <p className="org">{opportunity.org}</p>
      <div className="card__meta">
        <span>
          <Icon name="calendar" size={16} />
          {opportunity.date}
        </span>
        <span>
          <Icon name="clock" size={16} />
          {opportunity.time}
        </span>
        <span>
          <Icon name="location" size={16} />
          {opportunity.distance} mi · {opportunity.location}
        </span>
      </div>
      <p className="card__description">{opportunity.description}</p>
      <button
        className="text-link"
        onClick={(event) => {
          event.stopPropagation();
          onDetails();
        }}
      >
        More details <Icon name="arrow" size={16} />
      </button>
    </article>
  );
}

function Map({
  items,
  selected,
  onSelect,
}: {
  items: Opportunity[];
  selected: number | null;
  onSelect: (id: number) => void;
}) {
  const selectedOpportunity = items.find((item) => item.id === selected);
  
  // Use VITE_API_URL dynamically, with your PythonAnywhere link as a safe fallback
  const apiBase = import.meta.env.VITE_API_URL || "https://admin684584165418645.pythonanywhere.com";
  
  const mapUrl =
    items.length > 0
      ? `${apiBase}/map?${items
          .map((item) => `ids=${encodeURIComponent(item.id)}`)
          .join("&")}`
      : "";

  console.log("Frontend opportunities:", items);
  console.log("IDs being sent to map:", items.map((item) => item.id));
  console.log("Map URL:", mapUrl);

  return (
    <section
      className="map-panel has-live-map"
      aria-label="Map showing opportunity locations"
    >
      <iframe
        key={mapUrl}
        className="map__embed"
        src={mapUrl}
        title="Map of volunteer opportunities"
        loading="lazy"
      />

      {selectedOpportunity && (
        <div className="map-card">
          <Tag category={selectedOpportunity.category} />
          <strong>{selectedOpportunity.title}</strong>
          <span>{selectedOpportunity.distance} mi away</span>
        </div>
      )}
    </section>
  );
}

function BrowsePage({
  opportunities,
  saved,
  toggleSaved,
  goDetail,
  searchQuery,
  setSearchQuery,
  userAge,
  setUserAge,
  time,
  setTime,
}: {
  opportunities: Opportunity[];
  saved: number[];
  toggleSaved: (id: number) => void;
  goDetail: (id: number) => void;
  searchQuery: string;
  setSearchQuery: (value: string) => void;
  userAge: string;
  setUserAge: (value: string) => void;
  time: string;
  setTime: (value: string) => void;
}) {
  const [distance, setDistance] = useState(8);
  const [category, setCategory] = useState("All categories");
  const [selected, setSelected] = useState(1);
  const [userLocation, setUserLocation] = useState<Coordinates | null>(null);
  const [locationStatus, setLocationStatus] = useState<"idle" | "loading" | "success" | "error">(
    "idle",
  );
  const opportunitiesWithDistance = useMemo(
    () =>
      userLocation
        ? opportunities.map((item) => ({
          ...item,
          distance: Number(
            distanceInMiles(userLocation, {
              latitude: item.latitude,
              longitude: item.longitude,
            }).toFixed(1),
          ),
        }))
        : opportunities,
    [opportunities, userLocation],
  );
  const visible = opportunitiesWithDistance.filter((item) => {
    const matchesDistance = item.distance <= distance;
    const matchesCategory = category === "All categories" || item.category === category;
    return matchesDistance && matchesCategory;
  });
  const useMyLocation = () => {
    if (!navigator.geolocation) {
      setLocationStatus("error");
      return;
    }
    setLocationStatus("loading");
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        setUserLocation({ latitude: coords.latitude, longitude: coords.longitude });
        setLocationStatus("success");
      },
      () => setLocationStatus("error"),
      { enableHighAccuracy: true, timeout: 10000 },
    );
  };
  const activeSelected = visible.some((item) => item.id === selected)
    ? selected
    : (visible[0]?.id ?? null);
  return (
    <main>
      <section className="browse-hero shell">
        <p className="eyebrow">
          <Icon name="spark" size={16} /> Make a difference nearby
        </p>
        <h1>Dashboard</h1>
      </section>
      <section className="filters">
        <div className="shell filters__inner">
          <label className="filter-field search-filter">
            <span>Search</span>
            <span className="search-field">
              <Icon name="search" size={19} />
              <input
                aria-label="Search opportunities"
                placeholder="Search volunteer opportunities by title"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
              />
            </span>
          </label>
          <label className="filter-field age-filter">
            <span>Your age</span>
            <input
              type="number"
              min="1"
              max="120"
              placeholder="Age"
              value={userAge}
              onChange={(event) => setUserAge(event.target.value)}
            />
          </label>
          <label className="select-field category-filter">
            <span>Category</span>
            <span className="select-wrap">
              <select value={category} onChange={(event) => setCategory(event.target.value)}>
                <option>All categories</option>
                {CATEGORIES.map((categoryOption) => (
                  <option key={categoryOption}>{categoryOption}</option>
                ))}
              </select>
              <Icon name="chevron" size={16} />
            </span>
          </label>
          <div className="distance-filter">
            <span>
              <Icon name="location" size={18} /> Within <strong>{distance} miles</strong>
            </span>
            <input
              aria-label="Maximum distance"
              type="range"
              min="1"
              max="20"
              value={distance}
              style={
                {
                  "--range-progress": `${((distance - 1) / 19) * 100}%`,
                } as CSSProperties
              }
              onChange={(event) => setDistance(Number(event.target.value))}
            />
          </div>
          <label className="select-field">
            <span>Posting date</span>
            <span className="select-wrap">
              <select value={time} onChange={(event) => setTime(event.target.value)}>
                <option>Last week</option>
                <option>Last month</option>
                <option>Any time</option>
              </select>
              <Icon name="chevron" size={16} />
            </span>
          </label>
        </div>
      </section>
      <section className="shell browse-layout">
        <div className="results">
          <div className="results__heading">
            <div>
              <h2>Opportunities near you</h2>
            </div>
            <button
              className="location-link"
              onClick={useMyLocation}
              disabled={locationStatus === "loading"}
            >
              <Icon name="location" size={17} />{" "}
              {locationStatus === "loading"
                ? "Finding your location…"
                : locationStatus === "success"
                  ? "Location updated"
                  : locationStatus === "error"
                    ? "Location unavailable"
                    : "Use my location"}
            </button>
          </div>
          <div className="opportunity-list">
            {visible.length ? (
              visible.map((item) => (
                <OpportunityCard
                  key={item.id}
                  opportunity={item}
                  saved={saved.includes(item.id)}
                  selected={activeSelected === item.id}
                  onSave={() => toggleSaved(item.id)}
                  onSelect={() => setSelected(item.id)}
                  onDetails={() => goDetail(item.id)}
                />
              ))
            ) : (
              <div className="no-results">
                <Icon name="search" size={22} />
                <strong>No opportunities found</strong>
                <span>Try another category or increase your distance.</span>
              </div>
            )}
          </div>
        </div>
        <Map items={visible} selected={activeSelected} onSelect={setSelected} />
      </section>
    </main>
  );
}


function AuthLayout({ children, onClose }: { children: ReactNode; onClose: () => void }) {
  return (
    <main className="auth-page">
      <section className="auth-aside">
        <div className="auth-aside__content">
          <span className="brand__mark brand__mark--large">
            <Icon name="heart" size={28} />
          </span>
          <p className="eyebrow">Your time matters</p>
          <h1>
            Small actions.
            <br />
            Real change.
          </h1>
        </div>
      </section>
      <section className="auth-form-wrap">
        <button
          type="button"
          className="auth-close"
          onClick={onClose}
          aria-label="Close and go back to opportunities"
        >
          <Icon name="close" size={20} />
        </button>
        <div className="auth-card">{children}</div>
      </section>
    </main>
  );
}

function AuthSuccess({ title, go }: { title: string; go: (page: Page) => void }) {
  return (
    <div className="success-state">
      <span>
        <Icon name="check" size={30} />
      </span>
      <h2>{title}</h2>
      <p>Welcome to Count Me In. Let’s find your next opportunity.</p>
      <Button onClick={() => go("browse")}>
        Browse opportunities <Icon name="arrow" size={18} />
      </Button>
    </div>
  );
}

function SignInPage({
  go,
  onAuthenticated,
}: {
  go: (page: Page) => void;
  onAuthenticated: (profile: Profile) => void;
}) {
  const [submitted, setSubmitted] = useState(false);
  const [formError, setFormError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError("");
    setLoading(true);
    const data = new FormData(event.currentTarget);
    const email = String(data.get("email")).trim().toLowerCase();
    const password = String(data.get("password"));
    try {
      const res = await api.login({ email, password });
      onAuthenticated(res.user);
      setSubmitted(true);
    } catch (err: any) {
      setFormError(err.message || "We could not match that email and password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout onClose={() => go("browse")}>
      {submitted ? (
        <AuthSuccess title="You're signed in!" go={go} />
      ) : (
        <>
          <p className="eyebrow">Welcome back</p>
          <h2>Good to see you.</h2>
          <p className="form-intro">
            New to Count Me In?{" "}
            <button type="button" onClick={() => go("signup")}>
              Create an account
            </button>
          </p>
          <form onSubmit={handleSubmit}>
            <Field
              label="Email address"
              icon="mail"
              name="email"
              type="email"
              placeholder="you@example.com"
              required
            />
            <Field
              label="Password"
              icon="bookmark"
              name="password"
              type="password"
              placeholder="Your password"
              required
            />
            {formError && (
              <p className="form-error" role="alert">
                {formError}
              </p>
            )}
            <Button type="submit" className="full-button" disabled={loading}>
              {loading ? "Signing in…" : "Sign in"} <Icon name="arrow" size={18} />
            </Button>
          </form>
        </>
      )}
    </AuthLayout>
  );
}

function SignUpPage({
  go,
  onAuthenticated,
}: {
  go: (page: Page) => void;
  onAuthenticated: (profile: Profile) => void;
}) {
  const [role, setRole] = useState("Volunteer");
  const [submitted, setSubmitted] = useState(false);
  const [formError, setFormError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError("");
    setLoading(true);
    const data = new FormData(event.currentTarget);
    const payload = {
      name: String(data.get("name")).trim(),
      email: String(data.get("email")).trim().toLowerCase(),
      phone: String(data.get("phone")),
      password: String(data.get("password")),
      role: role === "Organization" ? "organisation" : "volunteer",
    };
    try {
      const res = await api.signup(payload);
      onAuthenticated(
        res.user ?? { ...payload, id: Date.now(), created_at: new Date().toISOString() },
      );
      setSubmitted(true);
    } catch (err: any) {
      setFormError(err.message || "Failed to create account.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout onClose={() => go("browse")}>
      {submitted ? (
        <AuthSuccess title="You're all set!" go={go} />
      ) : (
        <>
          <p className="eyebrow">Create your account</p>
          <h2>Count yourself in.</h2>
          <p className="form-intro">
            Already have an account?{" "}
            <button type="button" onClick={() => go("signin")}>
              Sign in
            </button>
          </p>
          <form onSubmit={handleSubmit}>
            <label className="field">
              <span>I’m signing up as</span>
              <span className="select-control">
                <Icon name={role === "Volunteer" ? "user" : "users"} size={18} />
                <select value={role} onChange={(event) => setRole(event.target.value)}>
                  <option>Volunteer</option>
                  <option>Organization</option>
                </select>
                <Icon name="chevron" size={16} />
              </span>
            </label>
            <Field
              label={role === "Volunteer" ? "Full name" : "Organization name"}
              icon="user"
              name="name"
              placeholder={role === "Volunteer" ? "Taylor Morgan" : "Your organization"}
              required
            />
            <Field
              label="Email address"
              icon="mail"
              name="email"
              type="email"
              placeholder="you@example.com"
              required
            />
            <Field
              label="Phone number"
              icon="phone"
              name="phone"
              type="tel"
              placeholder="(555) 000-0000"
              required
            />
            <Field
              label="Password"
              icon="bookmark"
              name="password"
              type="password"
              placeholder="At least 8 characters"
              required
            />
            {formError && (
              <p className="form-error" role="alert">
                {formError}
              </p>
            )}
            <Button type="submit" className="full-button" disabled={loading}>
              {loading ? "Creating account…" : "Create account"} <Icon name="arrow" size={18} />
            </Button>
          </form>
          <p className="terms">By joining, you agree to our Terms of Service and Privacy Policy.</p>
        </>
      )}
    </AuthLayout>
  );
}

function DetailPage({
  item,
  saved,
  toggleSaved,
  go,
}: {
  item: Opportunity;
  saved: boolean;
  toggleSaved: () => void;
  go: (page: Page) => void;
}) {
  return (
    <main>
      <div className="shell detail-page">
        <button className="back-link" onClick={() => go("browse")}>
          ← Back to opportunities
        </button>
        <div className="detail-layout">
          <article className="detail-content">
            <div className="detail-title">
              <div>
                <Tag category={item.category} />
                <h1>{item.title}</h1>
                <p>
                  Hosted by <strong>{item.org}</strong>
                </p>
                <p className="detail-age">
                  Ages: {item.minAge}-{item.maxAge}
                </p>
              </div>
              <button
                className={`save-button save-button--large ${saved ? "is-saved" : ""}`}
                aria-pressed={saved}
                aria-label="Save opportunity"
                onClick={toggleSaved}
              >
                <Icon name="bookmark" />
              </button>
            </div>
            <div className="detail-facts">
              <div>
                <span>
                  <Icon name="calendar" />
                </span>
                <p>
                  <small>Date</small>
                  <strong>{item.date}</strong>
                </p>
              </div>
              <div>
                <span>
                  <Icon name="clock" />
                </span>
                <p>
                  <small>Time</small>
                  <strong>{item.time}</strong>
                </p>
              </div>
              <div>
                <span>
                  <Icon name="location" />
                </span>
                <p>
                  <small>Location</small>
                  <strong>{item.location}</strong>
                </p>
              </div>
            </div>
            <section className="detail-section">
              <h2>About this opportunity</h2>
              <p>
                {item.description}
              </p>
            </section>
          </article>
          <aside className="register-card">
            <p className="eyebrow">Ready to help?</p>
            <h2>Count me in</h2>
            {item.url ? (
              <>
                <p>You’ll finish registering on {item.org}’s website.</p>
                <a
                  className="button button--primary full-button"
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Register for this opportunity <Icon name="arrow" size={18} />
                </a>
              </>
            ) : (
              <>
                <p>This organization hasn’t added a registration link yet.</p>
                <Button className="full-button" disabled>
                  Registration unavailable
                </Button>
              </>
            )}
          </aside>
        </div>
      </div>
    </main>
  );
}

function ProfilePage({ profile }: { profile: Profile | null }) {
  const name = profile?.name ?? "Taylor Morgan";
  const email = profile?.email ?? "taylor@example.com";
  const phone = String(profile?.phone ?? "(555) 014-2836");
  const isOrganization = profile?.role.toLowerCase() === "organisation";
  const memberSince = profile?.created_at
    ? new Intl.DateTimeFormat("en", { month: "long", year: "numeric" }).format(
      new Date(profile.created_at),
    )
    : "March 2024";
  return (
    <main className="shell profile-page">
      <div className="page-heading">
        <div>
          <p className="eyebrow">My account</p>
          <h1>Your profile</h1>
        </div>
      </div>
      <div className="profile-grid">
        <section className="profile-card">
          <h2>{name}</h2>
          <p>{isOrganization ? "Organization profile" : "Community volunteer"}</p>
          <span className="member-since">
            <Icon name="calendar" size={16} /> Member since {memberSince}
          </span>
        </section>
        <section className="details-card">
          <div className="section-heading">
            <div>
              <h2>Personal details</h2>
              <p>This information is only shared when you register.</p>
            </div>
          </div>
          <div className="details-grid">
            <Field label="Full name" icon="user" defaultValue={name} readOnly />
            <Field label="Email address" icon="mail" defaultValue={email} readOnly />
            <Field label="Phone number" icon="phone" defaultValue={phone} readOnly />
          </div>
        </section>
      </div>
    </main>
  );
}

function SavedPage({
  opportunities,
  saved,
  toggleSaved,
  goDetail,
  go,
}: {
  opportunities: Opportunity[];
  saved: number[];
  toggleSaved: (id: number) => void;
  goDetail: (id: number) => void;
  go: (page: Page) => void;
}) {
  const items = opportunities.filter((item) => saved.includes(item.id));
  return (
    <main className="shell saved-page">
      <div className="page-heading">
        <div>
          <p className="eyebrow">Your shortlist</p>
          <h1>Saved opportunities</h1>
        </div>
      </div>
      {items.length ? (
        <>
          <div className="saved-toolbar">
            <p>
              <strong>{items.length}</strong> saved{" "}
              {items.length === 1 ? "opportunity" : "opportunities"}
            </p>
            <label className="select-field select-field--small">
              <span>Sort by</span>
              <span className="select-wrap">
                <select>
                  <option>Soonest first</option>
                </select>
                <Icon name="chevron" size={16} />
              </span>
            </label>
          </div>
          <div className="saved-grid">
            {items.map((item) => (
              <OpportunityCard
                key={item.id}
                opportunity={item}
                saved
                onSave={() => toggleSaved(item.id)}
                onDetails={() => goDetail(item.id)}
              />
            ))}
          </div>
        </>
      ) : (
        <section className="empty-state">
          <span>
            <Icon name="bookmark" size={30} />
          </span>
          <h2>Your saved list is waiting</h2>
          <p>Bookmark opportunities that catch your eye and they’ll show up here.</p>
          <Button onClick={() => go("browse")}>
            Find opportunities <Icon name="arrow" size={17} />
          </Button>
        </section>
      )}
    </main>
  );
}

export default function App() {
  const [opportunities, setOpportunities] = useState<Opportunity[]>(mockOpportunities);
  const [searchQuery, setSearchQuery] = useState("");
  const [userAge, setUserAge] = useState("");
  const [time, setTime] = useState("Any time");
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [logged_in, setLoggedIn] = useState(false);
  const [currentProfile, setCurrentProfile] = useState<Profile | null>(null);
  useEffect(() => {
    api
      .getProfiles()
      .then((data) => {
        setProfiles(data);
      })
      .catch((error) => {
        console.error("Failed to load profiles:", error);
      });
  }, []);
  useEffect(() => {
    let cancelled = false;
    const timer = setTimeout(() => {
      api
        .getOpportunities(searchQuery, userAge, time)
        .then((data) => {
          if (!cancelled) {
            setOpportunities(data);
          }
        })
        .catch((error) => {
          if (!cancelled) {
            console.error("Failed to search opportunities:", error);
          }
        });
    }, 300);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [searchQuery, userAge, time]);
  const [page, setPage] = useState<Page>("browse");
  const [saved, setSaved] = useState<number[]>(() => {
    const stored = localStorage.getItem("savedOpportunities");
    return stored ? JSON.parse(stored) : [];
  });
  useEffect(() => {
    localStorage.setItem("savedOpportunities", JSON.stringify(saved));
  }, [saved]);
  const [detailId, setDetailId] = useState(1);
  const detail = useMemo(
    () => opportunities.find((item) => item.id === detailId) ?? opportunities[0],
    [detailId, opportunities],
  );
  const toggleSaved = (id: number) =>
    setSaved((current) =>
      current.includes(id) ? current.filter((savedId) => savedId !== id) : [...current, id],
    );
  const goDetail = (id: number) => {
    setDetailId(id);
    setPage("detail");
    window.scrollTo(0, 0);
  };
  const go = (next: Page) => {
    if (
      next === "add-opportunity" &&
      (!logged_in || currentProfile?.role.toLowerCase() !== "organisation")
    ) {
      return;
    }
    setPage(next);
    window.scrollTo(0, 0);
  };
  const isOrganization = logged_in && currentProfile?.role.toLowerCase() === "organisation";
  const handleAuthenticated = (profile: Profile) => {
    setCurrentProfile(profile);
    setLoggedIn(true);
  };

  return (
    <div className="app">
      {page !== "signin" && page !== "signup" && (
        <Header
          page={page}
          go={go}
          showAddOpportunity={isOrganization}
          loggedIn={logged_in}
          onSignOut={() => {
            setCurrentProfile(null);
            setLoggedIn(false);
            go("browse");
          }}
        />
      )}
      {page === "browse" && (
        <BrowsePage
          opportunities={opportunities}
          saved={saved}
          toggleSaved={toggleSaved}
          goDetail={goDetail}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          userAge={userAge}
          setUserAge={setUserAge}
          time={time}
          setTime={setTime}
        />
      )}
      {page === "signin" && <SignInPage go={go} onAuthenticated={handleAuthenticated} />}
      {page === "signup" && <SignUpPage go={go} onAuthenticated={handleAuthenticated} />}
      {page === "detail" && detail && (
        <DetailPage
          item={detail}
          saved={saved.includes(detail.id)}
          toggleSaved={() => toggleSaved(detail.id)}
          go={go}
        />
      )}
      {page === "profile" && <ProfilePage profile={currentProfile} />}
      {page === "saved" && (
        <SavedPage
          opportunities={opportunities}
          saved={saved}
          toggleSaved={toggleSaved}
          goDetail={goDetail}
          go={go}
        />
      )}
      {page === "add-opportunity" && isOrganization && currentProfile && (
        <AddOpportunityPage
          profile={currentProfile}
          onCancel={() => go("browse")}
          onCreated={(opportunity) => {
            setOpportunities((current) => [opportunity, ...current]);
            setDetailId(opportunity.id);
            go("detail");
          }}
        />
      )}
    </div>
  );
}
