var openWeatherApiKey = "d9118cbb4158fd9329630940a9074c07"

async function getCoordsForZipCode(zipCode) {
    var mapUrl = `https://api.openweathermap.org/data/2.5/weather?zip=${zipCode}&appid=${openWeatherApiKey}`
    const response = await fetch(mapUrl);
    const data = await response.json();
    return data.coord
}

async function callForecast5Api(lat, lon) {
    var forecast5Url = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${openWeatherApiKey}`
    const response = await fetch(forecast5Url);
    const weatherData = await response.json();
    return weatherData
}

async function callTodayWeatherApi(lat, lon) {
    var todayWeatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${openWeatherApiKey}`
    const response = await fetch(todayWeatherUrl);
    const weatherData = await response.json();
    return weatherData
}


function renderToday(data) {
    console.log("renderToday_________")
    var todaySection = $("#today")
    todaySection.empty()

    var div = $('<div>')
    var header = $('<h3>').text(`Today in ${data.name}`)
    var ul = createUlWithDayData(data)
    div.append(header, ul)
    todaySection.append(div)
}

function renderFiveDay(weatherData) {
    var fiveDayData = weatherData.list
    var fiveDaySection = $("#five-day")
    fiveDaySection.empty()
    for (i=0; i<weatherData.list.length; i+=8) {
        var day = weatherData.list[i]
        var date = day.dt_txt.split(" ")[0]
        var formattedDate = dayjs(date).format("MMM D")
        var dayOfWeek = dayjs(date).format('dddd')
        var div = $('<div>')
        var date = $('<h3>').text(`${dayOfWeek}, ${formattedDate}`)
        var ul = createUlWithDayData(day)
        div.append(date, ul)
        fiveDaySection.append(div)
    }
}

function createUlWithDayData(day) {
    var ul = $("<ul>")
    var iconImg = $("<img>").attr("src", `https://openweathermap.org/img/wn/${day.weather[0].icon}@2x.png`).css({
        'width': '45px',
        'height': '45px'  
    });
    var icon = $("<li>")
    var description = $("<li>").css({"font-family": "'Taviraj', serif", 'font-weight': 'bold'}).text((day.weather[0].description).toUpperCase())
    var temp = $("<li>").text(`Temperature: ${day.main.temp}`)
    var wind = $("<li>").text(`Wind Speed: ${day.wind.speed}`)
    var humidity = $("<li>").text(`Humidity: ${day.main.humidity}`)
    
    icon.append(iconImg)
    ul.append(icon, description, temp, wind, humidity)
    return ul
}


function addLocationToLocalStorage(zipCode, city) {
    var location = {zipCode:zipCode, city:city}

    var locationListWithPotentialDuplicates = getLocationListFromLocalStorage()
    
    locationListWithPotentialDuplicates.unshift(location)
    //?Written with assistance of AI tool.
    //inner function (findIndex) loops through the locationList objects and returns true for ones where the value is the same as the one selected in the outer loop. The index is retreived of first one that returns true. This index is compared to the index of the currently selected object in the outer loop. If they are not the same index (and we already know they are the same value because the inner loop checked for that), then it is a duplicate, and thus ought to return false to the filter method so that it is removed in the resulting array.
    let locationList = locationListWithPotentialDuplicates.filter((value, index, self) => 
    index === self.findIndex((t) => (t.city === value.city)))
    
    localStorage.setItem("locationList", JSON.stringify(locationList))
}

function getLocationListFromLocalStorage() {
    if (!localStorage.getItem("locationList")) {
        console.log("Creating a blank locationList")
        locationList = []
    } else {
        locationList = JSON.parse(localStorage.getItem("locationList"))
    }
    return locationList
}

function renderSearchHistory() {
    $("#search-history").empty()
    var locationList = getLocationListFromLocalStorage()
    var locationUlEl = $("<ul>")
    for (var location of locationList) {
        var locationLiEl = $("<li>").text(`${location.city} ${location.zipCode}`)
        locationUlEl.append(locationLiEl)
    }
    $("#search-history").append(locationUlEl)
}

async function searchAndRender(zipCode) {
    var coordinates = await getCoordsForZipCode(zipCode)
    var forecast5Data = await callForecast5Api(coordinates.lat, coordinates.lon)
    var todayWeatherData = await callTodayWeatherApi(coordinates.lat, coordinates.lon)
    console.log(todayWeatherData)
    var city = forecast5Data.city.name
    addLocationToLocalStorage(zipCode, city)
    renderSearchHistory()
    renderToday(todayWeatherData)
    renderFiveDay(forecast5Data)
}

$("button").on("click", () => {
    var zipCode = $("#zip-code").val()
    searchAndRender(zipCode)
})
$("#search-history").on("click", "ul li", (e)=>{
    var zipCode = e.target.textContent.split(" ")[1]
    searchAndRender(zipCode)
})

renderSearchHistory()

