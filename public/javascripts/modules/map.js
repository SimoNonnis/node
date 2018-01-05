import axios from 'axios';
import { $ } from './bling';


const mapOptions = {
  center: { lat: 43.2, lng: -79.8},
  zoom: 8,
};

function loadPlaces(map, lat = 43.2, lng = -79.8) {

}

function makeMap(mapDiv) {
  if (!mapDiv) return;

  const map = new google.maps.Map(mapDiv, mapOptions);
  const input = $('[name="geolocate"]');
  const autocomplete = new google.maps.places.Autocomplete(input);
}

export default makeMap;
