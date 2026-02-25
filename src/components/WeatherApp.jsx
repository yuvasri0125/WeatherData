import { useState } from "react";
function WeatherApp() {
  const [city, setCity] = useState("");
  const [searchType, setSearchType] = useState("");
  const [date, setDate] = useState("");
  const [month, setMonth] = useState("");
  const [year, setYear] = useState("");
  const [results, setResults] = useState([]);

  const handleSearch = async () => {
    if (!city || !searchType) {
      alert("Enter city and select search type");
      return;
    }

    setResults([]);

    try {
      const geoRes = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${city}`
      );
      const geoData = await geoRes.json();

      if (!geoData.results || geoData.results.length === 0) {
        alert("City not found");
        return;
      }

      const lat = geoData.results[0].latitude;
      const lon = geoData.results[0].longitude;

      let url = "";

      const dailyParams =
        "temperature_2m_max,temperature_2m_min,temperature_2m_mean,relative_humidity_2m_mean,precipitation_sum,windspeed_10m_max";

      if (searchType === "date") {
        if (!date) return alert("Select a date");

        url = `https://archive-api.open-meteo.com/v1/archive?latitude=${lat}&longitude=${lon}&start_date=${date}&end_date=${date}&daily=${dailyParams}&timezone=auto`;
      }

      if (searchType === "month") {
        if (!month || !year) return alert("Enter month and year");

        const formattedMonth = month.padStart(2, "0");

        url = `https://archive-api.open-meteo.com/v1/archive?latitude=${lat}&longitude=${lon}&start_date=${year}-${formattedMonth}-01&end_date=${year}-${formattedMonth}-28&daily=${dailyParams}&timezone=auto`;
      }

      if (searchType === "year") {
        if (!year) return alert("Enter year");

        url = `https://archive-api.open-meteo.com/v1/archive?latitude=${lat}&longitude=${lon}&start_date=${year}-01-01&end_date=${year}-12-31&daily=${dailyParams}&timezone=auto`;
      }

      const response = await fetch(url);
      const data = await response.json();

      if (!data.daily || !data.daily.time) {
        alert("No data available");
        return;
      }

      const formattedResults = data.daily.time.map((d, index) => ({
        date: d,
        maxTemp: data.daily.temperature_2m_max[index],
        minTemp: data.daily.temperature_2m_min[index],
        meanTemp: data.daily.temperature_2m_mean[index],
        humidity: data.daily.relative_humidity_2m_mean[index],
        precipitation: data.daily.precipitation_sum[index],
        windSpeed: data.daily.windspeed_10m_max[index],
      }));

      setResults(formattedResults);
    } catch (error) {
      console.error(error);
      alert("Error fetching data");
    }
  };

  return (
    <div className="weather-card">
      <div className="input-section">
        <input
          type="text"
          placeholder="Enter City"
          value={city}
          onChange={(e) => setCity(e.target.value)}
        />

        <select
          value={searchType}
          onChange={(e) => setSearchType(e.target.value)}
        >
          <option value="">Select Search Type</option>
          <option value="date">Search by Date</option>
          <option value="month">Search by Month</option>
          <option value="year">Search by Year</option>
        </select>

        {searchType === "date" && (
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        )}

        {searchType === "month" && (
          <>
            <input
              type="number"
              placeholder="Month (1-12)"
              value={month}
              onChange={(e) => setMonth(e.target.value)}
            />
            <input
              type="number"
              placeholder="Year"
              value={year}
              onChange={(e) => setYear(e.target.value)}
            />
          </>
        )}

        {searchType === "year" && (
          <input
            type="number"
            placeholder="Enter Year"
            value={year}
            onChange={(e) => setYear(e.target.value)}
          />
        )}

        <button onClick={handleSearch}>Search</button>
      </div>

      <div className="results">
        {results.map((item, index) => (
          <div key={index} className="result-card">
            <p><strong>Date:</strong> {item.date}</p>
            <p>Max Temp: {item.maxTemp} °C</p>
            <p>Min Temp: {item.minTemp} °C</p>
            <p>Mean Temp: {item.meanTemp} °C</p>
            <p>Humidity: {item.humidity} %</p>
            <p>Precipitation: {item.precipitation} mm</p>
            <p>Wind Speed: {item.windSpeed} km/h</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default WeatherApp;