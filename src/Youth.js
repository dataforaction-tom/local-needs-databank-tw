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
        globalbackgroundColor={backgroundColor}    />

<Dashboard dashboardId={20} 
        defaultChartType='line' 
        startColor="orange"  // Custom starting color
        endColor="#662583"
        globalbackgroundColor={backgroundColor}    />

<Dashboard dashboardId={21} 
        defaultChartType='line' 
        startColor="orange"  // Custom starting color
        endColor="#662583"
        globalbackgroundColor={backgroundColor}    />

<Dashboard dashboardId={19} 
        defaultChartType='line' 
        startColor="orange"  // Custom starting color
        endColor="#662583"
        globalbackgroundColor={backgroundColor}      />

<Dashboard dashboardId={22} 
        defaultChartType='line' 
        startColor="orange"  // Custom starting color
        endColor="#662583"
        globalbackgroundColor={backgroundColor}    />
        
        <TimeSeriesDashboard dashboardId={23} />
        <SingleChartDashboard dashboardId={24} />
        
        
        </div>
      );
    };

export default Youth;
