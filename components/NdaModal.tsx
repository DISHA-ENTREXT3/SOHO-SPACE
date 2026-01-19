
import React, { useState } from 'react';
import { DocumentTextIcon, ShieldCheckIcon } from './Icons';

interface NdaModalProps {
  ndaUrl: string;
  onAccept: () => void;
  onClose: () => void;
}

const NdaModal: React.FC<NdaModalProps> = ({ ndaUrl, onAccept, onClose }) => {
  const [agreed, setAgreed] = useState(false);

  const handleAccept = () => {
    if (agreed) {
      onAccept();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full p-8 m-4">
        <div className="flex items-center mb-4">
          <ShieldCheckIcon className="h-8 w-8 text-indigo-600 mr-3"/>
          <h2 className="text-2xl font-bold text-gray-900">NDA Agreement</h2>
        </div>
        <p className="text-gray-600 mb-6">To proceed with your application, please review and accept the Non-Disclosure Agreement.</p>
        
        <div className="mb-6 p-4 bg-white rounded-lg border">
          <p className="text-gray-700">A standard NDA is required to protect the intellectual property of the project. By accepting, you agree to maintain confidentiality.</p>
          <a href={ndaUrl} target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex items-center text-indigo-600 hover:text-indigo-800 font-semibold">
            <DocumentTextIcon className="h-5 w-5 mr-2"/>
            View Full NDA Document (PDF)
          </a>
        </div>
        
        <div className="flex items-start mb-6">
          <input 
            id="agree-checkbox"
            type="checkbox" 
            checked={agreed} 
            onChange={(e) => setAgreed(e.target.checked)} 
            className="h-5 w-5 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 mt-1"
          />
          <label htmlFor="agree-checkbox" className="ml-3 text-sm text-gray-700">
            I have read, understood, and agree to the terms of the Non-Disclosure Agreement. This constitutes a legally binding electronic signature.
          </label>
        </div>

        <div className="flex justify-end space-x-4">
          <button onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition">
            Cancel
          </button>
          <button 
            onClick={handleAccept} 
            disabled={!agreed} 
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            Accept & Apply
          </button>
        </div>
      </div>
    </div>
  );
};

export default NdaModal;
