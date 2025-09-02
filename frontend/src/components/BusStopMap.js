import React, { useCallback, useEffect, useRef} from "react";
import "../styles/searchRoute.css";
import {
  GoogleMap,
  useJsApiLoader,
  Marker,
} from "@react-google-maps/api";

//To remove unwanted tags and names from the map
const mapOptions = {
  disableDefaultUI: true, 
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
    }
  ],
};

const containerStyle = {
  width: "100%",
  height: "650px",
};

const center = {
  lat: 6.9271,
  lng: 79.8612,
};

function BusStopMap({ stops, pickedPosition, onPickPosition }) {
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: "AIzaSyAJGs8eo5fJNIyJb60H3br0F-1-twWT2MY",
  });
  
  const mapRef = useRef();

  const onLoad = useCallback((map) => {
    mapRef.current = map;
  }, []);

  useEffect(() => {
    if(!isLoaded || !mapRef.current) {
        return;
    }

    if (stops && !Array.isArray(stops)){
        mapRef.current.panTo({lat : stops.lat, lng : stops.lon});
    }

  }, [isLoaded, stops])

  if (!isLoaded) return <div>Loading Map...</div>;


  return (
    <div className="mapDiv">
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={center}
        zoom={16}
        onLoad={onLoad}
        options={mapOptions}
        onClick={(e) => {
          if (onPickPosition && e && e.latLng) {
            const lat = e.latLng.lat();
            const lng = e.latLng.lng();
            onPickPosition({ lat, lon: lng });
          }
        }}
      >
        {stops && !Array.isArray(stops) && (
          <Marker
            position={{ lat: stops.lat, lng: stops.lon }}
            icon={{
              url: process.env.PUBLIC_URL + "/images/busStopIcon.png",
              scaledSize: new window.google.maps.Size(30, 30),
            }}
          />
        )}

        {pickedPosition && !stops && (
          <Marker
            position={{ lat: pickedPosition.lat, lng: pickedPosition.lon }}
            icon={{
              url: "http://maps.google.com/mapfiles/ms/icons/red-dot.png",
            }}
          />
        )}

      </GoogleMap>
    </div>
  );
}

export default BusStopMap;