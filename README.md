# World Card Games

A mobile-first web app for learning and playing classic card games. Built with Next.js, TypeScript, and Tailwind CSS.

## Live Demo

🎮 **Play now:** (deploy manually to Vercel — see below)

## Games Available

- **Hearts** ♥️ - Complete with interactive tutorial and playable demo
- Spades ♠️ - Coming soon
- Bridge ♣️ - Coming soon
- Euchre ♦️ - Coming soon

## Features

### Hearts Tutorial
- 📱 Swipeable mobile-first tutorial
- 🎬 5 animated slides (3-6s each):
  1. Overview - Game objective and scoring basics
  2. Dealing - Cards dealt to 4 players
  3. Passing - Pass 3 cards left animation
  4. Trick Play - Cards fly to center, winner revealed
  5. Scoring - Hearts = 1pt, QS = 13pts, Shooting the Moon
- ↔️ Gesture-based carousel with touch/drag support
- ↕️ Arrow navigation and dots indicator
- ♿ Full `prefers-reduced-motion` support

### Interactive Demo
- 🃏 Full 13-trick game simulation
- 📊 Real-time scoring
- 🎮 Click-to-play your cards
- 🎯 Follow-suit validation
- 🤖 Scripted opponent AI (deterministic, no randomness)

## Tech Stack

- Next.js 15 (App Router)
- React 19
- TypeScript 5.7 (strict)
- Tailwind CSS 4
- Inline SVG cards (no external assets)

## Local Development

```bash
# Navigate to project
cd /home/blackswan/card-games/web

# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build
```

Open http://localhost:3000

## Deploy to Vercel

### Option 1: Vercel CLI (requires login)

```bash
# Install Vercel CLI globally
npm i -g vercel

# Login (one-time setup)
vercel login

# Deploy
vercel --prod
```

### Option 2: Drag & Drop (easiest)

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click "Add New..." → "Project"
3. Select "Import from Git Repository" OR drag the `/home/blackswan/card-games/web/dist` folder to Vercel
4. Deploy!

### Option 3: Git Push

```bash
# Initialize git repo
cd /home/blackswan/card-games/web
git init
git add .
git commit -m "Initial commit"

# Connect to Vercel
vercel
```

## Project Structure

```
app/
├── page.tsx              # Home page with game grid
├── layout.tsx            # Root layout
├── globals.css           # Global styles + animations
├── hearts/
│   ├── page.tsx          # Tutorial carousel (5 slides)
│   └── demo/
│       └── page.tsx      # Playable 13-trick demo
components/
└── Card.tsx              # SVG card component + CardBack
```

## Accessibility

- Full keyboard navigation
- prefers-reduced-motion support
- Touch-friendly (48px min tap targets)
- Screen reader compatible card announcements

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile Safari & Chrome on iOS/Android

## License

All card assets are original SVG designs (public domain).
