//calculating the distance between the bus and the next bus stop
//Harvensine formunla
function calcDistance(stopLatitude, stopLongitude, currentLatitude, currentLongitude) {
  const earthRadius = 6371000;

  function toRadians(degree) {
    return degree * (Math.PI / 180);
  }

  const stopLat = toRadians(stopLatitude);
  const stopLon = toRadians(stopLongitude);

  const currentLat = toRadians(currentLatitude);
  const currentLon = toRadians(currentLongitude);

  const deltaLat = currentLat - stopLat;
  const deltaLon = currentLon - stopLon;

  const a = 
    Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) + 
    Math.cos(stopLat) * Math.cos(currentLat) *
    Math.sin(deltaLon / 2) * Math.sin(deltaLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  const distance = earthRadius * c;

  return distance; // meters
}



module.exports = calcDistance;