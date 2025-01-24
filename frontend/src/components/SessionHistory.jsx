import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { auth } from '../firebase';
import { ClipboardList, Calendar, Clock, User, ChevronDown, ChevronUp, Tag, Download } from 'lucide-react';
import API_CONFIG from '../config/api.js';
import { utils, writeFile } from 'xlsx-js-style';
import { toast } from 'react-hot-toast';
import { getDocs, query, collection, where, orderBy } from 'firebase/firestore';
import { db } from '../firebase';

const SessionHistory = ({ role, peerCounselors }) => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userNames, setUserNames] = useState({});
  const [expandedSessions, setExpandedSessions] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    const fetchSessionHistory = async () => {
      try {
        const token = await auth.currentUser.getIdToken();
        const response = await axios.get(
          `${API_CONFIG.BASE_URL}/api/sessions/${auth.currentUser.uid}`,
          {
            params: { role },
            headers: { 
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            withCredentials: true
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

  const addLogoToSheet = (ws) => {

    // Add company name next to logo
    utils.sheet_add_aoa(ws, [['iPeer Counseling Session History']], {
      origin: 'C1'
    });
    
    // Style company name
    const titleCell = ws['C1'];
    titleCell.s = {
      font: { bold: true, size: 20, color: { rgb: "2D3748" } },
      alignment: { horizontal: "left" }
    };

    return 3; // Number of rows used by header/logo
  };

  const handleExport = async () => {
    try {
      // Add style definitions here
      const headerStyle = {
        font: { bold: true, color: { rgb: "FFFFFF" } },
        fill: { fgColor: { rgb: "2D3748" } },
        alignment: { horizontal: "center" },
        border: {
          top: { style: "thin", color: { rgb: "000000" } },
          bottom: { style: "thin", color: { rgb: "000000" } },
          left: { style: "thin", color: { rgb: "000000" } },
          right: { style: "thin", color: { rgb: "000000" } }
        }
      };

      // Add this inside the handleExport function, before the Object.entries loop
      const dataStyle = {
        font: { name: "Calibri", sz: 11 },
        alignment: { vertical: "top" },
        border: {
          top: { style: "thin", color: { rgb: "E2E8F0" } },
          bottom: { style: "thin", color: { rgb: "E2E8F0" } },
          left: { style: "thin", color: { rgb: "E2E8F0" } },
          right: { style: "thin", color: { rgb: "E2E8F0" } }
        }
      };

      if (!sessions.length) {
        toast.error('No sessions to export');
        return;
      }

      // Sort sessions from newest to oldest
      const sortedSessions = [...sessions].sort(
        (a, b) => new Date(b.startTime) - new Date(a.startTime) // Reverse the sort order
      );

      // Group sessions by date
      const groupedSessions = sortedSessions.reduce((acc, session) => {
        const dateKey = new Date(session.startTime).toISOString().split('T')[0];
        if (!acc[dateKey]) {
          acc[dateKey] = {
            sessions: [],
            total: 0
          };
        }
        acc[dateKey].sessions.push(session);
        acc[dateKey].total++;
        return acc;
      }, {});

      // Create workbook
      const wb = utils.book_new();
      const ws = utils.json_to_sheet([]);
      
      // Add logo and header
      const logoRowsUsed = addLogoToSheet(ws);
      let currentRow = logoRowsUsed + 1; // Start after logo

      // Define headers
      const headers = [
        "Date",
        "Start Time",
        "End Time", 
        "Session Type",
        "Participant",
        "Notes"
      ];

      // Add headers below logo
      utils.sheet_add_aoa(ws, [headers], { origin: `A${logoRowsUsed + 1}` });

      let grandTotal = 0;

      // Add grouped data with date headers and totals
      Object.entries(groupedSessions).forEach(([date, dayData]) => {
        // Add date header value
        utils.sheet_add_aoa(ws, [[date]], { 
          origin: { r: currentRow, c: 0 } // Use cell coordinates instead of encoded string
        });

        // Then add the merge and styling
        if (!ws['!merges']) ws['!merges'] = [];
        ws['!merges'].push({
          s: { r: currentRow, c: 0 },
          e: { r: currentRow, c: headers.length - 1 }
        });

        const dateCell = utils.encode_cell({ r: currentRow, c: 0 });
        ws[dateCell].s = {
          font: { bold: true, color: { rgb: "FFFFFF" } },
          fill: { fgColor: { rgb: "4A5568" } },
          alignment: { horizontal: "center" }
        };

        currentRow++;

        // Add sessions
        dayData.sessions.forEach(session => {
          const rowData = [
            new Date(session.startTime),
            new Date(session.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            new Date(session.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            session.type || 'General Counseling',
            getUserName(session),
            session.notes || ''
          ];
          utils.sheet_add_aoa(ws, [rowData], { 
            origin: utils.encode_cell({ r: currentRow, c: 0 }) 
          });
          currentRow++;
        });

        // Add daily total
        utils.sheet_add_aoa(ws, [
          [`Daily Total: ${dayData.total} sessions`]
        ], { 
          origin: { r: currentRow, c: 0 } 
        });

        // Style the daily total row
        const dailyTotalCell = utils.encode_cell({ r: currentRow, c: 0 });
        ws[dailyTotalCell].s = {
          font: { bold: true, color: { rgb: "2D3748" } },
          fill: { fgColor: { rgb: "E2E8F0" } }
        };

        // Merge cells for daily total
        if (!ws['!merges']) ws['!merges'] = [];
        ws['!merges'].push({
          s: { r: currentRow, c: 0 },
          e: { r: currentRow, c: headers.length - 1 }
        });

        grandTotal += dayData.total;
        currentRow++;
      });

      // Add grand total
      if (!ws['!merges']) ws['!merges'] = [];
      ws['!merges'].push({
        s: { r: currentRow, c: 0 },
        e: { r: currentRow, c: headers.length - 1 }
      });

      // Add this code to create the cell first
      utils.sheet_add_aoa(ws, [
        [`GRAND TOTAL: ${grandTotal} sessions`]
      ], { 
        origin: { r: currentRow, c: 0 } // Create cell at currentRow, column 0
      });

      // Then apply merge and styling
      if (!ws['!merges']) ws['!merges'] = [];
      ws['!merges'].push({
        s: { r: currentRow, c: 0 },
        e: { r: currentRow, c: headers.length - 1 }
      });

      const grandTotalCell = utils.encode_cell({ r: currentRow, c: 0 });
      ws[grandTotalCell].s = {
        font: { bold: true, color: { rgb: "FFFFFF" } },
        fill: { fgColor: { rgb: "50B498" } },
        alignment: { horizontal: "center" }
      };

      // Hide the first date column (already shown in header rows)
      ws['!cols'] = [
        { hidden: true }, // Hide date column
        { wch: 10 },      // Start Time
        { wch: 10 },      // End Time
        { wch: 20 },      // Session Type
        { wch: 25 },      // Participant
        { wch: 40 }       // Notes
      ];

      // Adjust auto-filter range
      ws['!autofilter'] = { ref: `A${logoRowsUsed + 1}:F${currentRow}` };

      // Add Firestore room entries processing
      const roomQuery = query(
        collection(db, 'roomEntries'),
        orderBy('timestamp', 'desc')
      );
      
      const roomEntries = await getDocs(roomQuery);
      console.log('Room entries metadata:', {
        size: roomEntries.size,
        empty: roomEntries.empty,
        query: roomQuery
      });

      if (roomEntries.empty) {
        console.warn('No room entries found for user:', auth.currentUser.uid);
        toast('No room usage data available', { icon: 'ℹ️' });
        return;
      }

      // Process room entries into roomStats
      const roomStats = roomEntries.docs.reduce((acc, doc) => {
        const data = doc.data();
        console.log('[DEBUG] Raw Firestore doc:', data);

        // Validate required fields
        if (!data.timestamp) {
          console.error('Missing timestamp in document:', doc.id);
          return acc;
        }
        
        // Convert timestamp with fallbacks
        const timestamp = data.timestamp?.toDate?.() || 
                         new Date(data.timestamp?.seconds * 1000 || Date.now());
        
        if (isNaN(timestamp)) {
          console.error('Invalid timestamp:', data.timestamp);
          return acc;
        }

        const date = timestamp.toISOString().split('T')[0];
        const roomName = data.roomName || 'Unknown Room';

        console.log(`[PROCESSING] ${date} - ${roomName}`);

        if (!acc[date]) {
          acc[date] = { total: 0, rooms: new Map() };
          console.log(`[NEW DATE] Created entry for ${date}`);
        }

        const currentCount = acc[date].rooms.get(roomName) || 0;
        acc[date].rooms.set(roomName, currentCount + 1);
        acc[date].total++;

        console.log(`[COUNT] ${roomName}: ${currentCount + 1}`);
        
        return acc;
      }, {});

      // After processing, add validation
      console.log('[FINAL] roomStats:', JSON.stringify(roomStats, (key, value) => {
        if (value instanceof Map) return Array.from(value.entries());
        return value;
      }, 2));

      // Convert to sorted array format
      const sortedRoomStats = Object.entries(roomStats)
        .sort(([dateA], [dateB]) => dateB.localeCompare(dateA))
        .map(([date, { total, rooms }]) => ({
          date,
          total,
          rooms: Array.from(rooms.entries())
        }));

      // Create Room Usage sheet
      const roomWs = utils.json_to_sheet([]);
      const roomHeaders = ['Date', 'Room Name', 'Entries'];
      
      // Add room usage data
      utils.sheet_add_aoa(roomWs, [roomHeaders], { origin: 'A1' });
      let roomRow = 2;
      let roomGrandTotal = 0;
      const roomTotals = {};

      sortedRoomStats.forEach(({ date, total, rooms }) => {
        // Add date header
        utils.sheet_add_aoa(roomWs, [[date]], { origin: `A${roomRow}` });
        roomWs[`A${roomRow}`].s = headerStyle;
        utils.sheet_add_aoa(roomWs, [['All Rooms', total]], { origin: `B${roomRow}` });
        roomWs[`B${roomRow}`].s = dataStyle;
        roomWs[`C${roomRow}`].s = dataStyle;
        roomRow++;

        // Add individual rooms
        rooms.forEach(([room, count]) => {
          utils.sheet_add_aoa(roomWs, [[date, room, count]], { origin: `A${roomRow}` });
          roomTotals[room] = (roomTotals[room] || 0) + count;
          roomGrandTotal += count;
          roomRow++;
        });
        
        // Add empty row between dates
        roomRow++;
      });

      // Add grand totals
      utils.sheet_add_aoa(roomWs, [['GRAND TOTAL', '', roomGrandTotal]], { origin: `A${roomRow}` });
      Object.entries(roomTotals).forEach(([room, total]) => {
        utils.sheet_add_aoa(roomWs, [[room, total]], { origin: `B${roomRow + 1}` });
        roomRow++;
      });

      // Style room usage sheet
      roomWs['!cols'] = [
        { wch: 12 }, // Date
        { wch: 25 }, // Room Name
        { wch: 10 }  // Entries
      ];

      // Add before writing file
      console.log('Final worksheet data:',
        utils.sheet_to_json(roomWs, { header: 1 })
      );

      // Add both sheets to workbook
      utils.book_append_sheet(wb, ws, "Session History");
      utils.book_append_sheet(wb, roomWs, "Room Usage");
      
      // Save file
      writeFile(wb, `Session_History_${new Date().toISOString().split('T')[0]}.xlsx`);
      
      toast.success('Session history exported with totals!');
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to generate comprehensive report');
    }
  };

const filteredSessions = sessions.filter(session => {
  const userName = getUserName(session).toLowerCase();
  const sessionDate = new Date(session.startTime).toLocaleDateString().toLowerCase();
  const search = searchTerm.toLowerCase();

  return userName.includes(search) || sessionDate.includes(search);
});

const Pagination = ({ currentPage, setCurrentPage, totalPages }) => (
  <div className="flex justify-center mt-6 gap-2">
    {Array.from({ length: totalPages }, (_, i) => (
      <button
        key={i + 1}
        onClick={() => setCurrentPage(i + 1)}
        className={`px-4 py-2 rounded-lg transition-all ${
          currentPage === i + 1
            ? 'bg-[#50B498] text-white'
            : 'bg-white border-2 border-[#9CDBA6]/20 text-[#4A5568] hover:border-[#9CDBA6]/50'
        }`}
      >
        {i + 1}
      </button>
    ))}
  </div>
);

const indexOfLastItem = currentPage * itemsPerPage;
const indexOfFirstItem = indexOfLastItem - itemsPerPage;
const currentSessions = filteredSessions.slice(indexOfFirstItem, indexOfLastItem);
const totalPages = Math.ceil(filteredSessions.length / itemsPerPage);

  if (loading) return <div className="text-center text-gray-600 py-4">Loading sessions...</div>;
  if (error) return <div className="text-center text-red-500 py-4">{error}</div>;
  
  return (
    <div className="bg-transparent">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-[#2D3748]">Session History</h2>
        <button
          onClick={handleExport}
          className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
        >
          <Download className="w-4 h-4" />
          Export to Excel
        </button>
      </div>
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
      ) : filteredSessions.length === 0 ? (
        <div className="text-center text-gray-500 bg-white rounded-lg p-6 shadow-sm">
          <div className="text-lg font-medium mb-2">No results found</div>
          <div className="text-sm">Try adjusting your search terms</div>
        </div>
      ) : (
        <div className="space-y-4">
          {currentSessions.map((session) => (
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
          <Pagination currentPage={currentPage} setCurrentPage={setCurrentPage} totalPages={totalPages} />
        </div>
      )}
    </div>
  );  
};

export default SessionHistory;
