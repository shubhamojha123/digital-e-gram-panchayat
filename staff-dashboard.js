// Staff Dashboard Specific JavaScript
console.log("Staff Dashboard script loaded.");
 
// Add staff-specific functions here, for example:
// function processApplications() { ... } 

// Firebase config (same as user-dashboard.html)
const firebaseConfig = {
    apiKey: "AIzaSyAirFsQ9LE0sWebU5kmWaNPDhDrlW-1hFs",
    authDomain: "e-gram-panchayat-cf771.firebaseapp.com",
    projectId: "e-gram-panchayat-cf771",
    storageBucket: "e-gram-panchayat-cf771.appspot.com",
    messagingSenderId: "605711670147",
    appId: "1:605711670147:web:34fb5debff69ca545834b6",
    measurementId: "G-X0EWKZDXKY"
};
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
const auth = firebase.auth();
const db = firebase.firestore();
const storage = firebase.storage();

document.addEventListener('DOMContentLoaded', function() {
    // Sidebar navigation logic (show/hide sections)
    const links = document.querySelectorAll('.sidebar nav ul li a');
    const sections = {
        'profile-link': document.getElementById('profile-section'),
        'services-link': document.getElementById('services-section'),
        'status-link': document.getElementById('status-section')
    };
    links.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            links.forEach(l => l.classList.remove('active'));
            this.classList.add('active');
            Object.values(sections).forEach(sec => sec.style.display = 'none');
            const activeSection = sections[this.id];
            if (activeSection) activeSection.style.display = 'block';
            if (this.id === 'status-link' && typeof renderStatus === 'function') renderStatus();
            if (this.id === 'services-link' && sections['services-link']) sections['services-link'].style.display = 'block';
        });
    });
    // Show profile by default
    Object.values(sections).forEach(sec => sec.style.display = 'none');
    sections['profile-link'].style.display = 'block';

    // --- Service Cards (no Apply for staff) ---
    const servicesCardsContainer = document.getElementById('services-cards-container');
    function renderServices() {
        db.collection('services').orderBy('label').onSnapshot(snapshot => {
            servicesCardsContainer.innerHTML = '';
            if (snapshot.empty) {
                servicesCardsContainer.innerHTML = '<p style="color:#888;">No services found.</p>';
                return;
            }
            snapshot.forEach(doc => {
                const data = doc.data();
                const card = document.createElement('div');
                card.className = 'service-card';
                card.style.background = '#fff';
                card.style.padding = '2rem 2.5rem';
                card.style.borderRadius = '16px';
                card.style.boxShadow = '0 4px 16px rgba(0,0,0,0.07)';
                card.style.width = '270px';
                card.style.textAlign = 'center';
                card.innerHTML = `
                    <div style="font-size:2.5rem;color:#667eea;"><i class="${data.icon || 'fas fa-cogs'}"></i></div>
                    <h3 style="margin:1rem 0 0.5rem 0;">${data.label}</h3>
                    <p>${data.desc || ''}</p>
                `;
                servicesCardsContainer.appendChild(card);
            });
        });
    }
    renderServices();

    // --- Status: Show all user applications ---
    const statusListContainer = document.getElementById('status-list-container');
    let servicesList = [];
    function fetchServicesAndRenderStatus() {
        db.collection('services').get().then(snapshot => {
            servicesList = [];
            snapshot.forEach(doc => servicesList.push(doc.data()));
            renderStatus();
        });
    }
    function renderStatus() {
        if (window._staffStatusUnsub) window._staffStatusUnsub();
        window._staffStatusUnsub = db.collection('applications').orderBy('appliedAt', 'desc').onSnapshot(snapshot => {
            statusListContainer.innerHTML = '';
            if (snapshot.empty) {
                statusListContainer.innerHTML = '<p style="color:#888;">No applications found.</p>';
                return;
            }
            snapshot.forEach(doc => {
                const data = doc.data();
                if (data.status === 'cancelled') return;
                const serviceObj = servicesList.find(s => s.key === data.service);
                const iconHtml = serviceObj ? `<i class='${serviceObj.icon}'></i>` : '<i class="fas fa-cogs"></i>';
                const label = serviceObj ? serviceObj.label : data.service;
                const desc = serviceObj ? serviceObj.desc : '';
                let statusHtml = '';
                if (data.status === 'pending') {
                    statusHtml = `
                        <button class="accept-btn" data-app-id="${doc.id}" style="background:#27ae60;color:#fff;padding:0.5rem 1.2rem;border:none;border-radius:5px;font-weight:600;font-size:1rem;cursor:pointer;">Accept</button>
                        <button class="reject-btn" data-app-id="${doc.id}" style="background:#e74c3c;color:#fff;padding:0.5rem 1.2rem;border:none;border-radius:5px;font-weight:600;font-size:1rem;cursor:pointer;margin-left:0.7rem;">Reject</button>
                    `;
                } else if (data.status === 'accepted') {
                    statusHtml = `<span style="background:#27ae60;color:#fff;padding:0.5rem 1.2rem;border-radius:5px;font-weight:600;font-size:1rem;">Accepted</span>`;
                } else if (data.status === 'rejected') {
                    statusHtml = `<span style="background:#e74c3c;color:#fff;padding:0.5rem 1.2rem;border-radius:5px;font-weight:600;font-size:1rem;">Rejected</span>`;
                }
                const card = document.createElement('div');
                card.className = 'service-card';
                card.style.background = '#fff';
                card.style.padding = '2rem 2.5rem';
                card.style.borderRadius = '16px';
                card.style.boxShadow = '0 4px 16px rgba(0,0,0,0.07)';
                card.style.width = '270px';
                card.style.textAlign = 'center';
                card.innerHTML = `
                    <div style="font-size:2.5rem;color:#667eea;">${iconHtml}</div>
                    <h3 style="margin:1rem 0 0.5rem 0;">${label}</h3>
                    <p>${desc}</p>
                    <div style="margin:0.7rem 0 0.2rem 0;font-size:0.97rem;color:#444;">User: <b>${data.email || ''}</b><br>UID: <span style="font-size:0.93rem;">${data.uid || ''}</span></div>
                    <div style="display:flex;gap:0.7rem;justify-content:center;margin-top:1.2rem;">${statusHtml}</div>
                `;
                statusListContainer.appendChild(card);
            });
            // Accept/Reject logic
            document.querySelectorAll('.accept-btn').forEach(btn => {
                btn.addEventListener('click', function() {
                    const appId = this.getAttribute('data-app-id');
                    db.collection('applications').doc(appId).update({ status: 'accepted' });
                });
            });
            document.querySelectorAll('.reject-btn').forEach(btn => {
                btn.addEventListener('click', function() {
                    const appId = this.getAttribute('data-app-id');
                    db.collection('applications').doc(appId).update({ status: 'rejected' });
                });
            });
        });
    }
    document.getElementById('status-link').addEventListener('click', fetchServicesAndRenderStatus);
    fetchServicesAndRenderStatus();

    // --- Profile Save Logic (Staff) ---
    const profileForm = document.getElementById('profile-form');
    const saveBtnContainer = document.getElementById('save-btn-container');
    const changeBtn = document.getElementById('change-profile-btn');
    const newProfileAvatar = document.getElementById('new-profile-avatar');
    const newProfileName = document.getElementById('new-profile-name');
    const newProfileMessage = document.getElementById('new-profile-message');
    const avatarUpload = document.getElementById('avatar-upload');
    let currentUser = null;
    let profileImageUrl = null;

    function updateCard(data) {
        if (data.photoURL) {
            newProfileAvatar.innerHTML = `<img src="${data.photoURL}" alt="Avatar" style="width:100%;height:100%;object-fit:cover;border-radius:50%;">`;
        } else {
            const initials = (data.firstName?.[0] || '') + (data.lastName?.[0] || '');
            newProfileAvatar.textContent = initials.toUpperCase() || 'U';
        }
        newProfileName.textContent = `${data.firstName || ''} ${data.lastName || ''}`;
        newProfileMessage.textContent = `Welcome to your profile!`;
    }
    function populateForm(data) {
        for (const key in data) {
            if (profileForm.elements[key]) {
                profileForm.elements[key].value = data[key];
            }
        }
    }
    function fetchProfile(uid) {
        db.collection('profiles').doc(uid).get().then(doc => {
            if (doc.exists) {
                const data = doc.data();
                profileImageUrl = data.photoURL || null;
                updateCard(data);
                populateForm(data);
                saveBtnContainer.style.display = 'none';
                changeBtn.style.display = 'block';
            } else {
                saveBtnContainer.style.display = 'block';
                changeBtn.style.display = 'none';
            }
        });
    }
    if (profileForm) {
        profileForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const formData = new FormData(profileForm);
            const profileData = Object.fromEntries(formData.entries());
            if (profileImageUrl) profileData.photoURL = profileImageUrl;
            if (currentUser) {
                profileData.email = currentUser.email;
                profileData.uid = currentUser.uid;
                db.collection('profiles').doc(currentUser.uid).set(profileData, { merge: true }).then(() => {
                    updateCard(profileData);
                    saveBtnContainer.style.display = 'none';
                    changeBtn.style.display = 'block';
                    // Show a quick popup
                    let popup = document.createElement('div');
                    popup.textContent = 'Profile saved!';
                    popup.style.position = 'fixed';
                    popup.style.top = '30px';
                    popup.style.left = '50%';
                    popup.style.transform = 'translateX(-50%)';
                    popup.style.background = '#27ae60';
                    popup.style.color = 'white';
                    popup.style.padding = '1rem 2rem';
                    popup.style.borderRadius = '8px';
                    popup.style.fontSize = '1.1rem';
                    popup.style.boxShadow = '0 4px 16px rgba(0,0,0,0.15)';
                    popup.style.zIndex = '9999';
                    document.body.appendChild(popup);
                    setTimeout(() => { popup.remove(); }, 1200);
                });
            }
        });
        changeBtn.addEventListener('click', function() {
            saveBtnContainer.style.display = 'block';
            changeBtn.style.display = 'none';
        });
        newProfileAvatar.addEventListener('click', function() {
            avatarUpload.click();
        });
        avatarUpload.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (!file || !currentUser) return;
            const storageRef = storage.ref().child(`avatars/${currentUser.uid}`);
            storageRef.put(file).then(snapshot => snapshot.ref.getDownloadURL()).then(url => {
                profileImageUrl = url;
                // Save to Firestore
                return db.collection('profiles').doc(currentUser.uid).set({ photoURL: url }, { merge: true });
            }).then(() => {
                fetchProfile(currentUser.uid);
            });
        });
    }
    auth.onAuthStateChanged(function(user) {
        if (user) {
            currentUser = user;
            fetchProfile(user.uid);
        }
    });
}); 