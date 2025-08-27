
const loader = document.querySelector('#loader');
const mainContent = document.querySelector('#main-content');

const landName = document.querySelector('#land-name');
const landProjet = document.querySelector('#land-projet');
const landPrix = document.querySelector('#land-price');
const landArea = document.querySelector('#land-area');
const landOwner = document.querySelector('#land-owner');
const landLoc = document.querySelector('#land-loc');
const landImages = document.querySelector('.swiper-wrapper');

//Get land detail data from local storage
const land = JSON.parse(localStorage.getItem('selectedLandData'));

// Get coordinates for location display
const coords = land.geometry.coordinates;

function displayLandData(){
    if (land) {
        loader.style.display = 'none';
        mainContent.style.display = 'block';
    }
    landName.textContent = land.properties.name;
    landProjet.textContent = land.properties.name;
    landPrix.textContent = `Prix: ${land.properties.price}`;
    landArea.textContent = land.properties.area;
    landOwner.textContent = land.properties.owner;
    landLoc.textContent = `${coords[1].toFixed(4)}, ${coords[0].toFixed(4)}`;
}

function displaySwiper() {
    landImages.innerHTML = land.properties.images
        .map(image => `<div class="swiper-slide"><img src="${image}" alt="land picture" loading="lazy" width="840"></div>`)
        .join("");
}

function displayMap() {
    const coords = land.geometry.coordinates;

    mapboxgl.accessToken = 'pk.eyJ1IjoiZGVscGlwaSIsImEiOiJjbWM1N3R4NHowbzNqMmpzYWhnZjRlOW1pIn0.XLAB6iCzNW9S7-v5bb6xow';
    
    const map = new mapboxgl.Map({
        style: 'mapbox://styles/mapbox/satellite-streets-v12',
        container: 'map',
        center: coords,
        zoom: 9
    });

    // Add navigation controls
    map.addControl(new mapboxgl.NavigationControl(), 'bottom-right');

    // Add fullscreen control
    map.addControl(new mapboxgl.FullscreenControl(), 'bottom-right');

    map.on('load', function () { 

        // Force a resize to ensure proper rendering
        setTimeout(() => {
            map.resize();
        }, 100);

        const polygon = land.properties.polygon;

        // Add point marker
        const pointMarker = new mapboxgl.Marker({
            color: '#ff0000'
        })
            .setLngLat(coords)
            .setPopup(
                new mapboxgl.Popup({
                    offset: 25
                }).setHTML(`
                <div style="text-align: center; padding: 5px;">
                    <strong>${land.properties.name}</strong><br>
                    <span style="color: #666;">${land.properties.formattedPrice || landData.properties.price}</span>
                </div>
            `)
            )
            .addTo(map);

        // Add polygon source
        map.addSource('land-polygon', {
            type: 'geojson',
            data: {
                type: 'Feature',
                geometry: polygon
            }
        });

        // Add polygon fill layer
        map.addLayer({
            id: 'land-polygon-fill',
            type: 'fill',
            source: 'land-polygon',
            paint: {
                'fill-color': '#667eea',
                'fill-opacity': 0.3
            }
        });

        // Add polygon outline layer
        map.addLayer({
            id: 'land-polygon-outline',
            type: 'line',
            source: 'land-polygon',
            paint: {
                'line-color': '#667eea',
                'line-width': 2
            }
        });

        // Fit map to polygon bounds
        const coordinates = polygon.coordinates[0];

        // Create bounds object
        const bounds = new mapboxgl.LngLatBounds();
        coordinates.forEach(coord => bounds.extend(coord));

        // Fit map to bounds with better padding
        map.fitBounds(bounds, {
            padding: 50,
            linear: false,
            maxZoom: 17,
        });

    });
}

// Initialize Swiper with responsive settings
var swiper = new Swiper(".swiper", {
    centeredSlides: true,
    grabCursor: true,
    loop: true,
    autoplay: {
        delay: 4000,
        disableOnInteraction: false,
    },
    pagination: {
        el: ".swiper-pagination",
        clickable: true,
    },
    // Responsive breakpoints
    breakpoints: {
        // Mobile (320px and up)
        320: {
            slidesPerView: 1,
        },
        // Tablet (768px and up)
        768: {
            slidesPerView: 1,
        },
        // Desktop (1024px and up)
        1024: {
            slidesPerView: 1,
        },
        // Large desktop (1280px and up)
        1280: {
            slidesPerView: 1,
        }
    }
});



displaySwiper();
displayLandData();
displayMap();
