import { getLandDataList } from "./api.mjs";

const landContainer = document.querySelector('#land-list');

// Mapbox access token using for demo
mapboxgl.accessToken = 'pk.eyJ1IjoiZGVscGlwaSIsImEiOiJjbWM1N3R4NHowbzNqMmpzYWhnZjRlOW1pIn0.XLAB6iCzNW9S7-v5bb6xow';

// Get land data in GeoJSON format
const landData = await getLandDataList();

// Process data to separate points and polygons
function processLandData(data) {
    const processedData = {
        type: "FeatureCollection",
        features: []
    };

    data.features.forEach(feature => {
        const processedFeature = {
            type: "Feature",
            properties: {
                ...feature.properties,
                polygon: feature.properties.polygon || null,
                id: feature.properties.name.replace(/\s+/g, '_').toLowerCase()
            },
            geometry: null
        };

        if (Array.isArray(feature.geometry)) {
            feature.geometry.forEach(geom => {
                if (geom.type === "Point") {
                    processedFeature.geometry = geom;
                }
            });
        } else if (feature.geometry.type === "Point") {
            processedFeature.geometry = feature.geometry;
        }

        // ⚠️ NE PAS remplacer un vrai polygone déjà défini
        if (!processedFeature.properties.polygon && processedFeature.geometry) {
            const [lng, lat] = processedFeature.geometry.coordinates;
            const offset = 0.002;
            processedFeature.properties.polygon = {
                type: "Polygon",
                coordinates: [[
                    [lng - offset, lat + offset],
                    [lng + offset, lat + offset],
                    [lng + offset, lat - offset],
                    [lng - offset, lat - offset],
                    [lng - offset, lat + offset]
                ]]
            };
        }

        processedFeature.properties.formattedPrice = formatPrice(feature.properties.price);
        processedData.features.push(processedFeature);
    });

    return processedData;
}


// Process the land data
const processedLandData = processLandData(landData);

//build land
function buildLand(land) {
    return `
        <div class="land-card" data-land-id="${land.properties.id}">
            <div class="land-card-header">
                <img src="images/adonkoi1.jpg" alt="Land Picture" loading="lazy" class="responsive-img">
            </div>
            <div class="land-card-content">
                <h2 class="title">${land.properties.name}</h2>
                <p class="superficies">${land.properties.area}</p>
                <p class="price">${land.properties.price}</p>
                <p class="owner">${land.properties.owner}</p>
                <button class="view-details-btn" onclick="openDetailPage('${land.properties.id}')">
                    Voir les détails
                </button>
            </div>
        </div>
    `;
}

function renderLandList() {
    landContainer.innerHTML = processedLandData.features.map(feature => buildLand(feature)).join("");
}

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
function createSpeechBubble(price, landId) {
    const div = document.createElement('div');
    div.className = 'price-bubble';
    div.style.cursor = 'pointer';
    div.innerHTML = `
        <div class="bubble-content">${price}</div>
        <div class='bubble-arrow'></div>
    `;
    
    // Add click handler to open detail page
    div.addEventListener('click', () => {
        openDetailPage(landId);
    });
    
    return div;
}

//Function to create marker dot
function createMarkerDot(landId) {
    const div = document.createElement('div');
    div.className = 'marker-dot';
    div.style.cursor = 'pointer';
    
    // Add click handler to open detail page
    div.addEventListener('click', () => {
        openDetailPage(landId);
    });
    
    return div;
}

// Function to open detail page
function openDetailPage(landId) {
    // Find the land data
    const landFeature = processedLandData.features.find(f => f.properties.id === landId);
    
    if (!landFeature) {
        console.error('Land not found:', landId);
        return;
    }
    
    // Store land data in localStorage for the detail page
    localStorage.setItem('selectedLandData', JSON.stringify(landFeature));
    
    // Open detail page in new window/tab
    window.open(`detail.html?id=${landId}`, '_blank');
}

// Make function global for onclick handlers
window.openDetailPage = openDetailPage;

// Initialize the map
const map = new mapboxgl.Map({
    container: 'map',
    center: [-5.55, 7.54],
    zoom: 6,
});

map.on('load', () => {
    // Add markers with speech bubbles
    processedLandData.features.forEach(feature => {
        const coordinates = feature.geometry.coordinates;
        const formattedPrice = feature.properties.formattedPrice;
        const landId = feature.properties.id;

        //Create speech bubble
        const speechBubble = createSpeechBubble(formattedPrice, landId);

        //Create marker dot
        const marketDot = createMarkerDot(landId);

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

//Render LandList
renderLandList();