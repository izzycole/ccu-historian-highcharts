var ccuHistorianHighchartsApp = angular.module('ccuHistorianHighchartsApp', ['highcharts-ng', 'angularResizable'])
    .filter('objLength', function () {
        return function (obj) {
            if (typeof (obj) == 'object')
                return Object.keys(obj).length;
        };
    })

    .controller('DatapointsCtrl', function ($scope, $http) {

        $scope.showColumns = ChhConfig.ShowColumns;
        $scope.language = ChhLanguage.default;

        $scope.seriesOptions = [];
        $scope.jsonServiceUrl = ChhConfig.CcuHistorianHost+"/query/jsonrpc.gy";
        $scope.days = 7;

        //alert(ChhConfig);

        $scope.startdate = Date.now() - 60 * 60 * 24 * 1000 * $scope.days;
        $scope.enddate = Date.now();

        $scope.sortType = 'idx';        // set the default sort type
        $scope.sortReverse = false;     // set the default sort order
        $scope.searchWord = '';         // set the default search/filter term
        $scope.categoryFilter = {};

        $scope.dataPoints = [];
        $scope.distinctValues = [];

        $scope.chartOptions = {
            chartType: 'Stock',
            title: {
               // text: 'CCU Historian'
            },
            legend: {
                enabled: false,
                align: 'right',
                layout: 'vertical',
                verticalAlign: 'top',
                y: 100,
                shadow: true
            },
            // different unit templates for y Axis
            yAxis: [
                {id: "C", labels: {format: '{value}°C'}},
                {id: "B", labels: {format: '{value}'},  ceiling: 1, max: 1, allowDecimals: false},
                {id: "V", labels: {format: '{value}V'}},
                {id: "P", labels: {format: '{value}%'}},
                {id: "W", labels: {format: '{value}W'}},
                {id: "MIN", labels: {format: '{value}min'},allowDecimals: false},
            ],
            chart: {
                events: {
                    addSeries: function (event) {
                        // event when series is added
                    }
                }
            },
            series: {},
            rangeSelector: {
                // no date inputs
                buttons: [],
                inputEnabled: false
            }
        };

        Highcharts.setOptions({
            lang: ChhLanguage.default.highcharts,
            global: {
                useUTC: false,
                timezoneOffset: 4
            }

        });


        $scope.$on("angular-resizable.resizing", function (event, args) {
            $scope.chartOptions.getChartObj().reflow();
        });


        $scope.init = function () {

            // get all Datapoints
            var url = $scope.jsonServiceUrl + "?m=getDataPoint";
            $http.get(url).then(function (response) {
                var distinct = {};

                $.each(response.data.result, function (i, e) {

                    // No Stings and hidden (in historian) dataPoints
                    if (e.attributes.type != "STRING" && e.historyHidden === false) {

                        // Flatten dataPoint
                        dataPoint = Object.assign(e.id, e.attributes, {idx: e.idx});
                        $scope.dataPoints.push(dataPoint);

                        // Process dataPoints
                        $.each(dataPoint, function (key, value) {

                            if(value != null){

                                // Translate default values
                                if(ChhLanguage.default.historian[value]){
                                    value = ChhLanguage.default.historian[value];
                                    dataPoint[key] = value;
                                }

                                //Collect distinct values for filters
                                if (!distinct[key]) distinct[key] = [];
                                if (distinct[key].indexOf(value) < 0) distinct[key].push(value);
                            }


                        });

                    } else {
                        if(e.attributes.displayName == 'HighchartsConfig'){
                            //@TODO read config / set config in CCU systemvariable
                        }
                    }
                });

                $scope.distinctValues = distinct;
              //  $scope.getTimeSeries(178);
              //  $scope.getTimeSeries(199);
            });
        };

        // request time series by historian id
        $scope.getTimeSeries = function (idx) {
            if (typeof ($scope.chartOptions.series[idx]) !== "undefined") {
                // remove datapoint if already present (toggle mode)
                delete $scope.chartOptions.series[idx];
            } else {

                // reset
                $scope.chartOptions.series[idx] = {};

                // set start / enddate
                $scope.startdate = Date.now() - 60 * 60 * 24 * 1000 * $scope.days;
                $scope.enddate = Date.now();

                var idx;
                var url = $scope.jsonServiceUrl + "?m=getTimeSeries&p1=" + idx + "&p2=" + $scope.startdate + "&p3=" + $scope.enddate;

                $http.get(url).then(function (response) {
                    var timeSeries = response.data.result;

                    // default series config
                    var yAxisId = "W";
                    var scale = 1;
                    var step = false;
                    var lineWidth = 1;
                    var markerEnabled = false;
                    var randomColor = Math.floor(Math.random() * (10 - 1) + 1);

                    // change series config to match datapoint prooerties
                    switch (timeSeries.dataPoint.attributes.unit) {

                        case 'min':
                             yAxisId = "MIN";
                             step = true;
                             break;

                        case '100%':
                            scale = 100;
                            yAxisId = "P";
                            step = true;
                            break;

                        case '%':
                            yAxisId = "P";
                            step = true;
                            break;

                        case 'W':
                            yAxisId = "W";
                            break;

                        case '°C':
                            yAxisId = "C";
                            break;

                        case 'V':
                            yAxisId = "V";
                            break;
                    }

                    switch (timeSeries.dataPoint.attributes.type) {
                        case 'BOOL':
                            step = true;
                            yAxisId = "B";
                            break;

                        case 'ACTION':
                            yAxisId = "B";
                            lineWidth = 0;
                            markerEnabled = true; // points for eg. pressed switches
                            break;
                    }

                    var newSeries = {
                        id: idx,
                        name: timeSeries.dataPoint.attributes.displayName, // + '<br>' + timeSeries.dataPoint.attributes.control,
                        data: [],
                        color: randomColor,
                        className: 'color-'+randomColor,
                        lineWidth: lineWidth,
                        marker: {
                            enabled: markerEnabled,
                            radius: 4
                        },
                        states: {
                            hover: {
                                lineWidthPlus: lineWidth
                            }
                        },
                        step: step,
                        yAxis: yAxisId,
                        tooltip: {
                            valueDecimals: 2,
                            pointFormat: '<div>{series.name}: {point.y}' + timeSeries.dataPoint.attributes.unit + '</div><br>',
                        }
                    }

                    // add timestamps
                    $.each(timeSeries.values, function (i, e) {
                        newSeries.data.push([timeSeries.timestamps[i], e]);
                    });

                    // add Series to chart
                    $scope.chartOptions.series[idx] = newSeries;

                });
            }


        };

        $scope.orderTableBy = function (key) {

            if ($scope.sortType == key)
                $scope.sortReverse = !$scope.sortReverse;

            $scope.sortType = key;

        }

        $scope.changeFilter = function (key, value) {
            if (value[key] != null) {
                $scope.categoryFilter[key] = value[key];
            } else {
                delete $scope.categoryFilter[key];
            }
        }

        $scope.resetSeries = function () {
            $scope.chartOptions.series = {};
        }

        $scope.updateSeries = function(){
            $.each($scope.chartOptions.series, function (idx,series) {
                delete $scope.chartOptions.series[idx];
                $scope.getTimeSeries(idx);
            });
        }

        $scope.init();

    });
