<h1 align="center"><b>EliasDex Next</b></h1>

<p align="center">
  <img src="https://files.catbox.moe/fg4h2w.png" width="200">
</p>

EliasDex Next is a modern anime and manga streaming web app built with Next.js. It combines browsing, search, content detail pages, user authentication, progress tracking, donations, and leaderboard features in a polished UI.

## What is this project?

This repository is a Next.js application for a fan-oriented anime and manga platform. It includes:

- A landing/home page with featured anime and manga sections
- Anime discovery, search, and detail pages
- Comic listing and detail pages, including chapter views
- Authentication (`login`, `register`) and a protected user dashboard
- Watch progress tracking and user profile features
- Donation support with a payment flow
- Leaderboard and community stat pages

## Core functionality

The app delivers several main functions:

- **Browse anime and manga** through category, trending, and search interfaces
- **View detailed media pages** with episode or chapter access
- **Track user progress** via authenticated sessions and watch history
- **Create accounts** and manage profiles
- **Support the platform** by donating through a payment gateway
- **Display leaderboards** and engagement metrics for users


<h2 align="center">📱 App Preview</h2>

<p align="center">
  <img src="https://files.catbox.moe/0v0xza.png" width="220"/>
  <img src="https://files.catbox.moe/frkka6.png" width="220"/>
  <img src="https://files.catbox.moe/hhfmaw.png" width="220"/>
</p>

<p align="center">
  <img src="https://files.catbox.moe/8mvw1d.png" width="220"/>
  <img src="https://files.catbox.moe/pomhyx.png" width="220"/>
  <img src="https://files.catbox.moe/2l2mb8.png" width="220"/>
</p>

<p align="center">
  <img src="https://files.catbox.moe/zzbl3k.png" width="220"/>
  <img src="https://files.catbox.moe/7lnlnt.png" width="220"/>
  <img src="https://files.catbox.moe/vrhegi.png" width="220"/>
</p>


## How it works

### Frontend

- Uses the Next.js App Router in `src/app`
- Pages are organized as routes under `src/app`
- Client-side features are built in React with custom components in `src/components`
- Global state and user auth are handled by context providers in `src/context`
- Data fetching uses React Query (`@tanstack/react-query`) and direct fetch/axios calls

### Data sources

- Anime and manga data is fetched from external APIs such as `https://api.jikan.moe/v4`
- Comic content is fetched from a remote JSON endpoint under `https://www.sankavollerei.com`
- User data, auth, watch progress, donations, and leaderboard data are handled by internal API routes under `src/app/api`

### Authentication and user features

- Register and login flows call API routes under `src/app/api/auth`
- Auth context maintains current user state and watch progress
- Protected pages require users to sign in before accessing donation and profile features

### Donations and payments

- Donation flows are available in `src/app/donate/page.jsx`
- The app supports donation tier selection and custom amounts
- Payment creation and verification use API routes under `src/app/api/donations`
- The payment integration references Midtrans snapshot handling

## Project structure

- `package.json` — project dependencies and scripts
- `src/app` — main application routes and pages
- `src/components` — reusable UI components
- `src/context` — auth and theme providers
- `src/services` — API helper utilities
- `src/lib` — database utilities and shared backend helpers
- `src/app/api` — Next.js API routes for auth, donations, leaderboard, and user data
- `src/utils` — miscellaneous helpers like toast notifications and performance monitoring

## Technologies used

- Next.js 16 (App Router)
- React 19
- Tailwind CSS v4
- React Query (`@tanstack/react-query`)
- Axios
- Zustand for client-side state stores
- MongoDB driver
- JWT auth support
- Midtrans payment client
- React icons, Swiper, Video.js, and other media libraries

## Usage

### Install dependencies

```bash
pnpm install
```

### Environment setup

Create a `.env.local` file in the project root and define at least:

```env
MONGODB_URI=mongodb://localhost:27017/eliasdex
NEXT_PUBLIC_URL=http://localhost:3000
```

If you use a hosted MongoDB instance, replace the URI accordingly.

### Run development server

```bash
pnpm dev
```

Open `http://localhost:3000` in the browser.

### Build for production

```bash
pnpm build
pnpm start
```

### Linting

```bash
pnpm lint
```

## Main routes

- `/` — Landing/home page
- `/search` — Search page
- `/anime/[id]` — Anime detail page
- `/comic` — Comic listing and search
- `/comic/[slug]` — Comic detail page
- `/comic/read/[slug]` — Read comic page
- `/login` — Login page
- `/register` — Register page
- `/user` — User dashboard
- `/profile/[username]` — Public profile pages
- `/donate` — Donation page
- `/leaderboard` — Leaderboard lists

## Notes

- The app uses Next.js server and client components together. Some routes are client-only (`"use client"`) for stateful behavior.
- `src/lib/mongodb.js` sets up the MongoDB connection and requires a valid `MONGODB_URI`.
- The app appears focused on a fan streaming experience with anime/manga content, social engagement, and supporter donations.

## Contribution

If you want to extend this project, start by exploring:

- `src/app` for route/page structure
- `src/components` for shared UI
- `src/context/AuthContext.jsx` for auth state and API integration
- `src/services/useApi.js` for external API fetching logic
- `src/app/api` for backend route behavior

---

Made for a fast, polished anime and manga streaming experience powered by Next.js, React, and Tailwind CSS.
