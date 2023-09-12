const TelegramBot = require('node-telegram-bot-api');
const ThreeCommasAPI = require('3commas-api-node');

const botToken = '6445954804:AAHpzEgRjQSm09obmx1KzX2l0dJdywgLsqY'; // Replace with your actual Bot token
const chatId = 1188152105; // Replace with your actual chat ID

const bot = new TelegramBot(botToken, { polling: true });

const threeCommasAPI = new ThreeCommasAPI({
 apiKey: '35c1fd4032924b3aad132a6d135294f8192816f541da44039dcea439f3e6cce3',
  apiSecret: '25d7622eb5df82eace388295ab8872cdd6b6ea89dfb66bd31dde8ae26cd904c9f32511bdb166baa5b3ac8ddfb181d79e838636ec6baf929a454ad1e96d67e5ffa8d98091d9d51b044122c43638ea0a473688e48832d3a28ba81777bf965a23c5d37b1825',
});

// Listen for the /balance command
bot.onText(/\/balance (.+)/, async (msg, match) => {
  console.log('Chat ID:', chatId); // Print the chat ID to the console

  const chatId = msg.chat.id;
  const userId = msg.from.id;


  const accountArg = match[1]; // Get the argument provided after /balance command
// Check if the user provided a valid account ID
if (!accountArg || !/^\d+$/.test(accountArg)) {
  bot.sendMessage(chatId, 'Please provide a valid 3Commas account ID. Example usage: /balance 12345');
  return;
}

const userAccountId = accountArg;

try {
  // Fetch the account's balance
  const account = await threeCommasAPI.accountLoadBalances(userAccountId);

  // Extract and format the balance information
  const balanceInfo = account?.primary_display_currency_amount || { amount: 0, currency: '' };
  const formattedBalance = `${balanceInfo.amount} ${balanceInfo.currency}`;

  // Send the balance to the user
  bot.sendMessage(chatId, `Balance for account ${userAccountId}: ${formattedBalance}`);
} catch (error) {
  console.error('Error fetching account balance:', error);
  bot.sendMessage(chatId, 'An error occurred while fetching the account balance.');
}
});

// Start the bot
bot.on('polling_error', (error) => {
console.error('Polling error:', error);
});


