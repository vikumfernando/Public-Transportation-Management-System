import React, { useCallback, useRef } from "react";
import { GoogleMap, useJsApiLoader, Marker } from "@react-google-maps/api";
import "../styles/searchRoute.css";
import locationMarker from "../images/redDot.gif";

const mapOptions = {
  disableDefaultUI: true, //Hiding HUD
  styles: [
    {
      featureType: "poi",
      elementType: "labels",
      stylers: [{ visibility: "off" }], // hide points of interest labels
    },
    {
      featureType: "transit",
      elementType: "labels",
      stylers: [{ visibility: "off" }], // Hiding default bus stops
    },
    
  ],
};

const containerStyle = {
  width: "100%",
  height: "550px",
};

const center = {
  lat: 6.9271,
  lng: 79.8612,
};

function BusMap({ busLocation, stops }) {
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: "AIzaSyAJGs8eo5fJNIyJb60H3br0F-1-twWT2MY",
  });

  const mapRef = useRef();

  const onLoad = useCallback((map) => {
    mapRef.current = map;
  }, []);

  if (!isLoaded) return <div>Loading Map...</div>;

  return (
    <div className = "mapDiv">
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={busLocation || center}
        zoom={15}
        onLoad={onLoad}
        options = {mapOptions}
      >
        {/* Bus Marker */}
        {busLocation && <Marker position={busLocation} label="" />}

        {/* Stop Markers */}
        {stops?.map((stop, index) => (
          <Marker
            key={index}
            position={{ lat: stop.lat, lng: stop.lon }}
            label={stop.stopName}
            icon={{
              url: "http://maps.google.com/mapfiles/ms/icons/blue-dot.png",
            }}
          />
        ))}
      </GoogleMap>
      </div>
  );
}

export default BusMap;
