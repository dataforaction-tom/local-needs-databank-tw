import React from 'react';
import CSVUploadComponent from './components/CSVUploadComponent'; 
import { FaPlusCircle } from 'react-icons/fa';

const Contribute = () => {
  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between my-6">
          <div className="flex items-center gap-2 text-gray-800">
            <FaPlusCircle className="text-[#662583]" size="1.5em" />
            <span className="font-bold text-lg">Contribute</span>
          </div>
          <button type="button" onClick={() => { const el = document.getElementById('download-error-report'); if (el) el.click(); }} className="text-sm text-[#662583] underline">Download error report</button>
        </div>

        <div className="bg-white border rounded-lg p-6 shadow-sm">
          <h2 className='text-2xl font-bold mb-2'>Local Needs Databank Contribution</h2>
          <p className='text-slate-700'>Upload a CSV and map your columns to our schema. You can fix common issues automatically and remove invalid rows before upload.</p>
          <div className='mt-3 text-sm text-slate-600'>
            During beta, uploads require an authentication code. Contact us to request one. You can still test the tool freely; nothing will be uploaded without a code.
          </div>
          <div className='mt-4 text-sm'>
            Draft data standard: <a href='https://dataforaction.notion.site/Draft-data-standard-cd8662fe721b4552a91427969dbb7824' className='text-[#C7215D] font-semibold' target='_blank' rel='noreferrer'>Read</a> · Contributor guide: <a href='https://dataforaction.notion.site/NPC-local-Needs-Databank-upload-tool-documentation-1c00226fab2e4894a6826573ae10af1e' className='text-[#C7215D] font-semibold' target='_blank' rel='noreferrer'>View</a>
          </div>
        </div>

        <div className="bg-gray-50 border rounded-lg mt-6">
          <CSVUploadComponent />
        </div>
      </div>
    </div>
   
  );
};


export default Contribute;
