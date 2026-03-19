// scraper/test-jsearch.js
import 'dotenv/config';
import axios from 'axios';

const { data } = await axios.get('https://jsearch.p.rapidapi.com/search', {
    params: {
        query: 'software engineer',
        page: '1',
        num_pages: '1',
        country: 'IN',
        date_posted: 'today',
    },
    headers: {
        'X-RapidAPI-Key': process.env.JSEARCH_API_KEY,
        'X-RapidAPI-Host': 'jsearch.p.rapidapi.com',
    },
});

// Print the first job to see all available fields
console.log('Total results:', data.data?.length);
console.log('\nFirst job raw fields:');
console.log(JSON.stringify(data.data?.[0], null, 2));