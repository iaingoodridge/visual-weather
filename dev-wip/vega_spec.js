function get_vega_spec(data) {
  var vega_spec = {
    "config": {"view": {"width": 400, "height": 300}, "mark": {"tooltip": null}},
  // this block contains the top graph with range selection
    "vconcat": [
      {
        "data": data,
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
  // this block contains the line graphs, vertically concatenated
      {
        "vconcat": [
          {
  // this block specifies the first line graph
            "layer": [
              {
                "data": data,
                "mark": {"type": "line", "interpolate": "basis"},
                "encoding": {
                  "x": {"type": "temporal", "field": "date", "title": null},
                  "y": {"type": "quantitative", "field": "precipitation"}
                },
                "transform": [{"filter": {"selection": "selector007"}}]
              },
          //  this block implements the mouseover behavior for this specific line graph
              {
                "data": data,
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
          // this is the circle/point that shows up with the vertical line on mouseover
              {
                "data": data,
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
          // this is the vertical line that shows up on mouseover
              {
                "data": data,
                "mark": {"type": "rule", "color": "gray"},
                "encoding": {
                  "x": {"type": "temporal", "field": "date", "title": null}
                },
                "transform": [
                  {"filter": {"selection": "selector008"}},
                  {"filter": {"selection": "selector007"}}
                ]
              },
          // this is the text value next to the vertical line + pointer on mouseover
              {
                "data": data,
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
              },
        // this block creates the red portion above the threshold of the line chart
              {
                  "mark": {"type": "line", "interpolate": "basis"},
                  "transform": [
                      {
                          "filter": "datum.precipitation >= 20" //+ String(threshold_val) //"datum.Value >= 60"
                      },
                      {
                          "calculate": "20", //String(threshold_val), // "60",
                          "as": "baseline"
                      }
                  ],
                  "encoding": {
                      "x": {
                        // "timeUnit": "yearmonthdatehours",
                          "field": "date",
                          "type": "temporal"
                      },
                      "y": {
                          "field": "baseline",
                          "type": "quantitative"
                      },
                      // "tooltip": {
                      //   "field": "Value",
                      //   "type": "quantitative"
                      // },
                      "y2": {
                          "field": "precipitation"
                      },
                      "color": {
                          "value": "#e45755" // red
                      }
                  }
                },
          // this block draw the horizontal threshold line
            {
              "data": {
                  "values": [
                      {
                          "ThresholdValue": 20, //60,
                          "Threshold": "",// "hazardous",
                      }
                  ]
              },
              "layer": [
                  {
                      "mark": "rule",
                      "encoding": {
                          "y": {
                              "field": "ThresholdValue",
                              "type": "quantitative"
                          },
                          "color": {
                              "value": "#e45755" // red
                          }
                      }
                  },
                // this is the text label for the horizontal threshold line 
                  {
                      "mark": {
                          "type": "text",
                          "align": "right",
                          "baseline": "bottom",
                          "dx": -2,
                          "dy": -2
                      },
                      "encoding": {
                          "x": {
                              "value": "width"
                          },
                          "y": {
                              "field": "ThresholdValue",
                              "type": "quantitative",
                              "axis": {
                                  "title": "precipitation"  // this is the y axis title that gets displayed, to prevent multiple values
                              }
                          },
                          "text": {
                              "field": "Threshold",
                              "type": "ordinal"
                          },
                          "color": {
                              "value": "#8b0000" // dark red
                          }
                      }
                  }
              ]
          }
            ],
            "height": 70,
            "width": 600
          },
  // this block specifies the second line graph
          {
            "layer": [
              {
                "data": data,
                "mark": {"type": "line", "interpolate": "basis"},
                "encoding": {
                  "x": {"type": "temporal", "field": "date", "title": null},
                  "y": {"type": "quantitative", "field": "temp_max"}
                },
                "transform": [{"filter": {"selection": "selector007"}}]
              },
              {
                "data": data,
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
                "data": data,
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
                "data": data,
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
                "data": data,
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
  // this block specifies the third line graph
          {
            "layer": [
              {
                "data": data,
                "mark": {"type": "line", "interpolate": "basis"},
                "encoding": {
                  "x": {"type": "temporal", "field": "date", "title": null},
                  "y": {"type": "quantitative", "field": "temp_min"}
                },
                "transform": [{"filter": {"selection": "selector007"}}]
              },
              {
                "data": data,
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
                "data": data,
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
                "data": data,
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
                "data": data,
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
  // this block specifies the fourth line graph
          {
            "layer": [
              {
                "data": data,
                "mark": {"type": "line", "interpolate": "basis"},
                "encoding": {
                  "x": {"type": "temporal", "field": "date", "title": null},
                  "y": {"type": "quantitative", "field": "wind"}
                },
                "transform": [{"filter": {"selection": "selector007"}}]
              },
              {
                "data": data,
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
                "data": data,
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
                "data": data,
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
                "data": data,
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