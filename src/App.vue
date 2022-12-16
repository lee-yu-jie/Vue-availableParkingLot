<template>
  <div class="container">
    <div id="map"></div>
    <button class="selfbtn" @click="returnMy"><GlobeAsiaAustraliaIcon /></button>
  </div>
</template>

<script setup>
import { Loader } from "@googlemaps/js-api-loader";
import { reactive, onMounted, ref } from 'vue'
import axios from 'axios'
import parking from '@/assets/parking.png'
import selficon from '@/assets/self.png'
import { GlobeAsiaAustraliaIcon } from '@heroicons/vue/24/solid'

const states = reactive({
  google: null,
  map: null,
  markers: null,
});
let preInfoWindow = ref('')
let TaichungParking = reactive([])
let TainanParking = reactive([])
const TaichungMarkers = reactive([])
const TainanMarkers = reactive([])

onMounted(async () => {
  await initMap();
  await handleLoadData()
});

const getSelfPosition = () => axios.post('https://www.googleapis.com/geolocation/v1/geolocate?key=AIzaSyCmv7eemUtSQ6T-38_kHyWwhId0Tjm3Q0Q').then(res => res.data.location)

const initMap = async () => {
  let selfposition = {}
  const loader = new Loader({
    apiKey: 'AIzaSyCmv7eemUtSQ6T-38_kHyWwhId0Tjm3Q0Q',
    version: "weekly",
    libraries: ["places"],
    language: "zh-TW",
  });
  selfposition = await getSelfPosition()
  states.google = await loader.load();
  states.map = new states.google.maps.Map(document.getElementById("map"), {
    center: selfposition,
    zoom: 15,
    mapTypeControl: false,
    fullscreenControl: false,
  });
  new states.google.maps.Marker({
    position: selfposition,
    map: states.map,
    draggable: true,
    icon: {
      url: selficon,
      size: new states.google.maps.Size(60, 60),
      scaledSize: new states.google.maps.Size(50, 50),
    },
  });
};

const openInfoWindows = (parkingMaker, infowindow) => {   
    preInfoWindow.value && preInfoWindow.value.close()
    preInfoWindow.value = infowindow
    infowindow.open(map, parkingMaker);
} 

const handleInfoMarker = ( item ) => {
  const parkingMaker = new states.google.maps.Marker({
    position: { lat: Number(item.lat), lng: Number(item.lng) },
    map: states.map,
    draggable: false,
    icon: {
        url: parking,
        size: new states.google.maps.Size(50, 50),
        scaledSize: new states.google.maps.Size(50, 50),
    },
    id: item.id
  });
  const infowindow = new google.maps.InfoWindow({
    content: `
    <p class='textStyle'>位置: ${item.position}</p>
    <hr />
    <p class='textStyle'>剩餘車位 : ${item.availableCar}</p>
    `,
    position: { lat: Number(item.lat), lng: Number(item.lng) },
  });
  parkingMaker.addListener('click', function () {
    openInfoWindows(parkingMaker, infowindow)
  });
}

const handleDataProcessing = () => {
  // 台中
  TaichungParking.data.map(data => {
    data.ParkingLots.map(item => {
      item.AvailableCar = item.AvailableCar <= 0 ? '無車位' : item.AvailableCar
      TaichungMarkers.push({ 
        lat: item.Y, 
        lng: item.X, 
        availableCar: item.AvailableCar, 
        id: item.ID,
        position: item.Position
      })
    })
  })
  // 台南
  console.log(TainanParking.data);
  TainanParking.data.map( item => {
    item.car = item.car <= 0 ? '無車位' : item.car
    let x = item.lnglat.split(',')[1]
    let y = item.lnglat.split(',')[0]
    TainanMarkers.push({
      lat: y, 
      lng: x,
      availableCar: item.car,
      id: item.id,
      position: item.address
    })
  })
}

const handleCreateMarkers = () => {
  TaichungMarkers.forEach(item => { handleInfoMarker(item) });
  TainanMarkers.forEach(item => { handleInfoMarker(item) });
}

const returnMy = async() => {
  await initMap()
  await handleLoadData()
}
async function handleLoadData (){
  TaichungParking = await axios.get('https://motoretag.taichung.gov.tw/DataAPI/api/ParkingSpotListAPI')
  TainanParking = await axios.get('/api/parking.php')
  axios.get('/OpenData/GetParkInfo').then(res => {console.log(res);})

  handleDataProcessing()
  handleCreateMarkers()
};

// function getLocation() {
//   if (navigator.geolocation) {
//     navigator.geolocation.getCurrentPosition(position => {
//       console.log(position)
//     });
//   } else { 
//     console.log("Geolocation is not supported by this browser.")
//   }
// }
// getLocation()
</script>

<style>
p{
  margin: 0;
}
div{
  padding: 0;
}
#app{
  height: 100%;
}
.container{
  height: 100vh;
  position: relative;
}
.selfbtn{
  position: absolute;
  bottom: 250px;
  right: 10px;
  padding: 5px 5px;
  background: white;
  border: 0;
  box-shadow: 5px 5px 10px rgb(184, 183, 183);
  cursor: pointer;
}
#map{
  position: absolute;
  top: 0;
  bottom: 50px;
  right: 0;
  left: 0;
}
.textStyle{
  font-weight: 600;
  font-size: 16px;
}
svg{
  height: 30px;
  width: 30px;
  color: rgb(140, 0, 255);
  animation: spin 2s infinite linear;
}
.selfbtn:hover svg{
  color: rgb(0, 119, 255);
  animation: spin 1s infinite linear;
}
@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(359deg);
  }
}
</style>

