import React from 'react';
import { Route, Routes } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import Card from './Card';
import SingleChartDashboard from './components/SingleChartDashboard';
import { MdOutlineSportsGymnastics } from "react-icons/md";
import TimeSeriesDashboard from './components/TimeSeriesDashboard';

const Youth = () => {
    const cardData = [
        {
          title: 'Something about youth',
          value: '£28.3m',
          description: 'Total Spend on Adult Social Care in England 2022-23',
          
        },
        {
          title: 'Grants to Voluntary Organisations',
          value: '£200k',
          description: 'Grants to Voluntary Organisations via LA for Health and Social Care',
          
        },
        {
          title: 'Requests for Support',
          value: '611k',
          description: 'Number of requests for support received from new clients 18-64 2022/23',
          
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
                />
              </div>
            ))}
          </div>
          
        </div>
      
       
        <Dashboard dashboardId={18} 
        defaultChartType='line' 
        startColor="orange"  // Custom starting color
        endColor="#662583"    />

<Dashboard dashboardId={19} 
        defaultChartType='line' 
        startColor="orange"  // Custom starting color
        endColor="#662583"    />
        
        
        
        </div>
      );
    };

export default Youth;
