// Link to earthquakes last 7 days >= magnitude 2.5
var url1 = 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/2.5_week.geojson';
var url2 = 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson';

// Initial map object
var myMap = L.map("map", {
    center: [39.3210, -111.0937],
    zoom: 6
});

// Adding a tile layer map:
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(myMap);

// Style 
function styleFeature(feature) {
    return {
        opacity: 1,
        fillColor: getColor(feature.properties.mag),
        color: '#000000',
        radius: getRadius(feature.properties.mag),
        weight: 0.5,
        stroke: true
    };
}

// Get color based on depth
function getColor(depth) {
    return depth > 90 ? '#FF0000' :
        depth > 70 ? '#FF9933' :
            depth > 50 ? '#FFB266' :
                depth > 30 ? '#FFCC99' :
                    depth > 10 ? '#E5FFCC' :
                        '#80FF00';
}

// Get radius based on magnitude
function getRadius(magnitude) {
    return magnitude * 5; // Adjust this multiplier as needed
}

// Make popups
function createPopupContent(feature) {
    return `<h3>Location:</h3> ${feature.properties.place}<h3>Magnitude:</h3> ${feature.properties.mag}<h3>Depth:</h3> ${feature.geometry.coordinates[2]}`;
}

// Fetch data and create GeoJSON layer first URL
d3.json(url1).then(function (data) {
    L.geoJson(data, {
        pointToLayer: function (feature, latlng) {
            return L.circleMarker(latlng);
        },
        style: styleFeature,
        onEachFeature: function (feature, layer) {
            layer.bindPopup(createPopupContent(feature));
        }
    }).addTo(myMap);
});

// Fetch data and create GeoJSON layer second URL
d3.json(url2).then(function (earthquakeData) {
    function createMarker(feature, latlng) {
        return L.circleMarker(latlng, {
            radius: getRadius(feature.properties.mag),
            fillColor: getColor(feature.geometry.coordinates[2]),
            color: "#000",
            weight: 0.7,
            opacity: 0.5,
            fillOpacity: 0.7
        });
    }

    function createFeatures(earthquakeData) {
        function onEachFeature(feature, layer) {
            layer.bindPopup(createPopupContent(feature));
        }

        let earthquakes = L.geoJSON(earthquakeData, {
            onEachFeature: onEachFeature,
            pointToLayer: createMarker
        });

        earthquakes.addTo(myMap);
    }

    createFeatures(earthquakeData);
});

// Make legend
var legend = L.control({ position: "bottomright" });

legend.onAdd = function (map) {
    var div = L.DomUtil.create("div", "info legend"),
        depths = [-10, 10, 30, 50, 70, 90],
        labels = [];

    div.innerHTML += "<h4>Depth Legend</h4>";
    // Loop through depth intervals and generate labels
    for (var i = 0; i < depths.length; i++) {
        div.innerHTML +=
            '<i style="background:' + getColor(depths[i] + 1) + '"></i> ' +
            depths[i] + (depths[i + 1] ? "&ndash;" + depths[i + 1] + "<br>" : "+");
    }

    return div;
};

legend.addTo(myMap);
