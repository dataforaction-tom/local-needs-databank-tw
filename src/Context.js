import React from 'react';
import { Route, Routes } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import Card from './Card';
import LocalAuthoritiesMap from './components/Map';
import Map2 from './components/Map2';

const Context = () => {
    const cardData = [
        {
          title: 'Title',
          value: 'Value',
          description: 'Description',
          
        },
        {
          title: 'Title',
          value: 'Value',
          description: 'Description',
          
        },
        {
          title: 'Title',
          value: 'Value',
          description: 'Description',
          
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
        <h1 className='font-bold text-4xl text-center'> Dashboard under construction</h1>
        <Map2 datasetId={55} />
        </div>
        
      );
    };

export default Context;
