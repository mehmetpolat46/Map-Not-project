import { detectType, setStorage, detectIcon } from './helpers.js';

//! html'den gelenler
const form = document.querySelector('form');
const list = document.querySelector('ul');

//! olat izleyicileri
form.addEventListener('submit', handleSubmit);
list.addEventListener('click', handleClick);

//! ortak kullanımı alanı (global değiken tanımalama)
var map;
var notes = JSON.parse(localStorage.getItem('notes')) || [];
var coords = [];
var layerGroup = [];

//! kullanıcnın konumunu öğrenme
navigator.geolocation.getCurrentPosition(
  loadMap,
  console.log('Kullanıcı kabul etmedi')
);

// haritaya tıklanınca çalışan fonk.
function onMapClick(e) {
  form.style.display = 'flex';
  coords = [e.latlng.lat, e.latlng.lng];
}

//! kullanıcnın konumuna göre ekrana haritayı basma
function loadMap(e) {
  // hartinaın kurulumunu yapar
  map = L.map('map').setView(
    [e.coords.latitude, e.coords.longitude],
    14
  );

  // haritanın nasıl gözküceğini belirler
  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '© OpenStreetMap',
  }).addTo(map);

  // haritada ekran basılacak imleçleri tutucağımız katman
  layerGroup = L.layerGroup().addTo(map);

  // local'den noteları listeleme
  renderNoteList(notes);

  // haritada bir tıklanma olduğunda çalışıcak fonksiyon
  map.on('click', onMapClick);
}

// ekran imleç basar
function renderMarker(item) {
  // marketı oluşturur
  L.marker(item.coords, { icon: detectIcon(item.status) })
    // imleçlerin olduğu katamana ekler
    .addTo(layerGroup)
    // üzerine tıklanınca açılıcak popup ekleme
    .bindPopup(` ${item.desc}`);
}

// formun gönderilmesi olayında çalışır
function handleSubmit(e) {
  e.preventDefault();

  const desc = e.target[0].value;
  const date = e.target[1].value;
  const status = e.target[2].value;

  // notlar dizsine eleman ekleme
  notes.push({
    id: new Date().getTime(),
    desc,
    date,
    status,
    coords,
  });

  // local'storage'ı güncelleme
  setStorage(notes);

  // notları listeleme
  renderNoteList(notes);

  // formu kapatma
  form.style.display = 'none';
  // Formu temizleme
  e.target.reset();
}

// erkana notları basma fonksiyonu
function renderNoteList(items) {
  // note'lar alanını temizler
  list.innerHTML = '';

  // imleçleri temizler
  layerGroup.clearLayers();

  // her bir note için fonk. çalıştırır
  items.forEach((item) => {
    // li elemanı oluşturur
    const listEle = document.createElement('li');

    // data 'sına sahip olduğu id 'yi ekleme
    listEle.dataset.id = item.id;

    // içeriği belirleme
    listEle.innerHTML = `
           <div>
              <p>${item.desc}</p>
              <p><span>Tarih:</span> ${item.date}</p>
              <p><span>Durum :</span> ${detectType(item.status)}</p>
            </div>
            <i id="fly" class="bi bi-airplane-engines-fill"></i>
            <i id="delete" class="bi bi-trash3-fill"></i>
    `;

    // htmldeki listeye elemanı ekleme
    list.insertAdjacentElement('afterbegin', listEle);
  

    // ekrana bas
    renderMarker(item);
  
    
  });
}

// notelar alanında tıklanma olayını izler
function handleClick(e) {
  // güncellinecek elemanın id'sini öğrenme
  const id = e.target.parentElement.dataset.id;
  if (e.target.id === 'delete') {
    // id sini bildğimiz elemanı diziden kaldırma
    notes = notes.filter((note) => note.id != id);

    // local'i gücelle
    setStorage(notes);

    // ekranı güncelle
    renderNoteList(notes);
  }

  if (e.target.id === 'fly') {
    const note = notes.find((note) => note.id == id);

    map.flyTo(note.coords);
  }
}


