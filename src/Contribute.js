import React from 'react';
import CSVUploadComponent from './components/CSVUploadComponent'; 
import { FaPlusCircle } from 'react-icons/fa';

const Contribute = () => {
  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="text-sm font-bold text-gray-800 mt-2 mb-3 flex items-end flex justify-end mr-5 mt-5">
                <FaPlusCircle className="text-[#662583] mr-2" size="2em" />
                Contribute Dashboard
            </div>
      
            <div className="w-9/10 mx-auto bg-slate-50 p-6">
            <div className='text-2xl font-bold my-2'>
            <h2>Local Needs Databank Contribution page</h2>
            <div className='text-lg font-normal'>
            <p>Welcome to the Local Needs Databank contribution page. Here you can contribute data to the databank using this tool following our data standard. </p>
            <p>By contributing to the Databank you are sharing your data and observations openly.</p>
            <p>We have tried to make this process as easy and flexible as possible, allowing you to tell use which of you columns match our data structure.</p>
            <br></br>
            <p className='font-bold text-red-500'>While we are in the beta testing phase we are assigning authentication for uploads. Please get in touch if you want to contribute data and we will provide you with authentication</p>
            <br></br>
            <p>You can still test the general functionality without an authentication code, so feel free to drop in a csv, it won't go anywhere</p>
            <div className='mt-5'><p>To view our draft interim data standard please go <a href='https://dataforaction.notion.site/Draft-data-standard-cd8662fe721b4552a91427969dbb7824' title="Local Needs Databank Draft Data Standard" className="text-pink-500 font-bold" rel="noreferrer" target="_blank">here</a></p></div>
            <div className='mt-5'><p>To view additional details about what we are looking for from data contributors please click <a href='https://dataforaction.notion.site/NPC-local-Needs-Databank-upload-tool-documentation-1c00226fab2e4894a6826573ae10af1e' title="Additional details for data contributors" className="text-pink-500 font-bold" rel="noreferrer" target="_blank">here</a></p></div>
            </div>
            
            </div>
        <div className="bg-gray-100">
          <CSVUploadComponent />
        </div>
      </div>
      </div>
   
  );
};


export default Contribute;
