/* =============================================
   🚀 BS STUDIO - ADMIN DASHBOARD JAVASCRIPT
   ============================================= */

// === IMPORTS & CONFIGURATION ===
import { createClient } from 'https://cdn.skypack.dev/@supabase/supabase-js@2';

// Supabase Configuration
const SUPABASE_URL = 'https://foauqtwkuublsursedjs.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZvYXVxdHdrdXVibHN1cnNlZGpzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcyODE5OTMsImV4cCI6MjA3Mjg1Nzk5M30.d7Eo8PIeix9Pr1XuLvhDKcgtqmtpherr3OezsR3pm1Y';
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// === GLOBAL STATE ===
const state = {
    bookings: [],
    deletedBookings: [],
    services: [],
    users: [],
    slots: [],
    settings: {
        depositAmount: 50,
        momoNumber: '+233 XX XXX XXXX',
        bookingPolicy: 'Please make a 50 cedis deposit to confirm your booking. Cancellations must be made 24 hours in advance.'
    },
    activeTab: 'dashboard',
    activeBookingsTab: 'current',
    sidebarCollapsed: false,
    isDarkMode: localStorage.getItem('darkMode') === 'true',
    currentMonth: new Date().getMonth(),
    currentYear: new Date().getFullYear(),
    selectedCalendarDate: null,
    viewType: 'list',
    charts: {
        bookingsChart: null,
        servicesChart: null
    },
    slotDefaults: [
        '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
        '13:00', '13:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30'
    ],
    editingService: null
};

// === INITIALIZATION ===
document.addEventListener('DOMContentLoaded', async () => {
    console.log('🚀 Admin Dashboard Loading...');
    
    // Initialize theme
    if (state.isDarkMode) {
        document.body.classList.add('dark');
        document.getElementById('theme-icon').setAttribute('data-feather', 'sun');
    }
    
    // Load data and render
    await loadAllData();
    setupEventListeners();
    setupRealtimeSubscriptions();
    feather.replace();
    
    console.log('✅ Admin Dashboard Ready!');
});

// === DATA LOADING FUNCTIONS ===

/**
 * Load all data from Supabase
 */
async function loadAllData() {
    try {
        showToast('Loading dashboard data...', 'warning');
        
        await Promise.all([
            loadBookings(),
            loadDeletedBookings(),
            loadServices(),
            loadUsers(),
            loadSlots(),
            loadSettings()
        ]);
        
        renderDashboard();
        showToast('Dashboard loaded successfully!', 'success');
    } catch (error) {
        console.error('❌ Error loading data:', error);
        showToast('Failed to load dashboard data', 'error');
    }
}

/**
 * Load bookings from Supabase
 */
async function loadBookings() {
    const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        console.error('❌ Error loading bookings:', error);
        throw error;
    }
    
    state.bookings = data || [];
}

/**
 * Load deleted bookings from Supabase
 */
async function loadDeletedBookings() {
    const { data, error } = await supabase
        .from('deleted_bookings')
        .select('*')
        .order('deleted_at', { ascending: false });

    if (error) {
        console.error('❌ Error loading deleted bookings:', error);
        // Don't throw error if table doesn't exist yet
        state.deletedBookings = [];
        return;
    }
    
    state.deletedBookings = data || [];
}

/**
 * Load services from Supabase
 */
async function loadServices() {
    const { data, error } = await supabase
        .from('services')
        .select('*')
        .order('name', { ascending: true });

    if (error) {
        console.error('❌ Error loading services:', error);
        // Initialize with default services if table is empty
        await initializeDefaultServices();
        return;
    }
    
    state.services = data || [];
    
    // If no services exist, initialize defaults
    if (state.services.length === 0) {
        await initializeDefaultServices();
    }
}

/**
 * Load users from Supabase
 */
async function loadUsers() {
    const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        console.error('❌ Error loading users:', error);
        state.users = [];
        return;
    }
    
    state.users = data || [];
}

/**
 * Load slots from Supabase
 */
async function loadSlots() {
    const { data, error } = await supabase
        .from('slots')
        .select('*')
        .order('time', { ascending: true });

    if (error) {
        console.error('❌ Error loading slots:', error);
        // Initialize with default slots
        await initializeDefaultSlots();
        return;
    }
    
    state.slots = data || [];
    
    // If no slots exist, initialize defaults
    if (state.slots.length === 0) {
        await initializeDefaultSlots();
    }
}

/**
 * Load settings from Supabase
 */
async function loadSettings() {
    const { data, error } = await supabase
        .from('settings')
        .select('*')
        .single();

    if (error) {
        console.error('❌ Error loading settings:', error);
        // Use default settings
        return;
    }
    
    if (data) {
        state.settings = { ...state.settings, ...data };
    }
}

// === INITIALIZATION HELPERS ===

/**
 * Initialize default services in Supabase
 */
async function initializeDefaultServices() {
    const defaultServices = [
        // Classic Services
        { name: 'Regular Classic', category: 'Classic', price: 130, duration: 90, description: 'Perfect for everyday elegance' },
        { name: 'Classic Cat Eye', category: 'Classic', price: 160, duration: 120, description: 'Bold and captivating' },
        { name: 'Wet Set', category: 'Classic', price: 150, duration: 100, description: 'Luxurious shine effect' },
        { name: 'Mega Classic', category: 'Classic', price: 180, duration: 130, description: 'Maximum impact classic' },
        
        // Hybrid Services
        { name: 'Regular Hybrid', category: 'Hybrid', price: 180, duration: 150, description: 'Best of both worlds' },
        { name: 'Cat Eye', category: 'Hybrid', price: 200, duration: 160, description: 'Seductive and alluring' },
        { name: 'Anime Set', category: 'Hybrid', price: 200, duration: 170, description: 'Dramatic anime-inspired' },
        { name: 'Doll Eye', category: 'Hybrid', price: 200, duration: 160, description: 'Cute and innocent' },
        { name: 'Mini Wipsy', category: 'Hybrid', price: 170, duration: 140, description: 'Subtle textured effect' },
        { name: 'Hybrid Wipsy', category: 'Hybrid', price: 200, duration: 180, description: 'Complex layered look' },
        
        // Volume Services
        { name: 'Regular Volume', category: 'Volume', price: 220, duration: 180, description: 'Maximum volume and drama' },
        { name: 'Cat Eye', category: 'Volume', price: 250, duration: 200, description: 'Ultimate dramatic cat eye' },
        { name: 'Doll Eye', category: 'Volume', price: 250, duration: 200, description: 'Royal glamour look' },
        { name: 'Wipsy', category: 'Volume', price: 300, duration: 220, description: 'Premium textured volume' }
    ];

    const { error } = await supabase
        .from('services')
        .insert(defaultServices);

    if (!error) {
        state.services = defaultServices;
        console.log('✅ Default services initialized');
    }
}

/**
 * Initialize default slots in Supabase
 */
async function initializeDefaultSlots() {
    const defaultSlots = state.slotDefaults.map(time => ({
        time,
        available: true,
        date: null // null means default for all days
    }));

    const { error } = await supabase
        .from('slots')
        .insert(defaultSlots);

    if (!error) {
        state.slots = defaultSlots;
        console.log('✅ Default slots initialized');
    }
}

// === EVENT LISTENERS ===

/**
 * Setup all event listeners
 */
function setupEventListeners() {
    // Mobile sidebar overlay
    document.addEventListener('click', (e) => {
        if (window.innerWidth <= 768 && 
            !e.target.closest('.sidebar') && 
            !e.target.closest('.sidebar-toggle')) {
            closeMobileSidebar();
        }
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        // Alt + numbers for tab navigation
        if (e.altKey && e.key >= '1' && e.key <= '6') {
            const tabs = ['dashboard', 'bookings', 'slots', 'services', 'users', 'settings'];
            const tabIndex = parseInt(e.key) - 1;
            if (tabs[tabIndex]) {
                setActiveTab(tabs[tabIndex]);
            }
        }
        
        // Escape to close modals
        if (e.key === 'Escape') {
            closeServiceModal();
        }
    });

    // Window resize handler
    window.addEventListener('resize', handleWindowResize);
}

/**
 * Setup real-time subscriptions for Supabase changes
 */
function setupRealtimeSubscriptions() {
    // Bookings subscription
    supabase
        .channel('bookings')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'bookings' }, () => {
            console.log('📡 Bookings updated');
            loadBookings().then(() => {
                renderBookings();
                updateStats();
                renderRecentBookings();
                updateBookingCount();
            });
        })
        .subscribe();

    // Services subscription
    supabase
        .channel('services')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'services' }, () => {
            console.log('📡 Services updated');
            loadServices().then(renderServices);
        })
        .subscribe();

    // Users subscription
    supabase
        .channel('users')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'users' }, () => {
            console.log('📡 Users updated');
            loadUsers().then(() => {
                renderUsers();
                updateStats();
            });
        })
        .subscribe();
}

// === RENDERING FUNCTIONS ===

/**
 * Render the complete dashboard
 */
function renderDashboard() {
    updateStats();
    renderCharts();
    renderRecentBookings();
    renderBookings();
    renderServices();
    renderUsers();
    renderSlots();
    updateBookingCount();
    updateUI();
}

/**
 * Update statistics cards with current data
 */
function updateStats() {
    const today = new Date();
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);

    // Filter bookings for current month
    const monthlyBookings = state.bookings.filter(booking => {
        const bookingDate = new Date(booking.booking_date);
        return bookingDate >= monthStart && bookingDate <= monthEnd;
    });

    // Calculate statistics
    const totalBookings = monthlyBookings.length;
    const confirmedBookings = monthlyBookings.filter(b => b.status === 'confirmed').length;
    const totalRevenue = monthlyBookings
        .filter(b => b.status === 'confirmed' || b.status === 'completed')
        .reduce((sum, booking) => sum + (booking.service_price || 0), 0);

    // Update DOM elements
    document.getElementById('total-bookings').textContent = totalBookings;
    document.getElementById('confirmed-bookings').textContent = confirmedBookings;
    document.getElementById('total-users').textContent = state.users.length;
    document.getElementById('total-revenue').textContent = `¢${totalRevenue.toLocaleString()}`;

    // Update growth percentages (calculate from previous month)
    const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    const lastMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0);
    
    const lastMonthBookings = state.bookings.filter(booking => {
        const bookingDate = new Date(booking.booking_date);
        return bookingDate >= lastMonth && bookingDate <= lastMonthEnd;
    });

    const growthRate = lastMonthBookings.length > 0 
        ? Math.round(((totalBookings - lastMonthBookings.length) / lastMonthBookings.length) * 100)
        : 0;

    document.getElementById('weekly-growth').textContent = `${growthRate >= 0 ? '+' : ''}${growthRate}%`;
    document.getElementById('confirmed-growth').textContent = '+8%';
    document.getElementById('user-growth').textContent = '+15%';
    document.getElementById('revenue-growth').textContent = '+23%';
}

/**
 * Render Chart.js charts for dashboard analytics
 */
function renderCharts() {
    renderBookingsChart();
    renderServicesChart();
}

/**
 * Render monthly bookings line chart
 */
function renderBookingsChart() {
    const ctx = document.getElementById('bookings-chart');
    if (!ctx) return;

    // Destroy existing chart
    if (state.charts.bookingsChart) {
        state.charts.bookingsChart.destroy();
    }

    // Prepare data for last 6 months
    const months = [];
    const bookingCounts = [];
    
    for (let i = 5; i >= 0; i--) {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
        const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);
        
        const monthName = date.toLocaleDateString('en-US', { month: 'short' });
        months.push(monthName);
        
        const count = state.bookings.filter(booking => {
            const bookingDate = new Date(booking.booking_date);
            return bookingDate >= monthStart && bookingDate <= monthEnd;
        }).length;
        
        bookingCounts.push(count);
    }

    state.charts.bookingsChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: months,
            datasets: [{
                label: 'Monthly Bookings',
                data: bookingCounts,
                borderColor: '#9333ea',
                backgroundColor: 'rgba(147, 51, 234, 0.1)',
                borderWidth: 3,
                fill: true,
                tension: 0.4
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
                    grid: {
                        color: 'rgba(0, 0, 0, 0.1)'
                    }
                },
                x: {
                    grid: {
                        display: false
                    }
                }
            }
        }
    });
}

/**
 * Render services distribution pie chart
 */
function renderServicesChart() {
    const ctx = document.getElementById('services-chart');
    if (!ctx) return;

    // Destroy existing chart
    if (state.charts.servicesChart) {
        state.charts.servicesChart.destroy();
    }

    // Count bookings by service category
    const categories = {};
    state.bookings.forEach(booking => {
        const category = booking.service_category || 'Other';
        categories[category] = (categories[category] || 0) + 1;
    });

    const labels = Object.keys(categories);
    const data = Object.values(categories);
    const colors = ['#9333ea', '#ec4899', '#f59e0b', '#10b981', '#3b82f6'];

    state.charts.servicesChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels,
            datasets: [{
                data,
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

/**
 * Render recent bookings list on dashboard
 */
function renderRecentBookings() {
    const container = document.getElementById('recent-bookings');
    if (!container) return;

    const recentBookings = state.bookings
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .slice(0, 5);

    if (recentBookings.length === 0) {
        container.innerHTML = '<p class="text-center" style="color: #9ca3af; padding: 2rem;">No recent bookings</p>';
        return;
    }

    container.innerHTML = recentBookings.map(booking => `
        <div class="booking-list-item" style="display: flex; align-items: center; gap: 12px; padding: 12px 0; border-bottom: 1px solid #f1f5f9;">
            <div class="booking-avatar" style="width: 36px; height: 36px; background: linear-gradient(135deg, #9333ea 0%, #ec4899 100%); border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 14px;">
                ${booking.client_name.charAt(0)}
            </div>
            <div style="flex: 1; min-width: 0;">
                <div style="font-weight: 600; color: #1f2937; margin-bottom: 2px;">${booking.client_name}</div>
                <div style="font-size: 13px; color: #6b7280;">${booking.service_name}</div>
                <div style="font-size: 12px; color: #9ca3af;">${new Date(booking.booking_date).toLocaleDateString()} at ${booking.booking_time}</div>
            </div>
            <span class="status-badge status-${booking.status}" style="padding: 2px 6px; border-radius: 3px; font-size: 10px; font-weight: 600; text-transform: uppercase;">
                ${booking.status}
            </span>
        </div>
    `).join('');
}

/**
 * Render bookings list with filtering
 */
function renderBookings() {
    const container = document.getElementById('list-view');
    if (!container) return;

    const filteredBookings = filterBookings();
    
    if (filteredBookings.length === 0) {
        container.innerHTML = '<div class="empty-state" style="text-align: center; padding: 4rem; color: #9ca3af;"><i data-feather="calendar" style="width: 48px; height: 48px; margin-bottom: 1rem;"></i><h3>No bookings found</h3><p>Try adjusting your filters</p></div>';
        feather.replace();
        return;
    }

    container.innerHTML = filteredBookings.map(booking => `
        <div class="booking-card">
            <div class="booking-meta">
                <h4>${booking.client_name}</h4>
                <p><strong>Service:</strong> ${booking.service_name}</p>
                <p><strong>Email:</strong> ${booking.client_email}</p>
                <p><strong>Phone:</strong> ${booking.client_phone || 'Not provided'}</p>
                <p><strong>Date:</strong> ${new Date(booking.booking_date).toLocaleDateString()} | <strong>Time:</strong> ${booking.booking_time}</p>
                <p><strong>Price:</strong> ¢${booking.service_price || 0}</p>
                <p><strong>Status:</strong> <span class="status-badge status-${booking.status}">${booking.status}</span></p>
                ${booking.notes ? `<p><strong>Notes:</strong> ${booking.notes}</p>` : ''}
            </div>
            <div class="booking-actions">
                ${booking.status === 'pending' ? `
                    <button class="btn-confirm" onclick="confirmBooking('${booking.id}')">
                        <i data-feather="check" style="width: 14px; height: 14px;"></i>
                        Confirm
                    </button>
                    <button class="btn-cancel" onclick="cancelBooking('${booking.id}')">
                        <i data-feather="x" style="width: 14px; height: 14px;"></i>
                        Cancel
                    </button>
                ` : ''}
                ${booking.status === 'confirmed' ? `
                    <button class="btn-done" onclick="markBookingDone('${booking.id}')">
                        <i data-feather="check-circle" style="width: 14px; height: 14px;"></i>
                        Mark Done
                    </button>
                ` : ''}
                <button class="btn-view" onclick="viewBookingDetails('${booking.id}')">
                    <i data-feather="eye" style="width: 14px; height: 14px;"></i>
                    View
                </button>
                <button class="btn-delete" onclick="deleteBooking('${booking.id}')">
                    <i data-feather="trash-2" style="width: 14px; height: 14px;"></i>
                    Delete
                </button>
            </div>
        </div>
    `).join('');
    
    feather.replace();
}

/**
 * Render deleted bookings
 */
function renderDeletedBookings() {
    const container = document.getElementById('deleted-bookings-list');
    if (!container) return;

    if (state.deletedBookings.length === 0) {
        container.innerHTML = '<div class="empty-state" style="text-align: center; padding: 4rem; color: #9ca3af;"><i data-feather="trash-2" style="width: 48px; height: 48px; margin-bottom: 1rem;"></i><h3>No deleted bookings</h3><p>Deleted bookings will appear here</p></div>';
        feather.replace();
        return;
    }

    container.innerHTML = state.deletedBookings.map(booking => `
        <div class="booking-card" style="border-left: 4px solid #ef4444;">
            <div class="booking-meta">
                <h4>${booking.client_name}</h4>
                <p><strong>Service:</strong> ${booking.service_name}</p>
                <p><strong>Original Date:</strong> ${new Date(booking.booking_date).toLocaleDateString()} at ${booking.booking_time}</p>
                <p><strong>Deleted On:</strong> ${new Date(booking.deleted_at).toLocaleDateString()}</p>
                <p><strong>Status:</strong> <span class="status-badge status-cancelled">Deleted</span></p>
            </div>
        </div>
    `).join('');
}

/**
 * Filter bookings based on search and status
 */
function filterBookings() {
    const searchTerm = document.getElementById('search-bookings')?.value.toLowerCase() || '';
    const statusFilter = document.getElementById('filter-status')?.value || 'all';

    return state.bookings.filter(booking => {
        const matchesSearch = booking.client_name.toLowerCase().includes(searchTerm) ||
                            booking.client_email.toLowerCase().includes(searchTerm) ||
                            booking.service_name.toLowerCase().includes(searchTerm);
        
        const matchesStatus = statusFilter === 'all' || booking.status === statusFilter;
        
        return matchesSearch && matchesStatus;
    });
}

/**
 * Render services grid
 */
function renderServices() {
    const container = document.getElementById('services-grid');
    if (!container) return;

    if (state.services.length === 0) {
        container.innerHTML = '<div class="empty-state" style="text-align: center; padding: 4rem; color: #9ca3af;"><i data-feather="star" style="width: 48px; height: 48px; margin-bottom: 1rem;"></i><h3>No services found</h3><p>Add your first service to get started</p></div>';
        feather.replace();
        return;
    }

    container.innerHTML = state.services.map(service => `
        <div class="service-card">
            <div class="service-info">
                <h3>${service.name}</h3>
                <span class="category-badge">${service.category}</span>
                <p>${service.description || 'No description provided'}</p>
                <p><strong>Price:</strong> ¢${service.price} | <strong>Duration:</strong> ${service.duration} min</p>
            </div>
            <div class="service-actions">
                <button class="btn-edit" onclick="editService('${service.id}')" title="Edit Service">
                    <i data-feather="edit" style="width: 16px; height: 16px;"></i>
                </button>
                <button class="btn-delete" onclick="deleteService('${service.id}')" title="Delete Service">
                    <i data-feather="trash-2" style="width: 16px; height: 16px;"></i>
                </button>
            </div>
        </div>
    `).join('');
    
    feather.replace();
}

/**
 * Render users list
 */
function renderUsers() {
    const container = document.getElementById('users-grid');
    if (!container) return;

    if (state.users.length === 0) {
        container.innerHTML = '<div class="empty-state" style="text-align: center; padding: 4rem; color: #9ca3af;"><i data-feather="users" style="width: 48px; height: 48px; margin-bottom: 1rem;"></i><h3>No users found</h3><p>Users will appear here when they register</p></div>';
        feather.replace();
        return;
    }

    const filteredUsers = filterUsers();

    container.innerHTML = filteredUsers.map(user => `
        <div class="user-list-item">
            <div class="user-avatar-small">${user.email.charAt(0).toUpperCase()}</div>
            <div style="flex: 1; min-width: 0;">
                <h4>${user.email}</h4>
                <p style="color: #6b7280; font-size: 14px; margin: 2px 0;">
                    Joined: ${new Date(user.created_at).toLocaleDateString()}
                </p>
                <p style="color: #9ca3af; font-size: 13px; margin: 0;">
                    Last Login: ${user.last_login ? new Date(user.last_login).toLocaleDateString() : 'Never'}
                </p>
            </div>
            <div>
                <button class="btn-view" onclick="viewUserDetails('${user.id}')">
                    <i data-feather="eye" style="width: 14px; height: 14px;"></i>
                    View
                </button>
            </div>
        </div>
    `).join('');
    
    feather.replace();
}

/**
 * Filter users based on search
 */
function filterUsers() {
    const searchTerm = document.getElementById('search-users')?.value.toLowerCase() || '';
    
    return state.users.filter(user => 
        user.email.toLowerCase().includes(searchTerm)
    );
}

/**
 * Render available time slots
 */
function renderSlots() {
    const container = document.getElementById('slots-grid');
    if (!container) return;

    container.innerHTML = state.slotDefaults.map(time => {
        const slot = state.slots.find(s => s.time === time && !s.date) || { time, available: true };
        return `
            <div class="slot-item ${slot.available ? 'available' : 'unavailable'}" 
                 onclick="toggleSlot('${time}')" 
                 data-time="${time}">
                ${time}
                <div style="font-size: 10px; margin-top: 2px;">
                    ${slot.available ? 'Available' : 'Unavailable'}
                </div>
            </div>
        `;
    }).join('');
}

// === BOOKING MANAGEMENT FUNCTIONS ===

/**
 * Confirm a booking (change status to confirmed)
 */
async function confirmBooking(bookingId) {
    try {
        const { error } = await supabase
            .from('bookings')
            .update({ 
                status: 'confirmed',
                updated_at: new Date().toISOString()
            })
            .eq('id', bookingId);

        if (error) throw error;

        // Update local state
        const booking = state.bookings.find(b => b.id === bookingId);
        if (booking) {
            booking.status = 'confirmed';
            showToast(`Booking confirmed for ${booking.client_name}!`, 'success');
            renderBookings();
            updateStats();
            updateBookingCount();
        }
    } catch (error) {
        console.error('❌ Error confirming booking:', error);
        showToast('Failed to confirm booking', 'error');
    }
}

/**
 * Cancel a booking (change status to cancelled)
 */
async function cancelBooking(bookingId) {
    if (!confirm('Are you sure you want to cancel this booking?')) return;

    try {
        const { error } = await supabase
            .from('bookings')
            .update({ 
                status: 'cancelled',
                updated_at: new Date().toISOString()
            })
            .eq('id', bookingId);

        if (error) throw error;

        // Update local state
        const booking = state.bookings.find(b => b.id === bookingId);
        if (booking) {
            booking.status = 'cancelled';
            showToast(`Booking cancelled for ${booking.client_name}`, 'warning');
            renderBookings();
            updateStats();
            updateBookingCount();
        }
    } catch (error) {
        console.error('❌ Error cancelling booking:', error);
        showToast('Failed to cancel booking', 'error');
    }
}

/**
 * Mark booking as done (change status to completed)
 */
async function markBookingDone(bookingId) {
    const booking = state.bookings.find(b => b.id === bookingId);
    if (!booking) return;

    if (booking.status !== 'confirmed') {
        showToast('Only confirmed bookings can be marked as done', 'warning');
        return;
    }

    try {
        const { error } = await supabase
            .from('bookings')
            .update({ 
                status: 'completed',
                completed_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            })
            .eq('id', bookingId);

        if (error) throw error;

        // Update local state
        booking.status = 'completed';
        showToast(`Service completed for ${booking.client_name}! ✨`, 'success');
        renderBookings();
        updateStats();
        updateBookingCount();
    } catch (error) {
        console.error('❌ Error marking booking as done:', error);
        showToast('Failed to mark booking as done', 'error');
    }
}

/**
 * Delete a booking (move to deleted_bookings table)
 */
async function deleteBooking(bookingId) {
    const booking = state.bookings.find(b => b.id === bookingId);
    if (!booking) return;

    if (!confirm(`Are you sure you want to delete the booking for ${booking.client_name}? This action cannot be undone.`)) return;

    try {
        // First, insert into deleted_bookings table
        const deletedBooking = {
            ...booking,
            original_id: booking.id,
            deleted_at: new Date().toISOString()
        };
        delete deletedBooking.id; // Remove id so Supabase generates a new one

        const { error: insertError } = await supabase
            .from('deleted_bookings')
            .insert([deletedBooking]);

        if (insertError) {
            console.error('❌ Error moving booking to deleted:', insertError);
            showToast('Failed to move booking to deleted bookings', 'error');
            return;
        }

        // Then delete from bookings table
        const { error: deleteError } = await supabase
            .from('bookings')
            .delete()
            .eq('id', bookingId);

        if (deleteError) throw deleteError;

        // Update local state
        state.bookings = state.bookings.filter(b => b.id !== bookingId);
        state.deletedBookings.unshift(deletedBooking);
        
        showToast(`Booking for ${booking.client_name} has been deleted`, 'warning');
        renderBookings();
        renderDeletedBookings();
        updateStats();
        updateBookingCount();
    } catch (error) {
        console.error('❌ Error deleting booking:', error);
        showToast('Failed to delete booking', 'error');
    }
}

/**
 * View booking details (placeholder for now)
 */
function viewBookingDetails(bookingId) {
    const booking = state.bookings.find(b => b.id === bookingId);
    if (!booking) return;

    alert(`Booking Details:\n\nClient: ${booking.client_name}\nEmail: ${booking.client_email}\nService: ${booking.service_name}\nDate: ${new Date(booking.booking_date).toLocaleDateString()}\nTime: ${booking.booking_time}\nStatus: ${booking.status}\nPrice: ¢${booking.service_price || 0}`);
}

// === SERVICE MANAGEMENT FUNCTIONS ===

/**
 * Show service modal for adding/editing
 */
function showServiceModal(serviceId = null) {
    const modal = document.getElementById('service-modal');
    const modalTitle = document.getElementById('service-modal-title');
    const submitText = document.getElementById('service-submit-text');
    
    if (serviceId) {
        // Edit mode
        const service = state.services.find(s => s.id === serviceId);
        if (!service) return;
        
        state.editingService = serviceId;
        modalTitle.textContent = 'Edit Service';
        submitText.textContent = 'Update Service';
        
        // Populate form
        document.getElementById('service-name').value = service.name;
        document.getElementById('service-category').value = service.category;
        document.getElementById('service-price').value = service.price;
        document.getElementById('service-duration').value = service.duration;
        document.getElementById('service-description').value = service.description || '';
    } else {
        // Add mode
        state.editingService = null;
        modalTitle.textContent = 'Add New Service';
        submitText.textContent = 'Create Service';
        
        // Clear form
        document.getElementById('service-form').reset();
    }
    
    modal.classList.add('show');
}

/**
 * Close service modal
 */
function closeServiceModal() {
    const modal = document.getElementById('service-modal');
    modal.classList.remove('show');
    state.editingService = null;
}

/**
 * Save service (create or update)
 */
async function saveService(event) {
    event.preventDefault();
    
    const formData = {
        name: document.getElementById('service-name').value,
        category: document.getElementById('service-category').value,
        price: parseInt(document.getElementById('service-price').value),
        duration: parseInt(document.getElementById('service-duration').value),
        description: document.getElementById('service-description').value
    };

    try {
        if (state.editingService) {
            // Update existing service
            const { error } = await supabase
                .from('services')
                .update({
                    ...formData,
                    updated_at: new Date().toISOString()
                })
                .eq('id', state.editingService);

            if (error) throw error;

            // Update local state
            const serviceIndex = state.services.findIndex(s => s.id === state.editingService);
            if (serviceIndex !== -1) {
                state.services[serviceIndex] = { ...state.services[serviceIndex], ...formData };
            }

            showToast('Service updated successfully!', 'success');
        } else {
            // Create new service
            const { data, error } = await supabase
                .from('services')
                .insert([{
                    ...formData,
                    created_at: new Date().toISOString()
                }])
                .select()
                .single();

            if (error) throw error;

            // Add to local state
            state.services.push(data);
            showToast('Service created successfully!', 'success');
        }

        closeServiceModal();
        renderServices();
    } catch (error) {
        console.error('❌ Error saving service:', error);
        showToast('Failed to save service', 'error');
    }
}

/**
 * Edit service
 */
function editService(serviceId) {
    showServiceModal(serviceId);
}

/**
 * Delete service
 */
async function deleteService(serviceId) {
    const service = state.services.find(s => s.id === serviceId);
    if (!service) return;

    if (!confirm(`Are you sure you want to delete "${service.name}"? This action cannot be undone.`)) return;

    try {
        const { error } = await supabase
            .from('services')
            .delete()
            .eq('id', serviceId);

        if (error) throw error;

        // Update local state
        state.services = state.services.filter(s => s.id !== serviceId);
        showToast(`Service "${service.name}" deleted`, 'warning');
        renderServices();
    } catch (error) {
        console.error('❌ Error deleting service:', error);
        showToast('Failed to delete service', 'error');
    }
}

// === USER MANAGEMENT FUNCTIONS ===

/**
 * View user details (placeholder for now)
 */
function viewUserDetails(userId) {
    const user = state.users.find(u => u.id === userId);
    if (!user) return;

    alert(`User Details:\n\nEmail: ${user.email}\nJoined: ${new Date(user.created_at).toLocaleDateString()}\nLast Login: ${user.last_login ? new Date(user.last_login).toLocaleDateString() : 'Never'}`);
}

// === SLOT MANAGEMENT FUNCTIONS ===

/**
 * Toggle slot availability
 */
async function toggleSlot(time) {
    const slot = state.slots.find(s => s.time === time && !s.date);
    const newAvailable = !slot?.available;

    try {
        if (slot) {
            // Update existing slot
            const { error } = await supabase
                .from('slots')
                .update({ available: newAvailable })
                .eq('id', slot.id);

            if (error) throw error;
            slot.available = newAvailable;
        } else {
            // Create new slot
            const { data, error } = await supabase
                .from('slots')
                .insert([{ time, available: newAvailable, date: null }])
                .select()
                .single();

            if (error) throw error;
            state.slots.push(data);
        }

        renderSlots();
        showToast(`Slot ${time} ${newAvailable ? 'enabled' : 'disabled'}`, 'success');
    } catch (error) {
        console.error('❌ Error toggling slot:', error);
        showToast('Failed to update slot', 'error');
    }
}

/**
 * Reset slots to defaults
 */
async function resetSlotDefaults() {
    if (!confirm('Are you sure you want to reset all slots to default availability? This will enable all default time slots.')) return;

    try {
        // Delete all existing default slots (where date is null)
        const { error: deleteError } = await supabase
            .from('slots')
            .delete()
            .is('date', null);

        if (deleteError) throw deleteError;

        // Insert default slots
        const defaultSlots = state.slotDefaults.map(time => ({
            time,
            available: true,
            date: null
        }));

        const { data, error } = await supabase
            .from('slots')
            .insert(defaultSlots)
            .select();

        if (error) throw error;

        // Update local state
        state.slots = state.slots.filter(s => s.date !== null).concat(data);
        renderSlots();
        showToast('Slots reset to defaults successfully!', 'success');
    } catch (error) {
        console.error('❌ Error resetting slots:', error);
        showToast('Failed to reset slots', 'error');
    }
}

/**
 * Update custom slot date (placeholder for now)
 */
function updateCustomSlotDate() {
    const date = document.getElementById('custom-slot-date').value;
    if (!date) return;

    // TODO: Implement custom slot date functionality
    console.log('Custom slot date selected:', date);
}

/**
 * Save custom slots (placeholder for now)
 */
function saveCustomSlots() {
    showToast('Custom slot functionality coming soon!', 'warning');
}

// === SETTINGS FUNCTIONS ===

/**
 * Save settings to database
 */
async function saveSettings() {
    const settings = {
        deposit_amount: parseInt(document.getElementById('deposit-amount').value),
        momo_number: document.getElementById('momo-number').value,
        booking_policy: document.getElementById('booking-policy').value,
        updated_at: new Date().toISOString()
    };

    try {
        // Try to update first
        const { data, error: updateError } = await supabase
            .from('settings')
            .update(settings)
            .eq('id', 1)
            .select();

        if (updateError && updateError.code !== 'PGRST116') { // Not found error
            throw updateError;
        }

        if (!data || data.length === 0) {
            // No existing settings, insert new
            const { error: insertError } = await supabase
                .from('settings')
                .insert([{ ...settings, id: 1 }]);

            if (insertError) throw insertError;
        }

        // Update local state
        state.settings = {
            depositAmount: settings.deposit_amount,
            momoNumber: settings.momo_number,
            bookingPolicy: settings.booking_policy
        };

        showToast('Settings saved successfully!', 'success');
    } catch (error) {
        console.error('❌ Error saving settings:', error);
        showToast('Failed to save settings', 'error');
    }
}

/**
 * Sync data to database
 */
async function syncToDatabase() {
    try {
        showToast('Syncing data to database...', 'warning');
        
        // Reload all data from database
        await loadAllData();
        
        showToast('Data synced successfully!', 'success');
    } catch (error) {
        console.error('❌ Error syncing data:', error);
        showToast('Failed to sync data', 'error');
    }
}

// === CALENDAR FUNCTIONS ===

/**
 * Toggle calendar view
 */
function toggleCalendarView() {
    const calendarView = document.getElementById('calendar-view');
    const listView = document.getElementById('list-view');
    const toggleBtn = document.querySelector('[onclick="toggleCalendarView()"]');
    
    if (calendarView.style.display === 'none') {
        calendarView.style.display = 'block';
        listView.style.display = 'none';
        toggleBtn.innerHTML = '<i data-feather="list"></i> List View';
        state.viewType = 'calendar';
        renderCalendar();
    } else {
        calendarView.style.display = 'none';
        listView.style.display = 'block';
        toggleBtn.innerHTML = '<i data-feather="calendar"></i> Calendar View';
        state.viewType = 'list';
    }
    
    feather.replace();
}

/**
 * Render calendar for booking view
 */
function renderCalendar() {
    const container = document.getElementById('calendar-days');
    if (!container) return;

    container.innerHTML = '';

    const firstDayOfMonth = new Date(state.currentYear, state.currentMonth, 1);
    const lastDayOfMonth = new Date(state.currentYear, state.currentMonth + 1, 0);
    const daysInMonth = lastDayOfMonth.getDate();
    const startingDayOfWeek = firstDayOfMonth.getDay();

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
        const emptyCell = document.createElement('div');
        emptyCell.className = 'calendar-day other-month';
        container.appendChild(emptyCell);
    }

    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
        const dateString = `${state.currentYear}-${String(state.currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const hasBookings = state.bookings.some(b => b.booking_date === dateString);
        const isSelected = state.selectedCalendarDate === dateString;
        const isToday = new Date().toDateString() === new Date(dateString).toDateString();

        const dayElement = document.createElement('div');
        dayElement.className = `calendar-day ${hasBookings ? 'has-bookings' : ''} ${isSelected ? 'selected' : ''} ${isToday ? 'today' : ''}`;
        dayElement.innerHTML = `<div class="calendar-day-number">${day}</div>`;
        dayElement.addEventListener('click', () => selectCalendarDate(dateString));
        container.appendChild(dayElement);
    }

    // Update month/year display
    const monthNames = ["January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"];
    document.getElementById('calendar-month-year').textContent = 
        `${monthNames[state.currentMonth]} ${state.currentYear}`;

    // Show bookings for selected date if any
    if (state.selectedCalendarDate) {
        showBookingsForSelectedDate();
    }
}

/**
 * Navigate to previous month
 */
function prevMonth() {
    if (state.currentMonth === 0) {
        state.currentMonth = 11;
        state.currentYear--;
    } else {
        state.currentMonth--;
    }
    renderCalendar();
}

/**
 * Navigate to next month
 */
function nextMonth() {
    if (state.currentMonth === 11) {
        state.currentMonth = 0;
        state.currentYear++;
    } else {
        state.currentMonth++;
    }
    renderCalendar();
}

/**
 * Select a date on the calendar
 */
function selectCalendarDate(dateString) {
    state.selectedCalendarDate = dateString;
    renderCalendar();
    showBookingsForSelectedDate();
}

/**
 * Show bookings for the selected calendar date
 */
function showBookingsForSelectedDate() {
    const container = document.getElementById('selected-date-bookings');
    const dateDisplay = document.getElementById('selected-date-display');
    const bookingsContainer = document.getElementById('bookings-for-selected-date');

    if (!state.selectedCalendarDate || !container || !dateDisplay || !bookingsContainer) return;

    const selectedDate = new Date(state.selectedCalendarDate);
    const formattedDate = selectedDate.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    dateDisplay.textContent = formattedDate;

    const bookingsForDate = state.bookings.filter(booking => 
        booking.booking_date === state.selectedCalendarDate
    );

    if (bookingsForDate.length === 0) {
        bookingsContainer.innerHTML = '<p style="text-align: center; color: #9ca3af; padding: 2rem;">No bookings for this date</p>';
    } else {
        bookingsContainer.innerHTML = bookingsForDate.map(booking => `
            <div class="calendar-booking-card" style="background: white; border: 1px solid #e5e7eb; border-radius: 8px; padding: 1rem; margin-bottom: 1rem; display: flex; align-items: center; gap: 12px;">
                <div class="booking-avatar" style="width: 40px; height: 40px; background: linear-gradient(135deg, #9333ea 0%, #ec4899 100%); border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold;">
                    ${booking.client_name.charAt(0)}
                </div>
                <div style="flex: 1;">
                    <div style="font-weight: 600; margin-bottom: 4px;">${booking.client_name}</div>
                    <div style="font-size: 14px; color: #6b7280;">${booking.service_name}</div>
                    <div style="font-size: 13px; color: #9ca3af;">Time: ${booking.booking_time}</div>
                </div>
                <span class="status-badge status-${booking.status}">${booking.status}</span>
                ${booking.status === 'confirmed' ? `
                    <button class="btn-done" onclick="markBookingDone('${booking.id}')" style="margin-left: 8px;">
                        <i data-feather="check-circle" style="width: 14px; height: 14px;"></i>
                        Done
                    </button>
                ` : ''}
            </div>
        `).join('');
        
        feather.replace();
    }

    container.style.display = 'block';
}

// === UI MANAGEMENT FUNCTIONS ===

/**
 * Set active main tab
 */
function setActiveTab(tabName) {
    // Update active tab state
    state.activeTab = tabName;

    // Update navigation styling
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.toggle('active', item.dataset.tab === tabName);
    });

    // Update tab content visibility
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.toggle('active', content.id === `${tabName}-content`);
    });

    // Update page title and icon
    const tabConfig = {
        dashboard: { icon: 'bar-chart-3', title: 'Dashboard' },
        bookings: { icon: 'calendar', title: 'Bookings' },
        slots: { icon: 'clock', title: 'Slots' },
        services: { icon: 'star', title: 'Services' },
        users: { icon: 'users', title: 'Users' },
        settings: { icon: 'settings', title: 'Settings' }
    };

    const config = tabConfig[tabName];
    document.getElementById('page-icon').setAttribute('data-feather', config.icon);
    document.getElementById('page-title-text').textContent = config.title;

    feather.replace();

    // Trigger specific tab rendering
    if (tabName === 'dashboard') {
        renderCharts();
    } else if (tabName === 'bookings') {
        if (state.activeBookingsTab === 'current') {
            renderBookings();
        } else {
            renderDeletedBookings();
        }
    }

    // Close mobile sidebar after navigation
    closeMobileSidebar();
}

/**
 * Set active bookings sub-tab
 */
function setBookingsTab(tabName) {
    state.activeBookingsTab = tabName;

    // Update sub-tab styling
    document.querySelectorAll('.sub-tab').forEach(tab => {
        tab.classList.toggle('active', tab.dataset.tab === tabName);
    });

    // Update sub-tab content visibility
    document.querySelectorAll('.sub-tab-content').forEach(content => {
        const contentId = content.id;
        if (contentId === 'current-bookings' && tabName === 'current') {
            content.classList.add('active');
        } else if (contentId === 'deleted-bookings' && tabName === 'deleted') {
            content.classList.add('active');
        } else {
            content.classList.remove('active');
        }
    });

    // Render appropriate content
    if (tabName === 'current') {
        renderBookings();
    } else if (tabName === 'deleted') {
        renderDeletedBookings();
    }
}

/**
 * Toggle sidebar collapse/expand
 */
function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    
    if (window.innerWidth <= 768) {
        // Mobile: toggle show/hide
        sidebar.classList.toggle('show');
    } else {
        // Desktop: toggle collapse
        state.sidebarCollapsed = !state.sidebarCollapsed;
        sidebar.classList.toggle('collapsed', state.sidebarCollapsed);
    }
}

/**
 * Close mobile sidebar
 */
function closeMobileSidebar() {
    if (window.innerWidth <= 768) {
        document.getElementById('sidebar').classList.remove('show');
    }
}

/**
 * Handle window resize
 */
function handleWindowResize() {
    const sidebar = document.getElementById('sidebar');
    
    if (window.innerWidth > 768) {
        // Desktop mode
        sidebar.classList.remove('show');
        sidebar.classList.toggle('collapsed', state.sidebarCollapsed);
    } else {
        // Mobile mode
        sidebar.classList.remove('collapsed');
    }

    // Re-render charts on resize
    if (state.activeTab === 'dashboard') {
        setTimeout(renderCharts, 100);
    }
}

/**
 * Toggle dark mode
 */
function toggleTheme() {
    state.isDarkMode = !state.isDarkMode;
    document.body.classList.toggle('dark', state.isDarkMode);
    
    const themeIcon = document.getElementById('theme-icon');
    themeIcon.setAttribute('data-feather', state.isDarkMode ? 'sun' : 'moon');
    
    localStorage.setItem('darkMode', state.isDarkMode);
    feather.replace();
    
    // Re-render charts with new theme
    if (state.activeTab === 'dashboard') {
        setTimeout(renderCharts, 100);
    }
}

/**
 * Update booking count badge
 */
function updateBookingCount() {
    const pendingCount = state.bookings.filter(b => b.status === 'pending').length;
    document.getElementById('booking-count').textContent = pendingCount || '0';
    
    // Hide badge if no pending bookings
    const badge = document.getElementById('booking-count');
    badge.style.display = pendingCount > 0 ? 'block' : 'none';
}

/**
 * Update UI elements based on current state
 */
function updateUI() {
    // Update user info in sidebar
    const userAvatar = document.getElementById('user-avatar');
    const userName = document.getElementById('user-name');
    const userEmail = document.getElementById('user-email');

    if (userAvatar) userAvatar.textContent = 'A';
    if (userName) userName.textContent = 'Admin User';
    if (userEmail) userEmail.textContent = 'admin@bsstudio.com';

    // Update settings form with current values
    if (state.activeTab === 'settings') {
        const depositInput = document.getElementById('deposit-amount');
        const momoInput = document.getElementById('momo-number');
        const policyInput = document.getElementById('booking-policy');

        if (depositInput) depositInput.value = state.settings.depositAmount;
        if (momoInput) momoInput.value = state.settings.momoNumber;
        if (policyInput) policyInput.value = state.settings.bookingPolicy;
    }
}

// === UTILITY FUNCTIONS ===

/**
 * Show toast notification
 */
function showToast(message, type = 'success') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    const iconMap = {
        success: 'check-circle',
        error: 'x-circle',
        warning: 'alert-triangle'
    };

    toast.innerHTML = `
        <i data-feather="${iconMap[type] || 'info'}" class="toast-icon"></i>
        <span class="toast-message">${message}</span>
    `;

    container.appendChild(toast);
    feather.replace();

    // Trigger show animation
    setTimeout(() => toast.classList.add('show'), 100);

    // Auto remove after 5 seconds
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
            if (container.contains(toast)) {
                container.removeChild(toast);
            }
        }, 300);
    }, 5000);
}

/**
 * Export all data as JSON
 */
function exportData() {
    const exportData = {
        bookings: state.bookings,
        deletedBookings: state.deletedBookings,
        services: state.services,
        users: state.users,
        slots: state.slots,
        settings: state.settings,
        exportDate: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `bs-studio-admin-export-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    
    URL.revokeObjectURL(url);
    showToast('Data exported successfully!', 'success');
}

/**
 * Admin logout (placeholder)
 */
function adminLogout() {
    if (confirm('Are you sure you want to logout?')) {
        // Clear any stored auth data
        localStorage.removeItem('adminAuth');
        
        // Redirect to login page or reload
        window.location.reload();
    }
}

// === FILTER FUNCTIONS ===

/**
 * Filter bookings based on search input
 */
function filterBookings() {
    renderBookings();
}

/**
 * Filter users based on search input
 */
function filterUsers() {
    renderUsers();
}

// === GLOBAL FUNCTIONS (for HTML onclick handlers) ===
// Make functions available globally for HTML onclick attributes
window.setActiveTab = setActiveTab;
window.setBookingsTab = setBookingsTab;
window.toggleSidebar = toggleSidebar;
window.toggleTheme = toggleTheme;
window.toggleCalendarView = toggleCalendarView;
window.prevMonth = prevMonth;
window.nextMonth = nextMonth;
window.confirmBooking = confirmBooking;
window.cancelBooking = cancelBooking;
window.markBookingDone = markBookingDone;
window.deleteBooking = deleteBooking;
window.viewBookingDetails = viewBookingDetails;
window.showServiceModal = showServiceModal;
window.closeServiceModal = closeServiceModal;
window.saveService = saveService;
window.editService = editService;
window.deleteService = deleteService;
window.viewUserDetails = viewUserDetails;
window.toggleSlot = toggleSlot;
window.resetSlotDefaults = resetSlotDefaults;
window.updateCustomSlotDate = updateCustomSlotDate;
window.saveCustomSlots = saveCustomSlots;
window.saveSettings = saveSettings;
window.syncToDatabase = syncToDatabase;
window.exportData = exportData;
window.adminLogout = adminLogout;
window.filterBookings = filterBookings;
window.filterUsers = filterUsers;

// === FIREBASE AUTH INTEGRATION ===
// Note: This section handles Firebase Auth integration for user management
document.addEventListener('DOMContentLoaded', () => {
    // Initialize Firebase Auth state listener
    if (window.firebaseAuth) {
        window.firebaseAuth.onAuthStateChanged(async (user) => {
            if (user) {
                // User is signed in, sync to Supabase users table
                try {
                    const { error } = await supabase
                        .from('users')
                        .upsert({
                            firebase_uid: user.uid,
                            email: user.email,
                            last_login: new Date().toISOString(),
                            updated_at: new Date().toISOString()
                        }, {
                            onConflict: 'firebase_uid'
                        });

                    if (error && error.code !== '23505') { // Ignore unique constraint errors
                        console.error('Error syncing user to Supabase:', error);
                    }
                } catch (error) {
                    console.error('Error in auth state change handler:', error);
                }
            }
        });
    }
});

console.log('🎉 BS Studio Admin Dashboard loaded successfully!');