# ccu-historian-highcharts

Aim of this project is to provide a responsive/touch enabled frontend for the [ccu-historian](https://github.com/mdzio/ccu-historian) based on [angularjs](https://angularjs.org/) and [highcharts](https://github.com/highcharts/highcharts).

This is very basic state based on my private homematic setup. Please feel free to suggest improvements or request features.

# Installation

1. Copy contents of "dist/" to a webserver or into the "webapp/custom/" direcory of your historian installation.
2. Edit config.js to your needs
	1. Insert IP-Address and Port of your ccu-historian server 
	2. Uncomment Colums to show them in the data-points table
	3. Add Favorties to the Main-Menu. Take ids from "idx" column
3. Open index.html in Browser 

# Configuration

Configuration sample:

```
var ChhConfig = {
    "CcuHistorianHost": "http://192.168.1.57:81",
    "ShowColumns": [
        //'address',
        'displayName',
        'room',
        'identifier',
        //'preprocType',
        //'preprocParam',
        'function',
        //'comment',
        //'paramSet',
        //'tabOrder',
        //'maximum',
        'unit',
        //'minimum',
        //'control',
        //'operations',
        //'flags',
        'type',
        //'interfaceId',
        //'defaultValue',
        'idx'
    ],
    "lineStyle": {
        "step": {
            "identifier": [
                'SET_TEMPERATURE',
                'VALVE_STATE'
            ],
            "type": [
                'BOOL',
                'ACTION',
                'ALARM'
            ]
        },
        "marker": {
            "identifier": [
                'PRESS_SHORT',
                'PRESS_LONG'
            ],
            "type": [
                'ACTION',
                'ALARM'
            ]
        },
    },
    "favorites": [
        {
            title: "Wohnzimmer",
            ids: [178, 107]
        },
        {
            title: "Büro",
            ids: [147, 149, 322]
        }
    ]
}


``` 

![](./ccu-historian-highcharts.png?raw=true)