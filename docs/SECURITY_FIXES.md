# Security Fixes for Supabase Linter Warnings

This document outlines the security warnings identified by the Supabase Database Linter and the steps to resolve them.

## Issues Identified

### 1. Function Search Path Mutable (5 functions)
**Severity:** WARN  
**Category:** SECURITY

Functions without a fixed `search_path` are vulnerable to search path manipulation attacks where malicious users could create objects in schemas that take precedence in the search path.

**Affected Functions:**
- `public.create_default_expense_categories`
- `public.update_updated_at_column`
- `public.update_project_progress`
- `public.calculate_project_progress`
- `public.handle_new_user`

### 2. Leaked Password Protection Disabled
**Severity:** WARN  
**Category:** SECURITY

Supabase Auth can check passwords against the HaveIBeenPwned database to prevent users from using compromised passwords.

## Resolution Steps

### Step 1: Fix Function Search Path Issues

Run the `fix_function_search_path.sql` migration file in your Supabase SQL Editor:

```sql
-- This file contains updated function definitions with:
-- 1. SET search_path = public, pg_temp
-- 2. Proper SECURITY INVOKER/DEFINER settings
```

**What was changed:**
- Added `SET search_path = public, pg_temp` to all functions
- Explicitly set `SECURITY INVOKER` for most functions (runs with caller's privileges)
- Kept `SECURITY DEFINER` for `handle_new_user` (needs elevated privileges to insert into profiles/settings)

**Security Benefits:**
- Prevents search path manipulation attacks
- Ensures functions only access objects in the `public` schema
- Temporary objects are isolated to `pg_temp`

### Step 2: Enable Leaked Password Protection

This setting must be configured in the Supabase Dashboard:

1. Go to your Supabase project dashboard
2. Navigate to **Authentication** → **Policies**
3. Find the **Password Protection** section
4. Enable **"Check passwords against HaveIBeenPwned"**

**Alternative: Via Supabase CLI**

If you're using the Supabase CLI, add this to your `config.toml`:

```toml
[auth.password]
min_length = 8
required_characters = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"

[auth.security]
# Enable leaked password protection
hibp_enabled = true
```

**Security Benefits:**
- Prevents users from using passwords that have been exposed in data breaches
- Checks against the HaveIBeenPwned database (800M+ compromised passwords)
- Improves overall account security

## Verification

After applying the fixes:

1. Run the Supabase Database Linter again
2. Verify all function search path warnings are resolved
3. Confirm leaked password protection is enabled in Auth settings

## Additional Security Recommendations

1. **Regular Security Audits:** Run the Supabase linter periodically
2. **RLS Policies:** Ensure all tables have appropriate Row Level Security policies (already implemented)
3. **API Keys:** Rotate service role keys regularly and never expose them client-side
4. **HTTPS Only:** Ensure all connections use HTTPS
5. **Rate Limiting:** Consider implementing rate limiting for auth endpoints

## References

- [Supabase Database Linter - Function Search Path](https://supabase.com/docs/guides/database/database-linter?lint=0011_function_search_path_mutable)
- [Supabase Password Security](https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection)
- [PostgreSQL Security Best Practices](https://www.postgresql.org/docs/current/ddl-schemas.html#DDL-SCHEMAS-PATTERNS)
