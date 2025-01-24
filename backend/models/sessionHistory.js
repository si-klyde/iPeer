const { db, auth } = require('../firebaseAdmin');

const verifyUserToken = async (token) => {
    if (!token) throw new Error('No token provided');
    return await auth.verifyIdToken(token);
};

const validateSessionData = (sessionData) => {
    const required = ['roomId', 'clientId', 'counselorId', 'startTime', 'endTime'];
    const missing = required.filter(field => !sessionData[field]);
    
    if (missing.length > 0) {
        throw new Error(`Missing required fields: ${missing.join(', ')}`);
    }
    
    return true;
};

const createSession = async (sessionData, token) => {
    try {
        const decodedToken = await verifyUserToken(token);
        validateSessionData(sessionData);
        
        const sessionRef = db.collection('sessionsHistory').doc();
        await sessionRef.set({
            ...sessionData,
            createdBy: decodedToken.uid,
            createdAt: new Date(),
            updatedAt: new Date()
        });
        
        return sessionRef.id;
    } catch (error) {
        throw new Error(`Session creation failed: ${error.message}`);
    }
};

const getSessionHistory = async (userId, role, token) => {
    try {
        if (!['client', 'peer-counselor'].includes(role)) {
            throw new Error('Invalid role specified');
        }
        
        const decodedToken = await verifyUserToken(token);
        
        if (userId !== decodedToken.uid) {
            throw new Error('Unauthorized access');
        }

        const query = db.collection('sessionsHistory')
            .where(role === 'peer-counselor' ? 'counselorId' : 'clientId', '==', userId)
            .orderBy('startTime', 'desc');
        
        const snapshot = await query.get();
        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        
    } catch (error) {
        console.error(`Session history error: ${error.message}`);
        throw new Error(`Failed to retrieve session history: ${error.message}`);
    }
};

module.exports = {
    createSession,
    getSessionHistory
};