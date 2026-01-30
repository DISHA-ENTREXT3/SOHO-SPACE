# SECURITY GUIDELINES

## Environment Variables & Secrets Management

### ⚠️ CRITICAL: Never commit secrets to Git

All sensitive information must be stored in environment variables and never hardcoded in the source code.

### Required Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Supabase Database Configuration
VITE_SUPABASE_URL=https://your-database-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_database_anon_key_here

# Support Client Configuration
VITE_SUPPORT_ENDPOINT=https://your-support-project.supabase.co
VITE_SUPPORT_ANON_KEY=your_support_anon_key_here

# Backend Secret for Support Form Proxy
# This is a PRIVATE secret - never expose in frontend code
FORM_SECRET=your_backend_form_secret_here

# Optional: AI Features
GEMINI_API_KEY=your_gemini_api_key_here
VITE_HUGGINGFACE_API_KEY=your_huggingface_key_here
```

### Secret Types

1. **Public Secrets (Frontend - VITE\_ prefix)**
   - `VITE_SUPABASE_URL` - Public Supabase project URL
   - `VITE_SUPABASE_ANON_KEY` - Public anon key (safe to expose)
   - `VITE_SUPPORT_ENDPOINT` - Public support endpoint
   - `VITE_SUPPORT_ANON_KEY` - Public support anon key

2. **Private Secrets (Backend only - NO VITE\_ prefix)**
   - `FORM_SECRET` - Private form validation secret
   - `GEMINI_API_KEY` - Private AI API key
   - Never expose these in frontend code!

### Current Secret: Support Form Secret

The support client form secret should be obtained from your admin dashboard or security lead.

**This must be set as `FORM_SECRET` environment variable and NEVER committed to Git.**

### Deployment Configuration

#### Vercel

1. Go to Project Settings → Environment Variables
2. Add all required variables
3. Ensure `FORM_SECRET` is added as a secret

#### GitHub Actions

Secrets are configured in repository settings and automatically available in CI/CD.

### Verifying Security

Run this command to check for exposed secrets:

```bash
git grep -i "secret\|token\|password" -- ':!SECURITY.md' ':!.env.example'
```

### .gitignore Protection

The following files are automatically ignored:

- `.env`
- `.env.local`
- `.env.*.local`

Never remove these from `.gitignore`!

### Best Practices

1. ✅ Use environment variables for all secrets
2. ✅ Use `VITE_` prefix for frontend-safe variables
3. ✅ Keep private secrets (like `FORM_SECRET`) backend-only
4. ✅ Rotate secrets regularly
5. ✅ Use different secrets for dev/staging/production
6. ❌ Never hardcode secrets in source code
7. ❌ Never commit `.env` files
8. ❌ Never log secrets to console
9. ❌ Never expose backend secrets in frontend code

### Emergency: Secret Leaked

If a secret is accidentally committed:

1. **Immediately rotate the secret** in your service provider
2. Update `.env` and deployment environment variables
3. Remove from Git history:
   ```bash
   git filter-branch --force --index-filter \
     "git rm --cached --ignore-unmatch .env" \
     --prune-empty --tag-name-filter cat -- --all
   ```
4. Force push (⚠️ coordinate with team first)
5. Notify all team members to pull latest changes

### Support

For security concerns, contact: business@entrext.in
