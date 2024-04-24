import React from 'react';
import { Route, Routes } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import Card from './Card';
import LocalAuthoritiesMap from './components/Map';

import TimeSeriesDashboard from './components/TimeSeriesDashboard';

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
        <Dashboard dashboardId={9} />
        <LocalAuthoritiesMap dashboardId={4} />
        <TimeSeriesDashboard dashboardId={10} />
        <TimeSeriesDashboard dashboardId={11} />
        </div>
      );
    };

export default Charity;
