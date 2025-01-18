# Birthday App Setup Guide

This guide will help you set up and configure all aspects of the Birthday App, including the codebase, Google Authentication, and Supabase backend.

## Table of Contents
- [Prerequisites](#prerequisites)
- [Local Development Setup](#local-development-setup)
- [Environment Variables](#environment-variables)
- [Google Console Configuration](#google-console-configuration)
- [Supabase Configuration](#supabase-configuration)
- [Deployment](#deployment)

## Prerequisites

Before you begin, ensure you have:
- Node.js 18+ installed
- A Supabase account
- A Google Cloud Console account
- Git installed (optional, for version control)

## Local Development Setup

1. Clone the repository:
```bash
git clone <repository-url>
cd birthday-app
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Google Console Configuration

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select an existing one
3. Enable the Google OAuth2 API:
   - Navigate to "APIs & Services" > "Library"
   - Search for "Google OAuth2"
   - Click "Enable"

4. Configure OAuth Consent Screen:
   - Go to "APIs & Services" > "OAuth consent screen"
   - Choose "External" user type
   - Fill in the required information:
     - App name: "Birthday App"
     - User support email
     - Developer contact information
   - Add the following scopes:
     - email
     - profile
   - Add test users if needed

5. Create OAuth 2.0 Client ID:
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth client ID"
   - Application type: "Web application"
   - Name: "Birthday App"
   - Authorized JavaScript origins:
     - Development: `http://localhost:5173`
     - Production: `https://your-domain.com`
   - Authorized redirect URIs:
     - Development: `http://localhost:5173/auth/callback`
     - Production: `https://your-domain.com/auth/callback`

## Supabase Configuration

### Project Setup

1. Create a new project in [Supabase Dashboard](https://app.supabase.com)
2. Note down the project URL and anon key (found in Project Settings > API)

### Database Configuration

1. Enable the PostgreSQL extensions:
   - Go to Database > Extensions
   - Enable:
     - uuid-ossp
     - pgcrypto

2. Run the migrations:
   - All migrations are in `supabase/migrations/`
   - They will be automatically applied when connected to Supabase

### Authentication Setup

1. Go to Authentication > Providers
2. Enable Google provider:
   - Add Client ID and Client Secret from Google Console
   - Set Redirect URL to match your application URLs

### Realtime API Configuration

1. Go to Database > Replication
2. Enable realtime for the following tables:
   - notes
   - wishlist

### Row Level Security (RLS)

RLS policies are automatically configured through migrations for:
- Public read access to wishlist items
- Authenticated user access for notes
- Proper access control for wishlist reservations

### Database Indexes

The following indexes are automatically created:
- `notes_user_id_idx` on `notes(user_id)`
- `notes_position_idx` on `notes(position)`
- `wish_list_reservations_item_id_idx` on `wish_list_reservations(item_id)`

## Deployment

### Netlify Deployment

1. Connect your repository to Netlify
2. Configure build settings:
   - Build command: `npm run build`
   - Publish directory: `dist`
   - Node version: 18+

3. Add environment variables:
   - VITE_SUPABASE_URL
   - VITE_SUPABASE_ANON_KEY

4. Deploy!

## Troubleshooting

### Common Issues

1. Authentication Issues:
   - Verify Google Console redirect URIs match your application URLs
   - Check Supabase authentication settings
   - Ensure environment variables are correctly set

2. Database Issues:
   - Check RLS policies if data access is denied
   - Verify Supabase connection settings
   - Enable database logging for debugging

3. Realtime Updates Not Working:
   - Verify realtime is enabled for required tables
   - Check client-side subscription setup
   - Ensure WebSocket connections are not blocked

## Security Considerations

1. Environment Variables:
   - Never commit `.env` files
   - Use different keys for development and production

2. Authentication:
   - Always use HTTPS in production
   - Implement proper session management
   - Follow OAuth 2.0 best practices

3. Database:
   - Keep RLS policies up to date
   - Regularly review access patterns
   - Monitor database usage and performance

## Maintenance

1. Regular Updates:
   - Keep dependencies updated
   - Monitor Supabase version updates
   - Update Google OAuth configurations as needed

2. Monitoring:
   - Set up error tracking
   - Monitor database performance
   - Track authentication issues

3. Backups:
   - Enable automatic database backups in Supabase
   - Regularly test backup restoration
   - Keep configuration documentation updated