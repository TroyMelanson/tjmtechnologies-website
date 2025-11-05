import React, { useState, useMemo, FC, useCallback, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Employee, Shift, Expense, ViewType, Resident, Allowance, ExpenseForecast, UserRole, Room, Tenancy } from './types';

declare var XLSX: any;

// MOCK DATA GENERATION
const initialEmployees: Employee[] = [
    { id: '1', name: 'Alice Johnson', payRate: 25, position: 'Senior Caregiver', hireDate: new Date('2022-08-15') },
    { id: '2', name: 'Bob Williams', payRate: 22, position: 'Caregiver', hireDate: new Date('2023-01-20') },
    { id: '3', name: 'Charlie Brown', payRate: 20, position: 'Night Shift Supervisor', hireDate: new Date('2021-11-01') },
    { id: '4', name: 'Diana Prince', payRate: 28, position: 'Registered Nurse', hireDate: new Date('2023-05-10') },
    { id: '5', name: 'Edward Hands', payRate: 21, position: 'Caregiver', hireDate: new Date('2023-03-12') },
    { id: '6', name: 'Fiona Glenanne', payRate: 23, position: 'Activities Coordinator', hireDate: new Date('2022-09-01') },
    { id: '7', name: 'George Costanza', payRate: 20, position: 'Night Shift Caregiver', hireDate: new Date('2023-07-01') },
    { id: '8', name: 'Hannah Montana', payRate: 35, position: 'Director of Care', hireDate: new Date('2020-02-01') },
];

const generateInitialSchedule = (employees: Employee[], startDate: Date, numDays: number): Shift[] => {
    const shifts: Shift[] = [];
    let shiftIdCounter = 1;

    const nightStaffIds = employees.filter(e => e.position.includes('Night')).map(e => e.id);
    const dayStaffIds = employees.filter(e => !e.position.includes('Night')).map(e => e.id);
    
    const dayShiftTimes = [{ start: 7, end: 15 }, { start: 15, end: 23 }];

    for (let i = 0; i < numDays; i++) {
        const currentDay = new Date(startDate);
        currentDay.setDate(startDate.getDate() + i);

        // Assign day staff to one 8-hour shift, alternating them
        dayStaffIds.forEach((employeeId, index) => {
            const shiftTime = dayShiftTimes[(i + index) % dayShiftTimes.length];
            const start = new Date(currentDay);
            start.setHours(shiftTime.start, 0, 0, 0);
            const end = new Date(currentDay);
            end.setHours(shiftTime.end, 0, 0, 0);
            shifts.push({ id: `s${shiftIdCounter++}`, employeeId, start, end });
        });
        
        // Assign night staff to their 8-hour shift
        nightStaffIds.forEach(employeeId => {
            const start = new Date(currentDay);
            start.setHours(23, 0, 0, 0);
            const end = new Date(currentDay);
            end.setDate(currentDay.getDate() + 1);
            end.setHours(7, 0, 0, 0);
            shifts.push({ id: `s${shiftIdCounter++}`, employeeId, start, end });
        });
    }
    return shifts;
};

const fourteenDaysAgo = new Date(new Date().setDate(new Date().getDate() - 14));
const initialShifts: Shift[] = generateInitialSchedule(initialEmployees, fourteenDaysAgo, 28);

const initialExpenseCategories: string[] = [
    'Depreciation', 'Interest Expense', 'Principal', 'Owner Down capital only', 'Owner down interest only', 'Property taxes', 'Salaries Management', 'Salary Investor (Landscaping, paperwork)', 'Groceries', 'Maintenance', 'Electricity and cable', 'Travel', 'Insurance', 'Water and Sewer', 'Activities / Programing', 'Equipment location', 'Home Vehicule', 'Furniture', 'Training', 'Bureau', 'Bank Fees', 'Professional services', 'Permits'
].sort();

const initialExpenses: Expense[] = [
    { id: 'e1', date: new Date(), category: 'Groceries', description: 'Weekly groceries', amount: 450.75 },
    { id: 'e2', date: new Date(new Date().setDate(new Date().getDate() - 1)), category: 'Maintenance', description: 'Plumbing repair', amount: 150.00 },
];

const initialResidents: Resident[] = [
    { id: 'r1', name: 'John Doe' },
    { id: 'r2', name: 'Jane Smith' },
    { id: 'r3', name: 'Peter Pan' },
];

const initialRooms: Room[] = Array.from({length: 15}, (_, i) => ({ id: `room${i+1}`, roomNumber: (101+i).toString() }));

const initialTenancies: Tenancy[] = [
    { id: 't1', roomId: 'room1', residentId: 'r1', startDate: new Date('2023-01-01'), endDate: null, monthlyRate: 5000 },
    { id: 't2', roomId: 'room2', residentId: 'r2', startDate: new Date('2023-03-15'), endDate: null, monthlyRate: 5500 },
];

const initialAllowances: Allowance[] = [
    { id: 'a1', residentId: 'r1', date: new Date(), amount: 50, description: 'Weekly allowance' },
];
const initialForecasts: ExpenseForecast[] = [
    { id: `${new Date().getFullYear()}-${new Date().getMonth() + 1}-Groceries`, year: new Date().getFullYear(), month: new Date().getMonth() + 1, category: 'Groceries', amount: 2000 }
];

// FIX: Replaced corrupted base64 string with a valid one.
const LOGO_BASE64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAABWSURBVHhe7c4xEQAgDMCwwv+P4fgyI5Ek720sAECgYgAIFQNAqBgAgokDIAaAEDCAGgAg0AEAFAyAEQDAIA8AEAwAMjEDwBAAwgEAIKQaAEAwAASAQBQAAgAAAABJRU5ErkJggg==';

// HELPER FUNCTIONS
const formatDate = (date: Date) => date.toISOString().split('T')[0];
const formatTime = (date: Date) => date.toTimeString().slice(0, 5);
const getHoursDifference = (start: Date, end: Date) => (end.getTime() - start.getTime()) / (1000 * 60 * 60);

const exportToExcel = (data: { [sheetName: string]: object[] }) => {
    const wb = XLSX.utils.book_new();
    for (const sheetName in data) {
        if (data[sheetName] && data[sheetName].length > 0) {
            const ws = XLSX.utils.json_to_sheet(data[sheetName]);
            XLSX.utils.book_append_sheet(wb, ws, sheetName);
        }
    }
    XLSX.writeFile(wb, "CareHomeData.xlsx");
};


// UI COMPONENTS
const Card: FC<{ children: React.ReactNode, className?: string }> = ({ children, className = '' }) => (
    <div className={`bg-gray-800 shadow-lg rounded-xl p-6 ${className}`}>
        {children}
    </div>
);

const Button: FC<{ onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void, children: React.ReactNode, variant?: 'primary' | 'secondary' | 'danger', className?: string, type?: 'button' | 'submit' | 'reset', disabled?: boolean }> = ({ onClick, children, variant = 'primary', className = '', type = 'button', disabled = false }) => {
    const baseClasses = 'px-4 py-2 rounded-md font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed';
    const variantClasses = {
        primary: 'bg-indigo-600 hover:bg-indigo-700 text-white focus:ring-indigo-500',
        secondary: 'bg-gray-600 hover:bg-gray-700 text-gray-200 focus:ring-gray-500',
        danger: 'bg-red-600 hover:bg-red-700 text-white focus:ring-red-500'
    };
    return <button type={type} onClick={onClick} className={`${baseClasses} ${variantClasses[variant]} ${className}`} disabled={disabled}>{children}</button>;
};

const Modal: FC<{ isOpen: boolean; onClose: () => void; title: string; children: React.ReactNode, size?: 'md' | 'lg' | 'xl' | '3xl' | '5xl' }> = ({ isOpen, onClose, title, children, size = 'md' }) => {
    if (!isOpen) return null;
    const sizeClasses = {
        md: 'max-w-md',
        lg: 'max-w-lg',
        xl: 'max-w-xl',
        '3xl': 'max-w-3xl',
        '5xl': 'max-w-5xl'
    };
    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50" role="dialog" aria-modal="true" aria-labelledby="modal-title">
            <div className={`bg-gray-800 rounded-lg shadow-xl w-full m-4 ${sizeClasses[size]}`}>
                <div className="p-6 border-b border-gray-700">
                    <div className="flex justify-between items-center">
                        <h3 id="modal-title" className="text-2xl font-semibold text-white">{title}</h3>
                        <button onClick={onClose} className="text-gray-400 hover:text-white text-3xl leading-none" aria-label="Close modal">&times;</button>
                    </div>
                </div>
                <div className="p-6 max-h-[80vh] overflow-y-auto">
                    {children}
                </div>
            </div>
        </div>
    );
};

const LoginScreen: FC<{ onLogin: (role: UserRole) => void }> = ({ onLogin }) => {
    return (
        <div className="min-h-screen flex flex-col justify-center items-center bg-gray-900 text-white">
            <Card className="w-full max-w-sm text-center">
                <img src={LOGO_BASE64} alt="TJM Technologies Logo" className="mx-auto mb-4 w-auto rounded-lg" style={{ filter: 'invert(1)' }} />
                <p className="text-xl text-gray-300 mb-4">CareHome Business Suite</p>
                <p className="text-gray-400 mb-8">Please select your role to continue</p>
                <div className="space-y-4">
                    <Button onClick={() => onLogin('Owner')} className="w-full text-lg py-3">Login as Owner / Director</Button>
                    <Button onClick={() => onLogin('Supervisor')} variant="secondary" className="w-full text-lg py-3">Login as Supervisor</Button>
                </div>
                <p className="text-xs text-gray-500 mt-8">This is a simulated login for demonstration purposes.</p>
            </Card>
        </div>
    );
};

const FinancialDashboard: FC<{ tenancies: Tenancy[], shifts: Shift[], expenses: Expense[], employees: Employee[], allowances: Allowance[] }> = ({ tenancies, shifts, expenses, employees, allowances }) => {
    const [filter, setFilter] = useState('This Month');
    const dateRanges = useMemo(() => {
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const weekStart = new Date(today);
        weekStart.setDate(today.getDate() - today.getDay());
        const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
        const yearStart = new Date(today.getFullYear(), 0, 1);

        return {
            'Today': { start: today, end: new Date(today.getTime() + 86400000) },
            'This Week': { start: weekStart, end: new Date(weekStart.getTime() + 7 * 86400000) },
            'This Month': { start: monthStart, end: new Date(today.getFullYear(), today.getMonth() + 1, 1) },
            'This Year': { start: yearStart, end: new Date(today.getFullYear() + 1, 0, 1) },
        };
    }, []);

    const filteredData = useMemo(() => {
        if (filter === 'All Time') {
            return { shifts, expenses, allowances };
        }
        const { start, end } = dateRanges[filter];
        return {
            shifts: shifts.filter(s => s.start >= start && s.start < end),
            expenses: expenses.filter(e => e.date >= start && e.date < end),
            allowances: allowances.filter(a => a.date >= start && a.date < end),
        };
    }, [filter, shifts, expenses, allowances, dateRanges]);

    const financialData = useMemo(() => {
        const dataByDate: { [key: string]: { salaries: number, expenses: number, revenue: number, allowances: number } } = {};
        
        const getDailyRevenue = (date: Date) => {
            const dateStr = formatDate(date);
            return tenancies.reduce((total, tenancy) => {
                const tenancyStarts = formatDate(tenancy.startDate) <= dateStr;
                const tenancyEnds = !tenancy.endDate || formatDate(new Date(tenancy.endDate)) >= dateStr;
                if(tenancyStarts && tenancyEnds) {
                    return total + (tenancy.monthlyRate / 30.44); // Avg days in month
                }
                return total;
            }, 0);
        };

        const range = filter === 'All Time' ? 
            [...shifts.map(s => s.start), ...expenses.map(e => e.date), ...allowances.map(a => a.date)] : 
            [dateRanges[filter].start];
        
        if (range.length === 0) return [];
            
        const minDate = new Date(Math.min(...range.map(d => d.getTime())));
        const maxDate = filter === 'All Time' ? new Date() : new Date(dateRanges[filter].end.getTime() - 1);

        for (let d = new Date(minDate); d <= maxDate; d.setDate(d.getDate() + 1)) {
            const dateStr = formatDate(d);
            dataByDate[dateStr] = { salaries: 0, expenses: 0, revenue: getDailyRevenue(d), allowances: 0 };
        }

        filteredData.shifts.forEach(shift => {
            const employee = employees.find(e => e.id === shift.employeeId);
            if (!employee) return;
            const dateStr = formatDate(shift.start);
            const hours = getHoursDifference(shift.start, shift.end);
            const salaryCost = hours * employee.payRate;
            if (dataByDate[dateStr]) dataByDate[dateStr].salaries += salaryCost;
        });

        [...filteredData.expenses, ...filteredData.allowances.map(a => ({...a, category: 'Allowances'}))].forEach(expense => {
            const dateStr = formatDate(expense.date);
            if (dataByDate[dateStr]) {
                 if('residentId' in expense) dataByDate[dateStr].allowances += expense.amount;
                 else dataByDate[dateStr].expenses += expense.amount;
            }
        });

        return Object.entries(dataByDate)
            .map(([date, { salaries, expenses, revenue, allowances }]) => ({
                date,
                Revenue: parseFloat(revenue.toFixed(2)),
                Salaries: parseFloat(salaries.toFixed(2)),
                Expenses: parseFloat((expenses + allowances).toFixed(2)),
                Net: parseFloat((revenue - salaries - expenses - allowances).toFixed(2))
            }))
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    }, [employees, filteredData, tenancies, filter, dateRanges]);

    const totals = useMemo(() => {
        return financialData.reduce((acc, curr) => {
            acc.revenue += curr.Revenue;
            acc.salaries += curr.Salaries;
            acc.expenses += curr.Expenses;
            acc.net += curr.Net;
            return acc;
        }, { revenue: 0, salaries: 0, expenses: 0, net: 0 });
    }, [financialData]);
    
    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex justify-between items-center">
                 <h2 className="text-3xl font-bold text-white">Financial Dashboard</h2>
                 <div className="flex gap-2 bg-gray-700 p-1 rounded-lg">
                    {['Today', 'This Week', 'This Month', 'This Year', 'All Time'].map(f => (
                        <button key={f} onClick={() => setFilter(f)} className={`px-3 py-1 text-sm font-semibold rounded-md transition ${filter === f ? 'bg-indigo-600 text-white' : 'text-gray-300 hover:bg-gray-600'}`}>
                            {f}
                        </button>
                    ))}
                 </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card>
                    <h3 className="text-gray-400">Gross Revenue</h3>
                    <p className="text-3xl font-bold text-cyan-400">${totals.revenue.toFixed(2)}</p>
                </Card>
                <Card>
                    <h3 className="text-gray-400">Total Salaries</h3>
                    <p className="text-3xl font-bold text-yellow-400">${totals.salaries.toFixed(2)}</p>
                </Card>
                <Card>
                    <h3 className="text-gray-400">Total Other Expenses</h3>
                    <p className="text-3xl font-bold text-orange-400">${totals.expenses.toFixed(2)}</p>
                </Card>
                <Card>
                    <h3 className="text-gray-400">Net Income</h3>
                    <p className={`text-3xl font-bold ${totals.net >= 0 ? 'text-green-400' : 'text-red-400'}`}>${totals.net.toFixed(2)}</p>
                </Card>
            </div>
            <Card className="h-96">
                <h3 className="text-xl font-semibold mb-4 text-white">Daily Financials</h3>
                 {financialData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="90%">
                        <LineChart data={financialData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#4A5568" />
                            <XAxis dataKey="date" stroke="#A0AEC0" />
                            <YAxis stroke="#A0AEC0" tickFormatter={(value) => `$${value}`} />
                            <Tooltip contentStyle={{ backgroundColor: '#2D3748', border: 'none', borderRadius: '0.5rem' }} labelStyle={{ color: '#E2E8F0' }} />
                            <Legend wrapperStyle={{ color: '#E2E8F0' }} />
                            <Line type="monotone" dataKey="Revenue" stroke="#2DD4BF" strokeWidth={2} dot={false} />
                            <Line type="monotone" dataKey="Salaries" stroke="#FBBF24" strokeWidth={2} dot={false} />
                            <Line type="monotone" dataKey="Expenses" stroke="#FB923C" strokeWidth={2} dot={false} />
                            <Line type="monotone" dataKey="Net" stroke="#4ADE80" strokeWidth={2} dot={false} />
                        </LineChart>
                    </ResponsiveContainer>
                ) : <p className="text-center text-gray-500">No financial data for this period.</p>}
            </Card>
        </div>
    );
};

const Scheduler: FC<{ employees: Employee[], shifts: Shift[], onShiftsAdd: (shifts: Omit<Shift, 'id'>[]) => void, onShiftUpdate: (shift: Shift) => void, onShiftAdd: (shift: Omit<Shift, 'id'>) => void, onShiftDelete: (shiftId: string) => void }> = ({ employees, shifts, onShiftsAdd, onShiftUpdate, onShiftAdd, onShiftDelete }) => {
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isCopyModalOpen, setIsCopyModalOpen] = useState(false);
    const [editingShift, setEditingShift] = useState<Shift | null>(null);
    const [newShiftInfo, setNewShiftInfo] = useState<{date: Date, employeeId: string} | null>(null);
    const [view, setView] = useState<'day'|'week'>('day');

    const handleAddClick = (date?: Date, employeeId?: string) => {
        setEditingShift(null);
        setNewShiftInfo(date && employeeId ? { date, employeeId } : null);
        setIsAddModalOpen(true);
    };

    const handleEditClick = (shift: Shift) => {
        setEditingShift(shift);
        setIsAddModalOpen(true);
    };

    const handleFormSubmit = (shiftData: Omit<Shift, 'id'> | Shift) => {
        if ('id' in shiftData) {
            onShiftUpdate(shiftData);
        } else {
            onShiftAdd(shiftData);
        }
        setIsAddModalOpen(false);
    };
    
    const changeDate = (amount: number) => {
        setSelectedDate(prev => {
            const newDate = new Date(prev);
            const increment = view === 'week' ? amount * 7 : amount;
            newDate.setDate(newDate.getDate() + increment);
            return newDate;
        });
    };
    
    const weekDays = useMemo(() => {
        const startOfWeek = new Date(selectedDate);
        startOfWeek.setDate(selectedDate.getDate() - selectedDate.getDay()); // Sunday
        return Array.from({length: 7}, (_, i) => {
            const day = new Date(startOfWeek);
            day.setDate(startOfWeek.getDate() + i);
            return day;
        });
    }, [selectedDate]);

    return (
         <div className="space-y-6 animate-fade-in">
            <div className="flex justify-between items-center">
                 <h2 className="text-3xl font-bold text-white">Scheduler</h2>
                 <div className="flex gap-2">
                    <Button onClick={() => setIsCopyModalOpen(true)} variant="secondary">Copy Schedule</Button>
                    <Button onClick={() => handleAddClick()}>Add Shift</Button>
                 </div>
            </div>
            <Card>
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <Button onClick={() => changeDate(-1)} variant="secondary">&lt; Prev</Button>
                         <input 
                            type="date" 
                            value={formatDate(selectedDate)}
                            onChange={(e) => setSelectedDate(new Date(e.target.value + 'T00:00:00'))}
                            className="bg-gray-700 text-white p-2 rounded-md"
                        />
                        <Button onClick={() => changeDate(1)} variant="secondary">Next &gt;</Button>
                    </div>
                     <div className="flex gap-2 bg-gray-700 p-1 rounded-lg self-start">
                        <button onClick={() => setView('day')} className={`px-3 py-1 text-sm font-semibold rounded-md transition ${view === 'day' ? 'bg-indigo-600 text-white' : 'text-gray-300 hover:bg-gray-600'}`}>Daily View</button>
                        <button onClick={() => setView('week')} className={`px-3 py-1 text-sm font-semibold rounded-md transition ${view === 'week' ? 'bg-indigo-600 text-white' : 'text-gray-300 hover:bg-gray-600'}`}>Weekly View</button>
                    </div>
                </div>
            </Card>

            {view === 'day' && <DailySchedulerView employees={employees} shifts={shifts} selectedDate={selectedDate} onEditShift={handleEditClick} onDeleteShift={onShiftDelete} />}
            {view === 'week' && <WeeklySchedulerView employees={employees} shifts={shifts} weekDays={weekDays} onEditShift={handleEditClick} onAddShift={(date, empId) => handleAddClick(date, empId)} onDeleteShift={onShiftDelete} />}
           
            <ShiftFormModal 
                isOpen={isAddModalOpen}
                onClose={() => {
                    setIsAddModalOpen(false);
                    setNewShiftInfo(null);
                }}
                shift={editingShift}
                employees={employees}
                onSubmit={handleFormSubmit}
                selectedDate={selectedDate}
                initialData={newShiftInfo}
            />
            <CopyScheduleModal
                isOpen={isCopyModalOpen}
                onClose={() => setIsCopyModalOpen(false)}
                shifts={shifts}
                onShiftsAdd={onShiftsAdd}
                currentDate={selectedDate}
            />
        </div>
    );
};

const DailySchedulerView: FC<{employees: Employee[], shifts: Shift[], selectedDate: Date, onEditShift: (shift: Shift) => void, onDeleteShift: (shiftId: string) => void}> = ({employees, shifts, selectedDate, onEditShift, onDeleteShift}) => {
     const shiftsForDay = useMemo(() => {
        const startOfDay = new Date(selectedDate);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(selectedDate);
        endOfDay.setHours(23, 59, 59, 999);
        return shifts.filter(s => {
            const shiftStart = s.start;
            const shiftEnd = s.end;
            return (shiftStart >= startOfDay && shiftStart <= endOfDay) || // Shift starts today
                   (shiftEnd > startOfDay && shiftEnd <= endOfDay) || // Shift ends today
                   (shiftStart < startOfDay && shiftEnd > endOfDay); // Shift spans the whole day
        });
    }, [shifts, selectedDate]);
    return (
         <Card>
            <div className="flex text-center text-xs text-gray-400 border-b border-gray-700 pb-2 select-none">
                {Array.from({ length: 24 }, (_, i) => (
                    <div key={i} className="flex-1">{i.toString().padStart(2, '0')}</div>
                ))}
            </div>
            <div className="space-y-4 pt-4 relative">
                {employees.map(employee => (
                    <div key={employee.id} className="flex items-center">
                        <div className="w-32 pr-4 text-right font-semibold text-indigo-300">{employee.name}</div>
                        <div className="flex-1 bg-gray-700 h-10 rounded relative">
                            {shiftsForDay.filter(s => s.employeeId === employee.id).map(shift => {
                                const dayStartMs = new Date(selectedDate).setHours(0,0,0,0);
                                const startMinutes = Math.max(0, (shift.start.getTime() - dayStartMs) / (1000 * 60));
                                const endMinutes = Math.min(24*60, (shift.end.getTime() - dayStartMs) / (1000 * 60));
                                const left = (startMinutes / (24 * 60)) * 100;
                                const width = ((endMinutes - startMinutes) / (24 * 60)) * 100;

                                return (
                                    <div
                                        key={shift.id}
                                        className="absolute bg-indigo-500 h-full rounded text-white text-xs flex items-center group"
                                        style={{ left: `${left}%`, width: `${width}%` }}
                                        title={`${formatTime(shift.start)} - ${formatTime(shift.end)}`}
                                    >
                                        <div 
                                            onClick={() => onEditShift(shift)}
                                            className="flex-grow h-full flex items-center justify-center p-1 cursor-pointer hover:bg-indigo-400 rounded-l"
                                        >
                                            <span className="truncate">{formatTime(shift.start)} - {formatTime(shift.end)}</span>
                                        </div>
                                        <button 
                                            onClick={(e) => { e.stopPropagation(); if (window.confirm('Are you sure you want to delete this shift?')) onDeleteShift(shift.id); }}
                                            className="w-6 h-full flex items-center justify-center text-indigo-200 bg-indigo-600 hover:bg-red-500 hover:text-white rounded-r transition-colors"
                                            aria-label="Delete shift"
                                        >
                                            &times;
                                        </button>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                ))}
            </div>
        </Card>
    );
};

const WeeklySchedulerView: FC<{employees: Employee[], shifts: Shift[], weekDays: Date[], onEditShift: (shift: Shift) => void, onAddShift: (date: Date, employeeId: string) => void, onDeleteShift: (shiftId: string) => void}> = ({employees, shifts, weekDays, onEditShift, onAddShift, onDeleteShift}) => {
    return (
        <Card>
            <div className="grid grid-cols-8">
                <div className="font-bold text-center p-2 border-b border-r border-gray-700">Employee</div>
                {weekDays.map(day => (
                    <div key={day.toISOString()} className="font-bold text-center p-2 border-b border-r border-gray-700 last:border-r-0">
                        {day.toLocaleDateString('en-US', {weekday: 'short'})}<br/>
                        <span className="font-normal text-sm">{day.getDate()}</span>
                    </div>
                ))}

                {employees.map(emp => (
                    <React.Fragment key={emp.id}>
                        <div className="p-2 border-b border-r border-gray-700 font-semibold text-indigo-300">{emp.name}</div>
                        {weekDays.map(day => {
                             const startOfDay = new Date(day).setHours(0,0,0,0);
                             const endOfDay = new Date(day).setHours(23,59,59,999);
                             const dayShifts = shifts.filter(s => s.employeeId === emp.id && s.start < endOfDay && s.end > startOfDay);
                             
                             return (
                                <div key={day.toISOString()} onClick={() => onAddShift(day, emp.id)} className="p-2 border-b border-r border-gray-700 last:border-r-0 min-h-[6rem] space-y-1 cursor-pointer hover:bg-gray-700/50 transition-colors">
                                    {dayShifts.map(shift => (
                                        <div key={shift.id} onClick={(e) => { e.stopPropagation(); onEditShift(shift); }} className="bg-indigo-600 text-white text-xs p-1 rounded flex items-center justify-between group cursor-pointer hover:bg-indigo-500">
                                            <span>
                                                {formatTime(shift.start)} - {formatTime(shift.end)}
                                            </span>
                                            <button 
                                                onClick={(e) => { e.stopPropagation(); if(window.confirm('Are you sure you want to delete this shift?')) onDeleteShift(shift.id); }}
                                                className="ml-1 w-4 h-4 flex-shrink-0 flex items-center justify-center rounded-full text-indigo-200 hover:bg-red-500 hover:text-white transition-colors"
                                                aria-label="Delete shift"
                                            >
                                                &times;
                                            </button>
                                        </div>
                                    ))}
                                </div>
                             )
                        })}
                    </React.Fragment>
                ))}
            </div>
        </Card>
    );
};


const CopyScheduleModal: FC<{isOpen: boolean, onClose: () => void, shifts: Shift[], onShiftsAdd: (newShifts: Omit<Shift, 'id'>[]) => void, currentDate: Date }> = 
    ({isOpen, onClose, shifts, onShiftsAdd, currentDate}) => {
    
    const handleCopy = () => {
        // Determine the source week from the previous month
        const sourceDate = new Date(currentDate);
        sourceDate.setMonth(currentDate.getMonth() - 1);

        const sourceWeekStart = new Date(sourceDate);
        sourceWeekStart.setDate(sourceDate.getDate() - sourceDate.getDay());
        sourceWeekStart.setHours(0,0,0,0);

        const sourceWeekEnd = new Date(sourceWeekStart);
        sourceWeekEnd.setDate(sourceWeekStart.getDate() + 7);

        // Calculate the time difference to add to the copied shifts
        const targetWeekStart = new Date(currentDate);
        targetWeekStart.setDate(currentDate.getDate() - currentDate.getDay());
        targetWeekStart.setHours(0,0,0,0);

        const timeDiff = targetWeekStart.getTime() - sourceWeekStart.getTime();
        
        const shiftsToCopy = shifts.filter(s => s.start >= sourceWeekStart && s.start < sourceWeekEnd);

        const newShifts = shiftsToCopy.map(s => {
            const newStart = new Date(s.start.getTime() + timeDiff);
            const newEnd = new Date(s.end.getTime() + timeDiff);
            return { employeeId: s.employeeId, start: newStart, end: newEnd };
        });

        if (window.confirm(`This will copy ${newShifts.length} shifts from the week of ${formatDate(sourceWeekStart)} to the week of ${formatDate(targetWeekStart)}. Are you sure?`)) {
            onShiftsAdd(newShifts);
            onClose();
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Copy Schedule">
            <div className="space-y-4">
                <p>This action will copy the schedule from the corresponding week of the previous month to the currently selected week.</p>
                <p className="text-sm text-gray-400">For example, it will replace the schedule for the week of <span className="font-semibold text-indigo-400">{formatDate(new Date(currentDate.setDate(currentDate.getDate() - currentDate.getDay())))}</span> with the schedule from the week of <span className="font-semibold text-indigo-400">{formatDate(new Date(new Date(currentDate).setMonth(currentDate.getMonth()-1)))}</span>.</p>
                <div className="flex justify-end gap-2 pt-4">
                    <Button onClick={onClose} variant="secondary">Cancel</Button>
                    <Button onClick={handleCopy}>Copy From Previous Month</Button>
                </div>
            </div>
        </Modal>
    );
};


const ShiftFormModal: FC<{
    isOpen: boolean;
    onClose: () => void;
    shift: Shift | null;
    employees: Employee[];
    onSubmit: (data: Omit<Shift, 'id'> | Shift) => void;
    selectedDate: Date;
    initialData: { date: Date, employeeId: string } | null;
}> = ({ isOpen, onClose, shift, employees, onSubmit, selectedDate, initialData }) => {
    
    const [employeeId, setEmployeeId] = useState('');
    const [startTime, setStartTime] = useState('08:00');
    const [endTime, setEndTime] = useState('16:00');
    const [shiftDate, setShiftDate] = useState(formatDate(selectedDate));

    useEffect(() => {
        if (shift) {
            setEmployeeId(shift.employeeId);
            setStartTime(formatTime(shift.start));
            setEndTime(formatTime(shift.end));
            setShiftDate(formatDate(shift.start));
        } else if (initialData) {
            setEmployeeId(initialData.employeeId);
            setShiftDate(formatDate(initialData.date));
            setStartTime('08:00');
            setEndTime('16:00');
        } else {
            setEmployeeId(employees.length > 0 ? employees[0].id : '');
            setStartTime('08:00');
            setEndTime('16:00');
            setShiftDate(formatDate(selectedDate));
        }
    }, [shift, employees, isOpen, selectedDate, initialData]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const baseDate = new Date(shiftDate + 'T00:00:00');
        const [startH, startM] = startTime.split(':').map(Number);
        const start = new Date(baseDate.getFullYear(), baseDate.getMonth(), baseDate.getDate(), startH, startM);

        const [endH, endM] = endTime.split(':').map(Number);
        const end = new Date(baseDate.getFullYear(), baseDate.getMonth(), baseDate.getDate(), endH, endM);
        
        if (end <= start) {
            end.setDate(end.getDate() + 1); // Handle overnight shifts
        }

        const shiftData = { employeeId, start, end };
        if (shift) {
            onSubmit({ ...shiftData, id: shift.id });
        } else {
            onSubmit(shiftData);
        }
    };
    
    return (
        <Modal isOpen={isOpen} onClose={onClose} title={shift ? 'Edit Shift' : 'Add Shift'}>
            <form onSubmit={handleSubmit} className="space-y-4">
                 <div>
                    <label className="block text-sm font-medium text-gray-300">Employee</label>
                    <select value={employeeId} onChange={e => setEmployeeId(e.target.value)} className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm p-2 text-white">
                        {employees.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
                    </select>
                </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-300">Date</label>
                    <input type="date" value={shiftDate} onChange={e => setShiftDate(e.target.value)} className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm p-2 text-white" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-300">Start Time</label>
                        <input type="time" value={startTime} onChange={e => setStartTime(e.target.value)} className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm p-2 text-white" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-300">End Time</label>
                        <input type="time" value={endTime} onChange={e => setEndTime(e.target.value)} className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm p-2 text-white" />
                    </div>
                </div>
                <div className="flex justify-end pt-4">
                    <div className="flex gap-2">
                        <Button onClick={onClose} variant="secondary" type="button">Cancel</Button>
                        <Button type="submit">Save Shift</Button>
                    </div>
                </div>
            </form>
        </Modal>
    );
};

const EmployeeManager: FC<{ employees: Employee[], onEmployeeAdd: (emp: Omit<Employee, 'id'>) => void, onEmployeeUpdate: (emp: Employee) => void, onEmployeeDelete: (id: string) => void }> = ({ employees, onEmployeeAdd, onEmployeeUpdate, onEmployeeDelete }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);

    const handleAddClick = () => {
        setEditingEmployee(null);
        setIsModalOpen(true);
    };

    const handleEditClick = (employee: Employee) => {
        setEditingEmployee(employee);
        setIsModalOpen(true);
    };

    const handleFormSubmit = (employeeData: Omit<Employee, 'id'> | Employee) => {
        if ('id' in employeeData) {
            onEmployeeUpdate(employeeData);
        } else {
            onEmployeeAdd(employeeData);
        }
        setIsModalOpen(false);
    };

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex justify-between items-center">
                <h2 className="text-3xl font-bold text-white">Manage Employees</h2>
                <Button onClick={handleAddClick}>Add Employee</Button>
            </div>
            <Card>
                <ul className="divide-y divide-gray-700">
                    {employees.map(emp => (
                        <li key={emp.id} className="py-4 flex justify-between items-center">
                            <div>
                                <p className="text-lg font-semibold text-white">{emp.name}</p>
                                <p className="text-gray-400">{emp.position} &bull; Hired: {formatDate(emp.hireDate)}</p>
                                <p className="text-gray-400">${emp.payRate.toFixed(2)} / hour</p>
                            </div>
                            <div className="flex gap-2">
                                <Button onClick={() => handleEditClick(emp)} variant="secondary">Edit</Button>
                                <Button onClick={() => {
                                    if(window.confirm(`Are you sure you want to delete ${emp.name}?`)) {
                                        onEmployeeDelete(emp.id)
                                    }
                                }} variant="danger">Delete</Button>
                            </div>
                        </li>
                    ))}
                </ul>
            </Card>
            <EmployeeFormModal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                employee={editingEmployee}
                onSubmit={handleFormSubmit}
            />
        </div>
    );
};

const EmployeeFormModal: FC<{isOpen: boolean, onClose: () => void, employee: Employee | null, onSubmit: (data: Omit<Employee, 'id'> | Employee) => void }> =
    ({isOpen, onClose, employee, onSubmit}) => {
    
    const [name, setName] = useState('');
    const [payRate, setPayRate] = useState(0);
    const [position, setPosition] = useState('');
    const [hireDate, setHireDate] = useState(formatDate(new Date()));

    useEffect(() => {
        if (employee) {
            setName(employee.name);
            setPayRate(employee.payRate);
            setPosition(employee.position);
            setHireDate(formatDate(employee.hireDate));
        } else {
            setName('');
            setPayRate(20);
            setPosition('Caregiver');
            setHireDate(formatDate(new Date()));
        }
    }, [employee, isOpen]);
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if(!name || payRate <= 0 || !position) {
            alert('Please fill out all fields.');
            return;
        }
        const employeeData = { name, payRate, position, hireDate: new Date(hireDate + 'T00:00:00') };
        if (employee) {
            onSubmit({ ...employeeData, id: employee.id });
        } else {
            onSubmit(employeeData);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={employee ? 'Edit Employee' : 'Add Employee'}>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-300">Full Name</label>
                    <input type="text" value={name} onChange={e => setName(e.target.value)} required className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm p-2 text-white" />
                </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-300">Position</label>
                    <input type="text" value={position} onChange={e => setPosition(e.target.value)} required className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm p-2 text-white" />
                </div>
                 <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-300">Pay Rate (per hour)</label>
                        <input type="number" step="0.01" value={payRate} onChange={e => setPayRate(parseFloat(e.target.value))} required className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm p-2 text-white" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-300">Hire Date</label>
                        <input type="date" value={hireDate} onChange={e => setHireDate(e.target.value)} required className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm p-2 text-white" />
                    </div>
                </div>
                <div className="flex justify-end gap-2 pt-4">
                    <Button onClick={onClose} variant="secondary" type="button">Cancel</Button>
                    <Button type="submit">Save Employee</Button>
                </div>
            </form>
        </Modal>
    );
};

const ExpenseManager: FC<{ expenses: Expense[], forecasts: ExpenseForecast[], expenseCategories: string[], onExpenseAdd: (exp: Omit<Expense, 'id'>) => void, onExpenseUpdate: (exp: Expense) => void, onExpenseDelete: (id: string) => void, onForecastUpdate: (forecast: ExpenseForecast) => void, onCategoryAdd: (name: string) => void, onCategoryDelete: (name: string) => void }> = 
    ({ expenses, forecasts, expenseCategories, onExpenseAdd, onExpenseUpdate, onExpenseDelete, onForecastUpdate, onCategoryAdd, onCategoryDelete }) => {
    
    const [view, setView] = useState<'log' | 'forecast'>('log');
    const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
    const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
    const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
    const [forecastYear, setForecastYear] = useState(new Date().getFullYear());

    const handleAddClick = () => {
        setEditingExpense(null);
        setIsExpenseModalOpen(true);
    };

    const handleEditClick = (expense: Expense) => {
        setEditingExpense(expense);
        setIsExpenseModalOpen(true);
    };

    const handleFormSubmit = (expenseData: Omit<Expense, 'id'> | Expense) => {
        if ('id' in expenseData) {
            onExpenseUpdate(expenseData);
        } else {
            onExpenseAdd(expenseData);
        }
        setIsExpenseModalOpen(false);
    };
    
    const sortedExpenses = useMemo(() => [...expenses].sort((a,b) => b.date.getTime() - a.date.getTime()), [expenses]);

    const forecastData = useMemo(() => {
        const actualsByMonthCategory: {[key: string]: number} = {};
        expenses.filter(e => e.date.getFullYear() === forecastYear).forEach(e => {
            const key = `${e.date.getMonth()+1}-${e.category}`;
            actualsByMonthCategory[key] = (actualsByMonthCategory[key] || 0) + e.amount;
        });

        return expenseCategories.map(cat => ({
            category: cat,
            months: Array.from({length: 12}, (_, i) => {
                const month = i + 1;
                const forecast = forecasts.find(f => f.year === forecastYear && f.month === month && f.category === cat);
                return {
                    month,
                    forecasted: forecast?.amount || 0,
                    actual: actualsByMonthCategory[`${month}-${cat}`] || 0
                };
            })
        }));
    }, [forecastYear, expenses, forecasts, expenseCategories]);

    const handleForecastChange = (category: string, month: number, amount: number) => {
        const id = `${forecastYear}-${month}-${category}`;
        onForecastUpdate({ id, year: forecastYear, month, category, amount });
    };

    const monthNames = Array.from({length: 12}, (_, i) => new Date(0, i).toLocaleString('default', { month: 'short' }));

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex justify-between items-center">
                <h2 className="text-3xl font-bold text-white">Manage Capital Expenses</h2>
                {view === 'log' && <Button onClick={handleAddClick}>Add Expense</Button>}
                {view === 'forecast' && (
                    <div className="flex items-center gap-4">
                         <Button onClick={() => setIsCategoryModalOpen(true)} variant="secondary">Manage Categories</Button>
                         <label className="text-sm">Year:</label>
                         <input type="number" value={forecastYear} onChange={e => setForecastYear(parseInt(e.target.value))} className="bg-gray-700 p-2 rounded-md w-24" />
                    </div>
                )}
            </div>
            
            <div className="flex gap-2 bg-gray-700 p-1 rounded-lg self-start w-min">
                <button onClick={() => setView('log')} className={`px-3 py-1 text-sm font-semibold rounded-md transition ${view === 'log' ? 'bg-indigo-600 text-white' : 'text-gray-300 hover:bg-gray-600'}`}>Expense Log</button>
                <button onClick={() => setView('forecast')} className={`px-3 py-1 text-sm font-semibold rounded-md transition ${view === 'forecast' ? 'bg-indigo-600 text-white' : 'text-gray-300 hover:bg-gray-600'}`}>Forecast vs. Actuals</button>
            </div>

            {view === 'log' && (
                <Card>
                    <ul className="divide-y divide-gray-700">
                        {sortedExpenses.map(exp => (
                            <li key={exp.id} className="py-4 flex justify-between items-center">
                                <div>
                                    <p className="text-lg font-semibold text-white">{exp.description}</p>
                                    <p className="text-sm text-gray-400">{exp.category} &bull; {formatDate(exp.date)}</p>
                                </div>
                                <div className="flex items-center gap-4">
                                   <p className="text-xl font-bold text-yellow-400">${exp.amount.toFixed(2)}</p>
                                    <div className="flex gap-2">
                                        <Button onClick={() => handleEditClick(exp)} variant="secondary">Edit</Button>
                                        <Button onClick={() => { if (window.confirm('Are you sure?')) onExpenseDelete(exp.id); }} variant="danger">Delete</Button>
                                    </div>
                                </div>
                            </li>
                        ))}
                    </ul>
                </Card>
            )}

            {view === 'forecast' && (
                <Card className="overflow-x-auto">
                    <table className="w-full text-left table-fixed">
                        <thead>
                            <tr className="border-b border-gray-600">
                                <th className="p-2 w-48 sticky left-0 bg-gray-800">Category</th>
                                {monthNames.map(m => <th key={m} className="p-2 text-center w-32">{m}</th>)}
                                <th className="p-2 text-center w-32 sticky right-0 bg-gray-800">Totals</th>
                            </tr>
                        </thead>
                        <tbody>
                            {forecastData.map(({category, months}) => {
                                const totals = months.reduce((acc, m) => {
                                    acc.forecasted += m.forecasted;
                                    acc.actual += m.actual;
                                    return acc;
                                }, { forecasted: 0, actual: 0 });
                                
                                return (
                                <tr key={category} className="border-b border-gray-700 hover:bg-gray-700/50">
                                    <td className="p-2 font-semibold text-indigo-300 whitespace-nowrap sticky left-0 bg-gray-800">{category}</td>
                                    {months.map(({month, forecasted, actual}) => {
                                        const overUnder = forecasted - actual;
                                        return (
                                        <td key={month} className="p-2">
                                            <input 
                                                type="number" 
                                                value={forecasted}
                                                onChange={e => handleForecastChange(category, month, parseFloat(e.target.value) || 0)}
                                                className="w-full bg-gray-900 rounded p-1 text-center text-white"
                                                placeholder="Forecast"
                                            />
                                            <div className={`text-xs text-center mt-1 ${overUnder < 0 ? 'text-red-400' : 'text-green-400'}`}>
                                               A: ${actual.toFixed(0)} / V: ${overUnder.toFixed(0)}
                                            </div>
                                        </td>
                                    )})}
                                    <td className="p-2 font-bold sticky right-0 bg-gray-800">
                                        <div className="text-center text-white">${totals.forecasted.toFixed(0)}</div>
                                        <div className={`text-xs text-center mt-1 ${totals.forecasted - totals.actual < 0 ? 'text-red-400' : 'text-green-400'}`}>
                                            A: ${totals.actual.toFixed(0)} / V: ${(totals.forecasted - totals.actual).toFixed(0)}
                                        </div>
                                    </td>
                                </tr>
                            )})}
                        </tbody>
                         <tfoot>
                            <tr className="border-t-2 border-gray-500 bg-gray-900">
                                <th className="p-2 sticky left-0 bg-gray-900">Monthly Totals</th>
                                {Array.from({length: 12}, (_, i) => {
                                    const monthIndex = i;
                                    const monthlyTotal = forecastData.reduce((acc, {months}) => {
                                        acc.forecasted += months[monthIndex].forecasted;
                                        acc.actual += months[monthIndex].actual;
                                        return acc;
                                    }, {forecasted: 0, actual: 0});
                                    return (
                                        <td key={i} className="p-2 text-center font-bold">
                                            <div>${monthlyTotal.forecasted.toFixed(0)}</div>
                                            <div className="text-xs text-gray-400">${monthlyTotal.actual.toFixed(0)}</div>
                                        </td>
                                    );
                                })}
                                <td className="p-2 text-center font-bold sticky right-0 bg-gray-900">
                                    {(() => {
                                        // FIX: Removed redundant `.flat()` method. It was likely causing type inference issues.
                                        const grandTotal = forecastData.reduce((acc, {months}) => {
                                            months.forEach(m => {
                                                acc.forecasted += m.forecasted;
                                                acc.actual += m.actual;
                                            });
                                            return acc;
                                        }, {forecasted: 0, actual: 0});
                                        return (
                                            <>
                                            <div>${grandTotal.forecasted.toFixed(0)}</div>
                                            <div className="text-xs text-gray-400">${grandTotal.actual.toFixed(0)}</div>
                                            </>
                                        );
                                    })()}
                                </td>
                            </tr>
                        </tfoot>
                    </table>
                </Card>
            )}

            <ExpenseFormModal 
                isOpen={isExpenseModalOpen}
                onClose={() => setIsExpenseModalOpen(false)}
                expense={editingExpense}
                onSubmit={handleFormSubmit}
                categories={expenseCategories}
            />
            <CategoryManagerModal
                isOpen={isCategoryModalOpen}
                onClose={() => setIsCategoryModalOpen(false)}
                categories={expenseCategories}
                onAdd={onCategoryAdd}
                onDelete={onCategoryDelete}
            />
        </div>
    );
};

const CategoryManagerModal: FC<{isOpen: boolean, onClose: () => void, categories: string[], onAdd: (name: string) => void, onDelete: (name: string) => void}> = 
({isOpen, onClose, categories, onAdd, onDelete}) => {
    const [newCategory, setNewCategory] = useState('');

    const handleAdd = () => {
        onAdd(newCategory);
        setNewCategory('');
    };
    
    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Manage Expense Categories">
            <div className="space-y-4">
                <div>
                    <h4 className="font-semibold mb-2">Add New Category</h4>
                    <div className="flex gap-2">
                        <input type="text" value={newCategory} onChange={e => setNewCategory(e.target.value)} className="flex-grow bg-gray-700 border-gray-600 rounded-md shadow-sm p-2 text-white" placeholder="Category Name"/>
                        <Button onClick={handleAdd}>Add</Button>
                    </div>
                </div>
                <div>
                     <h4 className="font-semibold mb-2">Existing Categories</h4>
                     <ul className="space-y-2 max-h-60 overflow-y-auto bg-gray-900 p-2 rounded">
                        {categories.map(cat => (
                            <li key={cat} className="flex justify-between items-center bg-gray-700 p-2 rounded">
                                <span>{cat}</span>
                                <Button onClick={() => onDelete(cat)} variant="danger" className="px-2 py-1 text-xs">Delete</Button>
                            </li>
                        ))}
                     </ul>
                </div>
                 <div className="flex justify-end pt-4">
                    <Button onClick={onClose} variant="secondary">Close</Button>
                </div>
            </div>
        </Modal>
    );
};


const ExpenseFormModal: FC<{isOpen: boolean, onClose: () => void, expense: Expense | null, onSubmit: (data: Omit<Expense, 'id'> | Expense) => void, categories: string[] }> =
 ({isOpen, onClose, expense, onSubmit, categories}) => {
    
    const [date, setDate] = useState(formatDate(new Date()));
    const [category, setCategory] = useState<string>(categories[0]);
    const [description, setDescription] = useState('');
    const [amount, setAmount] = useState(0);

    useEffect(() => {
        if(expense) {
            setDate(formatDate(expense.date));
            setCategory(expense.category);
            setDescription(expense.description);
            setAmount(expense.amount);
        } else {
            setDate(formatDate(new Date()));
            setCategory(categories[0] || '');
            setDescription('');
            setAmount(0);
        }
    }, [expense, isOpen, categories]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if(!description || amount <= 0) {
            alert('Please provide a valid description and amount.');
            return;
        }
        const expenseData = { date: new Date(date + 'T00:00:00'), category, description, amount };
        if (expense) {
            onSubmit({ ...expenseData, id: expense.id });
        } else {
            onSubmit(expenseData);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={expense ? 'Edit Expense' : 'Add Expense'}>
            <form onSubmit={handleSubmit} className="space-y-4">
                 <div>
                    <label className="block text-sm font-medium text-gray-300">Date</label>
                    <input type="date" value={date} onChange={e => setDate(e.target.value)} required className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm p-2 text-white" />
                </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-300">Category</label>
                    <select value={category} onChange={e => setCategory(e.target.value)} className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm p-2 text-white">
                        {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                    </select>
                </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-300">Description</label>
                    <input type="text" value={description} onChange={e => setDescription(e.target.value)} required className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm p-2 text-white" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-300">Amount</label>
                    <input type="number" step="0.01" value={amount} onChange={e => setAmount(parseFloat(e.target.value))} required className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm p-2 text-white" />
                </div>
                 <div className="flex justify-end gap-2 pt-4">
                    <Button onClick={onClose} variant="secondary" type="button">Cancel</Button>
                    <Button type="submit">Save Expense</Button>
                </div>
            </form>
        </Modal>
    );
 };

const SalaryExpenses: FC<{ shifts: Shift[], employees: Employee[] }> = ({ shifts, employees }) => {
    const [period, setPeriod] = useState<'Day' | 'Week' | 'Month' | 'Year'>('Month');
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [selectedEmployeeIds, setSelectedEmployeeIds] = useState<string[]>(() => employees.map(e => e.id));

    const handleEmployeeSelection = (empId: string) => {
        setSelectedEmployeeIds(prev =>
            prev.includes(empId) ? prev.filter(id => id !== empId) : [...prev, empId]
        );
    };

    const selectAllEmployees = () => setSelectedEmployeeIds(employees.map(e => e.id));
    const deselectAllEmployees = () => setSelectedEmployeeIds([]);

    const { salaryData, totalSalary } = useMemo(() => {
        const now = selectedDate;
        let start: Date, end: Date;

        switch (period) {
            case 'Day':
                start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                end = new Date(start.getTime() + 24 * 60 * 60 * 1000);
                break;
            case 'Week':
                start = new Date(now);
                start.setDate(now.getDate() - now.getDay());
                start.setHours(0, 0, 0, 0);
                end = new Date(start);
                end.setDate(start.getDate() + 7);
                break;
            case 'Month':
                start = new Date(now.getFullYear(), now.getMonth(), 1);
                end = new Date(now.getFullYear(), now.getMonth() + 1, 1);
                break;
            case 'Year':
                start = new Date(now.getFullYear(), 0, 1);
                end = new Date(now.getFullYear() + 1, 0, 1);
                break;
        }

        const filteredShifts = shifts.filter(s =>
            s.start >= start && s.start < end && selectedEmployeeIds.includes(s.employeeId)
        );

        const employeeMap = new Map(employees.map(e => [e.id, e]));
        const dataByEmployee: { [empId: string]: { name: string; totalHours: number; totalPay: number } } = {};
        
        for (const empId of selectedEmployeeIds) {
            const employee = employeeMap.get(empId);
            if (employee) {
                dataByEmployee[empId] = { name: employee.name, totalHours: 0, totalPay: 0 };
            }
        }

        let total = 0;
        for (const shift of filteredShifts) {
            const employee = employeeMap.get(shift.employeeId);
            if (employee) {
                const hours = getHoursDifference(shift.start, shift.end);
                const pay = hours * employee.payRate;
                total += pay;
                if (dataByEmployee[shift.employeeId]) {
                    dataByEmployee[shift.employeeId].totalHours += hours;
                    dataByEmployee[shift.employeeId].totalPay += pay;
                }
            }
        }
        
        const salaryDataArray = Object.values(dataByEmployee).filter(d => d.totalPay > 0).sort((a,b) => b.totalPay - a.totalPay);

        return { salaryData: salaryDataArray, totalSalary: total };
    }, [period, selectedDate, selectedEmployeeIds, shifts, employees]);

    const changeDate = (amount: number) => {
        setSelectedDate(prev => {
            const newDate = new Date(prev);
            switch (period) {
                case 'Day': newDate.setDate(newDate.getDate() + amount); break;
                case 'Week': newDate.setDate(newDate.getDate() + amount * 7); break;
                case 'Month': newDate.setMonth(newDate.getMonth() + amount); break;
                case 'Year': newDate.setFullYear(newDate.getFullYear() + amount); break;
            }
            return newDate;
        });
    };

    const getDateDisplay = () => {
        switch (period) {
            case 'Day': return formatDate(selectedDate);
            case 'Week':
                const weekStart = new Date(selectedDate);
                weekStart.setDate(selectedDate.getDate() - selectedDate.getDay());
                const weekEnd = new Date(weekStart);
                weekEnd.setDate(weekStart.getDate() + 6);
                return `${formatDate(weekStart)} to ${formatDate(weekEnd)}`;
            case 'Month': return selectedDate.toLocaleString('default', { month: 'long', year: 'numeric' });
            case 'Year': return selectedDate.getFullYear().toString();
        }
    };
    
    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex justify-between items-center">
                <h2 className="text-3xl font-bold text-white">Salary Expenses</h2>
                 <div className="flex gap-2 bg-gray-700 p-1 rounded-lg">
                    {(['Day', 'Week', 'Month', 'Year'] as const).map(p => (
                        <button key={p} onClick={() => setPeriod(p)} className={`px-3 py-1 text-sm font-semibold rounded-md transition ${period === p ? 'bg-indigo-600 text-white' : 'text-gray-300 hover:bg-gray-600'}`}>
                            {p}
                        </button>
                    ))}
                 </div>
            </div>
             <Card>
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <Button onClick={() => changeDate(-1)} variant="secondary">&lt; Prev</Button>
                         <span className="text-lg font-semibold text-center w-64">{getDateDisplay()}</span>
                        <Button onClick={() => changeDate(1)} variant="secondary">Next &gt;</Button>
                    </div>
                </div>
            </Card>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-1">
                    <h3 className="text-xl font-semibold mb-4">Filter Employees</h3>
                    <div className="flex gap-2 mb-4">
                        <Button onClick={selectAllEmployees} variant="secondary" className="flex-1 text-sm">Select All</Button>
                        <Button onClick={deselectAllEmployees} variant="secondary" className="flex-1 text-sm">Deselect All</Button>
                    </div>
                    <div className="space-y-2 max-h-96 overflow-y-auto pr-2">
                        {employees.map(emp => (
                            <label key={emp.id} className="flex items-center space-x-3 p-2 rounded-md hover:bg-gray-700 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={selectedEmployeeIds.includes(emp.id)}
                                    onChange={() => handleEmployeeSelection(emp.id)}
                                    className="h-4 w-4 rounded bg-gray-600 border-gray-500 text-indigo-600 focus:ring-indigo-500"
                                    aria-label={`Select ${emp.name}`}
                                />
                                <span className="text-white">{emp.name}</span>
                            </label>
                        ))}
                    </div>
                </Card>
                 <div className="lg:col-span-2 space-y-6">
                    <Card>
                         <h3 className="text-gray-400">Total Salaries for Period</h3>
                         <p className="text-4xl font-bold text-cyan-400">${totalSalary.toFixed(2)}</p>
                    </Card>
                    <Card>
                        <h3 className="text-xl font-semibold mb-4">Salary Breakdown by Employee</h3>
                         <div className="max-h-[26rem] overflow-y-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="border-b border-gray-600">
                                        <th className="p-2">Employee</th>
                                        <th className="p-2 text-right">Total Hours</th>
                                        <th className="p-2 text-right">Total Pay</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {salaryData.map(data => (
                                        <tr key={data.name} className="border-b border-gray-700 hover:bg-gray-700/50">
                                            <td className="p-2 font-semibold text-indigo-300">{data.name}</td>
                                            <td className="p-2 text-right">{data.totalHours.toFixed(2)}</td>
                                            <td className="p-2 text-right font-semibold text-yellow-400">${data.totalPay.toFixed(2)}</td>
                                        </tr>
                                    ))}
                                    {salaryData.length === 0 && (
                                        <tr>
                                            <td colSpan={3} className="text-center p-4 text-gray-500">No salary data for selected employees and period.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                         </div>
                    </Card>
                 </div>
            </div>
        </div>
    );
};
 
const RevenueManager: FC<{ residents: Resident[], allowances: Allowance[], rooms: Room[], tenancies: Tenancy[], onRoomUpdate: (rooms: Room[]) => void, onTenancyAdd: (tenancy: Omit<Tenancy, 'id'>) => void, onTenancyUpdate: (tenancy: Tenancy) => void, onResidentAdd: (res: Omit<Resident, 'id'>) => void, onResidentUpdate: (res: Resident) => void, onResidentDelete: (id: string) => void, onAllowanceAdd: (all: Omit<Allowance, 'id'>) => void, onAllowanceDelete: (id: string) => void }> = 
    (props) => {
    
    const [isResidentModalOpen, setIsResidentModalOpen] = useState(false);
    const [isAllowanceModalOpen, setIsAllowanceModalOpen] = useState(false);
    const [isRoomSetupModalOpen, setIsRoomSetupModalOpen] = useState(false);
    const [isTenancyModalOpen, setIsTenancyModalOpen] = useState(false);
    
    const [editingResident, setEditingResident] = useState<Resident | null>(null);
    const [editingTenancy, setEditingTenancy] = useState<Tenancy | null>(null);
    const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);

    const [viewDate, setViewDate] = useState(new Date());

    const handleAddResidentClick = () => {
        setEditingResident(null);
        setIsResidentModalOpen(true);
    };

    const handleEditResidentClick = (resident: Resident) => {
        setEditingResident(resident);
        setIsResidentModalOpen(true);
    };
    
    const handleAssignClick = (roomId: string) => {
        setSelectedRoomId(roomId);
        setEditingTenancy(null);
        setIsTenancyModalOpen(true);
    };
    
    const handleEditTenancyClick = (tenancy: Tenancy) => {
        setSelectedRoomId(tenancy.roomId);
        setEditingTenancy(tenancy);
        setIsTenancyModalOpen(true);
    };

    const handleTenancyFormSubmit = (tenancyData: Omit<Tenancy, 'id'> | Tenancy) => {
        if ('id' in tenancyData) {
            props.onTenancyUpdate(tenancyData);
        } else {
            props.onTenancyAdd(tenancyData);
        }
        setIsTenancyModalOpen(false);
    };

    const handleResidentFormSubmit = (residentData: Omit<Resident, 'id'> | Resident) => {
        if ('id' in residentData) {
            props.onResidentUpdate(residentData);
        } else {
            props.onResidentAdd(residentData);
        }
        setIsResidentModalOpen(false);
    };

    const handleAllowanceFormSubmit = (allowanceData: Omit<Allowance, 'id'>) => {
        props.onAllowanceAdd(allowanceData);
        setIsAllowanceModalOpen(false);
    };

    const allowancesWithResidentNames = useMemo(() => props.allowances.map(a => {
        const resident = props.residents.find(r => r.id === a.residentId);
        return { ...a, residentName: resident?.name || 'Unknown' };
    }).sort((a,b) => b.date.getTime() - a.date.getTime()), [props.allowances, props.residents]);
    
    const getTenancyForRoom = (roomId: string, date: Date): (Tenancy & {residentName: string}) | null => {
        const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
        const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);

        const activeTenancy = props.tenancies.find(t => 
            t.roomId === roomId &&
            new Date(t.startDate) <= monthEnd &&
            (!t.endDate || new Date(t.endDate) >= monthStart)
        );

        if (activeTenancy) {
            const resident = props.residents.find(r => r.id === activeTenancy.residentId);
            return { ...activeTenancy, residentName: resident?.name || 'Unknown' };
        }
        return null;
    };
    
    return (
        <div className="space-y-8 animate-fade-in">
             <div className="flex justify-between items-center">
                <h2 className="text-3xl font-bold text-white">Room & Revenue Management</h2>
                <div className="flex gap-4 items-center">
                    <input type="month" value={`${viewDate.getFullYear()}-${(viewDate.getMonth()+1).toString().padStart(2,'0')}`} 
                           onChange={e => setViewDate(new Date(e.target.value + '-02T00:00:00'))}
                           className="bg-gray-700 p-2 rounded-md"
                    />
                    <Button onClick={() => setIsRoomSetupModalOpen(true)} variant="secondary">Setup Rooms</Button>
                </div>
            </div>
            
            <Card>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                    {props.rooms.map(room => {
                        const tenancy = getTenancyForRoom(room.id, viewDate);
                        return (
                            <div key={room.id} className={`p-4 rounded-lg border-2 ${tenancy ? 'border-green-500 bg-green-500/10' : 'border-gray-600'}`}>
                                <h4 className="font-bold text-lg text-white">Room {room.roomNumber}</h4>
                                {tenancy ? (
                                    <div className="text-sm mt-2">
                                        <p className="font-semibold text-gray-200">{tenancy.residentName}</p>
                                        <p className="text-gray-400">${tenancy.monthlyRate}/mo</p>
                                        <p className="text-gray-400">Since: {formatDate(tenancy.startDate)}</p>
                                        <Button onClick={() => handleEditTenancyClick(tenancy)} variant="secondary" className="w-full mt-2 py-1 text-xs">Edit Tenancy</Button>
                                    </div>
                                ) : (
                                     <div className="text-sm mt-2">
                                        <p className="text-gray-400">Vacant</p>
                                        <Button onClick={() => handleAssignClick(room.id)} className="w-full mt-2 py-1 text-xs">Assign Resident</Button>
                                    </div>
                                )}
                            </div>
                        )
                    })}
                </div>
            </Card>

            <div>
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-3xl font-bold text-white">Manage Residents</h2>
                    <Button onClick={handleAddResidentClick}>Add Resident</Button>
                </div>
                <Card>
                    <ul className="divide-y divide-gray-700">
                        {props.residents.map(res => (
                            <li key={res.id} className="py-4 flex justify-between items-center">
                                <p className="text-lg font-semibold text-white">{res.name}</p>
                                <div className="flex gap-2">
                                    <Button onClick={() => handleEditResidentClick(res)} variant="secondary">Edit</Button>
                                    <Button onClick={() => { if(window.confirm('Are you sure?')) props.onResidentDelete(res.id); }} variant="danger">Delete</Button>
                                </div>
                            </li>
                        ))}
                    </ul>
                </Card>
            </div>
             <div>
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-3xl font-bold text-white">Resident Allowances</h2>
                    <Button onClick={() => setIsAllowanceModalOpen(true)} disabled={props.residents.length === 0}>Add Allowance</Button>
                </div>
                <Card>
                     <ul className="divide-y divide-gray-700">
                        {allowancesWithResidentNames.map(allow => (
                            <li key={allow.id} className="py-4 flex justify-between items-center">
                                <div>
                                    <p className="text-lg font-semibold text-white">{allow.description}</p>
                                    <p className="text-sm text-gray-400">{allow.residentName} &bull; {formatDate(allow.date)}</p>
                                </div>
                                <div className="flex items-center gap-4">
                                   <p className="text-xl font-bold text-yellow-400">${allow.amount.toFixed(2)}</p>
                                   <Button onClick={() => { if (window.confirm('Are you sure?')) props.onAllowanceDelete(allow.id); }} variant="danger">Delete</Button>
                                </div>
                            </li>
                        ))}
                    </ul>
                </Card>
            </div>
            <ResidentFormModal isOpen={isResidentModalOpen} onClose={() => setIsResidentModalOpen(false)} resident={editingResident} onSubmit={handleResidentFormSubmit} />
            <AllowanceFormModal isOpen={isAllowanceModalOpen} onClose={() => setIsAllowanceModalOpen(false)} residents={props.residents} onSubmit={handleAllowanceFormSubmit} />
            <RoomSetupModal isOpen={isRoomSetupModalOpen} onClose={() => setIsRoomSetupModalOpen(false)} currentRoomCount={props.rooms.length} onSave={props.onRoomUpdate} />
            <TenancyFormModal isOpen={isTenancyModalOpen} onClose={() => setIsTenancyModalOpen(false)} tenancy={editingTenancy} residents={props.residents} roomId={selectedRoomId} onSubmit={handleTenancyFormSubmit} />
        </div>
    );
};

const RoomSetupModal: FC<{isOpen: boolean, onClose: () => void, currentRoomCount: number, onSave: (rooms: Room[]) => void}> = ({isOpen, onClose, currentRoomCount, onSave}) => {
    const [numRooms, setNumRooms] = useState(currentRoomCount);
    
    useEffect(() => {
        setNumRooms(currentRoomCount);
    }, [currentRoomCount, isOpen]);
    
    const handleSave = () => {
        if(window.confirm(`This will set the number of rooms to ${numRooms}. This may remove existing rooms and their tenancy assignments. Are you sure?`)) {
            const newRooms = Array.from({length: numRooms}, (_, i) => ({ id: `room${i+1}`, roomNumber: (101+i).toString() }));
            onSave(newRooms);
            onClose();
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Setup Facility Rooms">
            <div className="space-y-4">
                <p>Select the total number of rooms available in your facility.</p>
                <div className="flex items-center gap-2">
                    <label>Number of Rooms:</label>
                    <input type="number" value={numRooms} onChange={e => setNumRooms(parseInt(e.target.value))} className="w-24 bg-gray-700 p-2 rounded-md" />
                </div>
                 <div className="flex justify-end gap-2 pt-4">
                    <Button onClick={onClose} variant="secondary">Cancel</Button>
                    <Button onClick={handleSave}>Save Settings</Button>
                </div>
            </div>
        </Modal>
    );
}

const TenancyFormModal: FC<{isOpen: boolean, onClose: () => void, tenancy: Tenancy | null, roomId: string | null, residents: Resident[], onSubmit: (data: Omit<Tenancy, 'id'> | Tenancy) => void}> = 
({isOpen, onClose, tenancy, roomId, residents, onSubmit}) => {
    
    const [residentId, setResidentId] = useState('');
    const [startDate, setStartDate] = useState(formatDate(new Date()));
    const [endDate, setEndDate] = useState('');
    const [monthlyRate, setMonthlyRate] = useState(5000);
    
    useEffect(() => {
        if(tenancy) {
            setResidentId(tenancy.residentId);
            setStartDate(formatDate(tenancy.startDate));
            setEndDate(tenancy.endDate ? formatDate(tenancy.endDate) : '');
            setMonthlyRate(tenancy.monthlyRate);
        } else {
            setResidentId(residents.length > 0 ? residents[0].id : '');
            setStartDate(formatDate(new Date()));
            setEndDate('');
            setMonthlyRate(5000);
        }
    }, [tenancy, isOpen, residents]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!roomId || !residentId || !startDate || monthlyRate <= 0) {
            alert('Please fill out all required fields.');
            return;
        }

        const tenancyData = { 
            roomId, 
            residentId, 
            startDate: new Date(startDate + 'T00:00:00'),
            endDate: endDate ? new Date(endDate + 'T00:00:00') : null,
            monthlyRate
        };

        if (tenancy) {
            onSubmit({ ...tenancyData, id: tenancy.id });
        } else {
            onSubmit(tenancyData);
        }
    };
    
    return (
        <Modal isOpen={isOpen} onClose={onClose} title={tenancy ? "Edit Tenancy" : "Assign Resident to Room"}>
             <form onSubmit={handleSubmit} className="space-y-4">
                 <div>
                    <label className="block text-sm font-medium text-gray-300">Resident</label>
                    <select value={residentId} onChange={e => setResidentId(e.target.value)} required className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm p-2 text-white">
                        <option value="">Select Resident...</option>
                        {residents.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                    </select>
                </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-300">Monthly Rate</label>
                    <input type="number" step="0.01" value={monthlyRate} onChange={e => setMonthlyRate(parseFloat(e.target.value))} required className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm p-2 text-white" />
                </div>
                 <div className="grid grid-cols-2 gap-4">
                     <div>
                        <label className="block text-sm font-medium text-gray-300">Start Date (Move-in)</label>
                        <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} required className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm p-2 text-white" />
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-300">End Date (Move-out)</label>
                        <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm p-2 text-white" />
                    </div>
                 </div>
                 <div className="flex justify-end gap-2 pt-4">
                    <Button onClick={onClose} variant="secondary" type="button">Cancel</Button>
                    <Button type="submit">Save Tenancy</Button>
                </div>
             </form>
        </Modal>
    );
};

const ResidentFormModal: FC<{isOpen: boolean, onClose: () => void, resident: Resident | null, onSubmit: (data: Omit<Resident, 'id'> | Resident) => void }> =
 ({isOpen, onClose, resident, onSubmit}) => {
    const [name, setName] = useState('');

    useEffect(() => {
        if (resident) {
            setName(resident.name);
        } else {
            setName('');
        }
    }, [resident, isOpen]);
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if(!name) {
            alert('Please provide a name.');
            return;
        }
        const residentData = { name };
        if (resident) {
            onSubmit({ ...residentData, id: resident.id });
        } else {
            onSubmit(residentData);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={resident ? 'Edit Resident' : 'Add Resident'}>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-300">Full Name</label>
                    <input type="text" value={name} onChange={e => setName(e.target.value)} required className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm p-2 text-white" />
                </div>
                <div className="flex justify-end gap-2 pt-4">
                    <Button onClick={onClose} variant="secondary" type="button">Cancel</Button>
                    <Button type="submit">Save Resident</Button>
                </div>
            </form>
        </Modal>
    );
};

const AllowanceFormModal: FC<{isOpen: boolean, onClose: () => void, residents: Resident[], onSubmit: (data: Omit<Allowance, 'id'>) => void }> =
 ({isOpen, onClose, residents, onSubmit}) => {
    const [residentId, setResidentId] = useState('');
    const [date, setDate] = useState(formatDate(new Date()));
    const [description, setDescription] = useState('');
    const [amount, setAmount] = useState(50);

    useEffect(() => {
        if (isOpen) {
            setResidentId(residents.length > 0 ? residents[0].id : '');
            setDate(formatDate(new Date()));
            setDescription('Weekly allowance');
            setAmount(50);
        }
    }, [isOpen, residents]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if(!residentId || !description || amount <= 0) {
            alert('Please fill out all fields.');
            return;
        }
        onSubmit({ residentId, date: new Date(date + 'T00:00:00'), description, amount });
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Add Allowance">
            <form onSubmit={handleSubmit} className="space-y-4">
                 <div>
                    <label className="block text-sm font-medium text-gray-300">Resident</label>
                    <select value={residentId} onChange={e => setResidentId(e.target.value)} className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm p-2 text-white">
                        {residents.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                    </select>
                </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-300">Date</label>
                    <input type="date" value={date} onChange={e => setDate(e.target.value)} required className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm p-2 text-white" />
                </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-300">Description</label>
                    <input type="text" value={description} onChange={e => setDescription(e.target.value)} required className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm p-2 text-white" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-300">Amount</label>
                    <input type="number" step="0.01" value={amount} onChange={e => setAmount(parseFloat(e.target.value))} required className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm p-2 text-white" />
                </div>
                 <div className="flex justify-end gap-2 pt-4">
                    <Button onClick={onClose} variant="secondary" type="button">Cancel</Button>
                    <Button type="submit">Save Allowance</Button>
                </div>
            </form>
        </Modal>
    );
};
const App: FC = () => {
    const [userRole, setUserRole] = useState<UserRole | null>(null);

    const [employees, setEmployees] = useState<Employee[]>(initialEmployees);
    const [shifts, setShifts] = useState<Shift[]>(initialShifts);
    const [expenses, setExpenses] = useState<Expense[]>(initialExpenses);
    const [expenseCategories, setExpenseCategories] = useState<string[]>(initialExpenseCategories);
    const [residents, setResidents] = useState<Resident[]>(initialResidents);
    const [allowances, setAllowances] = useState<Allowance[]>(initialAllowances);
    const [forecasts, setForecasts] = useState<ExpenseForecast[]>(initialForecasts);
    const [rooms, setRooms] = useState<Room[]>(initialRooms);
    const [tenancies, setTenancies] = useState<Tenancy[]>(initialTenancies);

    const [currentView, setCurrentView] = useState<ViewType>('Dashboard');
    const [isExportModalOpen, setIsExportModalOpen] = useState(false);

    useEffect(() => {
        if(userRole === 'Supervisor' && ['Dashboard', 'Capital Expenses', 'Salary Expenses', 'Revenue'].includes(currentView)) {
            setCurrentView('Scheduler');
        }
    }, [userRole, currentView]);

    // CRUD Functions
    const addEmployee = (employee: Omit<Employee, 'id'>) => setEmployees(prev => [...prev, { ...employee, id: Date.now().toString() }]);
    const updateEmployee = (updatedEmployee: Employee) => setEmployees(prev => prev.map(e => e.id === updatedEmployee.id ? updatedEmployee : e));
    const deleteEmployee = (id: string) => {
        setEmployees(prev => prev.filter(e => e.id !== id));
        setShifts(prev => prev.filter(s => s.employeeId !== id));
    };
    
    const addShift = (shift: Omit<Shift, 'id'>) => setShifts(prev => [...prev, { ...shift, id: Date.now().toString() }]);
    const addShifts = (newShifts: Omit<Shift, 'id'>[]) => setShifts(prev => [...prev, ...newShifts.map(s => ({...s, id: `s_${Math.random()}`}))]);
    const updateShift = (updatedShift: Shift) => setShifts(prev => prev.map(s => s.id === updatedShift.id ? updatedShift : s));
    const deleteShift = (id: string) => setShifts(prev => prev.filter(s => s.id !== id));

    const addExpense = (expense: Omit<Expense, 'id'>) => setExpenses(prev => [...prev, { ...expense, id: Date.now().toString() }]);
    const updateExpense = (updatedExpense: Expense) => setExpenses(prev => prev.map(e => e.id === updatedExpense.id ? updatedExpense : e));
    const deleteExpense = (id: string) => setExpenses(prev => prev.filter(e => e.id !== id));

    const addExpenseCategory = (categoryName: string) => {
        if (categoryName && !expenseCategories.find(c => c.toLowerCase() === categoryName.toLowerCase())) {
            setExpenseCategories(prev => [...prev, categoryName].sort());
        } else {
            alert('Category already exists or is empty.');
        }
    };
    
    const deleteExpenseCategory = (categoryName: string) => {
        const isUsed = expenses.some(e => e.category === categoryName) || forecasts.some(f => f.category === categoryName);
        if (isUsed) {
            alert('Cannot delete category as it is currently in use in expenses or forecasts.');
            return;
        }
        if (window.confirm(`Are you sure you want to delete the category "${categoryName}"?`)) {
            setExpenseCategories(prev => prev.filter(c => c !== categoryName));
        }
    };

    const addResident = (resident: Omit<Resident, 'id'>) => setResidents(prev => [...prev, { ...resident, id: Date.now().toString() }]);
    const updateResident = (updatedResident: Resident) => setResidents(prev => prev.map(r => r.id === updatedResident.id ? updatedResident : r));
    const deleteResident = (id: string) => {
        setResidents(prev => prev.filter(r => r.id !== id));
        setAllowances(prev => prev.filter(a => a.residentId !== id));
        setTenancies(prev => prev.filter(t => t.residentId !== id));
    };

    const addAllowance = (allowance: Omit<Allowance, 'id'>) => setAllowances(prev => [...prev, { ...allowance, id: Date.now().toString() }]);
    const deleteAllowance = (id: string) => setAllowances(prev => prev.filter(a => a.id !== id));
    
    const updateForecast = (forecast: ExpenseForecast) => {
        setForecasts(prev => {
            const existing = prev.find(f => f.id === forecast.id);
            if (existing) {
                return prev.map(f => f.id === forecast.id ? forecast : f);
            }
            return [...prev, forecast];
        });
    };

    const updateRooms = (newRooms: Room[]) => {
        setRooms(newRooms);
        const roomIds = new Set(newRooms.map(r => r.id));
        setTenancies(prev => prev.filter(t => roomIds.has(t.roomId)));
    }
    const addTenancy = (tenancy: Omit<Tenancy, 'id'>) => setTenancies(prev => [...prev, {...tenancy, id: Date.now().toString()}]);
    const updateTenancy = (updatedTenancy: Tenancy) => setTenancies(prev => prev.map(t => t.id === updatedTenancy.id ? updatedTenancy : t));
    
    const handleExport = () => {
        exportToExcel({
            Employees: employees.map(e => ({...e, hireDate: formatDate(e.hireDate)})),
            Shifts: shifts.map(s => ({...s, employeeName: employees.find(e => e.id === s.employeeId)?.name, start: s.start.toISOString(), end: s.end.toISOString()})),
            Expenses: expenses.map(e => ({...e, date: formatDate(e.date)})),
            Forecasts: forecasts,
            Rooms: rooms,
            Tenancies: tenancies.map(t => ({...t, residentName: residents.find(r => r.id === t.residentId)?.name, startDate: formatDate(t.startDate), endDate: t.endDate ? formatDate(t.endDate) : ''})),
            Residents: residents,
            Allowances: allowances.map(a => ({...a, residentName: residents.find(r => r.id === a.residentId)?.name, date: formatDate(a.date)}))
        });
        setIsExportModalOpen(false);
    };


    const NavButton: FC<{ view: ViewType, children: React.ReactNode }> = ({ view, children }) => {
        const isActive = currentView === view;
        return (
            <button onClick={() => setCurrentView(view)} className={`px-4 py-2 rounded-md font-medium transition-colors ${isActive ? 'bg-indigo-600 text-white' : 'text-gray-300 hover:bg-gray-700'}`}>
                {children}
            </button>
        );
    };

    const renderView = () => {
        switch (currentView) {
            case 'Dashboard':
                return <FinancialDashboard tenancies={tenancies} shifts={shifts} expenses={expenses} employees={employees} allowances={allowances} />;
            case 'Scheduler':
                return <Scheduler employees={employees} shifts={shifts} onShiftsAdd={addShifts} onShiftAdd={addShift} onShiftUpdate={updateShift} onShiftDelete={deleteShift} />;
            case 'Employees':
                return <EmployeeManager employees={employees} onEmployeeAdd={addEmployee} onEmployeeUpdate={updateEmployee} onEmployeeDelete={deleteEmployee} />;
            case 'Capital Expenses':
                return <ExpenseManager expenses={expenses} forecasts={forecasts} expenseCategories={expenseCategories} onExpenseAdd={addExpense} onExpenseUpdate={updateExpense} onExpenseDelete={deleteExpense} onForecastUpdate={updateForecast} onCategoryAdd={addExpenseCategory} onCategoryDelete={deleteExpenseCategory} />;
            case 'Salary Expenses':
                return <SalaryExpenses shifts={shifts} employees={employees} />;
            case 'Revenue':
                 return <RevenueManager 
                            residents={residents} 
                            allowances={allowances} 
                            rooms={rooms}
                            tenancies={tenancies}
                            onRoomUpdate={updateRooms}
                            onTenancyAdd={addTenancy}
                            onTenancyUpdate={updateTenancy}
                            onResidentAdd={addResident} 
                            onResidentUpdate={updateResident} 
                            onResidentDelete={deleteResident} 
                            onAllowanceAdd={addAllowance} 
                            onAllowanceDelete={deleteAllowance} />;
            default:
                return null;
        }
    };
    
    if (!userRole) {
        return <LoginScreen onLogin={setUserRole} />;
    }

    return (
        <div className="min-h-screen text-gray-100 font-sans flex flex-col">
            <header className="bg-gray-800 shadow-md sticky top-0 z-40">
                <nav className="container mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center py-2">
                     <div className="flex items-center">
                        <img src={LOGO_BASE64} alt="TJM Technologies Logo" className="h-16 w-auto rounded-md" style={{ filter: 'invert(1)' }} />
                        <span className="text-xl font-normal text-gray-400 mx-3">|</span>
                        <span className="font-semibold text-white text-lg">CareHome Business Suite</span>
                    </div>
                    <div className="flex items-center space-x-2">
                        {userRole === 'Owner' && <NavButton view="Dashboard">Dashboard</NavButton>}
                        <NavButton view="Scheduler">Scheduler</NavButton>
                        <NavButton view="Employees">Employees</NavButton>
                        {userRole === 'Owner' && <NavButton view="Capital Expenses">Capital Expenses</NavButton>}
                        {userRole === 'Owner' && <NavButton view="Salary Expenses">Salary Expenses</NavButton>}
                        {userRole === 'Owner' && <NavButton view="Revenue">Revenue</NavButton>}
                        <Button onClick={() => setIsExportModalOpen(true)} variant="secondary">Export</Button>
                    </div>
                </nav>
            </header>
            <main className="container mx-auto p-4 sm:p-6 lg:p-8 flex-grow">
                {renderView()}
            </main>
            <footer className="text-center py-4 bg-gray-800 text-gray-500 text-sm border-t border-gray-700">
                &copy; {new Date().getFullYear()} TJM Technologies. All rights reserved.
            </footer>
             <Modal isOpen={isExportModalOpen} onClose={() => setIsExportModalOpen(false)} title="Export Data to Excel">
                <div className="space-y-4">
                    <p>This will export all current data into an Excel file with multiple sheets.</p>
                    <ul className="list-disc list-inside text-gray-300">
                        <li>Employees, Shifts, Expenses, Forecasts</li>
                        <li>Rooms, Tenancies, Residents, Allowances</li>
                    </ul>
                     <div className="flex justify-end gap-2 pt-4">
                        <Button onClick={() => setIsExportModalOpen(false)} variant="secondary">Cancel</Button>
                        <Button onClick={handleExport}>Export Data</Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default App;
