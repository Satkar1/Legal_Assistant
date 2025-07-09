import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { getLegalGuidance, generateFIRDraft, translateText } from "./ai";
import {
  insertMessageSchema,
  insertConversationSchema,
  insertFirDraftSchema,
  insertCaseSchema,
  insertGlossaryTermSchema,
  insertLawyerSchema,
} from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Chat/Conversation routes
  app.get('/api/conversations', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const conversations = await storage.getUserConversations(userId);
      res.json(conversations);
    } catch (error) {
      console.error("Error fetching conversations:", error);
      res.status(500).json({ message: "Failed to fetch conversations" });
    }
  });

  app.post('/api/conversations', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const validatedData = insertConversationSchema.parse({
        ...req.body,
        userId
      });
      
      const conversation = await storage.createConversation(validatedData);
      res.json(conversation);
    } catch (error) {
      console.error("Error creating conversation:", error);
      res.status(400).json({ message: "Failed to create conversation" });
    }
  });

  app.get('/api/conversations/:id/messages', isAuthenticated, async (req: any, res) => {
    try {
      const conversationId = parseInt(req.params.id);
      const messages = await storage.getConversationMessages(conversationId);
      res.json(messages);
    } catch (error) {
      console.error("Error fetching messages:", error);
      res.status(500).json({ message: "Failed to fetch messages" });
    }
  });

  app.post('/api/conversations/:id/messages', isAuthenticated, async (req: any, res) => {
    try {
      const conversationId = parseInt(req.params.id);
      const userId = req.user.claims.sub;
      
      // Get user's language preference
      const user = await storage.getUser(userId);
      const language = user?.languagePreference || "en";
      
      const validatedData = insertMessageSchema.parse({
        ...req.body,
        conversationId
      });
      
      // Save user message
      const userMessage = await storage.createMessage(validatedData);
      
      // Get AI response
      const aiResponse = await getLegalGuidance(
        validatedData.content,
        language
      );
      
      // Save AI response
      const assistantMessage = await storage.createMessage({
        conversationId,
        role: "assistant",
        content: JSON.stringify(aiResponse)
      });
      
      res.json({ userMessage, assistantMessage });
    } catch (error) {
      console.error("Error creating message:", error);
      res.status(400).json({ message: "Failed to create message" });
    }
  });

  // FIR routes
  app.get('/api/fir-drafts', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const firDrafts = await storage.getUserFirDrafts(userId);
      res.json(firDrafts);
    } catch (error) {
      console.error("Error fetching FIR drafts:", error);
      res.status(500).json({ message: "Failed to fetch FIR drafts" });
    }
  });

  app.post('/api/fir-drafts', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      const language = user?.languagePreference || "en";
      
      const validatedData = insertFirDraftSchema.parse({
        ...req.body,
        userId
      });
      
      const firDraft = await storage.createFirDraft(validatedData);
      res.json(firDraft);
    } catch (error) {
      console.error("Error creating FIR draft:", error);
      res.status(400).json({ message: "Failed to create FIR draft" });
    }
  });

  app.post('/api/fir-drafts/generate', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      const language = user?.languagePreference || "en";
      
      const schema = z.object({
        incidentType: z.string(),
        location: z.string(),
        dateTime: z.string(),
        description: z.string(),
        complainantDetails: z.object({
          name: z.string(),
          address: z.string(),
          phone: z.string(),
        })
      });
      
      const validatedData = schema.parse(req.body);
      const generated = await generateFIRDraft(validatedData, language);
      
      // Save the generated FIR
      const firDraft = await storage.createFirDraft({
        userId,
        title: generated.title,
        content: generated.content,
        incidentType: validatedData.incidentType,
        location: validatedData.location,
        dateOfIncident: new Date(validatedData.dateTime),
      });
      
      res.json(firDraft);
    } catch (error) {
      console.error("Error generating FIR draft:", error);
      res.status(400).json({ message: "Failed to generate FIR draft" });
    }
  });

  app.put('/api/fir-drafts/:id', isAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = req.body;
      
      const firDraft = await storage.updateFirDraft(id, updates);
      res.json(firDraft);
    } catch (error) {
      console.error("Error updating FIR draft:", error);
      res.status(400).json({ message: "Failed to update FIR draft" });
    }
  });

  // Case routes
  app.get('/api/cases', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const cases = await storage.getUserCases(userId);
      res.json(cases);
    } catch (error) {
      console.error("Error fetching cases:", error);
      res.status(500).json({ message: "Failed to fetch cases" });
    }
  });

  app.post('/api/cases', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const validatedData = insertCaseSchema.parse({
        ...req.body,
        userId
      });
      
      const caseData = await storage.createCase(validatedData);
      res.json(caseData);
    } catch (error) {
      console.error("Error creating case:", error);
      res.status(400).json({ message: "Failed to create case" });
    }
  });

  app.put('/api/cases/:id', isAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = req.body;
      
      const caseData = await storage.updateCase(id, updates);
      res.json(caseData);
    } catch (error) {
      console.error("Error updating case:", error);
      res.status(400).json({ message: "Failed to update case" });
    }
  });

  // Legal glossary routes
  app.get('/api/glossary-terms', async (req, res) => {
    try {
      const { q, language = "en" } = req.query;
      
      if (q && typeof q === 'string') {
        const terms = await storage.searchGlossaryTerms(q, language as string);
        res.json(terms);
      } else {
        // Return all terms if no query
        const terms = await storage.searchGlossaryTerms("", language as string);
        res.json(terms);
      }
    } catch (error) {
      console.error("Error fetching glossary terms:", error);
      res.status(500).json({ message: "Failed to fetch glossary terms" });
    }
  });

  app.get('/api/glossary', async (req, res) => {
    try {
      const { q, language = "en" } = req.query;
      
      if (!q || typeof q !== 'string') {
        return res.status(400).json({ message: "Query parameter 'q' is required" });
      }
      
      const terms = await storage.searchGlossaryTerms(q, language as string);
      res.json(terms);
    } catch (error) {
      console.error("Error searching glossary:", error);
      res.status(500).json({ message: "Failed to search glossary" });
    }
  });

  app.get('/api/glossary/:term', async (req, res) => {
    try {
      const { term } = req.params;
      const { language = "en" } = req.query;
      
      const glossaryTerm = await storage.getGlossaryTerm(term, language as string);
      
      if (!glossaryTerm) {
        return res.status(404).json({ message: "Term not found" });
      }
      
      res.json(glossaryTerm);
    } catch (error) {
      console.error("Error fetching glossary term:", error);
      res.status(500).json({ message: "Failed to fetch glossary term" });
    }
  });

  // Lawyer directory routes
  app.get('/api/lawyers', async (req, res) => {
    try {
      const { q, specialization, location } = req.query;
      
      const lawyers = await storage.searchLawyers(
        q as string,
        specialization as string,
        location as string
      );
      
      res.json(lawyers);
    } catch (error) {
      console.error("Error searching lawyers:", error);
      res.status(500).json({ message: "Failed to search lawyers" });
    }
  });

  app.get('/api/lawyers/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const lawyer = await storage.getLawyer(id);
      
      if (!lawyer) {
        return res.status(404).json({ message: "Lawyer not found" });
      }
      
      res.json(lawyer);
    } catch (error) {
      console.error("Error fetching lawyer:", error);
      res.status(500).json({ message: "Failed to fetch lawyer" });
    }
  });

  // Translation route
  app.post('/api/translate', isAuthenticated, async (req: any, res) => {
    try {
      const schema = z.object({
        text: z.string(),
        targetLanguage: z.string()
      });
      
      const { text, targetLanguage } = schema.parse(req.body);
      const translatedText = await translateText(text, targetLanguage);
      
      res.json({ translatedText });
    } catch (error) {
      console.error("Error translating text:", error);
      res.status(400).json({ message: "Failed to translate text" });
    }
  });

  // User preferences route
  app.put('/api/user/preferences', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { languagePreference } = req.body;
      
      const user = await storage.upsertUser({
        id: userId,
        languagePreference
      });
      
      res.json(user);
    } catch (error) {
      console.error("Error updating user preferences:", error);
      res.status(400).json({ message: "Failed to update preferences" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
