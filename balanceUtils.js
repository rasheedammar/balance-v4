// Import necessary modules and configurations
const ThreeCommasAPI = require('3commas-api-node');

// Define the checkBalances function
async function checkBalances(api, capitalMap) {
  try {
    // Retrieve account IDs based on the API instance

    // Fetch balances for each account ID
    const results = await Promise.all(apiIds.map(async (id) => {
      const account = await api.accountLoadBalances(id);
      const capitalInfo = capitalMap.get(id);
      const balance = Math.floor(account?.primary_display_currency_amount?.amount) || 0;
      const capital = capitalInfo?.capital || 0;
      const percentage = ((balance - capital) / capital * 100).toFixed(1);

      // Check if the percentage exceeds the alert threshold
      if (percentage >= ALERT_THRESHOLD_PERCENT) {
        sendAlert(id, capitalInfo?.title || '', percentage);
      }

      return { id, title: capitalInfo?.title || '', percentage };
    }));

    // Log the results or perform any desired actions
    console.log('Balance check results:', results);
  } catch (error) {
    console.error('Error checking balances:', error);
  }
}

// Export the checkBalances function
module.exports = { checkBalances };
