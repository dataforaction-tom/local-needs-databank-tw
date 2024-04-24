import React from 'react';
import { Route, Routes } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import Card from './Card';
import LocalAuthoritiesMap from './components/Map';

import TimeSeriesDashboard from './components/TimeSeriesDashboard';

const Advice = () => {
    const cardData = [
        {
          title: 'Number of food parcels',
          value: '2.98m',
          description: 'Distributed by Trussell Trust',
          
        },
        {
          title: 'Unique clients',
          value: '1.66m',
          description: 'Supported by Citizens Advice network',
          
        },
        {
          title: 'Children supported',
          value: '5780',
          description: 'By Buttle Uk in 2022/23',
          
        },
      ];

      const backgroundColor = '#881866'; // Example color

      

      return (
        <div>
        <div className="">
          
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
        <Dashboard dashboardId={2} />
        <LocalAuthoritiesMap dashboardId={4} />
        </div>
      );
    };

export default Advice;
