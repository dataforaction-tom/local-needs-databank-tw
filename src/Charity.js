import React from 'react';
import { Route, Routes } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import Card from './Card';
import LocalAuthoritiesMap from './components/Map';
import LocalAuthorityMap23 from './components/Map23';

import TimeSeriesDashboard from './components/TimeSeriesDashboard';

import CategoryChartDashboard from './components/CategoryChartDashboard';
import {  FaBookOpen } from 'react-icons/fa';

const Charity = () => {
    const cardData = [
        {
          title: 'Number of Charities',
          value: '163,959',
          description: 'In the UK in 20/21',
          
        },
        {
          title: 'Number of employees',
          value: '961,855',
          description: 'In the UK charity sector 20/21',
          
        },
        {
          title: 'Number of months',
          value: '6.9',
          description: 'An average UK charity can operate on their reserves',
          
        },
      ];

      const backgroundColor = '#C7215D'; // Example color

      return (
        <div>
        <div className="">
        <div className="text-sm font-bold text-gray-800 mt-2 mb-3 flex items-end flex justify-end mr-5 mt-5">
                <FaBookOpen className="text-[#662583] mr-2" size="2em" />
                Charity Sector Dashboard
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
        <Dashboard dashboardId={9}
        globalbackgroundColor={backgroundColor} endColor={backgroundColor}   /> 
        
        <TimeSeriesDashboard dashboardId={10}
        globalbackgroundColor={backgroundColor}    /> 
        <div className='flex flex-col md:flex-row justify-center items-center gap-4'>
        <div className='w-full md:w-1/2 p-2'>
        <TimeSeriesDashboard dashboardId={11}
        globalbackgroundColor={backgroundColor}    /> 
        </div>
        <div className='w-full md:w-1/2 p-2'>
        <TimeSeriesDashboard dashboardId={11} defaultChartType='pie' globalbackgroundColor={backgroundColor}    />
        </div>
        </div>
        <CategoryChartDashboard dashboardId={12} globalbackgroundColor={backgroundColor}    /> 
        <Dashboard dashboardId={13} globalbackgroundColor={backgroundColor} endColor={backgroundColor}   /> 
        <Dashboard dashboardId={16} globalbackgroundColor={backgroundColor} endColor={backgroundColor}   /> 
        
        </div>
      );
    };

export default Charity;
