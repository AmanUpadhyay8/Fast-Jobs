// scraper/scraper.service.js
import axios from 'axios';

const BASE_URL = 'https://jsearch.p.rapidapi.com/search';

const LEVEL_MAP = {
    intern: 'entry_level',
    sde: 'mid_level',
    senior: 'senior_level',
    staff: 'senior_level',
    principal: 'senior_level',
};

export async function fetchJobsForConfig(config) {
    const results = [];

    for (const keyword of config.keywords) {
        for (const level of config.levels) {
            try {
                console.log(`  Fetching: "${keyword}" | level: ${level}`);

                const { data } = await axios.get(BASE_URL, {
                    params: {
                        query: `${keyword}`,
                        page: '1',
                        num_pages: '2',
                        date_posted: 'today',
                        country: 'IN',
                    },
                    headers: {
                        'X-RapidAPI-Key': process.env.JSEARCH_API_KEY,
                        'X-RapidAPI-Host': 'jsearch.p.rapidapi.com',
                    },
                });

                const jobs = (data.data || []).map(job => ({
                    title: job.job_title,
                    company: job.employer_name,
                    role: job.job_title,
                    level,
                    applyUrl: job.job_apply_link,
                    source: job.job_publisher?.toLowerCase().trim() || 'unknown',
                    postedAt: job.job_posted_at_timestamp
                        ? new Date(job.job_posted_at_timestamp * 1000)
                        : new Date(),
                    tags: job.job_required_skills || [],
                    city: job.job_city || null,
                    isRemote: job.job_is_remote ?? false,
                }));

                console.log(`    Found ${jobs.length} jobs`);
                results.push(...jobs);

                // Small delay between requests to avoid rate limiting
                await new Promise(r => setTimeout(r, 500));

            } catch (err) {
                console.error(`  Failed "${keyword}" / ${level}:`, err.response?.data?.message || err.message);
                // Don't rethrow — one failed combo shouldn't kill the whole run
            }
        }
    }

    return results;
}