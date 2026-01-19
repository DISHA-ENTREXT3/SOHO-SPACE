# 🚀 Soho Space - Deployment Guide

## 📋 Project Status

### ✅ Completed Setup

- **Git Repository**: Connected to `https://github.com/DINTREXT3/SOHO-SPACE.git`
- **Supabase**: Configured and connected
- **Build**: Successfully compiling
- **Dependencies**: All installed

---

## 🔗 Current Connections

### 1. **Git Connection**

- **Repository**: https://github.com/DINTREXT3/SOHO-SPACE.git
- **Branch**: main
- **Status**: ✅ Up to date and pushed

### 2. **Supabase Connection**

- **URL**: `https://jayhkbnjeroberonvthj.supabase.co`
- **Package**: `@supabase/supabase-js` v2.90.1
- **Status**: ✅ Configured in `services/supabaseClient.ts`

### 3. **Supabase Tables Required**

Ensure these tables exist in your Supabase project:

- `companies`
- `partners`
- `applications`
- `notifications`
- `frameworks`
- `collaborations`

---

## 🚀 Deploy to Vercel

### **Option 1: Quick Deploy (Recommended)**

1. **Go to Vercel**: https://vercel.com
2. **Sign in** with your GitHub account
3. **Import Project**:
   - Click "Add New..." → "Project"
   - Select your GitHub repository: `DINTREXT3/SOHO-SPACE`
4. **Configure Project**:
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`
5. **Environment Variables** (Optional - only if using AI features):
   - Add `GEMINI_API_KEY` with your Google Gemini API key
6. **Deploy**: Click "Deploy"

### **Option 2: Using Vercel CLI**

```bash
# Install Vercel CLI globally
npm install -g vercel

# Navigate to project directory
cd "d:\final deployment\entrext"

# Login to Vercel
vercel login

# Deploy to production
vercel --prod
```

---

## 🔧 Supabase Setup

### Required Tables Schema

If you haven't set up Supabase tables, run these SQL commands in your Supabase SQL Editor:

```sql
-- Companies Table
CREATE TABLE companies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    "logoUrl" TEXT,
    description TEXT,
    location TEXT,
    seeking TEXT[],
    "partnerExpectations" TEXT,
    "collaborationLength" TEXT,
    "compensationPhilosophy" TEXT,
    upvotes INTEGER DEFAULT 0,
    "upvotedBy" TEXT[],
    "ndaUrl" TEXT,
    "requiredDocumentIds" TEXT[],
    "completedCollaborations" INTEGER DEFAULT 0,
    "partnerRetentionRate" NUMERIC DEFAULT 0,
    "workModes" TEXT[],
    "subscriptionPlan" TEXT DEFAULT 'FREE',
    documents JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Partners Table
CREATE TABLE partners (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    "avatarUrl" TEXT,
    bio TEXT,
    skills TEXT[],
    location TEXT,
    "reputationScore" INTEGER DEFAULT 50,
    "reputationBand" TEXT DEFAULT 'MEDIUM',
    "pastCollaborations" TEXT[],
    "managedBrands" TEXT[],
    "savedOpportunities" TEXT[],
    upvotes INTEGER DEFAULT 0,
    "upvotedBy" TEXT[],
    "subscriptionPlan" TEXT DEFAULT 'FREE',
    contact JSONB,
    "timeZone" TEXT,
    "workModePreference" TEXT DEFAULT 'REMOTE',
    "resumeUrl" TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Applications Table
CREATE TABLE applications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "companyId" UUID REFERENCES companies(id) ON DELETE CASCADE,
    "partnerId" UUID REFERENCES partners(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'PENDING',
    "appliedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "ndaAcceptedAt" TIMESTAMP WITH TIME ZONE
);

-- Notifications Table
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "userId" TEXT NOT NULL,
    message TEXT NOT NULL,
    link TEXT,
    read BOOLEAN DEFAULT FALSE,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Frameworks Table
CREATE TABLE frameworks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    phases JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Collaborations Table
CREATE TABLE collaborations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "companyId" UUID REFERENCES companies(id) ON DELETE CASCADE,
    "partnerId" UUID REFERENCES partners(id) ON DELETE CASCADE,
    framework JSONB,
    notes JSONB DEFAULT '{}'::jsonb,
    metrics JSONB DEFAULT '{}'::jsonb,
    files JSONB DEFAULT '[]'::jsonb,
    "decisionLog" JSONB DEFAULT '[]'::jsonb,
    "startDate" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE frameworks ENABLE ROW LEVEL SECURITY;
ALTER TABLE collaborations ENABLE ROW LEVEL SECURITY;

-- Create policies (Allow all for now - customize based on your needs)
CREATE POLICY "Enable read access for all users" ON companies FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON companies FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON companies FOR UPDATE USING (true);
CREATE POLICY "Enable delete access for all users" ON companies FOR DELETE USING (true);

CREATE POLICY "Enable read access for all users" ON partners FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON partners FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON partners FOR UPDATE USING (true);
CREATE POLICY "Enable delete access for all users" ON partners FOR DELETE USING (true);

CREATE POLICY "Enable read access for all users" ON applications FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON applications FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON applications FOR UPDATE USING (true);

CREATE POLICY "Enable read access for all users" ON notifications FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON notifications FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON notifications FOR UPDATE USING (true);

CREATE POLICY "Enable read access for all users" ON frameworks FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON frameworks FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable read access for all users" ON collaborations FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON collaborations FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON collaborations FOR UPDATE USING (true);
```

---

## 🧪 Local Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

---

## 📝 Environment Variables

Create a `.env` file in the root directory (copy from `.env.example`):

```env
GEMINI_API_KEY=your_gemini_api_key_here
```

**Note**: The Gemini API key is optional and only needed for AI-powered features.

---

## 🔍 Verification Checklist

Before deploying, verify:

- [✅] Git repository is up to date
- [✅] Build completes successfully (`npm run build`)
- [✅] Supabase connection is configured
- [ ] Supabase tables are created
- [ ] Environment variables are set in Vercel (if needed)
- [ ] Project deploys successfully on Vercel

---

## 🎯 Post-Deployment

After deploying to Vercel:

1. **Get your live URL** from Vercel dashboard
2. **Test login/signup** functionality
3. **Verify Supabase** data operations
4. **Check that** all pages load correctly

---

## 🆘 Troubleshooting

### Build Fails

- Check that all dependencies are installed: `npm install`
- Verify TypeScript has no errors: `npx tsc --noEmit`

### Supabase Connection Issues

- Verify your Supabase URL and anon key in `services/supabaseClient.ts`
- Check that tables are created in Supabase
- Verify RLS policies allow operations

### Vercel Deployment Issues

- Check build logs in Vercel dashboard
- Ensure environment variables are set correctly
- Verify `vercel.json` configuration is correct

---

## 📞 Support

For issues or questions:

- Check the [README.md](./README.md)
- Review Vercel deployment logs
- Check Supabase logs for database issues

---

**Last Updated**: January 12, 2026
**Status**: ✅ Ready for Deployment
