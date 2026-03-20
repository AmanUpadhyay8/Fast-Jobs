# Fast Jobs

A personal job tracker that automatically scrapes fresh job listings from top product companies and startups, filters them against a curated company whitelist, and displays them in a clean dark-mode dashboard.

Live at: [www.fastjobs.site](https://www.fastjobs.site)

---

## What it does

- Scrapes job listings automatically on a fixed schedule via GitHub Actions
- Filters jobs against a whitelist of 170+ premium product companies and startups
- Displays jobs split into "New (last 24h)" and "Older listings" sections
- Shows an analytics sidebar with total openings, new jobs count, top company, and a bar chart
- Supports filtering by job level, time posted, and company search
- Deduplicates jobs across runs using a compound MongoDB index
- Auto-expires jobs older than 7 days via MongoDB TTL index

---

## Tech Stack

### Frontend
- React + Vite
- Tailwind CSS
- Zustand (filter state)
- React Query / TanStack Query (data fetching + caching)
- Recharts (analytics bar chart)
- React Router (navigation)
- date-fns (relative timestamps)

### Backend
- Node.js + Express
- MongoDB Atlas (M0 free tier)
- Mongoose (ODM)
- express-rate-limit (rate limiting)

### Scraping
- Puppeteer + puppeteer-extra + puppeteer-extra-plugin-stealth (web scraper)
- Axios (JSearch API calls)
- JSearch API via RapidAPI (fallback scraper)

### Infrastructure
- GitHub Actions (scheduled cron jobs)
- Render (backend hosting — free tier)
- Vercel (frontend hosting — free tier)
- MongoDB Atlas (database)
- UptimeRobot (keeps Render warm — free tier)

---

## Project Structure

```
fast-jobs/
├── .github/
│   └── workflows/
│       ├── scraper.yml           # Web scraper — runs twice daily
│       └── jsearch-scraper.yml   # JSearch fallback — runs once daily
│
├── server/                       # Express API + scrapers (deployed on Render)
│   ├── src/
│   │   ├── models/
│   │   │   ├── Job.model.js
│   │   │   ├── Company.model.js
│   │   │   └── ScraperConfig.model.js
│   │   ├── routes/
│   │   │   ├── jobs.routes.js
│   │   │   ├── analytics.routes.js
│   │   │   └── config.routes.js
│   │   ├── controllers/
│   │   │   ├── jobs.controller.js
│   │   │   ├── analytics.controller.js
│   │   │   └── config.controller.js
│   │   ├── middleware/
│   │   │   ├── errorHandler.js
│   │   │   └── rateLimiter.js
│   │   └── app.js
│   ├── scraper/
│   │   ├── index.js              # Orchestrator — entry point for web scraper workflow
│   │   ├── jsearch.index.js      # Entry point for JSearch workflow
│   │   ├── scraper.worker.js     # Puppeteer web scraper
│   │   ├── scraper.service.js    # JSearch API service
│   │   ├── dedup.js              # Company filtering + deduplication + upsert
│   │   └── seed.js               # Seeds companies and scraper config to MongoDB
│   ├── .env.example
│   ├── package.json
│   └── server.js
│
└── client/                       # React + Vite (deployed on Vercel)
    ├── public/
    │   └── logo.svg
    ├── src/
    │   ├── components/
    │   │   ├── Navbar.jsx
    │   │   ├── FilterBar.jsx
    │   │   ├── JobCard.jsx
    │   │   ├── JobSection.jsx
    │   │   ├── AnalyticsCard.jsx
    │   │   └── Skeleton.jsx
    │   ├── hooks/
    │   │   ├── useJobs.js
    │   │   └── useAnalytics.js
    │   ├── store/
    │   │   └── filterStore.js
    │   ├── pages/
    │   │   ├── Dashboard.jsx
    │   │   └── About.jsx
    │   ├── App.jsx
    │   ├── main.jsx
    │   └── index.css
    ├── .env.example
    └── vite.config.js
```

---

## Architecture

### Data flow

```
GitHub Actions (cron)
  ├── Web scraper (twice daily — 08:00 and 20:00 UTC)
  │     └── Puppeteer → codegrammer.com → filter → dedup → MongoDB Atlas
  └── JSearch scraper (once daily — 12:00 UTC)
        └── JSearch API → filter → dedup → MongoDB Atlas

MongoDB Atlas
  └── Express API (Render)
        └── React frontend (Vercel) → www.fastjobs.site
```

### Scraping pipeline

1. GitHub Actions triggers the scraper script
2. Scraper loads active config from MongoDB (`maxPages`, `maxAgeDays`, `keywords`)
3. Puppeteer navigates job board pages with anti-bot measures
4. Raw jobs are passed to `dedup.js`
5. `dedup.js` loads the company whitelist from MongoDB
6. Each job is checked against the whitelist using fuzzy matching (partial name containment)
7. Matching jobs are upserted — duplicate check via compound index on `(company, title, postedAt)`
8. Duplicate inserts are silently skipped (MongoDB error code 11000)

### MongoDB indexes

```js
// Auto-delete jobs older than 7 days
{ postedAt: 1 } — TTL: 604800 seconds

// Deduplication — silent fail on duplicate insert
{ company: 1, title: 1, postedAt: 1 } — unique: true

// Fast filtering
{ level: 1, postedAt: -1 }
```

---

## API Endpoints

```
GET  /health                        Health check (pinged by UptimeRobot)
GET  /api/jobs                      Fetch jobs with optional filters
GET  /api/analytics                 Aggregated stats for analytics card
GET  /api/config/scraper            Get active scraper config
PUT  /api/config/scraper            Update keywords / scraper settings
GET  /api/config/companies          Get all whitelisted companies
POST /api/config/companies          Add a new company to whitelist
DEL  /api/config/companies/:name    Soft-delete a company from whitelist
```

### Jobs query params

| Param | Type | Description |
|---|---|---|
| `level` | string | Filter by level: `intern`, `sde`, `senior`, `staff`, `principal` |
| `maxAge` | number | Max age in hours (e.g. `24` = last 24 hours) |
| `company` | string | Search by company name (regex) |
| `page` | number | Pagination page (default: 1) |
| `limit` | number | Results per page (default: 50) |

---

## MongoDB Schemas

### Job
```js
{
  title:     String (required),
  company:   String (required),
  role:      String,
  level:     enum ['intern', 'sde', 'senior', 'staff', 'principal'],
  applyUrl:  String (required),
  source:    String,
  postedAt:  Date (required),
  fetchedAt: Date,
  isRecent:  Boolean,       // posted within last 24h
  tags:      [String],
  city:      String,
  isRemote:  Boolean,
}
```

### Company
```js
{
  name:     String (required, unique),
  tier:     enum ['premium', 'good', 'startup'],
  isActive: Boolean,
}
```

### ScraperConfig
```js
{
  keywords:  [String],
  isActive:  Boolean,
  webScraper: {
    maxPages:   Number,   // how many pages to scrape per run
    maxAgeDays: Number,   // cutoff age for jobs
  }
}
```

---

## Scraper Details

### Web scraper anti-bot measures
- `puppeteer-extra-plugin-stealth` patches common bot detection fingerprints
- Random user agent rotated from a pool on every run
- Realistic 1366×768 viewport
- Random human-like delays between actions and page navigations
- Page scroll simulated before extracting data
- Resource interception blocks images, fonts, stylesheets (faster + smaller fingerprint)
- `--disable-http2` flag to avoid HTTP/2 fingerprinting
- 3-attempt retry loop with exponential backoff on failure

### Pagination strategy
Scrapes a configurable number of pages (`maxPages` from MongoDB config) and skips jobs older than `maxAgeDays`. Since the job board sorts newest first, this efficiently captures only fresh listings without hammering all 277 pages.

### Company fuzzy matching
Instead of exact string matching, `dedup.js` uses partial containment:
```js
scraped.includes(whitelisted) || whitelisted.includes(scraped)
```
This handles variants like `"Electronic Arts (EA)"` matching `"Electronic Arts"`. The matched company name is always normalized to the clean whitelisted version before inserting.

### JSearch fallback
Runs once daily with 3 combined keyword queries using OR operators:
```
'software engineer OR backend engineer OR software developer'
'fullstack developer OR frontend developer'
'SDE 1 OR SDE 2'
```
3 requests/day × 30 days = 90 requests/month — well within the 200/month free tier limit.

---

## GitHub Actions Schedules

| Workflow | Schedule | UTC Time | IST Time |
|---|---|---|---|
| Web scraper | Twice daily | 08:00, 20:00 | 1:30 PM, 1:30 AM |
| JSearch scraper | Once daily | 12:00 | 5:30 PM |

Both workflows connect directly to MongoDB Atlas. Scraper config (`maxPages`, `maxAgeDays`) is read from the database on each run — change it in Atlas and it takes effect next run without touching code.

---

## Environment Variables

### Server (`server/.env`)
```
MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/jobtracker?retryWrites=true&w=majority
JSEARCH_API_KEY=your_rapidapi_key
CLIENT_URL=https://www.fastjobs.site
PORT=5000
NODE_ENV=development
```

### Client (`client/.env`)
```
VITE_API_URL=http://localhost:5000
```

### GitHub Actions Secrets
```
MONGO_URI
JSEARCH_API_KEY
```

---

## Local Development Setup

### Prerequisites
- Node.js v20+
- MongoDB Atlas account (free M0 tier)
- RapidAPI account with JSearch subscription (free tier)

### 1. Clone the repo
```bash
git clone https://github.com/yourusername/fast-jobs.git
cd fast-jobs
```

### 2. Install server dependencies
```bash
cd server
npm install
cp .env.example .env
# fill in MONGO_URI and JSEARCH_API_KEY in .env
```

### 3. Seed the database
```bash
node scraper/seed.js
```
This inserts 170+ companies and the initial scraper config into MongoDB.

### 4. Run the scraper manually
```bash
node scraper/index.js
```

### 5. Start the backend
```bash
npm run dev
# runs on http://localhost:5000
```

### 6. Install client dependencies
```bash
cd ../client
npm install
cp .env.example .env
# VITE_API_URL=http://localhost:5000
```

### 7. Start the frontend
```bash
npm run dev
# runs on http://localhost:5173
```

---

## Deployment

### Backend — Render
| Setting | Value |
|---|---|
| Root Directory | `server` |
| Build Command | `npm install` |
| Start Command | `node server.js` |
| Instance Type | Free |

Environment variables to add on Render: `MONGO_URI`, `JSEARCH_API_KEY`, `CLIENT_URL`, `NODE_ENV=production`, `PORT=10000`

### Frontend — Vercel
| Setting | Value |
|---|---|
| Root Directory | `client` |
| Framework Preset | Vite |
| Build Command | `npm run build` |
| Output Directory | `dist` |

Environment variable to add on Vercel: `VITE_API_URL=https://your-render-url.onrender.com`

### Keep Render warm — UptimeRobot
Add a free HTTP monitor on [uptimerobot.com](https://uptimerobot.com):
```
URL:      https://your-api.onrender.com/health
Interval: 14 minutes
```

---

## Managing the Company Whitelist

### Add companies via seed (best for bulk)
Add to the companies array in `scraper/seed.js` and rerun:
```bash
node scraper/seed.js
```
Uses `bulkWrite` with upsert — safe to run multiple times.

### Add a single company via API
```bash
curl -X POST http://localhost:5000/api/config/companies \
  -H "Content-Type: application/json" \
  -d '{ "name": "Uber", "tier": "premium" }'
```

### Remove a company
```bash
curl -X DELETE http://localhost:5000/api/config/companies/Uber
```

### Company tiers
| Tier | Description |
|---|---|
| `premium` | FAANG, top-tier product companies, unicorns |
| `good` | Strong product companies, well-funded startups |
| `startup` | High-growth Indian startups |

---

## Adjusting Scraper Config

To change `maxPages` or `maxAgeDays` without touching code, update directly in MongoDB Atlas:

```js
// In Atlas shell or Compass
db.scraperconfigs.updateOne(
  { isActive: true },
  { $set: { 'webScraper.maxAgeDays': 1, 'webScraper.maxPages': 2 } }
)
```

The scraper picks up new values on its next run automatically.

---

## Making Changes After Deployment

Both Render and Vercel are set to auto-deploy on every push to `main`:

```bash
# make changes locally and test
git add .
git commit -m "your change"
git push origin main
# Vercel deploys in ~60s, Render in ~2-3 minutes
```

Recommended workflow — use a `dev` branch for work in progress:
```bash
git checkout -b dev
# work and test here
git checkout main
git merge dev
git push origin main
```

---

## Key Design Decisions

**Why GitHub Actions for cron instead of node-cron on the server?**
Render's free tier spins down after 15 minutes of inactivity. node-cron inside the Express process would die silently. GitHub Actions runs on its own infrastructure on a true cron schedule — completely independent of whether the server is awake.

**Why fuzzy company matching instead of exact match?**
Job boards often append suffixes to company names — `"Electronic Arts (EA)"`, `"Google India"`, `"JP Morgan"` vs `"JP Morgan Chase"`. Exact matching would drop legitimate hits. Partial containment matching catches all variants and normalizes to the clean whitelisted name before inserting.

**Why a TTL index instead of manual cleanup?**
MongoDB TTL indexes run as a background process and auto-expire documents based on a date field. Set-and-forget — no cleanup scripts, no cron jobs, no stale data buildup.

**Why React Query instead of useEffect + fetch?**
React Query handles stale-while-revalidate caching, background refetching, deduped requests, and loading/error states out of the box. Filter changes automatically trigger refetches with the new params via the `queryKey` array.

**Why separate entry points for each scraper (`index.js` vs `jsearch.index.js`)?**
Keeps the two pipelines fully independent. If the web scraper fails or gets blocked, the JSearch workflow continues unaffected and vice versa. Each workflow has its own timeout, secrets, and schedule.
