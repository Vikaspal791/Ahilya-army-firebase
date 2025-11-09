
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getFirestore, collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-storage.js";
// Import shared data
import { stateDistrictMap } from './shared-data.js';

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
    const storage = getStorage(app);

    const form = document.getElementById('joinForm');
    const stateSelect = document.getElementById('state');
    const districtSelect = document.getElementById('district');
    const photoInput = document.getElementById('photo');
    let photoFile = null;

    // Populate states dropdown
    function populateStates() { /* Unchanged */ }

    // Handle state change
    function handleStateChange() { /* Unchanged */ }

    photoInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file && file.type.startsWith('image/')) {
            photoFile = file;
        } else {
            alert('Please select a valid image file.');
            photoFile = null;
            e.target.value = null;
        }
    });

    // Handle form submission with IMAGE COMPRESSION
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const submitButton = form.querySelector('button[type="submit"]');
        
        if (!photoFile) {
            alert('Please select a photo to upload.');
            return;
        }

        submitButton.disabled = true;
        submitButton.textContent = 'Submitting...';

        // Compression options
        const options = {
            maxSizeMB: 0.5,       // Max file size 0.5MB
            maxWidthOrHeight: 1024, // Max width/height 1024px
            useWebWorker: true
        };

        try {
            // 1. Compress the image before uploading
            console.log(`Original image size: ${(photoFile.size / 1024 / 1024).toFixed(2)} MB`);
            const compressedFile = await imageCompression(photoFile, options);
            console.log(`Compressed image size: ${(compressedFile.size / 1024 / 1024).toFixed(2)} MB`);

            // 2. Upload the COMPRESSED photo to Firebase Storage
            const photoRef = ref(storage, `join_requests/${Date.now()}_${compressedFile.name}`);
            const uploadResult = await uploadBytes(photoRef, compressedFile);
            const photoURL = await getDownloadURL(uploadResult.ref);

            // 3. Save form data to Firestore
            const formData = {
                name: form.name.value,
                fatherName: form.fatherName.value,
                mobile: form.mobile.value,
                email: form.email.value,
                address: form.address.value,
                state: form.state.value,
                district: form.district.value,
                photoURL: photoURL,
                timestamp: serverTimestamp()
            };

            await addDoc(collection(db, "joinRequests"), formData);
            
            // 4. Show the new, improved success message
            alert('Thank you for becoming a part of the Ahilya Army community!');
            form.reset();
            districtSelect.innerHTML = '<option value="">-- Select District --</option>';
            districtSelect.disabled = true;
            photoFile = null;

        } catch (error) {
            console.error("Error during submission: ", error);
            alert('There was an error submitting your application. Please try again.');
        } finally {
            submitButton.disabled = false;
            submitButton.textContent = 'Submit Application';
        }
    });

    // Initial setup
    populateStates();
    stateSelect.addEventListener('change', handleStateChange);
});
