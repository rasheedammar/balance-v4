const TelegramBot = require('node-telegram-bot-api');
const ThreeCommasAPI = require('3commas-api-node');

const botToken = process.env.BOT_TOKEN;
const chatId = process.env.ALERT_CHAT_ID;


const bot = new TelegramBot(botToken, { polling: true });

const threeCommasAPI = new ThreeCommasAPI({
  apiKey: process.env.API1_KEY,
  apiSecret: process.env.API1_SECRET,});

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


