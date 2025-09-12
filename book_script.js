// Service data matching the React implementation
const services = {
  Classic: [
    { id: 'classic-1', name: 'Regular Classic', subtitle: 'Timeless elegance', price: 130, duration: 90, description: 'Perfect for everyday elegance' },
    { id: 'classic-2', name: 'Classic Cat Eye', subtitle: 'Dramatic feline look', price: 160, duration: 120, description: 'Bold and captivating' },
    { id: 'classic-3', name: 'Wet Set', subtitle: 'Glossy finish', price: 150, duration: 100, description: 'Luxurious shine effect' },
    { id: 'classic-4', name: 'Mega Classic', subtitle: 'Bold statement', price: 180, duration: 130, description: 'Maximum impact classic' }
  ],
  Hybrid: [
    { id: 'hybrid-1', name: 'Regular Hybrid', subtitle: 'Natural volume', price: 180, duration: 150, description: 'Best of both worlds' },
    { id: 'hybrid-2', name: 'Cat Eye', subtitle: 'Sultry curves', price: 200, duration: 160, description: 'Seductive and alluring' },
    { id: 'hybrid-3', name: 'Anime Set', subtitle: 'Expressive drama', price: 200, duration: 170, description: 'Dramatic anime-inspired' },
    { id: 'hybrid-4', name: 'Doll Eye', subtitle: 'Sweet innocence', price: 200, duration: 160, description: 'Cute and innocent' },
    { id: 'hybrid-5', name: 'Mini Wipsy', subtitle: 'Delicate wisp', price: 170, duration: 140, description: 'Subtle textured effect' },
    { id: 'hybrid-6', name: 'Hybrid Wipsy', subtitle: 'Textured layers', price: 200, duration: 180, description: 'Complex layered look' }
  ],
  Volume: [
    { id: 'volume-1', name: 'Regular Volume', subtitle: 'Full dramatic impact', price: 220, duration: 180, description: 'Maximum volume and drama' },
    { id: 'volume-2', name: 'Cat Eye', subtitle: 'Maximum drama', price: 250, duration: 200, description: 'Ultimate dramatic cat eye' },
    { id: 'volume-3', name: 'Doll Eye', subtitle: 'Ultra glamorous', price: 250, duration: 200, description: 'Royal glamour look' },
    { id: 'volume-4', name: 'Wipsy', subtitle: 'Luxury texture', price: 300, duration: 220, description: 'Premium textured volume' }
  ]
};

// State variables
let currentStep = 1;
let selectedService = null;
let selectedDate = null;
let selectedTime = null;
let timeSlots = [];
let userDetails = { name: '', phone: '', email: '', notes: '' };
let isAuthenticated = false;
let currentUser = null;
let holdCountdown = null;
let holdTimer = null;
let agreedToPolicy = false;
let depositProof = null;
let transactionRef = '';

// DOM Elements - using safe selectors
function getElement(id) {
  const element = document.getElementById(id);
  if (!element) {
    console.warn(`Element with ID '${id}' not found`);
  }
  return element;
}

// Initialize DOM elements
let steps, stepContents, prevBtn, nextBtn, nextBtnText;
let selectedServiceName, holdCountdownElement, countdownTimer;
let calendarGrid, timeslotsGrid;
let classicServices, hybridServices, volumeServices;
let summaryServiceName, summaryServiceSubtitle, summaryDate, summaryTime;
let summaryDuration, summaryClient, summaryPhone, summaryEmail, summaryPrice;
let finalService, finalDatetime, finalClient, finalContact, finalTotal;
let paymentReference;

// Modal elements
let authModal, confirmModal;
let authTabs, authSubmitBtn, googleAuthBtn, cancelAuthBtn;
let backBtn, confirmSubmitBtn;

// 🔥 FIREBASE CONFIGURATION - REPLACE WITH YOUR VALUES!
const FIREBASE_CONFIG = {
  apiKey: "AIzaSyDapIozbdJlkPbZHtEam0y5dVtz5UF6W-w",
  authDomain: "bsstudiohq.firebaseapp.com",
  projectId: "bsstudiohq",
  storageBucket: "bsstudiohq.firebasestorage.app",
  messagingSenderId: "275734641528",
  appId: "1:275734641528:web:871c157a8d8f7ab4d2668d",
  measurementId: "G-RW34N3B804"
};

// 💧 SUPABASE CONFIGURATION - REPLACE WITH YOUR VALUES!
const SUPABASE_CONFIG = {
  url: 'https://foauqtwkuublsursedjs.supabase.co', // e.g., 'https://your-project-ref.supabase.co'
  anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZvYXVxdHdrdXVibHN1cnNlZGpzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcyODE5OTMsImV4cCI6MjA3Mjg1Nzk5M30.d7Eo8PIeix9Pr1XuLvhDKcgtqmtpherr3OezsR3pm1Y'
};

// Firebase and Supabase instances (will be initialized)
let firebaseApp, firebaseAuth, firebaseStorage, googleProvider;
let supabaseClient;

// Initialize the app
document.addEventListener('DOMContentLoaded', async () => {
  await initializeServices();
  initializeDOMElements();
  setupAuthStateListener();
  populateServices();
  generateCalendar();
  setupEventListeners();
  updateUI();
});

// 🚀 INITIALIZE FIREBASE & SUPABASE
async function initializeServices() {
  try {
    // Initialize Firebase
    const { initializeApp } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js');
    const { 
      getAuth, 
      onAuthStateChanged,
      signInWithEmailAndPassword, 
      createUserWithEmailAndPassword,
      signInWithPopup,
      GoogleAuthProvider,
      signOut
    } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js');
    const { 
      getStorage,
      ref,
      uploadBytes,
      getDownloadURL
    } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js');

    // Initialize Firebase
    firebaseApp = initializeApp(FIREBASE_CONFIG);
    firebaseAuth = getAuth(firebaseApp);
    firebaseStorage = getStorage(firebaseApp);
    googleProvider = new GoogleAuthProvider();

    // Make Firebase functions globally available
    window.firebaseAuth = firebaseAuth;
    window.firebaseStorage = firebaseStorage;
    window.signInWithEmailAndPassword = signInWithEmailAndPassword;
    window.createUserWithEmailAndPassword = createUserWithEmailAndPassword;
    window.signInWithPopup = signInWithPopup;
    window.signOut = signOut;
    window.ref = ref;
    window.uploadBytes = uploadBytes;
    window.getDownloadURL = getDownloadURL;
    window.onAuthStateChanged = onAuthStateChanged;

    console.log('✅ Firebase initialized successfully');

    // Initialize Supabase
    const { createClient } = await import('https://cdn.skypack.dev/@supabase/supabase-js@2');
    supabaseClient = createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey);
    
    // Make Supabase globally available
    window.supabase = supabaseClient;

    console.log('✅ Supabase initialized successfully');

  } catch (error) {
    console.error('❌ Failed to initialize services:', error);
    alert('Failed to initialize booking system. Please refresh the page.');
  }
}

function initializeDOMElements() {
  // Main elements
  steps = document.querySelectorAll('.step');
  stepContents = document.querySelectorAll('[class^="step-content-"]');
  prevBtn = getElement('prev-btn');
  nextBtn = getElement('next-btn');
  nextBtnText = getElement('next-btn-text');

  // Service and booking elements
  selectedServiceName = getElement('selected-service-name');
  holdCountdownElement = getElement('hold-countdown');
  countdownTimer = getElement('countdown-timer');
  calendarGrid = getElement('calendar-grid');
  timeslotsGrid = getElement('timeslots-grid');

  // Service grids
  classicServices = getElement('classic-services');
  hybridServices = getElement('hybrid-services');
  volumeServices = getElement('volume-services');

  // Summary elements
  summaryServiceName = getElement('summary-service-name');
  summaryServiceSubtitle = getElement('summary-service-subtitle');
  summaryDate = getElement('summary-date');
  summaryTime = getElement('summary-time');
  summaryDuration = getElement('summary-duration');
  summaryClient = getElement('summary-client');
  summaryPhone = getElement('summary-phone');
  summaryEmail = getElement('summary-email');
  summaryPrice = getElement('summary-price');

  // Final confirmation elements
  finalService = getElement('final-service');
  finalDatetime = getElement('final-datetime');
  finalClient = getElement('final-client');
  finalContact = getElement('final-contact');
  finalTotal = getElement('final-total');
  paymentReference = getElement('payment-reference');

  // Modal elements
  authModal = getElement('auth-modal');
  confirmModal = getElement('confirm-modal');
  authTabs = document.querySelectorAll('.auth-tab');
  authSubmitBtn = getElement('auth-submit-btn');
  googleAuthBtn = getElement('google-auth-btn');
  cancelAuthBtn = getElement('cancel-auth-btn');
  backBtn = getElement('back-btn');
  confirmSubmitBtn = getElement('confirm-submit-btn');
}

// 🔐 SETUP AUTH STATE LISTENER
function setupAuthStateListener() {
  if (!firebaseAuth) {
    console.error('Firebase Auth not initialized');
    return;
  }

  window.onAuthStateChanged(firebaseAuth, (user) => {
    if (user) {
      isAuthenticated = true;
      currentUser = {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName || user.email.split('@')[0]
      };
      console.log('✅ User authenticated:', user.email);
      hideAuthModal();
      
      // Auto-fill email if empty
      if (!userDetails.email && user.email) {
        userDetails.email = user.email;
        updateFormValues();
      }
      
      // If user was on step 2 waiting for auth, proceed to step 3
      if (currentStep === 2 && selectedDate && selectedTime) {
        currentStep = 3;
        updateUI();
      }
    } else {
      isAuthenticated = false;
      currentUser = null;
      console.log('❌ User signed out');
    }
  });
}

// 🔑 AUTHENTICATION HANDLERS
async function handleAuthSubmit() {
  const emailInput = getElement('auth-email');
  const passwordInput = getElement('auth-password');
  const confirmPasswordInput = getElement('auth-confirm-password');

  if (!emailInput || !passwordInput) {
    alert('Email and password fields not found');
    return;
  }

  const email = emailInput.value.trim();
  const password = passwordInput.value;
  const confirmPassword = confirmPasswordInput ? confirmPasswordInput.value : '';
  const mode = document.querySelector('.auth-tab.active')?.dataset.mode || 'login';

  if (!email || !password) {
    alert('Please enter both email and password');
    return;
  }

  if (mode === 'register' && password !== confirmPassword) {
    alert("Passwords don't match");
    return;
  }

  if (password.length < 6) {
    alert('Password must be at least 6 characters long');
    return;
  }

  try {
    if (authSubmitBtn) {
      authSubmitBtn.disabled = true;
      authSubmitBtn.textContent = mode === 'register' ? 'Creating Account...' : 'Signing In...';
    }

    if (mode === 'register') {
      const userCredential = await window.createUserWithEmailAndPassword(firebaseAuth, email, password);
      console.log('✅ User registered:', userCredential.user.email);
      alert('Account created successfully! You are now signed in.');
    } else {
      const userCredential = await window.signInWithEmailAndPassword(firebaseAuth, email, password);
      console.log('✅ User signed in:', userCredential.user.email);
    }

  } catch (error) {
    console.error('❌ Auth error:', error);
    let errorMessage = error.message;
    
    // Provide user-friendly error messages
    if (error.code === 'auth/user-not-found') {
      errorMessage = 'No account found with this email address.';
    } else if (error.code === 'auth/wrong-password') {
      errorMessage = 'Incorrect password.';
    } else if (error.code === 'auth/email-already-in-use') {
      errorMessage = 'An account with this email already exists.';
    } else if (error.code === 'auth/weak-password') {
      errorMessage = 'Password should be at least 6 characters long.';
    } else if (error.code === 'auth/invalid-email') {
      errorMessage = 'Please enter a valid email address.';
    } else if (error.code === 'auth/too-many-requests') {
      errorMessage = 'Too many failed attempts. Please try again later.';
    }
    
    alert(errorMessage);
  } finally {
    if (authSubmitBtn) {
      authSubmitBtn.disabled = false;
      const mode = document.querySelector('.auth-tab.active')?.dataset.mode || 'login';
      authSubmitBtn.textContent = mode === 'login' ? 'Sign In' : 'Create Account';
    }
  }
}

async function handleGoogleAuth() {
  try {
    if (googleAuthBtn) {
      googleAuthBtn.disabled = true;
      googleAuthBtn.textContent = 'Signing In...';
    }

    const result = await window.signInWithPopup(firebaseAuth, googleProvider);
    console.log('✅ Google sign-in successful:', result.user.email);

  } catch (error) {
    console.error('❌ Google auth error:', error);
    let errorMessage = 'Google sign-in failed. Please try again.';
    
    if (error.code === 'auth/popup-blocked') {
      errorMessage = 'Popup blocked. Please allow popups and try again.';
    } else if (error.code === 'auth/popup-closed-by-user') {
      errorMessage = 'Sign-in cancelled.';
    } else if (error.code === 'auth/network-request-failed') {
      errorMessage = 'Network error. Please check your connection.';
    }
    
    alert(errorMessage);
  } finally {
    if (googleAuthBtn) {
      googleAuthBtn.disabled = false;
      googleAuthBtn.textContent = 'Continue with Google';
    }
  }
}

// Add sign out function
async function handleSignOut() {
  try {
    await window.signOut(firebaseAuth);
    console.log('✅ User signed out');
    // Optionally redirect or reset the form
    resetBookingForm();
  } catch (error) {
    console.error('❌ Sign out error:', error);
    alert('Failed to sign out. Please try again.');
  }
}

// Make sign out available globally
window.firebaseSignOut = handleSignOut;

function populateServices() {
  if (!classicServices || !hybridServices || !volumeServices) {
    console.error('Service containers not found');
    return;
  }

  // Classic services
  classicServices.innerHTML = '';
  services.Classic.forEach(service => {
    const card = createServiceCard(service);
    classicServices.appendChild(card);
  });

  // Hybrid services
  hybridServices.innerHTML = '';
  services.Hybrid.forEach(service => {
    const card = createServiceCard(service);
    hybridServices.appendChild(card);
  });

  // Volume services
  volumeServices.innerHTML = '';
  services.Volume.forEach(service => {
    const card = createServiceCard(service);
    volumeServices.appendChild(card);
  });
}

function createServiceCard(service) {
  const card = document.createElement('div');
  card.className = 'service-card';
  card.innerHTML = `
    <h4>${service.name}</h4>
    <p class="subtitle">${service.subtitle}</p>
    <p class="description">${service.description}</p>
    <div class="price-container">
      <span class="price">¢${service.price}</span>
      <div class="duration">
        <i class="fas fa-clock"></i>
        ${service.duration} min
      </div>
    </div>
  `;
  card.addEventListener('click', () => {
    document.querySelectorAll('.service-card').forEach(c => c.classList.remove('selected'));
    card.classList.add('selected');
    selectedService = service;
    updateUI();
  });
  return card;
}

function generateCalendar() {
  if (!calendarGrid) {
    console.error('Calendar grid not found');
    return;
  }

  const today = new Date();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDay = new Date(currentYear, currentMonth, 1).getDay();

  calendarGrid.innerHTML = '';

  // Add empty cells for days before the first day of the month
  for (let i = 0; i < firstDay; i++) {
    const emptyCell = document.createElement('div');
    emptyCell.className = 'calendar-day disabled';
    calendarGrid.appendChild(emptyCell);
  }

  // Add all days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(currentYear, currentMonth, day);
    const isToday = date.toDateString() === new Date().toDateString();
    const isPast = date < new Date().setHours(0, 0, 0, 0);
    const isSelected = selectedDate && date.toDateString() === selectedDate.toDateString();

    const dayElement = document.createElement('div');
    dayElement.className = `calendar-day ${isPast ? 'disabled' : ''} ${isSelected ? 'selected' : ''} ${isToday && !isSelected ? 'today' : ''}`;
    dayElement.textContent = day;

    if (!isPast) {
      dayElement.addEventListener('click', () => {
        document.querySelectorAll('.calendar-day').forEach(d => d.classList.remove('selected'));
        dayElement.classList.add('selected');
        selectedDate = date;
        selectedTime = null; // Reset time selection when date changes
        generateTimeSlots();
        updateUI();
      });
    }

    calendarGrid.appendChild(dayElement);
  }
}

function generateTimeSlots() {
  const slots = [];
  for (let hour = 9; hour < 17; hour++) {
    for (let minute of [0, 30]) {
      const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      slots.push({
        id: `slot-${hour}-${minute}`,
        time,
        available: Math.random() > 0.3, // Simulate availability
        held: Math.random() > 0.8 ? { userId: 'other', expiresAt: Date.now() + 300000 } : null
      });
    }
  }
  timeSlots = slots;
  renderTimeSlots();
}

function renderTimeSlots() {
  if (!timeslotsGrid) {
    console.error('Timeslots grid not found');
    return;
  }

  timeslotsGrid.innerHTML = '';

  if (!selectedDate) {
    const noDateSelected = document.createElement('div');
    noDateSelected.className = 'no-date-selected';
    noDateSelected.innerHTML = `
      <i class="fas fa-calendar"></i>
      <p>Please select a date first</p>
    `;
    timeslotsGrid.appendChild(noDateSelected);
    return;
  }

  timeSlots.forEach(slot => {
    const slotElement = document.createElement('button');
    slotElement.className = `timeslot ${!slot.available || slot.held ? 'disabled' : ''} ${selectedTime?.id === slot.id ? 'selected' : ''}`;
    slotElement.textContent = slot.time;

    if (!slot.available || slot.held) {
      slotElement.disabled = true;
      if (slot.held) {
        const heldSpan = document.createElement('span');
        heldSpan.className = 'held-text';
        heldSpan.textContent = 'Held';
        slotElement.appendChild(heldSpan);
      }
    } else {
      slotElement.addEventListener('click', () => {
        document.querySelectorAll('.timeslot').forEach(s => s.classList.remove('selected'));
        slotElement.classList.add('selected');
        selectedTime = slot;
        startHoldCountdown();
        updateUI();
      });
    }

    timeslotsGrid.appendChild(slotElement);
  });
}

function startHoldCountdown() {
  if (holdTimer) {
    clearInterval(holdTimer);
  }

  holdCountdown = 300; // 5 minutes in seconds
  if (holdCountdownElement) {
    holdCountdownElement.style.display = 'flex';
  }

  updateHoldCountdown();
  holdTimer = setInterval(() => {
    holdCountdown--;
    updateHoldCountdown();

    if (holdCountdown <= 0) {
      clearInterval(holdTimer);
      holdTimer = null;
      if (holdCountdownElement) {
        holdCountdownElement.style.display = 'none';
      }
      selectedTime = null;
      renderTimeSlots(); // Re-render to remove selection
      updateUI();
    }
  }, 1000);
}

function updateHoldCountdown() {
  if (holdCountdown === null || !countdownTimer) return;

  const mins = Math.floor(holdCountdown / 60);
  const secs = holdCountdown % 60;
  countdownTimer.textContent = `${mins}:${secs.toString().padStart(2, '0')}`;
}

function updateUI() {
  // Update progress bar
  steps.forEach(step => {
    const stepNum = parseInt(step.getAttribute('data-step'));
    step.classList.toggle('active', stepNum === currentStep);
    step.classList.toggle('completed', stepNum < currentStep);

    const connector = step.nextElementSibling;
    if (connector && connector.classList.contains('step-connector')) {
      connector.classList.toggle('completed', stepNum < currentStep);
    }
  });

  // Show/hide step content
  stepContents.forEach(content => {
    const stepNum = parseInt(content.className.match(/step-content-(\d+)/)?.[1]);
    if (stepNum) {
      content.classList.toggle('active-step', stepNum === currentStep);
    }
  });

  // Update navigation buttons
  if (prevBtn) {
    prevBtn.style.display = currentStep > 1 ? 'flex' : 'none';
  }

  if (nextBtnText) {
    nextBtnText.textContent = currentStep === 4 ? 'Confirm Booking' : 'Continue';
  }

  if (nextBtn) {
    nextBtn.classList.toggle('disabled', !canProceed());
  }

  // Update selected service display
  if (selectedService && selectedServiceName) {
    selectedServiceName.textContent = selectedService.name;
  }

  // Update booking summary
  updateSummaryElements();
  updateFinalConfirmationElements();
  updateFormValues();
  updatePaymentReference();
}

function updateSummaryElements() {
  if (selectedService) {
    if (summaryServiceName) summaryServiceName.textContent = selectedService.name;
    if (summaryServiceSubtitle) summaryServiceSubtitle.textContent = selectedService.subtitle;
    if (summaryPrice) summaryPrice.textContent = `¢${selectedService.price}`;
    if (summaryDuration) summaryDuration.textContent = `~${selectedService.duration} minutes`;
  }

  if (selectedDate && summaryDate) {
    summaryDate.textContent = selectedDate.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  if (selectedTime && summaryTime) {
    summaryTime.textContent = selectedTime.time;
  }

  if (summaryClient) summaryClient.textContent = userDetails.name || '';
  if (summaryPhone) summaryPhone.textContent = userDetails.phone || '';
  if (summaryEmail) summaryEmail.textContent = userDetails.email || '';
}

function updateFinalConfirmationElements() {
  if (selectedService && finalService) {
    finalService.textContent = `${selectedService.name} (${selectedService.subtitle})`;
  }

  if (selectedDate && selectedTime && finalDatetime) {
    finalDatetime.textContent = `${selectedDate.toLocaleDateString()} at ${selectedTime.time}`;
  }

  if (finalClient) finalClient.textContent = userDetails.name || '';
  if (finalContact) finalContact.textContent = userDetails.phone || '';
  if (finalTotal) finalTotal.textContent = selectedService ? `¢${selectedService.price}` : '¢0';
}

function updateFormValues() {
  const nameInput = getElement('user-name');
  const phoneInput = getElement('user-phone');
  const emailInput = getElement('user-email');
  const notesInput = getElement('user-notes');
  const transactionInput = getElement('transaction-ref');
  const policyCheckbox = getElement('policy-checkbox');

  if (nameInput) nameInput.value = userDetails.name || '';
  if (phoneInput) phoneInput.value = userDetails.phone || '';
  if (emailInput) emailInput.value = userDetails.email || '';
  if (notesInput) notesInput.value = userDetails.notes || '';
  if (transactionInput) transactionInput.value = transactionRef || '';
  if (policyCheckbox) policyCheckbox.checked = agreedToPolicy;
}

function updatePaymentReference() {
  if (paymentReference) {
    paymentReference.textContent = `BS-${Date.now()}`;
  }
}

function canProceed() {
  switch (currentStep) {
    case 1:
      return selectedService !== null;
    case 2:
      return selectedDate && selectedTime;
    case 3:
      return userDetails.name && userDetails.phone && userDetails.email;
    case 4:
      return agreedToPolicy;
    default:
      return false;
  }
}

function handleNextStep() {
  if (currentStep === 2 && !isAuthenticated) {
    showAuthModal();
    return;
  }

  if (currentStep === 4) {
    showConfirmModal();
    return;
  }

  currentStep++;
  updateUI();
}

function handlePrevStep() {
  if (currentStep > 1) {
    currentStep--;
    updateUI();
  }
}

function showAuthModal() {
  if (authModal) {
    authModal.style.display = 'flex';
  }
}

function hideAuthModal() {
  if (authModal) {
    authModal.style.display = 'none';
  }
}

function showConfirmModal() {
  if (confirmModal) {
    confirmModal.style.display = 'flex';
    updateFinalConfirmationElements();
  }
}

function hideConfirmModal() {
  if (confirmModal) {
    confirmModal.style.display = 'none';
  }
}

// 📝 BOOKING SUBMISSION WITH SUPABASE DATABASE
async function handleBookingSubmit() {
  // 🛑 GUARD CLAUSES
  if (!selectedService) {
    alert("Please select a service first.");
    return;
  }
  if (!selectedDate) {
    alert("Please select a date first.");
    return;
  }
  if (!selectedTime) {
    alert("Please select a time slot first.");
    return;
  }
  if (!userDetails.name?.trim() || !userDetails.phone?.trim() || !userDetails.email?.trim()) {
    alert("Please fill in all client details (Name, Phone, Email).");
    return;
  }
  if (!agreedToPolicy) {
    alert("Please agree to the terms and conditions before confirming.");
    return;
  }

  try {
    if (confirmSubmitBtn) {
      confirmSubmitBtn.disabled = true;
      confirmSubmitBtn.textContent = 'Submitting...';
    }

    // ✅ Build booking data object
    const bookingData = {
      user_id: currentUser?.uid || null,
      user_email: currentUser?.email || userDetails.email,
      service_id: selectedService.id,
      service_name: selectedService.name,
      service_subtitle: selectedService.subtitle,
      service_price: selectedService.price,
      service_duration: selectedService.duration,
      slot_id: selectedTime.id,
      booking_date: selectedDate.toISOString().split('T')[0], // YYYY-MM-DD format
      booking_time: selectedTime.time,
      status: 'pending',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      deposit_amount: 50,
      deposit_ref: transactionRef?.trim() || null,
      proof_url: null, // Will be populated after upload
      total_amount: selectedService.price,
      client_name: userDetails.name.trim(),
      client_phone: userDetails.phone.trim(),
      client_email: userDetails.email.trim(),
      client_notes: userDetails.notes?.trim() || null,
      source: 'web-booking',
      platform: 'browser'
    };

    console.log('📝 Preparing to submit booking:', bookingData);

    // ✅ UPLOAD PAYMENT PROOF TO FIREBASE STORAGE (if file selected)
    let proofUrl = null;
    if (depositProof) {
      try {
        const fileName = `payment-proofs/${Date.now()}_${depositProof.name}`;
        const storageRef = window.ref(firebaseStorage, fileName);
        const snapshot = await window.uploadBytes(storageRef, depositProof);
        proofUrl = await window.getDownloadURL(snapshot.ref);
        bookingData.proof_url = proofUrl;
        console.log('📎 Uploaded receipt URL:', proofUrl);
      } catch (uploadError) {
        console.error('❌ Upload error:', uploadError);
        alert('Failed to upload receipt. Proceeding without proof.');
      }
    }

    // ✅ INSERT INTO SUPABASE DATABASE
    const { data: inserted, error: dbError } = await supabaseClient
      .from('bookings')
      .insert([bookingData])
      .select();

    if (dbError) throw dbError;

    console.log('✅ Booking submitted successfully:', inserted[0]);

    // Clear hold timer
    if (holdTimer) {
      clearInterval(holdTimer);
      holdTimer = null;
    }

    // Success feedback
    setTimeout(() => {
      hideConfirmModal();
      alert('🎉 Booking submitted successfully!\nYou will receive a confirmation email once your deposit is verified.\nBooking ID: ' + inserted[0].id);
      resetBookingForm();
    }, 1000);

  } catch (error) {
    console.error('❌ Booking submission error:', error);
    let errorMessage = 'Failed to submit booking. Please try again.';
    
    if (error.message?.includes('permission') || error.message?.includes('RLS')) {
      errorMessage = 'Permission denied. Please ensure you are signed in and try again.';
    } else if (error.message?.includes('storage')) {
      errorMessage = 'Failed to upload payment proof. Please try again.';
    } else if (error.code?.includes('23505')) {
      errorMessage = 'This time slot may already be booked. Please refresh and try another time.';
    } else if (error.message?.includes('duplicate')) {
      errorMessage = 'This booking already exists. Please check your bookings.';
    }
    
    alert(errorMessage);
  } finally {
    if (confirmSubmitBtn) {
      confirmSubmitBtn.disabled = false;
      confirmSubmitBtn.textContent = 'Confirm Booking';
    }
  }
}

function setupEventListeners() {
  // Navigation buttons
  if (nextBtn) {
    nextBtn.addEventListener('click', handleNextStep);
  }
  if (prevBtn) {
    prevBtn.addEventListener('click', handlePrevStep);
  }

  // Auth modal tabs
  authTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      authTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      const mode = tab.getAttribute('data-mode');
      const confirmPasswordField = getElement('auth-confirm-password');
      if (confirmPasswordField) {
        confirmPasswordField.style.display = mode === 'register' ? 'block' : 'none';
      }
      if (authSubmitBtn) {
        authSubmitBtn.textContent = mode === 'login' ? 'Sign In' : 'Create Account';
      }
    });
  });

  // Auth submit button
  if (authSubmitBtn) {
    authSubmitBtn.addEventListener('click', handleAuthSubmit);
  }

  // Google auth button
  if (googleAuthBtn) {
    googleAuthBtn.addEventListener('click', handleGoogleAuth);
  }

  // Modal buttons
  if (cancelAuthBtn) {
    cancelAuthBtn.addEventListener('click', hideAuthModal);
  }
  if (backBtn) {
    backBtn.addEventListener('click', hideConfirmModal);
  }
  if (confirmSubmitBtn) {
    confirmSubmitBtn.addEventListener('click', handleBookingSubmit);
  }

  // Form inputs
  setupFormInputListeners();

  // Copy buttons
  setupCopyButtons();

  // Handle Enter key in auth forms
  const authForm = document.querySelector('.auth-form');
  if (authForm) {
    authForm.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleAuthSubmit();
      }
    });
  }
}

function setupFormInputListeners() {
  const nameInput = getElement('user-name');
  const phoneInput = getElement('user-phone');
  const emailInput = getElement('user-email');
  const notesInput = getElement('user-notes');
  const transactionInput = getElement('transaction-ref');
  const policyCheckbox = getElement('policy-checkbox');
  const paymentProofInput = getElement('payment-proof');

  if (nameInput) {
    nameInput.addEventListener('input', e => {
      userDetails.name = e.target.value;
      updateUI();
    });
  }

  if (phoneInput) {
    phoneInput.addEventListener('input', e => {
      userDetails.phone = e.target.value;
      updateUI();
    });
  }

  if (emailInput) {
    emailInput.addEventListener('input', e => {
      userDetails.email = e.target.value;
      updateUI();
    });
  }

  if (notesInput) {
    notesInput.addEventListener('input', e => {
      userDetails.notes = e.target.value;
      updateUI();
    });
  }

  if (transactionInput) {
    transactionInput.addEventListener('input', e => {
      transactionRef = e.target.value;
      updateUI();
    });
  }

  if (policyCheckbox) {
    policyCheckbox.addEventListener('change', e => {
      agreedToPolicy = e.target.checked;
      updateUI();
    });
  }

  // Handle file upload for payment proof
  if (paymentProofInput) {
    paymentProofInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        // Validate file type
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'application/pdf'];
        if (!allowedTypes.includes(file.type)) {
          alert('Please upload a valid image file (JPEG, PNG, GIF) or PDF.');
          e.target.value = '';
          return;
        }
        
        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
          alert('File size must be less than 5MB.');
          e.target.value = '';
          return;
        }
        
        depositProof = file;
        console.log('📎 Payment proof selected:', file.name);
      } else {
        depositProof = null;
      }
    });
  }
}

function setupCopyButtons() {
  document.querySelectorAll('.copy-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const phoneNumber = '0XX XXX XXXX'; // Replace with actual MoMo number
      copyToClipboard(phoneNumber);
      
      // Visual feedback
      const originalText = btn.textContent;
      btn.textContent = 'Copied!';
      btn.style.background = '#10b981';
      
      setTimeout(() => {
        btn.textContent = originalText;
        btn.style.background = '';
      }, 2000);
    });
  });
}

function copyToClipboard(text) {
  if (navigator.clipboard) {
    navigator.clipboard.writeText(text).then(() => {
      console.log('✅ Copied to clipboard:', text);
    }).catch(err => {
      console.error('❌ Could not copy text:', err);
      fallbackCopyTextToClipboard(text);
    });
  } else {
    fallbackCopyTextToClipboard(text);
  }
}

function fallbackCopyTextToClipboard(text) {
  const textArea = document.createElement('textarea');
  textArea.value = text;
  textArea.style.top = '0';
  textArea.style.left = '0';
  textArea.style.position = 'fixed';
  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();
  
  try {
    document.execCommand('copy');
    console.log('✅ Copied to clipboard (fallback):', text);
  } catch (err) {
    console.error('❌ Could not copy text (fallback):', err);
  }
  
  document.body.removeChild(textArea);
}

function resetBookingForm() {
  currentStep = 1;
  selectedService = null;
  selectedDate = null;
  selectedTime = null;
  timeSlots = [];
  userDetails = { name: '', phone: '', email: '', notes: '' };
  agreedToPolicy = false;
  transactionRef = '';
  depositProof = null;

  if (holdTimer) {
    clearInterval(holdTimer);
    holdTimer = null;
  }

  if (holdCountdownElement) {
    holdCountdownElement.style.display = 'none';
  }

  // Clear form inputs
  const inputs = [
    'user-name', 'user-phone', 'user-email',
    'user-notes', 'transaction-ref', 'policy-checkbox', 'payment-proof'
  ];
  inputs.forEach(inputId => {
    const input = getElement(inputId);
    if (input) {
      if (input.type === 'checkbox') {
        input.checked = false;
      } else if (input.type === 'file') {
        input.value = '';
      } else {
        input.value = '';
      }
    }
  });

  // Clear auth form inputs
  const authInputs = ['auth-email', 'auth-password', 'auth-confirm-password'];
  authInputs.forEach(inputId => {
    const input = getElement(inputId);
    if (input) {
      input.value = '';
    }
  });

  // Clear selections
  document.querySelectorAll('.service-card').forEach(card => card.classList.remove('selected'));
  document.querySelectorAll('.calendar-day').forEach(day => day.classList.remove('selected'));
  document.querySelectorAll('.timeslot').forEach(slot => slot.classList.remove('selected'));

  // Regenerate calendar and update UI
  generateCalendar();
  updateUI();
}

// 🔄 UTILITY FUNCTIONS
function formatCurrency(amount) {
  return `¢${amount.toFixed(0)}`;
}

function formatDate(date) {
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

function formatTime(time) {
  return time; // Already in HH:MM format
}

function generateBookingReference() {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substr(2, 5).toUpperCase();
  return `BS-${timestamp}-${random}`;
}

// 🎯 EVENT HANDLERS
function handleResize() {
  if (selectedDate && timeSlots.length > 0) {
    renderTimeSlots();
  }
}

function cleanup() {
  if (holdTimer) {
    clearInterval(holdTimer);
    holdTimer = null;
  }
}

// 🚀 GLOBAL EVENT LISTENERS
window.addEventListener('resize', handleResize);
window.addEventListener('beforeunload', cleanup);

// Handle modal click outside to close
document.addEventListener('click', (e) => {
  if (e.target === authModal) {
    hideAuthModal();
  }
  if (e.target === confirmModal) {
    hideConfirmModal();
  }
});

// Handle escape key to close modals
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    if (authModal && authModal.style.display === 'flex') {
      hideAuthModal();
    }
    if (confirmModal && confirmModal.style.display === 'flex') {
      hideConfirmModal();
    }
  }
});

// 📊 BOOKING SYSTEM API - Make functions globally available
window.BookingSystem = {
  // Core functions
  resetForm: resetBookingForm,
  getCurrentStep: () => currentStep,
  getSelectedService: () => selectedService,
  getSelectedDate: () => selectedDate,
  getSelectedTime: () => selectedTime,
  getUserDetails: () => userDetails,
  isUserAuthenticated: () => isAuthenticated,
  getCurrentUser: () => currentUser,
  
  // Auth functions
  signOut: handleSignOut,
  showAuthModal,
  hideAuthModal,
  
  // Utility functions
  formatCurrency,
  formatDate,
  formatTime,
  generateBookingReference,
  
  // State getters
  getBookingData: () => ({
    service: selectedService,
    date: selectedDate,
    time: selectedTime,
    user: userDetails,
    authenticated: isAuthenticated,
    currentUser,
    step: currentStep,
    agreedToPolicy,
    transactionRef,
    depositProof: depositProof ? depositProof.name : null
  })
};

// 🔍 DEBUG MODE - Remove in production
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
  window.DEBUG = {
    services,
    currentStep: () => currentStep,
    selectedService: () => selectedService,
    selectedDate: () => selectedDate,
    selectedTime: () => selectedTime,
    userDetails: () => userDetails,
    isAuthenticated: () => isAuthenticated,
    currentUser: () => currentUser,
    firebaseAuth: () => firebaseAuth,
    supabaseClient: () => supabaseClient
  };
  console.log('🐛 Debug mode enabled. Access via window.DEBUG');
}

console.log('✅ Booking System initialized successfully');