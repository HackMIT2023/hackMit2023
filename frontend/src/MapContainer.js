import React, { Component } from 'react';

class MapContainer extends Component {
  constructor(props) {
    super(props);
    this.mapRef = React.createRef();

    this.returnZoom = 12;
    this.mapState = "wandering"; // "wandering", "creating", "focused"
    this.focusedGarden = null;
    this.creatingPolygon = null;
  
    this.homeCoords = {
      lat: 42.35942459106445,
      lng: -71.09184265136719
    }
  
    this.gardens = {
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
    this.map = new window.google.maps.Map(this.mapRef.current, {
      zoom: this.returnZoom,
      center: this.homeCoords,
      fullscreenControl: false,
      zoomControl: false,
      streetViewControl: false,
      mapTypeId: "terrain",
      clickableIcons: false,
      isFractionalZoomEnabled: true,
      mapTypeControl: false
    });

    for (var gardenId in this.gardens) {
      this.addGardenToMap(gardenId);
    }
  };

  addGardenToMap(gardenId) {
    // Construct the polygon.
    const newPolygon = new window.google.maps.Polygon({  
        paths: this.gardens[gardenId].poly,
        strokeColor: "#00AA00",
        strokeOpacity: 0.8,
        strokeWeight: 2,
        fillColor: "#00FF00",
        fillOpacity: 0.35
    });

    newPolygon.setMap(this.map);

    newPolygon.addListener('click', function (event) {
        if (this.mapState === "wandering") {
            this.returnZoom = this.map.getZoom();

            var polyBounds = this.getPolygonBounds(this.gardens[gardenId].poly)
            this.map.fitBounds(polyBounds);

            this.mapState = "focused";
            this.focusedGarden = gardenId;
            this.disableMovement()
        }
    }.bind(this));  
  }

  enableMovement() {
    this.map.setOptions({ scrollwheel: true, scaleControl: true, disableDoubleClickZoom: false, draggable: true, panControl: true});
  }

  disableMovement() {
    this.map.setOptions({ scrollwheel: false, scaleControl: false, disableDoubleClickZoom: true, draggable: false, panControl: false});
  }

  LatLngToLatLngLiteral(latLng) {
    return {lat:latLng.lat(),lng:latLng.lng()}
  }

  LatLngArrayToLatLngLiteralArray(latLngArray) {
    var latLngLiteralArray = [];
    for (let i = 0; i < latLngArray.length; i++) {
        latLngLiteralArray[i] = this.LatLngToLatLngLiteral(latLngArray[i])
    }
    return latLngLiteralArray
  }

  getPolygonBounds(poly) {
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
    return <div ref={this.mapRef} id="Map-Container" />;
  }
}

export default MapContainer;
