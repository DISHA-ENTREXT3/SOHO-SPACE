# Support Client Integration Guide

## Overview

The `@entrext/support-client` package has been successfully integrated into Soho Space to handle feedback, bug reports, complaints, and feature requests.

## Installation

```bash
npm install @entrext/support-client --legacy-peer-deps
```

## Configuration

### 1. Support Client Setup

**Location:** `services/supportClient.ts`

```typescript
import { createSupportClient } from "@entrext/support-client";

// @ts-ignore - Vite env variables
const anonKey = import.meta.env?.VITE_SUPABASE_ANON_KEY || "";

export const supportClient = createSupportClient({
  endpoint:
    "https://ldewwmfkymjmokopulys.supabase.co/functions/v1/submit-support",
  anonKey,
});
```

### 2. Environment Variables

To allow Person A (Database) and Person B (Support) to maintain separate projects, use the following variables:

```bash
# Main Database (Person A)
VITE_SUPABASE_URL=https://your-database-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_database_anon_key_here

# Support System (Person B)
VITE_SUPPORT_ENDPOINT=https://your-support-project.supabase.co
VITE_SUPPORT_ANON_KEY=your_support_anon_key_here
```

**Note:** These must be added to Vercel and your local `.env` file for the integration to work.

## Implementation

### Integrated Page: FeedbackPage (`pages/FeedbackPage.tsx`)

The support client is integrated into the Feedback page with the following features:

1. **Form Fields:**
   - Name (required)
   - Email (required) ⭐
   - Phone (optional)
   - Category (dropdown: Feedback, Complaint, Idea, Bug)
   - Details (required)

2. **Submission Handling:**

   ```typescript
   await supportClient.submitTicket({
     product: "Soho Space",
     category: formData.category.toLowerCase() as
       | "feedback"
       | "bug"
       | "feature"
       | "support",
     user_email: formData.email,
     message: formData.details,
     metadata: {
       name: formData.name,
       phone: formData.phone,
       page: window.location.pathname,
     },
   });
   ```

3. **UX Features:**
   - ✅ Loading state during submission
   - ✅ Error handling with user-friendly messages
   - ✅ Success notification (auto-dismisses after 5 seconds)
   - ✅ Form validation
   - ✅ Automatic form reset after successful submission
   - ✅ Local display of submitted feedback

## Category Mapping

The form supports the following categories:

| Form Category | API Category |
| ------------- | ------------ |
| Feedback      | feedback     |
| Complaint     | support      |
| Idea          | feature      |
| Bug           | bug          |

## Features

### Error Handling

- Email validation
- Message content validation
- Network error handling
- User-friendly error messages

### Success Flow

1. Form validates all required fields
2. Ticket is submitted to Supabase Edge Function
3. Success message is displayed
4. Submission is added to local UI for immediate feedback
5. Form is reset for new submissions

### Loading States

- Submit button shows loading spinner
- Button is disabled during submission
- "Sending..." text replaces "Send Feedback"

## Testing

To test the integration:

1. **Setup Environment:**

   ```bash
   # Add the anon key to .env file
   echo "VITE_SUPABASE_ANON_KEY=your_key_here" >> .env
   ```

2. **Run Development Server:**

   ```bash
   npm run dev
   ```

3. **Navigate to Feedback Page:**
   - Go to `http://localhost:3000/#/feedback`
   - Fill out the form
   - Submit and verify the ticket is created

4. **Verify Submission:**
   - Check the Supabase dashboard for the new support ticket
   - Verify all metadata is correctly captured

## Files Modified

1. ✅ `services/supportClient.ts` - Created
2. ✅ `pages/FeedbackPage.tsx` - Integrated support client
3. ✅ `.env.example` - Updated with VITE_SUPABASE_ANON_KEY note
4. ✅ `package.json` - Added @entrext/support-client dependency

## Production Deployment

Before deploying to production:

1. **Environment Variable:**
   - Ensure `VITE_SUPABASE_ANON_KEY` is set in your deployment environment (Vercel, etc.)
2. **Build Verification:**
   ```bash
   npm run build
   ```
3. **Test in Production:**
   - Submit a test ticket
   - Verify it appears in the Supabase dashboard

## API Reference

### `supportClient.submitTicket()`

**Parameters:**

```typescript
{
  product: string;        // "Soho Space"
  category: "feedback" | "bug" | "feature" | "support";
  user_email: string;     // Required
  message: string;        // Required
  metadata?: {            // Optional additional data
    name?: string;
    phone?: string;
    page?: string;
    [key: string]: any;
  }
}
```

**Returns:** `Promise<void>`

**Throws:** Error if submission fails

## Support Workflow

1. User fills feedback form →
2. Client submits to Supabase Edge Function →
3. Ticket stored in Supabase database →
4. Support team receives notification →
5. Team responds via email

---

**Status:** ✅ Integration Complete
**Last Updated:** January 16, 2026
