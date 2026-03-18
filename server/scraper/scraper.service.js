// server/scraper/scraper.service.js
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
                const { data } = await axios.get(BASE_URL, {
                    params: {
                        query: keyword,
                        page: '1',
                        num_pages: '2',
                        employment_type: 'FULLTIME,INTERN',
                        job_requirements: LEVEL_MAP[level] || 'mid_level',
                        date_posted: 'today',
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
                    source: job.job_publisher?.toLowerCase() || 'unknown',
                    postedAt: new Date(job.job_posted_at_timestamp * 1000),
                    tags: job.job_required_skills || [],
                }));

                results.push(...jobs);
            } catch (err) {
                console.error(`Failed for keyword="${keyword}" level="${level}":`, err.message);
                // Don't rethrow — one failed combination shouldn't kill the whole run
            }
        }
    }

    return results;
}