import React from 'react';

const Card = ({ title, description, value }) => {
  return (
    <div className="flex flex-col justify-between p-4 bg-[#662583] text-white rounded shadow-md">
      <h2 className="text-xl font-semibold">{title}</h2>
      
      <div className="text-center text-4xl font-bold">{value}</div>
      <p className="my-2">{description}</p>
    </div>
  );
};

export default Card;
