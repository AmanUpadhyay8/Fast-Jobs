// scraper/scraper.service.js
import axios from 'axios';

const BASE_URL = 'https://jsearch.p.rapidapi.com/search';

export async function fetchJobsForConfig(config) {
    const results = [];
    const BATCH_SIZE = 3;

    for (let i = 0; i < config.keywords.length; i += BATCH_SIZE) {
        const batch = config.keywords.slice(i, i + BATCH_SIZE);

        const batchResults = await Promise.all(
            batch.map(async (keyword) => {
                try {
                    console.log(`  Fetching: "${keyword}"`);

                    const { data } = await axios.get(BASE_URL, {
                        params: {
                            query: keyword.trim(),
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
                        level: inferLevel(job.job_title),
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
                    return jobs;

                } catch (err) {
                    console.error(`  Failed "${keyword}":`, err.response?.data?.message || err.message);
                    return [];
                }
            })
        );

        results.push(...batchResults.flat());

        if (i + BATCH_SIZE < config.keywords.length) {
            await new Promise(r => setTimeout(r, 1000));
        }
    }

    return results;
}

function inferLevel(title) {
    const t = title?.toLowerCase() || '';
    if (t.includes('intern')) return 'intern';
    if (t.includes('principal') || t.includes('staff')) return 'principal';
    if (t.includes('senior') || t.includes('sr.')) return 'senior';
    if (t.includes('sde 1') || t.includes('junior')) return 'sde';
    return 'sde';
}