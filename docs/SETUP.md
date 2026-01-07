# TrackMate Setup Guide

## Overview
TrackMate is a task management mobile and web app built with Expo/React Native and Supabase. Features include task CRUD operations, reminders, monitor sharing, and a dark minimalist UI.

## Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Expo CLI (`npm install -g expo-cli`)
- Supabase account

## 1. Supabase Setup

### Create a Supabase Project
1. Go to [https://supabase.com](https://supabase.com)
2. Create a new project
3. Note your project URL and anon key

### Run Database Schema
1. Open your Supabase project dashboard
2. Go to SQL Editor
3. Copy and paste the contents of `supabase_schema.sql`
4. Run the SQL to create the `tasks` table and policies

## 2. Environment Configuration

Create a `.env` file in the `client/` directory:

```env
EXPO_PUBLIC_SUPABASE_URL=your_supabase_project_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Replace the values with your actual Supabase credentials.

## 3. Install Dependencies

Navigate to the client directory and install packages:

```bash
cd client
npm install
```

### Required Packages
The following packages are needed (add if missing):
- `@react-native-community/datetimepicker` - Date/time picker for task due dates
- `expo-notifications` - Push notifications (optional, for reminders)

Install them:
```bash
npx expo install @react-native-community/datetimepicker
npx expo install expo-notifications
```

## 4. Run the App

### Development Mode
```bash
cd client
npm start
```

Then:
- Press `i` for iOS simulator
- Press `a` for Android emulator
- Press `w` for web browser
- Scan QR code with Expo Go app on your phone

## 5. Features

### Dashboard
- **Overdue Tasks**: Tasks past their due date (highlighted in orange)
- **Today**: Tasks due today
- **Upcoming**: Future tasks
- Pull to refresh
- Floating action button to create new tasks

### Task Management
- Create, edit, and delete tasks
- Set title, description, due date/time
- Choose priority (Low, Medium, High)
- Set reminder offset (None, 5min, 30min, 1hr, 1 day)
- Mark tasks as complete/incomplete

### History
- **Completed Tab**: View and restore completed tasks
- **Shared with Me Tab**: View tasks where you're added as a monitor

### Settings
- View account information
- Toggle push notifications
- Sign out

### Monitor Sharing (Coming Soon)
- Add monitors by email to tasks
- Monitors can view task progress
- Accountability feature for task completion

## 6. Project Structure

```
client/
├── app/
│   ├── (tabs)/           # Authenticated tab navigation
│   │   ├── index.tsx     # Dashboard
│   │   ├── history.tsx   # Completed & Shared tasks
│   │   └── settings.tsx  # Settings & account
│   ├── auth/
│   │   └── sign-in.tsx   # Authentication
│   ├── task/
│   │   └── [id].tsx      # Task create/edit screen
│   └── _layout.tsx       # Root layout with auth guard
├── contexts/
│   └── AuthContext.tsx   # Supabase auth context
├── services/
│   └── taskService.ts    # Task CRUD operations
├── types/
│   └── task.ts           # TypeScript types
├── lib/
│   └── supabase.ts       # Supabase client
└── .env                  # Environment variables
```

## 7. Database Schema

### Tasks Table
- `id` (UUID, primary key)
- `user_id` (UUID, foreign key to auth.users)
- `title` (text, required)
- `description` (text, optional)
- `due_at` (timestamp with timezone)
- `reminder_offset_minutes` (integer: 0, 5, 30, 60, 1440)
- `priority` (text: 'low', 'medium', 'high')
- `completed_at` (timestamp, nullable)
- `monitor_emails` (text array)
- `monitor_uids` (UUID array)
- `created_at` (timestamp)
- `updated_at` (timestamp)

### Row Level Security (RLS)
- Users can only view/edit their own tasks
- Users can view tasks where they are monitors
- Automatic timestamp updates on changes

## 8. Troubleshooting

### Environment Variables Not Loading
- Ensure `.env` is in the `client/` directory
- Restart the Expo dev server after changing `.env`
- Variables must start with `EXPO_PUBLIC_`

### Supabase Connection Issues
- Verify your Supabase URL and anon key
- Check that RLS policies are enabled
- Ensure you're signed in before accessing tasks

### TypeScript Errors
- Run `npm run typecheck` to see all errors
- Ensure all dependencies are installed
- Restart TypeScript server in your IDE

### Date Picker Not Working
- Install `@react-native-community/datetimepicker`
- On iOS, the picker shows as a modal
- On Android, it shows as a dialog

## 9. Next Steps

### Implement Push Notifications
1. Set up Expo push notification credentials
2. Request notification permissions
3. Schedule reminders based on `reminder_offset_minutes`
4. Send notifications for overdue tasks

### Add Monitor Sharing UI
1. Create "Add Monitor" button on task detail screen
2. Input field for monitor email
3. Look up user by email in Supabase auth
4. Add to `monitor_emails` and `monitor_uids` arrays

### Deploy to Production
1. Build for iOS: `eas build --platform ios`
2. Build for Android: `eas build --platform android`
3. Deploy web: `npx expo export:web` and host on Netlify/Vercel

## 10. Support

For issues or questions:
- Check Supabase logs for database errors
- Check Expo dev tools for runtime errors
- Review the code comments for implementation details

---

**TrackMate** - Simple task management with accountability
