# Supabase Authentication Setup

This project uses Supabase for authentication. Follow these steps to complete the setup:

## 1. Create a Supabase Project

1. Go to [https://supabase.com](https://supabase.com) and create an account if you haven't already
2. Click **"New Project"**
3. Fill in your project details:
   - Project Name: `college-predictor` (or your preferred name)
   - Database Password: (choose a strong password)
   - Region: Choose the closest region to your users
4. Click **"Create new project"**

## 2. Get Your API Credentials

1. Once your project is created, go to **Project Settings** (gear icon in the sidebar)
2. Navigate to **API** section
3. Copy the following values:
   - **Project URL** (this is your `VITE_SUPABASE_URL`)
   - **anon public** key (this is your `VITE_SUPABASE_ANON_KEY`)

## 3. Configure Environment Variables

1. Create a `.env` file in the root of the `public-website` directory:
   ```bash
   cp .env.example .env
   ```

2. Open the `.env` file and add your Supabase credentials:
   ```env
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key-here
   ```

3. **Important**: The `.env` file is already in `.gitignore` to keep your credentials secure

## 4. Enable Email Authentication

1. In your Supabase dashboard, go to **Authentication** → **Providers**
2. Make sure **Email** provider is enabled
3. Configure email templates (optional):
   - Go to **Authentication** → **Email Templates**
   - Customize the confirmation email, password reset, etc.

## 5. Configure Auth Settings

1. Go to **Authentication** → **URL Configuration**
2. Add your site URL:
   - For development: `http://localhost:5173`
   - For production: Your actual domain
3. Add redirect URLs (both development and production URLs)

## 6. Test the Authentication

1. Restart your development server to load the new environment variables:
   ```bash
   npm run dev
   ```

2. Navigate to `http://localhost:5173/signup`
3. Create a test account
4. Check your email for the confirmation link
5. Try logging in at `http://localhost:5173/login`

## Authentication Features

✅ **Email/Password Signup** - Users can create accounts with email and password
✅ **Email/Password Login** - Users can sign in with their credentials
✅ **Email Verification** - New users receive a confirmation email
✅ **Session Management** - User sessions are automatically managed
✅ **Sign Out** - Users can log out from the header dropdown
✅ **Protected Routes** - (Ready to implement when needed)
✅ **Password Reset** - (Ready to implement when needed)

## File Structure

```
src/
├── lib/
│   └── supabase.js          # Supabase client configuration
├── contexts/
│   └── AuthContext.jsx      # Auth provider with hooks
├── pages/
│   ├── LoginPage.jsx        # Login form
│   └── SignupPage.jsx       # Signup form
└── components/
    └── layout/
        └── Header.jsx       # Shows auth state and user dropdown
```

## Using Authentication in Components

```jsx
import { useAuth } from '../contexts/AuthContext';

function MyComponent() {
    const { user, signIn, signUp, signOut, loading } = useAuth();

    if (loading) return <div>Loading...</div>;

    return (
        <div>
            {user ? (
                <p>Welcome, {user.email}!</p>
            ) : (
                <p>Please sign in</p>
            )}
        </div>
    );
}
```

## Security Best Practices

- ✅ Never commit `.env` file to version control
- ✅ Use environment variables for all sensitive data
- ✅ Enable email verification for new users
- ✅ Implement row-level security (RLS) policies in Supabase for database access
- ✅ Use the `anon` key for client-side operations (already configured)

## Troubleshooting

**Issue**: Can't sign up or login
- Check that your Supabase URL and anon key are correct in `.env`
- Make sure you restarted the dev server after adding `.env`
- Verify email authentication is enabled in Supabase dashboard

**Issue**: Email not received
- Check spam folder
- Verify SMTP settings in Supabase (Authentication → Email Templates)
- For development, check the Supabase logs for email delivery status

**Issue**: "Site URL not allowed" error
- Add your current URL to the allowed list in Supabase dashboard (Authentication → URL Configuration)

## Next Steps

- [ ] Set up row-level security policies in Supabase for your database tables
- [ ] Add password reset functionality
- [ ] Implement protected routes using a wrapper component
- [ ] Add social authentication (Google, GitHub, etc.)
- [ ] Create user profile page
- [ ] Add user preferences/settings storage
