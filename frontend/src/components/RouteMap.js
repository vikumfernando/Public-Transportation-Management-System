import React, { useCallback, useEffect, useRef} from "react";
import "../styles/RoutesPage.css";
import {
  GoogleMap,
  useJsApiLoader,
  Marker,
  Polyline,
} from "@react-google-maps/api";

//To remove unwanted tags and names from the map
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
    }
  ],
};

const containerStyle = {
  width: "100%",
  height: "700px",
};

const center = {
  lat: 6.9271,
  lng: 79.8612,
};

function RouteMap({ stops }) {
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: "AIzaSyAJGs8eo5fJNIyJb60H3br0F-1-twWT2MY",
  });
  
  const mapRef = useRef();

  const onLoad = useCallback((map) => {
    mapRef.current = map;
  }, []);


  if (!isLoaded) return <div>Loading Map...</div>;

  const path = stops?.map((stop) => ({ lat: stop.lat, lng: stop.lon })) || [];

  return (
    <div className = "mapDiv2">
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={center}
        zoom={14}
        onLoad={onLoad}
        options={mapOptions}
      >
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

        {path.length > 1 && (
          <Polyline
            path={path}
            options={{
              strokeColor: "black",
              strokeOpacity: 0.8,
              strokeWeight: 5,
            }}
          />
        )}
      </GoogleMap>
    </div>
  );
}

export default RouteMap;
