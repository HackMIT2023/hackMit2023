import React, { Component } from 'react';

class MapContainer extends Component {
  constructor(props) {
    super(props);
    this.mapRef = React.createRef();
  }

  componentDidMount() {
    // Load the Google Maps JavaScript API script
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyC58rBACS0CiKVwRLVsg3tF4PmAbKjnL7I`;
    script.defer = true;
    script.async = true;
    script.onload = this.initMap;
    document.head.appendChild(script);
  }

  initMap = () => {
    // Initialize the map
    const map = new window.google.maps.Map(this.mapRef.current, {
      center: { lat: 37.7749, lng: -122.4194 },
      zoom: 14,
    });

  };

  render() {
    return <div ref={this.mapRef} style={{ width: '100%', height: '400px' }} />;
  }
}

export default MapContainer;
