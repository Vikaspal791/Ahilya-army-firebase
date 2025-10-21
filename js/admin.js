import { db, storage, collection, getDocs, deleteDoc, doc, updateDoc, getDoc, ref, uploadBytes, getDownloadURL } from './firebase-config.js';

document.addEventListener('DOMContentLoaded', () => {
    const loginSection = document.getElementById('loginSection');
    const adminPanel = document.getElementById('adminPanel');
    const passwordInput = document.getElementById('password');
    const loginBtn = document.getElementById('loginBtn');
    const membersTableBody = document.querySelector('#membersTable tbody');
    const searchInput = document.getElementById('searchInput');
    const exportCsvBtn = document.getElementById('exportCsvBtn');

    // Modal elements
    const idCardModal = document.getElementById('idCardModal');
    const closeModal = document.querySelector('.modal .close');
    const idCardContent = document.getElementById('idCard');
    const cardMemberName = document.getElementById('cardMemberName');
    const cardMemberId = document.getElementById('cardMemberId');
    const memberPhoto = document.getElementById('memberPhoto');
    const qrcodeContainer = document.getElementById('qrcode');
    const photoUpload = document.getElementById('photoUpload');
    const uploadPhotoBtn = document.getElementById('uploadPhotoBtn');
    const printCardBtn = document.getElementById('printCardBtn');

    let currentMemberDocId = null;

    // Login
    loginBtn.addEventListener('click', () => {
        if (passwordInput.value === 'admin1234') {
            loginSection.style.display = 'none';
            adminPanel.style.display = 'block';
            loadMembers();
        } else {
            alert('Incorrect password.');
        }
    });

    // Load members
    async function loadMembers() {
        membersTableBody.innerHTML = '';
        try {
            const querySnapshot = await getDocs(collection(db, 'members'));
            querySnapshot.forEach((doc) => {
                const member = doc.data();
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${member.memberId}</td>
                    <td>${member.name}</td>
                    <td>${member.fatherName}</td>
                    <td>${member.mobile}</td>
                    <td>${member.email}</td>
                    <td>${member.address}</td>
                    <td>
                        <button class="btn btn-sm" data-action="id-card" data-id="${doc.id}">ID Card</button>
                        <button class="btn btn-sm btn-danger" data-action="delete" data-id="${doc.id}">Delete</button>
                    </td>
                `;
                membersTableBody.appendChild(row);
            });
        } catch (error) {
            console.error("Error loading members: ", error);
        }
    }

    // Handle table actions (Delete, ID Card)
    membersTableBody.addEventListener('click', async (e) => {
        const target = e.target;
        if (target.tagName !== 'BUTTON') return;

        const action = target.dataset.action;
        const docId = target.dataset.id;

        if (action === 'delete') {
            if (confirm('Are you sure you want to delete this member?')) {
                try {
                    await deleteDoc(doc(db, 'members', docId));
                    loadMembers(); // Refresh the list
                    alert('Member deleted successfully.');
                } catch (error) {
                    console.error("Error deleting member: ", error);
                    alert('Failed to delete member.');
                }
            }
        }

        if (action === 'id-card') {
            currentMemberDocId = docId;
            openIdCardModal(docId);
        }
    });

    // Search functionality
    searchInput.addEventListener('keyup', () => {
        const searchTerm = searchInput.value.toLowerCase();
        const rows = membersTableBody.querySelectorAll('tr');
        rows.forEach(row => {
            const text = row.textContent.toLowerCase();
            row.style.display = text.includes(searchTerm) ? '' : 'none';
        });
    });

    // Export to CSV
    exportCsvBtn.addEventListener('click', async () => {
        let csvContent = "data:text/csv;charset=utf-8,Member ID,Name,Father's Name,Mobile,Email,Address\n";
        try {
            const querySnapshot = await getDocs(collection(db, 'members'));
            querySnapshot.forEach(doc => {
                const member = doc.data();
                const row = [member.memberId, member.name, member.fatherName, member.mobile, member.email, `"${member.address}"`].join(',');
                csvContent += row + "\n";
            });

            const encodedUri = encodeURI(csvContent);
            const link = document.createElement('a');
            link.setAttribute('href', encodedUri);
            link.setAttribute('download', 'ahilya_army_members.csv');
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (error) {
            console.error("Error exporting CSV: ", error);
        }
    });


    // --- ID Card Modal ---

    // Open modal and populate data
    async function openIdCardModal(docId) {
        try {
            const memberDoc = await getDoc(doc(db, 'members', docId));
            if (!memberDoc.exists()) {
                alert("Member not found!");
                return;
            }
            const member = memberDoc.data();

            cardMemberName.textContent = member.name;
            cardMemberId.textContent = member.memberId;
            memberPhoto.src = member.photoUrl || 'images/default-avatar.png';

            // Generate QR Code
            qrcodeContainer.innerHTML = ''; // Clear previous QR
            new QRCode(qrcodeContainer, {
                text: `Member ID: ${member.memberId}\nName: ${member.name}\nMobile: ${member.mobile}`,
                width: 100,
                height: 100
            });

            idCardModal.style.display = 'block';
        } catch (error) {
            console.error("Error fetching member for ID card:", error);
        }
    }

    // Close modal
    closeModal.onclick = () => {
        idCardModal.style.display = 'none';
    };
    window.onclick = (event) => {
        if (event.target == idCardModal) {
            idCardModal.style.display = 'none';
        }
    };

    // Upload Photo
    uploadPhotoBtn.addEventListener('click', async () => {
        const file = photoUpload.files[0];
        if (!file || !currentMemberDocId) {
            alert("Please select a photo to upload.");
            return;
        }

        const memberDocRef = doc(db, 'members', currentMemberDocId);
        const memberDoc = await getDoc(memberDocRef);
        const memberId = memberDoc.data().memberId;
        const storagePath = `member_photos/${memberId}_${file.name}`;
        const storageRef = ref(storage, storagePath);

        try {
            await uploadBytes(storageRef, file);
            const photoUrl = await getDownloadURL(storageRef);

            await updateDoc(memberDocRef, { photoUrl: photoUrl });

            memberPhoto.src = photoUrl;
            alert("Photo uploaded successfully!");
            photoUpload.value = ''; // Reset file input
        } catch (error) {
            console.error("Error uploading photo:", error);
            alert("Failed to upload photo.");
        }
    });

    // Print ID Card
    printCardBtn.addEventListener('click', () => {
        const printWindow = window.open('', '', 'height=600,width=800');
        printWindow.document.write('<html><head><title>Print ID Card</title>');
        printWindow.document.write('<link rel="stylesheet" href="style.css">'); // Optional: link your stylesheet
        printWindow.document.write('<style>body { margin: 20px; } .card { box-shadow: none; border: 1px solid #ccc; } </style>');
        printWindow.document.write('</head><body>');
        printWindow.document.write(idCardContent.innerHTML);
        printWindow.document.write('</body></html>');
        printWindow.document.close();
        printWindow.focus();
        setTimeout(() => { printWindow.print(); }, 500); // Wait for content to load
    });

});
