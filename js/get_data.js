// get the current URL parameters
var urlParams = new URLSearchParams(window.location.search);

// change the time format
function get_vega_time(d) {
	var datestring = d.split('T');
	var time = datestring[1].split(',')[0].split('+')[0];
	return datestring[0] + ' ' + time;
}

function getPointForecast(time_bundle) {
    // build the route for the API call using the `lat` and `lon` URL parameters
    var url = 'https://api.wx.spire.com/forecast/point?lat=' + urlParams.get('lat') + '&lon=' + urlParams.get('lon');
    // specify the forecast time settings
    url += '&time_bundle=' + time_bundle;
    // specify the weather bundles
    var bundles = urlParams.get('bundle');
    if (bundles == null) {
        bundles = 'basic';
    }
    url += '&bundles=' + bundles;
    // set boolean flags indicating which bundles are specified
    var BASIC = bundles.indexOf('basic') != -1;
    var MARITIME = bundles.indexOf('maritime') != -1;
    // TODO: support both!
    if (BASIC) {
        MARITIME = false;
    }

    // execute the API call using the `token` URL parameter
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.open('GET', url, false);
    xmlHttp.setRequestHeader('spire-api-key', urlParams.get('token'));
    xmlHttp.send(null);
    var response = JSON.parse(xmlHttp.responseText);
    console.log(response)
    // var name = urlParams.get('name');
    // console.log(response.data.length)
    // console.log(response.data)

    var tempscale = urlParams.get('tempscale');
    if (tempscale == null) {
        tempscale = 'C'
    } else {
        tempscale = tempscale.toUpperCase();
    }

    // initialize arrays to store output data

    // basic
    var air_temp_vals = [];
    var dew_point_temp_vals = [];
    var ne_wind_vals = [];
    var rel_hum_vals = [];
    var air_press_sea_level_vals = [];
    var precip_vals = [];
    var wind_gust_vals = [];
    // maritime
    var sea_surface_temp_vals = [];
    var wave_height_vals = [];
    var northward_sea_velocity_vals = [];
    var eastward_sea_velocity_vals = [];

    // iterate through the API response data
    // and build the output data structures
    for (var i = 0; i < response.data.length; i++) {

        var time = response.data[i].times.valid_time;

        if (BASIC) {
            // add Basic Bundle variables
            air_temp_vals.push({
                'Time': get_vega_time(time),
                'Value': parse_temperature(response.data[i].values.air_temperature, tempscale),
            });
            dew_point_temp_vals.push({
                'Time': get_vega_time(time),
                'Value': parse_temperature(response.data[i].values.dew_point_temperature, tempscale),
            });
            ne_wind_vals.push({
                'Time': get_vega_time(time),
                'Value': parse_and_combine_velocity_vectors(
                    response.data[i].values.eastward_wind,
                    response.data[i].values.northward_wind
                ),
            });
            rel_hum_vals.push({
                'Time': get_vega_time(time),
                'Value': response.data[i].values.relative_humidity,
            });
            air_press_sea_level_vals.push({
                'Time': get_vega_time(time),
                'Value': response.data[i].values.air_pressure_at_sea_level
            });
            precip_vals.push({
                'Time': get_vega_time(time),
                'Value': response.data[i].values.precipitation_amount,
            });
            wind_gust_vals.push({
                'Time': get_vega_time(time),
                'Value': response.data[i].values.wind_gust,
            });
        }

        if (MARITIME) {
            // add Maritime Bundle variables
            sea_surface_temp_vals.push({
                'Time': get_vega_time(time),
                'Value': parse_temperature(response.data[i].values.sea_surface_temperature, tempscale),
            });
            wave_height_vals.push({
                'Time': get_vega_time(time),
                'Value': response.data[i].values.sea_surface_wave_significant_height
            });
            northward_sea_velocity_vals.push({
                'Time': get_vega_time(time),
                'Value': response.data[i].values.northward_sea_water_velocity
            });
            eastward_sea_velocity_vals.push({
                'Time': get_vega_time(time),
                'Value': response.data[i].values.eastward_sea_water_velocity
            });
        }
    }

    ////////////////////////////////////////////////
    ////////////////////////////////////////////////
    //// Embed the Vega visualizations into the DOM
    ////////////////////////////////////////////////
    ////////////////////////////////////////////////

    if (BASIC) {
        embed_vega_spec(
            build_vega_spec(
                'Air Temperature (' + tempscale + ')',
                { 'values': air_temp_vals },
                16, // warn threshold value
                20 // alert threshold value
            ),
            '#air_temp'
        );
        embed_vega_spec(
            build_vega_spec(
                'Dew Point Temperature (' + tempscale + ')',
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
    }

    if (MARITIME) {
        embed_vega_spec(
            build_vega_spec(
                'Sea Surface Temperature (' + tempscale + ')',
                { 'values': sea_surface_temp_vals },
                10, // warn threshold value
                15 // alert threshold value
            ),
            '#sea_surface_temp'
        );
        embed_vega_spec(
            build_vega_spec(
                'Significant Wave Height',
                { 'values': wave_height_vals },
                4, // warn threshold value
                5 // alert threshold value
            ),
            '#wave_height'
        );
        embed_vega_spec(
            build_vega_spec(
                'Northward Sea Water Velocity', // (m/s) ?
                { 'values': northward_sea_velocity_vals },
                0.15, // warn threshold value
                0.2 // alert threshold value
            ),
            '#northward_sea_velocity'
        );
        embed_vega_spec(
            build_vega_spec(
                'Eastward Sea Water Velocity', // (m/s) ?
                { 'values': eastward_sea_velocity_vals },
                0.15, // warn threshold value
                0.2 // alert threshold value
            ),
            '#eastward_sea_velocity'
        );
    }
}

// wait until the DOM is loaded before running this
document.addEventListener('DOMContentLoaded', function() {
    getPointForecast('medium_range_std_freq');
})