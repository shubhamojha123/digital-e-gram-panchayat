const firebaseConfig = {
    apiKey: "AIzaSyAirFsQ9LE0sWebU5kmWaNPDhDrlW-1hFs",
    authDomain: "e-gram-panchayat-cf771.firebaseapp.com",
    projectId: "e-gram-panchayat-cf771",
    storageBucket: "e-gram-panchayat-cf771.appspot.com",
    messagingSenderId: "605711670147",
    appId: "1:605711670147:web:34fb5debff69ca545834b6",
    measurementId: "G-X0EWKZDXKY"
  };
  
  // Initialize Firebase
  firebase.initializeApp(firebaseConfig);
  const auth = firebase.auth();
  const db = firebase.firestore();
  
  document.addEventListener('DOMContentLoaded', function() {
    // Image Slider Functionality
    let currentSlide = 0;
    const slides = document.querySelectorAll('.slide');
    const dots = document.querySelectorAll('.dot');
    const totalSlides = slides.length;

    function showSlide(index) {
      slides.forEach(slide => slide.classList.remove('active'));
      dots.forEach(dot => dot.classList.remove('active'));
      slides[index].classList.add('active');
      dots[index].classList.add('active');
    }

    function nextSlide() {
      currentSlide = (currentSlide + 1) % totalSlides;
      showSlide(currentSlide);
    }

    function prevSlide() {
      currentSlide = (currentSlide - 1 + totalSlides) % totalSlides;
      showSlide(currentSlide);
    }

    function goToSlide(index) {
      currentSlide = index;
      showSlide(currentSlide);
    }

    // Auto-slide every 4 seconds
    setInterval(nextSlide, 4000);

    // Slider controls
    const nextBtn = document.querySelector('.next-btn');
    const prevBtn = document.querySelector('.prev-btn');
    if (nextBtn) nextBtn.addEventListener('click', nextSlide);
    if (prevBtn) prevBtn.addEventListener('click', prevSlide);
    dots.forEach((dot, index) => {
      dot.addEventListener('click', () => goToSlide(index));
    });

    // Smooth scroll for Services link (now second)
    const servicesLink = document.querySelector('a[href="#services"]');
    if (servicesLink) {
      servicesLink.addEventListener('click', function(e) {
        e.preventDefault();
        const servicesSection = document.getElementById('services');
        if (servicesSection) {
          servicesSection.scrollIntoView({ behavior: 'smooth' });
        }
      });
    }
    // Smooth scroll for About Us link
    const aboutLink = document.querySelector('a[href="#about"]');
    if (aboutLink) {
      aboutLink.addEventListener('click', function(e) {
        e.preventDefault();
        const aboutSection = document.getElementById('about');
        if (aboutSection) {
          aboutSection.scrollIntoView({ behavior: 'smooth' });
        }
      });
    }
    // Smooth scroll for Contact link (now third)
    const contactLink = document.querySelector('a[href="#contact"]');
    if (contactLink) {
      contactLink.addEventListener('click', function(e) {
        e.preventDefault();
        const contactSection = document.getElementById('contact');
        if (contactSection) {
          contactSection.scrollIntoView({ behavior: 'smooth' });
        }
      });
    }
    // Smooth scroll for Help link
    const helpLink = document.querySelector('a[href="#help"]');
    if (helpLink) {
      helpLink.addEventListener('click', function(e) {
        e.preventDefault();
        const helpSection = document.getElementById('help');
        if (helpSection) {
          helpSection.scrollIntoView({ behavior: 'smooth' });
        }
      });
    }

    // Password visibility toggle
    document.querySelectorAll('.toggle-password').forEach(function(toggle) {
      toggle.addEventListener('click', function() {
        const targetId = this.getAttribute('data-target');
        const input = document.getElementById(targetId);
        const icon = this.querySelector('i');
        if (!input) return;
        if (input.type === 'password') {
          input.type = 'text';
          icon.classList.remove('fa-eye');
          icon.classList.add('fa-eye-slash');
        } else {
          input.type = 'password';
          icon.classList.remove('fa-eye-slash');
          icon.classList.add('fa-eye');
        }
      });
    });

    // Modal form handlers
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');
    const feedbackForm = document.getElementById('feedbackForm');
    const helpForm = document.getElementById('helpForm');
    const profileForm = document.getElementById('profile-form');
    const profileCard = document.getElementById('profile-card');
    if (profileForm && profileCard) {
      profileForm.addEventListener('submit', function(e) {
        e.preventDefault();
        // Get values
        const data = {
          firstName: document.getElementById('firstName').value,
          lastName: document.getElementById('lastName').value,
          state: document.getElementById('state').value,
          region: document.getElementById('region').value,
          village: document.getElementById('village').value,
          address: document.getElementById('address').value,
          phone: document.getElementById('phone').value
        };
        // Fill card
        document.getElementById('card-firstName').textContent = data.firstName;
        document.getElementById('card-lastName').textContent = data.lastName;
        document.getElementById('card-state').textContent = data.state;
        document.getElementById('card-region').textContent = data.region;
        document.getElementById('card-village').textContent = data.village;
        document.getElementById('card-address').textContent = data.address;
        document.getElementById('card-phone').textContent = data.phone;
        // Set initials
        let initials = '';
        if (data.firstName) initials += data.firstName[0].toUpperCase();
        if (data.lastName) initials += data.lastName[0].toUpperCase();
        if (!initials) initials = 'U';
        document.getElementById('profile-initials').textContent = initials;
        // Hide form, show card
        profileForm.style.display = 'none';
        profileCard.style.display = 'flex';
        // Disable change button
        var btn = document.getElementById('edit-profile-btn');
        btn.disabled = true;
        btn.style.opacity = '0.7';
        btn.style.cursor = 'default';
      });
    }
    if (loginForm) {
      loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        login();
      });
    }
    if (signupForm) {
      signupForm.addEventListener('submit', function(e) {
        e.preventDefault();
        register();
      });
    }
    if (feedbackForm) {
      feedbackForm.addEventListener('submit', function(e) {
        e.preventDefault();
        alert('Thank you for your feedback!');
        closeFeedbackModal();
      });
    }
    if (helpForm) {
      helpForm.addEventListener('submit', function(e) {
        e.preventDefault();
        alert('Thank you for your feedback/query!');
        document.getElementById('helpMessage').value = '';
      });
    }

    // Search bar and recommendations
    const searchBtn = document.getElementById('searchBtn');
    const serviceSearch = document.getElementById('serviceSearch');
    const suggestionsDiv = document.getElementById('searchSuggestions');
    if (searchBtn && serviceSearch) {
      searchBtn.addEventListener('click', handleServiceSearch);
      serviceSearch.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') {
          handleServiceSearch();
        }
      });
      serviceSearch.addEventListener('input', function() {
        showSuggestions(this.value);
      });
      serviceSearch.addEventListener('focus', function() {
        showSuggestions(this.value);
      });
      serviceSearch.addEventListener('blur', function() {
        setTimeout(() => { suggestionsDiv.style.display = 'none'; }, 150);
      });
    }

    console.log('Search bar event listeners attached');
  });

  // Modal Functions
  function openLoginModal() {
    document.getElementById('loginModal').style.display = 'block';
  }

  function closeLoginModal() {
    document.getElementById('loginModal').style.display = 'none';
  }

  function openSignupModal() {
    document.getElementById('signupModal').style.display = 'block';
  }

  function closeSignupModal() {
    document.getElementById('signupModal').style.display = 'none';
  }

  function openFeedbackModal() {
    document.getElementById('feedbackModal').style.display = 'block';
  }

  function closeFeedbackModal() {
    document.getElementById('feedbackModal').style.display = 'none';
  }

  // Close modals when clicking outside
  window.onclick = function(event) {
    const loginModal = document.getElementById('loginModal');
    const signupModal = document.getElementById('signupModal');
    const feedbackModal = document.getElementById('feedbackModal');
    if (event.target === loginModal) closeLoginModal();
    if (event.target === signupModal) closeSignupModal();
    if (event.target === feedbackModal) closeFeedbackModal();
  }

  // Register and save user role to Firestore
  function registerWithRole(email, password, roleCode) {
    auth.createUserWithEmailAndPassword(email, password)
      .then((userCredential) => {
        const user = userCredential.user;
        // Get role from code input
        let role = "user";
        if (roleCode === "admin123") role = "admin";
        else if (roleCode === "staff123") role = "staff";
        // SAVE to Firestore
        return db.collection("users").doc(user.uid).set({
          email: email,
          role: role,
          createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
      })
      .then(() => {
        alert("Registered successfully!");
        window.location.href = "login.html";
      })
      .catch((error) => {
        alert("Error: " + error.message);
      });
  }
  
  // Register
  function register() {
    const email = document.getElementById("registerEmail").value;
    const password = document.getElementById("registerPassword").value;
    const code = document.getElementById("registerCode").value.trim();
  
    if (code && code !== 'admin@123' && code !== 'staff@123') {
      alert('Wrong code');
      return;
    }
  
    let role = "user";
    if (code === "admin@123") role = "admin";
    else if (code === "staff@123") role = "staff";
  
    auth.createUserWithEmailAndPassword(email, password)
      .then((userCredential) => {
        const user = userCredential.user;
        return db.collection("signup").doc(user.uid).set({
          email: email,
          role: role,
          createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
      })
      .then(() => {
        showPopupMessage("Registered successfully!");
        closeSignupModal();
        setTimeout(() => {
          if (role === "admin") {
            window.location.href = "admin-dashboard.html";
          } else if (role === "staff") {
            window.location.href = "staff-dashboard.html";
          } else {
            window.location.href = "user-dashboard.html";
          }
        }, 800);
      })
      .catch((error) => {
        if (error.code === 'auth/email-already-in-use') {
          alert('This email is already registered. Please log in.');
        } else {
          alert(error.message);
        }
      });
  }  
  // Utility: show a non-blocking popup message
  function showPopupMessage(message) {
    let popup = document.createElement('div');
    popup.textContent = message;
    popup.style.position = 'fixed';
    popup.style.top = '30px';
    popup.style.left = '50%';
    popup.style.transform = 'translateX(-50%)';
    popup.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
    popup.style.color = 'white';
    popup.style.padding = '1rem 2rem';
    popup.style.borderRadius = '8px';
    popup.style.fontSize = '1.2rem';
    popup.style.boxShadow = '0 4px 16px rgba(0,0,0,0.15)';
    popup.style.zIndex = '9999';
    document.body.appendChild(popup);
    setTimeout(() => {
      popup.remove();
    }, 800);
  }

  // Login
  function login() {
    const email = document.getElementById("loginEmail").value;
    const password = document.getElementById("loginPassword").value;
    const code = document.getElementById("loginCode").value.trim();

    let firebaseUser; // To hold the user object after auth
    let intendedRole = 'user';
    if (code === 'admin@123') intendedRole = 'admin';
    else if (code === 'staff@123') intendedRole = 'staff';

    auth.signInWithEmailAndPassword(email, password)
      .then((userCredential) => {
        firebaseUser = userCredential.user;
        return db.collection("signup").doc(firebaseUser.uid).get();
      })
      .then((doc) => {
        if (!doc.exists) {
          // Create the user document with the correct role
          return db.collection("signup").doc(firebaseUser.uid).set({
            email: firebaseUser.email,
            role: intendedRole,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
          }).then(() => intendedRole);
        } else {
          // User document exists, use the stored role
          return doc.data().role;
        }
      })
      .then((role) => {
        // Now, validate the login attempt against their role.
        if (code && intendedRole !== role) {
          throw new Error(`Access denied. Your account does not have ${intendedRole} privileges.`);
        }
        // Log every login event
        db.collection("logins").add({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          role: role,
          loginAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        // Update lastLogin in user document
        db.collection("signup").doc(firebaseUser.uid).update({
          lastLogin: firebase.firestore.FieldValue.serverTimestamp()
        });
        showPopupMessage("Login successful!");
        closeLoginModal();
        setTimeout(() => {
          if (code === 'admin@123' && role === 'admin') {
            window.location.href = "admin-dashboard.html";
          } else if (code === 'staff@123' && role === 'staff') {
            window.location.href = "staff-dashboard.html";
          } else {
            window.location.href = "user-dashboard.html";
          }
        }, 800);
      })
      .catch((error) => {
        alert(error.message);
      });
  }
  
  
  // Service search functionality
  const servicePages = {
    'birth certificate': 'service-birth-certificate.html',
    'water connection': 'service-water-connection.html',
    'aadhaar card application': 'service-aadhaar-card.html',
    'ration card': 'service-ration-card.html'
  };

  function handleServiceSearch() {
    const input = document.getElementById('serviceSearch');
    const query = input.value.trim().toLowerCase();
    if (servicePages[query]) {
      window.location.href = servicePages[query];
    } else {
      alert('Please select a valid service from the list.');
    }
  }

  const serviceList = [
    'Birth Certificate',
    'Water Connection',
    'Aadhaar Card Application',
    'Ration Card'
  ];

  function showSuggestions(value) {
    console.log('showSuggestions called with:', value); // DEBUG
    const suggestionsDiv = document.getElementById('searchSuggestions');
    const inputValue = value.trim().toLowerCase();
    if (!inputValue) {
      suggestionsDiv.style.display = 'none';
      suggestionsDiv.innerHTML = '';
      return;
    }
    // Show all services that start with the input letter(s)
    const matches = serviceList.filter(service => service.toLowerCase().startsWith(inputValue));
    if (matches.length === 0) {
      suggestionsDiv.style.display = 'none';
      suggestionsDiv.innerHTML = '';
      return;
    }
    suggestionsDiv.innerHTML = matches.map(service => `<div class=\"search-suggestion-item\">${service}</div>`).join('');
    suggestionsDiv.style.display = 'block';
    // Add click listeners
    Array.from(suggestionsDiv.children).forEach(item => {
      item.onmousedown = function(e) {
        e.preventDefault(); // Prevent input blur before handler
        document.getElementById('serviceSearch').value = this.textContent;
        suggestionsDiv.style.display = 'none';
      };
    });
  }
  
  // Log logout event to Firestore (top-level 'logouts' collection)
  function logLogoutEvent(user, role) {
    db.collection("logouts").add({
      uid: user.uid,
      email: user.email,
      role: role,
      logoutAt: firebase.firestore.FieldValue.serverTimestamp()
    });
  }
  