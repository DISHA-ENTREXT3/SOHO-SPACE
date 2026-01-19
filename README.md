# Soho Space

A modern platform connecting founders with growth partners for startup collaborations.

## Features

- 🚀 **For Founders**: Post opportunities and find skilled growth partners
- 🤝 **For Partners**: Discover exciting startups and apply to collaborate
- 📊 **Collaboration Workspace**: Track progress with frameworks and metrics
- 🔔 **Notifications**: Stay updated on applications and decisions

## Tech Stack

- **Frontend**: React 19 + TypeScript
- **Styling**: Custom CSS with modern design system
- **Routing**: React Router v7
- **Storage**: Browser LocalStorage (demo mode)
- **Build**: Vite

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
npm install
npm run dev
```

### Production Build

```bash
npm run build
npm run preview
```

## Deployment

This app is configured for **Vercel** deployment:

1. Push to GitHub
2. Import repository on [Vercel](https://vercel.com)
3. Deploy with default settings

### Storage Note

This demo uses browser LocalStorage for data persistence. Each user's data stays in their own browser. For a production app with cross-device sync, integrate a cloud database like Supabase or Firebase.

## Project Structure

```
├── components/     # Reusable UI components
├── context/        # React Context providers
├── pages/          # Page components
├── services/       # Database and storage services
├── types.ts        # TypeScript type definitions
└── index.css       # Global styles
```

## License

MIT
