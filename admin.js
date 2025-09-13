// Global State
let state = {
    user: null,
    activeTab: 'dashboard',
    sidebarCollapsed: false,
    isDarkMode: localStorage.getItem('theme') === 'dark',
    bookings: [],
    deletedBookings: [],
    services: [],
    users: [],
    timeSlots: [],
    settings: {},
    stats: {
        totalBookings: 0,
        confirmedBookings: 0,
        pendingBookings: 0,
        completedBookings: 0,
        cancelledBookings: 0,
        totalUsers: 0,
        revenue: 0
    },
    searchQuery: '',
    filterStatus: 'all',
    selectedBooking: null,
    selectedService: null,
    calendarCurrentDate: new Date(),
    isCalendarView: false,
    selectedDate: null,
    bookingsSubTab: 'current'
};

// Supabase Configuration
const SUPABASE_URL = 'https://foauqtwkuublsursedjs.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZvYXVxdHdrdXVibHN1cnNlZGpzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcyODE5OTMsImV4cCI6MjA3Mjg1Nzk5M30.d7Eo8PIeix9Pr1XuLvhDKcgtqmtpherr3OezsR3pm1Y';

// Initialize Supabase client
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// DOM Elements
const elements = {
    dashboard: document.getElementById('dashboard'),
    sidebar: document.getElementById('sidebar'),
    brandInfo: document.getElementById('brand-info'),
    userInfo: document.getElementById('user-info'),
    pageIcon: document.getElementById('page-icon'),
    pageTitleText: document.getElementById('page-title-text'),
    themeIcon: document.getElementById('theme-icon'),
    searchInput: document.getElementById('search-bookings'),
    statusFilter: document.getElementById('filter-status'),
    serviceModal: document.getElementById('service-modal')
};

// Initialize the application
async function init() {
    console.log('Initializing admin dashboard...');
    feather.replace();
    setupTheme();
    await initializeAuth();
    updateUI();
    
    // Load initial dashboard data
    if (state.user) {
        await loadDashboardData();
    }
}

// Setup theme
function setupTheme() {
    if (state.isDarkMode) {
        document.body.classList.add('dark-mode');
        elements.themeIcon.setAttribute('data-feather', 'sun');
    } else {
        elements.themeIcon.setAttribute('data-feather', 'moon');
    }
}

// Firebase Auth Setup
async function initializeAuth() {
    try {
        // Listen for auth state changes
        window.firebaseAuth.onAuthStateChanged(async (user) => {
            console.log('Auth state changed:', user?.email || 'No user');
            
            if (user) {
                state.user = user;
                
                // Update user info in UI
                const userAvatar = document.getElementById('user-avatar');
                const userName = document.getElementById('user-name');
                const userEmail = document.getElementById('user-email');
                
                if (userAvatar) {
                    userAvatar.textContent = (user.displayName || user.email || 'A').charAt(0).toUpperCase();
                }
                if (userName) {
                    userName.textContent = user.displayName || user.email.split('@')[0] || 'Admin User';
                }
                if (userEmail) {
                    userEmail.textContent = user.email || 'admin@bsstudio.com';
                }
                
                // Save user to Supabase if not exists
                await saveUserToSupabase(user);
                
                // Load dashboard data
                await loadDashboardData();
                showToast('Welcome back!', 'success');
            } else {
                state.user = null;
                console.log('User not authenticated - redirecting to login');
                // Redirect to login or handle unauthenticated state
                window.location.href = 'login.html';
            }
        });
    } catch (error) {
        console.error('Error initializing auth:', error);
        showToast('Error initializing authentication', 'error');
    }
}

// Save user to Supabase
async function saveUserToSupabase(user) {
    try {
        const { data, error } = await supabaseClient
            .from('users')
            .upsert({
                id: user.uid,
                email: user.email,
                name: user.displayName || user.email.split('@')[0],
                role: 'admin',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            })
            .select();
        
        if (error) throw error;
        console.log('User saved to Supabase:', data);
    } catch (error) {
        console.error('Error saving user:', error);
        showToast('Error saving user data', 'error');
    }
}

// Load Dashboard Data
async function loadDashboardData() {
    console.log('Loading dashboard data...');
    try {
        // Show loading state
        const loadingElements = ['total-bookings', 'confirmed-bookings', 'total-users', 'total-revenue'];
        loadingElements.forEach(id => {
            const element = document.getElementById(id);
            if (element) element.textContent = 'Loading...';
        });
        
        await Promise.all([
            loadBookings(),
            loadServices(),
            loadUsers(),
            loadTimeSlots(),
            loadSettings()
        ]);
        
        updateStats();
        renderDashboard();
        renderCharts();
        
        console.log('Dashboard data loaded successfully');
    } catch (error) {
        console.error('Error loading dashboard data:', error);
        showToast('Error loading dashboard data', 'error');
    }
}

// Load Bookings
async function loadBookings() {
    try {
        const { data, error } = await supabaseClient
            .from('bookings')
            .select('*')
            .order('created_at', { ascending: false });
        
        if (error) throw error;
        
        state.bookings = data || [];
        console.log(`Loaded ${state.bookings.length} bookings`);
        
        // Update booking count in sidebar
        const bookingCount = document.getElementById('booking-count');
        if (bookingCount) {
            bookingCount.textContent = state.bookings.length;
        }
        
    } catch (error) {
        console.error('Error loading bookings:', error);
        state.bookings = [];
        showToast('Error loading bookings', 'error');
    }
}

// Load Deleted Bookings
async function loadDeletedBookings() {
    try {
        const { data, error } = await supabaseClient
            .from('deleted_bookings')
            .select('*')
            .order('created_at', { ascending: false });
        
        if (error) throw error;
        state.deletedBookings = data || [];
        console.log(`Loaded ${state.deletedBookings.length} deleted bookings`);
    } catch (error) {
        console.error('Error loading deleted bookings:', error);
        state.deletedBookings = [];
    }
}

// Load Services
async function loadServices() {
    try {
        const { data, error } = await supabaseClient
            .from('services')
            .select('*')
            .eq('status', 'active')
            .order('created_at', { ascending: false });
        
        if (error) throw error;
        state.services = data || [];
        console.log(`Loaded ${state.services.length} services`);
    } catch (error) {
        console.error('Error loading services:', error);
        state.services = [];
        showToast('Error loading services', 'error');
    }
}

// Load Users
async function loadUsers() {
    try {
        const { data, error } = await supabaseClient
            .from('users')
            .select('*')
            .order('created_at', { ascending: false });
        
        if (error) throw error;
        state.users = data || [];
        console.log(`Loaded ${state.users.length} users`);
    } catch (error) {
        console.error('Error loading users:', error);
        state.users = [];
        showToast('Error loading users', 'error');
    }
}

// Load Time Slots
async function loadTimeSlots() {
    try {
        const { data, error } = await supabaseClient
            .from('time_slots')
            .select('*')
            .order('date', { ascending: true });
        
        if (error) throw error;
        state.timeSlots = data || [];
        console.log(`Loaded ${state.timeSlots.length} time slots`);
    } catch (error) {
        console.error('Error loading time slots:', error);
        state.timeSlots = [];
    }
}

// Load Settings
async function loadSettings() {
    try {
        const { data, error } = await supabaseClient
            .from('system_settings')
            .select('*')
            .single();
        
        if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
            throw error;
        }
        
        state.settings = data || {};
        
        // Update settings in UI
        if (data) {
            const depositAmount = document.getElementById('deposit-amount');
            const momoNumber = document.getElementById('momo-number');
            const bookingPolicy = document.getElementById('booking-policy');
            
            if (depositAmount) depositAmount.value = data.deposit_amount || 50;
            if (momoNumber) momoNumber.value = data.momo_number || '';
            if (bookingPolicy) bookingPolicy.value = data.booking_policy || '';
        }
        console.log('Settings loaded');
    } catch (error) {
        console.error('Error loading settings:', error);
        state.settings = {};
    }
}

// Update Stats - This is the key function for real-time dashboard updates
function updateStats() {
    console.log('Updating dashboard stats...');
    
    const now = new Date();
    const currentMonth = now.getFullYear() + '-' + String(now.getMonth() + 1).padStart(2, '0');
    
    // Calculate booking stats
    state.stats.totalBookings = state.bookings.length;
    state.stats.confirmedBookings = state.bookings.filter(b => b.status === 'confirmed').length;
    state.stats.pendingBookings = state.bookings.filter(b => b.status === 'pending').length;
    state.stats.completedBookings = state.bookings.filter(b => b.status === 'completed').length;
    state.stats.cancelledBookings = state.bookings.filter(b => b.status === 'cancelled').length;
    
    // Calculate total users
    state.stats.totalUsers = state.users.length;
    
    // Calculate revenue from this month's confirmed/completed bookings
    state.stats.revenue = state.bookings
        .filter(booking => {
            if (!booking.booking_date) return false;
            
            const bookingMonth = booking.booking_date.substring(0, 7); // Extract YYYY-MM
            const isCurrentMonth = bookingMonth === currentMonth;
            const isRevenueStatus = booking.status === 'confirmed' || booking.status === 'completed';
            
            return isCurrentMonth && isRevenueStatus;
        })
        .reduce((total, booking) => {
            const price = parseFloat(booking.service_price) || 0;
            return total + price;
        }, 0);
    
    // Update DOM elements
    const totalBookingsEl = document.getElementById('total-bookings');
    const confirmedBookingsEl = document.getElementById('confirmed-bookings');
    const totalUsersEl = document.getElementById('total-users');
    const totalRevenueEl = document.getElementById('total-revenue');
    
    if (totalBookingsEl) {
        totalBookingsEl.textContent = state.stats.totalBookings.toString();
    }
    if (confirmedBookingsEl) {
        confirmedBookingsEl.textContent = state.stats.confirmedBookings.toString();
    }
    if (totalUsersEl) {
        totalUsersEl.textContent = state.stats.totalUsers.toString();
    }
    if (totalRevenueEl) {
        totalRevenueEl.textContent = `₵${state.stats.revenue.toFixed(0)}`;
    }
    
    console.log('Stats updated:', {
        totalBookings: state.stats.totalBookings,
        confirmedBookings: state.stats.confirmedBookings,
        totalUsers: state.stats.totalUsers,
        revenue: state.stats.revenue
    });
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
    if (config && elements.pageIcon && elements.pageTitleText) {
        elements.pageIcon.setAttribute('data-feather', config.icon);
        elements.pageTitleText.textContent = config.title;
    }

    // Update theme icon
    if (elements.themeIcon) {
        elements.themeIcon.setAttribute('data-feather', state.isDarkMode ? 'sun' : 'moon');
    }

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
    const tabContent = document.getElementById(`${tab}-content`);
    if (tabContent) {
        tabContent.classList.add('active');
    }

    // Load tab-specific data
    switch(tab) {
        case 'bookings':
            renderBookings();
            break;
        case 'services':
            renderServices();
            break;
        case 'users':
            renderUsers();
            break;
        case 'slots':
            renderSlots();
            break;
        case 'dashboard':
            renderDashboard();
            break;
    }

    updateUI();
}

function toggleSidebar() {
    state.sidebarCollapsed = !state.sidebarCollapsed;
    updateUI();
}

function toggleTheme() {
    state.isDarkMode = !state.isDarkMode;
    localStorage.setItem('theme', state.isDarkMode ? 'dark' : 'light');
    document.body.classList.toggle('dark-mode', state.isDarkMode);
    updateUI();
}

// Booking Management
function renderBookings() {
    if (state.bookingsSubTab === 'current') {
        renderCurrentBookings();
    } else {
        renderDeletedBookings();
    }
}

function renderCurrentBookings() {
    const container = document.getElementById('list-view');
    if (!container) return;
    
    const filteredBookings = filterBookingsData();
    
    if (filteredBookings.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i data-feather="calendar"></i>
                <h3>No bookings found</h3>
                <p>No bookings match your current filters.</p>
            </div>
        `;
        feather.replace();
        return;
    }
    
    container.innerHTML = filteredBookings.map(booking => `
        <div class="booking-card">
            <div class="booking-header">
                <div class="booking-user">
                    <div class="user-avatar-large">${(booking.client_name || booking.user_email || 'U').charAt(0).toUpperCase()}</div>
                    <div class="booking-user-info">
                        <h4>${booking.client_name || booking.user_email || 'Unknown Client'}</h4>
                        <p>${booking.service_name || 'Unknown Service'}</p>
                    </div>
                </div>
                <span class="status-badge status-${booking.status}">${(booking.status || 'pending').charAt(0).toUpperCase() + (booking.status || 'pending').slice(1)}</span>
            </div>
            
            <div class="booking-details">
                <div class="booking-detail">
                    <i data-feather="calendar"></i>
                    <span>${formatDate(booking.booking_date)}</span>
                </div>
                <div class="booking-detail">
                    <i data-feather="clock"></i>
                    <span>${booking.booking_time || 'No time'}</span>
                </div>
                <div class="booking-detail">
                    <i data-feather="dollar-sign"></i>
                    <span>₵${booking.service_price || 0}</span>
                </div>
            </div>

            <div class="booking-actions">
                ${booking.status === 'pending' ? `
                    <button class="btn-confirm" onclick="updateBookingStatus('${booking.id}', 'confirmed')">
                        <i data-feather="check"></i>
                        Confirm
                    </button>
                ` : ''}
                ${booking.status === 'confirmed' ? `
                    <button class="btn-confirm" onclick="updateBookingStatus('${booking.id}', 'completed')">
                        <i data-feather="check-circle"></i>
                        Mark Done
                    </button>
                ` : ''}
                <button class="btn-view" onclick="showBookingDetails('${booking.id}')">
                    <i data-feather="eye"></i>
                    View
                </button>
                <button class="btn-cancel" onclick="deleteBooking('${booking.id}')">
                    <i data-feather="trash-2"></i>
                    Delete
                </button>
            </div>
        </div>
    `).join('');
    
    feather.replace();
}

async function renderDeletedBookings() {
    await loadDeletedBookings();
    const container = document.getElementById('deleted-bookings-list');
    if (!container) return;
    
    if (state.deletedBookings.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i data-feather="trash-2"></i>
                <h3>No deleted bookings</h3>
                <p>Deleted bookings will appear here.</p>
            </div>
        `;
        feather.replace();
        return;
    }
    
    container.innerHTML = state.deletedBookings.map(booking => `
        <div class="booking-card deleted">
            <div class="booking-header">
                <div class="booking-user">
                    <div class="user-avatar-large">${(booking.client_name || booking.user_email || 'U').charAt(0).toUpperCase()}</div>
                    <div class="booking-user-info">
                        <h4>${booking.client_name || booking.user_email || 'Unknown Client'}</h4>
                        <p>${booking.service_name || 'Unknown Service'}</p>
                    </div>
                </div>
                <span class="status-badge status-deleted">Deleted</span>
            </div>
            
            <div class="booking-details">
                <div class="booking-detail">
                    <i data-feather="calendar"></i>
                    <span>${formatDate(booking.booking_date)}</span>
                </div>
                <div class="booking-detail">
                    <i data-feather="clock"></i>
                    <span>${booking.booking_time || 'No time'}</span>
                </div>
                <div class="booking-detail">
                    <i data-feather="dollar-sign"></i>
                    <span>₵${booking.service_price || 0}</span>
                </div>
            </div>

            <div class="booking-actions">
                <button class="btn-view" onclick="restoreBooking('${booking.id}')">
                    <i data-feather="rotate-ccw"></i>
                    Restore
                </button>
            </div>
        </div>
    `).join('');
    
    feather.replace();
}

function renderRecentBookings() {
    const container = document.getElementById('recent-bookings');
    if (!container) return;
    
    const recentBookings = state.bookings.slice(0, 3);
    
    if (recentBookings.length === 0) {
        container.innerHTML = `
            <div class="empty-state-small">
                <p>No recent bookings</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = recentBookings.map(booking => `
        <div class="booking-card">
            <div class="booking-header">
                <div class="booking-user">
                    <div class="user-avatar-large">${(booking.client_name || booking.user_email || 'U').charAt(0).toUpperCase()}</div>
                    <div class="booking-user-info">
                        <h4>${booking.client_name || booking.user_email || 'Unknown Client'}</h4>
                        <p>${booking.service_name || 'Unknown Service'}</p>
                    </div>
                </div>
                <span class="status-badge status-${booking.status}">${(booking.status || 'pending').charAt(0).toUpperCase() + (booking.status || 'pending').slice(1)}</span>
            </div>
            
            <div class="booking-details">
                <div class="booking-detail">
                    <i data-feather="calendar"></i>
                    <span>${formatDate(booking.booking_date)}</span>
                </div>
                <div class="booking-detail">
                    <i data-feather="clock"></i>
                    <span>${booking.booking_time || 'No time'}</span>
                </div>
            </div>
        </div>
    `).join('');
    
    feather.replace();
}

function renderDashboard() {
    renderRecentBookings();
    updateStats(); // Ensure stats are updated when dashboard is rendered
}

function filterBookingsData() {
    return state.bookings.filter(booking => {
        const searchFields = [
            booking.client_name || '',
            booking.user_email || '',
            booking.service_name || ''
        ].join(' ').toLowerCase();
        
        const matchesSearch = !state.searchQuery || searchFields.includes(state.searchQuery.toLowerCase());
        const matchesFilter = state.filterStatus === 'all' || booking.status === state.filterStatus;
        return matchesSearch && matchesFilter;
    });
}

function filterBookings() {
    const searchInput = document.getElementById('search-bookings');
    const statusFilter = document.getElementById('filter-status');
    
    state.searchQuery = searchInput ? searchInput.value : '';
    state.filterStatus = statusFilter ? statusFilter.value : 'all';
    renderBookings();
}

async function updateBookingStatus(bookingId, newStatus) {
    try {
        const { error } = await supabaseClient
            .from('bookings')
            .update({ 
                status: newStatus,
                updated_at: new Date().toISOString()
            })
            .eq('id', bookingId);
        
        if (error) throw error;
        
        // Update local state
        const booking = state.bookings.find(b => b.id === bookingId);
        if (booking) {
            booking.status = newStatus;
            booking.updated_at = new Date().toISOString();
        }
        
        // Re-render affected components and update stats
        renderBookings();
        renderRecentBookings();
        updateStats(); // This will update the dashboard numbers in real-time
        
        showToast(`Booking ${newStatus} successfully`, 'success');
    } catch (error) {
        console.error('Error updating booking status:', error);
        showToast('Error updating booking status', 'error');
    }
}

async function deleteBooking(bookingId) {
    if (!confirm('Are you sure you want to delete this booking? It will be moved to the deleted bookings section.')) {
        return;
    }
    
    try {
        const booking = state.bookings.find(b => b.id === bookingId);
        if (!booking) return;
        
        // Move to deleted_bookings table
        const { error: insertError } = await supabaseClient
            .from('deleted_bookings')
            .insert({
                ...booking,
                deleted_at: new Date().toISOString()
            });
        
        if (insertError) throw insertError;
        
        // Remove from bookings table
        const { error: deleteError } = await supabaseClient
            .from('bookings')
            .delete()
            .eq('id', bookingId);
        
        if (deleteError) throw deleteError;
        
        // Update local state
        state.bookings = state.bookings.filter(b => b.id !== bookingId);
        
        // Re-render and update stats
        renderBookings();
        renderRecentBookings();
        updateStats(); // Update dashboard stats in real-time
        
        showToast('Booking moved to deleted section', 'success');
    } catch (error) {
        console.error('Error deleting booking:', error);
        showToast('Error deleting booking', 'error');
    }
}

async function restoreBooking(bookingId) {
    try {
        const deletedBooking = state.deletedBookings.find(b => b.id === bookingId);
        if (!deletedBooking) return;
        
        // Remove deleted_at field and restore to bookings table
        const { deleted_at, ...bookingData } = deletedBooking;
        
        const { error: insertError } = await supabaseClient
            .from('bookings')
            .insert({
                ...bookingData,
                updated_at: new Date().toISOString()
            });
        
        if (insertError) throw insertError;
        
        // Remove from deleted_bookings table
        const { error: deleteError } = await supabaseClient
            .from('deleted_bookings')
            .delete()
            .eq('id', bookingId);
        
        if (deleteError) throw deleteError;
        
        // Reload data and update stats
        await loadBookings();
        renderDeletedBookings();
        updateStats(); // Update dashboard stats in real-time
        
        showToast('Booking restored successfully', 'success');
    } catch (error) {
        console.error('Error restoring booking:', error);
        showToast('Error restoring booking', 'error');
    }
}

function showBookingDetails(bookingId) {
    const booking = state.bookings.find(b => b.id === bookingId);
    if (!booking) return;
    
    // Create modal if it doesn't exist
    let modal = document.getElementById('booking-modal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'booking-modal';
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Booking Details</h3>
                    <button onclick="closeBookingModal()" class="close-btn">
                        <i data-feather="x"></i>
                    </button>
                </div>
                <div class="modal-body">
                    <div id="booking-details"></div>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }
    
    state.selectedBooking = booking;
    renderBookingModal();
    modal.classList.add('active');
}

function renderBookingModal() {
    const booking = state.selectedBooking;
    if (!booking) return;
    
    const modalBody = document.getElementById('booking-details');
    if (!modalBody) return;
    
    modalBody.innerHTML = `
        <div class="booking-details-header">
            <div class="booking-details-avatar">${(booking.client_name || booking.user_email || 'U').charAt(0).toUpperCase()}</div>
            <div class="booking-details-info">
                <h4>${booking.client_name || booking.user_email || 'Unknown Client'}</h4>
                <span class="status-badge status-${booking.status}">${(booking.status || 'pending').charAt(0).toUpperCase() + (booking.status || 'pending').slice(1)}</span>
            </div>
        </div>
        
        <div class="booking-details-grid">
            <div class="booking-details-row">
                <span class="booking-details-label">Service:</span>
                <span class="booking-details-value">${booking.service_name || 'Unknown Service'}</span>
            </div>
            <div class="booking-details-row">
                <span class="booking-details-label">Date:</span>
                <span class="booking-details-value">${formatDate(booking.booking_date)}</span>
            </div>
            <div class="booking-details-row">
                <span class="booking-details-label">Time:</span>
                <span class="booking-details-value">${booking.booking_time || 'No time'}</span>
            </div>
            <div class="booking-details-row">
                <span class="booking-details-label">Price:</span>
                <span class="booking-details-value">₵${booking.service_price || 0}</span>
            </div>
            ${booking.deposit_ref ? `
                <div class="booking-details-row">
                    <span class="booking-details-label">Deposit Reference:</span>
                    <span class="booking-details-value reference-text">${booking.deposit_ref}</span>
                </div>
            ` : ''}
        </div>
        
        ${booking.client_phone || booking.client_email ? `
            <div class="contact-section">
                <h5>
                    <i data-feather="phone"></i>
                    Contact Information
                </h5>
                <div class="contact-info">
                    ${booking.client_phone ? `
                        <div class="contact-item">
                            <i data-feather="phone"></i>
                            <span>${booking.client_phone}</span>
                        </div>
                    ` : ''}
                    ${booking.client_email ? `
                        <div class="contact-item">
                            <i data-feather="mail"></i>
                            <span>${booking.client_email}</span>
                        </div>
                    ` : ''}
                </div>
            </div>
        ` : ''}
        
        ${booking.client_notes ? `
            <div class="notes-section">
                <h5>
                    <i data-feather="file-text"></i>
                    Notes
                </h5>
                <p>${booking.client_notes}</p>
            </div>
        ` : ''}
        
        <div class="booking-actions" style="margin-top: 1rem;">
            ${booking.status === 'pending' ? `
                <button class="btn-confirm" onclick="updateBookingStatusFromModal('${booking.id}', 'confirmed')">
                    <i data-feather="check"></i>
                    Confirm Booking
                </button>
            ` : ''}
            ${booking.status === 'confirmed' ? `
                <button class="btn-confirm" onclick="updateBookingStatusFromModal('${booking.id}', 'completed')">
                    <i data-feather="check-circle"></i>
                    Mark as Done
                </button>
            ` : ''}
            <button class="btn-cancel" onclick="deleteBookingFromModal('${booking.id}')">
                <i data-feather="trash-2"></i>
                Delete Booking
            </button>
        </div>
    `;
    
    feather.replace();
}

async function updateBookingStatusFromModal(bookingId, newStatus) {
    await updateBookingStatus(bookingId, newStatus);
    closeBookingModal();
}

async function deleteBookingFromModal(bookingId) {
    await deleteBooking(bookingId);
    closeBookingModal();
}

function closeBookingModal() {
    const modal = document.getElementById('booking-modal');
    if (modal) {
        modal.classList.remove('active');
    }
    state.selectedBooking = null;
}

// Service Management
function renderServices() {
    const container = document.getElementById('services-grid');
    if (!container) return;
    
    if (state.services.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i data-feather="star"></i>
                <h3>No services found</h3>
                <p>Click "Add Service" to create your first service.</p>
            </div>
        `;
        feather.replace();
        return;
    }
    
    container.innerHTML = state.services.map(service => `
        <div class="service-card">
            <div class="service-header">
                <div class="service-info">
                    <h3>${service.name || 'Unnamed Service'}</h3>
                    <span class="category-badge">${service.category || 'Uncategorized'}</span>
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
                    <span class="price-text">₵${service.price || 0}</span>
                </div>
                <div class="service-detail">
                    <span>Duration:</span>
                    <span class="duration-text">${service.duration || 0} min</span>
                </div>
            </div>
            
            ${service.description ? `
                <div class="service-description">
                    <p>${service.description}</p>
                </div>
            ` : ''}
        </div>
    `).join('');
    
    feather.replace();
}

function showServiceModal(serviceId = null) {
    const service = serviceId ? state.services.find(s => s.id === serviceId) : null;
    state.selectedService = service;
    
    // Update modal title
    const modalTitle = document.getElementById('service-modal-title');
    const submitText = document.getElementById('service-submit-text');
    
    if (modalTitle) modalTitle.textContent = service ? 'Edit Service' : 'Add New Service';
    if (submitText) submitText.textContent = service ? 'Update Service' : 'Create Service';
    
    // Fill form if editing
    if (service) {
        const nameInput = document.getElementById('service-name');
        const categoryInput = document.getElementById('service-category');
        const priceInput = document.getElementById('service-price');
        const durationInput = document.getElementById('service-duration');
        const descriptionInput = document.getElementById('service-description');
        
        if (nameInput) nameInput.value = service.name || '';
        if (categoryInput) categoryInput.value = service.category || 'Classic';
        if (priceInput) priceInput.value = service.price || '';
        if (durationInput) durationInput.value = service.duration || '';
        if (descriptionInput) descriptionInput.value = service.description || '';
    } else {
        const form = document.getElementById('service-form');
        if (form) form.reset();
    }
    
    if (elements.serviceModal) {
        elements.serviceModal.classList.add('active');
    }
}

function editService(serviceId) {
    showServiceModal(serviceId);
}

async function deleteService(serviceId) {
    if (!confirm('Are you sure you want to delete this service?')) {
        return;
    }
    
    try {
        const { error } = await supabaseClient
            .from('services')
            .update({ 
                status: 'inactive',
                updated_at: new Date().toISOString()
            })
            .eq('id', serviceId);
        
        if (error) throw error;
        
        // Remove from local state
        state.services = state.services.filter(s => s.id !== serviceId);
        renderServices();
        
        showToast('Service deleted successfully', 'success');
    } catch (error) {
        console.error('Error deleting service:', error);
        showToast('Error deleting service', 'error');
    }
}

async function saveService(event) {
    event.preventDefault();
    
    const nameInput = document.getElementById('service-name');
    const categoryInput = document.getElementById('service-category');
    const priceInput = document.getElementById('service-price');
    const durationInput = document.getElementById('service-duration');
    const descriptionInput = document.getElementById('service-description');
    
    const formData = {
        name: nameInput ? nameInput.value : '',
        category: categoryInput ? categoryInput.value : 'Classic',
        price: priceInput ? parseInt(priceInput.value) || 0 : 0,
        duration: durationInput ? parseInt(durationInput.value) || 0 : 0,
        description: descriptionInput ? descriptionInput.value : '',
        status: 'active',
        updated_at: new Date().toISOString()
    };
    
    try {
        if (state.selectedService) {
            // Update existing service
            const { error } = await supabaseClient
                .from('services')
                .update(formData)
                .eq('id', state.selectedService.id);
            
            if (error) throw error;
            
            // Update local state
            const index = state.services.findIndex(s => s.id === state.selectedService.id);
            if (index !== -1) {
                state.services[index] = { ...state.selectedService, ...formData };
            }
            
            showToast('Service updated successfully', 'success');
        } else {
            // Add new service
            formData.created_at = new Date().toISOString();
            
            const { data, error } = await supabaseClient
                .from('services')
                .insert(formData)
                .select()
                .single();
            
            if (error) throw error;
            
            // Add to local state
            state.services.push(data);
            
            showToast('Service created successfully', 'success');
        }
        
        renderServices();
        closeServiceModal();
    } catch (error) {
        console.error('Error saving service:', error);
        showToast('Error saving service', 'error');
    }
}

function closeServiceModal() {
    if (elements.serviceModal) {
        elements.serviceModal.classList.remove('active');
    }
    state.selectedService = null;
    const form = document.getElementById('service-form');
    if (form) form.reset();
}

// Users Management
function renderUsers() {
    const container = document.getElementById('users-grid');
    if (!container) return;
    
    const filteredUsers = filterUsersData();
    
    if (filteredUsers.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i data-feather="users"></i>
                <h3>No users found</h3>
                <p>No users match your current search.</p>
            </div>
        `;
        feather.replace();
        return;
    }
    
    container.innerHTML = filteredUsers.map(user => `
        <div class="user-card">
            <div class="user-header">
                <div class="user-info">
                    <div class="user-avatar-large">${(user.name || user.email || 'U').charAt(0).toUpperCase()}</div>
                    <div class="user-details">
                        <h4>${user.name || 'No Name'}</h4>
                        <p>${user.email || 'No Email'}</p>
                        <span class="role-badge role-${user.role || 'user'}">${(user.role || 'user').charAt(0).toUpperCase() + (user.role || 'user').slice(1)}</span>
                    </div>
                </div>
                <div class="user-actions">
                    <span class="user-date">Joined: ${formatDate(user.created_at)}</span>
                </div>
            </div>
            
            ${user.phone ? `
                <div class="user-contact">
                    <div class="contact-item">
                        <i data-feather="phone"></i>
                        <span>${user.phone}</span>
                    </div>
                </div>
            ` : ''}
        </div>
    `).join('');
    
    feather.replace();
}

function filterUsersData() {
    const searchInput = document.getElementById('search-users');
    const searchQuery = searchInput ? searchInput.value.toLowerCase() : '';
    
    return state.users.filter(user => {
        if (!searchQuery) return true;
        
        const searchFields = [
            user.name || '',
            user.email || '',
            user.phone || ''
        ].join(' ').toLowerCase();
        
        return searchFields.includes(searchQuery);
    });
}

function filterUsers() {
    renderUsers();
}

// Slots Management
function renderSlots() {
    generateDefaultSlots();
    renderCustomSlots();
}

function generateDefaultSlots() {
    const container = document.getElementById('slots-grid');
    if (!container) return;
    
    const defaultTimes = [
        '08:00', '09:00', '10:00', '11:00', '12:00', 
        '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'
    ];
    
    container.innerHTML = defaultTimes.map(time => `
        <div class="slot-item">
            <label class="slot-checkbox">
                <input type="checkbox" checked data-time="${time}">
                <span class="checkmark"></span>
                ${time}
            </label>
        </div>
    `).join('');
}

function renderCustomSlots() {
    const dateInput = document.getElementById('custom-slot-date');
    if (dateInput && dateInput.value) {
        updateCustomSlotDate();
    }
}

function updateCustomSlotDate() {
    const dateInput = document.getElementById('custom-slot-date');
    const container = document.getElementById('custom-slots-container');
    
    if (!dateInput || !container) return;
    
    const selectedDate = dateInput.value;
    if (!selectedDate) return;
    
    // Find existing slot data for this date
    const existingSlot = state.timeSlots.find(slot => slot.date === selectedDate);
    const availableTimes = existingSlot ? existingSlot.available_times : [];
    
    const defaultTimes = [
        '08:00', '09:00', '10:00', '11:00', '12:00', 
        '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'
    ];
    
    container.innerHTML = `
        <h4>Slots for ${formatDate(selectedDate)}</h4>
        <div class="custom-slots-grid">
            ${defaultTimes.map(time => `
                <div class="slot-item">
                    <label class="slot-checkbox">
                        <input type="checkbox" ${availableTimes.includes(time) ? 'checked' : ''} 
                               data-time="${time}" data-date="${selectedDate}">
                        <span class="checkmark"></span>
                        ${time}
                    </label>
                </div>
            `).join('')}
        </div>
    `;
}

async function saveCustomSlots() {
    const dateInput = document.getElementById('custom-slot-date');
    const container = document.getElementById('custom-slots-container');
    
    if (!dateInput || !container) return;
    
    const selectedDate = dateInput.value;
    if (!selectedDate) {
        showToast('Please select a date', 'error');
        return;
    }
    
    const checkboxes = container.querySelectorAll('input[type="checkbox"]');
    const availableTimes = Array.from(checkboxes)
        .filter(cb => cb.checked)
        .map(cb => cb.dataset.time);
    
    try {
        const existingSlot = state.timeSlots.find(slot => slot.date === selectedDate);
        
        if (existingSlot) {
            // Update existing slot
            const { error } = await supabaseClient
                .from('time_slots')
                .update({
                    available_times: availableTimes,
                    updated_at: new Date().toISOString()
                })
                .eq('id', existingSlot.id);
            
            if (error) throw error;
            
            // Update local state
            existingSlot.available_times = availableTimes;
            existingSlot.updated_at = new Date().toISOString();
        } else {
            // Create new slot
            const { data, error } = await supabaseClient
                .from('time_slots')
                .insert({
                    date: selectedDate,
                    available_times: availableTimes,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                })
                .select()
                .single();
            
            if (error) throw error;
            
            // Add to local state
            state.timeSlots.push(data);
        }
        
        showToast('Time slots saved successfully', 'success');
    } catch (error) {
        console.error('Error saving time slots:', error);
        showToast('Error saving time slots', 'error');
    }
}

async function resetSlotDefaults() {
    if (!confirm('This will reset all time slots to default settings. Are you sure?')) {
        return;
    }
    
    try {
        // Clear all existing slots
        const { error } = await supabaseClient
            .from('time_slots')
            .delete()
            .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all records
        
        if (error) throw error;
        
        // Clear local state
        state.timeSlots = [];
        
        // Re-render slots
        renderSlots();
        
        showToast('Time slots reset to defaults', 'success');
    } catch (error) {
        console.error('Error resetting slots:', error);
        showToast('Error resetting slots', 'error');
    }
}

// Settings Management
async function saveSettings() {
    const depositAmount = document.getElementById('deposit-amount');
    const momoNumber = document.getElementById('momo-number');
    const bookingPolicy = document.getElementById('booking-policy');
    
    const settingsData = {
        site_name: 'BS Studio',
        contact_email: state.user?.email || 'admin@bsstudio.com',
        deposit_amount: depositAmount ? parseInt(depositAmount.value) || 50 : 50,
        momo_number: momoNumber ? momoNumber.value : '',
        booking_policy: bookingPolicy ? bookingPolicy.value : '',
        updated_at: new Date().toISOString()
    };
    
    try {
        if (state.settings && state.settings.id) {
            // Update existing settings
            const { error } = await supabaseClient
                .from('system_settings')
                .update(settingsData)
                .eq('id', state.settings.id);
            
            if (error) throw error;
            
            // Update local state
            state.settings = { ...state.settings, ...settingsData };
        } else {
            // Create new settings
            settingsData.created_at = new Date().toISOString();
            
            const { data, error } = await supabaseClient
                .from('system_settings')
                .insert(settingsData)
                .select()
                .single();
            
            if (error) throw error;
            state.settings = data;
        }
        
        showToast('Settings saved successfully', 'success');
    } catch (error) {
        console.error('Error saving settings:', error);
        showToast('Error saving settings', 'error');
    }
}

async function syncToDatabase() {
    try {
        showToast('Syncing data...', 'info');
        await loadDashboardData();
        showToast('Data synced successfully', 'success');
    } catch (error) {
        console.error('Error syncing data:', error);
        showToast('Error syncing data', 'error');
    }
}

// Calendar View Functions
function toggleCalendarView() {
    const calendarView = document.getElementById('calendar-view');
    const listView = document.getElementById('list-view');
    const button = document.querySelector('button[onclick="toggleCalendarView()"]');
    
    if (!calendarView || !listView || !button) return;
    
    state.isCalendarView = !state.isCalendarView;
    
    if (state.isCalendarView) {
        calendarView.style.display = 'block';
        listView.style.display = 'none';
        button.innerHTML = '<i data-feather="list"></i> List View';
        renderCalendar();
    } else {
        calendarView.style.display = 'none';
        listView.style.display = 'block';
        button.innerHTML = '<i data-feather="calendar"></i> Calendar View';
        renderCurrentBookings();
    }
    
    feather.replace();
}

function renderCalendar() {
    const calendarDays = document.getElementById('calendar-days');
    const monthYear = document.getElementById('calendar-month-year');
    
    if (!calendarDays || !monthYear) return;
    
    const currentDate = state.calendarCurrentDate;
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    monthYear.textContent = currentDate.toLocaleDateString('en-US', { 
        month: 'long', 
        year: 'numeric' 
    });
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    let calendarHTML = '';
    
    for (let i = 0; i < 42; i++) {
        const date = new Date(startDate);
        date.setDate(startDate.getDate() + i);
        
        const dateString = date.toISOString().split('T')[0];
        const bookingsForDay = state.bookings.filter(b => b.booking_date === dateString);
        
        const isToday = date.toDateString() === new Date().toDateString();
        const isCurrentMonth = date.getMonth() === month;
        const isSelected = state.selectedDate === dateString;
        
        calendarHTML += `
            <div class="calendar-day ${!isCurrentMonth ? 'other-month' : ''} 
                        ${isToday ? 'today' : ''} ${isSelected ? 'selected' : ''}
                        ${bookingsForDay.length > 0 ? 'has-bookings' : ''}"
                 onclick="selectCalendarDate('${dateString}')">
                <span class="day-number">${date.getDate()}</span>
                ${bookingsForDay.length > 0 ? `<span class="booking-count">${bookingsForDay.length}</span>` : ''}
            </div>
        `;
    }
    
    calendarDays.innerHTML = calendarHTML;
}

function selectCalendarDate(dateString) {
    state.selectedDate = dateString;
    renderCalendar();
    
    const bookingsForDate = state.bookings.filter(b => b.booking_date === dateString);
    const selectedDateBookings = document.getElementById('selected-date-bookings');
    const selectedDateDisplay = document.getElementById('selected-date-display');
    const bookingsContainer = document.getElementById('bookings-for-selected-date');
    
    if (!selectedDateBookings || !selectedDateDisplay || !bookingsContainer) return;
    
    selectedDateDisplay.textContent = formatDate(dateString);
    
    if (bookingsForDate.length > 0) {
        bookingsContainer.innerHTML = bookingsForDate.map(booking => `
            <div class="booking-item-calendar">
                <div class="booking-time">${booking.booking_time || 'No time'}</div>
                <div class="booking-info">
                    <h4>${booking.client_name || booking.user_email || 'Unknown Client'}</h4>
                    <p>${booking.service_name || 'Unknown Service'}</p>
                    <span class="status-badge status-${booking.status}">${(booking.status || 'pending').charAt(0).toUpperCase() + (booking.status || 'pending').slice(1)}</span>
                </div>
                <div class="booking-actions">
                    <button class="btn-view" onclick="showBookingDetails('${booking.id}')">
                        <i data-feather="eye"></i>
                    </button>
                </div>
            </div>
        `).join('');
        
        selectedDateBookings.style.display = 'block';
    } else {
        bookingsContainer.innerHTML = '<p>No bookings for this date.</p>';
        selectedDateBookings.style.display = 'block';
    }
    
    feather.replace();
}

function prevMonth() {
    state.calendarCurrentDate.setMonth(state.calendarCurrentDate.getMonth() - 1);
    renderCalendar();
}

function nextMonth() {
    state.calendarCurrentDate.setMonth(state.calendarCurrentDate.getMonth() + 1);
    renderCalendar();
}

// Bookings Sub-tabs
function setBookingsTab(tab) {
    state.bookingsSubTab = tab;
    
    // Update sub-tab buttons
    document.querySelectorAll('.sub-tab').forEach(btn => {
        btn.classList.remove('active');
    });
    const activeTabBtn = document.querySelector(`[data-tab="${tab}"]`);
    if (activeTabBtn) {
        activeTabBtn.classList.add('active');
    }
    
    // Update content
    document.querySelectorAll('.sub-tab-content').forEach(content => {
        content.classList.remove('active');
    });
    
    if (tab === 'current') {
        const currentBookings = document.getElementById('current-bookings');
        if (currentBookings) {
            currentBookings.classList.add('active');
        }
        renderCurrentBookings();
    } else if (tab === 'deleted') {
        const deletedBookings = document.getElementById('deleted-bookings');
        if (deletedBookings) {
            deletedBookings.classList.add('active');
        }
        renderDeletedBookings();
    }
}

// Chart Rendering
function renderCharts() {
    renderBookingsChart();
    renderServicesChart();
}

function renderBookingsChart() {
    const ctx = document.getElementById('bookings-chart');
    if (!ctx) return;
    
    // Generate last 6 months data
    const months = [];
    const bookingCounts = [];
    
    for (let i = 5; i >= 0; i--) {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        const monthString = date.getFullYear() + '-' + String(date.getMonth() + 1).padStart(2, '0');
        
        months.push(date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }));
        
        const count = state.bookings.filter(b => 
            b.booking_date && b.booking_date.startsWith(monthString)
        ).length;
        bookingCounts.push(count);
    }
    
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: months,
            datasets: [{
                label: 'Bookings',
                data: bookingCounts,
                borderColor: '#9333ea',
                backgroundColor: 'rgba(147, 51, 234, 0.1)',
                tension: 0.4,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        stepSize: 1
                    }
                }
            }
        }
    });
}

function renderServicesChart() {
    const ctx = document.getElementById('services-chart');
    if (!ctx) return;
    
    // Count bookings by service
    const serviceCounts = {};
    state.bookings.forEach(booking => {
        const serviceName = booking.service_name || 'Unknown';
        serviceCounts[serviceName] = (serviceCounts[serviceName] || 0) + 1;
    });
    
    const labels = Object.keys(serviceCounts);
    const data = Object.values(serviceCounts);
    const colors = ['#9333ea', '#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#ef4444'];
    
    if (labels.length === 0) {
        // Show empty state
        ctx.getContext('2d').clearRect(0, 0, ctx.width, ctx.height);
        return;
    }
    
    new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: colors.slice(0, labels.length),
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            }
        }
    });
}

// Data Export
function exportData() {
    const data = {
        bookings: state.bookings,
        services: state.services,
        users: state.users,
        stats: state.stats,
        exportDate: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bs-studio-export-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    showToast('Data exported successfully', 'success');
}

// Utility Functions
function formatDate(dateString) {
    if (!dateString) return 'N/A';
    try {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    } catch (error) {
        return 'Invalid Date';
    }
}

function showToast(message, type = 'info') {
    const toastContainer = document.getElementById('toast-container');
    if (!toastContainer) return;
    
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    const icons = {
        success: 'check-circle',
        error: 'x-circle',
        info: 'info',
        warning: 'alert-triangle'
    };
    
    toast.innerHTML = `
        <i data-feather="${icons[type] || 'info'}"></i>
        <span>${message}</span>
    `;
    
    toastContainer.appendChild(toast);
    feather.replace();
    
    // Animate in
    setTimeout(() => toast.classList.add('show'), 100);
    
    // Remove after 4 seconds
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
            if (toast.parentNode) {
                toastContainer.removeChild(toast);
            }
        }, 300);
    }, 4000);
}

// Logout Function
async function adminLogout() {
    try {
        await window.firebaseAuth.signOut();
        showToast('Logged out successfully', 'success');
        // Redirect will be handled by auth state change
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 1000);
    } catch (error) {
        console.error('Error logging out:', error);
        showToast('Error logging out', 'error');
    }
}

// Event Listeners
document.addEventListener('DOMContentLoaded', init);

// Modal click outside to close
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal')) {
        e.target.classList.remove('active');
        if (e.target.id === 'booking-modal') {
            state.selectedBooking = null;
        }
        if (e.target.id === 'service-modal') {
            state.selectedService = null;
        }
    }
});

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        // Close any open modals
        document.querySelectorAll('.modal.active').forEach(modal => {
            modal.classList.remove('active');
        });
        state.selectedBooking = null;
        state.selectedService = null;
    }
});

// Search functionality
document.addEventListener('input', (e) => {
    if (e.target.id === 'search-bookings') {
        filterBookings();
    }
    if (e.target.id === 'search-users') {
        filterUsers();
    }
});

// Filter functionality
document.addEventListener('change', (e) => {
    if (e.target.id === 'filter-status') {
        filterBookings();
    }
    if (e.target.id === 'custom-slot-date') {
        updateCustomSlotDate();
    }
});

// Auto-refresh dashboard data every 30 seconds
setInterval(async () => {
    if (state.user && state.activeTab === 'dashboard') {
        console.log('Auto-refreshing dashboard data...');
        try {
            await loadBookings();
            await loadUsers();
            updateStats();
            renderRecentBookings();
        } catch (error) {
            console.error('Error auto-refreshing dashboard:', error);
        }
    }
}, 30000);

// Make functions globally available
window.setActiveTab = setActiveTab;
window.toggleSidebar = toggleSidebar;
window.toggleTheme = toggleTheme;
window.updateBookingStatus = updateBookingStatus;
window.showBookingDetails = showBookingDetails;
window.deleteBooking = deleteBooking;
window.restoreBooking = restoreBooking;
window.closeBookingModal = closeBookingModal;
window.updateBookingStatusFromModal = updateBookingStatusFromModal;
window.deleteBookingFromModal = deleteBookingFromModal;
window.showServiceModal = showServiceModal;
window.editService = editService;
window.deleteService = deleteService;
window.saveService = saveService;
window.closeServiceModal = closeServiceModal;
window.filterBookings = filterBookings;
window.filterUsers = filterUsers;
window.saveSettings = saveSettings;
window.syncToDatabase = syncToDatabase;
window.saveCustomSlots = saveCustomSlots;
window.updateCustomSlotDate = updateCustomSlotDate;
window.resetSlotDefaults = resetSlotDefaults;
window.toggleCalendarView = toggleCalendarView;
window.selectCalendarDate = selectCalendarDate;
window.prevMonth = prevMonth;
window.nextMonth = nextMonth;
window.setBookingsTab = setBookingsTab;
window.exportData = exportData;
window.adminLogout = adminLogout;