var myCity = {
    lat: 12.9716,
    lng: 77.5946
};
//Location of place Banglore

var tags = [];
var map;
var infWindow = '';

function myDig() {
    infWindow = new google.maps.InfoWindow();
    map = new google.maps.Map(document.getElementById('map'), {
        zoom: 14,
        center: myCity

    });
    fetching_restro();
}

var myLogo = {
    list: ko.observableArray([]),
    searchQuery: ko.observable(),
    Err: ko.observable(false),
    Err_message: ko.observable(''),

    constructor: function () {
        for (var i in tags) {
            myLogo.list.push(tags[i].title);
        }
    },

    fun: function (query) {
        myLogo.list.removeAll();
        for (var i in tags) {
            if (tags[i].title.toLowerCase().indexOf(query.toLowerCase()) > -1) {
                myLogo.list.push(tags[i].title);
                tags[i].setVisible(true);
            } else {
                tags[i].setVisible(false);
            }
        }
    }
};

function digErr() {
    myLogo.Err(true);
    myLogo.Err_message('Map can"t be loaded');
}

function startingWindow(marker) {
    if (infWindow.marker !== marker && infWindow.marker !== undefined) {
        stop_animation(infWindow.marker);
    }
    animation_marker(marker);
    var content = '<h1>' + marker.title + '</h1>';
    content += '<h2>' + marker.add + '</h2>';
    content += '<h3>' + marker.cuisin + '</h3>';
    infWindow.marker = marker;
    infWindow.setContent(content);
    infWindow.open(map, marker);
    infWindow.addListener('closeclick', stop_animation);
}

function startingWindow2() {
    startingWindow(this);
}

function fetching_restro() {
    $.ajax({
        url: 'https://developers.zomato.com/api/v2.1/geocode',
        headers: {
            'Accept': 'application/json',
            'user-key': 'f4f6d9174e932bab6c1712d10ea3295b'
        },
        async: true,
        data: 'lat=12.9716&lon=77.5946'

    }).done(function (res) {
        var data = res.nearby_restaurants;
        for (var i in data) {
            var marker = new google.maps.Marker({
                title: data[i].restaurant.name,
                position: {
                    lat: parseFloat(data[i].restaurant.location.latitude),
                    lng: parseFloat(data[i].restaurant.location.longitude)
                },
                map: map,
                animation: google.maps.Animation.DROP,
                add: data[i].restaurant.location.address,
                cuisin: data[i].restaurant.cuisines

            });
            marker.addListener('click', startingWindow2);
            tags.push(marker);
        }
        var limits = new google.maps.LatLngBounds();
        for (var k in tags) {
            limits.extend(tags[k].position);
        }
        map.fitBounds(limits);
        myLogo.constructor();
    }).fail(function () {
        myLogo.Err(true);
        myLogo.Err_message(' Restuarant not Displayed');
    });
}



function open(title) {
    for (var i in tags) {
        if (tags[i].title == title) {
            startingWindow(tags[i]);
            return;
        }
    }
}

function animation_marker(marker) {
    marker.setIcon('http://maps.google.com/mapfiles/ms/icons/restaurant.png');
    marker.setAnimation(google.maps.Animation.BOUNCE);
}

function stop_animation(marker) {
    infWindow.marker.setIcon(null);
    infWindow.marker.setAnimation(null);
}
ko.applyBindings(myLogo);
myLogo.searchQuery.subscribe(myLogo.fun);
//f4f6d9174e932bab6c1712d10ea3295b
