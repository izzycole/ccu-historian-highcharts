var ccuHistorianHighchartsApp = angular.module('ccuHistorianHighchartsApp', ['angular-loading-bar', 'highcharts-ng', 'angularResizable', 'ngTouch', 'ui.bootstrap' ])
    .filter('objLength', function () {
        return function (obj) {
            if (typeof (obj) == 'object')
                return Object.keys(obj).length;
        };
    }).filter('inArray', function($filter){
        return function(list, arrayFilter, element){
            if(arrayFilter){
                return $filter("filter")(list, function(listItem){
                    return arrayFilter.indexOf(listItem[element].toString()) > -1;
                });
            } else {
                return list;
            }
        };
    })
    .controller('DatapointsCtrl', function ($scope, $http) {

        $scope.config = ChhConfig;
        $scope.showColumns = ChhConfig.ShowColumns;
        $scope.language = ChhLanguage.default;

        $scope.seriesOptions = [];
        $scope.currentSeries = false;
        $scope.jsonServiceUrl = ChhConfig.CcuHistorianHost+"/query/jsonrpc.gy";
        $scope.days = 7;

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
            xAxis: [{
              ordinal: false
            }],
            // different unit templates for y Axis
            yAxis: [
                {id: "default", labels: {format: '{value}'}},
                {id: "C", labels: {format: '{value}°C'}, minPadding: 1, maxPadding: 1},
                {id: "B", labels: {format: '{value}'},  ceiling: 1, max: 2, allowDecimals: false},
                {id: "V", labels: {format: '{value}V'}},
                {id: "P", labels: {format: '{value}%'}},
                {id: "W", labels: {format: '{value}W'}},
                {id: "WH", labels: {format: '{value}Wh'}},
                {id: "MA", labels: {format: '{value}mA'}},
                {id: "MIN", labels: {format: '{value}min'},allowDecimals: false},
            ],
            chart: {
                events: {
                    addSeries: function (event) {
                        // event when series is added
                    }
                },
                zoomType: 'xy'
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

                // load first favorite if available
                if(ChhConfig.favorites[0]){
                    $scope.loadFavorite(ChhConfig.favorites[0].ids);
                }
            });
        };

        // request time series by historian id
        $scope.getTimeSeries = function (idx) {
            if (typeof ($scope.chartOptions.series[idx]) !== "undefined") {
                // remove datapoint if already present (toggle mode)
                delete $scope.chartOptions.series[idx];
            } else {

                var startdate = $scope.startdate;
                if ($scope.startdate instanceof Date){
                   startdate =  Math.floor( $scope.startdate.getTime() );
                }
                var enddate = $scope.enddate;
                if ($scope.enddate instanceof Date){
                    enddate =  Math.floor( $scope.enddate.getTime() );
                }

                // reset
                $scope.chartOptions.series[idx] = {};

                var idx;
                var url = $scope.jsonServiceUrl + "?m=getTimeSeries&p1=" + idx + "&p2=" + startdate + "&p3=" + enddate;

                $http.get(url).then(function (response) {
                    var timeSeries = response.data.result;

                    // default series config
                    var yAxisId = "default";
                    var scale = 1;
                    var step = false;
                    var lineWidth = 1;
                    var markerEnabled = false;
                    var randomColor = Math.floor(Math.random() * (10 - 1) + 1);

                    // change series config to match datapoint prooerties
                    switch (timeSeries.dataPoint.attributes.unit) {

                        case 'min':
                             yAxisId = "MIN";
                             break;

                        case '100%':
                            scale = 100; //@TODO: find a way to scale
                            yAxisId = "P";
                            break;

                        case '%':
                            yAxisId = "P";
                            step = true;
                            break;

                        case 'W':
                            yAxisId = "W";
                            break;

                        case 'Wh':
                            yAxisId = "WH";
                            break;

                        case 'mA':
                            yAxisId = "MA";
                            break;

                        case '°C':
                            yAxisId = "C";
                            break;

                        case 'V':
                            yAxisId = "V";
                            break;
                    }

                    // apply line styles from config
                    if(ChhConfig.lineStyle.step.identifier.indexOf( timeSeries.dataPoint.id.identifier ) > -1)
                        step = true;

                    if(ChhConfig.lineStyle.step.type.indexOf( timeSeries.dataPoint.attributes.type ) > -1)
                        step = true;

                    if(ChhConfig.lineStyle.marker.identifier.indexOf( timeSeries.dataPoint.id.identifier) > -1) {
                        markerEnabled = true;
                        lineWidth = 0; //@TODO: line cant be hidden
                    }

                    if(ChhConfig.lineStyle.marker.type.indexOf( timeSeries.dataPoint.attributes.type) > -1) {
                        markerEnabled = true;
                        lineWidth = 0; //@TODO: line cant be hidden
                    }

                    var newSeries = {
                        id: idx,
                        name: timeSeries.dataPoint.attributes.displayName + '<br>' + timeSeries.dataPoint.id.identifier,
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

        $scope.loadFavorite = function(ids){
            $scope.resetSeries();
            $.each(ids, function (i, idx) {
                $scope.getTimeSeries(idx);
            });
        };

        $scope.changeFilter = function (key, value) {
            if (value[key] != null) {
                $scope.categoryFilter[key] = value[key];
            } else {
                delete $scope.categoryFilter[key];
            }
        };

        $scope.resetSeries = function () {
            $scope.chartOptions.series = {};
            $scope.currentSeries = false;
        };

        $scope.filterCurrent = function(){
            if($scope.currentSeries){
                $scope.currentSeries = false;
            } else {
                $scope.currentSeries = Object.keys($scope.chartOptions.series);
            }

        };

        $scope.updateSeries = function(){
            $.each($scope.chartOptions.series, function (idx,series) {
                delete $scope.chartOptions.series[idx];
                $scope.getTimeSeries(idx);

                // Update Datepicker
                $scope.startdateOptions.maxDate = $scope.enddate;
                $scope.enddateOptions.minDate = $scope.startdate;
            });
        };

        $scope.startdateOptions = {
            formatYear: 'yy',
            maxDate: $scope.enddate,
            minDate: false,
            startingDay: 1
        };

        $scope.enddateOptions = {
            formatYear: 'yy',
            maxDate: new Date(),
            minDate: $scope.startdate,
            startingDay: 1
        };

        $scope.toggleMin = function() {
          //  $scope.dateOptions.minDate = $scope.inlineOptions.minDate;
        };

        $scope.toggleMin();

        $scope.open1 = function() {
            $scope.popup1.opened = true;
        };

        $scope.open2 = function() {
            $scope.popup2.opened = true;
        };

        $scope.setDate = function(year, month, day) {
            $scope.dt = new Date(year, month, day);
        };

        $scope.format = 'dd.MM.yyyy';

        $scope.popup1 = {
            opened: false
        };

        $scope.popup2 = {
            opened: false
        };

        $scope.touchMove = function(target){
            var offset = 80;
            var pageY = $scope.$event.originalEvent.pageY;
            $(target)[0].style.flexBasis = pageY - offset + 'px';
            $scope.chartOptions.getChartObj().reflow();
        };

        $scope.$on("angular-resizable.resizing", function (event, args) {
            $scope.chartOptions.getChartObj().reflow();
        });

        $scope.touchEnd = function(){
            $scope.chartOptions.getChartObj().reflow();
        };

        $scope.init();

    });
