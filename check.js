const TelegramBot = require('node-telegram-bot-api');
const ThreeCommasAPI = require('3commas-api-node');
require('dotenv').config();
const botToken = process.env.BOT_TOKEN;
const alertChatId = process.env.ALERT_CHAT_ID;
const resultsChatId = process.env.RESULTS_CHAT_ID;


const ALERT_THRESHOLD_PERCENT = 2;

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
  32101201, 31876293, 32103676, 32178454, 32427154,32152427,
  32427107, 32428979, 32433201, 31814867,32101635,32470971,32427159,32474224,
];
const api2Ids  = [
  32244363, 32244371,32423630, 32435532,32260429,32476763,
];
const capitalMap = new Map([
  [31814867, { title: 'G13 ',strategy: '2X 15M 0.58%', capital: 1000 }],
  [32103676, { title: 'G14 ',strategy: '2X 15M 0.58', capital: 2000 }],
  [32474224,{title: 'G126 ',strategy: '2X 15M 0.58%',capital: 1000}], 
  
  [32470971,{title: 'G128 ',strategy: '2X 1H 1%',capital: 1000}], 
  [32427154, { title: 'G124 ',strategy: '2X 1H 1%', capital: 1000 }],

  [32427159,{title: 'G125 ',strategy: '2X 4H 1%',capital: 1000}], 
  [32101201, { title: 'G9 ',strategy: '2X 4H 1%', capital: 1000 }],

  [31876293, { title: 'G11 ',strategy: '4X 15M 0.58%', capital: 1000 }],
  [32244371, { title: 'G118 ',strategy: '4x 15M 0.58%', capital: 1000 }],
  [ 32101635,{title: 'G16 ',strategy: '4X 15M 1% ',capital: 1000}], 
  [32476763,{title: 'G129 ',strategy: '4X 15M 1%',capital: 1000}], 

  [32244363, { title: 'G117 ',strategy: '4X 1H 1%', capital: 1000 }],
  [32260429, { title: 'G30 ',strategy: '4X 1H 1%', capital: 1000 }],
  [32152427, { title: 'G22 ',strategy: '4X 1H 0.58%', capital: 1000 }],

  

  
  [32178454, { title: 'G24',strategy: '', capital: 1000 }],
  [32427107, { title: 'G122',strategy: '', capital: 1700 }],
  [32428979, { title: 'G66+1000',strategy: '', capital: 3000 }],
  [32433201, { title: 'G67', strategy: '',capital: 345 }],
  [32423630, { title: 'G98',strategy: '', capital: 427 }],
  [32435532, { title: 'G72+600', strategy: '',capital: 2600 }],
]);
// Function to send a notification
async function sendAlert(accountId, title, percentage) {
  try {
    // Send an alert message to the specified chat ID
    await bot.sendMessage(alertChatId, `Alert !: Account ${accountId} (${title}) exceeded ${ALERT_THRESHOLD_PERCENT}% change: ${percentage}%`);
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

    // Log the results or perform any desired actions
    console.log(`Balance check results for ${apiId}:`, results);

    // Send the balance check results to the results chat ID
    await bot.sendMessage(resultsChatId, `Balance check results for ${apiId}:`);
    for (const result of results) {
      await bot.sendMessage(resultsChatId, `${result.title}(  ${result.percentage} % )`);
    }
  } catch (error) {
    console.error(`Error checking balances for ${apiId}:`, error);
  }
}

// Handle /check command for both API1 and API2
bot.onText(/\/check/, (msg) => {
  const chatId = msg.chat.id;
  console.log('Chat ID:', chatId); // Print the chat ID to the console

  bot.sendMessage(chatId, 'Checking balances ...');

  // Call the function to check balances and send alerts for both APIs
  checkBalances(api1Ids, 'API1');
  checkBalances(api2Ids, 'API2');
});
