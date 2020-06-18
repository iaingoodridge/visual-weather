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
        // get experimental air column wind value
        getAirColumnForecast(time_bundle, lat, lon);
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

            var data = response.data;

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
                precipunits = 'in';
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
            var wind_speed_vals = [];
            var wind_dir_vals = [];
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
            var wind_speed_80m_vals = [];
            var wind_speed_100m_vals = [];
            var wind_speed_120m_vals = [];
            var wind_dir_80m_vals = [];
            var wind_dir_100m_vals = [];
            var wind_dir_120m_vals = [];
            var surface_net_downward_shortwave_flux_vals = [];

            // iterate through the API response data
            // and build the output data structures
            for (var i = 0; i < data.length; i++) {

                var valid_time = data[i].times.valid_time;
                var valid_time_vega_format = get_vega_time(valid_time);

                if (BASIC) {
                    // add Basic Bundle variables
                    air_temp_vals.push({
                        'Time': valid_time_vega_format,
                        'Value': parse_temperature(data[i].values.air_temperature, tempscale)
                    });
                    dew_point_temp_vals.push({
                        'Time': valid_time_vega_format,
                        'Value': parse_temperature(data[i].values.dew_point_temperature, tempscale)
                    });
                    wind_speed_vals.push({
                        'Time': valid_time_vega_format,
                        'Value': parse_speed(
                            get_speed_from_u_v(
                                data[i].values.eastward_wind,
                                data[i].values.northward_wind
                            ),
                            speedunits
                        )
                    });
                    wind_dir_vals.push({
                        'Time': valid_time_vega_format,
                        'Value': get_direction_from_u_v(
                            data[i].values.eastward_wind,
                            data[i].values.northward_wind
                        )
                    });
                    rel_hum_vals.push({
                        'Time': valid_time_vega_format,
                        'Value': data[i].values.relative_humidity
                    });
                    air_press_sea_level_vals.push({
                        'Time': valid_time_vega_format,
                        'Value': data[i].values.air_pressure_at_sea_level
                    });
                    wind_gust_vals.push({
                        'Time': valid_time_vega_format,
                        'Value': parse_speed(data[i].values.wind_gust, speedunits)
                    });
                    precip_vals.push({
                        'Time': valid_time_vega_format,
                        'Value': parse_precipitation(
                            parse_accumulated_value(data, 'precipitation_amount', i),
                            unitsystem
                        )
                    });
                }

                if (MARITIME) {
                    // add Maritime Bundle variables
                    sea_surface_temp_vals.push({
                        'Time': valid_time_vega_format,
                        'Value': parse_temperature(data[i].values.sea_surface_temperature, tempscale)
                    });
                    wave_height_vals.push({
                        'Time': valid_time_vega_format,
                        'Value': parse_height(data[i].values.sea_surface_wave_significant_height, heightunits)
                    });
                    northward_sea_velocity_vals.push({
                        'Time': valid_time_vega_format,
                        'Value': parse_speed(data[i].values.northward_sea_water_velocity, speedunits)
                    });
                    eastward_sea_velocity_vals.push({
                        'Time': valid_time_vega_format,
                        'Value': parse_speed(data[i].values.eastward_sea_water_velocity, speedunits)
                    });
                }

                if (RENEWABLE) {
                    // add Renewable Energy Bundle variables
                    re_air_temp_vals.push({
                        'Time': valid_time_vega_format,
                        'Value': parse_temperature(data[i].values.air_temperature, tempscale)
                    });
                    wind_speed_80m_vals.push({
                        'Time': valid_time_vega_format,
                        'Value': parse_speed(
                            get_speed_from_u_v(
                                data[i].values.eastward_wind_80m,
                                data[i].values.northward_wind_80m
                            ),
                            speedunits
                        )
                    });
                    wind_speed_100m_vals.push({
                        'Time': valid_time_vega_format,
                        'Value': parse_speed(
                            get_speed_from_u_v(
                                data[i].values.eastward_wind_100m,
                                data[i].values.northward_wind_100m
                            ),
                            speedunits
                        )
                    });
                    wind_speed_120m_vals.push({
                        'Time': valid_time_vega_format,
                        'Value': parse_speed(
                            get_speed_from_u_v(
                                data[i].values.eastward_wind_120m,
                                data[i].values.northward_wind_120m
                            ),
                            speedunits
                        )
                    });
                    wind_dir_80m_vals.push({
                        'Time': valid_time_vega_format,
                        'Value': get_direction_from_u_v(
                            data[i].values.eastward_wind_80m,
                            data[i].values.northward_wind_80m
                        )
                    });
                    wind_dir_100m_vals.push({
                        'Time': valid_time_vega_format,
                        'Value': get_direction_from_u_v(
                            data[i].values.eastward_wind_100m,
                            data[i].values.northward_wind_100m
                        )
                    });
                    wind_dir_120m_vals.push({
                        'Time': valid_time_vega_format,
                        'Value': get_direction_from_u_v(
                            data[i].values.eastward_wind_120m,
                            data[i].values.northward_wind_120m
                        )
                    });
                    surface_net_downward_shortwave_flux_vals.push({
                        'Time': valid_time_vega_format,
                        'Value': parse_accumulated_value(data, 'surface_net_downward_shortwave_flux', i)
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
                        (unitsystem == 'metric' ? '10m Wind Speed' : '30ft Wind Speed') + ' (' + speedunits + ')',
                        { 'values': wind_speed_vals },
                        3, // warn threshold value
                        6, // alert threshold value
                        color_scheme
                    ),
                    '#wind_speed'
                );
                embed_vega_spec(
                    build_vega_spec(
                        (unitsystem == 'metric' ? '10m Wind Direction' : '30ft Wind Direction') + ' (' + speedunits + ')',
                        { 'values': wind_dir_vals },
                        null, // warn threshold value
                        null, // alert threshold value
                        color_scheme
                    ),
                    '#wind_speed'
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
                        (unitsystem == 'metric' ? '10m Wind Gust' : '30ft Wind Gust') + ' (' + speedunits + ')',
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
                        (unitsystem == 'metric' ? '80m Wind Speed' : '260ft Wind Speed') + ' (' + speedunits + ')',
                        { 'values': wind_speed_80m_vals },
                        3, // warn threshold value
                        6, // alert threshold value
                        color_scheme
                    ),
                    '#wind_speed_80m'
                );
                embed_vega_spec(
                    build_vega_spec(
                        (unitsystem == 'metric' ? '80m Wind Direction' : '260ft Wind Direction') + ' (' + speedunits + ')',
                        { 'values': wind_dir_80m_vals },
                        null, // warn threshold value
                        null, // alert threshold value
                        color_scheme
                    ),
                    '#wind_dir_80m'
                );
                embed_vega_spec(
                    build_vega_spec(
                        (unitsystem == 'metric' ? '100m Wind Speed' : '330ft Wind Speed') + ' (' + speedunits + ')',
                        { 'values': wind_speed_100m_vals },
                        3, // warn threshold value
                        6, // alert threshold value
                        color_scheme
                    ),
                    '#wind_speed_100m'
                );
                embed_vega_spec(
                    build_vega_spec(
                        (unitsystem == 'metric' ? '100m Wind Direction' : '330ft Wind Direction') + ' (' + speedunits + ')',
                        { 'values': wind_dir_100m_vals },
                        null, // warn threshold value
                        null, // alert threshold value
                        color_scheme
                    ),
                    '#wind_dir_100m'
                );
                embed_vega_spec(
                    build_vega_spec(
                        (unitsystem == 'metric' ? '120m Wind Speed' : '390ft Wind Speed') + ' (' + speedunits + ')',
                        { 'values': wind_speed_120m_vals },
                        3, // warn threshold value
                        6, // alert threshold value
                        color_scheme
                    ),
                    '#wind_speed_120m'
                );
                embed_vega_spec(
                    build_vega_spec(
                        (unitsystem == 'metric' ? '120m Wind Direction' : '390ft Wind Direction') + ' (' + speedunits + ')',
                        { 'values': wind_dir_80m_vals },
                        null, // warn threshold value
                        null, // alert threshold value
                        color_scheme
                    ),
                    '#wind_dir_120m'
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
                        null, // warn threshold value
                        null, // alert threshold value
                        color_scheme
                    ),
                    '#air_temp'
                );
                embed_vega_spec(
                    build_vega_spec(
                        'Dew Point Temperature (' + tempscale + ')',
                        { 'values': dew_point_temp_vals },
                        null, // warn threshold value
                        null, // alert threshold value
                        color_scheme
                    ),
                    '#dew_point_temp'
                );
                embed_vega_spec(
                    build_vega_spec(
                        'Relative Humidity (%)',
                        { 'values': rel_hum_vals },
                        null, // warn threshold value
                        null, // alert threshold value
                        color_scheme
                    ),
                    '#rel_hum'
                );
                embed_vega_spec(
                    build_vega_spec(
                        'Precipitation (' + precipunits + ')',
                        { 'values': precip_vals },
                        2, // warn threshold value
                        4, // alert threshold value
                        color_scheme
                    ),
                    '#precip'
                );
                embed_vega_spec(
                    build_vega_spec(
                        (unitsystem == 'metric' ? '10m Wind Gust' : '30ft Wind Gust') + ' (' + speedunits + ')',
                        { 'values': wind_gust_vals },
                        25, // warn threshold value
                        35, // alert threshold value
                        color_scheme
                    ),
                    '#wind_gust'
                );
                embed_vega_spec(
                    build_vega_spec(
                        (unitsystem == 'metric' ? '10m Wind Speed' : '30ft Wind Speed') + ' (' + speedunits + ')',
                        { 'values': wind_speed_vals },
                        25, // warn threshold value
                        35, // alert threshold value
                        color_scheme
                    ),
                    '#wind_speed'
                );
                embed_vega_spec(
                    build_vega_spec(
                        (unitsystem == 'metric' ? '10m Wind Direction' : '30ft Wind Direction') + ' (degrees)',
                        { 'values': wind_dir_vals },
                        null, // warn threshold value
                        null, // alert threshold value
                        color_scheme
                    ),
                    '#wind_dir'
                );
                // subset of renewable variables
                embed_vega_spec(
                    build_vega_spec(
                        (unitsystem == 'metric' ? '80m Wind Speed' : '260ft Wind Speed') + ' (' + speedunits + ')',
                        { 'values': wind_speed_80m_vals },
                        25, // warn threshold value
                        35, // alert threshold value
                        color_scheme
                    ),
                    '#wind_speed_80m'
                );
                embed_vega_spec(
                    build_vega_spec(
                        (unitsystem == 'metric' ? '80m Wind Direction' : '260ft Wind Direction') + ' (degrees)',
                        { 'values': wind_dir_80m_vals },
                        null, // warn threshold value
                        null, // alert threshold value
                        color_scheme
                    ),
                    '#wind_dir_80m'
                );
                embed_vega_spec(
                    build_vega_spec(
                        (unitsystem == 'metric' ? '100m Wind Speed' : '330ft Wind Speed') + ' (' + speedunits + ')',
                        { 'values': wind_speed_100m_vals },
                        25, // warn threshold value
                        35, // alert threshold value
                        color_scheme
                    ),
                    '#wind_speed_100m'
                );
                embed_vega_spec(
                    build_vega_spec(
                        (unitsystem == 'metric' ? '100m Wind Direction' : '330ft Wind Direction') + ' (degrees)',
                        { 'values': wind_dir_100m_vals },
                        null, // warn threshold value
                        null, // alert threshold value
                        color_scheme
                    ),
                    '#wind_dir_100m'
                );
                embed_vega_spec(
                    build_vega_spec(
                        (unitsystem == 'metric' ? '120m Wind Speed' : '390ft Wind Speed') + ' (' + speedunits + ')',
                        { 'values': wind_speed_120m_vals },
                        25, // warn threshold value
                        35, // alert threshold value
                        color_scheme
                    ),
                    '#wind_speed_120m'
                );
                embed_vega_spec(
                    build_vega_spec(
                        (unitsystem == 'metric' ? '120m Wind Direction' : '390ft Wind Direction') + ' (degrees)',
                        { 'values': wind_dir_80m_vals },
                        null, // warn threshold value
                        null, // alert threshold value
                        color_scheme
                    ),
                    '#wind_dir_120m'
                );
            }

            // reset cursor from spinning wheel to default
            document.getElementById('forecast_switch').style.cursor = 'pointer';
            document.body.style.cursor = 'default';
        });
    // end promise
}

function getAirColumnForecast(time_bundle, lat, lon) {
    // unique URL endpoint using sof-x product
    var url = "https://api.wx.spire.com/forecast/point?lat=" + lat + "&lon=" + lon;
    url += "&product=sof-x&bundles=balloon&time_bundle=" + time_bundle;
    fetch(url, {headers:{'spire-api-key':urlParams.get('token')}})
        .then((rawresp) => {
            return rawresp.json();
        })
        .then((response) => {

            var data = response.data;

            // console.log('max_wind_speed_within_air_column', data);

            // hardcode speed units for custom application
            var speedunits = 'knots';

            var max_wind_speed_within_air_column_vals = [];
            // iterate through the API response data
            // and build the output data structures
            for (var i = 0; i < data.length; i++) {

                var valid_time = data[i].times.valid_time;
                var valid_time_vega_format = get_vega_time(valid_time);

                max_wind_speed_within_air_column_vals.push({
                    'Time': valid_time_vega_format,
                    'Value': parse_speed(data[i].values.max_wind_speed_within_air_column, speedunits)
                });
            }
            ////////////////////////////////////////////////
            //// Embed the Vega visualizations into the DOM
            ////////////////////////////////////////////////
            var color_scheme = urlParams.get('color_scheme');

            embed_vega_spec(
                build_vega_spec(
                    'Max Wind Speed 0 to 3000 ft (' + speedunits + ')',
                    { 'values': max_wind_speed_within_air_column_vals },
                    45, // warn threshold value
                    55, // alert threshold value
                    color_scheme
                ),
                '#max_wind_speed_within_air_column'
            );
        });
    // end promise
}

// wait until the DOM is loaded before running this
document.addEventListener('DOMContentLoaded', function() {
    getPointForecast('medium_range_std_freq');
})