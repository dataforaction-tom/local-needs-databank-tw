import React from 'react';

const Card = ({ title, description, value }) => {
  return (
    <div className="flex flex-col justify-between h-full p-4 bg-[#662583] text-white rounded shadow-lg">
      <h2 className="text-xl font-semibold">{title}</h2>
      <div className="text-center text-4xl font-bold">{value}</div>
      <p className="flex-1">{description}</p>
      
    </div>
  );
};

export default Card;
