// get the current URL parameters
var urlParams = new URLSearchParams(window.location.search);

// change the time format
function get_vega_time(d) {
	var datestring = d.split("T");
	var time = datestring[1].split(",")[0].split("+")[0];
	return datestring[0] + ' ' + time;
}

// combine eastward_wind and northward_wind vector components
function windstring(u, v) {
    var dir = ""
    if (Math.abs(u) < .001 && Math.abs(v) < 0.001) {
        dir = 0
    } else {
        dir = Math.round(Math.sqrt(Math.pow(u, 2) + Math.pow(v, 2)));
        //dir = Math.round(Math.sqrt(Math.pow(u, 2) + Math.pow(v, 2))) + "mph, direction " + Math.round(Math.atan2(u, v) * ((180 / Math.PI) + 180));
    }
    return dir
}

// wait until the DOM is loaded before running this
document.addEventListener("DOMContentLoaded", function() {

    // build the route for the API call using the `lat` and `lon` URL parameters
    var url = "https://api.wx.spire.com/forecast/point?lat=" + urlParams.get('lat') + "&lon=" + urlParams.get('lon') + "&time_bundle=medium_range_std_freq";
    // execute the API call using the `token` URL parameter
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.open("GET", url, false);
    xmlHttp.setRequestHeader("spire-api-key", urlParams.get('token'));
    xmlHttp.send(null);
    var response = JSON.parse(xmlHttp.responseText);
    // var name = urlParams.get('name');
    // console.log(response.data.length)
    // console.log(response.data)

    // initialize arrays to store output data
    var air_temp_vals = [];
    var dew_point_temp_vals = [];
    var ne_wind_vals = [];
    var rel_hum_vals = [];
    var air_press_sea_level_vals = [];
    var precip_vals = [];
    var wind_gust_vals = [];

    // iterate through the API response data
    // and build the output data structures
    for (var i = 0; i < response.data.length; i++) {

    	var time = response.data[i].times.valid_time;

    	var air_temp = response.data[i].values.air_temperature - 273.15; // Kelvin to Celsius
    	air_temp_vals.push({
    		'Time': get_vega_time(time),
    		'Value': air_temp,
    	});

    	var dew_point_temp = response.data[i].values.dew_point_temperature - 273.15; // Kelvin to Celsius
    	dew_point_temp_vals.push({
    		'Time': get_vega_time(time),
    		'Value': dew_point_temp,
    	});

    	var ne_wind = windstring(response.data[i].values.eastward_wind, response.data[i].values.northward_wind);
    	ne_wind_vals.push({
    		'Time': get_vega_time(time),
    		'Value': ne_wind,
    	});

    	var rel_hum = response.data[i].values.relative_humidity;
    	rel_hum_vals.push({
    		'Time': get_vega_time(time),
    		'Value': rel_hum, // Math.round(rel_hum / 10)
    	});

    	var air_press_sea_level = response.data[i].values.air_pressure_at_sea_level;
    	air_press_sea_level_vals.push({
    		'Time': get_vega_time(time),
    		'Value': air_press_sea_level // / 10000
    	});

    	var precip = response.data[i].values.precipitation_amount;
    	precip_vals.push({
    		'Time': get_vega_time(time),
    		'Value': precip,
    	});

    	var wind_gust = response.data[i].values.wind_gust;
    	wind_gust_vals.push({
    		'Time': get_vega_time(time),
    		'Value': wind_gust,
    	});

        // ------------------------------------------------------------------------------------------------------------

        //config.data.datasets[1].data.push(Math.round(response.data[i].values.sea_surface_temperature - 273.15));

        //config.data.datasets[3].data.push(Math.round(response.data[i].values.sea_surface_wave_significant_height));
        //config.data.datasets[4].data.push(response.data[i].values.air_pressure_at_sea_level / 10000);

        // html += '<tr  class="bg-primary"><td><b>' + response.data[i].times.valid_time.replace('T', "  ") + ' UTC</b></td></tr><tr><td>';
        // html = html + "Sea Temp: " + Math.round(response.data[i].values.sea_surface_temperature - 273.15) + ' C</td></tr><tr><td>';
        // html = html + "Waves: " + Math.round(response.data[i].values.sea_surface_wave_significant_height) + 'm</td></tr><tr><td>';
        // //html = html + "Seas: " + windstring(response.data[i].values.eastward_sea_water_velocity, response.data[i].values.northward_sea_water_velocity) + '<br>'
        // //html = html + response.data[i].values.northward_sea_water_velocity + ' UTC<br>';
        // //html = html + response.data[i].values.eastward_sea_water_velocity + ' UTC<br>';
        // html = html + "BP: " + Math.round(response.data[i].values.air_pressure_at_sea_level) + ' Pa</td></tr><tr><td>';
        // html = html + "RH: " + Math.round(response.data[i].values.relative_humidity) + '%</td></tr><tr><td>';
        // html = html + "Air Temp: " + Math.round(response.data[i].values.air_temperature - 273.15) + ' C</td></tr><tr><td>';
        // html = html + "Dew Temp: " + Math.round(response.data[i].values.dew_point_temperature - 273.15) + ' C</td></tr><tr><td>';
        // html = html + "Winds: " + windstring(response.data[i].values.eastward_wind, response.data[i].values.northward_wind) + '</td></tr><tr><td>';
        // html = html + "Precip: " + Math.round(response.data[i].values.precipitation_amount * 1000) / 1000 + ' in</td></tr>';

        // ------------------------------------------------------------------------------------------------------------

    }

    ////////////////////////////////////////////////
    ////////////////////////////////////////////////
    //// Embed the Vega visualizations into the DOM
    ////////////////////////////////////////////////
    ////////////////////////////////////////////////

    embed_vega_spec(
    	build_vega_spec(
    		'Air Temperature (C)',
    		{ 'values': air_temp_vals },
            16, // warn threshold value
    		20 // alert threshold value
    	),
    	'#air_temp'
    );

    embed_vega_spec(
    	build_vega_spec(
    		'Dew Point Temperature (C)',
    		{ 'values': dew_point_temp_vals },
            7, // warn threshold value
    		9 // alert threshold value
    	),
    	'#dew_point_temp'
    );

    embed_vega_spec(
    	build_vega_spec(
    		'Wind Speed (m/s)',
    		{ 'values': ne_wind_vals },
            3, // warn threshold value
    		6 // alert threshold value
    	),
    	'#ne_wind'
    );

    embed_vega_spec(
    	build_vega_spec(
    		'Relative Humidity',
    		{ 'values': rel_hum_vals },
            30, // warn threshold value
    		60 // alert threshold value
    	),
    	'#rel_hum'
    );

   	embed_vega_spec(
    	build_vega_spec(
    		'Mean Sea Level Pressure',
    		{ 'values': air_press_sea_level_vals },
            104000, // warn threshold value
    		103000 // alert threshold value
    	),
    	'#air_press_sea_level'
    );

    embed_vega_spec(
    	build_vega_spec(
    		'Precipitation',
    		{ 'values': precip_vals },
            4, // warn threshold value
    		5 // alert threshold value
    	),
    	'#precip'
    );

    embed_vega_spec(
    	build_vega_spec(
    		'Wind Gust',
    		{ 'values': wind_gust_vals },
            4, // warn threshold value
    		5 // alert threshold value
    	),
    	'#wind_gust'
    );
})