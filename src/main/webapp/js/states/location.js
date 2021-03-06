angular.module("safedeals.states.location", [])
        .config(function ($stateProvider, templateRoot) {
            $stateProvider.state('main.location', {
                'url': '/location/?:locationMinBudget?:locationMaxBudget?:propertyDetails?:numberOfRooms?:cityId?',
                'params': {locationMinBudget: null, locationMaxBudget: null, propertyDetails: null, numberOfRooms: null, cityId: null},
                'templateUrl': templateRoot + '/location/location.html',
                'controller': 'LocationController'
            });
            $stateProvider.state("main.location_detail", {
                'url': '/:locationId/location_detail',
                'templateUrl': templateRoot + '/location/location_detail.html',
                'controller': 'LocationDetailController'
            });
            $stateProvider.state("main.location.location_comparison", {
                'url': '/location_comparison',
                'templateUrl': templateRoot + '/location/location_comparison.html',
                'controller': 'LocationComparisionController'
            });
        })

        .controller('LocationController', function ($scope, $anchorScroll, $location, $state, $filter, PriceRangeService, PropertyService, LocationService, $stateParams, MarketPriceService, CityService, StateService) {
            $scope.gotoTop = function () {
                $location.hash('top');
                $anchorScroll();
            };
            console.log("State Params :%O", $stateParams);
            $scope.hideCompareButton = true;
            $scope.hideSutaibleLocation = true;
            $scope.hideDescription = true;
            if ($stateParams.cityId !== null) {
                console.log("inside This Thing");
                CityService.get({
                    'id': $stateParams.cityId
                }, function (cityObject) {
                    $scope.cityName = cityObject.name;
                    $scope.cityId = cityObject.id;
                    $scope.city = cityObject;
                    StateService.get({
                        'id': cityObject.stateId
                    }, function (stateObject) {
                        $scope.stateName = stateObject.name;
                        $scope.stateId = stateObject.id;
                        $scope.state = stateObject;
                    });

                    var propertyDetails = parseInt($stateParams.propertyDetails, 10);
                    console.log("Property Details in INT :%O", propertyDetails);

                    var minimumBudget = parseInt($stateParams.locationMinBudget * propertyDetails);
                    var maximumBudget = parseInt($stateParams.locationMaxBudget * propertyDetails);

                    console.log("Min Budget :%O", minimumBudget);
                    console.log("Max Budget :%O", maximumBudget);

                    $scope.searchPropertySize = $stateParams.propertyDetails;
                    if ($stateParams.propertyDetails === "600") {
                        $scope.propertySize = "1 BHK";
                    } else if ($stateParams.propertyDetails === "1000") {
                        $scope.propertySize = "2 BHK";
                    } else if ($stateParams.propertyDetails === "1500") {
                        $scope.propertySize = "3 BHK";
                    } else if ($stateParams.propertyDetails === "2000") {
                        $scope.propertySize = "4 BHK";
                    } else {
                        $scope.propertySize = "0 BHK";
                    }
                    $scope.hideDescription = false;
                });
            }
            $scope.validateForm = function (cityName, minBudget, maxBudget, propertySize) {
                console.log("Min Budget :" + minBudget);
                console.log("Max Budget :" + maxBudget);
                var difference = maxBudget - minBudget;
                console.log("Difference :" + difference);
                if (difference < 0) {
                    alert("Minimum budget is more than maximum budget, Select correct value.");
                } else {
                    $scope.searchLocationByLocationAndBudget(cityName, minBudget, maxBudget, propertySize);
                }

            };
            $scope.selectLocation = function (location) {
                $scope.propertySize;
                if ($stateParams.propertyDetails === "600") {
                    $scope.propertySize = 1;
                } else if ($stateParams.propertyDetails === "1000") {
                    $scope.propertySize = 2;
                } else if ($stateParams.propertyDetails === "1500") {
                    $scope.propertySize = 3;
                } else if ($stateParams.propertyDetails === "2000") {
                    $scope.propertySize = 4;
                }
//                var minBudget = $("#minBudget").val();
//                var maxBudget = $("#maxBudget").val();
                console.log("Min Budget :%O", $scope.minBudget);
                console.log("Max Budget :%O", $scope.maxBudget);
                var minBudget = $scope.minBudget;
                var maxBudget = $scope.maxBudget;
                $state.go('main.property', {
                    cityId: $scope.cityId,
                    locationId: location.id,
                    propertySize: $scope.propertySize,
                    minBudget: minBudget,
                    maxBudget: maxBudget
                });
            };
            $scope.searchLocationByLocationAndBudget = function (cityName, minBudget, maxBudget, propertySize) {
                console.log("property:" + propertySize);
                console.log("City Id :" + cityName);
                console.log("Min Budget :" + minBudget);
                console.log("Max Budget :" + maxBudget);
                $scope.cityObject = CityService.findByCityName({
                    'name': cityName
                });
                console.log("City Object :%O", $scope.cityObject);
                $state.go('main.location', {
                    locationMinBudget: minBudget / propertySize,
                    locationMaxBudget: maxBudget / propertySize,
                    propertyDetails: propertySize,
                    cityId: $scope.cityId
                });
            };
            var map;
            var mapContainer = document.getElementById("locationMapContainer");
            var nagpurCoordinate = new google.maps.LatLng(21.1458, 79.0882);
            var mapProp = {
                center: nagpurCoordinate,
                zoom: 4,
                mapTypeId: google.maps.MapTypeId.ROADMAP
            };
            var drawMap = function () {
                console.log("Priop :%O", mapProp);
                map = new google.maps.Map(mapContainer, mapProp);
            };
            $scope.locations = [];
            $scope.searchStates = function (searchTerm) {
                return StateService.findByNameLike({
                    'name': searchTerm
                }).$promise;
            };
            $scope.selectState = function (state) {

                $scope.stateName = state.name;
                $scope.stateId = state.id;
                $scope.state = state;
            };
            $scope.minBudgetList = PriceRangeService.findAllList();
            $scope.maxBudgetList = PriceRangeService.findAllList();
            console.log("Min Budghet List :%O", $scope.minBudgetList);
            $scope.$watch('minBudget', function (data) {
                console.log("Data", data);
                PriceRangeService.findByMinBudget({
                    'minBudget': data
                }, function (priceRange) {
                    console.log("Price Range :%O", priceRange);
                    $scope.maxBudgetList = priceRange;
                });
            });
            $scope.searchCities = function (searchTerm) {
                console.log("State Id :%O", $scope.stateId);
                if ($scope.stateId === undefined) {
                    return CityService.findByNameLike({
                        'name': searchTerm
                    }).$promise;
                } else {
                    return CityService.findByNameAndStateId({
                        'name': searchTerm,
                        'stateId': $scope.stateId
                    }).$promise;
                }
            };
            $scope.selectCity = function (city) {

                console.log("City :%O", city);
                $scope.cityName = city.name;
                $scope.cityId = city.id;
                $scope.city = city;
            };
            drawMap();
            console.log("Location Min Budget :%O", $stateParams.locationMinBudget);
            if ($stateParams.locationMinBudget !== null) {
                console.log("StateParams :%O", $stateParams);
                console.log("In If Loop");
                CityService.get({
                    'id': $scope.cityId                   // cityId is hard coded for 1.0 version
                }, function (city) {
                    map.setCenter({
                        lat: city.latitude,
                        lng: city.longitude
                    });
                    map.setZoom(13);
                });
                console.log("City Id :%O", $stateParams.cityId);
                console.log("Min Budget :%O", $stateParams.locationMinBudget);
                console.log("Max Budget :%O", $stateParams.locationMaxBudget);
                MarketPriceService.findByRequirement({
                    'cityId': $stateParams.cityId, // cityId is hard coded for 1.0 version
                    'locationMinBudget': Math.round($stateParams.locationMinBudget),
                    'locationMaxBudget': Math.round($stateParams.locationMaxBudget)
                }, function (mpObjects) {
                    console.log("$scope.mpObjects =  %O", mpObjects);
                    angular.forEach(mpObjects, function (mpObject) {
                        LocationService.get({
                            'id': mpObject.locationId
                        }, function (location) {
                            location.marketPrice = mpObject.mpResidentialAverage;
//                            location.flag = false;
                            $scope.locations.push(location);
                            console.log("Locations :%O", location);
                            drawMarker({lat: location.latitude, lng: location.longitude}, location.name, map);
                            var myCity = new google.maps.Circle({
                                center: new google.maps.LatLng(location.latitude, location.longitude),
                                radius: 750,
                                strokeColor: "#87C4C2",
                                strokeOpacity: 0.8,
                                strokeWeight: 2,
                                fillColor: "#C1E6E5",
                                fillOpacity: 0.2,
                                zoom: 13
                            });
                            myCity.setMap(map);
                            myCity.setMap(map);
                            myCity.setMap(map);
                            map.fitBounds(myCity.getBounds());
//                            myCity.setZoom(13);
                        });
                    });
                    $scope.$watch("locations", function (n, o) {
                        $scope.selectedLocationList = $filter("filter")(n, {flag: true});
                        console.log("What is trues :%O", $scope.selectedLocationList);
                        console.log("Trues Length :%O", $scope.selectedLocationList.length);
                        $scope.length = $scope.selectedLocationList.length;
                        if ($scope.selectedLocationList.length === 0) {
                            $scope.hideCompareButton = true;
                            $scope.hideSutaibleLocation = false;
                        } else if ($scope.selectedLocationList.length > 0) {
                            $scope.hideCompareButton = false;
                        }
                        if ($scope.selectedLocationList.length === 3) {
                            console.log("Coming to if?");
                            $scope.hideCheckbox = true;
                        }
                    }, true);
                    $scope.removeLocation = function (location) {
                        console.log("You are called with :%O", location);
                        location.flag = false;
                        var index = $scope.selectedLocationList.indexOf(location);
                        console.log("Index :%O", index);
                        $scope.selectedLocationList.splice(index, 1);
                        console.log("After Removing List:%O", $scope.selectedLocationList);
                        if ($scope.selectedLocationList.length < 3) {
                            $scope.hideCheckbox = false;
                        }
                    };
                    $scope.compareLocations = function () {
                        console.log("Coming to compare??");
                    };
                });
            } else {
                //todo
                console.log("Coming to else??");
                $scope.$watch('state', function (state) {
                    map.setCenter({
                        lat: state.latitude,
                        lng: state.longitude
                    });
                    map.setZoom(6);
                });
                $scope.$watch('city', function (city) {
                    map.setCenter({
                        lat: city.latitude,
                        lng: city.longitude
                    });
                    map.setZoom(13);
                });
            }
            ;
            var drawMarker = function (position, title, map) {
                console.log("Position :%O", position);
                new google.maps.Marker({
                    map: map,
                    position: position,
                    title: title,
                    icon: 'images/icons_svg/dot.png'
                });
            };
        })
        .controller('LocationComparisionController', function ($scope) {
            console.log("Selected List :%O", $scope.$parent.selectedLocationList);
            $scope.compareList = $scope.$parent.selectedLocationList;
        })
        .controller('LocationDetailController', function ($scope, $filter, RoadService, UnitService, CityService, LocationCategoryService, AmenityDetailService, HospitalService, AmenityCodeService, AmenityService, LocationService, MarketPriceService, MallService, CoordinateService, BranchService, SchoolService, PropertyService, ProjectService, $stateParams) {
            $scope.map;
            $scope.map1;
            $scope.map2;
            $scope.map3;
            $scope.displayDistance;
            var mapContainer = document.getElementById("locationDetailMapContainer");
            $scope.infowindow = new google.maps.InfoWindow();
            $scope.directionsService = new google.maps.DirectionsService();
            $scope.directionsDisplay = new google.maps.DirectionsRenderer({
                'preserveViewport': true,
                'suppressMarkers': true
            });
            $scope.markers = [];
            $scope.setMapOnAll = function (map) {
                console.log("Setting map null :%O", map);
                for (var i = 0; i < $scope.markers.length; i++) {
                    $scope.markers[i].setMap(map);
                }
            };

            $scope.distanceService = new google.maps.DistanceMatrixService();
            console.log("$stateparams ID::::::", $stateParams.locationId);
            var drawMap = function (mapProperty) {
                console.log("Coming To Draw Map %O", mapContainer);
                $scope.map = new google.maps.Map(mapContainer, mapProperty);
            };
            var drawMap1 = function (mapProperty, mapContainer1) {
                console.log("Coming To Draw Map 1 :" + mapContainer1);
                $scope.map1 = new google.maps.Map(mapContainer1, mapProperty);
            };
            var drawMap2 = function (mapProperty, mapContainer2) {
                console.log("Coming To Draw Map 2 :" + mapContainer2);
                $scope.map2 = new google.maps.Map(mapContainer2, mapProperty);
            };
            var drawMap3 = function (mapProperty, mapContainer3) {
                console.log("Coming To Draw Map 3 :" + mapContainer3);
                $scope.map3 = new google.maps.Map(mapContainer3, mapProperty);
            };

            var drawMarker = function (position, title, map) {
                console.log("Position in marking 111:%O", position);
                var marker = new google.maps.Marker({
                    map: map,
                    position: position,
                    title: title,
                    icon: 'images/icons_svg/dot.png'
                });
            };

            var drawAmenityMarker = function (amenityDetailsList, location, map) {
                console.log("Position :%O", amenityDetailsList);
                console.log("Map :%O", map);
                $scope.setMapOnAll(null);
                $scope.directionsDisplay.setMap(null);
                angular.forEach(amenityDetailsList, function (amenityDetail) {
//                    drawAmenityMarker({lat: amenityDetail.latitude, lng: amenityDetail.longitude}, amenityDetail.name, $scope.location, $scope.map);
//////////////////////////////////////////////////////////////////////////////////
                    var marker = new google.maps.Marker({
                        map: map,
                        position: {lat: amenityDetail.latitude, lng: amenityDetail.longitude},
                        title: amenityDetail.name
//                    icon: 'images/icons_svg/airport.png'
                    });
                    $scope.markers.push(marker);
                    console.log("Markers Array :%O", $scope.markers);
                    google.maps.event.addListener(marker, 'click', function () {
                        $scope.infowindow.setContent(amenityDetail.name);
                        $scope.infowindow.open(map, this);
                    });
                    google.maps.event.addListener(marker, 'mouseover', function (event) {
                        console.log("Detecting Hover Event :%O", event);
                        console.log("Place.Geometry.Location :%O", {lat: amenityDetail.latitude, lng: amenityDetail.longitude});
                        var request = {
                            origin: new google.maps.LatLng(location.latitude, location.longitude),
                            destination: {lat: amenityDetail.latitude, lng: amenityDetail.longitude},
                            travelMode: google.maps.DirectionsTravelMode.DRIVING
                        };
                        $scope.directionsService.route(request, function (response, status) {
                            console.log("Response :%O", response);
                            if (status == google.maps.DirectionsStatus.OK) {
                                console.log("Status is OK");
                                $scope.directionsDisplay.setDirections(response);
                                $scope.directionsDisplay.setMap(map);
                            }
                        });
                        var distanceRequest = {
                            origins: [new google.maps.LatLng(location.latitude, location.longitude)],
                            destinations: [{lat: amenityDetail.latitude, lng: amenityDetail.longitude}],
                            travelMode: google.maps.DirectionsTravelMode.DRIVING
                        };
                        $scope.distanceService.getDistanceMatrix(distanceRequest, function (response, status) {
                            console.log("Response :%O", response);
                            console.log("Distance is :%O", response.rows[0].elements[0].distance.text);
//                        $scope.distanceBox(title, response.rows[0].elements[0].distance.text);
                        });

                    });
//////////////////////////////////////////////////////////////////////////////////
                });
            };

            $scope.createAmenityMarker = function (place, location, map) {
                var placeLoc = place.geometry.location;
                var marker = new google.maps.Marker({
                    map: map,
                    position: place.geometry.location,
                    title: place.name
                });
                $scope.markers.push(marker);
                console.log("getting Markers :%O", $scope.markers);
                google.maps.event.addListener(marker, 'click', function () {
                    $scope.infowindow.setContent(place.name);
                    $scope.infowindow.open(map, this);
                });
                google.maps.event.addListener(marker, 'mouseover', function (event) {
                    console.log("Detecting Hover Event :%O", event);
                    console.log("Place.Geometry.Location :%O", place.geometry.location);
                    var request = {
                        origin: new google.maps.LatLng(location.latitude, location.longitude),
                        destination: place.geometry.location,
                        travelMode: google.maps.DirectionsTravelMode.DRIVING
                    };
                    $scope.directionsService.route(request, function (response, status) {
                        console.log("Response :%O", response);
                        console.log("Response Legs :%O", response.routes[0].legs[0].distance.text);
                        if (status == google.maps.DirectionsStatus.OK) {
                            console.log("Status is OK");
                            $scope.directionsDisplay.setDirections(response);
//                            $scope.directionsDisplay.setTitle(response.routes[0].legs[0].distance.text);
                            $scope.directionsDisplay.setMap(map);
                        }
                    });
                    var distanceRequest = {
                        origins: [new google.maps.LatLng(location.latitude, location.longitude)],
                        destinations: [place.geometry.location],
                        travelMode: google.maps.DirectionsTravelMode.DRIVING
                    };
                    $scope.distanceService.getDistanceMatrix(distanceRequest, function (response, status) {
                        console.log("Response :%O", response);
                        console.log("Distance is :%O", response.rows[0].elements[0].distance.text);

                    });
                });
                drawMarker({lat: location.latitude, lng: location.longitude}, location.name, map);
                new google.maps.Circle({
                    center: new google.maps.LatLng(location.latitude, location.longitude),
                    radius: 5000,
                    strokeColor: "#87C4C2",
                    strokeOpacity: 0.8,
                    strokeWeight: 2,
                    fillColor: "#C1E6E5",
                    // fillColor: "#FF69B4",
                    fillOpacity: '0.2',
                    zoom: 13
                });

            };
            var drawWorkplaceMarker = function (amenityDetailsList, location, map) {
                $scope.setMapOnAll(null);
                $scope.directionsDisplay.setMap(null);
                angular.forEach(amenityDetailsList, function (amenityDetail) {
                    var marker = new google.maps.Marker({
                        map: $scope.map1,
                        position: {lat: amenityDetail.latitude, lng: amenityDetail.longitude},
                        title: amenityDetail.name
                    });
                    $scope.markers.push(marker);
                    google.maps.event.addListener(marker, 'click', function () {
                        $scope.infowindow.setContent(amenityDetail.name);
                        $scope.infowindow.open(map, this);
                    });
                    google.maps.event.addListener(marker, 'mouseover', function (event) {
                        console.log("Detecting Hover Event :%O", event);
                        var request = {
                            origin: new google.maps.LatLng(location.latitude, location.longitude),
                            destination: {lat: amenityDetail.latitude, lng: amenityDetail.longitude},
                            travelMode: google.maps.DirectionsTravelMode.DRIVING
                        };
                        $scope.directionsService.route(request, function (response, status) {
                            console.log("Response :%O", response);
                            if (status == google.maps.DirectionsStatus.OK) {
                                console.log("Status is OK");
                                $scope.directionsDisplay.setDirections(response);
                                $scope.directionsDisplay.setMap(map);
                            }
                        });
                        var distanceRequest = {
                            origins: [new google.maps.LatLng(location.latitude, location.longitude)],
                            destinations: [{lat: amenityDetail.latitude, lng: amenityDetail.longitude}],
                            travelMode: google.maps.DirectionsTravelMode.DRIVING
                        };
                        $scope.distanceService.getDistanceMatrix(distanceRequest, function (response, status) {
                            console.log("Response :%O", response);
                            console.log("Distance is :%O", response.rows[0].elements[0].distance.text);
                            $scope.amenityDistance = response.rows[0].elements[0].distance.text;
                        });
                    });
                });

            };
            LocationService.get({
                'id': $stateParams.locationId
            }, function (location) {
                $scope.location = location;
                $scope.locationCategoryDisplay = [];
                angular.forEach($scope.location.locationCategories, function (locationCategory) {
                    LocationCategoryService.get({
                        'id': locationCategory
                    }, function (locationCategory) {
                        $scope.locationCategoryDisplay.push(locationCategory);
                    });
                });

                $scope.date = new Date();
                $scope.lowestPriceAverage;
                $scope.highestPriceAverage;

                MarketPriceService.findByLocationAndYear({
                    'locationId': location.id,
                    'year': $scope.date.getFullYear()
                }, function (marketPriceList) {
                    var lowMarketPrice = 0;
                    var highMarketPrice = 0;
                    angular.forEach(marketPriceList, function (marketPriceObject) {
                        lowMarketPrice = lowMarketPrice + marketPriceObject.mpResidentialLowest;
                        highMarketPrice = highMarketPrice + marketPriceObject.mpResidentialHighest;
                    });
                    $scope.lowestPriceAverage = lowMarketPrice / 12;
                    $scope.highestPriceAverage = highMarketPrice / 12;
                });

                CityService.get({
                    'id': location.cityId
                }, function (cityObject) {
                    $scope.cityName = cityObject.name;
                });

                UnitService.get({
                    'id': location.unit
                }, function (unitObject) {
                    $scope.location.unitObject = unitObject;
                });

                RoadService.get({
                    'id': location.majorApproachRoad
                }, function (roadObject) {
                    $scope.location.roadObject = roadObject;
                });

                var nagpurCoordinate = new google.maps.LatLng(location.latitude, location.longitude);
                var mapProp = {
                    center: nagpurCoordinate,
                    zoom: 15,
                    mapTypeId: google.maps.MapTypeId.ROADMAP
                };
                drawMap(mapProp);
                drawMarker({lat: location.latitude, lng: location.longitude}, location.name, $scope.map);
                var myCity = new google.maps.Circle({
                    center: new google.maps.LatLng(location.latitude, location.longitude),
                    radius: 5000,
                    strokeColor: "#87C4C2",
                    strokeOpacity: 0.8,
                    strokeWeight: 2,
                    fillColor: "#C1E6E5",
                    fillOpacity: 0.2,
                    zoom: 13
                });
                myCity.setMap($scope.map);
                $scope.map.fitBounds(myCity.getBounds());
            });

            //////////////////////Distance Calculator Manual////////////////////
            $scope.getDistanceFromLatLonInKm = function (lat1, lon1, lat2, lon2) {
                console.log("Lat 1 :%O", lat1);
                console.log("Lat 2 :%O", lat2);
                console.log("Long 1 :%O", lon1);
                console.log("Long 2 :%O", lon2);
                var R = 6371; // Radius of the earth in km
                var dLat = $scope.deg2rad(lat2 - lat1);  // deg2rad below
                var dLon = $scope.deg2rad(lon2 - lon1);
                var a =
                        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                        Math.cos($scope.deg2rad(lat1)) * Math.cos($scope.deg2rad(lat2)) *
                        Math.sin(dLon / 2) * Math.sin(dLon / 2)
                        ;
                var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
                var d = R * c; // Distance in km
                return d;
            };

            $scope.deg2rad = function (deg) {
                return deg * (Math.PI / 180);
            };
            ////////////////////////////////////////////////////////////////////
            $scope.getAmenityDetailByAmenity = function (amenityDetail) {
                console.log("Final amenity :%O", amenityDetail);
                console.log("Location in final :%O", $scope.location);
                $scope.requiredAmenities = [];
                if (amenityDetail.name === "Daily Needs") {
                    $scope.requiredAmenities.push(amenityDetail.name);
                    console.log("Required AMenities :%O", $scope.requiredAmenities);
                    var request = {
                        location: new google.maps.LatLng($scope.location.latitude, $scope.location.longitude),
                        radius: 5000,
                        types: ['convenience_store', 'department_store']
                    };
                    var service = new google.maps.places.PlacesService($scope.map);
                    service.nearbySearch(request, callback);
                    function callback(results, status) {
                        console.log("Results For Schools :%O", results);
                        angular.forEach(results, function (result) {
                            console.log("Result in Loop :%O", result);
                            $scope.createAmenityMarker(result, $scope.location, $scope.map);
                        });
                    }
                    ;
                } else if (amenityDetail.name === "Public Transport") {
                    $scope.requiredAmenities.push(amenityDetail.name);
                    console.log("Required AMenities :%O", $scope.requiredAmenities);
                    var request = {
                        location: new google.maps.LatLng($scope.location.latitude, $scope.location.longitude),
                        radius: 5000,
                        types: ['taxi_stand', 'transit_station']
                    };
                    var service = new google.maps.places.PlacesService($scope.map);
                    service.nearbySearch(request, callback);
                    function callback(results, status) {
                        console.log("Results For Schools :%O", results);
                        angular.forEach(results, function (result) {
                            console.log("Result in Loop :%O", result);
                            $scope.createAmenityMarker(result, $scope.location, $scope.map);
                        });
                    }
                    ;
                } else if (amenityDetail.name === "Cafe") {
                    $scope.requiredAmenities.push(amenityDetail.name);
                    console.log("Required AMenities :%O", $scope.requiredAmenities);
                    var request = {
                        location: new google.maps.LatLng($scope.location.latitude, $scope.location.longitude),
                        radius: 5000,
                        types: ['cafe']
                    };
                    var service = new google.maps.places.PlacesService($scope.map);
                    service.nearbySearch(request, callback);
                    function callback(results, status) {
                        console.log("Results For Schools :%O", results);
                        angular.forEach(results, function (result) {
                            console.log("Result in Loop :%O", result);
                            $scope.createAmenityMarker(result, $scope.location, $scope.map);
                        });
                    }
                    ;
                } else if (amenityDetail.name === "Hospital") {
                    $scope.requiredAmenities.push(amenityDetail.name);
                    console.log("Required AMenities :%O", $scope.requiredAmenities);
                    var request = {
                        location: new google.maps.LatLng($scope.location.latitude, $scope.location.longitude),
                        radius: 5000,
                        types: ['hospital']
                    };
                    var service = new google.maps.places.PlacesService($scope.map);
                    service.nearbySearch(request, callback);
                    function callback(results, status) {
                        console.log("Results For Schools :%O", results);
                        angular.forEach(results, function (result) {
                            console.log("Result in Loop :%O", result);
                            $scope.createAmenityMarker(result, $scope.location, $scope.map);
                        });
                    }
                    ;
                } else if (amenityDetail.name === "Park") {
                    $scope.requiredAmenities.push(amenityDetail.name);
                    console.log("Required AMenities :%O", $scope.requiredAmenities);
                    var request = {
                        location: new google.maps.LatLng($scope.location.latitude, $scope.location.longitude),
                        radius: 5000,
                        types: ['park']
                    };
                    var service = new google.maps.places.PlacesService($scope.map);
                    service.nearbySearch(request, callback);
                    function callback(results, status) {
                        console.log("Results For Schools :%O", results);
                        angular.forEach(results, function (result) {
                            console.log("Result in Loop :%O", result);
                            $scope.createAmenityMarker(result, $scope.location, $scope.map);
                        });
                    }
                    ;
                } else if (amenityDetail.name === "Bank") {
                    $scope.requiredAmenities.push(amenityDetail.name);
                    console.log("Required AMenities :%O", $scope.requiredAmenities);
                    var request = {
                        location: new google.maps.LatLng($scope.location.latitude, $scope.location.longitude),
                        radius: 5000,
                        types: ['bank']
                    };
                    var service = new google.maps.places.PlacesService($scope.map);
                    service.nearbySearch(request, callback);
                    function callback(results, status) {
                        console.log("Results For Schools :%O", results);
                        angular.forEach(results, function (result) {
                            console.log("Result in Loop :%O", result);
                            $scope.createAmenityMarker(result, $scope.location, $scope.map);
                        });
                    }
                    ;
                } else if (amenityDetail.name === "ATM") {
                    $scope.requiredAmenities.push(amenityDetail.name);
                    console.log("Required AMenities :%O", $scope.requiredAmenities);
                    var request = {
                        location: new google.maps.LatLng($scope.location.latitude, $scope.location.longitude),
                        radius: 5000,
                        types: ['atm']
                    };
                    var service = new google.maps.places.PlacesService($scope.map);
                    service.nearbySearch(request, callback);
                    function callback(results, status) {
                        console.log("Results For Schools :%O", results);
                        angular.forEach(results, function (result) {
                            console.log("Result in Loop :%O", result);
                            $scope.createAmenityMarker(result, $scope.location, $scope.map);
                        });
                    }
                    ;
                } else if (amenityDetail.name === "Places Of Workship") {
                    $scope.requiredAmenities.push(amenityDetail.name);
                    console.log("Required Amenities :%O", $scope.requiredAmenities);
                    var request = {
                        location: new google.maps.LatLng($scope.location.latitude, $scope.location.longitude),
                        radius: 5000,
                        types: ['hindu_temple', 'mosque', 'church']
                    };
                    var service = new google.maps.places.PlacesService($scope.map);
                    service.nearbySearch(request, callback);
                    function callback(results, status) {
                        console.log("Results For Places Of Workship :%O", results);
                        angular.forEach(results, function (result) {
                            console.log("Result in Loop :%O", result);
                            $scope.createAmenityMarker(result, $scope.location, $scope.map);
                        });
                    }
                    ;
                } else if (amenityDetail.name === "School") {
                    console.log("In School If");
                    $scope.requiredAmenities.push(amenityDetail.name);
                    console.log("Required AMenities :%O", $scope.requiredAmenities);
                    var request = {
                        location: new google.maps.LatLng($scope.location.latitude, $scope.location.longitude),
                        radius: 5000,
                        types: ['school']
                    };
                    var service = new google.maps.places.PlacesService($scope.map);
                    service.nearbySearch(request, callback);
                    function callback(results, status) {
                        console.log("Results For Schools :%O", results);
                        angular.forEach(results, function (result) {
                            console.log("Result in Loop :%O", result);
                            $scope.createAmenityMarker(result, $scope.location, $scope.map);
                        });
                    }
                    ;
                } else if (amenityDetail.name === "College") {
                    console.log("In School If");
                    $scope.requiredAmenities.push(amenityDetail.name);
                    console.log("Required AMenities :%O", $scope.requiredAmenities);
                    var request = {
                        location: new google.maps.LatLng($scope.location.latitude, $scope.location.longitude),
                        radius: 5000,
                        types: ['school']
                    };
                    var service = new google.maps.places.PlacesService($scope.map);
                    service.nearbySearch(request, callback);
                    function callback(results, status) {
                        console.log("Results For Schools :%O", results);
                        angular.forEach(results, function (result) {
                            console.log("Result in Loop :%O", result);
                            $scope.createAmenityMarker(result, $scope.location, $scope.map);
                        });
                    }
                    ;
                } else if (amenityDetail.name === "Petrol Pump") {
                    console.log("In School If");
                    $scope.requiredAmenities.push(amenityDetail.name);
                    console.log("Required AMenities :%O", $scope.requiredAmenities);
                    var request = {
                        location: new google.maps.LatLng($scope.location.latitude, $scope.location.longitude),
                        radius: 5000,
                        types: ['gas_station']
                    };
                    var service = new google.maps.places.PlacesService($scope.map);
                    service.nearbySearch(request, callback);
                    function callback(results, status) {
                        console.log("Results For Schools :%O", results);
                        angular.forEach(results, function (result) {
                            console.log("Result in Loop :%O", result);
                            $scope.createAmenityMarker(result, $scope.location, $scope.map);
                        });
                    }
                    ;
                } else if (amenityDetail.name === "Restaurant") {
                    console.log("In School If");
                    $scope.requiredAmenities.push(amenityDetail.name);
                    console.log("Required AMenities :%O", $scope.requiredAmenities);
                    var request = {
                        location: new google.maps.LatLng($scope.location.latitude, $scope.location.longitude),
                        radius: 5000,
                        types: ['restaurant']
                    };
                    var service = new google.maps.places.PlacesService($scope.map);
                    service.nearbySearch(request, callback);
                    function callback(results, status) {
                        console.log("Results For Schools :%O", results);
                        angular.forEach(results, function (result) {
                            console.log("Result in Loop :%O", result);
                            $scope.createAmenityMarker(result, $scope.location, $scope.map);
                        });
                    }
                    ;
                } else if (amenityDetail.name === "Bakery") {
                    console.log("In School If");
                    $scope.requiredAmenities.push(amenityDetail.name);
                    console.log("Required AMenities :%O", $scope.requiredAmenities);
                    var request = {
                        location: new google.maps.LatLng($scope.location.latitude, $scope.location.longitude),
                        radius: 5000,
                        types: ['bakery']
                    };
                    var service = new google.maps.places.PlacesService($scope.map);
                    service.nearbySearch(request, callback);
                    function callback(results, status) {
                        console.log("Results For Schools :%O", results);
                        angular.forEach(results, function (result) {
                            console.log("Result in Loop :%O", result);
                            $scope.createAmenityMarker(result, $scope.location, $scope.map);
                        });
                    }
                    ;
                } else if (amenityDetail.name === "Club") {
                    console.log("In School If");
                    $scope.requiredAmenities.push(amenityDetail.name);
                    console.log("Required AMenities :%O", $scope.requiredAmenities);
                    var request = {
                        location: new google.maps.LatLng($scope.location.latitude, $scope.location.longitude),
                        radius: 5000,
                        types: ['night_club']
                    };
                    var service = new google.maps.places.PlacesService($scope.map);
                    service.nearbySearch(request, callback);
                    function callback(results, status) {
                        console.log("Results For Schools :%O", results);
                        angular.forEach(results, function (result) {
                            console.log("Result in Loop :%O", result);
                            $scope.createAmenityMarker(result, $scope.location, $scope.map);
                        });
                    }
                    ;
                }
                $scope.amenityDetailCityFilter = {
                    'amenityId': amenityDetail.id,
                    'cityId': $scope.location.cityId
                };
                $scope.amenityDetailCityFilter.cityId = $scope.location.cityId;
                AmenityDetailService.findByAmenityIdCityId({
                    'amenityId': amenityDetail.id,
                    'cityId': $scope.location.cityId
                }, function (amenityDetailObject) {
                    $scope.amenityDetailsList = [];
                    angular.forEach(amenityDetailObject, function (amenityDetail) {
                        var d = $scope.getDistanceFromLatLonInKm($scope.location.latitude, $scope.location.longitude, amenityDetail.latitude, amenityDetail.longitude);
                        if (d <= "5") {
                            $scope.amenityDetailsList.push(amenityDetail);
                        }
                    });
                    drawAmenityMarker($scope.amenityDetailsList, $scope.location, $scope.map);
                });
            };
            $scope.getAmenityDetailByAmenityWorkplaces = function (amenityDetail) {
                console.log("Amenity Detail Final:%O", amenityDetail);
                var amenityDetailsList = [];
                $scope.amenityDetailCityFilter = {
                    'amenityId': amenityDetail.id,
                    'cityId': $scope.location.cityId
                };
                $scope.amenityDetailCityFilter.cityId = $scope.location.cityId;
                AmenityDetailService.findByAmenityIdCityId({
                    'amenityId': amenityDetail.id,
                    'cityId': $scope.location.cityId
                }, function (amenityDetailObject) {
//                    $scope.amenityDetailsList = amenityDetailObject;
                    angular.forEach(amenityDetailObject, function (amenityDetail) {
                        console.log("Amenity Detail?? :%O", amenityDetail);
                        var d = $scope.getDistanceFromLatLonInKm($scope.location.latitude, $scope.location.longitude, amenityDetail.latitude, amenityDetail.longitude);
                        console.log("Val of d = " + d);
                        if (d <= "5") {
                            console.log("Amenity Detail inside If :%O", amenityDetail);
                            amenityDetailsList.push(amenityDetail);
                        }
                    });
                    drawWorkplaceMarker(amenityDetailsList, $scope.location, $scope.map1);
                });
            };
            $scope.toggle = function () {
                $scope.amenities = 'clicked';
            };
            $scope.locationSteps = [
                'Amenities',
                'Work Places',
                'Projects',
                'Properties',
                'Overview'
            ];
            $scope.selection = $scope.locationSteps[0];
            console.log("What is Selection :%O", $scope.selection);
            $scope.$watch('selection', function (newSelection) {
                console.log("Getting the changed selection :%O", newSelection);
                if (newSelection === "Work Places") {
                    $scope.workplaces = AmenityCodeService.findWorkplaces();
                    console.log("Workplaces List :%O", $scope.workplaces);
                } else if (newSelection === "Projects") {

                } else if (newSelection === "Properties") {

                }
            });
            $scope.amenityCodes = AmenityCodeService.findByTabName({
                'name': $scope.selection
            }, function (result) {
                console.log("What is the Result :%O", result);
            });
            $scope.locations = [];
            $scope.getCurrentStepIndex = function () {
                // Get the index of the current step given selection
                return _.indexOf($scope.locationSteps, $scope.selection);
            };
//            // Go to a defined step index
            $scope.goToStep = function (index) {
                if (!_.isUndefined($scope.locationSteps[index]))
                {
                    $scope.selection = $scope.locationSteps[index];
                }
            };
//            $scope.amenityCodes = AmenityCodeService.query();
            console.log("Amenity Codes :%O", $scope.amenityCodes);
            $scope.getAmenityByAmenityCode = function (amenityCode) {
                console.log("Amenity COoode :%O", amenityCode);
                $scope.amenitiesList = AmenityService.findByAmenityCode({
                    'amenityCodeId': amenityCode.id
                });

                if (amenityCode.name === "Landmark") {
                    console.log("Amenity COde Name :%O", amenityCode.name);
                    var request = {
                        location: new google.maps.LatLng($scope.location.latitude, $scope.location.longitude),
                        radius: 5000,
                        types: ['point_of_interest']
                    };
                    var service = new google.maps.places.PlacesService($scope.map);
                    service.nearbySearch(request, callback);
                    function callback(results, status) {
                        console.log("Results For Schools :%O", results);
                        angular.forEach(results, function (result) {
                            console.log("Result in Loop :%O", result);
                            $scope.createAmenityMarker(result, $scope.location, $scope.map);
                        });
                    }
                    ;
                }

                console.log("Amenities List :%O", $scope.amenitiesList);
            };
            $scope.getWorkplaceByAmenityCode = function (amenityCode) {
                console.log("Amenity COde :%O", amenityCode);
                $scope.amenitiesWorkplaceList = AmenityService.findByAmenityCode({
                    'amenityCodeId': amenityCode.id
                });
                console.log("Amenities List :%O", $scope.amenitiesWorkplaceList);
            };
            $scope.myValue = true;
            $scope.getLocationStep = function (locationstep) {
                console.log("Location Step :%O", locationstep);
                $scope.selection = locationstep;
                if (locationstep === "Amenities") {
                    console.log("Inside Amenities Kunal");
//                    $scope.amenityCodes = AmenityCodeService.findByTabName({
//                       'name' : AMENITIES
//                    });
                    $scope.myValue = true;
                } else if (locationstep === "Work Places") {
                    $scope.myWorkplaces = true;
                    $scope.myValue = false;
                    $scope.myProjects = false;
                    $scope.myProperties = false;
                    LocationService.get({
                        'id': $stateParams.locationId
                    }, function (location) {
                        var mapContainer1 = document.getElementById("locationDetailMapContainerWorkplaces");
                        var locationCoordinate = new google.maps.LatLng(location.latitude, location.longitude);
                        var mapProp = {
                            center: locationCoordinate,
                            zoom: 15,
                            mapTypeId: google.maps.MapTypeId.ROADMAP
                        };
                        drawMap1(mapProp, mapContainer1);
                        var drawMarker1 = new google.maps.Marker({
                            map: $scope.map1,
                            position: locationCoordinate,
                            title: location.name,
                            icon: 'images/icons_svg/dot.png'
                        });
                        var myCity1 = new google.maps.Circle({
                            center: new google.maps.LatLng(location.latitude, location.longitude),
                            radius: 5000,
                            strokeColor: "#87C4C2",
                            strokeOpacity: 0.8,
                            strokeWeight: 2,
                            fillColor: "#C1E6E5",
                            fillOpacity: 0.2,
                            zoom: 13
                        });
                        myCity1.setMap($scope.map1);
                        drawMarker1.setMap($scope.map1);
                        $scope.map1.fitBounds(myCity1.getBounds());
                    });
                } else if (locationstep === "Projects") {
                    $scope.myProjects = true;
                    $scope.myWorkplaces = false;
                    $scope.myProperties = false;
                    $scope.myValue = false;
                    LocationService.get({
                        'id': $stateParams.locationId
                    }, function (location) {
                        var mapContainer2 = document.getElementById("locationDetailMapContainerProjects");
                        var locationCoordinate = new google.maps.LatLng(location.latitude, location.longitude);
                        var mapProp = {
                            center: locationCoordinate,
                            zoom: 15,
                            mapTypeId: google.maps.MapTypeId.ROADMAP
                        };
                        drawMap2(mapProp, mapContainer2);
                        var drawMarker2 = new google.maps.Marker({
                            map: $scope.map2,
                            position: locationCoordinate,
                            title: location.name,
                            icon: 'images/icons_svg/dot.png'
                        });
                        var myCity2 = new google.maps.Circle({
                            center: locationCoordinate,
                            radius: 5000,
                            strokeColor: "#87C4C2",
                            strokeOpacity: 0.8,
                            strokeWeight: 2,
                            fillColor: "#C1E6E5",
                            fillOpacity: 0.2,
                            zoom: 13
                        });
                        myCity2.setMap($scope.map2);
                        drawMarker2.setMap($scope.map2);
                        $scope.map2.fitBounds(myCity2.getBounds());
                    });
                } else if (locationstep === "Properties") {
                    $scope.myProperties = true;
                    $scope.myWorkplaces = false;
                    $scope.myProjects = false;
                    $scope.myValue = false;
                    LocationService.get({
                        'id': $stateParams.locationId
                    }, function (location) {
                        var mapContainer3 = document.getElementById("locationDetailMapContainerProperties");
                        var locationCoordinate = new google.maps.LatLng(location.latitude, location.longitude);
                        var mapProp = {
                            center: locationCoordinate,
                            zoom: 15,
                            mapTypeId: google.maps.MapTypeId.ROADMAP
                        };
                        drawMap3(mapProp, mapContainer3);
                        var drawMarker3 = new google.maps.Marker({
                            map: map3,
                            position: locationCoordinate,
                            title: location.name,
                            icon: 'images/icons_svg/dot.png'
                        });
                        var myCity3 = new google.maps.Circle({
                            center: new google.maps.LatLng(location.latitude, location.longitude),
                            radius: 5000,
                            strokeColor: "#87C4C2",
                            strokeOpacity: 0.8,
                            strokeWeight: 2,
                            fillColor: "#C1E6E5",
                            fillOpacity: 0.2,
                            zoom: 13
                        });
                        myCity3.setMap($scope.map3);
                        drawMarker3.setMap($scope.map3);
                        $scope.map3.fitBounds(myCity3.getBounds());
                    });
                } else {
                    $scope.myValue = false;
                    $scope.myWorkplaces = false;
                    $scope.myProjects = false;
                    $scope.myProperties = false;
                }
            };
        });