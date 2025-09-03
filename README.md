# Knowledge Library

A personal, secure knowledge management system for storing AI coding insights, tutorials, and resources. Features dark mode UI, hierarchical categories, and support for links and YouTube videos.

## Features

- 🔐 **Secure Authentication** - Password-protected personal access
- 🌙 **Dark Mode UI** - Clean, minimal dark theme design
- 📁 **Hierarchical Categories** - Organize entries with nested categories
- 🔗 **Link Management** - Store and organize external resources
- 📺 **YouTube Integration** - Embed videos directly in entries
- 🔍 **Full-Text Search** - Search across all entries and content
- 📱 **Responsive Design** - Works on desktop and mobile devices

## Tech Stack

- **Frontend**: Next.js 15 with TypeScript
- **Styling**: Tailwind CSS
- **Database**: SQLite with Prisma ORM
- **Authentication**: NextAuth.js
- **Icons**: Lucide React

## Setup Instructions

### 1. Start the Development Server

The project is already initialized and ready to run:

```bash
npm run dev
```

The application will be available at [http://localhost:3000](http://localhost:3000)

### 2. Create Your User Account

Once the server is running, you need to create your first user account. You can do this in two ways:

#### Option A: Using the Setup Script (Recommended)

```bash
node scripts/setup-user.js
```

Follow the prompts to create your username and password.

#### Option B: Using API Directly

Send a POST request to the setup endpoint:

```bash
curl -X POST http://localhost:3000/api/setup \
  -H "Content-Type: application/json" \
  -d '{"username": "your-username", "password": "your-password"}'
```

### 3. Login and Start Using

1. Navigate to [http://localhost:3000/login](http://localhost:3000/login)
2. Enter your credentials
3. Start creating knowledge entries!

## Usage Guide

### Creating Entries

1. Click the "Add Entry" button
2. Fill in the title and content
3. Optionally add:
   - **Categories**: Create or select existing categories for organization
   - **Links**: Add external resources with titles and URLs
   - **Videos**: Add YouTube videos (paste full URL or video ID)
4. Click "Create Entry" to save

### Organizing with Categories

- Create hierarchical categories (e.g., "Programming" → "JavaScript" → "React")
- Filter entries by category using the dropdown
- Categories are shared across all entries

### Searching

- Use the search bar to find entries by title or content
- Combine search with category filtering for precise results

### Managing Links and Videos

- **Links**: Add external resources that open in new tabs
- **Videos**: YouTube videos are automatically embedded and playable inline
- Both support multiple entries per knowledge entry

## Project Structure

```
daniko-website-knowledge/
├── src/
│   ├── app/
│   │   ├── api/           # API routes
│   │   ├── login/         # Login page
│   │   └── page.tsx       # Main application
│   ├── components/        # React components
│   ├── lib/              # Utilities and database
│   └── types/            # TypeScript definitions
├── prisma/
│   └── schema.prisma     # Database schema
└── scripts/
    └── setup-user.js     # User creation script
```

## Database Schema

- **Users**: Authentication and user management
- **Categories**: Hierarchical category system
- **Entries**: Main knowledge entries with content
- **Links**: External resource links
- **Videos**: YouTube video embeddings

## Development

### Database Management

```bash
# Generate Prisma client
npx prisma generate

# Reset database
npx prisma db push --force-reset

# View database
npx prisma studio
```

### Environment Variables

The `.env` file contains:
- `DATABASE_URL`: SQLite database path
- `NEXTAUTH_SECRET`: Authentication secret key
- `NEXTAUTH_URL`: Application URL

## Security Notes

- This is designed for personal use only
- Database and authentication are local
- Change the `NEXTAUTH_SECRET` for production use
- Consider adding HTTPS in production environments

## Future Enhancements

Potential improvements you might consider:
- Rich text editing
- File attachments
- Export functionality
- Backup/restore features
- Advanced search with filters
- Tag-based organization
- Collaborative features
