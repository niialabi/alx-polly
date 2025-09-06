# ALX Polly - Polling Application

A modern, real-time polling application built with Next.js, TypeScript, and Supabase.

## Features

- 🗳️ Create and manage polls
- 📊 Real-time voting and results
- 🔐 User authentication with Supabase Auth
- 📱 Responsive design
- 🚀 Server-side rendering with Next.js
- 💾 PostgreSQL database with Supabase
- 🎨 Modern UI with Tailwind CSS and shadcn/ui

## Tech Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Icons**: Lucide React

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- A Supabase account and project

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd alx-polly
```

2. Install dependencies:
```bash
npm install
```

3. **⚠️ REQUIRED: Set up environment variables**
Create a `.env.local` file in the root directory:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

**How to get your Supabase credentials:**
- Go to your [Supabase Dashboard](https://app.supabase.com)
- Select your project
- Go to Settings → API
- Copy your "Project URL" and "anon public" key

**Example .env.local:**
```env
NEXT_PUBLIC_SUPABASE_URL=https://xyzcompany.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

4. **Set up the database:**
Run the following SQL in your Supabase SQL editor to create the required tables:

```sql
-- Create the 'polls' table to store poll questions
CREATE TABLE IF NOT EXISTS public.polls (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    question text NOT NULL,
    created_at timestamptz DEFAULT now() NOT NULL,
    ends_at timestamptz NULL,
    user_id uuid NULL
);

-- Create the 'options' table to store choices for each poll
CREATE TABLE IF NOT EXISTS public.options (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    poll_id uuid NOT NULL REFERENCES public.polls(id) ON DELETE CASCADE,
    text text NOT NULL,
    created_at timestamptz DEFAULT now() NOT NULL
);

-- Create the 'votes' table to record user votes
CREATE TABLE IF NOT EXISTS public.votes (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    poll_id uuid NOT NULL REFERENCES public.polls(id) ON DELETE CASCADE,
    option_id uuid NOT NULL REFERENCES public.options(id) ON DELETE CASCADE,
    user_id uuid NULL,
    created_at timestamptz DEFAULT now() NOT NULL
);

-- Add unique constraint to prevent multiple votes per user per poll
CREATE UNIQUE INDEX IF NOT EXISTS user_poll_vote_unique ON public.votes (user_id, poll_id) WHERE (user_id IS NOT NULL);

-- Enable Row Level Security
ALTER TABLE public.polls ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.options ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.votes ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Allow authenticated users to create polls" ON public.polls FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Allow all users to view polls" ON public.polls FOR SELECT USING (true);
CREATE POLICY "Allow poll creators to update their polls" ON public.polls FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Allow poll creators to delete their polls" ON public.polls FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Allow all users to view options" ON public.options FOR SELECT USING (true);
CREATE POLICY "Allow authenticated users to create options for their polls" ON public.options FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.polls WHERE public.polls.id = public.options.poll_id AND public.polls.user_id = auth.uid())
);

CREATE POLICY "Allow authenticated users to vote once per poll" ON public.votes FOR INSERT WITH CHECK (
    auth.role() = 'authenticated' AND user_id = auth.uid()
);
CREATE POLICY "Allow anonymous users to vote" ON public.votes FOR INSERT WITH CHECK (
    auth.role() = 'anon' AND user_id IS NULL
);
CREATE POLICY "Allow all users to view votes" ON public.votes FOR SELECT USING (true);
```

5. **Run the development server:**
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Usage

### Creating a Poll

1. Navigate to `/create-poll` or click the "Create Poll" button
2. Fill in the poll details:
   - **Poll Title**: The main question (minimum 5 characters)
   - **Description**: Optional additional context
   - **Options**: Add 2-6 poll options
   - **Settings**: Configure voting preferences and expiration date
3. Click "Create Poll" to publish

### Voting on Polls

1. Browse polls at `/polls` or view a specific poll
2. Select your choice(s) based on the poll configuration
3. Click "Submit Vote" to record your vote
4. View real-time results after voting

### Poll Features

- **Single vs Multiple Choice**: Configure whether users can select one or multiple options
- **Anonymous Voting**: Non-authenticated users can vote (configurable via RLS policies)
- **Authenticated Voting**: Registered users are limited to one vote per poll
- **Poll Expiration**: Set optional expiration dates for polls
- **Real-time Results**: Vote counts update immediately
- **Responsive Design**: Works on desktop and mobile devices

## API Routes

### Polls
- `GET /api/polls` - List all polls with filtering and pagination
- `POST /api/polls` - Create a new poll
- `GET /api/polls/[id]` - Get a specific poll with vote counts
- `POST /api/polls/[id]/vote` - Vote on a poll

### Query Parameters for GET /api/polls
- `search`: Filter polls by title
- `isActive`: Filter by active status (`true`/`false`)
- `sortBy`: Sort by field (`createdAt`, `updatedAt`, `totalVotes`, `title`)
- `sortOrder`: Sort direction (`asc`/`desc`)
- `page`: Page number for pagination
- `limit`: Items per page

## Project Structure

```
alx-polly/
├── app/
│   ├── (auth)/          # Authentication pages
│   ├── (main)/          # Main application pages
│   │   ├── create-poll/ # Poll creation page
│   │   ├── polls/       # Poll listing and detail pages
│   │   └── dashboard/   # User dashboard
│   ├── api/             # API routes
│   │   └── polls/       # Poll-related endpoints
│   └── globals.css      # Global styles
├── components/
│   ├── auth/            # Authentication components
│   ├── layout/          # Layout components
│   ├── polls/           # Poll-specific components
│   └── ui/              # Reusable UI components
├── lib/
│   ├── supabase/        # Supabase client configuration
│   └── utils.ts         # Utility functions
└── types/
    └── index.ts         # TypeScript type definitions
```

## Database Schema

The application uses three main tables:

- **polls**: Stores poll questions and metadata
- **options**: Stores poll choices linked to polls
- **votes**: Records user votes with foreign key relationships

Row Level Security (RLS) is enabled to ensure proper access control and prevent unauthorized data access.

## Authentication

The app supports both authenticated and anonymous users:
- **Authenticated users**: Can create polls and vote (limited to one vote per poll)
- **Anonymous users**: Can vote on existing polls (multiple votes allowed by default)

Authentication is handled by Supabase Auth with cookie-based sessions.

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.