
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getFirestore, collection, getDocs, query, where, orderBy } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";
// Import shared data
import { stateDistrictMap, ALL_POSITIONS } from './shared-data.js';

document.addEventListener('DOMContentLoaded', () => {
    // Firebase initialization
    const firebaseConfig = {
       apiKey: "AIzaSyD-I0xUOqdAfCksKPRauG1FyKG3ySqaS-E",
       authDomain: "ahilya-army-website.firebaseapp.com",
       projectId: "ahilya-army-website",
       storageBucket: "ahilya-army-website.appspot.com",
       messagingSenderId: "724971338661",
       appId: "1:724971338661:web:163c50a8c700bc89a3c64c",
       measurementId: "G-YH8YF0REQT"
    };
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);

    const teamLevelFilter = document.getElementById('teamLevelFilter');
    const stateFilter = document.getElementById('stateFilter');
    const districtFilter = document.getElementById('districtFilter');
    const teamMembersContainer = document.getElementById('teamMembers');

    // Populate states dropdown
    function populateStates() {
        const states = Object.keys(stateDistrictMap);
        states.forEach(state => {
            const option = document.createElement('option');
            option.value = state;
            option.textContent = state;
            stateFilter.appendChild(option);
        });
    }

    // Handle state change
    function handleStateChange() {
        const selectedState = stateFilter.value;
        districtFilter.innerHTML = '<option value="">All Districts</option>'; // Reset
        if (selectedState && stateDistrictMap[selectedState]) {
            const districts = stateDistrictMap[selectedState];
            districts.forEach(district => {
                const option = document.createElement('option');
                option.value = district;
                option.textContent = district;
                districtFilter.appendChild(option);
            });
            districtFilter.disabled = false;
        } else {
            districtFilter.disabled = true;
        }
    }

    // Fetch and display members
    async function fetchAndDisplayMembers() {
        const teamLevel = teamLevelFilter.value;
        const state = stateFilter.value;
        const district = districtFilter.value;

        if (!teamLevel) {
            teamMembersContainer.innerHTML = '<p>Please select a team level to see members.</p>';
            return;
        }

        teamMembersContainer.innerHTML = '<div class="loading">Loading...</div>';

        try {
            let conditions = [where("teamLevel", "==", teamLevel)];
            if (state) conditions.push(where("state", "==", state));
            if (district) conditions.push(where("district", "==", district));

            const q = query(collection(db, "teamMembers"), ...conditions, orderBy("name"));
            const snapshot = await getDocs(q);

            if (snapshot.empty) {
                teamMembersContainer.innerHTML = '<p>No members found for the selected criteria.</p>';
                return;
            }

            let html = '<div class="cards-container">';
            snapshot.forEach(doc => {
                const member = doc.data();
                html += `
                    <div class="member-card">
                        <img src="${member.photoURL || 'images/placeholder.png'}" alt="Photo of ${member.name}">
                        <div class="member-info">
                            <h4>${member.name}</h4>
                            <p class="position">${member.position}</p>
                            <p>${member.district}, ${member.state}</p>
                        </div>
                    </div>`;
            });
            html += '</div>';
            teamMembersContainer.innerHTML = html;

        } catch (error) {
            console.error("Error fetching members: ", error);
            teamMembersContainer.innerHTML = '<p class="error">Error loading members. Please try again.</p>';
        }
    }

    // Initial setup and event listeners
    populateStates();
    stateFilter.addEventListener('change', handleStateChange);
    teamLevelFilter.addEventListener('change', fetchAndDisplayMembers);
    stateFilter.addEventListener('change', fetchAndDisplayMembers);
    districtFilter.addEventListener('change', fetchAndDisplayMembers);

    // Initial load
    fetchAndDisplayMembers();
});
