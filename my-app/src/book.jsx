import React, { useState, useEffect } from 'react';
import { Calendar, Clock, User, Phone, Mail, MapPin, CreditCard, Check, ArrowLeft, ArrowRight, Star, Heart, AlertCircle, CheckCircle, Eye, Crown, Sparkles } from 'lucide-react';

const BookingSystem = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedService, setSelectedService] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [clientInfo, setClientInfo] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    isNewClient: true,
    allergies: '',
    preferences: '',
    specialRequests: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingComplete, setBookingComplete] = useState(false);

  const services = [
    {
      id: 1,
      name: "Classic Lashes",
      price: 120,
      duration: "2-2.5 hours",
      description: "One extension per natural lash for a natural, enhanced look",
      features: ["Natural everyday look", "Perfect for beginners", "Low maintenance"],
      icon: Eye,
      gradient: "from-pink-400 to-rose-500",
      popular: false
    },
    {
      id: 2,
      name: "Hybrid Lashes",
      price: 145,
      duration: "2.5-3 hours",
      description: "Mix of classic and volume techniques for texture and dimension",
      features: ["Best of both worlds", "Natural with volume", "Textured appearance"],
      icon: Sparkles,
      gradient: "from-purple-400 to-pink-500",
      popular: true
    },
    {
      id: 3,
      name: "Volume Lashes",
      price: 165,
      duration: "3-3.5 hours",
      description: "Multiple lightweight extensions per natural lash for dramatic fullness",
      features: ["Maximum fullness", "Glamorous look", "Lightweight feel"],
      icon: Crown,
      gradient: "from-indigo-400 to-purple-500",
      popular: false
    },
    {
      id: 4,
      name: "Mega Volume",
      price: 185,
      duration: "3.5-4 hours",
      description: "Ultra-fine extensions for the most dramatic, fluffy look possible",
      features: ["Ultimate drama", "Fluffy appearance", "Red-carpet ready"],
      icon: Star,
      gradient: "from-amber-400 to-orange-500",
      popular: false
    }
  ];

  const addOns = [
    { id: 'lift-tint', name: 'Lash Lift & Tint', price: 75 },
    { id: 'bottom-lashes', name: 'Bottom Lash Extensions', price: 45 },
    { id: 'removal', name: 'Lash Removal', price: 25 }
  ];

  // Generate next 30 days
  const generateDates = () => {
    const dates = [];
    const today = new Date();
    for (let i = 1; i <= 30; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      dates.push(date);
    }
    return dates;
  };

  // Generate time slots (9 AM to 7 PM)
  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 9; hour <= 19; hour++) {
      if (hour <= 17) { // Only morning/afternoon slots for longer services
        slots.push(`${hour}:00`);
      }
      if (hour <= 16 && hour >= 10) { // Avoid very early/late half-hour slots
        slots.push(`${hour}:30`);
      }
    }
    return slots;
  };

  const dates = generateDates();
  const timeSlots = generateTimeSlots();

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const formatTime = (time) => {
    const [hour] = time.split(':');
    const hourNum = parseInt(hour);
    return `${hourNum > 12 ? hourNum - 12 : hourNum}:${time.split(':')[1]} ${hourNum >= 12 ? 'PM' : 'AM'}`;
  };

  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsSubmitting(false);
    setBookingComplete(true);
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1: return selectedService !== null;
      case 2: return selectedDate !== null;
      case 3: return selectedTime !== null;
      case 4: return clientInfo.firstName && clientInfo.lastName && clientInfo.email && clientInfo.phone;
      default: return false;
    }
  };

  const steps = [
    { number: 1, title: "Select Service", icon: Eye },
    { number: 2, title: "Choose Date", icon: Calendar },
    { number: 3, title: "Pick Time", icon: Clock },
    { number: 4, title: "Your Details", icon: User }
  ];

  if (bookingComplete) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-pink-50 to-purple-50 flex items-center justify-center px-4">
        <div className="max-w-2xl mx-auto text-center">
          <div className="bg-white rounded-3xl shadow-2xl p-12">
            <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-white" />
            </div>
            
            <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent mb-6">
              Booking Confirmed! 🎉
            </h1>
            
            <div className="bg-gradient-to-r from-pink-100 to-purple-100 rounded-2xl p-6 mb-8">
              <h3 className="font-bold text-gray-800 mb-4">Appointment Summary</h3>
              <div className="space-y-2 text-left">
                <p><span className="font-semibold">Service:</span> {selectedService?.name}</p>
                <p><span className="font-semibold">Date:</span> {selectedDate ? formatDate(selectedDate) : ''}</p>
                <p><span className="font-semibold">Time:</span> {selectedTime ? formatTime(selectedTime) : ''}</p>
                <p><span className="font-semibold">Duration:</span> {selectedService?.duration}</p>
                <p><span className="font-semibold">Price:</span> ${selectedService?.price}</p>
              </div>
            </div>

            <p className="text-gray-600 mb-8">
              We've sent a confirmation email to <strong>{clientInfo.email}</strong> with all the details and preparation instructions.
            </p>

            <div className="space-y-4">
              <button 
                onClick={() => window.location.reload()}
                className="w-full bg-gradient-to-r from-pink-500 to-purple-600 text-white px-8 py-4 rounded-full font-bold text-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
              >
                Book Another Appointment
              </button>
              
              <div className="flex items-center justify-center text-gray-500">
                <Phone className="w-4 h-4 mr-2" />
                <span>Questions? Call (555) 123-4567</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-pink-50 to-purple-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent mb-4">
            Book Your Appointment
          </h1>
          <p className="text-xl text-gray-600">
            Let's get you those gorgeous lashes in just a few easy steps!
          </p>
        </div>

        {/* Progress Steps */}
        <div className="mb-12">
          <div className="flex items-center justify-center mb-8">
            {steps.map((step, index) => {
              const IconComponent = step.icon;
              const isActive = currentStep === step.number;
              const isCompleted = currentStep > step.number;
              
              return (
                <React.Fragment key={step.number}>
                  <div className="flex flex-col items-center">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${
                      isCompleted 
                        ? 'bg-gradient-to-r from-green-400 to-emerald-500' 
                        : isActive 
                          ? 'bg-gradient-to-r from-pink-500 to-purple-600' 
                          : 'bg-gray-200'
                    }`}>
                      {isCompleted ? (
                        <Check className="w-6 h-6 text-white" />
                      ) : (
                        <IconComponent className={`w-6 h-6 ${isActive ? 'text-white' : 'text-gray-400'}`} />
                      )}
                    </div>
                    <span className={`text-sm mt-2 font-medium ${
                      isActive ? 'text-purple-600' : 'text-gray-500'
                    }`}>
                      {step.title}
                    </span>
                  </div>
                  
                  {index < steps.length - 1 && (
                    <div className={`w-16 h-0.5 mx-4 transition-all duration-300 ${
                      currentStep > step.number ? 'bg-green-400' : 'bg-gray-200'
                    }`} />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        {/* Step Content */}
        <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 mb-8">
          
          {/* Step 1: Service Selection */}
          {currentStep === 1 && (
            <div>
              <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">Choose Your Service</h2>
              
              <div className="grid md:grid-cols-2 gap-6">
                {services.map((service) => {
                  const IconComponent = service.icon;
                  const isSelected = selectedService?.id === service.id;
                  
                  return (
                    <div
                      key={service.id}
                      onClick={() => setSelectedService(service)}
                      className={`relative cursor-pointer rounded-2xl p-6 border-2 transition-all duration-300 transform hover:scale-105 ${
                        isSelected 
                          ? 'border-purple-500 bg-gradient-to-br from-purple-50 to-pink-50 shadow-xl' 
                          : 'border-gray-200 hover:border-purple-300 hover:shadow-lg'
                      }`}
                    >
                      {service.popular && (
                        <div className="absolute -top-3 -right-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white px-3 py-1 rounded-full text-sm font-bold">
                          Most Popular
                        </div>
                      )}
                      
                      <div className="flex items-start mb-4">
                        <div className={`w-12 h-12 bg-gradient-to-br ${service.gradient} rounded-xl flex items-center justify-center mr-4`}>
                          <IconComponent className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-bold text-xl text-gray-800 mb-2">{service.name}</h3>
                          <p className="text-gray-600 mb-3">{service.description}</p>
                        </div>
                      </div>
                      
                      <ul className="space-y-1 mb-4">
                        {service.features.map((feature, index) => (
                          <li key={index} className="flex items-center text-sm text-gray-700">
                            <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${service.gradient} mr-2`}></div>
                            {feature}
                          </li>
                        ))}
                      </ul>
                      
                      <div className="flex justify-between items-center">
                        <div>
                          <div className={`text-2xl font-bold bg-gradient-to-r ${service.gradient} bg-clip-text text-transparent`}>
                            ${service.price}
                          </div>
                          <div className="text-sm text-gray-500 flex items-center">
                            <Clock className="w-4 h-4 mr-1" />
                            {service.duration}
                          </div>
                        </div>
                        
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                          isSelected 
                            ? 'border-purple-500 bg-purple-500' 
                            : 'border-gray-300'
                        }`}>
                          {isSelected && <Check className="w-4 h-4 text-white" />}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Add-ons */}
              <div className="mt-8 p-6 bg-gray-50 rounded-2xl">
                <h3 className="font-bold text-lg mb-4">Add-On Services</h3>
                <div className="grid md:grid-cols-3 gap-4">
                  {addOns.map((addon) => (
                    <div key={addon.id} className="flex items-center justify-between p-3 bg-white rounded-lg">
                      <div>
                        <div className="font-medium text-gray-800">{addon.name}</div>
                        <div className="text-purple-600 font-bold">${addon.price}</div>
                      </div>
                      <input type="checkbox" className="w-5 h-5 text-purple-600 rounded" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Date Selection */}
          {currentStep === 2 && (
            <div>
              <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">Select Your Date</h2>
              
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {dates.map((date, index) => {
                  const isSelected = selectedDate?.getTime() === date.getTime();
                  const isWeekend = date.getDay() === 0 || date.getDay() === 6;
                  
                  return (
                    <button
                      key={index}
                      onClick={() => setSelectedDate(date)}
                      disabled={isWeekend}
                      className={`p-4 rounded-xl text-center transition-all duration-300 ${
                        isWeekend
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : isSelected
                            ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-lg transform scale-105'
                            : 'bg-white border-2 border-gray-200 hover:border-purple-300 hover:shadow-md'
                      }`}
                    >
                      <div className="font-bold text-lg">
                        {date.getDate()}
                      </div>
                      <div className="text-sm opacity-80">
                        {date.toLocaleDateString('en-US', { weekday: 'short' })}
                      </div>
                      <div className="text-xs opacity-60">
                        {date.toLocaleDateString('en-US', { month: 'short' })}
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="mt-6 p-4 bg-blue-50 rounded-xl flex items-start">
                <AlertCircle className="w-5 h-5 text-blue-600 mr-3 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-blue-800">
                  <strong>Please note:</strong> We're closed on Sundays. Weekend appointments (Saturdays) fill up quickly, so book in advance!
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Time Selection */}
          {currentStep === 3 && (
            <div>
              <h2 className="text-3xl font-bold text-gray-800 mb-4 text-center">Choose Your Time</h2>
              <p className="text-center text-gray-600 mb-8">
                Available times for {selectedDate ? formatDate(selectedDate) : ''}
              </p>
              
              <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {timeSlots.map((time) => {
                  const isSelected = selectedTime === time;
                  const isBooked = Math.random() > 0.7; // Simulate some booked slots
                  
                  return (
                    <button
                      key={time}
                      onClick={() => !isBooked && setSelectedTime(time)}
                      disabled={isBooked}
                      className={`p-3 rounded-xl text-center font-medium transition-all duration-300 ${
                        isBooked
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : isSelected
                            ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-lg transform scale-105'
                            : 'bg-white border-2 border-gray-200 hover:border-purple-300 hover:shadow-md'
                      }`}
                    >
                      {formatTime(time)}
                      {isBooked && <div className="text-xs mt-1">Booked</div>}
                    </button>
                  );
                })}
              </div>

              <div className="mt-6 p-4 bg-purple-50 rounded-xl">
                <h4 className="font-bold text-purple-800 mb-2">Selected Service Details:</h4>
                <div className="text-sm text-purple-700">
                  <p><strong>{selectedService?.name}</strong> - {selectedService?.duration}</p>
                  <p>Please arrive 10 minutes early for your appointment.</p>
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Client Information */}
          {currentStep === 4 && (
            <div>
              <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">Your Information</h2>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    First Name *
                  </label>
                  <input
                    type="text"
                    value={clientInfo.firstName}
                    onChange={(e) => setClientInfo({...clientInfo, firstName: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Enter your first name"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Last Name *
                  </label>
                  <input
                    type="text"
                    value={clientInfo.lastName}
                    onChange={(e) => setClientInfo({...clientInfo, lastName: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Enter your last name"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    value={clientInfo.email}
                    onChange={(e) => setClientInfo({...clientInfo, email: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="your@email.com"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    value={clientInfo.phone}
                    onChange={(e) => setClientInfo({...clientInfo, phone: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="(555) 123-4567"
                  />
                </div>
              </div>

              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Have you had lash extensions before?
                </label>
                <div className="flex gap-4">
                  <button
                    onClick={() => setClientInfo({...clientInfo, isNewClient: true})}
                    className={`px-6 py-2 rounded-full font-medium transition-all duration-300 ${
                      clientInfo.isNewClient
                        ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    First time
                  </button>
                  <button
                    onClick={() => setClientInfo({...clientInfo, isNewClient: false})}
                    className={`px-6 py-2 rounded-full font-medium transition-all duration-300 ${
                      !clientInfo.isNewClient
                        ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Returning client
                  </button>
                </div>
              </div>

              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Any allergies or sensitivities?
                </label>
                <textarea
                  value={clientInfo.allergies}
                  onChange={(e) => setClientInfo({...clientInfo, allergies: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  rows="3"
                  placeholder="Please list any known allergies or sensitivities..."
                />
              </div>

              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Special requests or preferences?
                </label>
                <textarea
                  value={clientInfo.specialRequests}
                  onChange={(e) => setClientInfo({...clientInfo, specialRequests: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  rows="3"
                  placeholder="Any specific requests for your lash look or appointment..."
                />
              </div>

              {/* Appointment Summary */}
              <div className="mt-8 bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-6">
                <h4 className="font-bold text-gray-800 mb-4 flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                  Appointment Summary
                </h4>
                <div className="space-y-2">
                  <p><span className="font-medium">Service:</span> {selectedService?.name}</p>
                  <p><span className="font-medium">Date:</span> {selectedDate ? formatDate(selectedDate) : ''}</p>
                  <p><span className="font-medium">Time:</span> {selectedTime ? formatTime(selectedTime) : ''}</p>
                  <p><span className="font-medium">Duration:</span> {selectedService?.duration}</p>
                  <p><span className="font-medium">Total:</span> <span className="text-2xl font-bold text-purple-600">${selectedService?.price}</span></p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between items-center">
          <button
            onClick={handlePrev}
            disabled={currentStep === 1}
            className={`flex items-center px-6 py-3 rounded-full font-medium transition-all duration-300 ${
              currentStep === 1
                ? 'text-gray-400 cursor-not-allowed'
                : 'text-purple-600 hover:bg-purple-50'
            }`}
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back
          </button>

          {currentStep === 4 ? (
            <button
              onClick={handleSubmit}
              disabled={!canProceed() || isSubmitting}
              className={`flex items-center px-8 py-4 rounded-full font-bold text-lg transition-all duration-300 ${
                canProceed() && !isSubmitting
                  ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white hover:shadow-xl transform hover:scale-105'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {isSubmitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Booking...
                </>
              ) : (
                <>
                  <CreditCard className="w-5 h-5 mr-2" />
                  Confirm Booking
                </>
              )}
            </button>
          ) : (
            <button
              onClick={handleNext}
              disabled={!canProceed()}
              className={`flex items-center px-8 py-4 rounded-full font-bold text-lg transition-all duration-300 ${
                canProceed()
                  ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white hover:shadow-xl transform hover:scale-105'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              Next
              <ArrowRight className="w-5 h-5 ml-2" />
            </button>
          )}
        </div>

        {/* Contact Info */}
        <div className="mt-12 text-center">
          <p className="text-gray-600 mb-4">Need help with booking?</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 text-sm text-gray-500">
            <div className="flex items-center">
              <Phone className="w-4 h-4 mr-2" />
              <span>Call (555) 123-4567</span>
            </div>
            <div className="flex items-center">
              <Mail className="w-4 h-4 mr-2" />
              <span>hello@lashesbysarah.com</span>
            </div>
            <div className="flex items-center">
              <MapPin className="w-4 h-4 mr-2" />
              <span>123 Beauty Lane, City, ST</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingSystem;