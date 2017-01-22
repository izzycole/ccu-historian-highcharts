# ccu-historian-highcharts

Aim of this project is to provide a responsive/touch enabled frontend for the [ccu-historian](https://github.com/mdzio/ccu-historian) based on [angularjs](https://angularjs.org/) and [highcharts](https://github.com/highcharts/highcharts).

This is very basic state based on my private homematic setup. Please feel free to suggest improvements or request features.

# Installation

1. Copy contents of "dist/" to a webserver or into the "webapp/custom/" direcory of your historian installation.
2. Edit congig.js to your needs
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
        //'type',
        //'interfaceId',
        //'defaultValue',
        'idx'
    ],
    "favorites": [
        {
            title: "Wohnzimmer",
            ids: [178, 199]
        },
        {
            title: "Büro",
            ids: [147,149,322]
        }
    ]
}

```


