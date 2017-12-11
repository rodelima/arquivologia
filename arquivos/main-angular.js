/*
* Customization and Configuration Angular scripts
*
*    
* @project Indirect Public Administration Theme
* @version 1.0
* @date 26/01/2017
* @package layout
* @author Lucas Matias Caetano
* @copyright 2017 PRODEST.
*
*/
'use strict';


var videosApp = angular.module('videosApp', []);

videosApp.controller('youtubeController', function ($scope, $http, $filter) {

    var type, id, contentType;
    var api_key = "AIzaSyBRCFCdirtMsaL7N11ApIGIYKHYXzWX-dk";
    var urlYoutube = angular.element('#url').val();
    var parametros;
    var maxResultados = '12';

    /*https://regex101.com/*/
    var reg = new RegExp(/^.*(youtu.be\/|list|watch)(|\?v|)=([^#\&\?]*).*(?:&|$)|^(?:https?:\/\/)?(?:www\.)?youtu\.?be(?:\.com)?(?:\/)(channel)?(?:(?!=).)*\/(.*)$/g);
    var match = reg.exec(urlYoutube);

    if (match != null) {
        if (match[4] != undefined) {
            type = match[4];
            id = match[5];
        } else {
            type = match[1];
            id = match[3];
        }
        //console.log("type: " + type);
        //console.log("id: " + id);
        switch (type) {
            case "list":
                contentType = "playlistItems";
                parametros = {
                    params: {
                        part: 'snippet',
                        playlistId: id,
                        key: api_key,
                        pageToken: $scope.nextPage ? $scope.nextPage : '',
                        maxResults: maxResultados
                    }
                };
                break;
            case "watch":
                contentType = "videos";
                parametros = {
                    params: {
                        part: 'snippet',
                        id: id,
                        key: api_key
                    }
                };
                break;
            case "channel"://traz os últimos vídeos
                //contentType = "channels";
                contentType = "search";
                parametros = {
                    params: {
                        part: 'snippet',
                        channelId: id,
                        key: api_key,
                        order: 'date',
                        type: 'video',
                        maxResults: maxResultados
                    }
                };
                break;
            default:
                contentType = "search";
                parametros = {
                    params: {
                        part: 'id,snippet',
                        key: api_key,
                        type: "video",
                        maxResults: maxResultados,
                        pageToken: $scope.nextPage ? $scope.nextPage : '',
                        fields: 'items/id,items/snippet/title,items/snippet/description,items/snippet/thumbnails/default,items/snippet/channelTitle,nextPageToken,prevPageToken'
                    }
                };
                break;
        }

        $scope.youtubeData = [];
        $scope.nextPage = "";


        $scope.getYoutubeData = function () {
            $http.get('https://www.googleapis.com/youtube/v3/' + contentType,
                parametros
            ).success(function (data) {
                if (data.items.length === 0) {
                    $scope.youtubeData = 'Página não encontrada!';
                }
                if (type != "channel") {
                    $scope.totalResults = (data.pageInfo.totalResults / data.pageInfo.resultsPerPage);

                    if (data.pageInfo.totalResults % data.pageInfo.resultsPerPage) {
                        $scope.totalResults = Math.floor($scope.totalResults);
                        $scope.totalResults = $scope.totalResults + 1;
                    }
                    $scope.parcialResults = (data.items[data.items.length - 1].snippet.position + 1) / data.pageInfo.resultsPerPage;
                    if ((data.items[data.items.length - 1].snippet.position + 1) % data.pageInfo.resultsPerPage) {
                        $scope.parcialResults = Math.floor($scope.parcialResults);
                        $scope.parcialResults = $scope.parcialResults + 1;
                    }
                    $scope.nextPageToken = data.nextPageToken;
                    $scope.prevPageToken = data.prevPageToken;

                }

                $scope.youtubeData = data.items;
                window.scrollTo(0, 0);
            });
        }

        $scope.getYoutubeData();

        $scope.checkDataLength = function (data) {
            return (data.length >= 1);
        };

        $scope.callNextPageFn = function (nextPage) {
            $scope.nextPage = nextPage;
            parametros["params"]["pageToken"] = nextPage;
            $scope.getYoutubeData();
        };

        $scope.getVideoId = function (data) {
            var id = "";
            switch (type) {
                case "list":
                    id = data.snippet.resourceId.videoId;
                    break;
                case "watch":
                    id = data.id;
                    break;
                case "channel":
                    id = data.id.videoId;
                    break;
                default:
                    id = data.id.videoId;
                    break;

            }
            return (id);
        };


    }
}).filter('cmdate', [
    '$filter', function($filter) {
        return function (input, format) {
            //moment.locale('pt-br');
            //var a = moment(input).fromNow();
            //return a;
            return $filter('date')(new Date(input), format);
        };
    }
]).filter('ellipsis', function () {
    return function (text, length) {
        if (text.length > length) {
            return text.substr(0, length) + '...';
        }
        return text;
    }
}).directive('showHide', function () {
    return {
        link: function (scope, element, attributes, controller) {
            scope.$watch(attributes.showHide, function (v) {
                if (v) {
                    element.show();
                } else {
                    element.hide();
                }
            });

        }
    };
}).directive('prettyp', function () {
    return function (scope, element, attrs) {

        $("a[rel^='prettyVideo']").prettyPhoto({
            animation_speed: 'normal',
            theme: 'video',
            slideshow: 3000,
            autoplay_slideshow: false,
            social_tools: false,
            default_width: 850,
            default_height: 480,
            callback: function () {
                $(".video-item").each(function () {
                    if ($(this).find(".video-play").hasClass("fa-pause")) {
                        $(this).find(".video-play").removeClass("fa-pause");
                        $(this).find(".video-play").addClass("fa-play");
                    }
                });
            }
        });

    }
}).directive("owlCarousel", ['$timeout', function ($timeout) {
    return {
        restrict: 'E',
        transclude: false,
        link: function (scope) {
            
            $('#NAV-ID-' + scope.contentId).empty();
            scope.initCarousel = function (element) {
                $timeout(function () {
                    // provide any default options you want
                    var defaultOptions = {
                        loop: true,
                        margin: 10,
                        slideBy: 2,
                        nav: true,
                        autoplay: true,
                        navContainer: '.carousel-nav',
                        navElement: 'span',
                        navText: ['<i title="Anterior" class="fa fa-chevron-left"></i>', '<i title="Pr\u00f3ximo" class="fa fa-chevron-right"></i>'],
                        navClass: ["owl left previous", "owl right next"],
                        autoplayHoverPause: true,
                        items: 2, //2 items above 1000px browser width
                        responsive: {
                            // breakpoint from 0 up
                            0: {
                                items: 1
                            },
                            // breakpoint from 480 up
                            480: {
                                items: 1
                            },
                            // breakpoint from 768 up
                            768: {
                                items: 2
                            },
                            980: {
                                items: 2
                            }
                        }

                    };
                    var customOptions = scope.$eval($(element).attr('data-options'));
                    // combine the two options objects
                    for (var key in customOptions) {
                        defaultOptions[key] = customOptions[key];
                    }

                    if ($(element).attr('data-length') == 1) {
                        defaultOptions["items"] = 1;
                        defaultOptions["slideBy"] = 1;
                        defaultOptions["responsive"] = {};
                    }
                    // init carousel
                    var $owl = $(element).owlCarousel(defaultOptions);

                    /*========================================================
                    * Carousel Group News
                    ========================================================== */

                    function equalHeightNewsCarousel() {

                        $(".rp-carousel-news").each(function () {
                            var maxHeight = 0;
                            $(this).find(".item-carousel").each(function () {
                                if (maxHeight < $(this).height()) {
                                    maxHeight = $(this).height();
                                }
                            });
                            if (maxHeight > 0) {
                                $(this).find(".item-carousel").each(function () {
                                    if ($(this).height() < maxHeight) {
                                        var difHeight = maxHeight - $(this).height();
                                        $(this).find(".learn-more").css("padding-top", difHeight + "px");
                                    }
                                });
                            }

                        });
                    }
                    equalHeightNewsCarousel();
                    $(window).on("load resize", function (e) {
                        $owl.trigger('refresh.owl.carousel');
                        equalHeightNewsCarousel();
                    });

                }, 50);
            };
        }
    };
}])
.directive('owlCarouselItem', [function () {
    return {
        restrict: 'A',
        transclude: false,
        link: function (scope, element) {
            // wait for the last item in the ng-repeat then call init
            if (scope.$last) {
                scope.initCarousel(element.parent());
            }
        }
    };
}]);
