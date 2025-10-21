import { db, collection, addDoc, getDocs } from './firebase-config.js';

document.getElementById('joinForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = document.getElementById('name').value;
    const fatherName = document.getElementById('fatherName').value;
    const mobile = document.getElementById('mobile').value;
    const email = document.getElementById('email').value;
    const address1 = document.getElementById('address1').value;
    const address2 = document.getElementById('address2').value;
    const city = document.getElementById('city').value;
    const state = document.getElementById('state').value;
    const district = document.getElementById('district').value;
    const postalCode = document.getElementById('postalCode').value;
    const country = document.getElementById('country').value;

    if (mobile.length !== 10) {
        alert('Please enter a valid 10-digit mobile number.');
        return;
    }

    try {
        // Auto-generate member ID
        const membersCollection = collection(db, 'members');
        const querySnapshot = await getDocs(membersCollection);
        const memberCount = querySnapshot.size;
        const memberId = `AA2025${(memberCount + 1).toString().padStart(4, '0')}`;

        await addDoc(membersCollection, {
            memberId,
            name,
            fatherName,
            mobile,
            email,
            address: `${address1}, ${address2}, ${city}, ${state}, ${district} - ${postalCode}, ${country}`,
            registrationDate: new Date()
        });

        document.getElementById('registrationSuccessMessage').innerText = `Registration successful! Your ID: ${memberId}`;
        document.getElementById('registrationSuccessMessage').style.display = 'block';
        document.getElementById('joinForm').reset();
    } catch (error) {
        console.error("Error adding document: ", error);
        alert("There was an error with your registration. Please try again.");
    }
});
