import React from 'react';
import { Route, Routes } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import Card from './Card';

import {  FaHandsHelping } from 'react-icons/fa';



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
        <div className="text-sm font-bold text-gray-800 mt-2 mb-3 flex items-end flex justify-end mr-5 mt-5">
                <FaHandsHelping className="text-[#662583] mr-2" size="2em" />
                Advice and Support Dashboard
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
        <Dashboard dashboardId={2} />
        
        <Dashboard dashboardId={14} />

        </div>
      );
    };

export default Advice;
