import React, { createContext, useContext, useState } from 'react';

const CounsellingContext = createContext({
    isModalOpen: false,
    openModal: () => {},
    closeModal: () => {},
});

export const useCounselling = () => {
    const context = useContext(CounsellingContext);
    if (!context) {
        throw new Error('useCounselling must be used within a CounsellingProvider');
    }
    return context;
};

export const CounsellingProvider = ({ children }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);

    const openModal = () => setIsModalOpen(true);
    const closeModal = () => setIsModalOpen(false);

    return (
        <CounsellingContext.Provider value={{ isModalOpen, openModal, closeModal }}>
            {children}
        </CounsellingContext.Provider>
    );
};
