# TrackMate

A modern task management mobile and web app built with Expo/React Native and Supabase.

## Features

✅ **Task Management**
- Create, edit, and delete tasks
- Set due dates and times
- Priority levels (Low, Medium, High)
- Task descriptions
- Mark tasks as complete/incomplete
- Delete button in header for easy access

✅ **Smart Dashboard**
- Today's tasks (highlighted)
- Upcoming tasks
- Pull-to-refresh
- Floating action button for quick task creation
- Clean, stress-free interface

✅ **Expense Tracking**
- Track expenses with categories
- Multiple payment methods (Cash, Cards, Mobile Money)
- Liberian Dollar (LRD) support
- Modern spending trend analytics
- Category and payment method breakdown

✅ **Note Management**
- Create and edit notes
- Text formatting (Bold, Italic, Lists, Checklists)
- Lock notes with password protection
- Pin important notes
- Single password system for all locked notes

✅ **Projects**
- Organize tasks and notes by project
- Project status tracking
- Link tasks and notes to projects

✅ **History & Sharing**
- View completed tasks
- Restore completed tasks
- View tasks shared with you
- Monitor sharing (accountability feature)

✅ **Dark Theme UI**
- Minimalist Apple-inspired design
- Dark mode optimized
- Smooth animations
- Responsive layout

✅ **Authentication**
- Supabase Auth integration
- Secure sign-in/sign-up
- Email-based authentication
- User profiles with avatar upload

## Tech Stack

- **Frontend**: Expo (React Native)
- **Backend**: Supabase (PostgreSQL)
- **Language**: TypeScript
- **Navigation**: Expo Router
- **UI**: React Native with custom styling

## Quick Start

1. **Clone and install dependencies**
   ```bash
   cd client
   npm install
   ```

2. **Set up Supabase**
   - Create a Supabase project
   - Run SQL scripts in this order:
     1. `supabase_schema_enhanced.sql` (main schema)
     2. `fix_payment_methods.sql` (payment methods)
     3. `add_global_note_password.sql` (note security)
   - Copy your credentials to `client/.env`

3. **Configure environment**
   ```env
   EXPO_PUBLIC_SUPABASE_URL=your_project_url
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   EXPO_PUBLIC_APP_SCHEME=trackmate
   ```

4. **Run the app**
   ```bash
   npm start
   ```

For detailed setup instructions, see [SETUP.md](./SETUP.md)
For all updates and changes, see [CHANGELOG.md](./CHANGELOG.md)

## Project Structure

```
client/
├── app/
│   ├── (tabs)/           # Main app tabs
│   │   ├── index.tsx     # Dashboard (Tasks)
│   │   ├── expenses.tsx  # Expenses
│   │   ├── notes.tsx     # Notes
│   │   ├── projects.tsx  # Projects
│   │   ├── history.tsx   # History & shared tasks
│   │   └── settings.tsx  # Settings
│   ├── auth/             # Authentication screens
│   ├── task/             # Task CRUD screens
│   ├── expense/          # Expense screens
│   ├── note/             # Note editor
│   ├── project/          # Project screens
│   └── _layout.tsx       # Root layout with auth guard
├── components/           # Reusable UI components
├── services/             # Business logic & API calls
├── types/                # TypeScript definitions
├── contexts/             # React contexts (Auth, Expense)
└── lib/                  # External service clients
```

## Screenshots

### Dashboard
- Organized task sections (Overdue, Today, Upcoming)
- Priority indicators with color coding
- Quick complete button on each task

### Task Creation
- Date and time picker
- Priority selection
- Reminder options (5min, 30min, 1hr, 1 day)
- Rich text description

### History
- Completed tasks with undo option
- Shared tasks view
- Tab-based navigation

### Settings
- Account information
- Notification preferences
- Sign out

## Database Schema

The app uses multiple tables with Row Level Security (RLS) policies:

- **tasks** - Task management with due dates and priorities
- **expenses** - Expense tracking with categories and payment methods
- **notes** - Note storage with lock functionality
- **projects** - Project organization
- **user_profiles** - User information and global note password

All tables enforce:
- Users can only access their own data
- Automatic timestamp management
- Secure password hashing (SHA-256)

## Recent Updates

### Latest Features ✅
- Single password system for locked notes
- Redesigned spending trend chart
- Task delete button moved to header
- Overdue section removed (cleaner UI)
- Liberian Dollar (LRD) currency support
- Mobile money payment methods
- Text formatting in notes

### Roadmap
- [ ] Push notifications for reminders
- [ ] Custom date/time pickers
- [ ] Recurring tasks
- [ ] Task search and filters
- [ ] Export/import data
- [ ] Collaboration features
- [ ] Task attachments

See [CHANGELOG.md](./CHANGELOG.md) for complete update history.

## Contributing

This is a personal project, but suggestions and feedback are welcome!

## License

MIT License - feel free to use this project as a template for your own apps.

## Documentation

- **[README.md](./README.md)** - This file, project overview
- **[SETUP.md](./SETUP.md)** - Detailed setup instructions
- **[CHANGELOG.md](./CHANGELOG.md)** - Complete update history

## License

MIT License - feel free to use this project as a template.

---

**TrackMate** - Stay on track, stay accountable.
