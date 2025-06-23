// User Dashboard JS migrated from user-dashboard.html

// Firebase config
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
    const links = document.querySelectorAll('.sidebar nav ul li a');
    const sections = {
        'profile-link': document.getElementById('profile-section'),
        'services-link': document.getElementById('services-section'),
        'status-link': document.getElementById('status-section')
    };
    const logoutModal = document.getElementById('logout-modal');
    const confirmLogoutBtn = document.getElementById('confirm-logout-btn');
    const cancelLogoutBtn = document.getElementById('cancel-logout-btn');

    function showSection(id) {
        Object.values(sections).forEach(sec => sec.style.display = 'none');
        links.forEach(l => l.classList.remove('active'));
        const activeLink = document.getElementById(id);
        if (activeLink) {
            activeLink.classList.add('active');
            const activeSection = sections[id];
            if (activeSection) activeSection.style.display = 'block';
        }
    }

    links.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            if (this.id === 'logout-link') {
                logoutModal.style.display = 'flex';
            } else {
                showSection(this.id);
            }
        });
    });

    // --- Profile Logic ---
    const profileForm = document.getElementById('profile-form');
    const saveBtnContainer = document.getElementById('save-btn-container');
    const changeBtn = document.getElementById('change-profile-btn');
    const newProfileAvatar = document.getElementById('new-profile-avatar');
    const newProfileName = document.getElementById('new-profile-name');
    const newProfileMessage = document.getElementById('new-profile-message');
    const avatarUpload = document.getElementById('avatar-upload');
    let currentUser = null;
    let profileImageUrl = null;
    let userStatusUnsub = null;
    
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
            return db.collection('profiles').doc(currentUser.uid).set({ photoURL: url }, { merge: true });
        }).then(() => {
            fetchProfile(currentUser.uid);
        });
    });

    // Logout
    confirmLogoutBtn.addEventListener('click', () => {
        if (currentUser) {
            db.collection('profiles').doc(currentUser.uid).get().then(doc => {
                let role = 'user';
                if (doc.exists && doc.data().role) {
                    role = doc.data().role;
                }
                logLogoutEvent(currentUser, role);
                return auth.signOut();
            }).then(() => {
                window.location.href = 'hompage.html';
            });
        } else {
            window.location.href = 'hompage.html';
        }
    });
    cancelLogoutBtn.addEventListener('click', () => logoutModal.style.display = 'none');
    logoutModal.addEventListener('click', e => {
        if (e.target === logoutModal) logoutModal.style.display = 'none';
    });

    // Auth state
    auth.onAuthStateChanged(function(user) {
        if (user) {
            currentUser = user;
            fetchProfile(user.uid);
            if (userStatusUnsub) userStatusUnsub();
            userStatusUnsub = db.collection('applications')
                .orderBy('appliedAt', 'desc')
                .onSnapshot(snapshot => {
                    renderStatus(snapshot);
                });
        } else {
            if (userStatusUnsub) userStatusUnsub();
            window.location.href = 'hompage.html';
        }
    });

    showSection('profile-link');

    // Autofill prevention: set all inputs/textarea to readonly, remove on focus
    document.querySelectorAll('#profile-form input, #profile-form textarea').forEach(function(el) {
        el.setAttribute('readonly', true);
        el.addEventListener('focus', function() {
            el.removeAttribute('readonly');
        });
    });

    // --- Service Application Logic ---
    let services = [];
    const servicesCardsContainer = document.getElementById('services-cards-container');
    const statusListContainer = document.getElementById('status-list-container');
    const dashboardServiceSearch = document.getElementById('dashboardServiceSearch');

    function renderServicesCards() {
        db.collection('services').orderBy('label').onSnapshot(snapshot => {
            services = [];
            servicesCardsContainer.innerHTML = '';
            if (snapshot.empty) {
                servicesCardsContainer.innerHTML = '<p style="color:#888;">No services found.</p>';
                return;
            }
            snapshot.forEach(doc => {
                const data = doc.data();
                services.push(data);
                const card = document.createElement('div');
                card.className = 'service-card';
                card.setAttribute('data-service', data.key);
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
                    <button class="apply-btn" data-service="${data.key}" style="background:#27ae60;color:#fff;padding:0.5rem 1.2rem;border:none;border-radius:5px;font-weight:600;font-size:1rem;cursor:pointer;margin-top:1rem;">Apply</button>
                `;
                servicesCardsContainer.appendChild(card);
            });
            renderServices();
        });
    }
    renderServicesCards();

    function showPopup(msg, color = '#27ae60') {
        let popup = document.createElement('div');
        popup.textContent = msg;
        popup.style.position = 'fixed';
        popup.style.top = '30px';
        popup.style.left = '50%';
        popup.style.transform = 'translateX(-50%)';
        popup.style.background = color;
        popup.style.color = 'white';
        popup.style.padding = '1rem 2rem';
        popup.style.borderRadius = '8px';
        popup.style.fontSize = '1.1rem';
        popup.style.boxShadow = '0 4px 16px rgba(0,0,0,0.15)';
        popup.style.zIndex = '9999';
        document.body.appendChild(popup);
        setTimeout(() => { popup.remove(); }, 1200);
    }

    function renderStatus(snapshot) {
        statusListContainer.innerHTML = '';
        if (!snapshot || snapshot.empty) {
            statusListContainer.innerHTML = '<p style="color:#888;">No applications found.</p>';
            return;
        }
        snapshot.forEach(doc => {
            const data = doc.data();
            if (data.status === 'cancelled') return;
            const service = data.service;
            const serviceObj = services.find(s => s.key === service);
            let iconHtml = '';
            if (serviceObj && serviceObj.icon) iconHtml = `<i class='${serviceObj.icon}'></i>`;
            else if (service === 'birth certificate') iconHtml = '<i class="fas fa-baby"></i>';
            else if (service === 'water connection') iconHtml = '<i class="fas fa-tint"></i>';
            else if (service === 'aadhaar card application') iconHtml = '<i class="fas fa-id-card"></i>';
            else if (service === 'ration card') iconHtml = '<i class="fas fa-id-card"></i>';
            const label = serviceObj?.label || service;
            const desc = serviceObj?.desc ||
                (service === 'birth certificate' ? 'Apply for a birth certificate' :
                service === 'water connection' ? 'Request for new water supply' :
                service === 'aadhaar card application' ? 'Apply for Aadhaar enrollment or update info' :
                service === 'ration card' ? 'Apply for a new ration card' : '');
            let statusHtml = '';
            if (data.status === 'pending') {
                statusHtml = `<button class="pending-btn" style="background:#aaa;color:#fff;padding:0.5rem 1.2rem;border:none;border-radius:5px;font-weight:600;font-size:1rem;cursor:not-allowed;">Pending...</button>` +
                    `<button class="cancel-btn" data-app-id="${doc.id}" style="background:#e74c3c;color:#fff;padding:0.5rem 1.2rem;border:none;border-radius:5px;font-weight:600;font-size:1rem;cursor:pointer;margin-left:0.7rem;">Cancel</button>`;
            } else if (data.status === 'accepted') {
                statusHtml = `<span style="background:#27ae60;color:#fff;padding:0.5rem 1.2rem;border-radius:5px;font-weight:600;font-size:1rem;">Accepted</span>`;
            } else if (data.status === 'rejected') {
                statusHtml = `<span style="background:#e74c3c;color:#fff;padding:0.5rem 1.2rem;border-radius:5px;font-weight:600;font-size:1rem;">Rejected</span>`;
            }
            if (!serviceObj) return;
            const statusCard = document.createElement('div');
            statusCard.className = 'service-card';
            statusCard.style.background = '#fff';
            statusCard.style.padding = '2rem 2.5rem';
            statusCard.style.borderRadius = '16px';
            statusCard.style.boxShadow = '0 4px 16px rgba(0,0,0,0.07)';
            statusCard.style.width = '270px';
            statusCard.style.textAlign = 'center';
            statusCard.innerHTML = `
                <div style="font-size:2.5rem;color:#667eea;">${iconHtml}</div>
                <h3 style="margin:1rem 0 0.5rem 0;">${label}</h3>
                <p>${desc}</p>
                <div style="display:flex;gap:0.7rem;justify-content:center;margin-top:1.2rem;">${statusHtml}</div>
            `;
            statusListContainer.appendChild(statusCard);
        });
        document.querySelectorAll('.cancel-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const appId = this.getAttribute('data-app-id');
                db.collection('applications').doc(appId).update({ status: 'cancelled' }).then(() => {
                    renderServices();
                });
            });
        });
    }

    function renderServices() {
        if (!currentUser) return;
        db.collection('applications')
            .where('uid', '==', currentUser.uid)
            .where('status', '==', 'pending')
            .get()
            .then(snapshot => {
                const applied = {};
                snapshot.forEach(doc => {
                    applied[doc.data().service] = true;
                });
                document.querySelectorAll('.apply-btn').forEach(btn => {
                    const service = btn.getAttribute('data-service');
                    if (applied[service]) {
                        btn.disabled = true;
                        btn.style.background = '#aaa';
                        btn.textContent = 'Applied';
                    } else {
                        btn.disabled = false;
                        btn.style.background = '#27ae60';
                        btn.textContent = 'Apply';
                    }
                });
            });
    }

    servicesCardsContainer.addEventListener('click', function(e) {
        if (e.target.classList.contains('apply-btn')) {
            const service = e.target.getAttribute('data-service');
            if (!currentUser) return;
            db.collection('applications')
                .where('uid', '==', currentUser.uid)
                .where('service', '==', service)
                .where('status', '==', 'pending')
                .get()
                .then(snapshot => {
                    if (!snapshot.empty) {
                        showPopup('Already applied', '#e74c3c');
                        return;
                    }
                    db.collection('applications').add({
                        uid: currentUser.uid,
                        email: currentUser.email,
                        service: service,
                        status: 'pending',
                        appliedAt: firebase.firestore.FieldValue.serverTimestamp()
                    }).then((docRef) => {
                        showPopup('Application submitted!');
                        renderServices();
                    });
                });
        }
    });

    dashboardServiceSearch.addEventListener('input', function() {
        const val = this.value.trim().toLowerCase();
        document.querySelectorAll('.service-card').forEach(card => {
            const label = card.querySelector('h3').textContent.toLowerCase();
            if (!val || label.includes(val)) {
                card.style.display = '';
            } else {
                card.style.display = 'none';
            }
        });
    });

    function afterAuth() {
        renderServices();
    }

    const origAuthStateChanged = auth.onAuthStateChanged;
    auth.onAuthStateChanged = function(cb) {
        origAuthStateChanged(function(user) {
            cb(user);
            if (user) afterAuth();
        });
    };
    if (auth.currentUser) afterAuth();

    document.querySelectorAll('#profile-form input, #profile-form textarea').forEach(function(el) {
        el.setAttribute('autocomplete', 'off');
        el.setAttribute('readonly', true);
        el.addEventListener('focus', function() {
            el.removeAttribute('readonly');
        });
    });
});

function logLogoutEvent(user, role) {
    db.collection("logouts").add({
        uid: user.uid,
        email: user.email,
        role: role,
        logoutAt: firebase.firestore.FieldValue.serverTimestamp()
    });
}

// User Dashboard Specific JavaScript
console.log("User Dashboard script loaded.");
 
// Add user-specific functions here, for example:
// function viewApplicationStatus() { ... } 