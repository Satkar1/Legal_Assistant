// Vercel serverless function entry point
import express from 'express';
import { registerRoutes } from '../server/routes.js';

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Initialize routes
let routesInitialized = false;
let httpServer;

async function initializeApp() {
  if (!routesInitialized) {
    httpServer = await registerRoutes(app);
    routesInitialized = true;
  }
  return app;
}

// Vercel handler
export default async function handler(req, res) {
  const app = await initializeApp();
  return app(req, res);
}