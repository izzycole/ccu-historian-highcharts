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
