# AlxPolly - Polling Application

A modern, full-featured polling application built with Next.js 15, TypeScript, and Tailwind CSS. Create polls, gather opinions, and make data-driven decisions with a beautiful, responsive interface.

## 🚀 Features

### Authentication
- User registration and login
- Secure JWT-based authentication
- Protected routes and user sessions
- User profile management

### Poll Management
- Create polls with multiple options (up to 6 choices)
- Support for single-choice and multiple-choice polls
- Set expiration dates for time-limited polls
- Real-time vote counting and results
- Poll status management (active/inactive)

### User Experience
- Clean, modern interface using Shadcn UI components
- Responsive design for all devices
- Real-time updates and live voting
- Poll sharing and social features
- Dashboard with user statistics
- Search and filter functionality

### Technical Features
- Server-side rendering with Next.js 15
- Type-safe development with TypeScript
- Modern CSS with Tailwind CSS
- Component library with Shadcn UI
- RESTful API routes
- Modular architecture

## 🏗️ Project Structure

```
alx-polly/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Authentication routes
│   │   ├── login/
│   │   └── register/
│   ├── (main)/                   # Main application routes
│   │   ├── create-poll/
│   │   ├── dashboard/
│   │   └── polls/
│   │       └── [id]/             # Individual poll pages
│   ├── api/                      # API routes
│   │   ├── auth/
│   │   │   ├── login/
│   │   │   └── register/
│   │   └── polls/
│   ├── globals.css               # Global styles
│   ├── layout.tsx                # Root layout
│   └── page.tsx                  # Homepage
├── components/                   # Reusable components
│   ├── auth/                     # Authentication components
│   │   ├── login-form.tsx
│   │   └── register-form.tsx
│   ├── layout/                   # Layout components
│   │   └── header.tsx
│   ├── polls/                    # Poll-related components
│   │   ├── create-poll-form.tsx
│   │   └── poll-card.tsx
│   └── ui/                       # Shadcn UI components
│       ├── button.tsx
│       ├── card.tsx
│       ├── input.tsx
│       └── label.tsx
├── lib/                          # Utility functions
│   └── utils.ts                  # Common utilities
├── types/                        # TypeScript type definitions
│   └── index.ts                  # All type definitions
├── public/                       # Static assets
├── components.json               # Shadcn UI configuration
├── next.config.ts               # Next.js configuration
├── package.json                 # Dependencies
├── tailwind.config.ts           # Tailwind configuration
└── tsconfig.json                # TypeScript configuration
```

## 🎨 UI Components

The application uses a comprehensive set of UI components:

### Authentication Components
- `LoginForm` - User login with validation
- `RegisterForm` - User registration with validation

### Poll Components
- `PollCard` - Display polls with voting interface
- `CreatePollForm` - Form for creating new polls with multiple options

### Layout Components
- `Header` - Navigation header with authentication state
- `AuthProvider` - Authentication context provider

### UI Components (Shadcn)
- `Button` - Styled button with variants
- `Card` - Content containers with header/footer
- `Input` - Form input fields
- `Label` - Form labels
- And more as needed

## 🔧 Getting Started

### Prerequisites

- Node.js 18+ 
- npm, yarn, or pnpm

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd alx-polly
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. **Run the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```

4. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

### Demo Credentials

For testing purposes, you can use these demo credentials:
- **Email**: demo@example.com
- **Password**: password

## 📱 Usage

### Creating Polls
1. Register or login to your account
2. Click "Create Poll" in the header or dashboard
3. Enter poll title and description
4. Add 2-6 poll options
5. Configure settings (multiple votes, expiration)
6. Submit to create your poll

### Voting on Polls
1. Browse polls on the polls page
2. Click on a poll to view details
3. Select your preferred option(s)
4. Click "Submit Vote" to record your choice
5. View real-time results

### Managing Your Polls
1. Access your dashboard after logging in
2. View statistics and poll performance
3. See recent activity and vote counts
4. Share polls with others

## 🛠️ API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration

### Polls
- `GET /api/polls` - Get all polls (with filtering)
- `POST /api/polls` - Create new poll
- `GET /api/polls/[id]` - Get specific poll
- `POST /api/polls/[id]/vote` - Vote on poll

## 🎯 Key Features Implementation

### Real-time Voting
- Vote submission updates poll data immediately
- Results refresh automatically after voting
- Live vote counts and percentages

### Responsive Design
- Mobile-first approach
- Adaptive layouts for all screen sizes
- Touch-friendly interfaces

### Type Safety
- Comprehensive TypeScript definitions
- Type-safe API calls and data handling
- IntelliSense support throughout

### User Experience
- Loading states and error handling
- Form validation and user feedback
- Intuitive navigation and interactions

## 🔜 Upcoming Features

This scaffolding provides the foundation for implementing:

- [ ] Database integration (PostgreSQL/MongoDB)
- [ ] Real authentication with JWT
- [ ] Email verification
- [ ] Poll analytics and insights
- [ ] Comment system
- [ ] Poll categories and tags
- [ ] Advanced sharing options
- [ ] Poll templates
- [ ] Export functionality
- [ ] Admin dashboard
- [ ] API rate limiting
- [ ] Push notifications

## 🧰 Technology Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Components**: Shadcn UI + Radix UI
- **Icons**: Lucide React
- **State Management**: React Context + useState
- **Utilities**: clsx, tailwind-merge, class-variance-authority

## 📄 License

This project is licensed under the MIT License.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📞 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation

---

Built with ❤️ using Next.js and modern web technologies.
