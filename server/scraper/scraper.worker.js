// scraper/scraper.worker.js
import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';

puppeteer.use(StealthPlugin());

const BASE_URL = 'https://codegrammer.com/the-job-exchange/';

const USER_AGENTS = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
];

function randomDelay(min = 1000, max = 3000) {
    return new Promise(r => setTimeout(r, min + Math.random() * (max - min)));
}

function randomUserAgent() {
    return USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
}

function inferLevel(title) {
    const t = title?.toLowerCase() || '';
    if (t.includes('intern')) return 'intern';
    if (t.includes('principal') || t.includes('staff')) return 'principal';
    if (t.includes('senior') || t.includes('sr.')) return 'senior';
    if (t.includes('sde 1') || t.includes('junior')) return 'sde';
    return 'sde';
}

function parsePostedDate(dateStr) {
    if (!dateStr) return new Date();
    const s = dateStr.toLowerCase().trim();

    if (s.includes('today') || s.includes('just now')) return new Date();

    if (s.includes('yesterday')) {
        const d = new Date();
        d.setDate(d.getDate() - 1);
        return d;
    }

    const hoursMatch = s.match(/(\d+)\s*h/);
    if (hoursMatch) {
        const d = new Date();
        d.setHours(d.getHours() - parseInt(hoursMatch[1]));
        return d;
    }

    const daysMatch = s.match(/(\d+)\s*d/);
    if (daysMatch) {
        const d = new Date();
        d.setDate(d.getDate() - parseInt(daysMatch[1]));
        return d;
    }

    // Full date string like "18 Mar 2026" — set to end of that day
    // so time component of cutoff doesn't incorrectly exclude it
    const parsed = new Date(dateStr);
    if (!isNaN(parsed)) {
        parsed.setHours(23, 59, 59, 999);
        return parsed;
    }

    return new Date();
}

function getPageUrl(pageNumber) {
    return pageNumber === 1
        ? BASE_URL
        : `${BASE_URL}page/${pageNumber}/`;
}

async function launchBrowser() {
    return puppeteer.launch({
        headless: process.env.NODE_ENV === 'production' ? 'new' : false,
        executablePath: process.env.CI ? '/usr/bin/chromium-browser' : undefined,
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-http2',
            '--disable-dev-shm-usage',
            '--disable-gpu',
            '--disable-accelerated-2d-canvas',
            '--window-size=1366,768',
        ],
    });
}

async function scrapeOnePage(page, pageNumber) {
    const url = getPageUrl(pageNumber);
    console.log(`  Scraping page ${pageNumber}: ${url}`);

    await page.goto(url, {
        waitUntil: 'networkidle2',
        timeout: 60000,
    });

    await randomDelay(1000, 2000);
    await page.waitForSelector('article.tje-card', { timeout: 30000 });
    await page.evaluate(() => window.scrollBy(0, 300));
    await randomDelay(500, 1000);

    return page.evaluate(() => {
        const cards = document.querySelectorAll('article.tje-card');
        return Array.from(cards).map(card => ({
            title: card.querySelector('.tje-position')?.innerText.trim() || null,
            company: card.querySelector('.tje-company-name')?.innerText.trim() || null,
            location: card.querySelector('.tje-detail span')?.innerText.trim() || null,
            date: card.querySelector('.tje-date-chip')?.innerText.trim() || null,
            applyUrl: card.querySelector('a.tje-apply-btn')?.href || null,
        }));
    });
}

export async function scrapeWebJobs({ maxPages = 2, maxAgeDays = 1 } = {}) {
    let browser = null;
    const MAX_RETRIES = 3;

    const cutoffDate = new Date(Date.now() - maxAgeDays * 24 * 60 * 60 * 1000);
    console.log(`  Config: maxPages=${maxPages}, maxAgeDays=${maxAgeDays}`);
    console.log(`  Cutoff date: ${cutoffDate.toISOString()}`);

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
        try {
            console.log(`  Web scraper attempt ${attempt}/${MAX_RETRIES}`);

            browser = await launchBrowser();
            const page = await browser.newPage();
            await page.setUserAgent(randomUserAgent());
            await page.setViewport({ width: 1366, height: 768 });

            await page.setRequestInterception(true);
            page.on('request', req => {
                const blocked = ['image', 'stylesheet', 'font', 'media'];
                blocked.includes(req.resourceType()) ? req.abort() : req.continue();
            });

            const allJobs = [];

            for (let currentPage = 1; currentPage <= maxPages; currentPage++) {
                const rawCards = await scrapeOnePage(page, currentPage);

                if (!rawCards || rawCards.length === 0) {
                    console.log(`  No cards on page ${currentPage}, stopping`);
                    break;
                }

                const now = new Date();

                for (const job of rawCards) {
                    if (!job.title || !job.applyUrl) continue;

                    const postedAt = parsePostedDate(job.date);

                    if (postedAt < cutoffDate) {
                        console.log(`  Skipping old job: "${job.title}" (${job.date})`);
                        continue;
                    }

                    allJobs.push({
                        title: job.title,
                        company: job.company || 'Unknown',
                        role: job.title,
                        level: inferLevel(job.title),
                        applyUrl: job.applyUrl,
                        source: 'codegrammer',
                        postedAt,
                        fetchedAt: now,
                        isRecent: postedAt >= new Date(now - 24 * 60 * 60 * 1000),
                        tags: [],
                        city: job.location || null,
                        isRemote: job.location?.toLowerCase().includes('remote') || false,
                    });
                }

                if (currentPage < maxPages) {
                    await randomDelay(2000, 4000);
                }
            }

            await browser.close();
            browser = null;

            console.log(`  Done. Collected ${allJobs.length} jobs within cutoff`);
            return allJobs;

        } catch (err) {
            console.error(`  Attempt ${attempt} failed:`, err.message);
            if (browser) { await browser.close(); browser = null; }

            if (attempt < MAX_RETRIES) {
                const waitTime = attempt * 5000;
                console.log(`  Retrying in ${waitTime / 1000}s...`);
                await new Promise(r => setTimeout(r, waitTime));
            } else {
                console.error('  All attempts failed, returning empty array');
                return [];
            }
        }
    }

    return [];
}

