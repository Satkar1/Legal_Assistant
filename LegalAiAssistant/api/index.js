// Simple Vercel serverless function
const express = require('express');
const path = require('path');

// Create Express app for API routes only
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Basic API routes for testing
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'LexiBot API is running' });
});

app.get('/api/test', (req, res) => {
  res.json({ 
    message: 'API is working',
    timestamp: new Date().toISOString(),
    url: req.url
  });
});

// Temporary simple routes until we can import the full server
app.get('/api/lawyers', (req, res) => {
  res.json([
    {
      id: 1,
      name: "Adv. Rajesh Kumar",
      specialization: "Criminal Law",
      location: "Mumbai",
      experience: "15 years",
      rating: 4.8,
      contact: "+91-9876543210"
    },
    {
      id: 2,
      name: "Adv. Priya Sharma",
      specialization: "Family Law",
      location: "Delhi",
      experience: "12 years",
      rating: 4.7,
      contact: "+91-9876543211"
    }
  ]);
});

app.get('/api/glossary-terms', (req, res) => {
  res.json([
    {
      id: 1,
      term: "FIR",
      definition: "First Information Report - A written document prepared by police when they receive information about a cognizable offense",
      language: "en"
    },
    {
      id: 2,
      term: "Bail",
      definition: "The temporary release of an accused person awaiting trial, sometimes on condition that a sum of money is lodged as guarantee",
      language: "en"
    }
  ]);
});

// Auth endpoints
app.get('/api/auth/user', (req, res) => {
  res.status(401).json({ message: 'Unauthorized' });
});

// Catch all API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({ 
    error: 'API endpoint not found',
    path: req.path,
    message: 'This endpoint is not yet implemented in the serverless function'
  });
});

// Export the Express app
module.exports = app;