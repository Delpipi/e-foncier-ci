import { getLandDataList, getMillisecondsInDay } from "./api.mjs";

const visitDialog = document.querySelector('#dialogBox');
const closeDialog = document.querySelector('#dialogBox button');
const dialogMessage = document.querySelector('#dialogBox p');

const today = Date.now();

let lastVisited = Number(localStorage.getItem('last-visit-day'));

closeDialog.addEventListener('click', () => {
    visitDialog.close();
});

function initLastVisited() {
    lastVisited = Date.now();
    localStorage.setItem('last-visit-day', lastVisited);
}

function getDialogMessage(numberOfDays) {
    if (numberOfDays === 1) {
        return `You last visited ${numberOfDays} day ago`;
    } else {
        return `You last visited ${numberOfDays} days ago`;
    }
}

function showMessage() {
    //check if this visitor already visited the page
    if (lastVisited > 0 && !isNaN(lastVisited)) {
        //this visitor already visited the page
        const millisecondsInDay = getMillisecondsInDay();
        const numberOfDays = Math.floor((today - lastVisited) / millisecondsInDay);
        //console.log(`Number Of Days: ${numberOfDays}`);
        if (numberOfDays > 0) {
            dialogMessage.textContent = getDialogMessage(numberOfDays);
            initLastVisited();
        } else if (numberOfDays === 0) {
            dialogMessage.textContent = `Back so soon! Awesome!`;
        }
    } else {
        dialogMessage.textContent = `Welcome! Let us know if you have any questions.`;
        initLastVisited();
    }
    visitDialog.showModal();
}

// Mapbox access token using for demo
mapboxgl.accessToken = 'pk.eyJ1IjoiZGVscGlwaSIsImEiOiJjbWM1N3R4NHowbzNqMmpzYWhnZjRlOW1pIn0.XLAB6iCzNW9S7-v5bb6xow';

// Get land data in GeoJSON format
const landData = await getLandDataList();

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
        
        return `${formatToK(price1)}/${formatToK(price2)} FCFA`;
    }
    
    return priceString; // Return original if format doesn't match
}

// Initialize the map
const map = new mapboxgl.Map({
    container: 'map',
    center: [-5.55, 7.54],
    zoom: 6,
});

map.on('load', () => {
    // Add land parcels data source
    map.addSource('land-parcels', {
        'type': 'geojson',
        'data': landData
    });

    // Add markers layer
    map.addLayer({
        'id': 'land-parcels-layer',
        'type': 'circle',
        'source': 'land-parcels',
        'paint': {
            'circle-radius': [
                'interpolate',
                ['linear'],
                ['zoom'],
                10, 8,
                15, 15
            ],
            'circle-color': '#283618',
            'circle-stroke-width': 2,
            'circle-stroke-color': '#ffffff',
            'circle-opacity': 1
        }
    });

     // Add price labels layer
     map.addLayer({
        'id': 'price-labels',
        'type': 'symbol',
        'source': 'land-parcels',
        'layout': {
            'text-field': ['get', 'formattedPrice'],
            'text-font': ['Open Sans Bold', 'Arial Unicode MS Bold'],
            'text-size': [
                'interpolate',
                ['linear'],
                ['zoom'],
                10, 10,
                15, 14
            ],
            'text-offset': [0, -2], // Position above the marker
            'text-anchor': 'bottom',
            'text-allow-overlap': true,
            'text-ignore-placement': true
        },
       'paint': {
            'text-color': '#ffffff', // White text for better contrast on green
            'text-halo-color': '#283618', // Green halo matching the background
            'text-halo-width': 8, // Large halo to create circular effect
            'text-halo-blur': 0, // No blur for sharp circle
            'text-background-color': '#283618', // Green background
            'text-background-opacity': 1, // Fully opaque
            'text-background-padding': [6, 8, 6, 8] // More padding for circular shape
        }
    });
});

// Add navigation controls
map.addControl(new mapboxgl.NavigationControl(), 'bottom-right');
map.addControl(new mapboxgl.FullscreenControl(), 'bottom-right');

showMessage();