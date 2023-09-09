import fetch from 'node-fetch';

const cron = require('node-cron');
const fetch = require('node-fetch');

// Schedule a task to fetch data every 5 minutes
cron.schedule('*/5 * * * *', async () => {
  try {
    const response = await fetch('https://balance02-342321418b8a.herokuapp.com/');
    if (!response.ok) {
      throw new Error(`Error fetching data. Status: ${response.status}`);
    }
    const data = await response.json();
    // Process the fetched data as needed
    console.log('Data fetched:', data);
  } catch (error) {
    console.error('Error fetching data:', error);
  }
});
