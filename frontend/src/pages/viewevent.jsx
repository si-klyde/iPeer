import React from 'react';
import { useLocation } from 'react-router-dom';

const ViewEvent = () => {
  const location = useLocation();
  const { event } = location.state || {};

  return (
    <div>
    
    </div>
  );
};

export default ViewEvent;
