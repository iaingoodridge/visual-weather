function parse_temperature(data, tempscale) {
    var temp;
    var temp_kelvin = data;
    if (tempscale == 'F') {
        temp = (temp_kelvin - 273.15) * 9/5 + 32; // Kelvin to Fahrenheit
    } else if (tempscale == 'K') {
        temp = temp_kelvin; // Kelvin
    } else {
        temp = temp_kelvin - 273.15; // Kelvin to Celsius
    }
    return temp;
}

function parse_speed(data, units) {
    if (units == 'knots') {
        data = data * 1.94384; // m/s to knots
    }
    return data;
}

function parse_height(data, units) {
    if (units == 'ft') {
        data = data * 3.28084; // m to ft
    }
    return data;
}

function parse_precipitation(data, units) {
    // if (units == 'lb/sqft') {
    //     data = data * 0.204816; // kg/m2 to lb/sqft
    // }
    if (units == 'imperial') {
        // kg/m2 = mm for liquid precipitation
        // so here we convert from mm to in
        data = data * 0.0393701;
    }
    return data;
}

// get wind (or ocean currents) speed from U and V velocity components
function get_speed_from_u_v(u, v) {
    return Math.sqrt(Math.pow(u, 2) + Math.pow(v, 2))
}

// get wind (or ocean currents) direction from U and V velocity components
function get_direction_from_u_v(u, v) {
    // Meteorological wind direction
    //   90° corresponds to wind from east,
    //   180° from south
    //   270° from west
    //   360° wind from north.
    //   0° is used for no wind.
    if ((u, v) == (0.0, 0.0)) {
        return 0.0
    } else {
        return (180.0 / Math.PI) * Math.atan2(u, v) + 180.0;
    }
}

// subtract previous data value from current value
// since raw value is accumulated over all time
// and we want each bar in the graph to be the value for that time window only
function parse_accumulated_value(data, name, i) {
    var curval;
    if (i != 0) {
        var previous = data[i - 1].values[name];
        curval = data[i].values[name] - previous;
    } else {
        curval = data[i].values[name];
    }
    return curval;
}