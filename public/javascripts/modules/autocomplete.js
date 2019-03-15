function autocomplete(input, latInput, lngInput){
  if(!input) return; //skip this fn from running if there is not input om the page
  const dropdown = new google.maps.places.Autocomplete(input);
  dropdown.addListener('place_changed', () => {
    const place = dropdown.getPlace();
    latInput.value = place.geometry.location.lat();
    lngInput.value = place.geometry.location.lng();
  });
  input.on('keydown', (e) => {
    if(e.code === 13) e.preventDefaults();
  })
}

export default autocomplete;
// gMAps key: AIzaSyAZlfBP5utilyc8EhWKeZPhwo-CDtE0xKc
