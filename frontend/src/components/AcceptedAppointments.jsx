import React from 'react';

const AcceptedAppointments = ({ appointments, clients, peerCounselors, role }) => {
  const acceptedAppointments = appointments.filter(apt => apt.status === 'accepted');

  const getUserName = (appointment) => {
    if (role === 'client') {
      return peerCounselors[appointment.peerCounselorId] || 'Loading...';
    }
    return clients[appointment.clientId] || 'Loading...';
  };

  const getUserLabel = () => {
    return role === 'client' ? 'Peer Counselor' : 'Client';
  };
  return (
    <div className="space-y-4">
      {acceptedAppointments.length === 0 ? (
        <div className="text-center py-8 bg-white rounded-lg shadow-sm">
          <p className="text-gray-600">No accepted appointments</p>
        </div>
      ) : (
        acceptedAppointments.map((appointment) => (
          <div 
            key={appointment.id} 
            className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 p-6"
          >
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center">
                  <svg className="h-5 w-5 text-indigo-500 mr-2" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                    <path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className="text-gray-700 font-medium">{appointment.date}</span>
                </div>
                <div className="flex items-center">
                  <svg className="h-5 w-5 text-indigo-500 mr-2" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                    <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-gray-700 font-medium">{appointment.time}</span>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center">
                  <svg className="h-5 w-5 text-indigo-500 mr-2" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                    <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span className="text-gray-700">
                    {getUserLabel()}: {getUserName(appointment)}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-4">
              <p className="text-gray-600">
                <span className="font-medium">Description: </span>
                {appointment.description}
              </p>
            </div>

            {(() => {
              const now = new Date();
              const appointmentDateTime = new Date(`${appointment.date} ${appointment.time}`);
              const earliestJoinTime = new Date(appointmentDateTime.getTime() - 30 * 60000);
              const latestJoinTime = new Date(appointmentDateTime.getTime() + 30 * 60000);
              const isTimeToJoin = now >= earliestJoinTime && now <= latestJoinTime;
              const getCallMessage = (role, appointment) => {
                if (role === 'client') {
                  return `The call will be available 30 minutes before and after your scheduled time: ${appointment.date} ${appointment.time}. Don't be late—we're excited to connect with you! 😊`;
                }
                return `The call will be accessible 30 minutes before and after the scheduled time: ${appointment.date} ${appointment.time}. Please be ready to assist your client! 😊`;
              };

              return isTimeToJoin ? (
                <a
                  href={`/counseling/${appointment.roomId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  <svg className="h-5 w-5 mr-2" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                    <path d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  Join Video Call
                </a>
              ) : (
                <span className="mt-4 block text-gray-500 italic">
                  {getCallMessage(role, appointment)}
                </span>
              );
            })()}
          </div>
        ))
      )}
    </div>
  );
};

export default AcceptedAppointments;