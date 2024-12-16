const { db } = require('../firebaseAdmin');

const createEvent = async (eventData) => {
    const eventRef = db.collection('events').doc();
    await eventRef.set({
      ...eventData,
      createdAt: new Date()
    });
    return { eventId: eventRef.id };
  };
  
  const getEvents = async () => {
    const eventsSnapshot = await db.collection('events').get();
    return eventsSnapshot.docs.map(doc => 
      Object.assign({}, { id: doc.id }, doc.data())
    );
  };
  
  const updateEvent = async (eventId, eventData) => {
    const eventRef = db.collection('events').doc(eventId);
    await eventRef.update({
      ...eventData,
      updatedAt: new Date()
    });
  };
  
  const deleteEvent = async (eventId) => {
    await db.collection('events').doc(eventId).delete();
  };

  module.exports = {
    createEvent,
    getEvents,
    updateEvent,
    deleteEvent
  };
  