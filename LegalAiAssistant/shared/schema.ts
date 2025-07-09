import {
  pgTable,
  text,
  varchar,
  timestamp,
  jsonb,
  index,
  serial,
  boolean,
  integer
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Session storage table for Replit Auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table for Replit Auth
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  languagePreference: varchar("language_preference").default("en"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Chat conversations
export const conversations = pgTable("conversations", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  title: text("title"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Chat messages
export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  conversationId: integer("conversation_id").notNull().references(() => conversations.id),
  role: varchar("role").notNull(), // 'user' or 'assistant'
  content: text("content").notNull(),
  timestamp: timestamp("timestamp").defaultNow(),
});

// FIR drafts
export const firDrafts = pgTable("fir_drafts", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  title: text("title").notNull(),
  content: text("content").notNull(),
  incidentType: varchar("incident_type"),
  location: text("location"),
  dateOfIncident: timestamp("date_of_incident"),
  status: varchar("status").default("draft"), // draft, submitted, processed
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Case tracking
export const cases = pgTable("cases", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  caseNumber: varchar("case_number"),
  court: varchar("court"),
  caseType: varchar("case_type"),
  status: varchar("status"),
  nextHearing: timestamp("next_hearing"),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Legal glossary
export const glossaryTerms = pgTable("glossary_terms", {
  id: serial("id").primaryKey(),
  term: varchar("term").notNull().unique(),
  definition: text("definition").notNull(),
  category: varchar("category"),
  language: varchar("language").default("en"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Lawyer directory
export const lawyers = pgTable("lawyers", {
  id: serial("id").primaryKey(),
  name: varchar("name").notNull(),
  email: varchar("email"),
  phone: varchar("phone"),
  specialization: varchar("specialization"),
  experience: integer("experience"),
  location: varchar("location"),
  rating: integer("rating").default(0),
  isVerified: boolean("is_verified").default(false),
  profileImage: varchar("profile_image"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  conversations: many(conversations),
  firDrafts: many(firDrafts),
  cases: many(cases),
}));

export const conversationsRelations = relations(conversations, ({ one, many }) => ({
  user: one(users, {
    fields: [conversations.userId],
    references: [users.id],
  }),
  messages: many(messages),
}));

export const messagesRelations = relations(messages, ({ one }) => ({
  conversation: one(conversations, {
    fields: [messages.conversationId],
    references: [conversations.id],
  }),
}));

export const firDraftsRelations = relations(firDrafts, ({ one }) => ({
  user: one(users, {
    fields: [firDrafts.userId],
    references: [users.id],
  }),
}));

export const casesRelations = relations(cases, ({ one }) => ({
  user: one(users, {
    fields: [cases.userId],
    references: [users.id],
  }),
}));

// Types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;

export type InsertConversation = typeof conversations.$inferInsert;
export type Conversation = typeof conversations.$inferSelect;

export type InsertMessage = typeof messages.$inferInsert;
export type Message = typeof messages.$inferSelect;

export type InsertFirDraft = typeof firDrafts.$inferInsert;
export type FirDraft = typeof firDrafts.$inferSelect;

export type InsertCase = typeof cases.$inferInsert;
export type Case = typeof cases.$inferSelect;

export type InsertGlossaryTerm = typeof glossaryTerms.$inferInsert;
export type GlossaryTerm = typeof glossaryTerms.$inferSelect;

export type InsertLawyer = typeof lawyers.$inferInsert;
export type Lawyer = typeof lawyers.$inferSelect;

// Zod schemas
export const insertConversationSchema = createInsertSchema(conversations).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertMessageSchema = createInsertSchema(messages).omit({
  id: true,
  timestamp: true,
});

export const insertFirDraftSchema = createInsertSchema(firDrafts).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertCaseSchema = createInsertSchema(cases).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertGlossaryTermSchema = createInsertSchema(glossaryTerms).omit({
  id: true,
  createdAt: true,
});

export const insertLawyerSchema = createInsertSchema(lawyers).omit({
  id: true,
  createdAt: true,
});
