// Card.js
import React from 'react';

const Card = ({ title, description, value, backgroundColor, source }) => {
  return (
    <div className="flex flex-col justify-between h-full p-4 text-white rounded shadow-lg"
         style={{ backgroundColor: backgroundColor || '#662583' }}> {/* Fallback color */}
      <h2 className="text-xl font-semibold">{title}</h2>
      <div className="text-center text-4xl font-bold">{value}</div>
      <p className="flex-1">{description}</p>
      <p className='flex-1 italic'>{source}</p>
    </div>
  );
};

export default Card;