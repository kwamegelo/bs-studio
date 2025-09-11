import React, { useState, useEffect } from 'react';
import { Calendar, Clock, User, Phone, Mail, CheckCircle, XCircle, AlertCircle, Bell, ArrowLeft, ArrowRight, Star, Camera } from 'lucide-react';

const ModernBookingSystem = () => {
  const [currentView, setCurrentView] = useState('customer');
  const [bookingStep, setBookingStep] = useState(1);
  
  // Define services with enhanced details
  const services = {
    'Classic': { 
      name: 'Classic', 
      deposit: 150, 
      duration: 120,
      description: 'Professional photo session with standard editing',
      features: ['2 hours session', '30+ edited photos', 'Online gallery', 'Standard retouching'],
      popular: false
    },
    'Volume': { 
      name: 'Volume', 
      deposit: 250, 
      duration: 240,
      description: 'Extended session with multiple setups and enhanced editing',
      features: ['4 hours session', '60+ edited photos', 'Premium editing', '2 outfit changes', 'Online gallery'],
      popular: true
    },
    'Hybrid': { 
      name: 'Hybrid', 
      deposit: 350, 
      duration: 360,
      description: 'Combined photo and video production with premium editing',
      features: ['6 hours session', '80+ edited photos', 'Short video clips', '3 outfit changes', 'Premium retouching', 'Priority booking'],
      popular: false
    }
  };

  // Enhanced time slots with better visualization
  const timeSlots = [
    { time: '09:00', label: '9:00 AM', period: 'morning' },
    { time: '10:00', label: '10:00 AM', period: 'morning' },
    { time: '11:00', label: '11:00 AM', period: 'morning' },
    { time: '12:00', label: '12:00 PM', period: 'afternoon' },
    { time: '13:00', label: '1:00 PM', period: 'afternoon' },
    { time: '14:00', label: '2:00 PM', period: 'afternoon' },
    { time: '15:00', label: '3:00 PM', period: 'afternoon' },
    { time: '16:00', label: '4:00 PM', period: 'afternoon' },
    { time: '17:00', label: '5:00 PM', period: 'evening' },
    { time: '18:00', label: '6:00 PM', period: 'evening' }
  ];

  // State for bookings
  const [bookings, setBookings] = useState([
    {
      id: 1,
      customerName: 'Sarah Johnson',
      email: 'sarah@example.com',
      phone: '+1234567890',
      service: 'Volume',
      date: '2024-03-15',
      time: '14:00',
      duration: 240,
      deposit: 250,
      status: 'pending',
      notes: 'Birthday photoshoot, prefer natural lighting',
      createdAt: '2024-03-10T10:30:00'
    },
    {
      id: 2,
      customerName: 'Mike Chen',
      email: 'mike@example.com',
      phone: '+1987654321',
      service: 'Classic',
      date: '2024-03-16',
      time: '10:00',
      duration: 120,
      deposit: 150,
      status: 'verified',
      notes: 'Professional headshots',
      createdAt: '2024-03-11T14:20:00'
    }
  ]);

  // Enhanced booked slots
  const [bookedSlots, setBookedSlots] = useState(new Set([
    '2024-03-15-14:00', '2024-03-15-15:00', '2024-03-15-16:00', // Volume session (4 hours)
    '2024-03-16-10:00', '2024-03-16-11:00' // Classic session (2 hours)
  ]));
  
  const [formData, setFormData] = useState({
    customerName: '',
    email: '',
    phone: '',
    service: '',
    date: '',
    time: '',
    notes: ''
  });

  const [availableSlots, setAvailableSlots] = useState([]);
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      bookingId: 2,
      message: 'Your Classic session has been confirmed!\nDate: March 16, 2024\nTime: 10:00 AM\nDuration: 2 hours\nDeposit received: $150\nWe look forward to seeing you at BS Studio!',
      timestamp: '2024-03-11T14:25:00',
      read: false
    }
  ]);

  // Calculate duration slots needed for a service
  const calculateSlotsNeeded = (serviceName) => {
    const service = services[serviceName];
    if (!service) return 1;
    return Math.ceil(service.duration / 60);
  };

  // Check if a time slot conflicts with booked slots
  const isSlotAvailable = (date, startTime, duration = 60) => {
    const slotsNeeded = Math.ceil(duration / 60);
    const startIndex = timeSlots.findIndex(slot => slot.time === startTime);
    
    if (startIndex === -1 || startIndex + slotsNeeded > timeSlots.length) return false;
    
    for (let i = 0; i < slotsNeeded; i++) {
      const checkTime = timeSlots[startIndex + i].time;
      const slotKey = `${date}-${checkTime}`;
      if (bookedSlots.has(slotKey)) return false;
    }
    return true;
  };

  // Update available slots when date or service changes
  useEffect(() => {
    if (formData.date && formData.service) {
      const service = services[formData.service];
      const slotsForDate = timeSlots.filter(slot => 
        isSlotAvailable(formData.date, slot.time, service.duration)
      );
      setAvailableSlots(slotsForDate);
    } else {
      setAvailableSlots([]);
    }
  }, [formData.date, formData.service, bookedSlots]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (name === 'date' || name === 'service') {
      setFormData(prev => ({
        ...prev,
        time: ''
      }));
    }
  };

  const handleServiceSelect = (serviceName) => {
    setFormData(prev => ({
      ...prev,
      service: serviceName,
      time: ''
    }));
    setBookingStep(2);
  };

  const handleNextStep = () => {
    if (bookingStep < 4) {
      setBookingStep(bookingStep + 1);
    }
  };

  const handlePrevStep = () => {
    if (bookingStep > 1) {
      setBookingStep(bookingStep - 1);
    }
  };

  const handleBookingSubmit = () => {
    if (!formData.customerName || !formData.email || !formData.phone || 
        !formData.service || !formData.date || !formData.time) {
      alert('Please fill in all required fields');
      return;
    }

    const selectedService = services[formData.service];
    
    const newBooking = {
      id: Date.now(),
      ...formData,
      deposit: selectedService.deposit,
      duration: selectedService.duration,
      status: 'pending',
      createdAt: new Date().toISOString()
    };
    
    setBookings(prev => [...prev, newBooking]);
    
    // Reset form and go to confirmation
    setFormData({
      customerName: '',
      email: '',
      phone: '',
      service: '',
      date: '',
      time: '',
      notes: ''
    });
    
    setBookingStep(4);
    
    setTimeout(() => {
      alert(`Booking submitted successfully! Please call us at (555) 123-4567 to pay the $${selectedService.deposit} deposit and confirm your ${selectedService.name} session.`);
      setBookingStep(1);
    }, 2000);
  };

  const handleStatusChange = (bookingId, newStatus) => {
    const booking = bookings.find(b => b.id === bookingId);
    
    setBookings(prev => 
      prev.map(b => 
        b.id === bookingId 
          ? { ...b, status: newStatus }
          : b
      )
    );

    if (newStatus === 'verified' && booking) {
      // Mark consecutive slots as unavailable based on duration
      const slotsNeeded = Math.ceil(booking.duration / 60);
      const startIndex = timeSlots.findIndex(slot => slot.time === booking.time);
      
      const newBookedSlots = new Set(bookedSlots);
      for (let i = 0; i < slotsNeeded; i++) {
        if (startIndex + i < timeSlots.length) {
          const timeSlot = timeSlots[startIndex + i].time;
          const slotKey = `${booking.date}-${timeSlot}`;
          newBookedSlots.add(slotKey);
        }
      }
      setBookedSlots(newBookedSlots);
      
      // Send notification to customer
      const notification = {
        id: Date.now(),
        bookingId,
        message: `Your ${booking.service} session has been confirmed!\nDate: ${new Date(booking.date).toLocaleDateString()}\nTime: ${timeSlots.find(s => s.time === booking.time)?.label}\nDuration: ${Math.floor(booking.duration / 60)} hours\nDeposit received: $${booking.deposit}\nWe look forward to seeing you at BS Studio!`,
        timestamp: new Date().toISOString(),
        read: false
      };
      setNotifications(prev => [...prev, notification]);
    }
    
    if (newStatus === 'cancelled' && booking) {
      // Make consecutive slots available again
      const slotsNeeded = Math.ceil(booking.duration / 60);
      const startIndex = timeSlots.findIndex(slot => slot.time === booking.time);
      
      const newBookedSlots = new Set(bookedSlots);
      for (let i = 0; i < slotsNeeded; i++) {
        if (startIndex + i < timeSlots.length) {
          const timeSlot = timeSlots[startIndex + i].time;
          const slotKey = `${booking.date}-${timeSlot}`;
          newBookedSlots.delete(slotKey);
        }
      }
      setBookedSlots(newBookedSlots);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500 text-white';
      case 'verified': return 'bg-green-500 text-white';
      case 'cancelled': return 'bg-red-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return <AlertCircle className="w-4 h-4" />;
      case 'verified': return <CheckCircle className="w-4 h-4" />;
      case 'cancelled': return <XCircle className="w-4 h-4" />;
      default: return <AlertCircle className="w-4 h-4" />;
    }
  };

  const getMinDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  const getProgressPercentage = () => {
    return (bookingStep / 4) * 100;
  };

  const renderTimeSlotGrid = () => {
    const periods = ['morning', 'afternoon', 'evening'];
    
    return (
      <div className="space-y-6">
        {periods.map(period => {
          const periodSlots = timeSlots.filter(slot => slot.period === period);
          const availablePeriodSlots = availableSlots.filter(slot => slot.period === period);
          
          if (availablePeriodSlots.length === 0) return null;
          
          return (
            <div key={period} className="space-y-3">
              <h4 className="text-sm font-semibold text-gray-600 uppercase tracking-wide capitalize">
                {period}
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {periodSlots.map(slot => {
                  const isAvailable = availablePeriodSlots.some(s => s.time === slot.time);
                  const isSelected = formData.time === slot.time;
                  
                  if (!isAvailable) return null;
                  
                  return (
                    <button
                      key={slot.time}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, time: slot.time }))}
                      className={`p-4 rounded-lg border-2 transition-all duration-200 transform hover:scale-105 ${
                        isSelected
                          ? 'border-purple-500 bg-purple-500 text-white shadow-lg'
                          : 'border-gray-200 bg-white text-gray-700 hover:border-purple-300 hover:shadow-md'
                      }`}
                    >
                      <div className="text-sm font-semibold">{slot.label}</div>
                      <div className="text-xs opacity-75 mt-1">
                        {formData.service && `${Math.floor(services[formData.service].duration / 60)}h session`}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderBookingStep = () => {
    switch (bookingStep) {
      case 1:
        return (
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Choose Your Service</h2>
              <p className="text-gray-600">Select the perfect package for your needs</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {Object.values(services).map((service) => (
                <div
                  key={service.name}
                  onClick={() => handleServiceSelect(service.name)}
                  className={`relative cursor-pointer rounded-xl border-2 p-6 transition-all duration-300 transform hover:scale-105 hover:shadow-xl ${
                    service.popular 
                      ? 'border-purple-500 bg-purple-50 shadow-lg'
                      : 'border-gray-200 bg-white hover:border-purple-300'
                  }`}
                >
                  {service.popular && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <div className="bg-purple-500 text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center">
                        <Star className="w-3 h-3 mr-1" />
                        MOST POPULAR
                      </div>
                    </div>
                  )}
                  
                  <div className="text-center mb-4">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{service.name}</h3>
                    <p className="text-gray-600 text-sm">{service.description}</p>
                  </div>
                  
                  <div className="space-y-2 mb-4">
                    {service.features.map((feature, index) => (
                      <div key={index} className="flex items-center text-sm text-gray-700">
                        <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                        {feature}
                      </div>
                    ))}
                  </div>
                  
                  <div className="text-center border-t pt-4">
                    <div className="text-2xl font-bold text-purple-600 mb-1">${service.deposit}</div>
                    <div className="text-sm text-gray-500">Deposit to book</div>
                    <div className="text-xs text-gray-400 mt-1">{Math.floor(service.duration / 60)} hour session</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
        
      case 2:
        return (
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Select Date & Time</h2>
              <p className="text-gray-600">Choose when you'd like your {formData.service} session</p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-4">
                <label className="block text-sm font-semibold text-gray-700">
                  <Calendar className="w-4 h-4 inline mr-2" />
                  Preferred Date
                </label>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleInputChange}
                  required
                  min={getMinDate()}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              
              <div className="space-y-4">
                <label className="block text-sm font-semibold text-gray-700">
                  <Clock className="w-4 h-4 inline mr-2" />
                  Available Time Slots
                </label>
                {formData.date ? (
                  availableSlots.length > 0 ? (
                    renderTimeSlotGrid()
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <Clock className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>No available slots for this date</p>
                      <p className="text-sm">Please choose another date</p>
                    </div>
                  )
                ) : (
                  <div className="text-center py-8 text-gray-400">
                    <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Please select a date first</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
        
      case 3:
        return (
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Your Information</h2>
              <p className="text-gray-600">Tell us how to reach you</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  <User className="w-4 h-4 inline mr-1" />
                  Full Name *
                </label>
                <input
                  type="text"
                  name="customerName"
                  value={formData.customerName}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter your full name"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  <Mail className="w-4 h-4 inline mr-1" />
                  Email Address *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  placeholder="your.email@example.com"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  <Phone className="w-4 h-4 inline mr-1" />
                  Phone Number *
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  required
                  placeholder="+1 (555) 123-4567"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  Selected Service
                </label>
                <div className="px-4 py-3 border border-gray-200 rounded-lg bg-gray-50 text-gray-700 font-medium">
                  {formData.service} - {formData.date && new Date(formData.date).toLocaleDateString()} at {timeSlots.find(s => s.time === formData.time)?.label}
                </div>
              </div>
              
              <div className="md:col-span-2 space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  Additional Notes
                </label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  rows={4}
                  placeholder="Any specific requirements or details about your session..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                />
              </div>
            </div>
            
            {formData.service && (
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
                <div className="flex items-start">
                  <div className="bg-purple-100 rounded-full p-2 mr-4">
                    <AlertCircle className="h-5 w-5 text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-purple-900 mb-2">Booking Summary</h4>
                    <div className="space-y-1 text-sm text-purple-800">
                      <p><strong>Service:</strong> {services[formData.service]?.name} ({Math.floor(services[formData.service]?.duration / 60)} hours)</p>
                      <p><strong>Deposit Required:</strong> ${services[formData.service]?.deposit}</p>
                      <p><strong>Next Step:</strong> Call (555) 123-4567 after booking to pay your deposit</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        );
        
      case 4:
        return (
          <div className="text-center space-y-8">
            <div className="mx-auto w-20 h-20 bg-green-500 rounded-full flex items-center justify-center">
              <CheckCircle className="w-10 h-10 text-white" />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Booking Submitted!</h2>
              <p className="text-gray-600">We'll contact you shortly to confirm your session</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-6 text-left max-w-md mx-auto">
              <h4 className="font-semibold text-gray-900 mb-4">Next Steps:</h4>
              <div className="space-y-3 text-sm text-gray-700">
                <div className="flex items-start">
                  <div className="bg-blue-100 rounded-full p-1 mr-3 mt-1">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  </div>
                  <p>Call us at <strong>(555) 123-4567</strong> to pay your deposit</p>
                </div>
                <div className="flex items-start">
                  <div className="bg-blue-100 rounded-full p-1 mr-3 mt-1">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  </div>
                  <p>We'll confirm your booking once deposit is received</p>
                </div>
                <div className="flex items-start">
                  <div className="bg-blue-100 rounded-full p-1 mr-3 mt-1">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  </div>
                  <p>You'll receive a confirmation notification here</p>
                </div>
              </div>
            </div>
          </div>
        );
        
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Navigation */}
      <nav className="bg-white shadow-lg border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="bg-purple-500 rounded-lg p-2">
                  <Camera className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-purple-600">BS Studio</h1>
                  <p className="text-xs text-gray-500">Professional Photography</p>
                </div>
              </div>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setCurrentView('customer')}
                className={`px-6 py-2 rounded-lg font-medium transition-all duration-300 ${
                  currentView === 'customer'
                    ? 'bg-purple-500 text-white shadow-lg'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                Book Service
              </button>
              <button
                onClick={() => setCurrentView('admin')}
                className={`px-6 py-2 rounded-lg font-medium transition-all duration-300 ${
                  currentView === 'admin'
                    ? 'bg-purple-500 text-white shadow-lg'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                Admin Dashboard
              </button>
            </div>
          </div>
        </div>
      </nav>

      {currentView === 'customer' ? (
        <div className="max-w-6xl mx-auto p-6">
          {/* Progress Bar */}
          {bookingStep < 4 && (
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <div className="text-sm font-medium text-gray-600">
                  Step {bookingStep} of 3
                </div>
                <div className="text-sm font-medium text-gray-600">
                  {Math.round((bookingStep / 3) * 100)}% Complete
                </div>
              </div>
              
              <div className="w-full bg-gray-200 rounded-full h-3 mb-6">
                <div 
                  className="bg-purple-500 h-3 rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${(bookingStep / 3) * 100}%` }}
                ></div>
              </div>
              
              <div className="flex justify-between text-xs text-gray-500">
                <span className={bookingStep >= 1 ? 'text-purple-600 font-medium' : ''}>Choose Service</span>
                <span className={bookingStep >= 2 ? 'text-purple-600 font-medium' : ''}>Select Date & Time</span>
                <span className={bookingStep >= 3 ? 'text-purple-600 font-medium' : ''}>Your Information</span>
              </div>
            </div>
          )}

          {/* Booking Form */}
          <div className="bg-white rounded-xl shadow-xl p-8 border border-gray-200">
            {renderBookingStep()}
            
            {/* Navigation Buttons */}
            {bookingStep < 4 && (
              <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-200">
                <button
                  onClick={handlePrevStep}
                  disabled={bookingStep === 1}
                  className="flex items-center px-6 py-3 text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Previous
                </button>
                
                <div className="flex space-x-3">
                  {bookingStep < 3 ? (
                    <button
                      onClick={handleNextStep}
                      disabled={
                        (bookingStep === 1 && !formData.service) ||
                        (bookingStep === 2 && (!formData.date || !formData.time))
                      }
                      className="flex items-center px-8 py-3 bg-purple-500 text-white rounded-lg font-medium hover:bg-purple-600 hover:shadow-lg transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none transition-all duration-300"
                    >
                      Next
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </button>
                  ) : (
                    <button
                      onClick={handleBookingSubmit}
                      disabled={!formData.customerName || !formData.email || !formData.phone}
                      className="flex items-center px-8 py-3 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600 hover:shadow-lg transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none transition-all duration-300"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Submit Booking
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Customer Notifications */}
          {notifications.length > 0 && (
            <div className="mt-8 bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
              <div className="bg-green-500 p-4">
                <h3 className="text-xl font-semibold text-white flex items-center">
                  <Bell className="w-5 h-5 mr-2" />
                  Your Confirmations
                </h3>
              </div>
              <div className="p-6 space-y-4">
                {notifications.map((notification) => (
                  <div key={notification.id} className="bg-green-50 border border-green-200 rounded-lg p-6 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-20 h-20 bg-green-100 rounded-full opacity-50 transform translate-x-8 -translate-y-8"></div>
                    <div className="relative z-10">
                      <div className="whitespace-pre-line text-green-800 font-medium mb-2">{notification.message}</div>
                      <p className="text-green-600 text-sm flex items-center">
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Confirmed: {new Date(notification.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="max-w-7xl mx-auto p-6">
          {/* Admin Header */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 mb-8 overflow-hidden">
            <div className="bg-purple-500 p-6">
              <h2 className="text-2xl font-bold text-white">Admin Dashboard</h2>
              <p className="text-purple-100">Manage bookings and confirm payments</p>
            </div>
            
            {/* Dashboard Stats */}
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-blue-600 text-sm font-medium">Total Bookings</p>
                      <p className="text-2xl font-bold text-blue-900">{bookings.length}</p>
                    </div>
                    <div className="bg-blue-200 rounded-lg p-2">
                      <Calendar className="w-6 h-6 text-blue-600" />
                    </div>
                  </div>
                </div>
                
                <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-yellow-600 text-sm font-medium">Pending</p>
                      <p className="text-2xl font-bold text-yellow-900">
                        {bookings.filter(b => b.status === 'pending').length}
                      </p>
                    </div>
                    <div className="bg-yellow-200 rounded-lg p-2">
                      <AlertCircle className="w-6 h-6 text-yellow-600" />
                    </div>
                  </div>
                </div>
                
                <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-green-600 text-sm font-medium">Confirmed</p>
                      <p className="text-2xl font-bold text-green-900">
                        {bookings.filter(b => b.status === 'verified').length}
                      </p>
                    </div>
                    <div className="bg-green-200 rounded-lg p-2">
                      <CheckCircle className="w-6 h-6 text-green-600" />
                    </div>
                  </div>
                </div>
                
                <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-purple-600 text-sm font-medium">Revenue</p>
                      <p className="text-2xl font-bold text-purple-900">
                        ${bookings.filter(b => b.status === 'verified').reduce((sum, b) => sum + b.deposit, 0)}
                      </p>
                    </div>
                    <div className="bg-purple-200 rounded-lg p-2">
                      <Star className="w-6 h-6 text-purple-600" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Bookings Table */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Customer Details
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Service & Session
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Date & Time
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Deposit
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {bookings.map((booking) => (
                    <tr key={booking.id} className="hover:bg-gray-50 transition-all duration-300">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="bg-purple-500 rounded-full w-10 h-10 flex items-center justify-center text-white font-semibold text-sm mr-3">
                            {booking.customerName.charAt(0)}
                          </div>
                          <div>
                            <div className="text-sm font-semibold text-gray-900">{booking.customerName}</div>
                            <div className="text-sm text-gray-500 flex items-center">
                              <Mail className="w-3 h-3 mr-1" />
                              {booking.email}
                            </div>
                            <div className="text-sm text-gray-500 flex items-center">
                              <Phone className="w-3 h-3 mr-1" />
                              {booking.phone}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-semibold text-gray-900">{booking.service}</div>
                          <div className="text-sm text-gray-500">{Math.floor(booking.duration / 60)} hours</div>
                          {booking.notes && (
                            <div className="text-sm text-gray-500 italic mt-1 bg-gray-50 rounded px-2 py-1">
                              "{booking.notes}"
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="font-semibold text-gray-900 flex items-center">
                          <Calendar className="w-4 h-4 mr-1 text-gray-400" />
                          {new Date(booking.date).toLocaleDateString()}
                        </div>
                        <div className="text-gray-500 flex items-center">
                          <Clock className="w-4 h-4 mr-1 text-gray-400" />
                          {timeSlots.find(s => s.time === booking.time)?.label || booking.time}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-lg font-bold text-green-600">${booking.deposit}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(booking.status)}`}>
                          {getStatusIcon(booking.status)}
                          <span className="ml-1 capitalize">{booking.status}</span>
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          {booking.status === 'pending' && (
                            <>
                              <button
                                onClick={() => handleStatusChange(booking.id, 'verified')}
                                className="bg-green-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-600 hover:shadow-lg transform hover:scale-105 transition-all duration-300"
                              >
                                Confirm Payment
                              </button>
                              <button
                                onClick={() => handleStatusChange(booking.id, 'cancelled')}
                                className="bg-red-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-600 hover:shadow-lg transform hover:scale-105 transition-all duration-300"
                              >
                                Cancel
                              </button>
                            </>
                          )}
                          {booking.status === 'verified' && (
                            <button
                              onClick={() => handleStatusChange(booking.id, 'cancelled')}
                              className="bg-gray-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-600 hover:shadow-lg transform hover:scale-105 transition-all duration-300"
                            >
                              Cancel Booking
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {bookings.length === 0 && (
              <div className="text-center py-12">
                <div className="bg-gray-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <Calendar className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-gray-500 text-lg">No bookings yet</p>
                <p className="text-gray-400 text-sm">New bookings will appear here</p>
              </div>
            )}
          </div>

          {/* Slot Management Info */}
          <div className="mt-8 bg-blue-50 rounded-xl p-6 border border-blue-200">
            <div className="flex items-start">
              <div className="bg-blue-100 rounded-full p-2 mr-4">
                <Clock className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-blue-900 mb-2">Slot Management</h3>
                <div className="text-blue-800 text-sm space-y-1">
                  <p>• When you confirm a booking, consecutive time slots become unavailable based on session duration</p>
                  <p>• Cancelled bookings automatically free up their time slots for new bookings</p>
                  <p>• Currently <strong>{bookedSlots.size}</strong> time slots are occupied across all dates</p>
                  <p>• The system prevents overlapping bookings and manages session durations automatically</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ModernBookingSystem;