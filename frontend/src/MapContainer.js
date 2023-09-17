import React, { Component } from 'react';

class MapContainer extends Component {
  static mapRef = React.createRef();
  static returnZoom = 12;
  static mapState = "wandering"; // "wandering", "creating", "focused"
  static focusedGarden = null;
  static creatingPolygon = null;
  static homeCoords = {
    lat: 42.35942459106445,
    lng: -71.09184265136719
  }
  static gardens = {
    "bf6763ac-3983-42ad-81ce-a662e996c33a" : {
      poly: [
          { lat: 42.35942459106445, lng: -71.09184265136719 },
          { lat: 42.36942459106445, lng: -71.09184265136719 },
          { lat: 42.36942459106445, lng: -71.10184265136719 },
          { lat: 42.35942459106445, lng: -71.10184265136719 }
      ],
      name: "My Test Garden"
    }
  }
  static map;

  constructor(props) {
    super(props);
  }

  componentDidMount() {
    // Load the Google Maps JavaScript API script
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyC58rBACS0CiKVwRLVsg3tF4PmAbKjnL7I&callback=initMap`;
    script.defer = true;
    script.async = true;
    window.initMap = this.initMap;
    document.head.appendChild(script);
  }

  initMap = () => {
    // Initialize the map
    MapContainer.map = new window.google.maps.Map(MapContainer.mapRef.current, {
      zoom: MapContainer.returnZoom,
      center: MapContainer.homeCoords,
      fullscreenControl: false,
      zoomControl: false,
      streetViewControl: false,
      mapTypeId: "terrain",
      clickableIcons: false,
      isFractionalZoomEnabled: true,
      mapTypeControl: false
    });

    for (var gardenId in MapContainer.gardens) {
      MapContainer.addGardenToMap(gardenId);
    }
  };

  static addGardenToMap(gardenId) {
    // Construct the polygon.
    const newPolygon = new window.google.maps.Polygon({  
        paths: MapContainer.gardens[gardenId].poly,
        strokeColor: "#00AA00",
        strokeOpacity: 0.8,
        strokeWeight: 2,
        fillColor: "#00FF00",
        fillOpacity: 0.35
    });

    newPolygon.setMap(MapContainer.map);

    newPolygon.addListener('click', function (event) {
        if (MapContainer.mapState === "wandering") {
          MapContainer.returnZoom = MapContainer.map.getZoom();

            var polyBounds = MapContainer.getPolygonBounds(MapContainer.gardens[gardenId].poly)
            MapContainer.map.fitBounds(polyBounds);

            MapContainer.mapState = "focused";
            MapContainer.focusedGarden = gardenId;
            MapContainer.disableMovement()
        }
    }.bind(this));  
  }

  static newGardenCallback() {
    if (MapContainer.mapState === "wandering") {
      MapContainer.mapState = "creating";

        var mapCenter = MapContainer.map.getCenter()

        var mapNorthEast = MapContainer.LatLngToLatLngLiteral(MapContainer.map.getBounds().getNorthEast())
        var mapSouthWest = MapContainer.LatLngToLatLngLiteral(MapContainer.map.getBounds().getSouthWest())
        var viewportHeight = mapNorthEast.lat - mapSouthWest.lat;
        var viewportWidth = mapSouthWest.lng - mapNorthEast.lng;
        var defaultWidth = viewportWidth * 1/3;
        var defaultHeight = viewportHeight * 1/3;

        const poly = [
            {lat: mapCenter.lat() - defaultHeight/2, lng: mapCenter.lng() + defaultWidth/2},
            {lat: mapCenter.lat() + defaultHeight/2, lng: mapCenter.lng() + defaultWidth/2},
            {lat: mapCenter.lat() + defaultHeight/2, lng: mapCenter.lng() - defaultWidth/2},
            {lat: mapCenter.lat() - defaultHeight/2, lng: mapCenter.lng() - defaultWidth/2}
        ]
        MapContainer.creatingPolygon = new window.google.maps.Polygon({
            paths: poly,
            strokeColor: "#AA0000",
            strokeOpacity: 0.8,
            strokeWeight: 2,
            fillColor: "#FF0000",
            fillOpacity: 0.35,
            editable: true,
            draggable: true,
        });
        MapContainer.creatingPolygon.setMap(MapContainer.map);
        
    }
  }

  static confirmCallback() {
    if (MapContainer.mapState === "creating") {
        var poly = MapContainer.LatLngArrayToLatLngLiteralArray(MapContainer.creatingPolygon.getPath().getArray());
        let uuid = crypto.randomUUID();
        MapContainer.gardens[uuid] = {
            poly: poly,
            name: "New garden"
        };
        MapContainer.addGardenToMap(uuid);
        MapContainer.creatingPolygon.setMap(null);
        MapContainer.creatingPolygon = null;
        MapContainer.mapState = "wandering";
    }
  }

  static backToMapCallback() {
    if (MapContainer.mapState === "focused") {
      MapContainer.focusedGarden = null;
      MapContainer.mapState = "wandering";
      MapContainer.enableMovement();
      MapContainer.map.setZoom(MapContainer.returnZoom);
    }

}

  static enableMovement() {
    this.map.setOptions({ scrollwheel: true, scaleControl: true, disableDoubleClickZoom: false, draggable: true, panControl: true});
  }

  static disableMovement() {
    this.map.setOptions({ scrollwheel: false, scaleControl: false, disableDoubleClickZoom: true, draggable: false, panControl: false});
  }

  static LatLngToLatLngLiteral(latLng) {
    return {lat:latLng.lat(),lng:latLng.lng()}
  }

  static LatLngArrayToLatLngLiteralArray(latLngArray) {
    var latLngLiteralArray = [];
    for (let i = 0; i < latLngArray.length; i++) {
        latLngLiteralArray[i] = this.LatLngToLatLngLiteral(latLngArray[i])
    }
    return latLngLiteralArray
  }

  static getPolygonBounds(poly) {
    var bounds = {
        north: -Number.MAX_VALUE,
        south: Number.MAX_VALUE,
        east: -Number.MAX_VALUE,
        west: Number.MAX_VALUE
    }
    for (let i = 0; i < poly.length; i++) {
        bounds.north = Math.max(bounds.north, poly[i].lat);
        bounds.south = Math.min(bounds.south, poly[i].lat)
        bounds.east = Math.max(bounds.east, poly[i].lng);
        bounds.west = Math.min(bounds.west, poly[i].lng);
    }
    return bounds;
  }

  render() {
    return <div ref={MapContainer.mapRef} id="Map-Container" />;
  }

}

export default MapContainer;
