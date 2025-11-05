import React from 'react';
import { MedicationStatus } from '../types.ts';
import Modal from './Modal.tsx';

interface StatusSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (status: MedicationStatus | null) => void;
}

const StatusSelectionModal: React.FC<StatusSelectionModalProps> = ({ isOpen, onClose, onSelect }) => {
  const commonButtonClasses = "w-full text-left p-3 rounded-md transition-colors text-sm font-medium";

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Record Administration Status">
      <div className="space-y-2">
        <button 
          onClick={() => onSelect(MedicationStatus.GIVEN)} 
          className={`${commonButtonClasses} bg-green-100 text-green-800 hover:bg-green-200`}
        >
          Given
        </button>
        <button 
          onClick={() => onSelect(MedicationStatus.HELD)} 
          className={`${commonButtonClasses} bg-yellow-100 text-yellow-800 hover:bg-yellow-200`}
        >
          Held
        </button>
        <button 
          onClick={() => onSelect(MedicationStatus.REFUSED)} 
          className={`${commonButtonClasses} bg-red-100 text-red-800 hover:bg-red-200`}
        >
          Refused
        </button>
        <button 
          onClick={() => onSelect(MedicationStatus.MISSED)} 
          className={`${commonButtonClasses} bg-slate-200 text-slate-700 hover:bg-slate-300`}
        >
          Missed
        </button>
        <hr className="my-2 border-slate-200"/>
        <button 
          onClick={() => onSelect(null)} 
          className={`${commonButtonClasses} text-slate-600 hover:bg-slate-100`}
        >
          Clear Entry
        </button>
      </div>
    </Modal>
  );
};

export default StatusSelectionModal;
