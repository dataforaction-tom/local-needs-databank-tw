import React from 'react';
import CSVUploadComponent from './CSVUploadComponent'; // adjust the path as necessary

const Contribute = () => {
  return (
    <div className="container mx-auto px-4">
      <h1 className="text-xl font-semibold text-gray-800 my-4">Contribute Data</h1>
      <CSVUploadComponent />
    </div>
  );
};

export default Contribute;
