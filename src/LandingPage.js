// src/components/LandingPage.js
import React from 'react';

// Assuming your image is locally stored in the public folder or you have a URL
const backgroundImageUrl = '../public/6583_generated.jpg'; // Update with your actual image URL
const image = '../pu'

const LandingPage = () => {
    return (
        <div className="flex items-center justify-center min-h-screen"
        style={{ backgroundImage: `url(${backgroundImageUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <div className="w-full max-w-4xl p-5 bg-[#662583] text-white rounded-lg shadow-md overflow-hidden">
                <h1 className="text-4xl font-semibold  mb-4 text-center">Welcome to The Local Needs Databank</h1>
                <p className="text-xl text-center mt-4 mb-6" >
                    Explore the data about local areas or contribute your own observations about your work.
                </p>
                <div className="mt-8 text-center">
                    <p className="mb-4 my-5" >To get started click on the items along the top of the screen.</p>
                    <a href="/health" className="bg-white text-[#662583] font-medium py-2 px-4 rounded-md hover:bg-[#C7215D] transition-colors duration-300 my-5">
                        Go to Dashboard
                    </a>
                </div>
            </div>
        </div>
        </div>
    );
};

export default LandingPage;
