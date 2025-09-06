const customer = document.querySelector('#customer');
const expertsPlans = document.querySelector('#experts-plans');
const clientsPlans = document.querySelector('#clients-plans');

customer.addEventListener('change', showPlan);

function showPlan(e) {
    let value = e.currentTarget.value;
    if (value === 'particulier') {
        expertsPlans.classList.add('hidden');
        clientsPlans.classList.remove('hidden');
    } else {
        clientsPlans.classList.add('hidden');
        expertsPlans.classList.remove('hidden');
    }
}