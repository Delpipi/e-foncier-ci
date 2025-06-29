import { getLandDataList } from "./api.mjs";

const landContainer = document.querySelector('#land-list');

// Mapbox access token using for demo
mapboxgl.accessToken = 'pk.eyJ1IjoiZGVscGlwaSIsImEiOiJjbWM1N3R4NHowbzNqMmpzYWhnZjRlOW1pIn0.XLAB6iCzNW9S7-v5bb6xow';

// Get land data in GeoJSON format
const landData = await getLandDataList();

//build land
function buildLand(land) {
    return `
        <div class="land-card">
            <div class="land-card-header">
                <img src="images/adonkoi1.jpg" alt="Land Picture" loading="lazy" class="responsive-img">
            </div>
            <div class="land-card-content">
                <h2 class="title">${land.properties.name}</h2>
                <p class="superficies">${land.properties.area}</p>
                <p class="price">${land.properties.price}</p>
                <p class="owner">${land.properties.owner}</p>
            </div>
        </div>
    `;
}

function renderLandList() {
    landContainer.innerHTML = landData.features.map(feature => buildLand(feature)).join("");
}

//Render LandList
renderLandList();

// *** ADD THIS: Process the data to add formatted prices ***
landData.features.forEach(feature => {
    feature.properties.formattedPrice = formatPrice(feature.properties.price);
});

// Function to format price text
function formatPrice(priceString) {
    // Extract numbers from price string like "12 000 000 / 9 000 000 FCFA"
    const matches = priceString.match(/(\d+(?:\s+\d+)*)\s*\/\s*(\d+(?:\s+\d+)*)\s*FCFA/);
    
    if (matches) {
        const price1 = matches[1].replace(/\s+/g, ''); // Remove spaces
        const price2 = matches[2].replace(/\s+/g, ''); // Remove spaces
        
        // Convert to thousands format
        const formatToK = (num) => {
            const number = parseInt(num);
            if (number >= 1000000) {
                return Math.floor(number / 1000000) + 'M';
            } else if (number >= 1000) {
                return Math.floor(number / 1000) + 'K';
            }
            return number.toString();
        };
        
        return `${formatToK(price1)} / ${formatToK(price2)} FCFA`;
    }
    
    return priceString; // Return original if format doesn't match
}

//Function to create speech bubble HTML
function createSpeechBubble(price) {
    const div = document.createElement('div');
    div.className = 'price-bubble';
    div.innerHTML = `
        <div class="bubble-content">${price}</div>
        <div class='bubble-arrow'></div>
    `;
    return div;
}

//Function to create marker dot
function createMarkerDot() {
    const div = document.createElement('div');
    div.className = 'marker-dot';
    return div;
}

// Initialize the map
const map = new mapboxgl.Map({
    container: 'map',
    center: [-5.55, 7.54],
    zoom: 6,
});

map.on('load', () => {
    // Add markers with speech bubbles
    landData.features.forEach(feature => {
        const coordinates = feature.geometry.coordinates;
        const formattedPrice = formatPrice(feature.properties.price);

        //Create speech bubble
        const speechBubble = createSpeechBubble(formattedPrice);

        //Create marker dot
        const marketDot = createMarkerDot();

        //Add speech bubble marker
        new mapboxgl.Marker({
            element: speechBubble,
            anchor: 'bottom'
        })
            .setLngLat(coordinates)
            .addTo(map);
        
        //Add dot marker
        new mapboxgl.Marker({
            element: marketDot,
            anchor: 'center'
        })
            .setLngLat(coordinates)
            .addTo(map);
    });
});

// Add navigation controls
map.addControl(new mapboxgl.NavigationControl(), 'bottom-right');
map.addControl(new mapboxgl.FullscreenControl(), 'bottom-right');