import React from 'react';
import { useState } from 'react';
import { Route, Routes } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import Card from './Card';
import SingleChartDashboard from './components/SingleChartDashboard';
import { MdOutlineSportsGymnastics } from "react-icons/md";
import TimeSeriesDashboard from './components/TimeSeriesDashboard';

const Youth = () => {
  const [datasetsMetadata, setDatasetsMetadata] = useState([]);

  const handleDatasetMetadata = (newDatasets) => {
    setDatasetsMetadata((prevDatasets) => {
      const newEntries = newDatasets.filter(newDataset =>
        !prevDatasets.some(existingDataset => existingDataset.value === newDataset.value)
      );
      return [...prevDatasets, ...newEntries];
    });
  };
    const cardData = [
        {
          title: 'Of young people',
          value: '84%',
          description: 'Believe looking after the environment is important',
          source: "*Children's People and Nature Survey 2023"
          
        },
        {
          title: 'Of all Children',
          value: '16.9%',
          description: 'living in food insecure households ',
          source: '*Households below average income (HBAI) statistics'
          
        },
        {
          title: 'Of adolescents',
          value: '11%',
          description: "reported low scores for life satisfaction which classified them as ‘suffering’ in 2022",
          source: '*HBSC survey 2022'
          
        },
      ];

      const backgroundColor = '#EE4023';

      return (
        <div>
        <div className="">
        <div className="text-sm font-bold text-gray-800 mt-2 mb-3 flex items-end flex justify-end mr-5 mt-5">
                <MdOutlineSportsGymnastics className="text-[#EE4023] mr-2" size="2em" />
                Youth Dashboard
            </div>
          
          <div className="flex flex-row justify-between flex-wrap -mx-2 p-5 text-center">
            {cardData.map((card, index) => (
              <div className="px-2 w-full md:w-1/3 " key={index}>
                <Card
                  title={card.title}
                  description={card.description}
                  value={card.value}
                  backgroundColor={backgroundColor}
                  source={card.source}
                />
              </div>
            ))}
          </div>
          
        </div>
      
       
        <Dashboard dashboardId={18} 
        defaultChartType='line' 
        startColor="orange"  // Custom starting color
        endColor="#662583"
        globalbackgroundColor={backgroundColor}  passDatasetMetadata={handleDatasetMetadata}  />

<Dashboard dashboardId={20} 
        defaultChartType='line' 
        startColor="orange"  // Custom starting color
        endColor="#662583"
        globalbackgroundColor={backgroundColor}  passDatasetMetadata={handleDatasetMetadata}  />

<Dashboard dashboardId={21} 
        defaultChartType='line' 
        startColor="orange"  // Custom starting color
        endColor="#662583"
        globalbackgroundColor={backgroundColor}  passDatasetMetadata={handleDatasetMetadata}  />

<Dashboard dashboardId={19} 
        defaultChartType='line' 
        startColor="orange"  // Custom starting color
        endColor="#662583"
        globalbackgroundColor={backgroundColor}  passDatasetMetadata={handleDatasetMetadata}    />

<Dashboard dashboardId={22} 
        defaultChartType='line' 
        startColor="orange"  // Custom starting color
        endColor="#662583"
        globalbackgroundColor={backgroundColor}  passDatasetMetadata={handleDatasetMetadata}  />
        
        <TimeSeriesDashboard dashboardId={23} passDatasetMetadata={handleDatasetMetadata} />
        <SingleChartDashboard dashboardId={24} passDatasetMetadata={handleDatasetMetadata}/>


     
        <div className="p-5 my-5">
        <h2 className="text-xl font-bold">Datasets Used in this Dashboard</h2>
        <div className="overflow-x-auto shadow-md sm:rounded-lg">
          <table className="min-w-full divide-y divide-gray-200 bg-white">
            <thead className="bg-gray-50 sticky top-0 z-10">
              <tr>
                <th className="px-3 py-3 text-left text-xs font-bold uppercase tracking-wider text-gray-700">
                  Dataset Name
                </th>
                <th className="px-3 py-3 text-left text-xs font-bold uppercase tracking-wider text-gray-700">
                  Original URL
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {datasetsMetadata.map((dataset, index) => (
                <tr key={index} className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-100'}`}>
                  <td className="px-3 py-4 text-sm text-gray-900 font-semibold whitespace-nowrap border border-gray-200">
                    {dataset.label}
                  </td>
                  <td className="px-3 py-4 text-sm text-gray-900 font-semibold whitespace-nowrap border border-gray-200">
                    <a href={dataset.original_url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:text-blue-700">
                      {dataset.original_url}
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Youth;