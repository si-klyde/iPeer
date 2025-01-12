const { db } = require('../firebaseAdmin');

const TIME_SLOTS = [
    "08:00",
    "09:00",
    "10:00",
    "11:00",
    "13:00", // Starting after lunch break
    "14:00",
    "15:00",
    "16:00",
    "17:00",
    "18:00",
    "19:00",
    "20:00",
  ];
  
  const APPOINTMENT_DURATION = 60; // minutes
  
  const isTimeSlotAvailable = async (peerCounselorId, date, timeSlot) => {
    try {
      const appointmentsRef = db.collection('appointments');
      
      // Convert timeSlot to Date object for comparison
      const slotTime = new Date(`${date}T${timeSlot}`);
      const slotEndTime = new Date(slotTime.getTime() + APPOINTMENT_DURATION * 60000);
      
      // Get all appointments for the counselor on that date
      const appointments = await appointmentsRef
        .where('peerCounselorId', '==', peerCounselorId)
        .where('date', '==', date)
        .get();
      
      // Check if any existing appointment overlaps with the requested time slot
      for (const appointment of appointments.docs) {
        const aptData = appointment.data();
        const aptTime = new Date(`${aptData.date}T${aptData.time}`);
        const aptEndTime = new Date(aptTime.getTime() + APPOINTMENT_DURATION * 60000);
        
        // Check for overlap
        if (
          (slotTime >= aptTime && slotTime < aptEndTime) ||
          (slotEndTime > aptTime && slotEndTime <= aptEndTime)
        ) {
          return false;
        }
      }
      
      return true;
    } catch (error) {
      console.error('Error checking time slot availability:', error);
      throw error;
    }
  };
  
  const getAvailableTimeSlots = async (peerCounselorId, date) => {
    console.log('Checking availability for:', { peerCounselorId, date });
    const availableSlots = [];
    
    for (const slot of TIME_SLOTS) {
      const isAvailable = await isTimeSlotAvailable(peerCounselorId, date, slot);
      if (isAvailable) {
        availableSlots.push(slot);
      }
    }
    
    return availableSlots;
  };
  
  module.exports = {
    TIME_SLOTS,
    APPOINTMENT_DURATION,
    isTimeSlotAvailable,
    getAvailableTimeSlots
  };