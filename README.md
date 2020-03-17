# Usage

### URL Parameters

	lat (required): latitude of point forecast

	lon (required): longitude of point forecast

	token (required): Spire Weather API token

	name (optional): name of location

	bundles (optional): "basic,maritime,renewable-energy" or a subset of the three (default = basic)

	tempscale (optional): "C" for Celsius, "F" for Fahrenheit, "K" for Kelvin (default = Celsius)

	units (optional): "imperial" for Imperial (including Fahrenheit), otherwise Metric


### Example

https://elliott-spire.github.io/visual-weather/?name=Dotsero&lat=39.66061&lon=-107.0350&token=[YOURTOKEN]

![](docs/screenshot.png)

# Future Improvements

Support local timezones

Support different time bundles (currently only `medium_range_std_freq`):
	
	short_range_high_freq
	medium_range_high_freq
	medium_range_std_freq

Support switching between Fahrenheit and Celsius