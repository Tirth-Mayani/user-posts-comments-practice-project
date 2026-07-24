const axios = require("axios");
require("dotenv").config();


const getCurrentWeather = async () => {
    try{
        const response = await axios.get(
            process.env.OPENWEATHER_CURRENT_WEAHER_API_URL,
            {
                timeout: 10000,
                params: {
                    lat: process.env.WEATHER_LAT,
                    lon: process.env.WEATHER_LON,
                    appid: process.env.OPENWEATHER_API_KEY,
                    untits: "metric",
                    lang: "en"
                }
            }
        )

        const {name, sys, main, weather, wind, clouds, visibility, dt} = response.data;

        return {
            city: name,
            country: sys.country,

            temperature: main.temp,
            feelsLike: main.feels_like,
            tempMax: main.temp_max,
            tempMin: main.temp_min,

            
            humidity: main.humidity,
            pressure: main.pressure,
            visibility,

            weather: weather[0].main,
            description: weather[0].description,

            windSpeed: wind.speed,
            windDirection: wind.deg,
            cloudiness: clouds.all,

            fetchedAt:dt
        };

    } catch(err){

        if(err.code === "ECONNABORTED" || err.code === "ETIMEDOUT"){
            console.error("Weather API request timed out");
            
        } else if(err.response){ // if any API response error lke 401,404 etc, = response 
            if(err.response.status === 429){ //code for exceeded rate limit in API
                console.error("Weather API rate limit exceeded");
            }
            console.error(
                "Weather API responded with error: ",
                error.response.status,
                error.response.data
            );
        } else if(err.request){ //no response, internet disconnected, timeout , etc = request
            console.error("No response received from Weather API");
        } else { // incase of request was never sent
            console.error("Failed to send request to Weather API: ", err.message);
        }
        throw new Error("Failed to fetch current weather data")
    }

};

module.exports = {
    getCurrentWeather
}