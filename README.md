# ALX Polly - Real-Time Polling Application

ALX Polly is a full-stack polling application designed to provide a seamless and engaging user experience for creating, sharing, and analyzing polls. Built with a modern tech stack, it features real-time voting, user authentication, and a responsive, intuitive UI. This project serves as a comprehensive example of building a modern web application with Next.js and Supabase.

## Tech Stack

- **Framework**: Next.js 14 (with App Router)
- **Language**: TypeScript
- **Backend**: Supabase (PostgreSQL, Auth, Realtime)
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Icons**: Lucide React
- **Testing**: Jest, React Testing Library

## Features

- 🗳️ **Poll Management**: Create, edit, and delete polls with customizable options.
- 📊 **Real-Time Results**: View voting results update live.
- 🔐 **User Authentication**: Secure user registration and login with Supabase Auth.
- 📱 **Responsive Design**: Fully responsive UI for a seamless experience on all devices.
- 🚀 **Server-Side Rendering (SSR)**: Fast initial page loads and improved SEO with Next.js.
- 🔍 **Filtering and Sorting**: Easily find polls with search, filtering, and sorting options.
- 👤 **User Dashboard**: View and manage your created polls.

## Getting Started

Follow these steps to get the project up and running on your local machine.

### Prerequisites

- Node.js (v18 or later)
- npm or yarn
- A free [Supabase](https://supabase.com/) account

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/alx-polly.git
cd alx-polly
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Supabase

1.  **Create a new Supabase project**: Go to your [Supabase Dashboard](https://app.supabase.com) and create a new project.
2.  **Get your API credentials**:
    *   In your Supabase project, navigate to **Settings** > **API**.
    *   Find your **Project URL** and **anon public key**.
3.  **Set up the database schema**:
    *   Go to the **SQL Editor** in your Supabase project.
    *   Execute the SQL script located at `supabase/schema.sql` in your project to create the necessary tables and policies.

### 4. Configure Environment Variables

Create a `.env.local` file in the root of your project and add your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Replace `your_supabase_project_url` and `your_supabase_anon_key` with the credentials you copied from your Supabase project.

## How to Run and Test the App Locally

### Running the Development Server

To start the app in development mode, run:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

### Running Tests

This project uses Jest and React Testing Library for testing. To run the test suite, use:

```bash
npm test
```

This will run all the tests and provide a summary of the results.

## Usage Examples

### Creating a Poll

1.  Log in or create a new account.
2.  Navigate to the **Create Poll** page.
3.  Fill in the poll title, an optional description, and at least two options.
4.  Configure settings like allowing multiple votes or setting an expiration date.
5.  Click **Create Poll** to publish it.

### Voting on a Poll

1.  Go to the **Polls** page to see a list of all available polls.
2.  Click on a poll to view its details.
3.  Select your desired option(s).
4.  Click **Submit Vote**. The results will be displayed in real-time.

## Project Structure

```
alx-polly/
├── app/
│   ├── (auth)/          # Authentication pages (login, register)
│   ├── (main)/          # Core application pages
│   ├── api/             # API routes
│   └── ...
├── components/
│   ├── auth/            # Auth-related components
│   ├── polls/           # Poll-related components
│   └── ui/              # Reusable UI components from shadcn/ui
├── lib/
│   ├── supabase/        # Supabase client configuration
│   └── utils.ts         # Utility functions
├── supabase/
│   └── schema.sql       # Database schema and policies
└── ...
```

## Contributing

Contributions are welcome! Please follow these steps to contribute:

1.  Fork the repository.
2.  Create a new branch (`git checkout -b feature/your-feature-name`).
3.  Make your changes and commit them (`git commit -m 'Add some feature'`).
4.  Push to the branch (`git push origin feature/your-feature-name`).
5.  Open a pull request.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
