import {
  pgTable,
  uuid,
  text,
  timestamp,
  integer,
  boolean,
  doublePrecision,
  jsonb,
  uniqueIndex,
  index,
} from "drizzle-orm/pg-core";

const id = () => uuid("id").primaryKey().defaultRandom();
const createdAt = () => timestamp("created_at", { withTimezone: true }).notNull().defaultNow();
const updatedAt = () => timestamp("updated_at", { withTimezone: true }).notNull().defaultNow();

export type Source = { title: string; publisher: string; url: string; checked?: string | null };

/** Roles: tourist | guide | seller | admin */
export const users = pgTable("users", {
  id: id(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  fullName: text("full_name").notNull(),
  phone: text("phone"),
  language: text("language").notNull().default("en"),
  role: text("role").notNull().default("tourist"),
  interests: text("interests").array().notNull().default([]),
  onboarded: boolean("onboarded").notNull().default(false),
  isDemo: boolean("is_demo").notNull().default(false),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
});

export const sessions = pgTable(
  "sessions",
  {
    id: id(),
    userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    tokenHash: text("token_hash").notNull().unique(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    createdAt: createdAt(),
  },
  (t) => [index("sessions_user_idx").on(t.userId)],
);

export const passwordResets = pgTable("password_resets", {
  id: id(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  tokenHash: text("token_hash").notNull().unique(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  usedAt: timestamp("used_at", { withTimezone: true }),
  createdAt: createdAt(),
});

export const destinations = pgTable(
  "destinations",
  {
    id: id(),
    slug: text("slug").notNull().unique(),
    name: text("name").notNull(),
    nameHi: text("name_hi"),
    category: text("category").notNull().default("monument"),
    era: text("era"),
    locality: text("locality"),
    address: text("address"),
    lat: doublePrecision("lat").notNull(),
    lng: doublePrecision("lng").notNull(),
    image: text("image"),
    summary: text("summary").notNull(),
    whyVisit: text("why_visit"),
    history: text("history"),
    architecture: text("architecture"),
    facts: jsonb("facts").$type<string[]>().notNull().default([]),
    sources: jsonb("sources").$type<Source[]>().notNull().default([]),
    hours: text("hours"),
    fee: text("fee"),
    rules: text("rules"),
    facilities: text("facilities"),
    accessibility: text("accessibility"),
    ticketUrl: text("ticket_url"),
    ticketProvider: text("ticket_provider"),
    unesco: boolean("unesco").notNull().default(false),
    published: boolean("published").notNull().default(true),
    sortOrder: integer("sort_order").notNull().default(100),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [index("destinations_category_idx").on(t.category)],
);

/** Nearby attractions: museums, restaurants, cafes, gardens, cultural, hidden. */
export const attractions = pgTable(
  "attractions",
  {
    id: id(),
    slug: text("slug").notNull().unique(),
    name: text("name").notNull(),
    type: text("type").notNull(),
    locality: text("locality"),
    description: text("description").notNull(),
    lat: doublePrecision("lat").notNull(),
    lng: doublePrecision("lng").notNull(),
    published: boolean("published").notNull().default(true),
    createdAt: createdAt(),
  },
  (t) => [index("attractions_type_idx").on(t.type)],
);

export const markets = pgTable("markets", {
  id: id(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  locality: text("locality").notNull(),
  speciality: text("speciality").notNull(),
  description: text("description").notNull(),
  image: text("image"),
  lat: doublePrecision("lat").notNull(),
  lng: doublePrecision("lng").notNull(),
  hours: text("hours"),
  published: boolean("published").notNull().default(true),
  createdAt: createdAt(),
});

export const events = pgTable(
  "events",
  {
    id: id(),
    title: text("title").notNull(),
    type: text("type").notNull().default("heritage-walk"),
    description: text("description").notNull(),
    image: text("image"),
    venue: text("venue").notNull(),
    locality: text("locality"),
    lat: doublePrecision("lat"),
    lng: doublePrecision("lng"),
    startsAt: timestamp("starts_at", { withTimezone: true }).notNull(),
    endsAt: timestamp("ends_at", { withTimezone: true }),
    isFree: boolean("is_free").notNull().default(true),
    priceNote: text("price_note"),
    familyFriendly: boolean("family_friendly").notNull().default(true),
    organiser: text("organiser"),
    sourceUrl: text("source_url"),
    bookingUrl: text("booking_url"),
    isDemo: boolean("is_demo").notNull().default(true),
    published: boolean("published").notNull().default(true),
    createdAt: createdAt(),
  },
  (t) => [index("events_starts_idx").on(t.startsAt)],
);

export const guides = pgTable(
  "guides",
  {
    id: id(),
    userId: uuid("user_id").references(() => users.id, { onDelete: "set null" }),
    name: text("name").notNull(),
    bio: text("bio").notNull(),
    image: text("image"),
    languages: text("languages").array().notNull().default([]),
    specialities: text("specialities").array().notNull().default([]),
    areas: text("areas").array().notNull().default([]),
    experienceYears: integer("experience_years").notNull().default(0),
    tourTypes: text("tour_types").array().notNull().default([]),
    priceNote: text("price_note").notNull().default("Contact for price"),
    availability: text("availability").notNull().default("Send a request with your preferred date"),
    contactEmail: text("contact_email"),
    status: text("status").notNull().default("pending"), // pending | approved | rejected
    isDemo: boolean("is_demo").notNull().default(false),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [index("guides_status_idx").on(t.status)],
);

export const guideRequests = pgTable(
  "guide_booking_requests",
  {
    id: id(),
    guideId: uuid("guide_id").notNull().references(() => guides.id, { onDelete: "cascade" }),
    userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    tourDate: text("tour_date").notNull(),
    timeSlot: text("time_slot").notNull(),
    groupSize: integer("group_size").notNull().default(1),
    destination: text("destination"),
    message: text("message"),
    status: text("status").notNull().default("pending"), // pending | accepted | declined | cancelled
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [index("gbr_user_idx").on(t.userId), index("gbr_guide_idx").on(t.guideId)],
);

export const sellers = pgTable("sellers", {
  id: id(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "set null" }),
  slug: text("slug").notNull().unique(),
  businessName: text("business_name").notNull(),
  locality: text("locality").notNull(),
  description: text("description").notNull(),
  image: text("image"),
  contactEmail: text("contact_email"),
  contactPhone: text("contact_phone"),
  status: text("status").notNull().default("pending"),
  isDemo: boolean("is_demo").notNull().default(false),
  createdAt: createdAt(),
});

export const products = pgTable(
  "products",
  {
    id: id(),
    sellerId: uuid("seller_id").notNull().references(() => sellers.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    description: text("description").notNull(),
    category: text("category").notNull().default("handicraft"),
    priceInr: integer("price_inr"),
    image: text("image"),
    availability: text("availability").notNull().default("available"),
    published: boolean("published").notNull().default(true),
    createdAt: createdAt(),
  },
  (t) => [index("products_seller_idx").on(t.sellerId)],
);

export const enquiries = pgTable("seller_enquiries", {
  id: id(),
  sellerId: uuid("seller_id").references(() => sellers.id, { onDelete: "cascade" }),
  productId: uuid("product_id").references(() => products.id, { onDelete: "set null" }),
  userId: uuid("user_id").references(() => users.id, { onDelete: "set null" }),
  name: text("name").notNull(),
  email: text("email").notNull(),
  message: text("message").notNull(),
  createdAt: createdAt(),
});

export type Stop = {
  id: string;
  kind: "destination" | "market" | "attraction";
  slug: string;
  name: string;
  lat: number;
  lng: number;
  minutes: number;
  note?: string;
};

export const itineraries = pgTable(
  "itineraries",
  {
    id: id(),
    userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    tripDate: text("trip_date"),
    config: jsonb("config").$type<Record<string, unknown>>().notNull().default({}),
    stops: jsonb("stops").$type<Stop[]>().notNull().default([]),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [index("itineraries_user_idx").on(t.userId)],
);

/** Saved destinations / markets / events / products. */
export const savedItems = pgTable(
  "saved_items",
  {
    id: id(),
    userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    kind: text("kind").notNull(), // destination | market | event | product
    refId: text("ref_id").notNull(),
    createdAt: createdAt(),
  },
  (t) => [uniqueIndex("saved_unique").on(t.userId, t.kind, t.refId)],
);

export const userActivity = pgTable(
  "user_activity",
  {
    id: id(),
    userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    kind: text("kind").notNull(),
    refId: text("ref_id").notNull(),
    createdAt: createdAt(),
  },
  (t) => [index("activity_user_idx").on(t.userId)],
);

export const contactMessages = pgTable("contact_messages", {
  id: id(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  subject: text("subject").notNull(),
  message: text("message").notNull(),
  createdAt: createdAt(),
});

export const auditLogs = pgTable("admin_audit_logs", {
  id: id(),
  adminId: uuid("admin_id").references(() => users.id, { onDelete: "set null" }),
  action: text("action").notNull(),
  resource: text("resource").notNull(),
  refId: text("ref_id"),
  createdAt: createdAt(),
});
