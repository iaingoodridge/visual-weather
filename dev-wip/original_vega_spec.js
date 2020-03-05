function get_vega_spec(data) {
  var vega_spec = {
    "config": {"view": {"width": 400, "height": 300}, "mark": {"tooltip": null}},
    "vconcat": [
      {
        "data": {
          "url": "https://vega.github.io/vega-datasets/data/seattle-weather.csv",
          "format": {"type": "csv"}
        },
        "mark": "tick",
        "encoding": {
          "color": {"type": "nominal", "field": "weather"},
          "x": {"type": "temporal", "field": "date", "title": null},
          "y": {"type": "nominal", "field": "weather"}
        },
        "height": 70,
        "selection": {
          "selector007": {
            "type": "interval",
            "encodings": ["x"],
            "on": "[mousedown, window:mouseup] > window:mousemove!",
            "translate": "[mousedown, window:mouseup] > window:mousemove!",
            "zoom": "wheel!",
            "mark": {"fill": "#333", "fillOpacity": 0.125, "stroke": "white"},
            "resolve": "global"
          }
        },
        "width": 600
      },
      {
        "vconcat": [
          {
            "layer": [
              {
                "data": {
                  "url": "https://vega.github.io/vega-datasets/data/seattle-weather.csv",
                  "format": {"type": "csv"}
                },
                "mark": {"type": "line", "interpolate": "basis"},
                "encoding": {
                  "x": {"type": "temporal", "field": "date", "title": null},
                  "y": {"type": "quantitative", "field": "precipitation"}
                },
                "transform": [{"filter": {"selection": "selector007"}}]
              },
              {
                "data": {
                  "url": "https://vega.github.io/vega-datasets/data/seattle-weather.csv",
                  "format": {"type": "csv"}
                },
                "mark": "point",
                "encoding": {
                  "opacity": {"value": 0},
                  "x": {"type": "temporal", "field": "date", "title": null}
                },
                "selection": {
                  "selector008": {
                    "type": "single",
                    "nearest": true,
                    "on": "mouseover",
                    "encodings": ["x"],
                    "empty": "none",
                    "resolve": "global"
                  }
                },
                "transform": [{"filter": {"selection": "selector007"}}]
              },
              {
                "data": {
                  "url": "https://vega.github.io/vega-datasets/data/seattle-weather.csv",
                  "format": {"type": "csv"}
                },
                "mark": "point",
                "encoding": {
                  "opacity": {
                    "condition": {"value": 1, "selection": "selector008"},
                    "value": 0
                  },
                  "x": {"type": "temporal", "field": "date", "title": null},
                  "y": {"type": "quantitative", "field": "precipitation"}
                },
                "transform": [{"filter": {"selection": "selector007"}}]
              },
              {
                "data": {
                  "url": "https://vega.github.io/vega-datasets/data/seattle-weather.csv",
                  "format": {"type": "csv"}
                },
                "mark": {"type": "rule", "color": "gray"},
                "encoding": {
                  "x": {"type": "temporal", "field": "date", "title": null}
                },
                "transform": [
                  {"filter": {"selection": "selector008"}},
                  {"filter": {"selection": "selector007"}}
                ]
              },
              {
                "data": {
                  "url": "https://vega.github.io/vega-datasets/data/seattle-weather.csv",
                  "format": {"type": "csv"}
                },
                "mark": {"type": "text", "align": "left", "dx": 5, "dy": -5},
                "encoding": {
                  "text": {
                    "condition": {
                      "type": "quantitative",
                      "field": "precipitation",
                      "selection": "selector008"
                    },
                    "value": " "
                  },
                  "x": {"type": "temporal", "field": "date", "title": null},
                  "y": {"type": "quantitative", "field": "precipitation"}
                },
                "transform": [{"filter": {"selection": "selector007"}}]
              }
            ],
            "height": 70,
            "width": 600
          },
          {
            "layer": [
              {
                "data": {
                  "url": "https://vega.github.io/vega-datasets/data/seattle-weather.csv",
                  "format": {"type": "csv"}
                },
                "mark": {"type": "line", "interpolate": "basis"},
                "encoding": {
                  "x": {"type": "temporal", "field": "date", "title": null},
                  "y": {"type": "quantitative", "field": "temp_max"}
                },
                "transform": [{"filter": {"selection": "selector007"}}]
              },
              {
                "data": {
                  "url": "https://vega.github.io/vega-datasets/data/seattle-weather.csv",
                  "format": {"type": "csv"}
                },
                "mark": "point",
                "encoding": {
                  "opacity": {"value": 0},
                  "x": {"type": "temporal", "field": "date", "title": null}
                },
                "selection": {
                  "selector008": {
                    "type": "single",
                    "nearest": true,
                    "on": "mouseover",
                    "encodings": ["x"],
                    "empty": "none",
                    "resolve": "global"
                  }
                },
                "transform": [{"filter": {"selection": "selector007"}}]
              },
              {
                "data": {
                  "url": "https://vega.github.io/vega-datasets/data/seattle-weather.csv",
                  "format": {"type": "csv"}
                },
                "mark": "point",
                "encoding": {
                  "opacity": {
                    "condition": {"value": 1, "selection": "selector008"},
                    "value": 0
                  },
                  "x": {"type": "temporal", "field": "date", "title": null},
                  "y": {"type": "quantitative", "field": "temp_max"}
                },
                "transform": [{"filter": {"selection": "selector007"}}]
              },
              {
                "data": {
                  "url": "https://vega.github.io/vega-datasets/data/seattle-weather.csv",
                  "format": {"type": "csv"}
                },
                "mark": {"type": "rule", "color": "gray"},
                "encoding": {
                  "x": {"type": "temporal", "field": "date", "title": null}
                },
                "transform": [
                  {"filter": {"selection": "selector008"}},
                  {"filter": {"selection": "selector007"}}
                ]
              },
              {
                "data": {
                  "url": "https://vega.github.io/vega-datasets/data/seattle-weather.csv",
                  "format": {"type": "csv"}
                },
                "mark": {"type": "text", "align": "left", "dx": 5, "dy": -5},
                "encoding": {
                  "text": {
                    "condition": {
                      "type": "quantitative",
                      "field": "temp_max",
                      "selection": "selector008"
                    },
                    "value": " "
                  },
                  "x": {"type": "temporal", "field": "date", "title": null},
                  "y": {"type": "quantitative", "field": "temp_max"}
                },
                "transform": [{"filter": {"selection": "selector007"}}]
              }
            ],
            "height": 70,
            "width": 600
          },
          {
            "layer": [
              {
                "data": {
                  "url": "https://vega.github.io/vega-datasets/data/seattle-weather.csv",
                  "format": {"type": "csv"}
                },
                "mark": {"type": "line", "interpolate": "basis"},
                "encoding": {
                  "x": {"type": "temporal", "field": "date", "title": null},
                  "y": {"type": "quantitative", "field": "temp_min"}
                },
                "transform": [{"filter": {"selection": "selector007"}}]
              },
              {
                "data": {
                  "url": "https://vega.github.io/vega-datasets/data/seattle-weather.csv",
                  "format": {"type": "csv"}
                },
                "mark": "point",
                "encoding": {
                  "opacity": {"value": 0},
                  "x": {"type": "temporal", "field": "date", "title": null}
                },
                "selection": {
                  "selector008": {
                    "type": "single",
                    "nearest": true,
                    "on": "mouseover",
                    "encodings": ["x"],
                    "empty": "none",
                    "resolve": "global"
                  }
                },
                "transform": [{"filter": {"selection": "selector007"}}]
              },
              {
                "data": {
                  "url": "https://vega.github.io/vega-datasets/data/seattle-weather.csv",
                  "format": {"type": "csv"}
                },
                "mark": "point",
                "encoding": {
                  "opacity": {
                    "condition": {"value": 1, "selection": "selector008"},
                    "value": 0
                  },
                  "x": {"type": "temporal", "field": "date", "title": null},
                  "y": {"type": "quantitative", "field": "temp_min"}
                },
                "transform": [{"filter": {"selection": "selector007"}}]
              },
              {
                "data": {
                  "url": "https://vega.github.io/vega-datasets/data/seattle-weather.csv",
                  "format": {"type": "csv"}
                },
                "mark": {"type": "rule", "color": "gray"},
                "encoding": {
                  "x": {"type": "temporal", "field": "date", "title": null}
                },
                "transform": [
                  {"filter": {"selection": "selector008"}},
                  {"filter": {"selection": "selector007"}}
                ]
              },
              {
                "data": {
                  "url": "https://vega.github.io/vega-datasets/data/seattle-weather.csv",
                  "format": {"type": "csv"}
                },
                "mark": {"type": "text", "align": "left", "dx": 5, "dy": -5},
                "encoding": {
                  "text": {
                    "condition": {
                      "type": "quantitative",
                      "field": "temp_min",
                      "selection": "selector008"
                    },
                    "value": " "
                  },
                  "x": {"type": "temporal", "field": "date", "title": null},
                  "y": {"type": "quantitative", "field": "temp_min"}
                },
                "transform": [{"filter": {"selection": "selector007"}}]
              }
            ],
            "height": 70,
            "width": 600
          },
          {
            "layer": [
              {
                "data": {
                  "url": "https://vega.github.io/vega-datasets/data/seattle-weather.csv",
                  "format": {"type": "csv"}
                },
                "mark": {"type": "line", "interpolate": "basis"},
                "encoding": {
                  "x": {"type": "temporal", "field": "date", "title": null},
                  "y": {"type": "quantitative", "field": "wind"}
                },
                "transform": [{"filter": {"selection": "selector007"}}]
              },
              {
                "data": {
                  "url": "https://vega.github.io/vega-datasets/data/seattle-weather.csv",
                  "format": {"type": "csv"}
                },
                "mark": "point",
                "encoding": {
                  "opacity": {"value": 0},
                  "x": {"type": "temporal", "field": "date", "title": null}
                },
                "selection": {
                  "selector008": {
                    "type": "single",
                    "nearest": true,
                    "on": "mouseover",
                    "encodings": ["x"],
                    "empty": "none",
                    "resolve": "global"
                  }
                },
                "transform": [{"filter": {"selection": "selector007"}}]
              },
              {
                "data": {
                  "url": "https://vega.github.io/vega-datasets/data/seattle-weather.csv",
                  "format": {"type": "csv"}
                },
                "mark": "point",
                "encoding": {
                  "opacity": {
                    "condition": {"value": 1, "selection": "selector008"},
                    "value": 0
                  },
                  "x": {"type": "temporal", "field": "date", "title": null},
                  "y": {"type": "quantitative", "field": "wind"}
                },
                "transform": [{"filter": {"selection": "selector007"}}]
              },
              {
                "data": {
                  "url": "https://vega.github.io/vega-datasets/data/seattle-weather.csv",
                  "format": {"type": "csv"}
                },
                "mark": {"type": "rule", "color": "gray"},
                "encoding": {
                  "x": {"type": "temporal", "field": "date", "title": null}
                },
                "transform": [
                  {"filter": {"selection": "selector008"}},
                  {"filter": {"selection": "selector007"}}
                ]
              },
              {
                "data": {
                  "url": "https://vega.github.io/vega-datasets/data/seattle-weather.csv",
                  "format": {"type": "csv"}
                },
                "mark": {"type": "text", "align": "left", "dx": 5, "dy": -5},
                "encoding": {
                  "text": {
                    "condition": {
                      "type": "quantitative",
                      "field": "wind",
                      "selection": "selector008"
                    },
                    "value": " "
                  },
                  "x": {"type": "temporal", "field": "date", "title": null},
                  "y": {"type": "quantitative", "field": "wind"}
                },
                "transform": [{"filter": {"selection": "selector007"}}]
              }
            ],
            "height": 70,
            "width": 600
          }
        ]
      }
    ],
    "$schema": "https://vega.github.io/schema/vega-lite/v2.6.0.json"
  }
  return vega_spec;
}