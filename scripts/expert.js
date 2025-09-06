import { getExpertDataList } from "./api.mjs";

const loader = document.querySelector("#loader");
const mainContent = document.querySelector('#main-content');
const expertList = document.querySelector('#expertList');
const speciality = document.querySelector('#speciality');
const searchInput = document.querySelector('#searchInput');

var experts = await getExpertDataList();

let expertPerPage = 8;
let currentPage = 1;
let isLoadingMore = false;

let filteredExperts = [...experts]; 

function expertTemplate(expert) {
    return `
            <div class="block max-w-sm bg-white border border-gray-200 rounded-lg shadow-sm 
                hover:shadow-lg hover:bg-gray-50 transition-shadow duration-300 overflow-hidden p-small">
                    <div class="flex flex-row gap-xsmall">
                        <img class="w-16 h-16 mb-3 rounded-full shadow-lg object-cover"
                            src="${expert.photoProfil}" alt="expert picture">
                        <div class="flex-1">
                            <div class="flex flex-row justify-between items-center">
                                <h2 class="text-xl font-semibold">${expert.nom}</h2>
                                <span
                                    class="bg-green-100 text-green-800 text-xs font-medium me-2 px-2.5 py-0.5 
                                    rounded-full border border-green-400">${expert.statutVérification}</span>
                            </div>
                            <div class="flex flex-row gap-xsmall">
                                <p>
                                    ${renderStars(expert.noteMoyenne)}
                                    <span class="text-sm text-gray-600 ml-2">${expert.noteMoyenne}/5 (${expert.avis.length} avis)</span>
                                </p>
                            </div>
                            <p class="text-sm text-gray-500">
                                ${expert.localisation}
                            </p>
                        </div>
                    </div>
                    <p class="text-justify pt-xsmall">${expert.biographie}</p>
                    <div class="mt-small">
                        <p class="font-semibold text-sm">Spécialités:</p>
                        <div class="flex flex-row flex-wrap gap-xsmall mt-xsmall">
                            ${renderSpecialityList(expert.specialities)}
                        </div>
                    </div>
                    <div class="mt-small">
                        <p class="font-semibold text-sm">Services principaux:</p>
                        ${renderServicesList(expert.services)}
                    </div>
                    <div class="flex gap-xsmall mt-small">
                        <button id="btnContact" type="button" class="w-full bg-accent-2 flex-1 hover:bg-secondary transition-colors duration-300 
                                font-medium rounded-lg text-sm px-5 py-2 text-center">
                            Contacter
                        </button>
                        <button id="btnProfile" type="button" class="border border-secondary hover:bg-accent-2 transition-colors duration-300
                            font-medium rounded-lg text-sm px-5 py-2 text-center">
                            Voir profil
                        </button>
                    </div>
                </div>
    `;
}

//Fonction pour afficher les étoiles
function renderStars(rating) {
    let stars = '';
    for (let i = 1; i <= 5; i++){
        if (i <= rating) {
            stars += '<i class="fas fa-star text-yellow-400"></i>';
        } else if (i - 0.5 <= rating) {
            stars += '<i class="fas fa-star-half-alt text-yellow-400"></i>';
        } else {
            stars += '<i class="far fa-star text-gray-300"></i>';
        }
    }
    return stars;
}

function renderExpertBatch() {
    const start = (currentPage - 1) * expertPerPage;
    const end = currentPage * expertPerPage;
    const nextExperts = filteredExperts.slice(start, end);

    const expertsHTML = nextExperts.map(expert => expertTemplate(expert)).join("");
    expertList.insertAdjacentHTML('beforeend', expertsHTML);

    currentPage++;
    isLoadingMore = false;
}

function handleScroll() {
    if (isLoadingMore) return;

    const scrollBottom = window.innerHeight + window.scrollY;
    const threshold = document.body.offsetHeight - 100;

    if (scrollBottom >= threshold) {
        isLoadingMore = true;
        setTimeout(() => {
            renderExpertBatch();
        }, 300);
    }
}

function filterExperts() {
    const searchTerm = document.querySelector('#searchInput').value.toLowerCase();
    const selectedSpecialty = document.querySelector('#speciality').value;
    
    filteredExperts = experts.filter(expert => {
        const matchesSearch = expert.nom.toLowerCase().includes(searchTerm) ||
            expert.biographie.toLowerCase().includes(searchTerm) ||
            expert.localisation.toLowerCase().includes(searchTerm);
        
        const matchesSpecialty = !selectedSpecialty || expert.filtreSpecialite.includes(selectedSpecialty);
        
        return matchesSearch && matchesSpecialty;
    });
    
    // reset display
    expertList.innerHTML = "";
    currentPage = 1;
    renderExpertBatch();
}

function renderServicesList(services) {
    return services.map(service => `
        <div class="flex flex-row justify-between mt-xsmall text-sm">
            <p>${service.nomService}</p>
            <p>${service.tarif} FCFA</p>
        </div>`
    ).join("");
}

function renderSpecialityList(specialities) {
    return specialities.map(speciality => `<span class="bg-accent-3 text-secondary 
        text-xs font-medium px-2.5 py-0.5 rounded-full border border-accent-2">${speciality}</span>`).join("");
}

function loadExpertData() {
    if (experts) {
        loader.style.display = 'none';
        mainContent.style.display = 'block';
        renderExpertBatch();
        searchInput.addEventListener('input', filterExperts);
        speciality.addEventListener('change', filterExperts);
        window.addEventListener('scroll', handleScroll);
    }
    //console.table(experts);
}

loadExpertData();