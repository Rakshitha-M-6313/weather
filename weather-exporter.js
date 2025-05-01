const express = require('express');
const axios = require('axios');
const client = require('prom-client');

const app = express();
const register = new client.Registry();

// Define metrics
const temperatureGauge = new client.Gauge({
  name: 'weather_temperature_celsius',
  help: 'Current temperature in Celsius',
  labelNames: ['city']
});

const humidityGauge = new client.Gauge({
  name: 'weather_humidity_percent',
  help: 'Current humidity percentage',
  labelNames: ['city']
});

const windGauge = new client.Gauge({
  name: 'weather_wind_speed_kmph',
  help: 'Current wind speed in km/h',
  labelNames: ['city']
});

// Register metrics
register.registerMetric(temperatureGauge);
register.registerMetric(humidityGauge);
register.registerMetric(windGauge);

// Optional: set default labels
register.setDefaultLabels({
  app: 'weather-exporter'
});
client.collectDefaultMetrics({ register });

// Update metrics periodically (every 10 mins)
const updateMetrics = async () => {
  try {
    const city = 'Bangalore';
    const apiKey = 'YOUR_API_KEY';
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;
    const res = await axios.get(url);
    const data = res.data;

    temperatureGauge.set({ city }, data.main.temp);
    humidityGauge.set({ city }, data.main.humidity);
    windGauge.set({ city }, data.wind.speed);
  } catch (error) {
    console.error('Error fetching weather data:', error.message);
  }
};
setInterval(updateMetrics, 10 * 60 * 1000);
updateMetrics();

// Expose metrics endpoint
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
});

app.listen(9100, () => {
  console.log('Weather Prometheus exporter running on http://localhost:9100/metrics');
});
