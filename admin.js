// Global State
let state = {
    user: null,
    activeTab: 'dashboard',
    sidebarCollapsed: false,
    isDarkMode: false,
    bookings: [
        { 
            id: '1', 
            customerName: 'Sarah Johnson', 
            service: 'Classic Set', 
            date: '2024-09-15', 
            time: '10:00', 
            status: 'pending', 
            depositRef: 'REF001',
            phone: '+233 24 123 4567',
            email: 'sarah@email.com',
            location: 'Accra, Ghana'
        },
        { 
            id: '2', 
            customerName: 'Maria Garcia', 
            service: 'Hybrid Lashes', 
            date: '2024-09-16', 
            time: '14:00', 
            status: 'confirmed', 
            depositRef: 'REF002',
            phone: '+233 24 234 5678',
            email: 'maria@email.com',
            location: 'Kumasi, Ghana'
        },
        { 
            id: '3', 
            customerName: 'Jennifer Adams', 
            service: 'Volume Set', 
            date: '2024-09-17', 
            time: '11:30', 
            status: 'pending', 
            depositRef: 'REF003',
            phone: '+233 24 345 6789',
            email: 'jennifer@email.com',
            location: 'Tamale, Ghana'
        }
    ],
    services: [
        { 
            id: '1', 
            name: 'Classic Set', 
            category: 'Classic', 
            price: 120, 
            duration: 90, 
            description: 'Beautiful classic lash extensions for a natural look'
        },
        { 
            id: '2', 
            name: 'Hybrid Lashes', 
            category: 'Hybrid', 
            price: 150, 
            duration: 105, 
            description: 'Perfect blend of classic and volume techniques'
        },
        { 
            id: '3', 
            name: 'Volume Set', 
            category: 'Volume', 
            price: 180, 
            duration: 120, 
            description: 'Full volume lashes for dramatic, glamorous look'
        }
    ],
    stats: {
        totalBookings: 45,
        confirmedBookings: 32,
        pendingBookings: 8,
        cancelledBookings: 5,
        weeklyBookings: 12,
        totalCustomers: 156,
        revenue: 4850
    },
    searchQuery: '',
    filterStatus: 'all',
    selectedBooking: null,
    selectedService: null
};

// DOM Elements
const elements = {
    loginScreen: document.getElementById('login-screen'),
    dashboard: document.getElementById('dashboard'),
    sidebar: document.getElementById('sidebar'),
    brandInfo: document.getElementById('brand-info'),
    userInfo: document.getElementById('user-info'),
    pageIcon: document.getElementById('page-icon'),
    pageTitleText: document.getElementById('page-title-text'),
    themeIcon: document.getElementById('theme-icon'),
    searchInput: document.getElementById('search-bookings'),
    statusFilter: document.getElementById('filter-status'),
    bookingModal: document.getElementById('booking-modal'),
    serviceModal: document.getElementById('service-modal')
};

// Initialize the application
function init() {
    feather.replace();
    updateUI();
    renderBookings();
    renderServices();
    renderRecentBookings();
}

// Authentication
function login() {
    state.user = { uid: '123', email: 'admin@bsstudio.com' };
    elements.loginScreen.style.display = 'none';
    elements.dashboard.style.display = 'block';
    updateUI();
}

function logout() {
    state.user = null;
    elements.loginScreen.style.display = 'flex';
    elements.dashboard.style.display = 'none';
}

// UI Updates
function updateUI() {
    // Update sidebar visibility
    if (state.sidebarCollapsed) {
        elements.sidebar.classList.add('collapsed');
    } else {
        elements.sidebar.classList.remove('collapsed');
    }

    // Update page title and icon
    const tabConfig = {
        dashboard: { icon: 'bar-chart-3', title: 'Dashboard' },
        bookings: { icon: 'calendar', title: 'Bookings' },
        slots: { icon: 'clock', title: 'Slots' },
        services: { icon: 'star', title: 'Services' },
        users: { icon: 'users', title: 'Users' },
        settings: { icon: 'settings', title: 'Settings' }
    };

    const config = tabConfig[state.activeTab];
    elements.pageIcon.setAttribute('data-feather', config.icon);
    elements.pageTitleText.textContent = config.title;

    // Update theme icon
    elements.themeIcon.setAttribute('data-feather', state.isDarkMode ? 'sun' : 'moon');

    // Replace feather icons
    feather.replace();
}

// Navigation
function setActiveTab(tab) {
    state.activeTab = tab;
    
    // Update nav items
    document.querySelectorAll('.nav-item').forEach(item => {
        if (item.getAttribute('data-tab') === tab) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });

    // Update content
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    document.getElementById(`${tab}-content`).classList.add('active');

    updateUI();
}

function toggleSidebar() {
    state.sidebarCollapsed = !state.sidebarCollapsed;
    updateUI();
}

function toggleTheme() {
    state.isDarkMode = !state.isDarkMode;
    updateUI();
    // Add theme switching logic here if needed
}

// Booking Management
function renderBookings() {
    const container = document.getElementById('bookings-grid');
    const filteredBookings = filterBookingsData();
    
    container.innerHTML = filteredBookings.map(booking => `
        <div class="booking-card">
            <div class="booking-header">
                <div class="booking-user">
                    <div class="user-avatar-large">${booking.customerName.charAt(0)}</div>
                    <div class="booking-user-info">
                        <h4>${booking.customerName}</h4>
                        <p>${booking.service}</p>
                    </div>
                </div>
                <span class="status-badge status-${booking.status}">${booking.status}</span>
            </div>
            
            <div class="booking-details">
                <div class="booking-detail">
                    <i data-feather="calendar"></i>
                    <span>${booking.date}</span>
                </div>
                <div class="booking-detail">
                    <i data-feather="clock"></i>
                    <span>${booking.time}</span>
                </div>
            </div>

            <div class="booking-actions">
                ${booking.status === 'pending' ? `
                    <button class="btn-confirm" onclick="updateBookingStatus('${booking.id}', 'confirmed')">
                        <i data-feather="check"></i>
                        Confirm
                    </button>
                    <button class="btn-cancel" onclick="updateBookingStatus('${booking.id}', 'cancelled')">
                        <i data-feather="x-circle"></i>
                        Cancel
                    </button>
                ` : ''}
                <button class="btn-view" onclick="showBookingDetails('${booking.id}')">
                    <i data-feather="eye"></i>
                    View
                </button>
            </div>
        </div>
    `).join('');
    
    feather.replace();
}

function renderRecentBookings() {
    const container = document.getElementById('recent-bookings');
    const recentBookings = state.bookings.slice(0, 3);
    
    container.innerHTML = recentBookings.map(booking => `
        <div class="booking-card">
            <div class="booking-header">
                <div class="booking-user">
                    <div class="user-avatar-large">${booking.customerName.charAt(0)}</div>
                    <div class="booking-user-info">
                        <h4>${booking.customerName}</h4>
                        <p>${booking.service}</p>
                    </div>
                </div>
                <span class="status-badge status-${booking.status}">${booking.status}</span>
            </div>
            
            <div class="booking-details">
                <div class="booking-detail">
                    <i data-feather="calendar"></i>
                    <span>${booking.date}</span>
                </div>
                <div class="booking-detail">
                    <i data-feather="clock"></i>
                    <span>${booking.time}</span>
                </div>
            </div>

            <div class="booking-actions">
                ${booking.status === 'pending' ? `
                    <button class="btn-confirm" onclick="updateBookingStatus('${booking.id}', 'confirmed')">
                        <i data-feather="check"></i>
                        Confirm
                    </button>
                    <button class="btn-cancel" onclick="updateBookingStatus('${booking.id}', 'cancelled')">
                        <i data-feather="x-circle"></i>
                        Cancel
                    </button>
                ` : ''}
                <button class="btn-view" onclick="showBookingDetails('${booking.id}')">
                    <i data-feather="eye"></i>
                    View
                </button>
            </div>
        </div>
    `).join('');
    
    feather.replace();
}

function filterBookingsData() {
    return state.bookings.filter(booking => {
        const matchesSearch = booking.customerName.toLowerCase().includes(state.searchQuery.toLowerCase()) ||
                             booking.service.toLowerCase().includes(state.searchQuery.toLowerCase());
        const matchesFilter = state.filterStatus === 'all' || booking.status === state.filterStatus;
        return matchesSearch && matchesFilter;
    });
}

function filterBookings() {
    state.searchQuery = elements.searchInput.value;
    state.filterStatus = elements.statusFilter.value;
    renderBookings();
}

function updateBookingStatus(bookingId, newStatus) {
    const booking = state.bookings.find(b => b.id === bookingId);
    if (booking) {
        booking.status = newStatus;
        renderBookings();
        renderRecentBookings();
        
        // Show notification
        showNotification(`Booking ${newStatus} - notification sent to customer`);
    }
}

function showBookingDetails(bookingId) {
    const booking = state.bookings.find(b => b.id === bookingId);
    if (booking) {
        state.selectedBooking = booking;
        renderBookingModal();
        elements.bookingModal.classList.add('active');
    }
}

function renderBookingModal() {
    const booking = state.selectedBooking;
    const modalBody = document.getElementById('booking-details');
    
    modalBody.innerHTML = `
        <div class="booking-details-header">
            <div class="booking-details-avatar">${booking.customerName.charAt(0)}</div>
            <div class="booking-details-info">
                <h4>${booking.customerName}</h4>
                <span class="status-badge status-${booking.status}">${booking.status}</span>
            </div>
        </div>
        
        <div class="booking-details-grid">
            <div class="booking-details-row">
                <span class="booking-details-label">Service:</span>
                <span class="booking-details-value">${booking.service}</span>
            </div>
            <div class="booking-details-row">
                <span class="booking-details-label">Date:</span>
                <span class="booking-details-value">${booking.date}</span>
            </div>
            <div class="booking-details-row">
                <span class="booking-details-label">Time:</span>
                <span class="booking-details-value">${booking.time}</span>
            </div>
            <div class="booking-details-row">
                <span class="booking-details-label">Reference:</span>
                <span class="booking-details-value reference-text">${booking.depositRef}</span>
            </div>
        </div>
        
        <div class="contact-section">
            <h5>
                <i data-feather="phone"></i>
                Contact Information
            </h5>
            <div class="contact-info">
                <div class="contact-item">
                    <i data-feather="phone"></i>
                    <span>${booking.phone}</span>
                </div>
                <div class="contact-item">
                    <i data-feather="mail"></i>
                    <span>${booking.email}</span>
                </div>
                <div class="contact-item">
                    <i data-feather="map-pin"></i>
                    <span>${booking.location}</span>
                </div>
            </div>
        </div>
        
        ${booking.status === 'pending' ? `
            <div class="booking-actions" style="margin-top: 1rem;">
                <button class="btn-confirm" onclick="updateBookingStatusFromModal('${booking.id}', 'confirmed')">
                    <i data-feather="check"></i>
                    Confirm Booking
                </button>
                <button class="btn-cancel" onclick="updateBookingStatusFromModal('${booking.id}', 'cancelled')">
                    <i data-feather="x-circle"></i>
                    Cancel Booking
                </button>
            </div>
        ` : ''}
    `;
    
    feather.replace();
}

function updateBookingStatusFromModal(bookingId, newStatus) {
    updateBookingStatus(bookingId, newStatus);
    closeBookingModal();
}

function closeBookingModal() {
    elements.bookingModal.classList.remove('active');
    state.selectedBooking = null;
}

// Service Management
function renderServices() {
    const container = document.getElementById('services-grid');
    
    container.innerHTML = state.services.map(service => `
        <div class="service-card">
            <div class="service-header">
                <div class="service-info">
                    <h3>${service.name}</h3>
                    <span class="category-badge">${service.category}</span>
                </div>
                <div class="service-actions">
                    <button class="btn-edit" onclick="editService('${service.id}')">
                        <i data-feather="edit"></i>
                    </button>
                    <button class="btn-delete" onclick="deleteService('${service.id}')">
                        <i data-feather="trash-2"></i>
                    </button>
                </div>
            </div>
            
            <div class="service-details">
                <div class="service-detail">
                    <span>Price:</span>
                    <span class="price-text">GHS ${service.price}</span>
                </div>
                <div class="service-detail">
                    <span>Duration:</span>
                    <span class="duration-text">${service.duration} min</span>
                </div>
            </div>
        </div>
    `).join('');
    
    feather.replace();
}

function showServiceModal(serviceId = null) {
    const service = serviceId ? state.services.find(s => s.id === serviceId) : null;
    state.selectedService = service;
    
    // Update modal title
    document.getElementById('service-modal-title').textContent = service ? 'Edit Service' : 'Add New Service';
    document.getElementById('service-submit-text').textContent = service ? 'Update Service' : 'Create Service';
    
    // Fill form if editing
    if (service) {
        document.getElementById('service-name').value = service.name;
        document.getElementById('service-category').value = service.category;
        document.getElementById('service-price').value = service.price;
        document.getElementById('service-duration').value = service.duration;
        document.getElementById('service-description').value = service.description || '';
    } else {
        document.getElementById('service-form').reset();
    }
    
    elements.serviceModal.classList.add('active');
}

function editService(serviceId) {
    showServiceModal(serviceId);
}

function deleteService(serviceId) {
    if (confirm('Are you sure you want to delete this service?')) {
        state.services = state.services.filter(s => s.id !== serviceId);
        renderServices();
        showNotification('Service deleted successfully');
    }
}

function saveService(event) {
    event.preventDefault();
    
    const formData = {
        name: document.getElementById('service-name').value,
        category: document.getElementById('service-category').value,
        price: parseInt(document.getElementById('service-price').value),
        duration: parseInt(document.getElementById('service-duration').value),
        description: document.getElementById('service-description').value
    };
    
    if (state.selectedService) {
        // Update existing service
        const index = state.services.findIndex(s => s.id === state.selectedService.id);
        state.services[index] = { ...state.selectedService, ...formData };
        showNotification('Service updated successfully');
    } else {
        // Add new service
        const newService = {
            id: Date.now().toString(),
            ...formData
        };
        state.services.push(newService);
        showNotification('Service created successfully');
    }
    
    renderServices();
    closeServiceModal();
}

function closeServiceModal() {
    elements.serviceModal.classList.remove('active');
    state.selectedService = null;
    document.getElementById('service-form').reset();
}

// Utility Functions
function showNotification(message) {
    // Create notification element
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(135deg, #9333ea 0%, #ec4899 100%);
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 0.5rem;
        box-shadow: 0 10px 25px -3px rgba(0, 0, 0, 0.1);
        z-index: 10000;
        font-weight: 600;
        transform: translateX(100%);
        transition: transform 0.3s ease;
    `;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// Event Listeners
document.addEventListener('DOMContentLoaded', init);

// Modal click outside to close
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal')) {
        e.target.classList.remove('active');
        if (e.target === elements.bookingModal) {
            state.selectedBooking = null;
        }
        if (e.target === elements.serviceModal) {
            state.selectedService = null;
        }
    }
});

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        elements.bookingModal.classList.remove('active');
        elements.serviceModal.classList.remove('active');
        state.selectedBooking = null;
        state.selectedService = null;
    }
});

// Initialize search functionality
if (elements.searchInput) {
    elements.searchInput.addEventListener('input', filterBookings);
}

if (elements.statusFilter) {
    elements.statusFilter.addEventListener('change', filterBookings);
}