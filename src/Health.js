import React from 'react';
import { Route, Routes } from 'react-router-dom';
import Dashboard from './Dashboard';
import Card from './Card';
import LocalAuthoritiesMap from './Map';
import TimeObservationsChart from './TimeObservationsChart';
import TimeSeriesDashboard from './TimeSeriesDashboard';

const Health = () => {
    const cardData = [
        {
          title: 'Spend on Health and Social Care',
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
                />
              </div>
            ))}
          </div>
          
        </div>
        <TimeSeriesDashboard dashboardId={4} />
        <Dashboard dashboardId={1} />
        <LocalAuthoritiesMap />
        </div>
      );
    };

export default Health;
