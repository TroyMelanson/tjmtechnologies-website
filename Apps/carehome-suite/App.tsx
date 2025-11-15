import React, { useState, useMemo, FC, useCallback, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Employee, Shift, Expense, ViewType, Resident, Allowance, ExpenseForecast, UserRole, Room, Tenancy, TimeOffRequest, PerformanceReview, PerformanceItem, RatingScale } from './types';

declare var XLSX: any;

// MOCK DATA GENERATION
const initialEmployees: Employee[] = [
    { id: '1', name: 'Alice Johnson', email: 'alice.j@corp.com', payRate: 25, position: 'Senior Caregiver', hireDate: new Date('2022-08-15') },
    { id: '2', name: 'Bob Williams', email: 'bob.w@corp.com', payRate: 22, position: 'Caregiver', hireDate: new Date('2023-01-20') },
    { id: '3', name: 'Charlie Brown', email: 'charlie.b@corp.com', payRate: 20, position: 'Night Shift Supervisor', hireDate: new Date('2021-11-01') },
    { id: '4', name: 'Diana Prince', email: 'diana.p@corp.com', payRate: 28, position: 'Registered Nurse', hireDate: new Date('2023-05-10') },
    { id: '5', name: 'Edward Hands', email: 'edward.h@corp.com', payRate: 21, position: 'Caregiver', hireDate: new Date('2023-03-12') },
    { id: '6', name: 'Fiona Glenanne', email: 'fiona.g@corp.com', payRate: 23, position: 'Activities Coordinator', hireDate: new Date('2022-09-01') },
    { id: '7', name: 'George Costanza', email: 'george.c@corp.com', payRate: 20, position: 'Night Shift Caregiver', hireDate: new Date('2023-07-01') },
    { id: '8', name: 'Hannah Montana', email: 'hannah.m@corp.com', payRate: 35, position: 'Director of Care', hireDate: new Date('2020-02-01') },
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
            shifts.push({ id: `s_${shiftIdCounter++}`, employeeId, start, end });
        });
        
        // Assign night staff to their 8-hour shift
        nightStaffIds.forEach(employeeId => {
            const start = new Date(currentDay);
            start.setHours(23, 0, 0, 0);
            const end = new Date(currentDay);
            end.setDate(currentDay.getDate() + 1);
            end.setHours(7, 0, 0, 0);
            shifts.push({ id: `s_${shiftIdCounter++}`, employeeId, start, end });
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

const initialTimeOffRequests: TimeOffRequest[] = [
    { id: 'tor1', employeeId: '2', startDate: new Date(new Date().setDate(new Date().getDate() + 5)), endDate: new Date(new Date().setDate(new Date().getDate() + 7)), reason: 'Family matter', status: 'Pending' },
    { id: 'tor2', employeeId: '5', startDate: new Date(new Date().setDate(new Date().getDate() - 10)), endDate: new Date(new Date().setDate(new Date().getDate() - 8)), reason: 'Vacation', status: 'Approved' },
];

const coreCompetencies: Omit<PerformanceItem, 'supervisorComments' | 'employeeComments' | 'rating'>[] = [
    { id: 'comp1', title: 'Job Knowledge & Skills', description: 'Demonstrates understanding and proficiency in their role.' },
    { id: 'comp2', title: 'Communication', description: 'Effectively conveys information and listens to others.' },
    { id: 'comp3', title: 'Teamwork & Collaboration', description: 'Works well with others to achieve common goals.' },
    { id: 'comp4', title: 'Initiative & Problem Solving', description: 'Proactively identifies issues and finds solutions.' },
    { id: 'comp5', title: 'Adaptability', description: 'Adjusts to changing priorities and work environments.' },
];

const createEmptyReviewItems = (items: Omit<PerformanceItem, 'supervisorComments' | 'employeeComments' | 'rating'>[]): PerformanceItem[] => {
    return items.map(item => ({
        ...item,
        supervisorComments: '',
        employeeComments: '',
        rating: null,
    }));
};

const initialPerformanceReviews: PerformanceReview[] = [
    {
        id: 'pr1',
        employeeId: '2', // Bob Williams
        supervisorName: 'Alice Johnson',
        reviewPeriod: `End-of-Year ${new Date().getFullYear() - 1}`,
        status: 'Completed',
        reviewDate: new Date(new Date().setMonth(new Date().getMonth() - 6)),
        competencies: coreCompetencies.map(c => ({...c, supervisorComments: 'Bob meets expectations in this area.', employeeComments: 'I agree.', rating: 'Meets Expectations'})),
        objectives: [
            { id: 'obj1', title: 'Complete dementia care training', description: 'Enroll in and complete the advanced dementia care certification.', supervisorComments: 'Completed ahead of schedule.', employeeComments: 'Enjoyed the course.', rating: 'Exceeds Expectations' },
        ],
        overallSupervisorComments: 'Bob had a solid performance period, consistently meeting all expectations.',
        overallEmployeeComments: 'I feel good about my performance and look forward to the next period.',
        developmentPlan: 'Focus on leadership skills for potential future roles.',
        supervisorSignatureDate: new Date(new Date().setMonth(new Date().getMonth() - 6)),
        employeeSignatureDate: new Date(new Date().setMonth(new Date().getMonth() - 6)),
    },
    {
        id: 'pr2',
        employeeId: '5', // Edward Hands
        supervisorName: 'Alice Johnson',
        reviewPeriod: `Mid-Year ${new Date().getFullYear()}`,
        status: 'Pending Employee Acknowledgment',
        reviewDate: new Date(new Date().setDate(new Date().getDate() - 5)),
        competencies: coreCompetencies.map(c => ({...c, supervisorComments: 'Edward is a valuable team member.', employeeComments: '', rating: 'Meets Expectations'})),
        objectives: [],
        overallSupervisorComments: 'Awaiting employee comments and sign-off.',
        overallEmployeeComments: '',
        developmentPlan: 'Continue professional development.',
        supervisorSignatureDate: new Date(new Date().setDate(new Date().getDate() - 5)),
        employeeSignatureDate: null,
    }
];


const LOGO_BASE64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAABWSURBVHhe7c4xEQAgDMCwwv+P4fgyI5Ek720sAECgYgAIFQNAqBgAgokDIAaAEDCAGgAg0AEAFAyAEQDAIA8AEAwAMjEDwBAAwgEAIKQaAEAwAASAQBQAAgAAAABJRU5ErkJggg==';

// --- HELPER FUNCTIONS ---
const formatDate = (date: Date) => {
    if (!date || typeof date.toISOString !== 'function') {
        return '';
    }
    return date.toISOString().split('T')[0];
};
const formatTime = (date: Date) => date.toTimeString().slice(0, 5);
const getHoursDifference = (start: Date, end: Date) => (end.getTime() - start.getTime()) / (1000 * 60 * 60);

const exportToExcel = (data: { [sheetName: string]: object[] }, employees: Employee[], reviews: PerformanceReview[]) => {
    const wb = XLSX.utils.book_new();

    const processData = (sheetName: string, records: any[]) => {
        if (records && records.length > 0) {
            const dataToExport = records.map(record => {
                const newRecord = {...record};
                if (sheetName === 'Performance Reviews') {
                    newRecord.employeeName = employees.find(e => e.id === newRecord.employeeId)?.name || 'Unknown';
                    newRecord.reviewDate = formatDate(newRecord.reviewDate);
                    newRecord.supervisorSignatureDate = newRecord.supervisorSignatureDate ? formatDate(newRecord.supervisorSignatureDate) : '';
                    newRecord.employeeSignatureDate = newRecord.employeeSignatureDate ? formatDate(newRecord.employeeSignatureDate) : '';
                    // Flatten competencies and objectives for easier export
                    newRecord.competencies = JSON.stringify(newRecord.competencies.map((c: PerformanceItem) => ({ title: c.title, rating: c.rating, supervisorComments: c.supervisorComments, employeeComments: c.employeeComments })));
                    newRecord.objectives = JSON.stringify(newRecord.objectives.map((o: PerformanceItem) => ({ title: o.title, rating: o.rating, supervisorComments: o.supervisorComments, employeeComments: o.employeeComments })));
                }
                return newRecord;
            });
            const ws = XLSX.utils.json_to_sheet(dataToExport);
            XLSX.utils.book_append_sheet(wb, ws, sheetName);
        }
    };
    
    for (const sheetName in data) {
       processData(sheetName, data[sheetName]);
    }
    processData('Performance Reviews', reviews);

    XLSX.writeFile(wb, "CareHomeData.xlsx");
};


// --- UI COMPONENTS ---
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

// --- LOGIN COMPONENTS ---
const LoginScreen: FC<{ onLogin: (email: string) => void, employees: Employee[] }> = ({ onLogin, employees }) => {
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const foundEmployee = employees.find(emp => emp.email.toLowerCase() === email.toLowerCase());
        if (foundEmployee) {
            onLogin(email);
        } else {
            setError('Email not found. Please check the email and try again.');
        }
    };
    
    return (
        <div className="min-h-screen flex flex-col justify-center items-center bg-gray-900 text-white">
            <Card className="w-full max-w-sm">
                 <img src={LOGO_BASE64} alt="TJM Technologies Logo" className="mx-auto mb-2 h-24 w-auto rounded-lg" style={{ filter: 'invert(1)' }} />
                <h1 className="text-2xl font-bold text-white text-center">TJM Technologies</h1>
                <p className="text-lg text-gray-400 mb-6 text-center">CareHome Business Suite</p>
                
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-300">Email Address</label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={e => {
                                setEmail(e.target.value);
                                setError('');
                            }}
                            required
                            className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm p-2 text-white placeholder-gray-400 focus:ring-indigo-500 focus:border-indigo-500"
                            placeholder="you@corp.com"
                        />
                    </div>
                    {error && <p className="text-red-400 text-sm">{error}</p>}
                    <div>
                        <Button type="submit" className="w-full text-lg py-3">Login</Button>
                    </div>
                </form>
                <div className="mt-6 text-xs text-gray-500">
                     <p className="font-bold mb-2">For demo purposes, use one of these emails:</p>
                     <ul className="list-disc list-inside space-y-1">
                        <li><strong>Owner:</strong> hannah.m@corp.com</li>
                        <li><strong>Supervisor:</strong> alice.j@corp.com</li>
                        <li><strong>Employee:</strong> bob.w@corp.com</li>
                     </ul>
                </div>
            </Card>
        </div>
    );
};

// --- DASHBOARD ---
const FinancialDashboard: FC<{ tenancies: Tenancy[], shifts: Shift[], expenses: Expense[], employees: Employee[], allowances: Allowance[], timeOffRequests: TimeOffRequest[], onUpdateTimeOffRequest: (id: string, status: 'Approved' | 'Denied') => void }> = ({ tenancies, shifts, expenses, employees, allowances, timeOffRequests, onUpdateTimeOffRequest }) => {
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

    const pendingRequests = useMemo(() => {
        return timeOffRequests
            .filter(r => r.status === 'Pending')
            .map(r => ({ ...r, employeeName: employees.find(e => e.id === r.employeeId)?.name || 'Unknown' }));
    }, [timeOffRequests, employees]);
    
    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex justify-between items-center">
                 <h2 className="text-3xl font-bold text-white">Dashboard</h2>
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
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                 <Card className="h-96 lg:col-span-2">
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
                <Card className="h-96">
                    <h3 className="text-xl font-semibold mb-4 text-white">Pending Time Off Requests</h3>
                    <div className="space-y-3 overflow-y-auto h-[calc(100%-2.5rem)] pr-2">
                        {pendingRequests.length > 0 ? pendingRequests.map(req => (
                            <div key={req.id} className="bg-gray-700 p-3 rounded-lg">
                                <p className="font-semibold text-indigo-300">{req.employeeName}</p>
                                <p className="text-sm text-gray-300">{formatDate(req.startDate)} to {formatDate(req.endDate)}</p>
                                {req.reason && <p className="text-xs text-gray-400 mt-1 italic">"{req.reason}"</p>}
                                <div className="flex gap-2 mt-2">
                                    <Button onClick={() => onUpdateTimeOffRequest(req.id, 'Approved')} className="flex-1 py-1 text-sm !bg-green-600 hover:!bg-green-700">Approve</Button>
                                    <Button onClick={() => onUpdateTimeOffRequest(req.id, 'Denied')} variant="danger" className="flex-1 py-1 text-sm">Deny</Button>
                                </div>
                            </div>
                        )) : <p className="text-center text-gray-500">No pending requests.</p>}
                    </div>
                </Card>
            </div>
        </div>
    );
};

// --- SCHEDULER ---
const Scheduler: FC<{ employees: Employee[], shifts: Shift[], timeOffRequests: TimeOffRequest[], onShiftsAdd: (shifts: Omit<Shift, 'id'>[]) => void, onShiftUpdate: (shift: Shift) => void, onShiftAdd: (shift: Omit<Shift, 'id'>) => void, onShiftDelete: (shiftId: string) => void }> = ({ employees, shifts, timeOffRequests, onShiftsAdd, onShiftUpdate, onShiftAdd, onShiftDelete }) => {
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

            {view === 'day' && <DailySchedulerView employees={employees} shifts={shifts} selectedDate={selectedDate} timeOffRequests={timeOffRequests} onEditShift={handleEditClick} onDeleteShift={onShiftDelete} />}
            {view === 'week' && <WeeklySchedulerView employees={employees} shifts={shifts} weekDays={weekDays} timeOffRequests={timeOffRequests} onEditShift={handleEditClick} onAddShift={(date, empId) => handleAddClick(date, empId)} onDeleteShift={onShiftDelete} />}
           
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

const isEmployeeOnLeave = (employeeId: string, date: Date, timeOffRequests: TimeOffRequest[]) => {
    const checkDate = new Date(date);
    checkDate.setHours(12, 0, 0, 0); // Use midday to avoid timezone edge cases
    const startOfDay = new Date(date);
    startOfDay.setHours(0,0,0,0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23,59,59,999);

    return timeOffRequests.some(req => 
        req.employeeId === employeeId &&
        req.status === 'Approved' &&
        new Date(req.startDate) <= endOfDay &&
        new Date(req.endDate) >= startOfDay
    );
};

const DailySchedulerView: FC<{employees: Employee[], shifts: Shift[], selectedDate: Date, timeOffRequests: TimeOffRequest[], onEditShift: (shift: Shift) => void, onDeleteShift: (shiftId: string) => void}> = ({employees, shifts, selectedDate, timeOffRequests, onEditShift, onDeleteShift}) => {
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
                {employees.map(employee => {
                    const onLeave = isEmployeeOnLeave(employee.id, selectedDate, timeOffRequests);
                    return (
                    <div key={employee.id} className="flex items-center">
                        <div className="w-32 pr-4 text-right font-semibold text-indigo-300">{employee.name}</div>
                        <div className="flex-1 bg-gray-700 h-10 rounded relative">
                            {onLeave && (
                                <div className="absolute inset-0 bg-gray-500/50 flex items-center justify-center text-sm font-semibold text-gray-200 rounded z-10">
                                    ON LEAVE
                                </div>
                            )}
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
                )})}
            </div>
        </Card>
    );
};

const WeeklySchedulerView: FC<{employees: Employee[], shifts: Shift[], weekDays: Date[], timeOffRequests: TimeOffRequest[], onEditShift: (shift: Shift) => void, onAddShift: (date: Date, employeeId: string) => void, onDeleteShift: (shiftId: string) => void}> = ({employees, shifts, weekDays, timeOffRequests, onEditShift, onAddShift, onDeleteShift}) => {
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
                             const startOfDay = new Date(day);
                             startOfDay.setHours(0,0,0,0);
                             const endOfDay = new Date(day);
                             endOfDay.setHours(23,59,59,999);
                             const dayShifts = shifts.filter(s => s.employeeId === emp.id && s.start < endOfDay && s.end > startOfDay);
                             const onLeave = isEmployeeOnLeave(emp.id, day, timeOffRequests);
                             
                             return (
                                <div key={day.toISOString()} onClick={() => !onLeave && onAddShift(day, emp.id)} className={`p-2 border-b border-r border-gray-700 last:border-r-0 min-h-[6rem] space-y-1 transition-colors ${onLeave ? 'bg-gray-600/50' : 'cursor-pointer hover:bg-gray-700/50'}`}>
                                    {onLeave && <div className="text-center text-xs text-gray-300 font-semibold">ON LEAVE</div>}
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
        const sourceDate = new Date(currentDate);
        sourceDate.setMonth(currentDate.getMonth() - 1);

        const sourceWeekStart = new Date(sourceDate);
        sourceWeekStart.setDate(sourceDate.getDate() - sourceDate.getDay());
        sourceWeekStart.setHours(0,0,0,0);

        const sourceWeekEnd = new Date(sourceWeekStart);
        sourceWeekEnd.setDate(sourceWeekStart.getDate() + 7);

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
                <p className="text-sm text-gray-400">For example, it will replace the schedule for the week of <span className="font-semibold text-indigo-400">{formatDate((() => { const d = new Date(currentDate); d.setDate(d.getDate() - d.getDay()); return d; })())}</span> with the schedule from the week of <span className="font-semibold text-indigo-400">{formatDate((() => { const d = new Date(currentDate); d.setMonth(d.getMonth() - 1); d.setDate(d.getDate() - d.getDay()); return d; })())}</span>.</p>
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

// --- EMPLOYEES ---
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
                                <p className="text-sm text-gray-400">{emp.email}</p>
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
    const [email, setEmail] = useState('');
    const [payRate, setPayRate] = useState(0);
    const [position, setPosition] = useState('');
    const [hireDate, setHireDate] = useState(formatDate(new Date()));

    useEffect(() => {
        if (employee) {
            setName(employee.name);
            setEmail(employee.email);
            setPayRate(employee.payRate);
            setPosition(employee.position);
            setHireDate(formatDate(employee.hireDate));
        } else {
            setName('');
            setEmail('');
            setPayRate(20);
            setPosition('Caregiver');
            setHireDate(formatDate(new Date()));
        }
    }, [employee, isOpen]);
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if(!name || !email || payRate <= 0 || !position) {
            alert('Please fill out all fields.');
            return;
        }
        const employeeData = { name, email, payRate, position, hireDate: new Date(hireDate + 'T00:00:00') };
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
                    <label className="block text-sm font-medium text-gray-300">Email Address</label>
                    <input type="email" value={email} onChange={e => setEmail(e.target.value)} required className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm p-2 text-white" />
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

// --- CAPITAL EXPENSES ---
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
                         {sortedExpenses.length === 0 && <p className="text-center text-gray-500 py-8">No expenses logged.</p>}
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

 // --- SALARY EXPENSES ---
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
                        <Button onClick={selectAllEmployees} variant="secondary" className="flex-1 text-sm py-1">Select All</Button>
                        <Button onClick={deselectAllEmployees} variant="secondary" className="flex-1 text-sm py-1">Deselect All</Button>
                    </div>
                    <div className="space-y-2 max-h-96 overflow-y-auto pr-2">
                        {employees.sort((a,b) => a.name.localeCompare(b.name)).map(emp => (
                            <label key={emp.id} className="flex items-center gap-2 p-2 bg-gray-700 rounded-md cursor-pointer hover:bg-gray-600">
                                <input
                                    type="checkbox"
                                    checked={selectedEmployeeIds.includes(emp.id)}
                                    onChange={() => handleEmployeeSelection(emp.id)}
                                    className="h-4 w-4 rounded bg-gray-900 border-gray-600 text-indigo-600 focus:ring-indigo-500"
                                />
                                <span>{emp.name}</span>
                            </label>
                        ))}
                    </div>
                </Card>
                <Card className="lg:col-span-2">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-xl font-semibold">Salary Breakdown</h3>
                        <div className="text-right">
                            <p className="text-gray-400">Total for Period</p>
                            <p className="text-2xl font-bold text-yellow-400">${totalSalary.toFixed(2)}</p>
                        </div>
                    </div>
                    <div className="max-h-[26rem] overflow-y-auto">
                        <ul className="divide-y divide-gray-700">
                            {salaryData.map(data => (
                                <li key={data.name} className="py-3 flex justify-between items-center">
                                    <div>
                                        <p className="font-semibold text-white">{data.name}</p>
                                        <p className="text-sm text-gray-400">{data.totalHours.toFixed(2)} hours</p>
                                    </div>
                                    <p className="text-lg font-semibold text-green-400">${data.totalPay.toFixed(2)}</p>
                                </li>
                            ))}
                        </ul>
                        {salaryData.length === 0 && <p className="text-center text-gray-500 py-8">No salary data for the selected criteria.</p>}
                    </div>
                </Card>
            </div>
        </div>
    );
};

// --- REVENUE ---
const RevenueManager: FC<{
    residents: Resident[],
    rooms: Room[],
    tenancies: Tenancy[],
    onTenancyUpdate: (tenancy: Tenancy) => void,
    onTenancyAdd: (tenancy: Omit<Tenancy, 'id'>) => void,
}> = ({ residents, rooms, tenancies, onTenancyUpdate, onTenancyAdd }) => {
    const [isTenancyModalOpen, setIsTenancyModalOpen] = useState(false);
    const [editingTenancy, setEditingTenancy] = useState<Tenancy | null>(null);

    const activeTenancies = useMemo(() => {
        const now = new Date();
        return tenancies.filter(t => t.startDate <= now && (!t.endDate || t.endDate >= now));
    }, [tenancies]);

    const totalMonthlyRevenue = useMemo(() => {
        return activeTenancies.reduce((sum, t) => sum + t.monthlyRate, 0);
    }, [activeTenancies]);

    const occupancyRate = useMemo(() => {
        return (activeTenancies.length / rooms.length) * 100;
    }, [activeTenancies, rooms]);

    const handleEditTenancy = (tenancy: Tenancy) => {
        setEditingTenancy(tenancy);
        setIsTenancyModalOpen(true);
    };

    const handleAddTenancy = () => {
        setEditingTenancy(null);
        setIsTenancyModalOpen(true);
    };

    const handleTenancyFormSubmit = (data: Tenancy | Omit<Tenancy, 'id'>) => {
        if ('id' in data) {
            onTenancyUpdate(data);
        } else {
            onTenancyAdd(data);
        }
        setIsTenancyModalOpen(false);
    };
    
    const getResidentName = (id: string) => residents.find(r => r.id === id)?.name || 'Unknown';
    const getRoomNumber = (id: string) => rooms.find(r => r.id === id)?.roomNumber || 'N/A';
    
    return (
        <div className="space-y-6 animate-fade-in">
             <div className="flex justify-between items-center">
                <h2 className="text-3xl font-bold text-white">Revenue & Tenancy</h2>
                <Button onClick={handleAddTenancy}>Add Tenancy</Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <Card>
                    <h3 className="text-gray-400">Total Monthly Revenue</h3>
                    <p className="text-3xl font-bold text-cyan-400">${totalMonthlyRevenue.toLocaleString()}</p>
                </Card>
                <Card>
                    <h3 className="text-gray-400">Occupancy Rate</h3>
                    <p className="text-3xl font-bold text-green-400">{occupancyRate.toFixed(1)}%</p>
                    <p className="text-gray-500">{activeTenancies.length} of {rooms.length} rooms</p>
                </Card>
            </div>
            <Card>
                <h3 className="text-xl font-semibold mb-4 text-white">Current Tenancies</h3>
                <ul className="divide-y divide-gray-700">
                    {tenancies.map(t => (
                        <li key={t.id} className="py-4 flex justify-between items-center">
                             <div>
                                <p className="text-lg font-semibold text-white">{getResidentName(t.residentId)}</p>
                                <p className="text-sm text-gray-400">Room {getRoomNumber(t.roomId)} &bull; Start: {formatDate(t.startDate)}</p>
                                {t.endDate && <p className="text-sm text-gray-400">End: {formatDate(t.endDate)}</p>}
                            </div>
                             <div className="flex items-center gap-4">
                                <p className="text-xl font-bold text-green-400">${t.monthlyRate.toLocaleString()}<span className="text-sm text-gray-400">/mo</span></p>
                                <Button onClick={() => handleEditTenancy(t)} variant="secondary">Edit</Button>
                            </div>
                        </li>
                    ))}
                </ul>
            </Card>
            <TenancyFormModal 
                isOpen={isTenancyModalOpen}
                onClose={() => setIsTenancyModalOpen(false)}
                tenancy={editingTenancy}
                residents={residents}
                rooms={rooms}
                tenancies={tenancies}
                onSubmit={handleTenancyFormSubmit}
            />
        </div>
    );
};

const TenancyFormModal: FC<{
    isOpen: boolean,
    onClose: () => void,
    tenancy: Tenancy | null,
    residents: Resident[],
    rooms: Room[],
    tenancies: Tenancy[],
    onSubmit: (data: Tenancy | Omit<Tenancy, 'id'>) => void
}> = ({ isOpen, onClose, tenancy, residents, rooms, tenancies, onSubmit }) => {
    const [residentId, setResidentId] = useState('');
    const [roomId, setRoomId] = useState('');
    const [startDate, setStartDate] = useState(formatDate(new Date()));
    const [endDate, setEndDate] = useState('');
    const [monthlyRate, setMonthlyRate] = useState(5000);

    const availableRooms = useMemo(() => {
        const occupiedRoomIds = new Set(tenancies.filter(t => !t.endDate && t.id !== tenancy?.id).map(t => t.roomId));
        return rooms.filter(r => !occupiedRoomIds.has(r.id));
    }, [rooms, tenancies, tenancy]);

    useEffect(() => {
        if (tenancy) {
            setResidentId(tenancy.residentId);
            setRoomId(tenancy.roomId);
            setStartDate(formatDate(tenancy.startDate));
            setEndDate(tenancy.endDate ? formatDate(tenancy.endDate) : '');
            setMonthlyRate(tenancy.monthlyRate);
        } else {
            setResidentId(residents[0]?.id || '');
            setRoomId(availableRooms[0]?.id || '');
            setStartDate(formatDate(new Date()));
            setEndDate('');
            setMonthlyRate(5000);
        }
    }, [tenancy, isOpen, residents, availableRooms]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const data = {
            residentId,
            roomId,
            startDate: new Date(startDate + 'T00:00:00'),
            endDate: endDate ? new Date(endDate + 'T00:00:00') : null,
            monthlyRate
        };
        onSubmit(tenancy ? { ...data, id: tenancy.id } : data);
    };
    
    return (
        <Modal isOpen={isOpen} onClose={onClose} title={tenancy ? 'Edit Tenancy' : 'Add Tenancy'}>
            <form onSubmit={handleSubmit} className="space-y-4">
                 <div>
                    <label className="block text-sm font-medium text-gray-300">Resident</label>
                    <select value={residentId} onChange={e => setResidentId(e.target.value)} className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm p-2 text-white">
                        {residents.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                    </select>
                </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-300">Room</label>
                    <select value={roomId} onChange={e => setRoomId(e.target.value)} className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm p-2 text-white">
                        {tenancy && !availableRooms.find(r => r.id === tenancy.roomId) && <option key={tenancy.roomId} value={tenancy.roomId}>Room {rooms.find(r => r.id === tenancy.roomId)?.roomNumber} (Current)</option>}
                        {availableRooms.map(r => <option key={r.id} value={r.id}>Room {r.roomNumber}</option>)}
                    </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                     <div>
                        <label className="block text-sm font-medium text-gray-300">Start Date</label>
                        <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} required className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm p-2 text-white" />
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-300">End Date (optional)</label>
                        <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm p-2 text-white" />
                    </div>
                </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-300">Monthly Rate</label>
                    <input type="number" step="0.01" value={monthlyRate} onChange={e => setMonthlyRate(parseFloat(e.target.value))} required className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm p-2 text-white" />
                </div>
                <div className="flex justify-end gap-2 pt-4">
                    <Button onClick={onClose} variant="secondary" type="button">Cancel</Button>
                    <Button type="submit">Save</Button>
                </div>
            </form>
        </Modal>
    );
};

// --- MY PORTAL ---
const MyPortal: FC<{
    loggedInEmployee: Employee;
    shifts: Shift[];
    timeOffRequests: TimeOffRequest[];
    onTimeOffRequestAdd: (req: Omit<TimeOffRequest, 'id' | 'status'>) => void;
}> = ({ loggedInEmployee, shifts, timeOffRequests, onTimeOffRequestAdd }) => {
    
    const myShifts = useMemo(() => {
        const now = new Date();
        now.setHours(0,0,0,0);
        return shifts
            .filter(s => s.employeeId === loggedInEmployee.id && s.start >= now)
            .sort((a, b) => a.start.getTime() - b.start.getTime())
            .slice(0, 5); // Show next 5 shifts
    }, [shifts, loggedInEmployee]);
    
    const myRequests = useMemo(() => {
        return timeOffRequests
            .filter(r => r.employeeId === loggedInEmployee.id)
            .sort((a,b) => b.startDate.getTime() - a.startDate.getTime());
    }, [timeOffRequests, loggedInEmployee]);
    
    return (
        <div className="space-y-6 animate-fade-in">
             <h2 className="text-3xl font-bold text-white">Welcome, {loggedInEmployee.name}</h2>
             <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                    <h3 className="text-xl font-semibold mb-4">My Upcoming Shifts</h3>
                    {myShifts.length > 0 ? (
                        <ul className="divide-y divide-gray-700">
                            {myShifts.map(shift => (
                                <li key={shift.id} className="py-3">
                                    <p className="font-semibold">{shift.start.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}</p>
                                    <p className="text-gray-300">{formatTime(shift.start)} - {formatTime(shift.end)}</p>
                                </li>
                            ))}
                        </ul>
                    ) : <p className="text-gray-400">No upcoming shifts scheduled.</p>}
                </Card>
                <div className="space-y-6">
                    <Card>
                        <h3 className="text-xl font-semibold mb-4">Request Time Off</h3>
                        <TimeOffRequestForm employeeId={loggedInEmployee.id} onSubmit={onTimeOffRequestAdd} />
                    </Card>
                     <Card>
                        <h3 className="text-xl font-semibold mb-4">My Requests</h3>
                        <div className="max-h-60 overflow-y-auto space-y-2 pr-2">
                             {myRequests.length > 0 ? myRequests.map(req => {
                                const statusColors = { Pending: 'text-yellow-400', Approved: 'text-green-400', Denied: 'text-red-400' };
                                return (
                                <div key={req.id} className="p-3 bg-gray-700 rounded">
                                    <div className="flex justify-between items-center">
                                        <p className="font-semibold">{formatDate(req.startDate)} to {formatDate(req.endDate)}</p>
                                        <p className={`font-bold text-sm ${statusColors[req.status]}`}>{req.status}</p>
                                    </div>
                                    <p className="text-sm text-gray-400 italic">"{req.reason}"</p>
                                </div>
                             )}) : <p className="text-gray-400">No time off requests found.</p>}
                        </div>
                    </Card>
                </div>
             </div>
        </div>
    );
};

const TimeOffRequestForm: FC<{employeeId: string, onSubmit: (req: Omit<TimeOffRequest, 'id' | 'status'>) => void}> = ({ employeeId, onSubmit }) => {
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [reason, setReason] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!startDate || !endDate) {
            alert('Please select a start and end date.');
            return;
        }
        onSubmit({
            employeeId,
            startDate: new Date(startDate + 'T00:00:00'),
            endDate: new Date(endDate + 'T00:00:00'),
            reason
        });
        setStartDate('');
        setEndDate('');
        setReason('');
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
                 <div>
                    <label className="block text-sm font-medium text-gray-300">Start Date</label>
                    <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} required className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm p-2 text-white" />
                </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-300">End Date</label>
                    <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} required className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm p-2 text-white" />
                </div>
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-300">Reason (optional)</label>
                <input type="text" value={reason} onChange={e => setReason(e.target.value)} className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm p-2 text-white" />
            </div>
            <div className="text-right">
                <Button type="submit">Submit Request</Button>
            </div>
        </form>
    );
};

// --- PERFORMANCE REVIEWS ---
const CreateReviewModal: FC<{
    isOpen: boolean;
    onClose: () => void;
    employeesToReview: Employee[];
    onCreate: (employeeId: string, period: 'Mid-Year' | 'End-of-Year', year: number) => void;
}> = ({ isOpen, onClose, employeesToReview, onCreate }) => {
    const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>('');
    const [year, setYear] = useState(new Date().getFullYear());
    const [period, setPeriod] = useState<'Mid-Year' | 'End-of-Year'>('Mid-Year');
    
    const availableYears = useMemo(() => {
        const currentYear = new Date().getFullYear();
        return [currentYear + 1, currentYear, currentYear - 1];
    }, []);

    useEffect(() => {
        if (employeesToReview.length > 0) {
            setSelectedEmployeeId(employeesToReview[0].id);
        }
    }, [employeesToReview, isOpen]);

    const handleCreate = () => {
        if (selectedEmployeeId) {
            onCreate(selectedEmployeeId, period, year);
            onClose();
        } else {
            alert('Please select an employee.');
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Create New Performance Review">
            <div className="space-y-4">
                 <div>
                    <label className="block text-sm font-medium text-gray-300">Employee</label>
                    <select value={selectedEmployeeId} onChange={e => setSelectedEmployeeId(e.target.value)} className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm p-2 text-white">
                        {employeesToReview.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
                    </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-300">Review Period</label>
                         <select value={period} onChange={e => setPeriod(e.target.value as 'Mid-Year' | 'End-of-Year')} className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm p-2 text-white">
                            <option value="Mid-Year">Mid-Year</option>
                            <option value="End-of-Year">End-of-Year</option>
                        </select>
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-300">Year</label>
                         <select value={year} onChange={e => setYear(parseInt(e.target.value))} className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm p-2 text-white">
                            {availableYears.map(y => <option key={y} value={y}>{y}</option>)}
                        </select>
                    </div>
                </div>
                <div className="flex justify-end gap-2 pt-4">
                    <Button onClick={onClose} variant="secondary">Cancel</Button>
                    <Button onClick={handleCreate}>Create Review</Button>
                </div>
            </div>
        </Modal>
    );
};

const PerformanceReviews: FC<{
    loggedInUser: { role: UserRole, employee?: Employee };
    reviews: PerformanceReview[];
    employees: Employee[];
    onReviewCreate: (employeeId: string, period: 'Mid-Year' | 'End-of-Year', year: number) => void;
    onReviewUpdate: (review: PerformanceReview) => void;
}> = ({ loggedInUser, reviews, employees, onReviewCreate, onReviewUpdate }) => {
    const [selectedReview, setSelectedReview] = useState<PerformanceReview | null>(null);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    const { teamReviews, myReviews, canCreate, employeesToReview } = useMemo(() => {
        if (!loggedInUser.employee) return { teamReviews: [], myReviews: [], canCreate: false, employeesToReview: [] };
        
        const personalReviews = reviews.filter(r => r.employeeId === loggedInUser.employee?.id);

        switch (loggedInUser.role) {
            case 'Owner':
                return { teamReviews: reviews, myReviews: personalReviews, canCreate: false, employeesToReview: [] };
            case 'Supervisor':
                const managedEmployees = employees.filter(e => e.id !== loggedInUser.employee?.id);
                const managedEmployeeIds = new Set(managedEmployees.map(e => e.id));
                const teamRevs = reviews.filter(r => managedEmployeeIds.has(r.employeeId));
                return { teamReviews: teamRevs, myReviews: personalReviews, canCreate: true, employeesToReview: managedEmployees };
            case 'Employee':
                return { teamReviews: [], myReviews: personalReviews, canCreate: false, employeesToReview: [] };
            default:
                return { teamReviews: [], myReviews: [], canCreate: false, employeesToReview: [] };
        }
    }, [loggedInUser, reviews, employees]);

    const getEmployeeName = (id: string) => employees.find(e => e.id === id)?.name || 'Unknown';
    
    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex justify-between items-center">
                <h2 className="text-3xl font-bold text-white">Performance Reviews</h2>
                {canCreate && <Button onClick={() => setIsCreateModalOpen(true)}>Create Review</Button>}
            </div>
            
            {loggedInUser.role === 'Supervisor' && (
                 <>
                    <Card>
                        <h3 className="text-xl font-semibold mb-4 text-white">My Team's Reviews</h3>
                        <ReviewList reviews={teamReviews} employees={employees} onSelectReview={setSelectedReview} />
                    </Card>
                     <Card>
                        <h3 className="text-xl font-semibold mb-4 text-white">My Personal Reviews</h3>
                        {myReviews.length > 0 ? (
                            <ReviewList reviews={myReviews} employees={employees} onSelectReview={setSelectedReview} />
                        ) : <p className="text-gray-400">You have no performance reviews on record.</p>}
                    </Card>
                 </>
            )}

            {loggedInUser.role === 'Owner' && (
                 <Card>
                    <h3 className="text-xl font-semibold mb-4 text-white">All Company Reviews</h3>
                    <ReviewList reviews={reviews} employees={employees} onSelectReview={setSelectedReview} />
                 </Card>
            )}
            
            {loggedInUser.role === 'Employee' && (
                <Card>
                     <h3 className="text-xl font-semibold mb-4 text-white">My Reviews</h3>
                     {myReviews.length > 0 ? (
                        <ReviewList reviews={myReviews} employees={employees} onSelectReview={setSelectedReview} />
                     ) : <p className="text-gray-400">You have no performance reviews on record.</p>}
                </Card>
            )}

            <CreateReviewModal 
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                employeesToReview={employeesToReview}
                onCreate={onReviewCreate}
            />

            {selectedReview && (
                <PerformanceReviewModal
                    isOpen={!!selectedReview}
                    onClose={() => setSelectedReview(null)}
                    review={selectedReview}
                    loggedInUser={loggedInUser}
                    employeeName={getEmployeeName(selectedReview.employeeId)}
                    onSave={onReviewUpdate}
                />
            )}
        </div>
    );
};


const ReviewList: FC<{reviews: PerformanceReview[], employees: Employee[], onSelectReview: (review: PerformanceReview) => void}> = ({reviews, employees, onSelectReview}) => {
    const getEmployeeName = (id: string) => employees.find(e => e.id === id)?.name || 'Unknown';
    const statusColors = { 'Draft': 'bg-gray-500', 'Pending Employee Acknowledgment': 'bg-yellow-500', 'Completed': 'bg-green-500' };

    return (
        <ul className="divide-y divide-gray-700">
            {reviews.sort((a,b) => b.reviewDate.getTime() - a.reviewDate.getTime()).map(review => (
                <li key={review.id} className="py-4 flex justify-between items-center">
                    <div>
                        <p className="text-lg font-semibold text-white">{review.reviewPeriod}</p>
                        <p className="text-sm text-gray-400">Employee: {getEmployeeName(review.employeeId)}</p>
                        <p className="text-sm text-gray-400">Supervisor: {review.supervisorName}</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <span className={`px-2 py-1 text-xs font-semibold text-white rounded-full ${statusColors[review.status]}`}>{review.status}</span>
                        <Button onClick={() => onSelectReview(review)} variant="secondary">View</Button>
                    </div>
                </li>
            ))}
             {reviews.length === 0 && <p className="text-center text-gray-500 py-4">No reviews to display.</p>}
        </ul>
    );
};

const PerformanceReviewModal: FC<{
    isOpen: boolean;
    onClose: () => void;
    review: PerformanceReview;
    loggedInUser: { role: UserRole, employee?: Employee };
    employeeName: string;
    onSave: (review: PerformanceReview) => void;
}> = ({ isOpen, onClose, review, loggedInUser, employeeName, onSave }) => {

    const [editableReview, setEditableReview] = useState<PerformanceReview>(JSON.parse(JSON.stringify(review)));

    useEffect(() => {
        // Deep copy review to avoid direct state mutation
        const freshReview = JSON.parse(JSON.stringify(review));
        // Ensure dates are converted back to Date objects after JSON serialization
        freshReview.reviewDate = new Date(freshReview.reviewDate);
        if (freshReview.supervisorSignatureDate) freshReview.supervisorSignatureDate = new Date(freshReview.supervisorSignatureDate);
        if (freshReview.employeeSignatureDate) freshReview.employeeSignatureDate = new Date(freshReview.employeeSignatureDate);
        setEditableReview(freshReview);
    }, [review, isOpen]);

    const isSupervisor = loggedInUser.role === 'Supervisor';
    const isEmployee = loggedInUser.role === 'Employee' && loggedInUser.employee?.id === review.employeeId;
    
    const canSupervisorEdit = isSupervisor && review.status === 'Draft';
    const canEmployeeComment = isEmployee && review.status === 'Pending Employee Acknowledgment';

    const handleItemChange = (section: 'competencies' | 'objectives', id: string, field: 'supervisorComments' | 'employeeComments' | 'rating', value: string) => {
        setEditableReview(prev => {
            const newReview = { ...prev };
            const itemIndex = newReview[section].findIndex(item => item.id === id);
            if (itemIndex > -1) {
                (newReview[section][itemIndex] as any)[field] = value;
            }
            return newReview;
        });
    };
    
    const handleFieldChange = (field: keyof PerformanceReview, value: string) => {
        setEditableReview(prev => ({...prev, [field]: value}));
    };

    const handleAction = (action: 'save' | 'submit' | 'acknowledge') => {
        let updatedReview = { ...editableReview };
        switch(action) {
            case 'save':
                // Supervisor saves draft
                break;
            case 'submit':
                // Supervisor submits to employee
                updatedReview.status = 'Pending Employee Acknowledgment';
                updatedReview.supervisorSignatureDate = new Date();
                break;
            case 'acknowledge':
                // Employee acknowledges
                updatedReview.status = 'Completed';
                updatedReview.employeeSignatureDate = new Date();
                break;
        }
        onSave(updatedReview);
        if (action !== 'save') {
             onClose();
        }
    };

    const ratingOptions: RatingScale[] = ['Needs Development', 'Meets Expectations', 'Exceeds Expectations'];
    const ratingColors: {[key in RatingScale]: string} = {'Needs Development': 'bg-red-600', 'Meets Expectations': 'bg-blue-600', 'Exceeds Expectations': 'bg-green-600'};

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`Review for ${employeeName} - ${review.reviewPeriod}`} size="5xl">
            <div className="space-y-6">
                {/* Core Competencies Section */}
                <Card>
                     <h3 className="text-xl font-semibold mb-4 text-white">Core Competencies</h3>
                     <div className="space-y-4">
                        {editableReview.competencies.map(item => (
                            <div key={item.id} className="p-4 bg-gray-700 rounded-lg">
                                <h4 className="font-bold text-indigo-300">{item.title}</h4>
                                <p className="text-sm text-gray-400 mb-2">{item.description}</p>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                     <div>
                                        <label className="text-sm font-semibold">Supervisor Rating & Comments</label>
                                        <div className="flex gap-2 my-2">
                                            {ratingOptions.map(r => (
                                                <button key={r} disabled={!canSupervisorEdit} onClick={() => handleItemChange('competencies', item.id, 'rating', r)} className={`px-2 py-1 text-xs rounded ${item.rating === r ? ratingColors[r] : 'bg-gray-600'} ${canSupervisorEdit ? 'hover:opacity-80' : 'cursor-not-allowed'}`}>{r}</button>
                                            ))}
                                        </div>
                                        <textarea value={item.supervisorComments} disabled={!canSupervisorEdit} onChange={(e) => handleItemChange('competencies', item.id, 'supervisorComments', e.target.value)} rows={3} className="w-full bg-gray-900 rounded p-2 text-sm disabled:bg-gray-800"></textarea>
                                    </div>
                                    <div>
                                        <label className="text-sm font-semibold">Employee Comments</label>
                                         <textarea value={item.employeeComments} disabled={!canEmployeeComment} onChange={(e) => handleItemChange('competencies', item.id, 'employeeComments', e.target.value)} rows={canEmployeeComment ? 4 : 3} className="w-full bg-gray-900 rounded p-2 text-sm mt-2 disabled:bg-gray-800"></textarea>
                                    </div>
                                </div>
                            </div>
                        ))}
                     </div>
                </Card>
                {/* Overall Comments */}
                 <Card>
                    <h3 className="text-xl font-semibold mb-4 text-white">Overall Summary</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm font-semibold">Supervisor's Overall Comments</label>
                            <textarea value={editableReview.overallSupervisorComments} disabled={!canSupervisorEdit} onChange={(e) => handleFieldChange('overallSupervisorComments', e.target.value)} rows={4} className="w-full bg-gray-900 rounded p-2 text-sm mt-2 disabled:bg-gray-800"></textarea>
                        </div>
                        <div>
                            <label className="text-sm font-semibold">Employee's Overall Comments</label>
                            <textarea value={editableReview.overallEmployeeComments} disabled={!canEmployeeComment} onChange={(e) => handleFieldChange('overallEmployeeComments', e.target.value)} rows={4} className="w-full bg-gray-900 rounded p-2 text-sm mt-2 disabled:bg-gray-800"></textarea>
                        </div>
                    </div>
                </Card>
                {/* Signatures and Actions */}
                <div className="flex justify-between items-end pt-4">
                    <div className="text-sm space-y-2">
                        <p>Supervisor Signature: {review.supervisorSignatureDate ? `Signed on ${formatDate(review.supervisorSignatureDate)}` : 'Not signed'}</p>
                        <p>Employee Signature: {review.employeeSignatureDate ? `Signed on ${formatDate(review.employeeSignatureDate)}` : 'Not signed'}</p>
                    </div>
                    <div className="flex gap-2">
                        <Button onClick={onClose} variant="secondary">Close</Button>
                        {canSupervisorEdit && <Button onClick={() => handleAction('save')}>Save Draft</Button>}
                        {canSupervisorEdit && <Button onClick={() => handleAction('submit')}>Submit to Employee</Button>}
                        {canEmployeeComment && <Button onClick={() => handleAction('acknowledge')}>Acknowledge & Sign</Button>}
                    </div>
                </div>
            </div>
        </Modal>
    );
};


// --- MAIN APP COMPONENT ---
const App: FC = () => {
    const [user, setUser] = useState<{ role: UserRole, employee: Employee } | null>(null);
    const [view, setView] = useState<ViewType>('Dashboard');

    // Data States
    const [employees, setEmployees] = useState<Employee[]>(initialEmployees);
    const [shifts, setShifts] = useState<Shift[]>(initialShifts);
    const [expenses, setExpenses] = useState<Expense[]>(initialExpenses);
    const [expenseCategories, setExpenseCategories] = useState<string[]>(initialExpenseCategories);
    const [forecasts, setForecasts] = useState<ExpenseForecast[]>(initialForecasts);
    const [residents, setResidents] = useState<Resident[]>(initialResidents);
    const [rooms, setRooms] = useState<Room[]>(initialRooms);
    const [tenancies, setTenancies] = useState<Tenancy[]>(initialTenancies);
    const [allowances, setAllowances] = useState<Allowance[]>(initialAllowances);
    const [timeOffRequests, setTimeOffRequests] = useState<TimeOffRequest[]>(initialTimeOffRequests);
    const [performanceReviews, setPerformanceReviews] = useState<PerformanceReview[]>(initialPerformanceReviews);

    const handleLogin = (email: string) => {
        const employee = employees.find(e => e.email.toLowerCase() === email.toLowerCase());
        if (!employee) return;

        let role: UserRole;
        // In a real app, role would be part of the employee object.
        // Here, we derive it for simulation purposes.
        if (employee.id === '1') { // Alice Johnson is Supervisor
            role = 'Supervisor';
        } else if (employee.id === '8') { // Hannah Montana is Owner
            role = 'Owner';
        } else {
            role = 'Employee';
        }
        setUser({ role, employee });
    };
    
    const handleLogout = () => setUser(null);

    // Handlers for data manipulation
    const handleAdd = <T,>(setter: React.Dispatch<React.SetStateAction<T[]>>, data: Omit<T, 'id'>) => {
        setter(prev => [...prev, { ...data, id: `id_${new Date().getTime()}` } as T]);
    };
    const handleUpdate = <T extends {id: string}>(setter: React.Dispatch<React.SetStateAction<T[]>>, updatedData: T) => {
        setter(prev => prev.map(item => item.id === updatedData.id ? updatedData : item));
    };
    const handleDelete = <T extends {id: string | number}>(setter: React.Dispatch<React.SetStateAction<T[]>>, id: string | number) => {
        setter(prev => prev.filter(item => String(item.id) !== String(id)));
    };
    const handleUpdateTimeOffRequest = (id: string, status: 'Approved' | 'Denied') => {
        handleUpdate(setTimeOffRequests, { ...timeOffRequests.find(r => r.id === id)!, status });
    };
    const handleAddShifts = (newShifts: Omit<Shift, 'id'>[]) => {
        const shiftsWithIds = newShifts.map((s, i) => ({ ...s, id: `s_${new Date().getTime() + i}` }));
        setShifts(prev => [...prev, ...shiftsWithIds]);
    };
    const handleAddCategory = (name: string) => {
        if (name && !expenseCategories.includes(name)) {
            setExpenseCategories(prev => [...prev, name].sort());
        }
    };
    const handleDeleteCategory = (name: string) => {
        if(window.confirm(`Are you sure you want to delete the category "${name}"? This will not delete existing expenses with this category.`)) {
            setExpenseCategories(prev => prev.filter(c => c !== name));
        }
    };
    const handleCreateReview = (employeeId: string, period: 'Mid-Year' | 'End-of-Year', year: number) => {
        const supervisor = user?.role === 'Supervisor' ? user.employee : employees.find(e => e.id === '1');
        if (!supervisor) {
            console.error("Could not identify a supervisor for the review.");
            return;
        }
        const newReview: PerformanceReview = {
            id: `pr_${new Date().getTime()}`,
            employeeId,
            supervisorName: supervisor.name,
            reviewPeriod: `${period} ${year}`,
            status: 'Draft',
            reviewDate: new Date(),
            competencies: createEmptyReviewItems(coreCompetencies),
            objectives: [],
            overallSupervisorComments: '',
            overallEmployeeComments: '',
            developmentPlan: '',
            supervisorSignatureDate: null,
            employeeSignatureDate: null,
        };
        setPerformanceReviews(prev => [...prev, newReview]);
    };
    const handleUpdateReview = (updatedReview: PerformanceReview) => {
        setPerformanceReviews(prev => prev.map(r => r.id === updatedReview.id ? updatedReview : r));
    };
    
    // This MUST be defined before any potential early returns (like the login screen)
    const navItems: { name: ViewType }[] = useMemo(() => {
        if (!user) return [];
        switch (user.role) {
            case 'Owner':
                return [{ name: 'Dashboard' }, { name: 'Scheduler' }, { name: 'Employees' }, { name: 'Capital Expenses' }, { name: 'Salary Expenses' }, { name: 'Revenue' }, { name: 'Performance Reviews' }];
            case 'Supervisor':
                return [{ name: 'Dashboard' }, { name: 'Scheduler' }, { name: 'Employees' }, { name: 'Performance Reviews' }];
            case 'Employee':
                return [{ name: 'My Portal' }, { name: 'Performance Reviews' }];
            default:
                return [];
        }
    }, [user]);

    useEffect(() => {
        if (user?.role === 'Employee') {
            setView('My Portal');
        } else if (user) {
            setView('Dashboard');
        }
    }, [user]);

    const handleExport = () => {
        const dataToExport = {
            Employees: employees.map(e => ({...e, hireDate: formatDate(e.hireDate)})),
            Shifts: shifts.map(s => ({...s, employeeName: employees.find(e => e.id === s.employeeId)?.name || 'Unknown', start: s.start.toISOString(), end: s.end.toISOString()})),
            Expenses: expenses.map(e => ({...e, date: formatDate(e.date)})),
            Tenancies: tenancies.map(t => ({...t, residentName: residents.find(r => r.id === t.residentId)?.name, roomNumber: rooms.find(r=>r.id===t.roomId)?.roomNumber, startDate: formatDate(t.startDate), endDate: t.endDate ? formatDate(t.endDate) : ''})),
        };
        exportToExcel(dataToExport, employees, performanceReviews);
    };

    if (!user) {
        return <LoginScreen onLogin={handleLogin} employees={employees} />;
    }
    
    const CurrentView = () => {
        switch (view) {
            case 'Dashboard': return <FinancialDashboard tenancies={tenancies} shifts={shifts} expenses={expenses} employees={employees} allowances={allowances} timeOffRequests={timeOffRequests} onUpdateTimeOffRequest={handleUpdateTimeOffRequest} />;
            case 'Scheduler': return <Scheduler employees={employees} shifts={shifts} timeOffRequests={timeOffRequests} onShiftsAdd={handleAddShifts} onShiftUpdate={(s) => handleUpdate(setShifts, s)} onShiftAdd={(s) => handleAdd(setShifts, s)} onShiftDelete={(id) => handleDelete(setShifts, id)} />;
            case 'Employees': return <EmployeeManager employees={employees} onEmployeeAdd={(e) => handleAdd(setEmployees, e)} onEmployeeUpdate={(e) => handleUpdate(setEmployees, e)} onEmployeeDelete={(id) => handleDelete(setEmployees, id)} />;
            case 'Capital Expenses': return <ExpenseManager expenses={expenses} forecasts={forecasts} expenseCategories={expenseCategories} onExpenseAdd={(e) => handleAdd(setExpenses, e)} onExpenseUpdate={(e) => handleUpdate(setExpenses, e)} onExpenseDelete={(id) => handleDelete(setExpenses, id)} onForecastUpdate={(f) => handleUpdate(setForecasts, f)} onCategoryAdd={handleAddCategory} onCategoryDelete={handleDeleteCategory}/>;
            case 'Salary Expenses': return <SalaryExpenses shifts={shifts} employees={employees} />;
            case 'Revenue': return <RevenueManager residents={residents} rooms={rooms} tenancies={tenancies} onTenancyUpdate={t => handleUpdate(setTenancies, t)} onTenancyAdd={t => handleAdd(setTenancies, t)} />;
            case 'My Portal': return <MyPortal loggedInEmployee={user.employee!} shifts={shifts} timeOffRequests={timeOffRequests} onTimeOffRequestAdd={(r) => handleAdd(setTimeOffRequests, {...r, status: 'Pending'})} />;
            case 'Performance Reviews': return <PerformanceReviews loggedInUser={user} reviews={performanceReviews} employees={employees} onReviewCreate={handleCreateReview} onReviewUpdate={handleUpdateReview} />;
            default: return <h1 className="text-white">Not Implemented</h1>;
        }
    };
    
    return (
        <div className="flex h-screen bg-gray-900 text-gray-100">
            <aside className="w-64 bg-gray-800 p-6 flex flex-col justify-between">
                <div>
                    <div className="flex items-center gap-3 mb-8">
                        <img src={LOGO_BASE64} alt="Logo" className="h-10 w-10 rounded-lg" style={{ filter: 'invert(1)' }} />
                        <span className="text-xl font-bold">TJM Suite</span>
                    </div>
                    <nav className="space-y-2">
                        {navItems.map(({ name }) => (
                            <button
                                key={name}
                                onClick={() => setView(name)}
                                className={`w-full text-left px-4 py-2 rounded-md text-lg transition-colors ${view === name ? 'bg-indigo-600 text-white' : 'hover:bg-gray-700'}`}
                            >
                                {name}
                            </button>
                        ))}
                    </nav>
                </div>
                 <div>
                    <Button onClick={handleExport} variant="secondary" className="w-full mb-4">Export All Data</Button>
                    <div className="text-sm text-gray-400 border-t border-gray-700 pt-4">
                        <p>Logged in as: <span className="font-semibold text-indigo-300">{user.employee?.name || user.role}</span></p>
                        <button onClick={handleLogout} className="w-full text-left mt-2 font-bold text-red-600 hover:text-red-500">Logout</button>
                    </div>
                </div>
            </aside>
            <main className="flex-1 p-8 overflow-y-auto">
                <CurrentView />
            </main>
        </div>
    );
};

export default App;
