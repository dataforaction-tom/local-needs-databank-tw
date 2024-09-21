import React, { useState } from 'react';
import { MdOutlineSportsGymnastics } from "react-icons/md";
import Dashboard from './components/Dashboard';
import DashboardnoMap from './components/Dashboard-no-map';
import Card from './Card';
import TimeSeriesDashboard from './components/TimeSeriesDashboard';
import SingleChartDashboard from './components/SingleChartDashboard';
import DashboardSingleChart from './components/DashboardSingleChart';

const Youth = () => {
  const [datasetsMetadata, setDatasetsMetadata] = useState([]);

  const handleDatasetMetadata = (newDatasets) => {
    setDatasetsMetadata((prevDatasets) => {
      const updatedDatasets = [...prevDatasets];

      // metadata is inserted in order of appearanace
      newDatasets.forEach(newDataset => {
        const existingIndex = updatedDatasets.findIndex(dataset => dataset.value === newDataset.value);
        if (existingIndex === -1) {
          updatedDatasets.push(newDataset); 
        }
      });

      return updatedDatasets;
    });
  };

  const cardData = [
    {
      title: 'Of young people',
      value: '84%',
      description: 'believe looking after the environment is important',
      source: "*Children's People and Nature Survey 2023"
    },
    {
      title: 'Of all children',
      value: '16.9%',
      description: 'live in food insecure households',
      source: '*Households below average income (HBAI) statistics 2023'
    },
    {
      title: 'Of adolescents',
      value: '11%',
      description: "reported low scores of life satisfaction which classified them as ‘suffering’ in 2022",
      source: '*HBSC survey 2022'
    }
  ];

  const backgroundColor = '#EE4023';

  return (
    <div>
      <div className="text-sm font-bold text-gray-800 mt-2 mb-3 flex items-end justify-end mr-5 mt-5">
        <MdOutlineSportsGymnastics className="text-[#EE4023] mr-2" size="2em" />
        Youth Dashboard
      </div>

      <div className="flex flex-row justify-between flex-wrap -mx-2 p-5 text-center">
        {cardData.map((card, index) => (
          <div className="px-2 w-full md:w-1/3" key={index}>
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

      
      <Dashboard
        dashboardId={19}
        defaultChartType="line"
        startColor="orange"
        endColor="#662583"
        globalbackgroundColor={backgroundColor}
        passDatasetMetadata={handleDatasetMetadata}
      />

      <DashboardnoMap
        dashboardId={18}
        defaultChartType="line"
        startColor="orange"
        endColor="#662583"
        globalbackgroundColor={backgroundColor}
        passDatasetMetadata={handleDatasetMetadata}
      />

      <TimeSeriesDashboard
        dashboardId={23}
        passDatasetMetadata={handleDatasetMetadata}
      />

      <SingleChartDashboard
        dashboardId={24}
        passDatasetMetadata={handleDatasetMetadata}
      />

      <DashboardnoMap
        dashboardId={21}
        defaultChartType="line"
        startColor="orange"
        endColor="#662583"
        globalbackgroundColor={backgroundColor}
        passDatasetMetadata={handleDatasetMetadata}
      />

      <DashboardSingleChart
        dashboardId={22}
        defaultChartType="line"
        startColor="orange"
        endColor="#662583"
        globalbackgroundColor={backgroundColor}
        passDatasetMetadata={handleDatasetMetadata}
        baseline={15.9}
      />

      <DashboardnoMap
        dashboardId={20}
        defaultChartType="line"
        startColor="orange"
        endColor="#662583"
        globalbackgroundColor={backgroundColor}
        passDatasetMetadata={handleDatasetMetadata}
      />

      {/* Datasets Metadata Table */}
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
                  Dataset License
                </th>
                <th className="px-3 py-3 text-left text-xs font-bold uppercase tracking-wider text-gray-700">
                  Dataset Owner
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
                    {dataset.license}
                  </td>
                  <td className="px-3 py-4 text-sm text-gray-900 font-semibold whitespace-nowrap border border-gray-200">
                    {dataset.owner}
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
