import React, { useState, useEffect, useRef } from 'react';
import { User, Role, AppData, AdministrationRecords, Medication, MedicationStatus, Resident } from '../types.ts';
import { PlusIcon, DownloadIcon, UploadIcon, UserCircleIcon, LogoutIcon, TableCellsIcon, DocumentTextIcon, ClipboardListIcon, TjmLogo } from './icons.tsx';
import MedicationGrid from './MedicationGrid.tsx';
import Modal from './Modal.tsx';
import UserManagement from './UserManagement.tsx';
import StatusSelectionModal from './StatusSelectionModal.tsx';
import AuditLogView from './AuditLogView.tsx';


interface DashboardProps {
  user: User;
  appData: AppData;
  onLogout: () => void;
  onDataUpdate: (newAppData: AppData) => void;
  onDownloadBackup: () => void;
  onUploadBackup: (file: File) => void;
  logAction: (action: string, residentId: string) => void;
}

interface PageWrapperProps {
  children: React.ReactNode;
  title: string;
  user: User;
  onLogout: () => void;
}

const PageWrapper: React.FC<PageWrapperProps> = ({ children, title, user, onLogout }) => (
   <div className="min-h-screen flex flex-col p-4 sm:p-6 lg:p-8">
    <header className="bg-white/80 backdrop-blur-sm shadow-lg rounded-xl p-4 mb-6 flex justify-between items-center sticky top-4 z-50 border border-slate-200">
      <div className="flex items-center gap-3">
        <TjmLogo className="h-9 w-auto text-slate-700" />
        <h1 className="text-xl sm:text-2xl font-bold text-sky-800 border-l-2 border-slate-200 pl-3 ml-1">{title}</h1>
      </div>
      <div className="flex items-center gap-4">
        <div className="text-right hidden sm:block">
          <p className="font-semibold">{user.name}</p>
          <p className="text-xs text-slate-500">{user.role}</p>
        </div>
        <UserCircleIcon className="h-8 w-8 text-slate-500" />
        <button onClick={onLogout} className="text-slate-500 hover:text-sky-600 transition-colors" aria-label="Logout">
          <LogoutIcon className="h-6 w-6" />
        </button>
      </div>
    </header>
    <main className="flex-grow max-w-7xl w-full mx-auto">
      {children}
    </main>
    <footer className="text-center py-4 mt-8 text-xs text-slate-500">
      &copy; {new Date().getFullYear()} TJM Technologies. All rights reserved.
    </footer>
  </div>
);

interface TabButtonProps {
  tabName: string;
  icon: React.ReactNode;
  label: string;
  activeTab: string;
  onClick: (tabName: string) => void;
}

const TabButton: React.FC<TabButtonProps> = ({ tabName, icon, label, activeTab, onClick }) => (
  <button
    onClick={() => onClick(tabName)}
    className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
      activeTab === tabName
        ? 'bg-sky-600 text-white shadow-md'
        : 'text-slate-600 hover:bg-slate-200/70'
    }`}
  >
    {icon}
    <span className="hidden sm:inline">{label}</span>
  </button>
);


const Dashboard: React.FC<DashboardProps> = ({ user, appData, onLogout, onDataUpdate, onDownloadBackup, onUploadBackup, logAction }) => {
  const { homes, residents, records, auditLog } = appData;
  const [selectedHomeId, setSelectedHomeId] = useState<string | null>(null);
  const [selectedResidentId, setSelectedResidentId] = useState<string | null>(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [activeTab, setActiveTab] = useState('grid');

  const [isStatusModalOpen, setStatusModalOpen] = useState(false);
  const [selectedRecordDetails, setSelectedRecordDetails] = useState<{ med: Medication, time: string, day: number } | null>(null);

  const [isAddResidentModalOpen, setAddResidentModalOpen] = useState(false);
  const [isAddMedicationModalOpen, setAddMedicationModalOpen] = useState(false);

  // Form states
  const [newResidentName, setNewResidentName] = useState('');
  const [newResidentPhysician, setNewResidentPhysician] = useState('');
  const [newMedName, setNewMedName] = useState('');
  const [newMedDosage, setNewMedDosage] = useState('');
  const [newMedNotes, setNewMedNotes] = useState('');
  const [newMedTimes, setNewMedTimes] = useState('');
  const [residentNotes, setResidentNotes] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const userHomes = user.role === Role.ADMIN || user.role === Role.IT_ADMIN ? homes : homes.filter(h => user.associatedHomeIds.includes(h.id));
  const homeResidents = residents.filter(r => r.homeId === selectedHomeId);
  const selectedResident = residents.find(r => r.id === selectedResidentId);

  useEffect(() => {
    if(userHomes.length > 0 && !selectedHomeId) {
      setSelectedHomeId(userHomes[0].id);
    }
  }, [userHomes, selectedHomeId]);

  useEffect(() => {
    if(homeResidents.length > 0 && !homeResidents.find(r => r.id === selectedResidentId)) {
        setSelectedResidentId(homeResidents[0].id);
    } else if (homeResidents.length === 0) {
        setSelectedResidentId(null);
    }
  }, [selectedHomeId, homeResidents, selectedResidentId]);

  useEffect(() => {
    setResidentNotes(selectedResident?.notes || '');
    setActiveTab('grid'); // Reset to grid view when resident changes
  }, [selectedResident]);

  const handleGridCellClick = (med: Medication, time: string, day: number) => {
    setSelectedRecordDetails({ med, time, day });
    setStatusModalOpen(true);
  };
  
  const handleUpdateRecord = (status: MedicationStatus | null) => {
    if (!selectedRecordDetails || !selectedResidentId) return;

    const { med, time, day } = selectedRecordDetails;
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth() + 1;
    
    const getInitials = (name: string) => {
        const parts = name.split(' ');
        if (parts.length > 1) return parts[0][0].toUpperCase() + parts[parts.length - 1][0].toUpperCase();
        return name.substring(0, 2).toUpperCase();
    }
    const newRecords: AdministrationRecords = JSON.parse(JSON.stringify(records));
    
    newRecords[selectedResidentId] = newRecords[selectedResidentId] || {};
    newRecords[selectedResidentId][year] = newRecords[selectedResidentId][year] || {};
    newRecords[selectedResidentId][year][month] = newRecords[selectedResidentId][year][month] || {};
    newRecords[selectedResidentId][year][month][day] = newRecords[selectedResidentId][year][month][day] || {};
    newRecords[selectedResidentId][year][month][day][med.id] = newRecords[selectedResidentId][year][month][day][med.id] || {};

    if (status === null) {
      delete newRecords[selectedResidentId][year][month][day][med.id][time];
      logAction(`Cleared record for ${med.name} at ${time}.`, selectedResidentId);
    } else {
      newRecords[selectedResidentId][year][month][day][med.id][time] = {
        status: status,
        initials: getInitials(user.name)
      };
      logAction(`Recorded ${med.name} as ${status} at ${time}.`, selectedResidentId);
    }
    onDataUpdate({ ...appData, records: newRecords });
    setStatusModalOpen(false);
    setSelectedRecordDetails(null);
  };
  
  const handleSaveNotes = () => {
    if (!selectedResidentId) return;
    const updatedResidents = residents.map(r => r.id === selectedResidentId ? { ...r, notes: residentNotes } : r);
    onDataUpdate({ ...appData, residents: updatedResidents });
    logAction('Updated resident notes.', selectedResidentId);
    alert("Notes saved successfully!");
  };

  const handleExportToCSV = () => {
    if (!selectedResident) return;

    const { name, medications } = selectedResident;
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth() + 1; // JS month is 0-indexed
    const daysInMonth = new Date(year, month, 0).getDate();
    const monthName = currentDate.toLocaleString('default', { month: 'long' });

    const residentRecords = records[selectedResident.id]?.[year]?.[month] || {};

    const escapeCsvCell = (cellData: string) => `"${(cellData || '').replace(/"/g, '""')}"`;

    const headers = ["Medication", "Dosage", "Notes", "Time", ...Array.from({ length: daysInMonth }, (_, i) => String(i + 1))];
    let csvContent = headers.join(",") + "\r\n";

    medications.forEach(med => {
        med.times.forEach(time => {
            const rowData = [
                escapeCsvCell(med.name),
                escapeCsvCell(med.dosage),
                escapeCsvCell(med.notes),
                time
            ];

            for (let day = 1; day <= daysInMonth; day++) {
                const record = residentRecords[day]?.[med.id]?.[time];
                const cellValue = record ? (record.status === MedicationStatus.GIVEN ? record.initials : record.status) : '';
                rowData.push(cellValue);
            }
            csvContent += rowData.join(",") + "\r\n";
        });
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `MAR_${name.replace(/\s/g, '_')}_${monthName}_${year}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };


  const handleAddResident = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newResidentName.trim() || !selectedHomeId) return;
    const newResident: Resident = {
      id: `res-${Date.now()}`,
      name: newResidentName,
      physician: newResidentPhysician,
      homeId: selectedHomeId,
      medications: [],
      notes: '',
    };
    onDataUpdate({ ...appData, residents: [...residents, newResident] });
    logAction(`Added new resident: ${newResidentName}.`, newResident.id);
    setNewResidentName('');
    setNewResidentPhysician('');
    setAddResidentModalOpen(false);
  };
  
  const handleAddMedication = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMedName.trim() || !selectedResidentId) return;
    const newMed = {
      id: `med-${Date.now()}`,
      name: newMedName,
      dosage: newMedDosage,
      notes: newMedNotes,
      times: newMedTimes.split(',').map(t => t.trim()).filter(Boolean),
    };
    const updatedResidents = residents.map(r => {
      if (r.id === selectedResidentId) {
        return { ...r, medications: [...r.medications, newMed] };
      }
      return r;
    });
    onDataUpdate({ ...appData, residents: updatedResidents });
    logAction(`Added new medication: ${newMedName}.`, selectedResidentId);
    setNewMedName('');
    setNewMedDosage('');
    setNewMedNotes('');
    setNewMedTimes('');
    setAddMedicationModalOpen(false);
  };

  const handleMonthChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newMonth = parseInt(e.target.value, 10);
    setCurrentDate(new Date(currentDate.getFullYear(), newMonth - 1, 1));
  };
  
  const handleYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newYear = parseInt(e.target.value, 10);
    setCurrentDate(new Date(newYear, currentDate.getMonth(), 1));
  };

  const handleUploadClick = () => fileInputRef.current?.click();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) onUploadBackup(file);
    event.target.value = ''; // Reset file input
  };

  const commonButtonClasses = "flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 transform hover:-translate-y-0.5 shadow-md hover:shadow-lg text-sm font-medium";
  
  if (user.role === Role.IT_ADMIN) {
    return (
      <PageWrapper title="Digital MAR - Admin Portal" user={user} onLogout={onLogout}>
        <UserManagement appData={appData} onDataUpdate={onDataUpdate} currentUser={user} />
      </PageWrapper>
    );
  }

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 10 }, (_, i) => currentYear - 5 + i);
  const months = Array.from({ length: 12 }, (_, i) => ({ value: i + 1, name: new Date(0, i).toLocaleString('default', { month: 'long' }) }));

  return (
    <PageWrapper title="Digital MAR" user={user} onLogout={onLogout}>
      <div className="bg-white/60 backdrop-blur-sm shadow-lg rounded-xl p-4 mb-6 space-y-4 md:space-y-0 md:flex md:justify-between md:items-end border border-slate-200">
          <div className='flex flex-wrap gap-4 items-end'>
              {(user.role === Role.ADMIN || user.role === Role.PHARMACY || user.role === Role.NURSE) && (
                  <div>
                      <label htmlFor="home-select" className="block text-sm font-medium text-slate-700">Care Home</label>
                      <select id="home-select" value={selectedHomeId || ''} onChange={e => setSelectedHomeId(e.target.value)} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-slate-300 focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm rounded-md bg-white text-slate-800 shadow-sm">
                          {userHomes.map(home => <option key={home.id} value={home.id}>{home.name}</option>)}
                      </select>
                  </div>
              )}

              {selectedHomeId && (
                  <div>
                      <label htmlFor="resident-select" className="block text-sm font-medium text-slate-700">Resident</label>
                      <select id="resident-select" value={selectedResidentId || ''} onChange={e => setSelectedResidentId(e.target.value)} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-slate-300 focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm rounded-md bg-white text-slate-800 shadow-sm">
                         {homeResidents.length > 0 ? (
                          homeResidents.map(res => <option key={res.id} value={res.id}>{res.name}</option>)
                         ) : (
                          <option value="">No residents in this home</option>
                         )}
                      </select>
                  </div>
              )}
               <div className="flex gap-2">
                 <div>
                    <label htmlFor="month-select" className="block text-sm font-medium text-slate-700">Month</label>
                    <select id="month-select" value={currentDate.getMonth() + 1} onChange={handleMonthChange} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-slate-300 focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm rounded-md bg-white text-slate-800 shadow-sm">
                      {months.map(m => <option key={m.value} value={m.value}>{m.name}</option>)}
                    </select>
                 </div>
                 <div>
                    <label htmlFor="year-select" className="block text-sm font-medium text-slate-700">Year</label>
                    <select id="year-select" value={currentDate.getFullYear()} onChange={handleYearChange} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-slate-300 focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm rounded-md bg-white text-slate-800 shadow-sm">
                       {years.map(y => <option key={y} value={y}>{y}</option>)}
                    </select>
                 </div>
               </div>
          </div>
          <div className="flex flex-wrap gap-2">
             {user.role === Role.ADMIN && selectedHomeId && (
                <button onClick={() => setAddResidentModalOpen(true)} className={`${commonButtonClasses} bg-sky-600 text-white hover:bg-sky-700`}>
                  <PlusIcon className="h-4 w-4" /> Add Resident
                </button>
              )}
          </div>
      </div>

      {selectedResident ? (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white/60 backdrop-blur-sm p-4 rounded-xl shadow-lg border border-slate-200">
                    <h3 className="font-semibold text-slate-500 text-sm">Resident</h3>
                    <p className="text-xl font-bold text-slate-800">{selectedResident.name}</p>
                </div>
                <div className="bg-white/60 backdrop-blur-sm p-4 rounded-xl shadow-lg border border-slate-200">
                    <h3 className="font-semibold text-slate-500 text-sm">Physician</h3>
                    <p className="text-xl font-bold text-slate-800">{selectedResident.physician}</p>
                </div>
                 <div className="bg-white/60 backdrop-blur-sm p-4 rounded-xl shadow-lg border border-slate-200">
                    <h3 className="font-semibold text-slate-500 text-sm">Active Medications</h3>
                    <p className="text-xl font-bold text-slate-800">{selectedResident.medications.length}</p>
                </div>
            </div>

            <div className="bg-white/60 backdrop-blur-sm p-4 rounded-xl shadow-lg border border-slate-200">
                <div className="flex justify-between items-center border-b border-slate-200 pb-3 mb-4">
                    <div className="flex items-center gap-2">
                        <TabButton tabName="grid" icon={<TableCellsIcon className="h-5 w-5"/>} label="MAR Grid" activeTab={activeTab} onClick={setActiveTab} />
                        <TabButton tabName="notes" icon={<DocumentTextIcon className="h-5 w-5"/>} label="Notes" activeTab={activeTab} onClick={setActiveTab} />
                        <TabButton tabName="audit" icon={<ClipboardListIcon className="h-5 w-5"/>} label="Audit Log" activeTab={activeTab} onClick={setActiveTab} />
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {user.role === Role.ADMIN && (
                           <button onClick={handleExportToCSV} className={`${commonButtonClasses} bg-emerald-600 text-white hover:bg-emerald-700`}><DownloadIcon className="h-4 w-4" /> Export CSV</button>
                        )}
                        {user.role === Role.PHARMACY && activeTab === 'grid' && (
                            <button onClick={() => setAddMedicationModalOpen(true)} className={`${commonButtonClasses} bg-sky-600 text-white hover:bg-sky-700`}><PlusIcon className="h-4 w-4" /> Add Medication</button>
                        )}
                        <button onClick={onDownloadBackup} className={`${commonButtonClasses} bg-slate-500 text-white hover:bg-slate-600`}><DownloadIcon className="h-4 w-4" /> Backup</button>
                        <button onClick={handleUploadClick} className={`${commonButtonClasses} bg-slate-500 text-white hover:bg-slate-600`}><UploadIcon className="h-4 w-4" /> Restore</button>
                        <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".json" className="hidden" />
                    </div>
                </div>

                {activeTab === 'grid' && (
                    <MedicationGrid 
                        resident={selectedResident} 
                        year={currentDate.getFullYear()}
                        month={currentDate.getMonth() + 1}
                        records={records}
                        userRole={user.role}
                        onCellClick={handleGridCellClick}
                    />
                )}

                {activeTab === 'notes' && (
                    <div>
                        <h3 className="text-lg font-semibold text-slate-700 mb-2">Resident Notes</h3>
                        <textarea
                            value={residentNotes}
                            onChange={e => setResidentNotes(e.target.value)}
                            readOnly={user.role === Role.PHARMACY}
                            rows={8}
                            className="block w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-sm shadow-sm placeholder-slate-400 focus:outline-none focus:ring-sky-500 focus:border-sky-500 disabled:bg-slate-50 disabled:text-slate-500"
                            placeholder={user.role === Role.PHARMACY ? "No notes entered." : "Enter notes here..."}
                        />
                        {user.role !== Role.PHARMACY && (
                            <div className="text-right mt-2">
                                <button onClick={handleSaveNotes} className="px-4 py-2 bg-sky-600 text-white text-sm font-medium rounded-md hover:bg-sky-700 transition-colors">Save Notes</button>
                            </div>
                        )}
                    </div>
                )}
                
                {activeTab === 'audit' && (
                  <AuditLogView auditLog={auditLog} residentId={selectedResident.id} />
                )}
            </div>
        </div>
      ) : (
          <div className="bg-white/60 text-center p-12 rounded-xl shadow-lg border border-slate-200">
              <p className="text-slate-500">{selectedHomeId ? "Please select a resident to view their MAR." : "Please select a care home."}</p>
          </div>
      )}

      {selectedRecordDetails && (
        <StatusSelectionModal 
            isOpen={isStatusModalOpen}
            onClose={() => setStatusModalOpen(false)}
            onSelect={handleUpdateRecord}
        />
      )}
       <Modal isOpen={isAddResidentModalOpen} onClose={() => setAddResidentModalOpen(false)} title="Add New Resident">
         <form onSubmit={handleAddResident} className="space-y-4">
            <div>
                <label htmlFor="residentName" className="block text-sm font-medium text-slate-700">Resident Name</label>
                <input type="text" id="residentName" value={newResidentName} onChange={e => setNewResidentName(e.target.value)} required className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-sm shadow-sm placeholder-slate-400 focus:outline-none focus:ring-sky-500 focus:border-sky-500"/>
            </div>
             <div>
                <label htmlFor="physicianName" className="block text-sm font-medium text-slate-700">Physician Name</label>
                <input type="text" id="physicianName" value={newResidentPhysician} onChange={e => setNewResidentPhysician(e.target.value)} required className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-sm shadow-sm placeholder-slate-400 focus:outline-none focus:ring-sky-500 focus:border-sky-500"/>
            </div>
            <div className="flex justify-end gap-2 pt-4">
                <button type="button" onClick={() => setAddResidentModalOpen(false)} className="px-4 py-2 bg-slate-200 rounded-md hover:bg-slate-300">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-sky-600 text-white rounded-md hover:bg-sky-700">Add Resident</button>
            </div>
         </form>
      </Modal>

      <Modal isOpen={isAddMedicationModalOpen} onClose={() => setAddMedicationModalOpen(false)} title={`Add Medication for ${selectedResident?.name}`}>
        <form onSubmit={handleAddMedication} className="space-y-4">
             <div>
                <label htmlFor="medName" className="block text-sm font-medium text-slate-700">Medication Name</label>
                <input type="text" id="medName" value={newMedName} onChange={e => setNewMedName(e.target.value)} required className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-sm shadow-sm placeholder-slate-400 focus:outline-none focus:ring-sky-500 focus:border-sky-500"/>
            </div>
            <div>
                <label htmlFor="medDosage" className="block text-sm font-medium text-slate-700">Dosage</label>
                <input type="text" id="medDosage" value={newMedDosage} onChange={e => setNewMedDosage(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-sm shadow-sm placeholder-slate-400 focus:outline-none focus:ring-sky-500 focus:border-sky-500"/>
            </div>
            <div>
                <label htmlFor="medNotes" className="block text-sm font-medium text-slate-700">Notes</label>
                <textarea id="medNotes" value={newMedNotes} onChange={e => setNewMedNotes(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-sm shadow-sm placeholder-slate-400 focus:outline-none focus:ring-sky-500 focus:border-sky-500"/>
            </div>
             <div>
                <label htmlFor="medTimes" className="block text-sm font-medium text-slate-700">Administration Times (HH:mm, comma separated)</label>
                <input type="text" id="medTimes" value={newMedTimes} onChange={e => setNewMedTimes(e.target.value)} placeholder="e.g., 08:00, 20:00" required className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-sm shadow-sm placeholder-slate-400 focus:outline-none focus:ring-sky-500 focus:border-sky-500"/>
            </div>
            <div className="flex justify-end gap-2 pt-4">
                <button type="button" onClick={() => setAddMedicationModalOpen(false)} className="px-4 py-2 bg-slate-200 rounded-md hover:bg-slate-300">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-sky-600 text-white rounded-md hover:bg-sky-700">Add Medication</button>
            </div>
        </form>
      </Modal>
    </PageWrapper>
  );
};

export default Dashboard;