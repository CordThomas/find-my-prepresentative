/*
    An interactive map to explore the numerous jurisdictional boundaries and
    policy-informing legislative bodies in the Greater Los Angeles area including
    City, County and State-level.

    How this was done:
    I looked around for how to create a lightweight web tool and Leaflet seems to be the best I could find.
        By best I mean feature rich, being actively developed, a useful collection of examples and well documented.
    I downloaded the data from locations recorded below in the code.
    I loaded each ESRI Shapefile layer into QGIS to get a sense of the attributes of the features
    I used QGIS to convert the ESRI Shapefiles into geoJSON format and to coerce
        all the coordinate reference systems (CRS) to EPSG: 4269 or NAD83
    I then went back and did some research on the district, house and senate representatives and their websites.
        I added that metadata to the shapefiles and re-exported to geoJSON - only for the greater LA area
    I downloaded Leadflet, the Leaflet-ajax plugins and started up a local Python web service to local development
    I copied the geojson files into a data directory and started coding.
    There are several options for what to use as a base layer, openstreetmap, mapbox (supporters of Leaflet) and likely more.
    I then loaded up the layers and began thinking through how to present this.

    Plugins used:
        Leaflet search: https://github.com/stefanocudini/leaflet-search - offers a variety of backend search engines;
            used Openstreetmap Nominatum
        Leaflet AJAX:  https://github.com/calvinmetcalf/leaflet-ajax to read the geoJSON source files
        Leaflet PIP:  https://github.com/mapbox/leaflet-pip - to identify features encompassing a given coordinate pair,
            aka, point in polygon

    TODO
        Add a search by address to pull up all the representatives for a location.
        Add a form to allow for sending messages to representatives in bulk by jurisdiction scope (e.g., local, City, State)
        Add other jurisdictions - e.g., Coastal Commission, Army Corp of Engineers
        Improve linking to resources such as contact information
        Include representative photos - this is going to be hard - the image names are not standardized...
 */

let map;
let info;

let neighborCouncilLayer;
let laCityCouncilLayer;
let laCountySupervisorLayer;
let caHouseLayer;
let caSenateLayer;

// Los Angeles Neighborhood Councils
// Source:  https://data.lacity.org/A-Well-Run-City/Neighborhood-Councils-Certified-/fu65-dz2f
const nc_layer_url = 'data/la_neighborhood_council_districts.geojson';
// Los Angeles City Councils - 2019
// Source:  https://data.lacity.org/A-Well-Run-City/Council-Districts/5v3h-vptv
const la_city_council_layer_url = 'data/la_city_council_districts.geojson';
// Los Angeles County Supervisorial Districts - 2011
// Source:  https://egis3.lacounty.gov/dataportal/2011/12/06/supervisorial-districts/ - under Download data
const la_county_supervisors_layer_url = 'data/la_county_supervisorial_districs.geojson';
// California House of Representatives also known as the Lower Chamber
// GIS Source:  ﻿https://catalog.data.gov/dataset/tiger-line-shapefile-2018-state-california-current-state-legislative-district-sld-lower-chambe
// Meta Source:  https://www.assembly.ca.gov/assemblymembers?order=field_member_district&sort=asc
const ca_house_layer_url = 'data/ca_house_boundaries.geojson';
// California Senate also known as the Upper Chamber
// GIS Source:  https://catalog.data.gov/dataset/tiger-line-shapefile-2018-state-california-current-state-legislative-district-sld-upper-chamber
// Meta Source:  https://www.senate.ca.gov/senators?sortbydistrict=ASC
const ca_senate_layer_url = 'data/ca_senate_boundaries.geojson';

// Contact links
// State assembly https://lcmspubcontact.lc.ca.gov/PublicLCMS/ContactPopup.php?district=AD{assembly_id}&inframe=Y
// Senate https://lcmspubcontact.lc.ca.gov/PublicLCMS/ContactPopup.php?district=SD{senate_id}&inframe=Y
function prep_map() {

    let tileLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://openstreetmap.org/copyright">OpenStreetMap contributors</a>',
        maxZoom: 18,
        id: 'mapbox/light-v9'
    });

    // Now load the jurisdictional / legislative boundary layers
    let legislativeLayerGroup = L.layerGroup();

    neighborCouncilLayer = new L.GeoJSON.AJAX(nc_layer_url, {

        onEachFeature: forEachFeature,
        style: nc_style

    });
    laCityCouncilLayer = new L.GeoJSON.AJAX(la_city_council_layer_url, {

        onEachFeature: forEachFeature,
        style: cc_style

    });
    laCountySupervisorLayer = new L.GeoJSON.AJAX(la_county_supervisors_layer_url, {

        onEachFeature: forEachFeature,
        style: cs_style

    });
    caHouseLayer = new L.GeoJSON.AJAX(ca_house_layer_url, {

        onEachFeature: forEachFeature,
        style: cs_style

    });
    caSenateLayer = new L.GeoJSON.AJAX(ca_senate_layer_url, {

        onEachFeature: forEachFeature,
        style: cs_style

    });


    let overlays = {
        "Neighborhood Councils": neighborCouncilLayer,
        "LA City Councils": laCityCouncilLayer,
        "LA County Supervisor Districts": laCountySupervisorLayer,
        "California House of Representatives": caHouseLayer,
        "California Senate": caSenateLayer
    };

    map = L.map('los_angeles',
    {
        center: [33.988744, -118.255603],
        zoom : 10,
        layers : [tileLayer, neighborCouncilLayer]
    });
    //map.fitBounds(neighborCouncilLayer.getBounds(), {padding: [12, 12]});

    L.control.scale().addTo(map);
    L.control.layers(overlays, null, {collapsed:false}).addTo(map);

    // control that shows state info on hover
    info = L.control();

    info.onAdd = function (map) {
        this._div = L.DomUtil.create('div', 'info');
        this.update();
        return this._div;
    };

    info.update = function (props) {
        this._div.innerHTML = '<h4>Greater Los Angeles Political Jurisdictions</h4>' +  (props ?
            (props.NC_ID ? generateNCSnippet(props)
                : (props.dist_name ? generataeCCSnippet(props)
                    : (props.SUP_DIST_N ? generateSDSnippet(props)
                        : (props.LSAD && props.LSAD === 'L3' ? generateCHSnippet(props)
                            : (props.LSAD && props.LSAD === 'LU' ? generateCSSnippet(props)
                                : 'Hoover over a district')))))

            : 'Hover over a district');
    };

    info.addTo(map);

    map.attributionControl.addAttribution('Population data &copy; <a href="http://census.gov/">US Census Bureau</a>');


    let legend = L.control({position: 'bottomright'});

    legend.onAdd = function (map) {

        let div = L.DomUtil.create('div', 'info legend'),
            grades = [0, 10, 20, 50, 100, 200, 500, 1000],
            labels = [],
            from, to;

        for (let i = 0; i < grades.length; i++) {
            from = grades[i];
            to = grades[i + 1];

            labels.push(
                '<i style="background:' + getRandomColor() + '"></i> ' +
                from + (to ? '&ndash;' + to : '+'));
        }

        div.innerHTML = labels.join('<br>');
        return div;
    };

    legend.addTo(map);

    map.addControl( new L.Control.Search({
		url: 'https://nominatim.openstreetmap.org/search?format=json&q={s}',
		jsonpParam: 'json_callback',
		propertyName: 'display_name',
		propertyLoc: ['lat','lon'],
		marker: L.circleMarker([0,0],{radius:30}),
		autoCollapse: true,
		autoType: false,
		minLength: 4,
        moveToLocation: function(latlng, title, map) {
		    map.setView(latlng, 14);
		    showRelatedRepresentatives(latlng);
        }
	}) );

}

function generateNCSnippet(props) {
    return '<b>' + props.NAME + '</b><br />NC District #' + props.NC_ID + '<br />' +
           '<a href="'+ props.WADDRESS + '">' + props.WADDRESS + '</a>'
}
function generataeCCSnippet(props) {
    return '<b>' + props.dist_name + '</b><br />City District #' + props.district_i + '<br />' +
           '<a href="'+ props.website + '">' + props.website + '</a>'
}
function generateSDSnippet(props) {
    return '<b>' + props.supervisor + '</b><br />City District #' + props.SUP_DIST_N + '<br />' +
           '<a href="'+ props.website + '">' + props.website + '</a>'
}
function generateCHSnippet(props) {
    return '<b>' + props.NAMELSAD + '</b><br />Assembly District #' + props.SLDLST + '<br />' +
           'Assembly menber: ' + props.member + '<br />' +
           '<a href="'+ props.website + '">' + props.website + '</a>'
}
function generateCSSnippet(props) {
    return '<b>' + props.NAMELSAD + '</b><br />Senate District #' + props.SLDUST + '<br />' +
           'Senator: ' + props.Senator + '<br />' +
           '<a href="'+ props.website + '">' + props.website + '</a>'
}
/*
  Using the point in polygon method, check to see what jurisdictions
  the specified point is in and then display the relavent bits from each
  @using https://github.com/mapbox/leaflet-pip
 */
function showRelatedRepresentatives(latlng) {

    let res = leafletPip.pointInLayer(latlng, neighborCouncilLayer);
    if (res.length) {
        document.getElementById('contacts').innerHTML = res[0].feature.properties.NAME;
    }
    console.log(latlng);
}

function forEachFeature(feature, layer) {
    layer.on({
        mouseover: highlightFeature,
        mouseout: resetHighlight,
        click: zoomToFeature
    });
}

// Generate a random hex color - from https://www.paulirish.com/2009/random-hex-color-code-snippets/
function getRandomColor() {
    return '#'+Math.floor(Math.random()*16777215).toString(16);
}

function cc_style(feature) {
    return {
        weight: 1,
        opacity: 1,
        color: 'blue',
        dashArray: '3',
        fillOpacity: 0.7,
        fillColor: getRandomColor()
    };
}

function cs_style(feature) {
    return {
        weight: 1,
        opacity: 1,
        color: 'green',
        dashArray: '1',
        fillOpacity: 0.7,
        fillColor: getRandomColor()
    };
}

function nc_style(feature) {
    return {
        weight: 1,
        opacity: 1,
        color: 'grey',
        dashArray: '3',
        fillOpacity: 0.7,
        fillColor: getRandomColor()
    };
}

function cah_style(feature) {
    return {
        weight: 1,
        opacity: 1,
        color: 'grey',
        dashArray: '3',
        fillOpacity: 0.7,
        fillColor: getRandomColor()
    };
}

function cas_style(feature) {
    return {
        weight: 1,
        opacity: 1,
        color: 'grey',
        dashArray: '3',
        fillOpacity: 0.7,
        fillColor: getRandomColor()
    };
}

function highlightFeature(e) {
    let layer = e.target;

    layer.setStyle({
        weight: 5,
        color: '#666',
        dashArray: '',
        fillOpacity: 0.7
    });

    if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
        layer.bringToFront();
    }

    info.update(layer.feature.properties);
}

function resetHighlight(e) {
    neighborCouncilLayer.resetStyle(e.target);
    info.update();
}

function zoomToFeature(e) {
    map.fitBounds(e.target.getBounds());
}


