var map = L.map('map').setView([-23.176, -47.281], 13);

const light = L.tileLayer( // mapa claro
    'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    {
        attribution: '&copy; OpenStreetMap'
    }
);
const dark = L.tileLayer( // mapa escuro
    'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png',
    {
        attribution: '&copy; CartoDB'
    }
);
light.addTo(map);

var icones = {
    futebol: L.icon({
        iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41]
    }),
    basquete: L.icon({
        iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-orange.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41]
    }),

    tenis: L.icon({
        iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-yellow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41]
    }),

    padrao: L.icon({
        iconUrl: 'https://cdn-icons-png.flaticon.com/512/252/252025.png',
        iconSize: [25, 41],
        iconAnchor: [15, 30]
    }) 
};

const iconePreto = L.icon({ // icone preto para localizçao do usuario
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-black.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34]
});

function pegar_loc() {  
    map.locate({
        setView: true,
        maxZoom: 16,
        enableHighAccuracy: true
    });
}
map.on("locationfound", function(e){
    console.log("LOCALIZAÇÃO OK");
    console.log(e.latlng);
    L.marker(e.latlng)
        .addTo(map)
        .bindPopup("Você está aqui")
        .openPopup();

});
map.on("locationerror", function(e){
    console.log("ERRO");
    console.log(e);
    alert(e.message);
});

let count_futebol = 0;
let count_basquete = 0;
let count_tenis = 0;
let count_outros = 0;

function escolherIcone(tipo){ // funçaõ que retorna o icone certo 
    if (!tipo) return null;

    tipo = tipo.toLowerCase();

    if (tipo.includes("futebol")){
        count_futebol++;
        return icones.futebol; 
    } 
    if (tipo.includes("basquete")){
        count_basquete++;
        return icones.basquete; 
    }
    if (tipo.includes("tênis")){
        count_tenis++;
        return icones.tenis; 
    }
    count_outros++;
    return null;
}

fetch('saltoGJON.geojson') // Carrega o GeoJSON da cidade de Salto
    .then(res => res.json())
    .then(data => {
    
    var cityLayer = L.geoJSON(data, {
        style: {color: 'blue', weight: 2, fillOpacity: 0.1}
    }).addTo(map);

    map.setMaxBounds(cityLayer.getBounds());
    map.options.maxBoundsViscosity = 1.0; // impede o usuario de sair do limite
});
 
fetch('dados_com_bairro.json') // quadra + bairro 
.then(res => res.json())
.then(data => {
    data.forEach(item => {
        let icone = escolherIcone(item.tipo);
        if (icone) {
            L.marker([item.latitude, item.longitude], { icon: icone })
                .addTo(map)
                .bindPopup(
                    `<b>${item.categoria}</b><br>
                     <b>${item.latitude} </b> <br>
                     <b>${item.longitude} </b> <br>
                     Esporte: ${item.tipo}<br>
                     Bairro: ${item.bairro}`
                );
        } else {
            L.marker([item.latitude, item.longitude])
                .addTo(map)
                .bindPopup(
                    `<b>${item.categoria}</b><br>
                     <b>${item.latitude} </b> <br>
                     <b>${item.longitude} </b> <br>
                     Esporte: ${item.tipo}<br>
                     Bairro: ${item.bairro}`
                );
        }
    });
    console.log("futebol -> ", count_futebol);
    console.log("basquete ->", count_basquete);
    console.log("tenis ->", count_tenis);
    console.log("outros ->", count_outros);
});

fetch('praca.geojson') // mapa da praças de salto-SP
.then(res => res.json())
.then(data => {

    L.geoJSON(data, {
        style: {
            color: 'black',
            weight: 2,
            fillOpacity: 0.3
        },
        onEachFeature: function(feature, layer) {
            let nome = feature.properties.name || "Praça";
            layer.bindPopup("<b>" + nome + "</b>");
        }
    }).addTo(map);
});

function alterarFundo(elemento,cor1,cor2){ // parte para mudar o fundo do main (header)
    if (elemento.style.backgroundColor === cor1){
        elemento.style.backgroundColor = cor2;
        elemento.style.color = cor1;
    }
    else{
        elemento.style.backgroundColor = cor1;
        elemento.style.color = cor2;
    } 
}

const chechbox = document.getElementById("checkbox");
checkbox.addEventListener("change", function () {
    if (checkbox.checked) {
        alterarFundo(document.querySelector('.main'),'white','black');
        map.removeLayer(dark);
        map.addLayer(light);
    } else {
        alterarFundo(document.querySelector('.main'),'black','white');
        map.removeLayer(light);
        map.addLayer(dark);
    }
});
