import React, { createContext, useState, useContext } from 'react';

const FilterContext = createContext();

export const useFilters = () => useContext(FilterContext);

export const FilterProvider = ({ children }) => {
    const [filters, setFilters] = useState({});
    const [userHasInteracted, setUserHasInteracted] = useState({});

    const updateFilter = (filterId, filterValue, userInteraction = false) => {
        console.log(`Updating filter for ${filterId}: `, filterValue);
        setFilters(prevFilters => {
            const newFilters = {
                ...prevFilters,
                [filterId]: filterValue
            };
            console.log(`New filters state: `, newFilters);
            return newFilters;
        });
        if (userInteraction) {
            setUserHasInteracted(prev => {
                const newUserInteractions = {
                    ...prev,
                    [filterId]: true
                };
                console.log(`User interaction updated for ${filterId}: `, newUserInteractions);
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

