# LexiBot - AI Legal Assistant

## Overview

LexiBot is a comprehensive AI-powered legal assistance platform designed for Indian law. It provides users with instant legal guidance, document generation tools, case tracking capabilities, and access to legal resources through an intuitive web interface.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript
- **Routing**: Wouter for client-side routing
- **State Management**: TanStack Query for server state and React hooks for local state
- **Styling**: Tailwind CSS with shadcn/ui components
- **Build Tool**: Vite for development and production builds
- **Internationalization**: react-i18next for multi-language support (English, Hindi, Marathi)

### Backend Architecture
- **Runtime**: Node.js with Express.js server
- **Database**: PostgreSQL with Drizzle ORM
- **Database Provider**: Neon Database (serverless PostgreSQL)
- **Authentication**: Replit Auth with OpenID Connect
- **Session Management**: express-session with PostgreSQL store
- **AI Integration**: Anthropic Claude API for legal assistance

### Authentication Strategy
The application uses Replit Auth as the primary authentication mechanism, providing:
- OAuth 2.0/OpenID Connect integration
- Session-based authentication with PostgreSQL storage
- User profile management with language preferences
- Secure middleware for protected routes

## Key Components

### AI Legal Assistant
- **Primary Model**: HuggingFace free models (microsoft/DialoGPT-large)
- **Translation**: Google Translate API with MyMemory fallback
- **Capabilities**: Legal guidance, document drafting, case law references
- **Multi-language Support**: English, Hindi, and Marathi responses
- **Structured Responses**: JSON format with disclaimers and suggested actions
- **Free Alternatives Implementation**: Uses open-source models instead of paid APIs

### Database Schema
- **Users**: Profile data, language preferences, timestamps
- **Conversations**: Chat history organization
- **Messages**: Individual chat messages with role-based content
- **FIR Drafts**: Police complaint document generation and storage
- **Cases**: Legal case tracking with status updates
- **Glossary Terms**: Legal terminology database
- **Lawyers**: Legal professional directory
- **Sessions**: Authentication session persistence

### Frontend Features
1. **Dashboard**: Central hub with quick actions and recent activity
2. **Chat Interface**: Real-time AI legal consultation
3. **FIR Generator**: Automated police complaint drafting
4. **Case Tracker**: Personal case management system
5. **Legal Library**: Comprehensive legal glossary and resources
6. **Lawyer Directory**: Professional legal service connections

## Data Flow

### User Authentication Flow
1. User initiates login via `/api/login`
2. Replit Auth redirects to OAuth provider
3. Successful authentication creates/updates user session
4. Client receives user data and maintains authenticated state
5. Protected routes verify session middleware

### AI Interaction Flow
1. User submits legal query through chat interface
2. Frontend sends request to `/api/chat` endpoint
3. Server processes query with context and language preference
4. HuggingFace model generates structured legal response
5. Response stored in database and returned to client
6. Frontend displays response with legal disclaimers

### Document Generation Flow
1. User fills FIR generation form with incident details
2. Form data sent to `/api/fir-drafts` endpoint
3. Server uses AI to generate professional FIR draft
4. Draft saved to database with user association
5. User can edit, save, or download generated document

## External Dependencies

### Core Dependencies
- **HuggingFace Inference**: Free AI model integration for legal assistance
- **Neon Database**: Serverless PostgreSQL hosting
- **Drizzle ORM**: Type-safe database operations
- **Radix UI**: Accessible component primitives
- **TanStack Query**: Server state management
- **Replit Auth**: Authentication and session management

### Development Tools
- **TypeScript**: Type safety across frontend and backend
- **Vite**: Fast development and build tooling
- **Tailwind CSS**: Utility-first styling framework
- **ESBuild**: Production backend bundling

## Deployment Strategy

### Development Environment
- **Server**: Express.js with Vite middleware for HMR
- **Database**: Development database with migrations
- **Environment Variables**: Local `.env` configuration
- **Live Reload**: Vite plugin integration for real-time updates

### Production Build Process
1. **Frontend**: Vite builds React application to `dist/public`
2. **Backend**: ESBuild bundles server code to `dist/index.js`
3. **Static Assets**: Served directly by Express in production
4. **Database**: Drizzle migrations applied automatically

### Environment Configuration
- `DATABASE_URL`: PostgreSQL connection string (required)
- `GOOGLE_TRANSLATE_API_KEY`: Google Translate API access (optional, falls back to free translation)
- `SESSION_SECRET`: Session encryption key (required)
- `REPL_ID`: Replit environment identifier
- `ISSUER_URL`: OAuth provider endpoint

### Scaling Considerations
- Serverless-compatible architecture
- Session state stored in database for horizontal scaling
- Stateless server design with external session management
- Database connection pooling for concurrent users

## Deployment Guide

### Vercel Deployment (Recommended)

The project is configured for easy deployment to Vercel with the included `vercel.json` configuration.

**Quick Deployment Steps:**
1. Push your code to GitHub
2. Connect GitHub repo to Vercel
3. Set up environment variables in Vercel dashboard
4. Deploy automatically

**Required Environment Variables:**
- `DATABASE_URL`: PostgreSQL connection string (Neon recommended)
- `SESSION_SECRET`: Random secret for session encryption
- `REPL_ID`: Your application identifier
- `REPLIT_DOMAINS`: Your Vercel app domain
- `ISSUER_URL`: OAuth provider endpoint

**Optional Environment Variables:**
- `GOOGLE_TRANSLATE_API_KEY`: For enhanced translation quality
- API keys for premium AI services (if upgrading from free alternatives)

See `DEPLOYMENT.md` for detailed deployment instructions and troubleshooting guide.