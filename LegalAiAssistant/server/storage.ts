import {
  users,
  conversations,
  messages,
  firDrafts,
  cases,
  glossaryTerms,
  lawyers,
  type User,
  type UpsertUser,
  type Conversation,
  type InsertConversation,
  type Message,
  type InsertMessage,
  type FirDraft,
  type InsertFirDraft,
  type Case,
  type InsertCase,
  type GlossaryTerm,
  type InsertGlossaryTerm,
  type Lawyer,
  type InsertLawyer,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, ilike, and } from "drizzle-orm";

export interface IStorage {
  // User operations (mandatory for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Conversation operations
  getUserConversations(userId: string): Promise<Conversation[]>;
  createConversation(conversation: InsertConversation): Promise<Conversation>;
  getConversation(id: number): Promise<Conversation | undefined>;
  
  // Message operations
  getConversationMessages(conversationId: number): Promise<Message[]>;
  createMessage(message: InsertMessage): Promise<Message>;
  
  // FIR operations
  getUserFirDrafts(userId: string): Promise<FirDraft[]>;
  createFirDraft(firDraft: InsertFirDraft): Promise<FirDraft>;
  updateFirDraft(id: number, updates: Partial<FirDraft>): Promise<FirDraft>;
  getFirDraft(id: number): Promise<FirDraft | undefined>;
  
  // Case operations
  getUserCases(userId: string): Promise<Case[]>;
  createCase(caseData: InsertCase): Promise<Case>;
  updateCase(id: number, updates: Partial<Case>): Promise<Case>;
  getCase(id: number): Promise<Case | undefined>;
  
  // Glossary operations
  searchGlossaryTerms(query: string, language?: string): Promise<GlossaryTerm[]>;
  getGlossaryTerm(term: string, language?: string): Promise<GlossaryTerm | undefined>;
  createGlossaryTerm(term: InsertGlossaryTerm): Promise<GlossaryTerm>;
  
  // Lawyer operations
  searchLawyers(query?: string, specialization?: string, location?: string): Promise<Lawyer[]>;
  getLawyer(id: number): Promise<Lawyer | undefined>;
  createLawyer(lawyer: InsertLawyer): Promise<Lawyer>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Conversation operations
  async getUserConversations(userId: string): Promise<Conversation[]> {
    return await db
      .select()
      .from(conversations)
      .where(eq(conversations.userId, userId))
      .orderBy(desc(conversations.updatedAt));
  }

  async createConversation(conversation: InsertConversation): Promise<Conversation> {
    const [newConversation] = await db
      .insert(conversations)
      .values(conversation)
      .returning();
    return newConversation;
  }

  async getConversation(id: number): Promise<Conversation | undefined> {
    const [conversation] = await db
      .select()
      .from(conversations)
      .where(eq(conversations.id, id));
    return conversation;
  }

  // Message operations
  async getConversationMessages(conversationId: number): Promise<Message[]> {
    return await db
      .select()
      .from(messages)
      .where(eq(messages.conversationId, conversationId))
      .orderBy(messages.timestamp);
  }

  async createMessage(message: InsertMessage): Promise<Message> {
    const [newMessage] = await db
      .insert(messages)
      .values(message)
      .returning();
    return newMessage;
  }

  // FIR operations
  async getUserFirDrafts(userId: string): Promise<FirDraft[]> {
    return await db
      .select()
      .from(firDrafts)
      .where(eq(firDrafts.userId, userId))
      .orderBy(desc(firDrafts.createdAt));
  }

  async createFirDraft(firDraft: InsertFirDraft): Promise<FirDraft> {
    const [newFirDraft] = await db
      .insert(firDrafts)
      .values(firDraft)
      .returning();
    return newFirDraft;
  }

  async updateFirDraft(id: number, updates: Partial<FirDraft>): Promise<FirDraft> {
    const [updatedFirDraft] = await db
      .update(firDrafts)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(firDrafts.id, id))
      .returning();
    return updatedFirDraft;
  }

  async getFirDraft(id: number): Promise<FirDraft | undefined> {
    const [firDraft] = await db
      .select()
      .from(firDrafts)
      .where(eq(firDrafts.id, id));
    return firDraft;
  }

  // Case operations
  async getUserCases(userId: string): Promise<Case[]> {
    return await db
      .select()
      .from(cases)
      .where(eq(cases.userId, userId))
      .orderBy(desc(cases.createdAt));
  }

  async createCase(caseData: InsertCase): Promise<Case> {
    const [newCase] = await db
      .insert(cases)
      .values(caseData)
      .returning();
    return newCase;
  }

  async updateCase(id: number, updates: Partial<Case>): Promise<Case> {
    const [updatedCase] = await db
      .update(cases)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(cases.id, id))
      .returning();
    return updatedCase;
  }

  async getCase(id: number): Promise<Case | undefined> {
    const [caseData] = await db
      .select()
      .from(cases)
      .where(eq(cases.id, id));
    return caseData;
  }

  // Glossary operations
  async searchGlossaryTerms(query: string, language = "en"): Promise<GlossaryTerm[]> {
    return await db
      .select()
      .from(glossaryTerms)
      .where(
        and(
          ilike(glossaryTerms.term, `%${query}%`),
          eq(glossaryTerms.language, language)
        )
      );
  }

  async getGlossaryTerm(term: string, language = "en"): Promise<GlossaryTerm | undefined> {
    const [glossaryTerm] = await db
      .select()
      .from(glossaryTerms)
      .where(
        and(
          eq(glossaryTerms.term, term),
          eq(glossaryTerms.language, language)
        )
      );
    return glossaryTerm;
  }

  async createGlossaryTerm(term: InsertGlossaryTerm): Promise<GlossaryTerm> {
    const [newTerm] = await db
      .insert(glossaryTerms)
      .values(term)
      .returning();
    return newTerm;
  }

  // Lawyer operations
  async searchLawyers(query?: string, specialization?: string, location?: string): Promise<Lawyer[]> {
    let whereConditions = [];
    
    if (query) {
      whereConditions.push(ilike(lawyers.name, `%${query}%`));
    }
    
    if (specialization) {
      whereConditions.push(eq(lawyers.specialization, specialization));
    }
    
    if (location) {
      whereConditions.push(ilike(lawyers.location, `%${location}%`));
    }

    return await db
      .select()
      .from(lawyers)
      .where(whereConditions.length > 0 ? and(...whereConditions) : undefined)
      .orderBy(desc(lawyers.rating));
  }

  async getLawyer(id: number): Promise<Lawyer | undefined> {
    const [lawyer] = await db
      .select()
      .from(lawyers)
      .where(eq(lawyers.id, id));
    return lawyer;
  }

  async createLawyer(lawyer: InsertLawyer): Promise<Lawyer> {
    const [newLawyer] = await db
      .insert(lawyers)
      .values(lawyer)
      .returning();
    return newLawyer;
  }
}

export const storage = new DatabaseStorage();
