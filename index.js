require('dotenv').config();
const threeCommasAPI = require('3commas-api-node');
const express = require('express');
const path = require('path');
const http = require('http');
const TelegramBot = require('node-telegram-bot-api');

// Import the spawn function from the child_process module
const { spawn } = require('child_process');

const ALERT_THRESHOLD_PERCENT = 0;
const botToken = process.env.BOT_TOKEN;
console.log("BOT_TOKEN:", botToken);
const chatId = process.env.CHAT_ID;
const app = express();
const port = process.env.PORT || 3000;
const bot = new TelegramBot(botToken, { polling: false });

// Define a route that sends a response (ping)
app.get('/ping', (req, res) => {
  res.status(200).send('Ping received');
});


const publicDirectoryPath = path.join(__dirname, 'public');
app.use(express.static(publicDirectoryPath));

// Create an HTTP server
const server = http.createServer(app);




// Handle /check command
bot.onText(/\/check/, (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId, 'Checking balances...');

  checkProcess.stdout.on('data', (data) => {
    console.log(`check.js output: ${data}`);
  });

  checkProcess.stderr.on('data', (data) => {
    console.error(`check.js error: ${data}`);
  });

  checkProcess.on('close', (code) => {
    console.log(`check.js process exited with code ${code}`);
  });
});



//amm3ro api10
const api1 = new threeCommasAPI({
   apiKey:'35c1fd4032924b3aad132a6d135294f8192816f541da44039dcea439f3e6cce3',
   apiSecret: '25d7622eb5df82eace388295ab8872cdd6b6ea89dfb66bd31dde8ae26cd904c9f32511bdb166baa5b3ac8ddfb181d79e838636ec6baf929a454ad1e96d67e5ffa8d98091d9d51b044122c43638ea0a473688e48832d3a28ba81777bf965a23c5d37b1825',
      //forcedIpAddress: "5.27.45.192", // Provide your forced IP address here

  });


//bot api9
const api2 = new threeCommasAPI({
  apiKey:'4d92b7d77e504372aa71127afca240acf546cf35d70a4dc79d8cc97b85a397c2',
  apiSecret: '43c7fe02916ed459d08b03ef3b45315168a2487e15eedbb34a6fc6a7cd37923c7cfc5d59f120daf2d351e9869bfcef2bc49e40828306f21c1179c229d799afde6862d16d255baca141d36ec3619e37963c66b2e72c3ca0555c3b040b4efee9dccd6d430a',
   // forcedIpAddress: "5.27.45.192", // Provide your forced IP address here

  });



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




function sendAlert(accountId, title, percentage) {
  const message = `${percentage} (${title})`;

  bot.sendMessage(chatId, message)
    .then(() => {
      console.log('Alert sent to Telegram:', message);
    })
    .catch((error) => {
      console.error('Error sending alert to Telegram:', error);
    });
}



app.get('/data', async (req, res) => {
  try {
    const api1Ids = [
      32101201, 31876293, 32103676, 32178454, 32427154,32152427,
      32427107, 32428979, 32433201, 31814867,32101635,32470971,32427159,32474224,
    ];
    const api2Ids = [
      32244363, 32244371,32423630, 32435532,32260429,32476763,
    ];



  const api1Results = await Promise.all(api1Ids.map(async (id) => {
  const account = await api1.accountLoadBalances(id);
  const capitalInfo = capitalMap.get(id);
  const balance = Math.floor(account?.primary_display_currency_amount?.amount) || 0;
  const capital = capitalInfo?.capital || 0;
  const percentage = ((balance - capital) / capital * 100).toFixed(1);
 
  if (percentage >= ALERT_THRESHOLD_PERCENT) {
  sendAlert(id, capitalInfo?.title || '', percentage);
}


  capitalInfo.percentage = percentage;

  return {
    title: capitalInfo?.title || '',
    id,
    name: account?.name,
    strategy: capitalInfo?.strategy || '',
    balance,
    capital,
    percentage,
  };
}));


const api2Results = await Promise.all(api2Ids.map(async (id) => {
  const account = await api2.accountLoadBalances(id);
  const capitalInfo = capitalMap.get(id);
  
  const balance = Math.floor(account?.primary_display_currency_amount?.amount) || 0;
  const capital = capitalInfo?.capital || 0;
  const percentage = ((balance - capital) / capital * 100).toFixed(1);

  if (percentage >= ALERT_THRESHOLD_PERCENT){
  sendAlert(id, capitalInfo?.title || '', percentage);
}


  capitalInfo.percentage = percentage;

  return {
    title: capitalInfo?.title || '',
    id,
    name: account?.name,
    strategy: capitalInfo?.strategy || '',
    balance,
    capital,
    percentage,
  };
}));




const data = {
  api1: api1Results.sort((account1, account2) => account2.balance - account1.balance),
  api2: api2Results.sort((account1, account2) => account2.balance - account1.balance),
};

res.json(data);
} catch (error) {
console.error('Error fetching balances from APIs:', error);
res.status(500).json({ error: 'Error fetching balances from APIs' });
}
});


// Start the server
server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});