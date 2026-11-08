export type Coordinates = {
  latitude: number;
  longitude: number;
};

export type MapProvider = {
  getEmbedUrl: (coordinates: Coordinates, zoom: number) => string;
};

export const openStreetMapProvider: MapProvider = {
  getEmbedUrl({ latitude, longitude }, zoom) {
    const span = 0.18 / Math.max(1, zoom - 8);
    const bounds = [longitude - span, latitude - span, longitude + span, latitude + span].join(",");
    const params = new URLSearchParams({
      bbox: bounds,
      layer: "mapnik",
      marker: `${latitude},${longitude}`,
    });
    return `https://www.openstreetmap.org/export/embed.html?${params.toString()}`;
  },
};

export function distanceInMiles(from: Coordinates, to: Coordinates) {
  const radians = (degrees: number) => (degrees * Math.PI) / 180;
  const earthRadiusMiles = 3958.8;
  const latitudeDelta = radians(to.latitude - from.latitude);
  const longitudeDelta = radians(to.longitude - from.longitude);
  const startLatitude = radians(from.latitude);
  const endLatitude = radians(to.latitude);
  const haversine =
    Math.sin(latitudeDelta / 2) ** 2 +
    Math.cos(startLatitude) * Math.cos(endLatitude) * Math.sin(longitudeDelta / 2) ** 2;

  return earthRadiusMiles * 2 * Math.atan2(Math.sqrt(haversine), Math.sqrt(1 - haversine));
}
