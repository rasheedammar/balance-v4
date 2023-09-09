// Define api1Table and api2Table
const api1Table = document.getElementById('api1-table');
const api2Table = document.getElementById('api2-table');

// Function to create an account row with a stop bot button
const createAccountRow = (accountId, accountData) => {
  const tableRow = document.createElement('tr');
  tableRow.innerHTML = `
      <td>${accountId}</td>
      <td>${accountData.name}</td>
      <td>${accountData.strategy}</td>
      <td>$${accountData.balance}</td>
      <td>$${accountData.capital}</td>
      <td>${accountData.title}</td>
      <td>${accountData.percentage}%</td>
  `;

  // Apply percentage color based on the percentage value
  const percentageCell = tableRow.querySelector('td:nth-child(7)');
  
  console.log('tableRow:', tableRow); // Log the table row
  console.log('percentageCell:', percentageCell); // Log the selected element
  
  const percentage = parseFloat(accountData.percentage);
  if (!isNaN(percentage)) {
    if (percentage < 0) {
      percentageCell.style.color = 'red';
    } else {
      percentageCell.style.color = 'green';
    }
  }

  return tableRow;
};

// Function to fetch data and update the page
const fetchData = async () => {
  try {
    const response = await fetch('/data'); // Corrected URL here

    if (!response.ok) {
      throw new Error(`Error fetching data. Status: ${response.status}`);
    }

    const data = await response.json();

    const api1TotalCapital = data.api1.reduce((total, account) => total + account.capital, 0);
    const api2TotalCapital = data.api2.reduce((total, account) => total + account.capital, 0);

    // Update total capital display
    const api1TotalCapitalElement = document.getElementById('api1-total-capital');
    const api2TotalCapitalElement = document.getElementById('api2-total-capital');
    
    api1TotalCapitalElement.textContent = `$${api1TotalCapital}`;
    api2TotalCapitalElement.textContent = `$${api2TotalCapital}`;

    // Clear existing table rows
    api1Table.innerHTML = '';
    api2Table.innerHTML = '';

    // Iterate over the account data and create the table rows for API1
    data.api1.forEach((account) => {
      const row = createAccountRow(account.id, account);
      api1Table.appendChild(row);
    });

    // Iterate over the account data and create the table rows for API2
    data.api2.forEach((account) => {
      const row = createAccountRow(account.id, account);
      api2Table.appendChild(row);
    });

    // Update the "Last Refresh" time
    const currentTimeElement = document.getElementById('current-time');
    const now = new Date();
    const formattedTime = now.toLocaleTimeString(); // Format the time as desired
    currentTimeElement.textContent = `Last Refresh: ${formattedTime}`;
  } catch (error) {
    console.error('Error fetching account data:', error);
  }
};

document.addEventListener('DOMContentLoaded', () => {
  // Get the current time and update the "Last Refresh" time initially
  const currentTimeElement = document.getElementById('current-time');
  const now = new Date();
  const formattedTime = now.toLocaleTimeString(); // Format the time as desired
  currentTimeElement.textContent = `Last Refresh: ${formattedTime}`;
  
  // Call the fetchData function when the page loads
  fetchData();

  // Set up a timer to fetch data every 5 minutes (300,000 milliseconds)
  setInterval(() => {
    fetchData();
  }, 300000); // 5 minutes in milliseconds
});
