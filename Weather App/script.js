
const API_KEY = "591b9b49c9f3761ce37d06797caf22a0";


const useMyLocationBtn = document.getElementById("useMyLocationBtn");
const themeToggle = document.getElementById("themeToggle");

const cityInput = document.getElementById("cityInput");
const searchBtn = document.getElementById("searchBtn");

const msg = document.getElementById("msg");
const weatherCard = document.getElementById("weatherCard");

const cityNameEl = document.getElementById("cityName");
const conditionEl = document.getElementById("condition");
const tempEl = document.getElementById("temp");
const feelsEl = document.getElementById("feels");
const humidityEl = document.getElementById("humidity");
const windEl = document.getElementById("wind");


const chipsEl = document.getElementById("chips");
let recent = JSON.parse(localStorage.getItem("recentCities") || "[]");


let map;
let marker;

function renderChips() {
    if (!chipsEl) return;
    chipsEl.innerHTML = "";
    recent.slice(0, 6).forEach((city) => {
        const btn = document.createElement("button");
        btn.className = "chip-item";
        btn.textContent = city;
        btn.onclick = () => getWeather(city);
        chipsEl.appendChild(btn);
    });
}
renderChips();

function updateMap(lat, lon, label) {
    if (!window.L) return;

    if (!map) {
        map = L.map("map", { zoomControl: true }).setView([lat, lon], 11);

        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            attribution: "&copy; OpenStreetMap contributors",
        }).addTo(map);

        marker = L.marker([lat, lon]).addTo(map).bindPopup(label).openPopup();


        setTimeout(() => map.invalidateSize(), 250);
    } else {
        map.setView([lat, lon], 11);
        marker.setLatLng([lat, lon]).setPopupContent(label).openPopup();
        setTimeout(() => map.invalidateSize(), 250);
    }
}

function saveRecentCity(cityName) {
    recent = [cityName, ...recent.filter((c) => c.toLowerCase() !== cityName.toLowerCase())];
    recent = recent.slice(0, 6);
    localStorage.setItem("recentCities", JSON.stringify(recent));
    renderChips();
}

function setLoading(isLoading) {
    msg.textContent = isLoading ? "Loading..." : "";
}

async function getWeather(city) {
    try {
        setLoading(true);
        weatherCard.classList.add("hidden");

        const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(
            city
        )}&appid=${API_KEY}&units=metric`;

        const res = await fetch(url);
        const data = await res.json();

        if (!res.ok) {
            throw new Error(data.message || "Request failed");
        }

        cityNameEl.textContent = `${data.name}, ${data.sys.country}`;
        conditionEl.textContent = data.weather[0].description.toUpperCase();
        tempEl.textContent = `${Math.round(data.main.temp)}°C`;
        feelsEl.textContent = `${Math.round(data.main.feels_like)}°C`;
        humidityEl.textContent = `${data.main.humidity}%`;
        windEl.textContent = `${Math.round(data.wind.speed)} m/s`;


        updateMap(data.coord.lat, data.coord.lon, `${data.name}, ${data.sys.country}`);

        saveRecentCity(data.name);

        setLoading(false);
        weatherCard.classList.remove("hidden");
    } catch (err) {
        setLoading(false);
        msg.textContent = err.message;
    }
}


async function getWeatherByCoords(lat, lon) {
    try {
        setLoading(true);
        weatherCard.classList.add("hidden");

        const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`;
        const res = await fetch(url);
        const data = await res.json();

        if (!res.ok) throw new Error(data.message || "Request failed");

        cityNameEl.textContent = `${data.name}, ${data.sys.country}`;
        conditionEl.textContent = data.weather[0].description.toUpperCase();
        tempEl.textContent = `${Math.round(data.main.temp)}°C`;
        feelsEl.textContent = `${Math.round(data.main.feels_like)}°C`;
        humidityEl.textContent = `${data.main.humidity}%`;
        windEl.textContent = `${Math.round(data.wind.speed)} m/s`;

        updateMap(data.coord.lat, data.coord.lon, `${data.name}, ${data.sys.country}`);
        saveRecentCity(data.name);

        setLoading(false);
        weatherCard.classList.remove("hidden");
    } catch (err) {
        setLoading(false);
        msg.textContent = err.message;
    }
}

// Events
searchBtn.addEventListener("click", () => {
    const city = cityInput.value.trim();
    if (!city) {
        msg.textContent = "City name daal bhai 🙂";
        return;
    }
    getWeather(city);
});

cityInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") searchBtn.click();
});

useMyLocationBtn?.addEventListener("click", () => {
    if (!navigator.geolocation) {
        msg.textContent = "Geolocation not supported.";
        return;
    }
    navigator.geolocation.getCurrentPosition(
        (pos) => getWeatherByCoords(pos.coords.latitude, pos.coords.longitude),
        () => (msg.textContent = "Location permission denied.")
    );
});


const savedTheme = localStorage.getItem("theme");
if (savedTheme === "light") {
    document.body.classList.add("light");
    if (themeToggle) themeToggle.textContent = "☀️ Light";
} else {
    if (themeToggle) themeToggle.textContent = "🌙 Dark";
}

themeToggle?.addEventListener("click", () => {
    document.body.classList.toggle("light");
    const isLight = document.body.classList.contains("light");
    localStorage.setItem("theme", isLight ? "light" : "dark");
    themeToggle.textContent = isLight ? "☀️ Light" : "🌙 Dark";
});


getWeather("Delhi");