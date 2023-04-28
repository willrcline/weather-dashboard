//! callWeatherAPI(s)
//! ToDo: render today forecast
//! ToDo: render each 5 day forecast box
//! ToDo: handleSearchButton
//! ToDo: addCityToLocalStorage
//! ToDo: renderSearchHistory


var openWeatherApiKey = "d9118cbb4158fd9329630940a9074c07"

async function getCoordsForZipCode(zipCode) {
    var mapUrl = `https://api.openweathermap.org/data/2.5/weather?zip=${zipCode}&appid=${openWeatherApiKey}`
    const response = await fetch(mapUrl);
    const data = await response.json();
    return data.coord
}

async function callWeatherApi(lat, lon) {
    var forecast5Url = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${openWeatherApiKey}`
    const response = await fetch(forecast5Url);
    const weatherData = await response.json();
    return weatherData
}

async function getWeatherData(zipCode) {
    var coordinates = await getCoordsForZipCode(zipCode)
    var weatherData = await callWeatherApi(coordinates.lat, coordinates.lon)
    return weatherData
}

function renderToday(weatherData) {
    var today = weatherData.list[0]
    var todaySection = $("#today")
    todaySection.empty()

    var div = $('<div>')
    var date = $('<h3>').text(`Today in ${weatherData.city.name}, ${today.dt_txt.split(" ")[0]}`)
    var ul = createUlWithDayData(today)
    div.append(date, ul)
    todaySection.append(div)
}

function renderFiveDay(weatherData) {
    
    var fiveDayData = weatherData.list.slice(1,6)
    var fiveDaySection = $("#five-day")
    fiveDaySection.empty()
    
    for (let day of fiveDayData) {
        var date = day.dt_txt.split(" ")[0]
        var dayOfWeek = dayjs(date).format('dddd')
        var div = $('<div>')
        var date = $('<h3>').text(`${dayOfWeek} ${date}`)
        var ul = createUlWithDayData(day)
        div.append(date, ul)
        fiveDaySection.append(div)
    }
}

function createUlWithDayData(day) {
    var ul = $("<ul>")
    var description = $("<li>").text(day.weather[0].description)
    // var iconImg = $("<img>")
    var temp = $("<li>").text(day.main.temp)
    var wind = $("<li>").text(day.wind.speed)
    var humidity = $("<li>").text(day.main.humidity)

    ul.append(description, temp, wind, humidity)
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
    console.log(locationList)
    
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
    var weatherData = await getWeatherData(zipCode)
    var city = weatherData.city.name
    console.log(zipCode, city)
    addLocationToLocalStorage(zipCode, city)
    renderSearchHistory()
    renderToday(weatherData)
    renderFiveDay(weatherData)
}

$("button").on("click", () => {
    var zipCode = $("#zip-code").val()
    searchAndRender(zipCode)
})
$("#search-history").on("click", "ul li", (e)=>{
    var zipCode = e.target.textContent.split(" ")[1]
    searchAndRender(zipCode)
})

// localStorage.setItem("locationList", JSON.stringify([]))
// var locationList = JSON.parse(localStorage.getItem("locationList"))
// locationList.unshift({zipCode:"78751", city:"Austin"})
// localStorage.setItem("locationList", JSON.stringify(locationList))

// console.log(getLocationListFromLocalStorage())
// localStorage.removeItem("locationList")
renderSearchHistory()
