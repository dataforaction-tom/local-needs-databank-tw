import React from 'react';
import CSVUploadComponent from './components/CSVUploadComponent'; // adjust the path as necessary

const Contribute = () => {
  return (
    <div className="container mx-auto px-4">
      <h1 className="text-4xl font-semibold text-gray-800 my-4 text-center">Contribute Data</h1>
      <p className='font-bold text-lg text-center'>Welcome to the Local Needs Databank contribution page</p>
      <p className='font-bold text-lg text-center'>Here you can contribute data to the databank using this tool following our data standard</p>
      <CSVUploadComponent />
    </div>
  );
};

export default Contribute;
