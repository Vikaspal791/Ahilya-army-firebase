
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getFirestore, collection, getDocs, getDoc, doc, addDoc, updateDoc, deleteDoc, writeBatch, serverTimestamp, query, orderBy } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";
import { getStorage, ref, deleteObject } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-storage.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-analytics.js";
// Import shared data
import { stateDistrictMap, ALL_POSITIONS } from './shared-data.js';

// These variables are declared globally but will only be assigned after login.
let db, storage;
let previewedData = [];

// --- POST-LOGIN INITIALIZATION ---

function initializeFirebase() {
    if (db) return true; // Avoid re-initializing
    try {
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
        db = getFirestore(app);
        storage = getStorage(app);
        getAnalytics(app);
        console.log("Firebase Initialized Successfully.");
        return true;
    } catch (error) {
        console.error("Firebase initialization failed: ", error);
        alert("CRITICAL: Could not connect to the database!");
        return false;
    }
}

// This function starts the entire admin panel after a successful login.
function startAdminPanel() {
    if (!initializeFirebase()) return; // Stop if Firebase fails
    loadJoinRequests();
    loadMembers();
    setupPanelEventListeners();
}

// --- DATA LOADING & DISPLAY (Requires DB) ---

async function loadJoinRequests() { 
    const list = document.getElementById('requests-list');
    if (!list) return;
    list.innerHTML = 'Loading requests...';
    try {
        const snapshot = await getDocs(query(collection(db, "joinRequests"), orderBy("timestamp", "desc")));
        if (snapshot.empty) {
            list.innerHTML = '<p>No pending join requests.</p>';
            return;
        }
        list.innerHTML = '';
        snapshot.forEach(doc => {
            const request = doc.data();
            list.innerHTML += `
                <div class="request-card">
                    <img src="${request.photoURL}" alt="Photo of ${request.name}" class="request-photo">
                    <div class="request-info">
                        <p><strong>Name:</strong> ${request.name}</p>
                        <p><strong>Mobile:</strong> ${request.mobile}</p>
                        <p><strong>State:</strong> ${request.state}</p>
                    </div>
                    <div class="request-actions">
                        <button class="btn-approve" data-id="${doc.id}">Approve</button>
                        <button class="btn-deny" data-id="${doc.id}">Deny</button>
                    </div>
                </div>`;
        });
    } catch (e) { console.error("Error loading requests: ", e); list.innerHTML = 'Error loading requests.'; }
}

async function loadMembers() { 
    // Function to load existing members - assumed to be correct
}

// --- FORM & UI LOGIC (Mixed dependencies) ---

function populateStates() {
    const stateSelect = document.getElementById('state');
    const states = Object.keys(stateDistrictMap);
    states.forEach(state => {
        const option = document.createElement('option');
        option.value = state;
        option.textContent = state;
        stateSelect.appendChild(option);
    });
}

function handleStateChange() {
    const stateSelect = document.getElementById('state');
    const districtSelect = document.getElementById('district');
    const selectedState = stateSelect.value;
    districtSelect.innerHTML = '<option value="">-- Select District --</option>'; // Reset
    if (selectedState && stateDistrictMap[selectedState]) {
        const districts = stateDistrictMap[selectedState];
        districts.forEach(district => {
            const option = document.createElement('option');
            option.value = district;
            option.textContent = district;
            districtSelect.appendChild(option);
        });
        districtSelect.disabled = false;
    } else {
        districtSelect.disabled = true;
    }
}

function updatePositionDropdown() {
    const level = document.getElementById('teamLevel').value;
    const positionSelect = document.getElementById('position');
    positionSelect.innerHTML = '<option value="">-- Select Position --</option>';
    if (level && ALL_POSITIONS[level]) {
        ALL_POSITIONS[level].forEach(pos => {
            const option = document.createElement('option');
            option.value = pos;
            option.textContent = pos;
            positionSelect.appendChild(option);
        });
        positionSelect.disabled = false;
    } else {
        positionSelect.disabled = true;
    }
}

function clearForm() { 
    document.getElementById('teamMemberForm').reset();
    document.getElementById('district').disabled = true;
    document.getElementById('position').disabled = true;
    document.getElementById('memberId').value = '';
    document.getElementById('joinRequestId').value = '';
}

// --- EVENT HANDLERS (All require DB) ---

async function handleFormSubmit(e) { 
    e.preventDefault();
    // Function to handle form submission - assumed to be correct
}

async function handleMemberActions(e) { 
    // Function to handle member actions like edit, delete - assumed to be correct
}

async function handleRequestActions(e) {
    const target = e.target;
    const requestId = target.dataset.id;
    if (!requestId) return;

    const requestDocRef = doc(db, "joinRequests", requestId);
    const requestSnap = await getDoc(requestDocRef);
    if (!requestSnap.exists()) return alert('Request not found.');
    const requestData = requestSnap.data();

    if (target.classList.contains('btn-approve')) {
        clearForm();
        const form = document.getElementById('teamMemberForm');
        form.joinRequestId.value = requestId;
        form.name.value = requestData.name || '';
        form.fatherName.value = requestData.fatherName || '';
        form.mobile.value = requestData.mobile || '';
        form.email.value = requestData.email || '';
        form.address.value = requestData.address || '';
        form.photoURL.value = requestData.photoURL || '';
        form.state.value = requestData.state || '';
        await handleStateChange();
        form.district.value = requestData.district || '';
        form.scrollIntoView({ behavior: 'smooth' });
        alert('Please select Team Level and Position, then click "Save Member".');
    } else if (target.classList.contains('btn-deny')) {
        if (confirm('Are you sure you want to deny this request? This will delete the request and the photo.')) {
            try {
                if (requestData.photoURL) {
                    const photoRef = ref(storage, requestData.photoURL);
                    await deleteObject(photoRef);
                }
                await deleteDoc(requestDocRef);
                loadJoinRequests();
            } catch (error) {
                console.error("Error denying request: ", error);
                alert("Could not deny the request. Check console for details.");
            }
        }
    }
}

function handleFileUpload() { /* unchanged */ }
async function addAllFromPreview() { /* unchanged */ }

// --- EVENT LISTENER & SCRIPT INITIALIZATION ---

function setupPanelEventListeners() {
    document.getElementById('teamMemberForm').addEventListener('submit', handleFormSubmit);
    document.getElementById('existingMembers').addEventListener('click', handleMemberActions);
    document.getElementById('requests-list').addEventListener('click', handleRequestActions);
    document.getElementById('uploadFileBtn').addEventListener('click', () => document.getElementById('fileInput').click());
    document.getElementById('addAllBtn').addEventListener('click', addAllFromPreview);
}

document.addEventListener('DOMContentLoaded', () => {
    populateStates();
    document.getElementById('state').addEventListener('change', handleStateChange);
    document.getElementById('teamLevel').addEventListener('change', updatePositionDropdown);
    document.getElementById('clearFormBtn').addEventListener('click', clearForm);

    const loginSection = document.getElementById('loginSection');
    const adminPanel = document.getElementById('adminPanel');
    const loginBtn = document.getElementById('loginBtn');
    const passwordInput = document.getElementById('password');

    const handleLogin = () => {
        const ADMIN_PASSWORD = "AABEM@2024";
        if (passwordInput.value === ADMIN_PASSWORD) {
            sessionStorage.setItem('isAdminLoggedIn', 'true');
            loginSection.style.display = 'none';
            adminPanel.style.display = 'block';
            startAdminPanel();
        } else {
            alert('Incorrect password!');
        }
    };

    if (sessionStorage.getItem('isAdminLoggedIn') === 'true') {
        loginSection.style.display = 'none';
        adminPanel.style.display = 'block';
        startAdminPanel();
    } else {
        loginSection.style.display = 'block';
        adminPanel.style.display = 'none';
    }

    loginBtn.addEventListener('click', handleLogin);
});
