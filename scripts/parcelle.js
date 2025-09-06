import { getLandDataList } from "./api.mjs";

const loader = document.querySelector("#loader");
const mainContent = document.querySelector('#main-content');
const landContainer = document.querySelector('#land-list');


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
        <div class="max-w-sm bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-lg hover:bg-gray-50 transition-shadow duration-300
        overflow-hidden" data-land-id="${land.properties.id}">
            <div class="land-card-header">
                <img src="images/adonkoi1.jpg" alt="Land Picture" loading="lazy" class="responsive-img">
            </div>
            <div class="p-small">
                <div class="flex flex-row flex-wrap justify-between">
                    <h2 class="font-bold">${land.properties.name}</h2>
                    <span class="bg-yellow-50 text-xs px-2.5 py-0.5 font-medium
                    rounded-full border border-yellow-400">${land.properties.area} m²</span>
                </div>
                
                <p class="text-xs font-bold text-secondary mb-medium">${land.properties.price}</p>
                <p class="text-sm"><i class="fa-solid fa-house mb-small"></i> ${land.properties.owner}</p>
                <button class="landBtnDetail w-full bg-accent-2 flex-1 hover:bg-secondary transition-colors duration-300 font-medium rounded-lg text-sm px-5 py-2 text-center"
                data-id="${land.properties.id}" >
                    Voir les détails
                </button>
            </div>
        </div>
    `;
}

function renderLandList() {
    landContainer.innerHTML = processedLandData.features.map(feature => buildLand(feature)).join("");
    document.querySelectorAll('.landBtnDetail').forEach(button => {
    button.addEventListener('click', function() {
        const landId = this.getAttribute('data-id');
        openDetailPage(landId);
    });
});
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

// Updated createCombinedMarker function
function createCombinedMarker(price, landId) {
    // Find the land data for the hover card
    const landFeature = processedLandData.features.find(f => f.properties.id === landId);

    const div = document.createElement('div');
    div.className = 'relative group cursor-pointer';
    div.style.display = 'flex';
    div.style.flexDirection = 'column';
    div.style.alignItems = 'center';

    div.innerHTML = `
        <!-- Speech Bubble -->
        <div class="bg-white border-2 border-secondary rounded-md px-2 py-1 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 relative mb-1">
            <div class="text-xs font-bold text-secondary whitespace-nowrap">${price}</div>
            <!-- Arrow pointing down -->
            <div class="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-[4px] border-r-[4px] border-t-[4px] border-l-transparent border-r-transparent border-t-secondary"></div>
            <div class="absolute top-full left-1/2 transform -translate-x-1/2 translate-y-[-1px] w-0 h-0 border-l-[3px] border-r-[3px] border-t-[3px] border-l-transparent border-r-transparent border-t-white"></div>
        </div>
        
        <!-- Marker Dot -->
        <div class="w-3 h-3 bg-secondary rounded-full border-2 border-secondary shadow-md"></div>
        
        <!-- Hover Card -->
        <div class="absolute bottom-full left transform -translate-x mb-xsmall opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none group-hover:pointer-events-auto z-50">
            <div class="w-64 bg-white border border-gray-200 rounded-lg shadow-xl overflow-hidden">
                <!-- Card Header -->
                <div class="h-32 bg-gradient-to-r from-blue-400 to-blue-600 relative overflow-hidden">
                    <img src="images/adonkoi1.jpg" alt="Land Picture" loading="lazy" 
                         class="w-full h-full object-cover opacity-75">
                    <div class="absolute inset-0 bg-black bg-opacity-20"></div>
                </div>
                
                <!-- Card Content -->
                <div class="p-4">
                    <div class="flex flex-row flex-wrap justify-between items-start mb-2">
                        <h2 class="font-bold text-gray-900 text-sm truncate flex-1 mr-2">${landFeature?.properties.name || 'Land Name'}</h2>
                        <span class="bg-yellow-50 text-xs px-2 py-1 font-medium rounded-full border border-yellow-400 whitespace-nowrap">
                            ${landFeature?.properties.area || '0'} m²
                        </span>
                    </div>
                    
                    <p class="text-xs font-bold text-blue-600 mb-2">${landFeature?.properties.price || price}</p>
                    <p class="text-xs text-gray-600 mb-3 flex items-center">
                        <i class="fa-solid fa-house mr-2"></i> 
                        ${landFeature?.properties.owner || 'Owner'}
                    </p>
                    
                    <button class="w-full bg-accent-2 hover:bg-secondary transition-colors duration-300 
                                     font-medium rounded-lg text-xs px-3 py-2 text-center">
                        Voir les détails
                    </button>
                </div>
            </div>
            
            <!-- Arrow pointing to speech bubble -->
            <div class="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-[6px] border-r-[6px] border-t-[6px] border-l-transparent border-r-transparent border-t-white"></div>
        </div>
    `;
    
    // Add click handler to open detail page
    div.addEventListener('click', (e) => {
        // Prevent click when interacting with the hover card
        if (!e.target.closest('.group-hover\\:opacity-100')) {
            openDetailPage(landId);
        }
    });
    
    // Add click handler specifically for the button in hover card
    const button = div.querySelector('button');
    if (button) {
        button.addEventListener('click', (e) => {
            e.stopPropagation();
            openDetailPage(landId);
        });
    }
    
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


// Add this code to your existing parcelle.js file, after the loadExpertData() call

// Search functionality
function initializeSearch() {
    const searchInput = document.getElementById('searchInput');
    let filteredLandData = processedLandData; // Keep track of filtered data
    
    // Function to filter land data based on search term
    function filterLandData(searchTerm) {
        if (!searchTerm.trim()) {
            return processedLandData; // Return all data if search is empty
        }
        
        const lowercaseSearch = searchTerm.toLowerCase();
        
        return {
            type: "FeatureCollection",
            features: processedLandData.features.filter(feature => {
                const properties = feature.properties;
                
                // Search in multiple fields
                return (
                    properties.name?.toLowerCase().includes(lowercaseSearch) ||
                    properties.owner?.toLowerCase().includes(lowercaseSearch) ||
                    //properties.city?.toLowerCase().includes(lowercaseSearch) ||
                    //properties.commune?.toLowerCase().includes(lowercaseSearch) ||
                    properties.agency?.toLowerCase().includes(lowercaseSearch) 
                    //properties.location?.toLowerCase().includes(lowercaseSearch)
                );
            })
        };
    }
    
    // Function to render filtered land list
    function renderFilteredLandList(filteredData) {
        landContainer.innerHTML = filteredData.features.map(feature => buildLand(feature)).join("");
    }
    
    // Function to update map markers based on filtered data
    function updateMapMarkers(filteredData, map) {
        // Clear existing markers
        const existingMarkers = document.querySelectorAll('.mapboxgl-marker');
        existingMarkers.forEach(marker => marker.remove());
        
        // Add new markers for filtered data
        filteredData.features.forEach(feature => {
            const coordinates = feature.geometry.coordinates;
            const formattedPrice = feature.properties.formattedPrice;
            const landId = feature.properties.id;

            const combinedMarker = createCombinedMarker(formattedPrice, landId);

            new mapboxgl.Marker({
                element: combinedMarker,
                anchor: 'bottom'
            })
                .setLngLat(coordinates)
                .addTo(map);
        });
        
        // Adjust map view to show all filtered results
        if (filteredData.features.length > 0) {
            const bounds = new mapboxgl.LngLatBounds();
            filteredData.features.forEach(feature => {
                bounds.extend(feature.geometry.coordinates);
            });
            map.fitBounds(bounds, { padding: 50, maxZoom: 12 });
        }
    }
    
    // Debounce function to avoid too many API calls
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
    
    // Search event handler
    const handleSearch = debounce((searchTerm, map) => {
        filteredLandData = filterLandData(searchTerm);
        renderFilteredLandList(filteredLandData);
        
        if (map) {
            updateMapMarkers(filteredLandData, map);
        }
        
        // Update results count (optional)
        console.log(`Found ${filteredLandData.features.length} results for "${searchTerm}"`);
    }, 300);
    
    // Add event listener to search input
    searchInput.addEventListener('input', (e) => {
        const searchTerm = e.target.value;
        // Get the map instance - you'll need to store it globally
        const map = window.currentMap; // Store map instance globally in displayMap()
        handleSearch(searchTerm, map);
    });
    
    // Clear search functionality (optional)
    searchInput.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            searchInput.value = '';
            handleSearch('', window.currentMap);
        }
    });
}

// Modified displayMap function to store map instance globally
// Replace your existing displayMap function with this:
function displayMap() {
    mapboxgl.accessToken = 'pk.eyJ1IjoiZGVscGlwaSIsImEiOiJjbWM1N3R4NHowbzNqMmpzYWhnZjRlOW1pIn0.XLAB6iCzNW9S7-v5bb6xow';

    const map = new mapboxgl.Map({
        container: 'map',
        center: [-5.55, 7.54],
        zoom: 6,
    });

    // Store map instance globally for search functionality
    window.currentMap = map;

    map.on('load', () => {
        processedLandData.features.forEach(feature => {
            const coordinates = feature.geometry.coordinates;
            const formattedPrice = feature.properties.formattedPrice;
            const landId = feature.properties.id;

            const combinedMarker = createCombinedMarker(formattedPrice, landId);

            new mapboxgl.Marker({
                element: combinedMarker,
                anchor: 'bottom'
            })
                .setLngLat(coordinates)
                .addTo(map);
        });
    });

    map.addControl(new mapboxgl.NavigationControl(), 'bottom-right');
    map.addControl(new mapboxgl.FullscreenControl(), 'bottom-right');
}

// Modified loadExpertData function to initialize search
function loadExpertData() {
    if (landData) {
        loader.style.display = 'none';
        mainContent.style.display = 'block';
        displayMap();
        renderLandList();
        
        // Initialize search functionality
        initializeSearch();
    }
}

loadExpertData();