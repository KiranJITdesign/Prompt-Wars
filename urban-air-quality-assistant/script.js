// REPLACE "YOUR_API_KEY_HERE" with your actual AQICN API token
const API_TOKEN = "7f6e467f78be7c9984e12996b17495f30d13c272"; 
const BASE_URL = "https://api.waqi.info/feed/";
const CITY_ALIASES = {
    banglore: "bangalore"
};

const form = document.getElementById('search-form');
const cityInput = document.getElementById('city-input');
const resultsContainer = document.getElementById('results-container');
const errorMessage = document.getElementById('error-message');
const errorTextEl = document.getElementById('error-text');
const cityNameEl = document.getElementById('city-name');
const aqiValueEl = document.getElementById('aqi-value');
const healthAdviceEl = document.getElementById('health-advice');
const mainPollutantEl = document.getElementById('main-pollutant');

form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const city = cityInput.value.trim();
    if (!city) return;

    resultsContainer.classList.add('hidden');
    errorMessage.classList.add('hidden');

    const normalizedCity = city.toLowerCase();
    const lookupCity = Object.prototype.hasOwnProperty.call(CITY_ALIASES, normalizedCity)
        ? CITY_ALIASES[normalizedCity]
        : city;

    try {
        const response = await fetch(`${BASE_URL}${encodeURIComponent(lookupCity)}/?token=${API_TOKEN}`);
        if (!response.ok) {
            throw new Error(`Air-quality service returned HTTP ${response.status}`);
        }

        const data = await response.json();

        if (data.status === 'ok') {
            displayResults(data.data);
        } else {
            showError(`No air-quality station was found for "${city}". Check the spelling or try a nearby larger city.`);
        }
    } catch (error) {
        console.error("Error fetching data:", error);
        showError("Unable to reach the air-quality service. Check your internet connection and try again.");
    }
});

function displayResults(data) {
    cityNameEl.textContent = data.city.name;
    aqiValueEl.textContent = data.aqi;
    
    // Fallback if dominant pollutant is missing
    mainPollutantEl.textContent = data.dominentpol ? data.dominentpol.toUpperCase() : "N/A";

    let advice = "";
    let color = "";

    if (data.aqi <= 50) {
        advice = "Air quality is considered satisfactory, and air pollution poses little or no risk.";
        color = "var(--good)";
    } else if (data.aqi <= 100) {
        advice = "Air quality is acceptable; however, there may be a risk for some people.";
        color = "var(--moderate)";
    } else {
        advice = "Health alert: everyone may experience more serious health effects.";
        color = "var(--unhealthy)";
    }

    healthAdviceEl.textContent = advice;
    aqiValueEl.style.color = color;

    resultsContainer.classList.remove('hidden');
}

function showError(message) {
    resultsContainer.classList.add('hidden');
    errorTextEl.textContent = message;
    errorMessage.classList.remove('hidden');
}