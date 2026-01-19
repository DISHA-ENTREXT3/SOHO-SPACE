
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeftIcon } from './Icons';

const BackButton = () => {
    const navigate = useNavigate();

    return (
        <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center text-sm font-semibold text-gray-300 hover:text-white"
        >
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            Go Back
        </button>
    );
};

export default BackButton;