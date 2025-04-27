import React, { useState, useEffect } from 'react';
import { FaSearch } from "react-icons/fa";
import { WiHumidity, WiStrongWind } from "react-icons/wi";
import axios from 'axios';

function App() {
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [temperature, setTemperature] = useState(null);
  const [humidity, setHumidity] = useState(null);
  const [windSpeed, setWindSpeed] = useState(null);
  const [city, setCity] = useState("");
  const [weatherIcon, setWeatherIcon] = useState("01d");
  const [error, setError] = useState("");
  const [forecast, setForecast] = useState([]);
  const [dateTime, setDateTime] = useState(new Date());
  const [weatherCondition, setWeatherCondition] = useState("Clear");

  const API_KEY = "408ec2dd99da52bc97191650744f0980";

  useEffect(() => {
    const interval = setInterval(() => setDateTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const getBackgroundClass = (condition) => {
    switch (condition) {
      case "Rain": return "from-blue-800 to-gray-900";
      case "Clouds": return "from-gray-600 to-gray-900";
      case "Snow": return "from-gray-300 to-blue-100";
      case "Clear": return "from-yellow-500 to-orange-600";
      case "Thunderstorm": return "from-purple-800 to-black";
      case "Drizzle": return "from-teal-500 to-blue-900";
      case "Mist":
      case "Fog":
      case "Haze":
        return "from-gray-400 to-gray-700";
      default: return "from-green-900 to-black";
    }
  };

  const fetchForecast = async (cityName) => {
    try {
      const { data } = await axios.get(
        `https://api.openweathermap.org/data/2.5/forecast?q=${cityName}&units=metric&appid=${API_KEY}`
      );
      const daily = data.list.filter((_, index) => index % 8 === 0);
      setForecast(daily);
    } catch (err) {
      console.log("Forecast fetch error:", err);
    }
  };

  const fetchWeatherByCoords = async (lat, lon) => {
    setLoading(true);
    try {
      const { data } = await axios.get(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`
      );
      setTemperature(data.main.temp);
      setHumidity(data.main.humidity);
      setWindSpeed(data.wind.speed);
      setCity(`${data.name}, ${data.sys.country}`);
      setWeatherIcon(data.weather[0].icon);
      setWeatherCondition(data.weather[0].main);
      setError("");
      fetchForecast(data.name);
    } catch (err) {
      console.log(err);
      setError("Unable to fetch weather for your location.");
    }
    setLoading(false);
  };

  const fetchWeather = async () => {
    if (!search) return;
    setLoading(true);
    try {
      const { data } = await axios.get(
        `https://api.openweathermap.org/data/2.5/weather?q=${search}&units=metric&appid=${API_KEY}`
      );
      setTemperature(data.main.temp);
      setHumidity(data.main.humidity);
      setWindSpeed(data.wind.speed);
      setCity(`${data.name}, ${data.sys.country}`);
      setWeatherIcon(data.weather[0].icon);
      setWeatherCondition(data.weather[0].main);
      setError("");
      fetchForecast(search);
    } catch (error) {
      console.log(error);
      setCity("");
      setTemperature(null);
      setHumidity(null);
      setWindSpeed(null);
      setWeatherIcon("01d");
      setForecast([]);
      setError("City not found");
    }
    setLoading(false);
  };

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        fetchWeatherByCoords(latitude, longitude);
      },
      (err) => {
        console.log("Location permission denied", err);
        setError("Location access denied.");
      }
    );
  }, []);

  const backgroundClass = getBackgroundClass(weatherCondition);

  return (
    <div className={`flex flex-col items-center justify-center min-h-screen px-4 bg-gradient-to-br ${backgroundClass} text-white transition-all duration-700`}>

      {/* Search */}
      <div className='flex items-center bg-white rounded-full px-4 mb-3 w-80 shadow-lg'>
        <input
          type="text"
          placeholder="Search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && fetchWeather()}
          className='flex-1 text-black outline-none px-2'
        />
        <FaSearch
          onClick={!loading ? fetchWeather : null}
          className={`text-gray-500 cursor-pointer ${loading && 'opacity-50 cursor-not-allowed'}`}
        />
      </div>

      {error && <p className='text-red-400 text-sm mt-1'>{error}</p>}

      {/* Date and Time */}
      <p className='text-md mt-2'>
        {dateTime.toLocaleString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        })}
      </p>

      {/* Weather Icon */}
      {loading ? (
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-white mb-4"></div>
      ) : (
        <img
          src={`https://openweathermap.org/img/wn/${weatherIcon}@2x.png`}
          alt="Weather Icon"
          className='w-20 h-20 mb-4'
        />
      )}

      {/* Temperature & City */}
      <h1 className='text-4xl font-bold mb-1'>
        {loading ? "Loading..." : temperature !== null ? `${temperature}°C` : "--"}
      </h1>
      <h2 className='text-2xl mt-2 font-semibold'>
        {city || "Type to check temperature"}
      </h2>

      {/* Humidity & Wind */}
      <div className='w-full max-w-md mt-7 flex flex-col md:flex-row justify-between md:items-start'>
        <div className='flex flex-col items-center'>
          <WiHumidity className='text-3xl' />
          <span className='text-lg font-medium'>{humidity !== null ? `${humidity}%` : "--"}</span>
          <p className='text-sm'>Humidity</p>
        </div>
        <div className='flex flex-col items-center'>
          <WiStrongWind className='text-3xl' />
          <span className='text-lg font-medium'>{windSpeed !== null ? `${windSpeed} km/h` : "--"}</span>
          <p className='text-sm'>Wind Speed</p>
        </div>
      </div>

      {/* Forecast */}
      {forecast.length > 0 && (
        <div className="w-full max-w-4xl mt-10 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
          {forecast.map((day, index) => {
            const date = new Date(day.dt_txt);
            const iconCode = day.weather[0].icon;
            const temp = Math.round(day.main.temp);
            const description = day.weather[0].description;

            return (
              <div key={index} className="bg-white bg-opacity-10 p-4 rounded-xl text-center">
                <p className="font-medium text-sm">
                  {date.toLocaleDateString("en-US", {
                    weekday: "short",
                    month: "short",
                    day: "numeric",
                  })}
                </p>
                <img
                  src={`https://openweathermap.org/img/wn/${iconCode}@2x.png`}
                  alt={description}
                  className="mx-auto w-14 h-14 object-contain"
                />
                <p className="text-lg font-semibold mt-1">{temp}°C</p>
                <p className="text-sm capitalize text-gray-300">{description}</p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default App;
