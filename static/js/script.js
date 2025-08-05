//Currency-prediction - by MLeafit
//File for the dashboard and connection with the backend
// Function to fetch historical data
async function getHistoricalData(currency_pair) {
  const response = await fetch(`http://localhost:8000/api/historical/${currency_pair}`);
  return response.json();
}

// Function to fetch prediction data
async function getPrediction(currency_pair, algorithm = "lstm") {
  const response = await fetch(`http://localhost:8000/api/predict/${currency_pair}?algorithm=${algorithm}`);
  return response.json();
}

function updateCurrencyPair() {
	const currency1 = document.querySelector('#currency1-list .active').dataset.currency;
	const currency2 = document.querySelector('#currency2-list .active').dataset.currency;
	const pair = `${currency1}2${currency2}`;
	return pair
}


// Function to render the charts
function renderCharts() {
  // Get canvas elements
  const lineCtx = document.getElementById('lineChart').getContext('2d');
  let currency_pair = updateCurrencyPair()
  
  // Generate mock data
  const historicalData = getHistoricalData(currency_pair);
  console.log(historicalData)
  const predictionData = getPrediction(currency_pair);
  console.log(predictionData)
  
  // Extract labels and data
  const historicalLabels = historicalData.map(d => d.date);
  const historicalValues = historicalData.map(d => d.value);
  const predictionLabels = predictionData.map(d => d.date);
  const predictionValues = predictionData.map(d => d.value);
  
  // Create line chart
  new Chart(lineCtx, {
    type: 'line',
    data: {
      labels: [...historicalLabels, ...predictionLabels],
      datasets: [
        {
          label: 'Historical Price',
          data: [...historicalValues, ...Array(predictionLabels.length).fill(null)],
          borderColor: '#4cc9f0',
          backgroundColor: 'rgba(76, 201, 240, 0.1)',
          borderWidth: 3,
          pointRadius: 3,
          tension: 0.2,
          fill: true
        },
        {
          label: 'Prediction',
          data: [...Array(historicalLabels.length).fill(null), ...predictionValues],
          borderColor: '#f72585',
          borderWidth: 3,
          borderDash: [5, 5],
          pointRadius: 4,
          tension: 0.2,
          pointBackgroundColor: '#f72585'
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          labels: {
            color: '#e6e6e6',
            font: {
              size: 14
            }
          }
        },
        tooltip: {
          backgroundColor: 'rgba(15, 23, 42, 0.9)',
          titleColor: '#4cc9f0',
          bodyColor: '#e6e6e6',
          borderColor: 'rgba(64, 109, 212, 0.5)',
          borderWidth: 1,
          padding: 12,
          callbacks: {
            label: function(context) {
              return `${context.dataset.label}: $${context.parsed.y.toLocaleString()}`;
            }
          }
        }
      },
      scales: {
        x: {
          grid: {
            color: 'rgba(64, 109, 212, 0.1)'
          },
          ticks: {
            color: '#a0aec0',
            maxRotation: 0,
            maxTicksLimit: 10
          }
        },
        y: {
          grid: {
            color: 'rgba(64, 109, 212, 0.1)'
          },
          ticks: {
            color: '#a0aec0',
            callback: function(value) {
              return '$' + value.toLocaleString();
            }
          }
        }
      },
      interaction: {
        intersect: false,
        mode: 'index'
      }
    }
  });
  
}

// Initialize the charts when the page loads
document.addEventListener('DOMContentLoaded', renderCharts);

// Add interactivity to list items
document.querySelectorAll('.list li').forEach(item => {
  item.addEventListener('click', function() {
    // Remove active class from siblings
    this.parentElement.querySelectorAll('li').forEach(li => {
      li.classList.remove('active');
    });
    // Add active class to clicked item
    this.classList.add('active');
  });
});

// Refresh button functionality
document.querySelector('.btn.secondary').addEventListener('click', function() {
  // Show loading indicator
  const wrappers = document.querySelectorAll('.chart-wrapper');
  wrappers.forEach(wrapper => {
    const loadingDiv = document.createElement('div');
    loadingDiv.className = 'loading';
    loadingDiv.innerHTML = '<div class="spinner"></div>';
    wrapper.appendChild(loadingDiv);
  });
  
  // Simulate API call delay
  setTimeout(() => {
    // Remove loading indicators
    document.querySelectorAll('.loading').forEach(el => el.remove());
    
    // Re-render charts with new data
    renderCharts();
    
    // Update price info with new values
    const newPrice = 38000 + Math.random() * 6000;
    const priceElement = document.querySelector('.price');
    const changeElement = document.querySelector('.change');
    
    const oldPrice = parseFloat(priceElement.textContent.replace('$', '').replace(',', ''));
    const change = ((newPrice - oldPrice) / oldPrice * 100).toFixed(2);
    
    priceElement.textContent = `$${newPrice.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
    changeElement.textContent = `${change >= 0 ? '+' : ''}${change}%`;
    changeElement.className = change >= 0 ? 'change positive' : 'change negative';
  }, 1500);
});
