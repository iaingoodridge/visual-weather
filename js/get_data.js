// get the current URL parameters
var urlParams = new URLSearchParams(window.location.search);

// change the time format
function get_vega_time(d) {
	var datestring = d.split('T');
	var time = datestring[1].split(',')[0].split('+')[0];
	return datestring[0] + ' ' + time;
}

function getPointForecast(time_bundle) {
    var lat = Number(urlParams.get('lat'));
    var lon = Number(urlParams.get('lon'));
    if (lat < -90) {
        lat = lat + 180;
    } else if (lat > 90) {
        lat = lat - 180;
    }
    if (lon < -180) {
        lon = lon + 360;
    } else if (lon > 180) {
        lon = lon - 360;
    }
    document.getElementById("forecast_point_coords").innerHTML = 'Latitude: ' + lat + '<br>Longitude: ' + lon;
    document.getElementById("forecast_loc_name").innerHTML = urlParams.get('name');
    // console.log("Getting Weather Point Forecast for:", lat, lon)
    // build the route for the API call using the `lat` and `lon` URL parameters
    var url = "https://api.wx.spire.com/forecast/point?lat=" + lat + "&lon=" + lon;
    // specify the forecast time settings
    url += '&time_bundle=' + time_bundle;
    // specify the weather bundles
    var CUSTOM = false;
    var bundles = urlParams.get('bundles');
    if (bundles == null) {
        bundles = 'basic';
    } else if (bundles == 'custom') {
        CUSTOM = true;
        bundles = 'basic,renewable-energy';
    }
    url += '&bundles=' + bundles;
    // set boolean flags indicating which bundles are specified
    var BASIC = bundles.indexOf('basic') != -1;
    var MARITIME = bundles.indexOf('maritime') != -1;
    var RENEWABLE = bundles.indexOf('renewable-energy') != -1;

    fetch(url, {headers:{'spire-api-key':urlParams.get('token')}})
        .then((rawresp) => {
            return rawresp.json();
        })
        .then((response) => {
            // console.log(response);

            var tempscale = urlParams.get('tempscale');
            if (tempscale == null) {
                tempscale = 'C'
            } else {
                tempscale = tempscale.toUpperCase();
            }

            var precipunits;
            var heightunits;
            var speedunits;
            var unitsystem = urlParams.get('units');
            if (unitsystem != null && unitsystem.toLowerCase() == 'imperial') {
                unitsystem = 'imperial';
                precipunits = 'lb/sqft';
                heightunits = 'ft';
                speedunits = 'knots';
                // specify Fahrenheit here as well
                // so `tempscale` can be omitted
                tempscale = 'F';
            } else {
                unitsystem = 'metric';
                precipunits = 'kg/m2';
                heightunits = 'm';
                speedunits = 'm/s';
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
            // renewable-energy
            var re_air_temp_vals = [];
            var ne_wind_80m_vals = [];
            var ne_wind_100m_vals = [];
            var ne_wind_120m_vals = [];
            var surface_net_downward_shortwave_flux_vals = [];

            // iterate through the API response data
            // and build the output data structures
            for (var i = 0; i < response.data.length; i++) {

                var time = response.data[i].times.valid_time;

                if (BASIC) {
                    // add Basic Bundle variables
                    air_temp_vals.push({
                        'Time': get_vega_time(time),
                        'Value': parse_temperature(response.data[i].values.air_temperature, tempscale)
                    });
                    dew_point_temp_vals.push({
                        'Time': get_vega_time(time),
                        'Value': parse_temperature(response.data[i].values.dew_point_temperature, tempscale)
                    });
                    ne_wind_vals.push({
                        'Time': get_vega_time(time),
                        'Value': parse_speed(
                            parse_and_combine_velocity_vectors(
                                response.data[i].values.eastward_wind,
                                response.data[i].values.northward_wind
                            ),
                            speedunits
                        )
                    });
                    rel_hum_vals.push({
                        'Time': get_vega_time(time),
                        'Value': response.data[i].values.relative_humidity
                    });
                    air_press_sea_level_vals.push({
                        'Time': get_vega_time(time),
                        'Value': response.data[i].values.air_pressure_at_sea_level
                    });
                    wind_gust_vals.push({
                        'Time': get_vega_time(time),
                        'Value': parse_speed(response.data[i].values.wind_gust, speedunits)
                    });
                    precip_vals.push({
                        'Time': get_vega_time(time),
                        'Value': parse_precipitation(
                            parse_accumulated_value(response.data, 'precipitation_amount', i),
                            unitsystem
                        )
                    });
                }

                if (MARITIME) {
                    // add Maritime Bundle variables
                    sea_surface_temp_vals.push({
                        'Time': get_vega_time(time),
                        'Value': parse_temperature(response.data[i].values.sea_surface_temperature, tempscale)
                    });
                    wave_height_vals.push({
                        'Time': get_vega_time(time),
                        'Value': parse_height(response.data[i].values.sea_surface_wave_significant_height, heightunits)
                    });
                    northward_sea_velocity_vals.push({
                        'Time': get_vega_time(time),
                        'Value': parse_speed(response.data[i].values.northward_sea_water_velocity, speedunits)
                    });
                    eastward_sea_velocity_vals.push({
                        'Time': get_vega_time(time),
                        'Value': parse_speed(response.data[i].values.eastward_sea_water_velocity, speedunits)
                    });
                }

                if (RENEWABLE) {
                    // add Renewable Energy Bundle variables
                    re_air_temp_vals.push({
                        'Time': get_vega_time(time),
                        'Value': parse_temperature(response.data[i].values.air_temperature, tempscale)
                    });
                    ne_wind_80m_vals.push({
                        'Time': get_vega_time(time),
                        'Value': parse_speed(
                            parse_and_combine_velocity_vectors(
                                response.data[i].values.eastward_wind_80m,
                                response.data[i].values.northward_wind_80m
                            ),
                            speedunits
                        )
                    });
                    ne_wind_100m_vals.push({
                        'Time': get_vega_time(time),
                        'Value': parse_speed(
                            parse_and_combine_velocity_vectors(
                                response.data[i].values.eastward_wind_100m,
                                response.data[i].values.northward_wind_100m
                            ),
                            speedunits
                        )
                    });
                    ne_wind_120m_vals.push({
                        'Time': get_vega_time(time),
                        'Value': parse_speed(
                            parse_and_combine_velocity_vectors(
                                response.data[i].values.eastward_wind_120m,
                                response.data[i].values.northward_wind_120m
                            ),
                            speedunits
                        )
                    });
                    surface_net_downward_shortwave_flux_vals.push({
                        'Time': get_vega_time(time),
                        'Value': parse_accumulated_value(response.data, 'surface_net_downward_shortwave_flux', i)
                    });
                }

            }

            ////////////////////////////////////////////////
            ////////////////////////////////////////////////
            //// Embed the Vega visualizations into the DOM
            ////////////////////////////////////////////////
            ////////////////////////////////////////////////
            var color_scheme = urlParams.get('color_scheme');

            if (BASIC && !CUSTOM) {
                embed_vega_spec(
                    build_vega_spec(
                        'Air Temperature (' + tempscale + ')',
                        { 'values': air_temp_vals },
                        16, // warn threshold value
                        20, // alert threshold value
                        color_scheme
                    ),
                    '#air_temp'
                );
                embed_vega_spec(
                    build_vega_spec(
                        'Dew Point Temperature (' + tempscale + ')',
                        { 'values': dew_point_temp_vals },
                        7, // warn threshold value
                        9, // alert threshold value
                        color_scheme
                    ),
                    '#dew_point_temp'
                );
                embed_vega_spec(
                    build_vega_spec(
                        '10m Wind Speed (' + speedunits + ')',
                        { 'values': ne_wind_vals },
                        3, // warn threshold value
                        6, // alert threshold value
                        color_scheme
                    ),
                    '#ne_wind'
                );
                embed_vega_spec(
                    build_vega_spec(
                        'Relative Humidity (%)',
                        { 'values': rel_hum_vals },
                        30, // warn threshold value
                        60, // alert threshold value
                        color_scheme
                    ),
                    '#rel_hum'
                );
                embed_vega_spec(
                    build_vega_spec(
                        'Mean Sea Level Pressure (Pa)',
                        { 'values': air_press_sea_level_vals },
                        104000, // warn threshold value
                        103000, // alert threshold value
                        color_scheme
                    ),
                    '#air_press_sea_level'
                );
                embed_vega_spec(
                    build_vega_spec(
                        'Precipitation (' + precipunits + ')',
                        { 'values': precip_vals },
                        4, // warn threshold value
                        5, // alert threshold value
                        color_scheme
                    ),
                    '#precip'
                );
                embed_vega_spec(
                    build_vega_spec(
                        '10m Wind Gust (' + speedunits + ')',
                        { 'values': wind_gust_vals },
                        4, // warn threshold value
                        5, // alert threshold value
                        color_scheme
                    ),
                    '#wind_gust'
                );
            }

            if (MARITIME && !CUSTOM) {
                embed_vega_spec(
                    build_vega_spec(
                        'Sea Surface Temperature (' + tempscale + ')',
                        { 'values': sea_surface_temp_vals },
                        10, // warn threshold value
                        15, // alert threshold value
                        color_scheme
                    ),
                    '#sea_surface_temp'
                );
                embed_vega_spec(
                    build_vega_spec(
                        'Significant Wave Height (' + heightunits + ')',
                        { 'values': wave_height_vals },
                        4, // warn threshold value
                        5, // alert threshold value
                        color_scheme
                    ),
                    '#wave_height'
                );
                embed_vega_spec(
                    build_vega_spec(
                        'Northward Ocean Currents (' + speedunits + ')',
                        { 'values': northward_sea_velocity_vals },
                        0.15, // warn threshold value
                        0.2, // alert threshold value
                        color_scheme
                    ),
                    '#northward_sea_velocity'
                );
                embed_vega_spec(
                    build_vega_spec(
                        'Eastward Ocean Currents (' + speedunits + ')',
                        { 'values': eastward_sea_velocity_vals },
                        0.15, // warn threshold value
                        0.2, // alert threshold value
                        color_scheme
                    ),
                    '#eastward_sea_velocity'
                );
            }

            if (RENEWABLE && !CUSTOM) {
                if (!BASIC) {
                    // the basic bundle already includes this variable
                    // so don't show it twice if `basic` is specified too
                    embed_vega_spec(
                        build_vega_spec(
                            'Air Temperature (' + tempscale + ')',
                            { 'values': re_air_temp_vals },
                            16, // warn threshold value
                            20, // alert threshold value
                            color_scheme
                        ),
                        '#re_air_temp'
                    );
                }
                embed_vega_spec(
                    build_vega_spec(
                        '80m Wind Speed (' + speedunits + ')',
                        { 'values': ne_wind_80m_vals },
                        3, // warn threshold value
                        6, // alert threshold value
                        color_scheme
                    ),
                    '#ne_wind_80m'
                );
                embed_vega_spec(
                    build_vega_spec(
                        '100m Wind Speed (' + speedunits + ')',
                        { 'values': ne_wind_100m_vals },
                        3, // warn threshold value
                        6, // alert threshold value
                        color_scheme
                    ),
                    '#ne_wind_100m'
                );
                embed_vega_spec(
                    build_vega_spec(
                        '120m Wind Speed (' + speedunits + ')',
                        { 'values': ne_wind_120m_vals },
                        3, // warn threshold value
                        6, // alert threshold value
                        color_scheme
                    ),
                    '#ne_wind_120m'
                );
                embed_vega_spec(
                    build_vega_spec(
                        'Surface Net Downward Shortwave Flux',
                        { 'values': surface_net_downward_shortwave_flux_vals },
                        100000000, // warn threshold value
                        115000000, // alert threshold value
                        color_scheme
                    ),
                    '#surface_net_downward_shortwave_flux'
                );
            }

            if (CUSTOM) {
                // subset of basic variables
                embed_vega_spec(
                    build_vega_spec(
                        'Air Temperature (' + tempscale + ')',
                        { 'values': air_temp_vals },
                        16, // warn threshold value
                        20, // alert threshold value
                        color_scheme
                    ),
                    '#air_temp'
                );
                embed_vega_spec(
                    build_vega_spec(
                        'Dew Point Temperature (' + tempscale + ')',
                        { 'values': dew_point_temp_vals },
                        7, // warn threshold value
                        9, // alert threshold value
                        color_scheme
                    ),
                    '#dew_point_temp'
                );
                embed_vega_spec(
                    build_vega_spec(
                        'Relative Humidity (%)',
                        { 'values': rel_hum_vals },
                        30, // warn threshold value
                        60, // alert threshold value
                        color_scheme
                    ),
                    '#rel_hum'
                );
                embed_vega_spec(
                    build_vega_spec(
                        'Precipitation (' + precipunits + ')',
                        { 'values': precip_vals },
                        4, // warn threshold value
                        5, // alert threshold value
                        color_scheme
                    ),
                    '#precip'
                );
                embed_vega_spec(
                    build_vega_spec(
                        '10m Wind Gust (' + speedunits + ')',
                        { 'values': wind_gust_vals },
                        4, // warn threshold value
                        5, // alert threshold value
                        color_scheme
                    ),
                    '#wind_gust'
                );
                embed_vega_spec(
                    build_vega_spec(
                        '10m Wind Speed (' + speedunits + ')',
                        { 'values': ne_wind_vals },
                        3, // warn threshold value
                        6, // alert threshold value
                        color_scheme
                    ),
                    '#ne_wind'
                );
                // subset of renewable variables
                embed_vega_spec(
                    build_vega_spec(
                        '80m Wind Speed (' + speedunits + ')',
                        { 'values': ne_wind_80m_vals },
                        3, // warn threshold value
                        6, // alert threshold value
                        color_scheme
                    ),
                    '#ne_wind_80m'
                );
                embed_vega_spec(
                    build_vega_spec(
                        '100m Wind Speed (' + speedunits + ')',
                        { 'values': ne_wind_100m_vals },
                        3, // warn threshold value
                        6, // alert threshold value
                        color_scheme
                    ),
                    '#ne_wind_100m'
                );
                embed_vega_spec(
                    build_vega_spec(
                        '120m Wind Speed (' + speedunits + ')',
                        { 'values': ne_wind_120m_vals },
                        3, // warn threshold value
                        6, // alert threshold value
                        color_scheme
                    ),
                    '#ne_wind_120m'
                );
            }

            // reset cursor from spinning wheel to default
            document.getElementById('forecast_switch').style.cursor = 'pointer';
            document.body.style.cursor = 'default';
        });
    // end promise
}

// wait until the DOM is loaded before running this
document.addEventListener('DOMContentLoaded', function() {
    getPointForecast('medium_range_std_freq');
})