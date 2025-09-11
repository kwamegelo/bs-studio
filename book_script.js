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
    { id: 'hybrid-2', name: 'Cat Eye', subtitle: 'Sultry curves', price: 200, duration: 160,  description: 'Seductive and alluring' },
    { id: 'hybrid-3', name: 'Anime Set', subtitle: 'Expressive drama', price: 200, duration: 170, description: 'Dramatic anime-inspired' },
    { id: 'hybrid-4', name: 'Doll Eye', subtitle: 'Sweet innocence', price: 200, duration: 160,  description: 'Cute and innocent' },
    { id: 'hybrid-5', name: 'Mini Wipsy', subtitle: 'Delicate wisp', price: 170, duration: 140, description: 'Subtle textured effect' },
    { id: 'hybrid-6', name: 'Hybrid Wipsy', subtitle: 'Textured layers', price: 200, duration: 180, description: 'Complex layered look' }
  ],
  Volume: [
    { id: 'volume-1', name: 'Regular Volume', subtitle: 'Full dramatic impact', price: 220, duration: 180, description: 'Maximum volume and drama' },
    { id: 'volume-2', name: 'Cat Eye', subtitle: 'Maximum drama', price: 250, duration: 200,  description: 'Ultimate dramatic cat eye' },
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
let holdCountdown = null;
let agreedToPolicy = false;
let depositProof = null;
let transactionRef = '';

// DOM Elements
const steps = document.querySelectorAll('.step');
const stepContents = document.querySelectorAll('[class^="step-content-"]');
const prevBtn = document.getElementById('prev-btn');
const nextBtn = document.getElementById('next-btn');
const nextBtnText = document.getElementById('next-btn-text');
const selectedServiceName = document.getElementById('selected-service-name');
const holdCountdownElement = document.getElementById('hold-countdown');
const countdownTimer = document.getElementById('countdown-timer');
const calendarGrid = document.getElementById('calendar-grid');
const timeslotsGrid = document.getElementById('timeslots-grid');
const classicServices = document.getElementById('classic-services');
const hybridServices = document.getElementById('hybrid-services');
const volumeServices = document.getElementById('volume-services');
const summaryServiceName = document.getElementById('summary-service-name');
const summaryServiceSubtitle = document.getElementById('summary-service-subtitle');
const summaryDate = document.getElementById('summary-date');
const summaryTime = document.getElementById('summary-time');
const summaryDuration = document.getElementById('summary-duration');
const summaryClient = document.getElementById('summary-client');
const summaryPhone = document.getElementById('summary-phone');
const summaryEmail = document.getElementById('summary-email');
const summaryPrice = document.getElementById('summary-price');
const finalService = document.getElementById('final-service');
const finalDatetime = document.getElementById('final-datetime');
const finalClient = document.getElementById('final-client');
const finalContact = document.getElementById('final-contact');
const finalTotal = document.getElementById('final-total');
const paymentReference = document.getElementById('payment-reference');

// Modal elements
const authModal = document.getElementById('auth-modal');
const confirmModal = document.getElementById('confirm-modal');
const authTabs = document.querySelectorAll('.auth-tab');
const authModeInputs = document.querySelectorAll('.auth-form input');
const authSubmitBtn = document.getElementById('auth-submit-btn');
const googleAuthBtn = document.getElementById('google-auth-btn');
const cancelAuthBtn = document.getElementById('cancel-auth-btn');
const backBtn = document.getElementById('back-btn');
const confirmSubmitBtn = document.getElementById('confirm-submit-btn');

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
  populateServices();
  generateCalendar();
  setupEventListeners();
  updateUI(); // 👈 CRITICAL: Ensures Step 1 loads properly
});

function populateServices() {
  // Classic services
  classicServices.innerHTML = '';
  services.Classic.forEach(service => {
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
    classicServices.appendChild(card);
  });

  // Hybrid services
  hybridServices.innerHTML = '';
  services.Hybrid.forEach(service => {
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
    hybridServices.appendChild(card);
  });

  // Volume services
  volumeServices.innerHTML = '';
  services.Volume.forEach(service => {
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
    volumeServices.appendChild(card);
  });
}

function generateCalendar() {
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
        selectedTime = null;
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
        available: Math.random() > 0.3,
        held: Math.random() > 0.8 ? { userId: 'other', expiresAt: Date.now() + 300000 } : null
      });
    }
  }
  timeSlots = slots;
  renderTimeSlots();
}

function renderTimeSlots() {
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
    } else {
      slotElement.addEventListener('click', () => {
        document.querySelectorAll('.timeslot').forEach(s => s.classList.remove('selected'));
        slotElement.classList.add('selected');
        selectedTime = slot;
        startHoldCountdown();
        updateUI();
      });
    }

    if (slot.held) {
      const heldSpan = document.createElement('span');
      heldSpan.className = 'held-text';
      heldSpan.textContent = 'Held';
      slotElement.appendChild(heldSpan);
    }

    timeslotsGrid.appendChild(slotElement);
  });
}

function startHoldCountdown() {
  holdCountdown = 300; // 5 minutes in seconds
  holdCountdownElement.style.display = 'flex';
  updateHoldCountdown();

  const timer = setInterval(() => {
    holdCountdown--;
    updateHoldCountdown();
    if (holdCountdown <= 0) {
      clearInterval(timer);
      holdCountdownElement.style.display = 'none';
      selectedTime = null;
      updateUI();
    }
  }, 1000);
}

function updateHoldCountdown() {
  if (holdCountdown === null) return;
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
      connector.style.width = stepNum < currentStep ? '100%' : '0';
    }
  });

  // Show/hide step content (CRITICAL: Only ONE visible)
  stepContents.forEach(content => {
    const stepNum = parseInt(content.className.match(/step-content-(\d+)/)[1]);
    content.classList.toggle('active-step', stepNum === currentStep);
  });

  // Update navigation buttons
  prevBtn.style.display = currentStep > 1 ? 'flex' : 'none';
  nextBtnText.textContent = currentStep === 4 ? 'Confirm Booking' : 'Continue';
  nextBtn.classList.toggle('disabled', !canProceed());

  // Update selected service name
  if (selectedService) {
    selectedServiceName.textContent = selectedService.name;
  }

  // Update booking summary
  if (selectedService) {
    summaryServiceName.textContent = selectedService.name;
    summaryServiceSubtitle.textContent = selectedService.subtitle;
    summaryPrice.textContent = `¢${selectedService.price}`;
  }
  if (selectedDate) {
    summaryDate.textContent = selectedDate.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  }
  if (selectedTime) {
    summaryTime.textContent = selectedTime.time;
  }
  if (selectedService) {
    summaryDuration.textContent = `~${selectedService.duration} minutes`;
  }
  summaryClient.textContent = userDetails.name;
  summaryPhone.textContent = userDetails.phone;
  summaryEmail.textContent = userDetails.email;

  // Update final confirmation summary
  if (selectedService) {
    finalService.textContent = `${selectedService.name} (${selectedService.subtitle})`;
  }
  if (selectedDate && selectedTime) {
    finalDatetime.textContent = `${selectedDate.toLocaleDateString()} at ${selectedTime.time}`;
  }
  finalClient.textContent = userDetails.name;
  finalContact.textContent = userDetails.phone;
  finalTotal.textContent = selectedService ? `¢${selectedService.price}` : '¢0';

  // Update payment reference
  paymentReference.textContent = `BS-${Date.now()}`;

  // Update form values
  document.getElementById('user-name').value = userDetails.name;
  document.getElementById('user-phone').value = userDetails.phone;
  document.getElementById('user-email').value = userDetails.email;
  document.getElementById('user-notes').value = userDetails.notes;
  document.getElementById('transaction-ref').value = transactionRef;

  // Update policy agreement checkbox
  document.getElementById('policy-checkbox').checked = agreedToPolicy;
}

function canProceed() {
  switch (currentStep) {
    case 1: return selectedService !== null;
    case 2: return selectedDate && selectedTime;
    case 3: return userDetails.name && userDetails.phone && userDetails.email;
    case 4: return agreedToPolicy;
    default: return false;
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
  authModal.style.display = 'flex';
}

function hideAuthModal() {
  authModal.style.display = 'none';
}

function showConfirmModal() {
  confirmModal.style.display = 'flex';
  finalService.textContent = selectedService ? `${selectedService.name} (${selectedService.subtitle})` : '';
  finalDatetime.textContent = selectedDate && selectedTime ? `${selectedDate.toLocaleDateString()} at ${selectedTime.time}` : '';
  finalClient.textContent = userDetails.name;
  finalContact.textContent = userDetails.phone;
  finalTotal.textContent = selectedService ? `¢${selectedService.price}` : '¢0';
}

function hideConfirmModal() {
  confirmModal.style.display = 'none';
}

function setupEventListeners() {
  nextBtn.addEventListener('click', handleNextStep);
  prevBtn.addEventListener('click', handlePrevStep);

  authTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      authTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      const mode = tab.getAttribute('data-mode');
      document.getElementById('auth-confirm-password').style.display = mode === 'register' ? 'block' : 'none';
      authSubmitBtn.textContent = mode === 'login' ? 'Sign In' : 'Create Account';
    });
  });

  authSubmitBtn.addEventListener('click', () => {
    const email = document.getElementById('auth-email').value;
    const password = document.getElementById('auth-password').value;
    const confirmPassword = document.getElementById('auth-confirm-password').value;
    const mode = document.querySelector('.auth-tab.active').getAttribute('data-mode');

    if (!email || !password) {
      alert('Please enter email and password');
      return;
    }
    if (mode === 'register' && password !== confirmPassword) {
      alert('Passwords do not match');
      return;
    }

    isAuthenticated = true;
    hideAuthModal();

    userDetails = {
      name: 'John Doe',
      phone: '+233123456789',
      email: 'user@example.com',
      notes: ''
    };

    currentStep = 3;
    updateUI();
  });

  googleAuthBtn.addEventListener('click', () => {
    isAuthenticated = true;
    hideAuthModal();
    userDetails = {
      name: 'John Doe',
      phone: '+233123456789',
      email: 'user@example.com',
      notes: ''
    };
    currentStep = 3;
    updateUI();
  });

  cancelAuthBtn.addEventListener('click', hideAuthModal);
  backBtn.addEventListener('click', hideConfirmModal);
  confirmSubmitBtn.addEventListener('click', handleBookingSubmit);

  document.getElementById('user-name').addEventListener('input', e => {
    userDetails.name = e.target.value;
    updateUI();
  });

  document.getElementById('user-phone').addEventListener('input', e => {
    userDetails.phone = e.target.value;
    updateUI();
  });

  document.getElementById('user-email').addEventListener('input', e => {
    userDetails.email = e.target.value;
    updateUI();
  });

  document.getElementById('user-notes').addEventListener('input', e => {
    userDetails.notes = e.target.value;
    updateUI();
  });

  document.getElementById('transaction-ref').addEventListener('input', e => {
    transactionRef = e.target.value;
    updateUI();
  });

  document.getElementById('policy-checkbox').addEventListener('change', e => {
    agreedToPolicy = e.target.checked;
    updateUI();
  });

  document.querySelectorAll('.copy-btn').forEach(btn => {
    btn.addEventListener('click', () => copyToClipboard('0XX XXX XXXX'));
  });
}

function copyToClipboard(text) {
  navigator.clipboard.writeText(text).then(() => {
    console.log('Copied to clipboard:', text);
  }).catch(err => {
    console.error('Could not copy text: ', err);
  });
}

function handleBookingSubmit() {
  try {
    const bookingData = {
      userId: 'user123',
      serviceId: selectedService.id,
      slotId: selectedTime.id,
      status: 'pending',
      createdAt: new Date(),
      depositAmount: 50,
      depositRef: transactionRef,
      proofUrl: depositProof,
      userDetails,
      service: selectedService,
      date: selectedDate,
      time: selectedTime.time
    };

    setTimeout(() => {
      hideConfirmModal();
      alert('Booking submitted successfully! You will receive a confirmation once the deposit is verified.');

      // Reset form
      currentStep = 1;
      selectedService = null;
      selectedDate = null;
      selectedTime = null;
      userDetails = { name: '', phone: '', email: '', notes: '' };
      isAuthenticated = false;
      agreedToPolicy = false;
      transactionRef = '';
      depositProof = null;
      updateUI();
    }, 1000);
  } catch (error) {
    console.error('Booking error:', error);
    alert('Failed to submit booking. Please try again.');
  }
}

window.addEventListener('resize', updateUI);