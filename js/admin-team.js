import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getFirestore, collection, getDocs, getDoc, doc, addDoc, updateDoc, deleteDoc, writeBatch, serverTimestamp, query, orderBy } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-analytics.js";

let db;

// --- SHARED CONFIGURATION (Keep consistent with joinus.js) ---
const stateDistrictMap ={
    "Andaman and Nicobar Islands": ["Nicobar", "North and Middle Andaman", "South Andaman"],
    "Andhra Pradesh": ["Anantapur", "Chittoor", "East Godavari", "Guntur", "Krishna", "Kurnool", "Nellore", "Prakasam", "Srikakulam", "Visakhapatnam", "Vizianagaram", "West Godavari", "Y.S.R. Kadapa"],
    "Arunachal Pradesh": ["Tawang", "West Kameng", "East Kameng", "Papum Pare", "Kurung Kumey", "Kra Daadi", "Lower Subansiri", "Upper Subansiri", "West Siang", "East Siang", "Siang", "Upper Siang", "Lower Siang", "Lower Dibang Valley", "Dibang Valley", "Anjaw", "Lohit", "Namsai", "Changlang", "Tirap", "Longding"],
    "Assam": ["Baksa", "Barpeta", "Biswanath", "Bongaigaon", "Cachar", "Charaideo", "Chirang", "Darrang", "Dhemaji", "Dhubri", "Dibrugarh", "Goalpara", "Golaghat", "Hailakandi", "Hojai", "Jorhat", "Kamrup Metropolitan", "Kamrup", "Karbi Anglong", "Karimganj", "Kokrajhar", "Lakhimpur", "Majuli", "Morigaon", "Nagaon", "Nalbari", "Dima Hasao", "Sivasagar", "Sonitpur", "South Salmara-Mankachar", "Tinsukia", "Udalguri", "West Karbi Anglong"],
    "Bihar": ["Araria", "Arwal", "Aurangabad", "Banka", "Begusarai", "Bhagalpur", "Bhojpur", "Buxar", "Darbhanga", "East Champaran", "Gaya", "Gopalganj", "Jamui", "Jehanabad", "Kaimur", "Katihar", "Khagaria", "Kishanganj", "Lakhisarai", "Madhepura", "Madhubani", "Munger", "Muzaffarpur", "Nalanda", "Nawada", "Patna", "Purnia", "Rohtas", "Saharsa", "Samastipur", "Saran", "Sheikhpura", "Sheohar", "Sitamarhi", "Siwan", "Supaul", "Vaishali", "West Champaran"],
    "Chandigarh": ["Chandigarh"],
    "Chhattisgarh": ["Balod", "Baloda Bazar", "Balrampur", "Bastar", "Bemetara", "Bijapur", "Bilaspur", "Dantewada", "Dhamtari", "Durg", "Gariaband", "Janjgir-Champa", "Jashpur", "Kabirdham", "Kanker", "Kondagaon", "Korba", "Koriya", "Mahasamund", "Mungeli", "Narayanpur", "Raigarh", "Raipur", "Rajnandgaon", "Sukma", "Surajpur", "Surguja"],
    "Dadra and Nagar Haveli and Daman and Diu": ["Dadra and Nagar Haveli", "Daman", "Diu"],
    "Delhi": ["Central Delhi", "East Delhi", "New Delhi", "North Delhi", "North East Delhi", "North West Delhi", "Shahdara", "South Delhi", "South East Delhi", "South West Delhi", "West Delhi"],
    "Goa": ["North Goa", "South Goa"],
    "Gujarat": ["Ahmedabad", "Amreli", "Anand", "Aravalli", "Banaskantha", "Bharuch", "Bhavnagar", "Botad", "Chhota Udaipur", "Dahod", "Dang", "Devbhoomi Dwarka", "Gandhinagar", "Gir Somnath", "Jamnagar", "Junagadh", "Kheda", "Kutch", "Mahisagar", "Mehsana", "Morbi", "Narmada", "Navsari", "Panchmahal", "Patan", "Porbandar", "Rajkot", "Sabarkantha", "Surat", "Surendranagar", "Tapi", "Vadodara", "Valsad"],
    "Haryana": ["Ambala", "Bhiwani", "Charkhi Dadri", "Faridabad", "Fatehabad", "Gurugram", "Hisar", "Jhajjar", "Jind", "Kaithal", "Karnal", "Kurukshetra", "Mahendragarh", "Nuh", "Palwal", "Panchkula", "Panipat", "Rewari", "Rohtak", "Sirsa", "Sonipat", "Yamunanagar"],
    "Himachal Pradesh": ["Bilaspur", "Chamba", "Hamirpur", "Kangra", "Kinnaur", "Kullu", "Lahaul & Spiti", "Mandi", "Shimla", "Sirmaur", "Solan", "Una"],
    "Jammu and Kashmir": ["Anantnag", "Bandipora", "Baramulla", "Budgam", "Doda", "Ganderbal", "Jammu", "Kathua", "Kishtwar", "Kulgam", "Kupwara", "Poonch", "Pulwama", "Rajouri", "Ramban", "Reasi", "Samba", "Shopian", "Srinagar", "Udhampur"],
    "Jharkhand": ["Bokaro", "Chatra", "Deoghar", "Dhanbad", "Dumka", "East Singhbhum", "Garhwa", "Giridih", "Godda", "Gumla", "Hazaribagh", "Jamtara", "Khunti", "Koderma", "Latehar", "Lohardaga", "Pakur", "Palamu", "Ramgarh", "Ranchi", "Sahebganj", "Seraikela Kharsawan", "Simdega", "West Singhbhum"],
    "Karnataka": ["Bagalkot", "Ballari", "Belagavi", "Bengaluru Rural", "Bengaluru Urban", "Bidar", "Chamarajanagar", "Chikkaballapur", "Chikkamagaluru", "Chitradurga", "Dakshina Kannada", "Davanagere", "Dharwad", "Gadag", "Hassan", "Haveri", "Kalaburagi", "Kodagu", "Kolar", "Koppal", "Mandya", "Mysuru", "Raichur", "Ramanagara", "Shivamogga", "Tumakuru", "Udupi", "Uttara Kannada", "Vijayapura", "Yadgir"],
    "Kerala": ["Alappuzha", "Ernakulam", "Idukki", "Kannur", "Kasaragod", "Kollam", "Kottayam", "Kozhikode", "Malappuram", "Palakkad", "Pathanamthitta", "Thiruvananthapuram", "Thrissur", "Wayanad"],
    "Ladakh": ["Kargil", "Leh"],
    "Lakshadweep": ["Lakshadweep"],
    "Madhya Pradesh": ["Agar Malwa", "Alirajpur", "Anuppur", "Ashoknagar", "Balaghat", "Barwani", "Betul", "Bhind", "Bhopal", "Burhanpur", "Chhatarpur", "Chhindwara", "Damoh", "Datia", "Dewas", "Dhar", "Dindori", "Guna", "Gwalior", "Harda", "Hoshangabad", "Indore", "Jabalpur", "Jhabua", "Katni", "Khandwa", "Khargone", "Mandla", "Mandsaur", "Morena", "Narsinghpur", "Neemuch", "Panna", "Raisen", "Rajgarh", "Ratlam", "Rewa", "Sagar", "Satna", "Sehore", "Seoni", "Shahdol", "Shajapur", "Sheopur", "Shivpuri", "Sidhi", "Singrauli", "Tikamgarh", "Ujjain", "Umaria", "Vidisha"],
    "Maharashtra": ["Ahmednagar", "Akola", "Amravati", "Aurangabad", "Beed", "Bhandara", "Buldhana", "Chandrapur", "Dhule", "Gadchiroli", "Gondia", "Hingoli", "Jalgaon", "Jalna", "Kolhapur", "Latur", "Mumbai City", "Mumbai Suburban", "Nagpur", "Nanded", "Nandurbar", "Nashik", "Osmanabad", "Palghar", "Parbhani", "Pune", "Raigad", "Ratnagiri", "Sangli", "Satara", "Sindhudurg", "Solapur", "Thane", "Wardha", "Washim", "Yavatmal"],
    "Manipur": ["Bishnupur", "Churachandpur", "Chandel", "Imphal East", "Imphal West", "Jiribam", "Kakching", "Kamjong", "Kangpokpi", "Noney", "Pherzawl", "Senapati", "Tamenglong", "Tengnoupal", "Thoubal", "Ukhrul"],
    "Meghalaya": ["East Garo Hills", "East Jaintia Hills", "East Khasi Hills", "North Garo Hills", "Ri Bhoi", "South Garo Hills", "South West Garo Hills", "South West Khasi Hills", "West Garo Hills", "West Jaintia Hills", "West Khasi Hills"],
    "Mizoram": ["Aizawl", "Champhai", "Kolasib", "Lawngtlai", "Lunglei", "Mamit", "Saiha", "Serchhip"],
    "Nagaland": ["Dimapur", "Kiphire", "Kohima", "Longleng", "Mokokchung", "Mon", "Peren", "Phek", "Tuensang", "Wokha", "Zunheboto"],
    "Odisha": ["Angul", "Balangir", "Balasore", "Bargarh", "Bhadrak", "Boudh", "Cuttack", "Deogarh", "Dhenkanal", "Gajapati", "Ganjam", "Jagatsinghpur", "Jajpur", "Jharsuguda", "Kalahandi", "Kandhamal", "Kendrapara", "Kendujhar", "Khordha", "Koraput", "Malkangiri", "Mayurbhanj", "Nabarangpur", "Nayagarh", "Nuapada", "Puri", "Rayagada", "Sambalpur", "Sonepur", "Sundargarh"],
    "Puducherry": ["Karaikal", "Mahe", "Puducherry", "Yanam"],
    "Punjab": ["Amritsar", "Barnala", "Bathinda", "Faridkot", "Fatehgarh Sahib", "Fazilka", "Ferozepur", "Gurdaspur", "Hoshiarpur", "Jalandhar", "Kapurthala", "Ludhiana", "Mansa", "Moga", "Mohali", "Muktsar", "Pathankot", "Patiala", "Rupnagar", "Sangrur", "Shaheed Bhagat Singh Nagar", "Tarn Taran"],
    "Rajasthan": ["Ajmer", "Alwar", "Banswara", "Baran", "Barmer", "Bharatpur", "Bhilwara", "Bikaner", "Bundi", "Chittorgarh", "Churu", "Dausa", "Dholpur", "Dungarpur", "Hanumangarh", "Jaipur", "Jaisalmer", "Jalore", "Jhalawar", "Jhunjhunu", "Jodhpur", "Karauli", "Kota", "Nagaur", "Pali", "Pratapgarh", "Rajsamand", "Sawai Madhopur", "Sikar", "Sirohi", "Sri Ganganagar", "Tonk", "Udaipur"],
    "Sikkim": ["East Sikkim", "North Sikkim", "South Sikkim", "West Sikkim"],
    "Tamil Nadu": ["Ariyalur", "Chengalpattu", "Chennai", "Coimbatore", "Cuddalore", "Dharmapuri", "Dindigul", "Erode", "Kallakurichi", "Kanchipuram", "Kanyakumari", "Karur", "Krishnagiri", "Madurai", "Nagapattinam", "Namakkal", "Nilgiris", "Perambalur", "Pudukkottai", "Ramanathapuram", "Ranipet", "Salem", "Sivaganga", "Tenkasi", "Thanjavur", "Theni", "Thoothukudi", "Tiruchirappalli", "Tirunelveli", "Tirupathur", "Tiruppur", "Tiruvallur", "Tiruvannamalai", "Tiruvarur", "Vellore", "Viluppuram", "Virudhunagar"],
    "Telangana": ["Adilabad", "Bhadradri Kothagudem", "Hyderabad", "Jagtial", "Jangaon", "Jayashankar Bhupalpally", "Jogulamba Gadwal", "Kamareddy", "Karimnagar", "Khammam", "Komaram Bheem Asifabad", "Mahabubabad", "Mahabubnagar", "Mancherial", "Medak", "Medchal-Malkajgiri", "Mulugu", "Nagarkurnool", "Nalgonda", "Narayanpet", "Nirmal", "Nizamabad", "Peddapalli", "Rajanna Sircilla", "Ranga Reddy", "Sangareddy", "Siddipet", "Suryapet", "Vikarabad", "Wanaparthy", "Warangal Rural", "Warangal Urban", "Yadadri Bhuvanagiri"],
    "Tripura": ["Dhalai", "Gomati", "Khowai", "North Tripura", "Sepahijala", "South Tripura", "Unakoti", "West Tripura"],
    "Uttar Pradesh": ["Agra", "Aligarh", "Ambedkar Nagar", "Amethi", "Amroha", "Auraiya", "Ayodhya", "Azamgarh", "Baghpat", "Bahraich", "Ballia", "Balrampur", "Banda", "Barabanki", "Bareilly", "Basti", "Bhadohi", "Bijnor", "Budaun", "Bulandshahr", "Chandauli", "Chitrakoot", "Deoria", "Etah", "Etawah", "Farrukhabad", "Fatehpur", "Firozabad", "Gautam Buddha Nagar", "Ghaziabad", "Ghazipur", "Gonda", "Gorakhpur", "Hamirpur", "Hapur", "Hardoi", "Hathras", "Jalaun", "Jaunpur", "Jhansi", "Kannauj", "Kanpur Dehat", "Kanpur Nagar", "Kasganj", "Kaushambi", "Kheri", "Kushinagar", "Lalitpur", "Lucknow", "Maharajganj", "Mahoba", "Mainpuri", "Mathura", "Mau", "Meerut", "Mirzapur", "Moradabad", "Muzaffarnagar", "Pilibhit", "Pratapgarh", "Prayagraj", "Raebareli", "Rampur", "Saharanpur", "Sambhal", "Sant Kabir Nagar", "Shahjahanpur", "Shamli", "Shravasti", "Siddharthnagar", "Sitapur", "Sonbhadra", "Sultanpur", "Unnao", "Varanasi"],
    "Uttarakhand": ["Almora", "Bageshwar", "Chamoli", "Champawat", "Dehradun", "Haridwar", "Nainital", "Pauri Garhwal", "Pithoragarh", "Rudraprayag", "Tehri Garhwal", "Udham Singh Nagar", "Uttarkashi"],
    "West Bengal": ["Alipurduar", "Bankura", "Birbhum", "Cooch Behar", "Dakshin Dinajpur", "Darjeeling", "Hooghly", "Howrah", "Jalpaiguri", "Jhargram", "Kalimpong", "Kolkata", "Malda", "Murshidabad", "Nadia", "North 24 Parganas", "Paschim Bardhaman", "Paschim Medinipur", "Purba Bardhaman", "Purba Medinipur", "Purulia", "South 24 Parganas", "Uttar Dinajpur"]
};

const ALL_POSITIONS = {
    "District": ["District President", "District Vice President", "District General Secretary", "District Secretary", "District Treasurer", "District Media Incharge", "District Spokesperson"],
    "Block": ["Block President", "Block Vice President", "Block General Secretary", "Block Secretary", "Block Treasurer", "Block Media Incharge", "Block Spokesperson"],
    "Tehsil": ["Tehsil President", "Tehsil Vice President", "Tehsil General Secretary", "Tehsil Secretary", "Tehsil Treasurer", "Tehsil Media Incharge", "Tehsil Spokesperson"],
    "Member": ["Member"] // For basic members not holding a position
};
// --- END OF SHARED CONFIGURATION ---

let previewedData = []; // To hold data from file preview

function initializeFirebase() {
    if (db) return true;
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
       getAnalytics(app);
       return true;
    } catch (error) {
        console.error("Firebase initialization failed: ", error);
        alert("Could not connect to the database.");
        return false;
    }
}

// --- FORM AND DROPDOWN LOGIC ---
function populateStates() {
    const stateSelect = document.getElementById('state');
    if (!stateSelect) return;
    const states = Object.keys(stateDistrictMap).sort();
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
    if (!stateSelect || !districtSelect) return;
    const selectedState = stateSelect.value;
    districtSelect.innerHTML = '<option value="">-- Select District --</option>';
    if (selectedState && stateDistrictMap[selectedState]) {
        const districts = stateDistrictMap[selectedState].sort();
        districts.forEach(district => {
            const option = document.createElement('option');
            option.value = district;
            option.textContent = district;
            districtSelect.appendChild(option);
        });
    }
}

function updatePositionDropdown() {
    const teamLevelSelect = document.getElementById('teamLevel');
    const positionSelect = document.getElementById('position');
    const selectedLevel = teamLevelSelect.value;

    positionSelect.innerHTML = '';
    if (selectedLevel && ALL_POSITIONS[selectedLevel]) {
        ALL_POSITIONS[selectedLevel].forEach(pos => {
            const option = document.createElement('option');
            option.value = pos;
            option.textContent = pos;
            positionSelect.appendChild(option);
        });
    } else {
        positionSelect.innerHTML = '<option value="">-- Select Level First --</option>';
    }
}

// --- DATA LOADING AND DISPLAY ---
async function loadAllData() {
    await loadJoinRequests();
    await loadMembers();
}

async function loadJoinRequests() {
    const requestsList = document.getElementById('requests-list');
    if (!db || !requestsList) return;
    requestsList.innerHTML = 'Loading...';
    try {
        const q = query(collection(db, "joinRequests"), orderBy("requestDate", "desc"));
        const snapshot = await getDocs(q);
        requestsList.innerHTML = snapshot.empty ? '<p>No pending requests.</p>' : '';
        snapshot.forEach(doc => {
            const request = doc.data();
            const card = document.createElement('div');
            card.className = 'request-card';
            card.id = `request-${doc.id}`;
            let content = ``;
            if (request.joinType === 'worker') {
                const address = [request.address1, request.block, request.district, request.state, request.postalCode].filter(Boolean).join(', ');
                content = `
                    <div style="display:flex; gap: 15px;">
                        <img src="${request.photoURL}" alt="${request.name}" style="width:80px; height:80px; border-radius:50%; object-fit:cover;">
                        <div>
                            <p><strong>Name:</strong> ${request.name}</p>
                            <p><strong>Type:</strong> <span style="font-weight:bold;">Worker</span></p>
                             <p><strong>Applying for:</strong> ${request.requestedPosition} (${request.teamLevel})</p>
                        </div>
                    </div>
                    <p><strong>Mobile:</strong> ${request.mobile}</p>
                    <p><strong>Address:</strong> ${address}</p>
                `;
            } else {
                content = `<p><strong>Name:</strong> ${request.name}</p><p><strong>Type:</strong> Member</p><p><strong>Location:</strong> ${request.district}, ${request.state}</p>`;
            }
            card.innerHTML = content + `
                <div class="request-actions">
                    <button class="btn-approve">Approve</button>
                    <button class="btn-reject">Reject</button>
                </div>`;
            card.querySelector('.btn-approve').addEventListener('click', () => handleApproveClick(doc.id, request));
            card.querySelector('.btn-reject').addEventListener('click', () => handleRejectClick(doc.id));
            requestsList.appendChild(card);
        });
    } catch (e) { console.error(e); requestsList.innerHTML = 'Error loading requests.'; }
}

async function loadMembers() {
    const container = document.getElementById('existingMembers');
    if (!db || !container) return;
    container.innerHTML = 'Loading...';
    try {
        const snapshot = await getDocs(collection(db, "teamMembers"));
        let table = `<table class="results-table"><thead><tr><th>Name</th><th>Level</th><th>Position</th><th>District</th><th>Actions</th></tr></thead><tbody>`;
        snapshot.forEach(doc => {
            const member = doc.data();
            table += `<tr>
                <td data-label="Name">${member.name}</td>
                <td data-label="Level">${member.teamLevel || 'N/A'}</td>
                <td data-label="Position">${member.position}</td>
                <td data-label="District">${member.district}</td>
                <td data-label="Actions">
                    <button class="btn-edit" data-id="${doc.id}">Edit</button>
                    <button class="btn-delete" data-id="${doc.id}">Delete</button>
                </td></tr>`;
        });
        container.innerHTML = table + '</tbody></table>';
    } catch (e) { console.error(e); container.innerHTML = 'Error loading members.'; }
}

// --- FORM/BUTTON ACTIONS ---
function clearForm() {
    const form = document.getElementById('teamMemberForm');
    form.reset();
    form.memberId.value = '';
    form.joinRequestId.value = '';
    form.photoURL.value = '';
    handleStateChange();
    updatePositionDropdown();
}

function handleApproveClick(requestId, reqData) {
    clearForm();
    const form = document.getElementById('teamMemberForm');
    form.joinRequestId.value = requestId;
    form.name.value = reqData.name || '';
    form.fatherName.value = reqData.fatherName || '';
    form.mobile.value = reqData.mobile || '';
    form.state.value = reqData.state || '';
    handleStateChange();
    setTimeout(() => { form.district.value = reqData.district || ''; }, 100); // Allow districts to populate

    if (reqData.joinType === 'worker') {
        form.teamLevel.value = reqData.teamLevel || '';
        form.email.value = reqData.email || '';
        form.address.value = [reqData.address1, reqData.block, reqData.district, reqData.state, reqData.postalCode].filter(Boolean).join(', ');
        form.photoURL.value = reqData.photoURL || ''; // Carry over photoURL
        updatePositionDropdown();
        setTimeout(() => { form.position.value = reqData.requestedPosition || ''; }, 100);
    } else {
        form.teamLevel.value = 'Member';
        form.address.value = [reqData.district, reqData.state].filter(Boolean).join(', ');
        updatePositionDropdown();
        setTimeout(() => { form.position.value = 'Member'; }, 100);
    }
    form.scrollIntoView({ behavior: 'smooth' });
}

async function handleRejectClick(requestId) {
    if (!confirm('Are you sure you want to reject this request permanently?')) return;
    try {
        await deleteDoc(doc(db, "joinRequests", requestId));
        document.getElementById(`request-${requestId}`).remove();
    } catch (e) { console.error(e); alert('Error rejecting request.'); }
}

async function handleFormSubmit(e) {
    e.preventDefault();
    if (!db) return alert("DB not connected.");
    const form = document.getElementById('teamMemberForm');
    const memberData = {
        name: form.name.value, fatherName: form.fatherName.value,
        teamLevel: form.teamLevel.value, position: form.position.value,
        mobile: form.mobile.value, email: form.email.value,
        address: form.address.value, state: form.state.value, district: form.district.value,
        photoURL: form.photoURL.value, // Save photo URL
        createdAt: serverTimestamp()
    };
    const memberId = form.memberId.value, joinRequestId = form.joinRequestId.value;

    try {
        if (joinRequestId) { // Approving a request
            const batch = writeBatch(db);
            batch.set(doc(collection(db, "teamMembers")), memberData);
            batch.delete(doc(db, "joinRequests", joinRequestId));
            await batch.commit();
            alert('Member approved and added!');
        } else if (memberId) { // Updating
            await updateDoc(doc(db, "teamMembers", memberId), memberData);
            alert('Member updated!');
        } else { // Manual Add
            await addDoc(collection(db, "teamMembers"), memberData);
            alert('Member added manually!');
        }
        clearForm();
        loadAllData();
    } catch (e) { console.error(e); alert('Error saving member.'); }
}

// --- FILE UPLOAD AND PARSING LOGIC ---

async function handleFileUpload() {
    const file = document.getElementById('fileInput').files[0];
    if (!file) return alert('Please select a file.');

    let data = [];
    try {
        if (file.name.endsWith('.csv')) {
            data = await parseCSV(file);
        } else if (file.name.endsWith('.xlsx')) {
            data = await parseExcel(file);
        } else if (file.name.endsWith('.pdf')) {
            alert('Parsing PDF... This might take a moment.');
            data = await parsePDF(file);
        } else {
            return alert('Unsupported file type. Please use CSV, XLSX, or PDF.');
        }
        if (data.length === 0) return alert('No data found or file is empty.');
        previewedData = data; // Store for batch add
        displayPreview(data);
    } catch (e) {
        console.error('File parsing error:', e);
        alert('Failed to parse file: ' + e.message);
    }
}

function parseCSV(file) {
    return new Promise((resolve, reject) => {
        Papa.parse(file, { header: true, skipEmptyLines: true, complete: res => resolve(res.data), error: err => reject(err) });
    });
}

function parseExcel(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const workbook = XLSX.read(e.target.result, { type: 'binary' });
                const sheetName = workbook.SheetNames[0];
                const jsonData = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);
                resolve(jsonData);
            } catch (err) { reject(err); }
        };
        reader.onerror = (err) => reject(err);
        reader.readAsBinaryString(file);
    });
}

async function parsePDF(file) {
    const reader = new FileReader();
    return new Promise((resolve, reject) => {
        reader.onload = async (e) => {
            try {
                // Set workerSrc for pdf.js
                pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.12.313/pdf.worker.min.js`;
                const pdf = await pdfjsLib.getDocument({ data: e.target.result }).promise;
                let allText = '';
                for (let i = 1; i <= pdf.numPages; i++) {
                    const page = await pdf.getPage(i);
                    const textContent = await page.getTextContent();
                    allText += textContent.items.map(item => item.str).join(' ') + '\n';
                }
                // This is a very basic heuristic parser. It assumes CSV-like data within the PDF.
                // It won't work well with complex layouts.
                const lines = allText.split('\n').filter(line => line.trim() !== '');
                if (lines.length < 2) reject(new Error('PDF does not contain enough data or is not in a simple text format.'));
                
                const headers = lines[0].split(/\s{2,}|,/).map(h => h.trim()); // Split by multiple spaces or comma
                const data = [];
                for(let i=1; i<lines.length; i++){
                    const values = lines[i].split(/\s{2,}|,/).map(v => v.trim());
                    let row = {};
                    for(let j=0; j<headers.length; j++){
                       row[headers[j]] = values[j] || '';
                    }
                    data.push(row);
                }
                resolve(data);

            } catch (err) { reject(err); }
        };
        reader.readAsArrayBuffer(file);
    });
}

function displayPreview(data) {
    const previewArea = document.getElementById('preview-area');
    const previewCard = document.getElementById('preview-card');
    if (data.length === 0) {
        previewArea.innerHTML = '<p>No data to display.</p>';
        previewCard.style.display = 'none';
        return;
    }
    const headers = Object.keys(data[0]);
    let table = `<table class="results-table"><thead><tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr></thead><tbody>`;
    data.forEach(row => {
        table += `<tr>${headers.map(h => `<td data-label="${h}">${row[h] || ''}</td>`).join('')}</tr>`;
    });
    previewArea.innerHTML = table + '</tbody></table>';
    previewCard.style.display = 'block';
    previewCard.scrollIntoView({ behavior: 'smooth' });
}

async function addAllFromPreview() {
    if (previewedData.length === 0 || !confirm(`Add ${previewedData.length} members to the database?`)) return;
    if (!db) return alert('DB not connected.');
    const batch = writeBatch(db);
    const required = ['name', 'fatherName', 'teamLevel', 'position', 'mobile', 'state', 'district'];
    const missingHeaders = required.filter(h => !previewedData[0].hasOwnProperty(h));
    if(missingHeaders.length > 0) return alert(`File is missing required headers: ${missingHeaders.join(', ')}`);

    previewedData.forEach(row => {
        // Basic validation
        if (row.name && row.position && row.mobile) {
             const newMemberRef = doc(collection(db, "teamMembers"));
             // Ensure all required fields have at least empty string value
             const memberData = {
                name: row.name || '', fatherName: row.fatherName || '',
                teamLevel: row.teamLevel || '', position: row.position || '',
                mobile: row.mobile || '', email: row.email || '',
                address: row.address || '', state: row.state || '', district: row.district || '',
                photoURL: '', createdAt: serverTimestamp()
             };
             batch.set(newMemberRef, memberData);
        }
    });
    try {
        await batch.commit();
        alert(`Successfully added ${previewedData.length} members!`);
        previewedData = [];
        document.getElementById('preview-card').style.display = 'none';
        document.getElementById('fileInput').value = '';
        loadMembers();
    } catch (e) { console.error(e); alert('Error saving members.'); }
}

// --- EVENT LISTENERS INITIALIZATION ---
document.addEventListener('DOMContentLoaded', () => {
    const loginBtn = document.getElementById('loginBtn');
    loginBtn.addEventListener('click', () => {
        if (document.getElementById('password').value === "admin123") { // Simple password check
            document.getElementById('loginSection').style.display = 'none';
            document.getElementById('adminPanel').style.display = 'block';
            if (initializeFirebase()) loadAllData();
        } else { alert('Incorrect password.'); }
    });

    populateStates();
    document.getElementById('state').addEventListener('change', handleStateChange);
    document.getElementById('teamLevel').addEventListener('change', updatePositionDropdown);
    document.getElementById('teamMemberForm').addEventListener('submit', handleFormSubmit);
    document.getElementById('clearFormBtn').addEventListener('click', clearForm);
    document.getElementById('uploadFileBtn').addEventListener('click', handleFileUpload);
    document.getElementById('addAllBtn').addEventListener('click', addAllFromPreview);

    // Event delegation for edit/delete buttons on existing members
    document.getElementById('existingMembers').addEventListener('click', async e => {
        const target = e.target;
        const memberId = target.dataset.id;
        if (!memberId) return;

        if (target.classList.contains('btn-edit')) {
            const snap = await getDoc(doc(db, "teamMembers", memberId));
            if (snap.exists()) {
                clearForm();
                const member = snap.data();
                const form = document.getElementById('teamMemberForm');
                form.memberId.value = memberId;
                form.name.value = member.name;
                form.fatherName.value = member.fatherName;
                form.mobile.value = member.mobile;
                form.email.value = member.email;
                form.address.value = member.address;
                form.photoURL.value = member.photoURL || '';
                form.state.value = member.state;
                await handleStateChange(); // wait for districts to populate
                form.district.value = member.district;
                form.teamLevel.value = member.teamLevel;
                updatePositionDropdown();
                 setTimeout(() => { form.position.value = member.position; }, 100); // Allow positions to populate
                form.scrollIntoView({ behavior: 'smooth' });
            }
        } else if (target.classList.contains('btn-delete')) {
            if (confirm('Are you sure you want to delete this member?')) {
                try {
                    await deleteDoc(doc(db, "teamMembers", memberId));
                    alert('Member deleted!');
                    loadMembers();
                } catch (err) { console.error(err); alert('Error deleting member.'); }
            }
        }
    });

    updatePositionDropdown(); // Initial call
});
