import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { auth } from '../firebase';
import { ClipboardList, Calendar, Clock, User } from 'lucide-react';

const SessionHistory = ({ role, peerCounselors }) => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userNames, setUserNames] = useState({});

  useEffect(() => {
    const fetchSessionHistory = async () => {
      try {
        const token = await auth.currentUser.getIdToken();
        const response = await axios.get(
          `http://localhost:5000/api/sessions/${auth.currentUser.uid}`,
          {
            params: { role },
            headers: { Authorization: `Bearer ${token}` }
          }
        );
        setSessions(response.data);

        // Fetch names for each session
        const fetchNames = response.data.map(async (session) => {
          const userId = role === 'client' ? session.counselorId : session.clientId;
          if (userId && !userNames[userId]) {
            const endpoint = role === 'client' 
              ? `/api/peer-counselors/${userId}`
              : `/api/client/${userId}`;
            try {
              const nameResponse = await axios.get(`http://localhost:5000${endpoint}`);
              setUserNames(prev => ({
                ...prev,
                [userId]: nameResponse.data.fullName
              }));
            } catch (error) {
              console.error('Error fetching name:', error);
            }
          }
        });

        await Promise.all(fetchNames);
      } catch (error) {
        setError('Failed to fetch session history');
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSessionHistory();
  }, [role]);
  
  const getUserLabel = () => role === 'client' ? 'Peer Counselor' : 'Client';

  const getUserName = (session) => {
    const userId = role === 'client' ? session.counselorId : session.clientId;
    return userNames[userId] || 'Loading...';
  };

  if (loading) return <div className="text-center py-4">Loading sessions...</div>;
  if (error) return <div className="text-center text-red-500 py-4">{error}</div>;

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-6">Session History</h2>
      {sessions.length === 0 ? (
        <div className="text-center text-gray-500">No session history available</div>
      ) : (
        <div className="space-y-4">
          {sessions.map((session) => (
            <div key={session.id} className="border rounded-lg p-4 hover:bg-gray-50">
              <div className="flex flex-col space-y-3">
                <div className="flex items-center text-gray-600">
                  <Calendar className="w-4 h-4 mr-2" />
                  <span>{new Date(session.startTime).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <Clock className="w-4 h-4 mr-2" />
                  <span>
                    {new Date(session.startTime).toLocaleTimeString()} - 
                    {new Date(session.endTime).toLocaleTimeString()}
                  </span>
                </div>
                <div className="flex items-center text-gray-600">
                  <User className="w-4 h-4 mr-2" />
                  <span>{getUserLabel()}: {getUserName(session)}</span>
                </div>
                {role === 'peer-counselor' && session.notes && (
                  <div className="mt-2 bg-gray-50 p-3 rounded-md">
                    <div className="flex items-start text-gray-600">
                      <ClipboardList className="w-4 h-4 mr-2 mt-1" />
                      <p className="whitespace-pre-wrap text-sm">{session.notes}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SessionHistory;