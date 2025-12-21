# TrackMate Changelog

All notable changes and feature implementations for TrackMate.

---

## [Latest Updates] - December 2024

### 🎯 UI/UX Improvements

#### Task Management
- **Delete button moved to header** - Now appears alongside back/save buttons in task editor
- **Overdue section removed** - Simplified dashboard to show only "Today" and "Upcoming" tasks
- **Redesigned task sections** - Cleaner, less stressful interface
- **Banner updates** - Now highlights today's tasks instead of overdue tasks

#### Expense Analytics
- **Spending trend chart redesigned**
  - Amount labels displayed above each bar
  - Gradient opacity (highest spending at 100%, others at 60%)
  - Background bars for better depth perception
  - Added "Daily Spending" legend
  - Increased chart height to 180px
  - Rounded bar corners for modern look

#### Notes
- **Tags removed** - Simplified note editor interface
- **Delete button moved to header** - Consistent with task editor layout
- **Lock/pin icons** - Now in header for better accessibility

### 🔐 Security - Single Password System for Locked Notes

**Major Change:** Replaced per-note passwords with a global password system.

#### How It Works:
1. **Set Password Once** - In Locked Notes tab, set one password for all notes
2. **Lock Any Note** - Enter your global password to lock
3. **Unlock Notes** - Password prompt appears before viewing locked notes
4. **Security Question** - Password recovery option available

#### Technical Implementation:
- Password stored in `user_profiles` table (not per-note)
- SHA-256 hashing for security
- Security question/answer for recovery
- Automatic password verification on lock/unlock

#### New Components:
- `SetNoteLockPasswordModal.tsx` - Initial password setup
- `VerifyNoteLockPasswordModal.tsx` - Verify password to lock notes
- Updated `NoteUnlockModal.tsx` - Global password verification

#### Database Changes:
```sql
-- Added to user_profiles
- note_lock_password
- note_lock_security_question  
- note_lock_security_answer

-- Removed from notes
- password
- security_question
- security_answer
```

### 🐛 Bug Fixes

#### Payment Method Constraint
- **Issue:** MTN MOMO payment method caused database constraint violation
- **Fix:** Updated expenses table constraint to include 'mobile_money'
- **SQL Script:** `fix_payment_methods.sql`

---

## [Previous Features] - 2024

### Expense Management
- **Liberian Dollar (LRD) support** - Default currency with $ symbol
- **Mobile money payment methods** - Orange Money and MTN MOMO
- **Currency display** - Shows on expense cards, analytics, and details
- **Amount input improvements** - Larger font size (32px) for better visibility
- **Enhanced analytics** - Category breakdown, payment method breakdown, top expenses

### Note Management
- **Text formatting** - Bold, italic, list, checklist support
- **Markdown-like syntax** - `**bold**`, `*italic*`, `• list`, `☐ checklist`
- **Lock/unlock functionality** - Protect sensitive notes with password
- **Pin notes** - Keep important notes at the top
- **Locked Notes tab** - Separate view for locked notes
- **Password protection** - Required to access locked notes from list

### Task Management
- **CRUD operations** - Create, read, update, delete tasks
- **Due dates and times** - Date/time picker integration
- **Priority levels** - Low, Medium, High with color coding
- **Reminder options** - 5min, 30min, 1hr, 1 day before due
- **Task completion** - Mark complete/incomplete with undo
- **Monitor sharing** - Add monitors by email (accountability feature)
- **Task sections** - Today and Upcoming organization

### Projects
- **Project creation** - Organize tasks and notes by project
- **Project details** - Description, dates, status tracking
- **Associated tasks/notes** - Link tasks and notes to projects

### Authentication & Profile
- **Supabase Auth** - Email-based authentication
- **User profiles** - Full name, avatar upload
- **Avatar upload** - Non-blocking with error handling
- **RLS policies** - Row-level security for data protection

### UI/UX
- **Dark theme** - Minimalist Apple-inspired design
- **Responsive layout** - Works on mobile and web
- **Pull-to-refresh** - Update data on all list screens
- **Floating action buttons** - Quick access to create actions
- **Custom alerts** - Consistent alert UI across app
- **Loading states** - Activity indicators during data fetch

---

## Database Schema Updates

### Required SQL Scripts (Run in Supabase):

1. **fix_payment_methods.sql** - Add mobile_money to payment methods
2. **add_global_note_password.sql** - Implement global password system
3. **fix_rls_policies.sql** - Fix Row Level Security policies
4. **supabase_schema_enhanced.sql** - Complete database schema

---

## Breaking Changes

### Single Password System
- **Old:** Each note had its own password
- **New:** One global password for all locked notes
- **Migration:** Users must set new global password in Locked Notes tab
- **Impact:** Existing locked notes need to be unlocked with new system

---

## Technical Stack

- **Frontend:** Expo (React Native), TypeScript
- **Backend:** Supabase (PostgreSQL)
- **Navigation:** Expo Router
- **State Management:** React Context API
- **Storage:** Supabase Storage (avatars)
- **Authentication:** Supabase Auth
- **Offline Support:** Cache layer with optimistic updates

---

## Known Issues

None currently reported.

---

## Roadmap

### Planned Features
- [ ] Push notifications for reminders
- [ ] Recurring tasks
- [ ] Task search and filters
- [ ] Export/import data
- [ ] Collaboration features
- [ ] Analytics dashboard
- [ ] Task attachments
- [ ] Custom date/time pickers matching app UI

---

## Contributors

Developed and maintained by the TrackMate team.

---

**Last Updated:** December 20, 2025
