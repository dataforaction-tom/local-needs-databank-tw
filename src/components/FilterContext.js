import React, { createContext, useState, useContext } from 'react';

const FilterContext = createContext();

export const useFilters = () => useContext(FilterContext);

export const FilterProvider = ({ children }) => {
    const [filters, setFilters] = useState({});
    const [userHasInteracted, setUserHasInteracted] = useState({});

    const updateFilter = (filterId, filterValue, userInteraction = false) => {
        
        setFilters(prevFilters => {
            const newFilters = {
                ...prevFilters,
                [filterId]: filterValue
            };
            
            return newFilters;
        });
        if (userInteraction) {
            setUserHasInteracted(prev => {
                const newUserInteractions = {
                    ...prev,
                    [filterId]: true
                };
                
                return newUserInteractions;
            });
        }
    };

    return (
        <FilterContext.Provider value={{ filters, updateFilter, userHasInteracted }}>
            {children}
        </FilterContext.Provider>
    );
};

