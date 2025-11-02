import React from 'react';
import { Resident, Role, AdministrationRecords, Medication } from '../types.ts';

interface MedicationGridProps {
  resident: Resident;
  year: number;
  month: number; // 1-12
  records: AdministrationRecords;
  userRole: Role;
  userName: string;
  onAdminister: (residentId: string, med: Medication, time: string, day: number) => void;
}

const MedicationGrid: React.FC<MedicationGridProps> = ({ resident, year, month, records, userRole, userName, onAdminister }) => {
  const daysInMonth = new Date(year, month, 0).getDate();
  const canAdminister = userRole === Role.ADMIN || userRole === Role.NURSE;
  
  const getInitials = (name: string) => {
    const parts = name.split(' ');
    if (parts.length > 1) {
      return parts[0][0].toUpperCase() + parts[parts.length - 1][0].toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  }
  const userInitials = getInitials(userName);

  const residentRecords = records[resident.id]?.[year]?.[month] || {};

  const allMedTimes = resident.medications.flatMap(med => med.times.map(time => ({ med, time }))).sort((a, b) => a.time.localeCompare(b.time));
  
  return (
    <div className="bg-white/60 backdrop-blur-sm p-4 rounded-xl shadow-lg overflow-x-auto transition-shadow duration-300 hover:shadow-2xl border border-slate-200">
      <div className="flex flex-wrap justify-between items-baseline mb-4 gap-4">
          <div>
            <span className="font-semibold text-slate-600">Consumer Name:</span>
            <span className="ml-2 text-lg font-bold">{resident.name}</span>
          </div>
          <div>
            <span className="font-semibold text-slate-600">Physician:</span>
            <span className="ml-2">{resident.physician}</span>
          </div>
          <div>
            <span className="font-semibold text-slate-600">Month:</span>
            <span className="ml-2">{new Date(year, month - 1).toLocaleString('default', { month: 'long' })} {year}</span>
          </div>
      </div>

      <table className="w-full border-collapse text-sm text-center">
        <thead>
          <tr className="bg-slate-100">
            <th className="border border-slate-200 p-2 font-semibold min-w-[150px] text-left">Medication</th>
            <th className="border border-slate-200 p-2 font-semibold min-w-[80px]">Hour</th>
            {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => (
              <th key={day} className="border border-slate-200 p-1 font-semibold w-10 h-10">{day}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {resident.medications.length === 0 ? (
            <tr>
                <td colSpan={daysInMonth + 2} className="text-center p-8 text-slate-500">No medications assigned to this resident.</td>
            </tr>
          ) : (
            resident.medications.map(med =>
              med.times.map((time, timeIndex) => (
                <tr key={`${med.id}-${time}`} className="hover:bg-slate-50/50">
                  {timeIndex === 0 && (
                     <td rowSpan={med.times.length} className="border border-slate-200 p-2 text-left align-top">
                        <p className="font-semibold">{med.name}</p>
                        <p className="text-xs text-slate-500">{med.dosage}</p>
                        <p className="text-xs text-slate-500 italic">{med.notes}</p>
                    </td>
                  )}
                  <td className="border border-slate-200 p-2 font-mono">{time}</td>
                  {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => {
                    const record = residentRecords[day]?.[med.id]?.[time];
                    const isGiven = !!record;
                    return (
                      <td
                        key={day}
                        className={`border border-slate-200 w-10 h-10 transition-colors duration-200 ${canAdminister ? 'cursor-pointer hover:bg-sky-100' : 'cursor-not-allowed'} ${isGiven ? 'bg-green-100 font-bold text-green-800' : ''}`}
                        onClick={() => canAdminister && onAdminister(resident.id, med, time, day)}
                      >
                        {record || (isGiven ? userInitials : '')}
                      </td>
                    );
                  })}
                </tr>
              ))
            )
          )}
        </tbody>
      </table>
    </div>
  );
};

export default MedicationGrid;