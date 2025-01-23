import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { auth } from '../firebase';
import { ClipboardList, Calendar, Clock, User, ChevronDown, ChevronUp, Tag } from 'lucide-react';
import API_CONFIG from '../config/api.js';

const SessionHistory = ({ role, peerCounselors }) => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userNames, setUserNames] = useState({});
  const [expandedSessions, setExpandedSessions] = useState({});
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchSessionHistory = async () => {
      try {
        const token = await auth.currentUser.getIdToken();
        const response = await axios.get(
          `${API_CONFIG.BASE_URL}/api/sessions/${auth.currentUser.uid}`,
          {
            params: { role },
            headers: { Authorization: `Bearer ${token}` }
          }
        );
        setSessions(response.data);

        const fetchNames = response.data.map(async (session) => {
          const userId = role === 'client' ? session.counselorId : session.clientId;
          if (userId && !userNames[userId]) {
            const endpoint = role === 'client' 
              ? `/api/peer-counselors/${userId}`
              : `/api/client/${userId}`;
            try {
              const nameResponse = await axios.get(`${API_CONFIG.BASE_URL}${endpoint}`);
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

  const toggleNotes = (sessionId) => {
    setExpandedSessions(prev => ({
      ...prev,
      [sessionId]: !prev[sessionId]
    }));
  };

  const renderNotesSection = (session) => {
    if (role !== 'peer-counselor' || !session.notes) return null;
    
    return (
      <div className="mt-4">
        <button
          onClick={() => toggleNotes(session.id)}
          className="flex items-center text-[#50B498] hover:text-[#3d8b74] transition-colors duration-200"
        >
          <span className="mr-2">Session Notes</span>
          {expandedSessions[session.id] ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
        </button>
        
        {expandedSessions[session.id] && (
          <div className="mt-2 bg-[#E6F4EA] p-4 rounded-lg">
            <div className="flex items-start text-[#4A5568]">
              <ClipboardList className="w-5 h-5 mr-3 text-[#50B498] mt-1" />
              <p className="whitespace-pre-wrap text-sm leading-relaxed">{session.notes}</p>
            </div>
          </div>
        )}
      </div>
    );
  };

  const filteredSessions = sessions.filter(session => {
    const userName = getUserName(session).toLowerCase();
    const sessionDate = new Date(session.startTime).toLocaleDateString().toLowerCase();
    const search = searchTerm.toLowerCase();
    
    return userName.includes(search) || sessionDate.includes(search);
  });

  if (loading) return <div className="text-center text-gray-600 py-4">Loading sessions...</div>;
  if (error) return <div className="text-center text-red-500 py-4">{error}</div>;
  
  return (
    <div className="bg-transparent">
      <h2 className="text-xl font-semibold text-[#2D3748] mb-6">Session History</h2>
      <div className="relative mb-6">
        <input
          type="text"
          placeholder="Search by name or date..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-12 py-3 rounded-xl border-2 border-[#9CDBA6]/20 
          focus:border-[#9CDBA6] focus:ring-2 focus:ring-[#9CDBA6]/10 
          text-[#4A5568] placeholder-gray-400 shadow-sm bg-white
          hover:border-[#9CDBA6]/30 transition-all"
        />
        <svg 
          className="h-5 w-5 absolute left-4 top-1/2 -translate-y-1/2 text-[#50B498]" 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>
      {sessions.length === 0 ? (
        <div className="text-center text-gray-500 bg-white rounded-lg p-6 shadow-sm">No session history available</div>
      ) : (
        <div className="space-y-4">
          {filteredSessions.map((session) => (
            <div 
              key={session.id} 
              className="bg-white border border-[#9CDBA6]/20 rounded-xl p-6 hover:shadow-lg hover:border-[#9CDBA6]/50 transition-all duration-200"
            >
              <div className="flex flex-col space-y-4">
                <div className="flex items-center text-[#4A5568]">
                  <Calendar className="w-5 h-5 mr-3 text-[#50B498]" />
                  <span className="font-medium">{new Date(session.startTime).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center text-[#4A5568]">
                  <Tag className="w-5 h-5 mr-3 text-[#50B498]" />
                  <span className="font-medium">Session Type: {session.type || 'General Counseling'}</span>
                </div>
                <div className="flex items-center text-[#4A5568]">
                  <Clock className="w-5 h-5 mr-3 text-[#50B498]" />
                  <span className="font-medium">
                    {new Date(session.startTime).toLocaleTimeString()} - 
                    {new Date(session.endTime).toLocaleTimeString()}
                  </span>
                </div>
                <div className="flex items-center text-[#4A5568]">
                  <User className="w-5 h-5 mr-3 text-[#50B498]" />
                  <span className="font-medium">{getUserLabel()}: {getUserName(session)}</span>
                </div>
                {renderNotesSection(session)}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SessionHistory;
