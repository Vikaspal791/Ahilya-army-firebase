import { db, collection, addDoc } from './firebase-config.js';

document.getElementById('contactForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const mobile = document.getElementById('mobile').value;
    const message = document.getElementById('message').value;

    if (mobile.length !== 10) {
        alert('Please enter a valid 10-digit mobile number.');
        return;
    }

    try {
        await addDoc(collection(db, 'contacts'), {
            name,
            email,
            mobile,
            message,
            timestamp: new Date()
        });
        document.getElementById('successMessage').style.display = 'block';
        document.getElementById('contactForm').reset();
    } catch (error) {
        console.error("Error adding document: ", error);
        alert("There was an error submitting your message. Please try again.");
    }
});
