const TelegramBot = require('node-telegram-bot-api');
const ThreeCommasAPI = require('3commas-api-node');
require('dotenv').config();
const cron = require('node-cron');

const botToken = process.env.BOT_TOKEN;
const alertChatId = process.env.ALERT_CHAT_ID;

const ALERT_THRESHOLD_PERCENT = 0.2;

const bot = new TelegramBot(botToken, { polling: true });




// Configuration for API1
const threeCommasAPI1 = new ThreeCommasAPI({
  apiKey: process.env.API1_KEY,
  apiSecret: process.env.API1_SECRET,

});

// Configuration for API2
const threeCommasAPI2 = new ThreeCommasAPI({
  apiKey: process.env.API2_KEY,
  apiSecret: process.env.API2_SECRET,
 
});


// Define API IDs and capitalMap
const api1Ids  = [
32103674,32427154,32152427,32428979,32103676,32101635,
];
const api2Ids  = [
  32244371, 32435532, 32260429, 32244363,
];
const capitalMap = new Map([

  [32427154, { title: 'G124 ',strategy: '2X 1H 1%', capital: 1600 }],
  [32244371, { title: 'G118 ',strategy: '4x 15M 0.58%', capital: 2300 }],
  [32244363, { title: 'G117 ',strategy: '4X 1H 1%', capital: 3026 }],
  [32260429, { title: 'G30 ',strategy: '4X 1H 1%', capital: 1900 }],
  [32152427, { title: 'G22 ',strategy: '4X 1H 0.58%', capital: 1000 }],
  [32428979, { title: 'G66',strategy: '', capital: 1360 }],
  [32435532, { title: 'G72+600', strategy: '',capital: 500 }],
  [32103674, { title: 'G14 ',strategy: 'spot', capital: 2100 }],
  [32103676, { title: 'G14 ',strategy: 'Future', capital: 1007 }],
  [32101635,{title: 'G16 ',strategy: '4X 15M 1% ',capital: 1000}], 
  


  
  // [31814867, { title: 'G13 ',strategy: '2X 15M 0.58%', capital: 1000 }],
  // [32474224,{title: 'G126 ',strategy: '2X 15M 0.58%',capital: 1000}], 
  // [32470971,{title: 'G128 ',strategy: '2X 1H 1%',capital: 1000}], 
  //[32427154, { title: 'G124 ',strategy: '2X 1H 1%', capital: 1000 }],
  //to 129 [32427159,{title: 'G125 ',strategy: '2X 4H 1%',capital: 1000}], 
  // [32101201, { title: 'G9 ',strategy: '2X 4H 1%', capital: 1000 }],
  //  [31876293, { title: 'G11 ',strategy: '4X 15M 0.58%', capital: 1000 }],
  // [32476763,{title: 'G129 +1000',strategy: '4X 15M 1%',capital: 2000}], 
  //[32178454, { title: 'G24',strategy: '', capital: 1000 }],
  // [32427107, { title: 'G122',strategy: '', capital: 1700 }],
  // [32433201, { title: 'G67', strategy: '',capital: 345 }],
  //[32423630, { title: 'G98',strategy: '', capital: 427 }],

]);


// Function to send a notification
async function sendAlert(accountId, title, percentage) {
  try {
    let message = '';

    if (percentage >= 3) {
      // If the percentage is greater than or equal to 3%, send a special message
      message = `⚠️ (${title}) ${percentage}%✌️`;
    } else if (percentage >= ALERT_THRESHOLD_PERCENT) {
      // If the percentage is greater than or equal to ALERT_THRESHOLD_PERCENT, send a regular alert message
      message = `${title} >= ${percentage}%`;
    } else {
      // If neither of the above conditions is met, send a message indicating no alerts
      message = `No alerts to send for ${title} (${percentage}%).`;
    }

    // Send the alert message to the specified chat ID
    await bot.sendMessage(alertChatId, message);
  } catch (error) {
    console.error('Error sending alert to Telegram bot:', error);
  }
}


// Define the checkBalances function
async function checkBalances(apiIds, apiId) {
  try {
    // Fetch balances for the specified API ID
    const api = apiId === 'API1' ? threeCommasAPI1 : threeCommasAPI2;

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

    console.log(`Alert check results for ${apiId}:`, results);
  } catch (error) {
    console.error(`Error checking alerts for ${apiId}:`, error);
  }
}

// Schedule a cron job to periodically check alerts
cron.schedule('*/1 * * * *', async () => {
  console.log('Running Alerts check...');

  // Call the function to check alerts for both APIs
  checkBalances(api1Ids, 'API1');
  checkBalances(api2Ids, 'API2');
});

// Start the bot (you can keep this part if you want to trigger checks manually via the bot)
bot.onText(/\/alerts/, (msg) => {
  const chatId = msg.chat.id;
  console.log('Chat ID:', chatId);

  bot.sendMessage(chatId, 'Checking Alerts...');

  // Call the function to check alerts for both APIs
  checkBalances(api1Ids, 'API1');
  checkBalances(api2Ids, 'API2');
});
