import React from 'react';
import CSVUploadComponent from './components/CSVUploadComponent'; // adjust the path as necessary

const Contribute = () => {
  return (
    <div className="container mx-auto px-4 py-6">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-5">
          <h1 className="text-4xl font-semibold text-gray-800 mb-4 text-center">Contribute Data</h1>
          <p className="font-bold text-lg text-center mb-2">Welcome to the Local Needs Databank contribution page</p>
          <p className="font-bold text-lg text-center mb-6">Here you can contribute data to the databank using this tool following our data standard</p>
        </div>
        <div className="bg-gray-100 p-5">
          <CSVUploadComponent />
        </div>
      </div>
    </div>
  );
};


export default Contribute;
