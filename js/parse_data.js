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

// combine eastward_wind and northward_wind vector components
function parse_and_combine_velocity_vectors(u, v) {
    var dir = ""
    if (Math.abs(u) < 0.001 && Math.abs(v) < 0.001) {
        dir = 0
    } else {
        dir = Math.round(Math.sqrt(Math.pow(u, 2) + Math.pow(v, 2)));
        //dir = Math.round(Math.sqrt(Math.pow(u, 2) + Math.pow(v, 2))) + "mph, direction " + Math.round(Math.atan2(u, v) * ((180 / Math.PI) + 180));
    }
    return dir;
}