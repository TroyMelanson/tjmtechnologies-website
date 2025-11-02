import React, { useState, useMemo } from 'react';
import { User, Role, AppData } from '../types.ts';
import Modal from './Modal.tsx';
import { PlusIcon, EditIcon, TrashIcon, SortIcon } from './icons.tsx';
import { HOMES_BY_REGION } from '../constants.ts';


interface UserManagementProps {
  appData: AppData;
  onDataUpdate: (newAppData: AppData) => void;
  currentUser: User;
}

type SortableKeys = keyof User | 'associatedHomes';

const UserManagement: React.FC<UserManagementProps> = ({ appData, onDataUpdate, currentUser }) => {
  const { users, homes } = appData;
  const [isModalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [sortConfig, setSortConfig] = useState<{ key: SortableKeys; direction: 'ascending' | 'descending' } | null>({ key: 'name', direction: 'ascending'});

  // Form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<Role>(Role.NURSE);
  const [associatedHomeIds, setAssociatedHomeIds] = useState<string[]>([]);

  const sortedUsers = useMemo(() => {
    const sortableUsers = [...users];
    if (sortConfig !== null) {
      sortableUsers.sort((a, b) => {
        let aValue: any;
        let bValue: any;
        
        if (sortConfig.key === 'associatedHomes') {
          aValue = a.associatedHomeIds.map(id => homes.find(h => h.id === id)?.name).join(', ') || '';
          bValue = b.associatedHomeIds.map(id => homes.find(h => h.id === id)?.name).join(', ') || '';
        } else {
          aValue = a[sortConfig.key as keyof User];
          bValue = b[sortConfig.key as keyof User];
        }

        if (aValue < bValue) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableUsers;
  }, [users, sortConfig, homes]);

  const requestSort = (key: SortableKeys) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const getSortDirection = (key: SortableKeys) => {
    if (!sortConfig || sortConfig.key !== key) {
      return 'none';
    }
    return sortConfig.direction;
  }

  const openAddModal = () => {
    setEditingUser(null);
    setName('');
    setEmail('');
    setRole(Role.NURSE);
    setAssociatedHomeIds([]);
    setModalOpen(true);
  };

  const openEditModal = (user: User) => {
    setEditingUser(user);
    setName(user.name);
    setEmail(user.email);
    setRole(user.role);
    setAssociatedHomeIds(user.associatedHomeIds);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingUser(null);
  };

  const handleHomeIdChange = (homeId: string) => {
    setAssociatedHomeIds(prev =>
      prev.includes(homeId) ? prev.filter(id => id !== homeId) : [...prev, homeId]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;

    let updatedUsers: User[];
    if (editingUser) {
      updatedUsers = users.map(u =>
        u.id === editingUser.id ? { ...u, name, email, role, associatedHomeIds } : u
      );
    } else {
      const newUser: User = {
        id: `user-${Date.now()}`,
        name,
        email,
        role,
        associatedHomeIds,
      };
      updatedUsers = [...users, newUser];
    }
    onDataUpdate({ ...appData, users: updatedUsers });
    closeModal();
  };

  const handleDelete = (userId: string) => {
    if (window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
        if (userId === currentUser.id) {
            alert("You cannot delete your own account.");
            return;
        }
      const updatedUsers = users.filter(u => u.id !== userId);
      onDataUpdate({ ...appData, users: updatedUsers });
    }
  };
  
  const SortableHeader = ({ sortKey, children }: {sortKey: SortableKeys, children: React.ReactNode}) => (
    <th scope="col" className="px-6 py-3">
        <button onClick={() => requestSort(sortKey)} className="group font-bold flex items-center gap-1 uppercase tracking-wider text-xs transition-colors duration-200 text-slate-600 hover:text-sky-700">
            {children}
            <SortIcon direction={getSortDirection(sortKey)} />
        </button>
    </th>
  )

  return (
    <div className="bg-white/60 backdrop-blur-sm p-4 sm:p-6 rounded-xl shadow-lg transition-shadow duration-300 hover:shadow-2xl border border-slate-200">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-slate-700">User Management</h2>
        <button onClick={openAddModal} className="flex items-center gap-2 bg-sky-600 text-white px-4 py-2 rounded-lg hover:bg-sky-700 transition-all duration-200 transform hover:-translate-y-0.5 shadow-md hover:shadow-lg text-sm font-medium">
          <PlusIcon className="h-4 w-4" /> Add User
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left text-slate-500">
          <thead className="text-xs text-slate-700 bg-slate-100">
            <tr>
              <SortableHeader sortKey="name">Name</SortableHeader>
              <SortableHeader sortKey="email">Email</SortableHeader>
              <SortableHeader sortKey="role">Role</SortableHeader>
              <SortableHeader sortKey="associatedHomes">Associated Homes</SortableHeader>
              <th scope="col" className="px-6 py-3 text-right uppercase tracking-wider text-xs font-bold text-slate-600">Actions</th>
            </tr>
          </thead>
          <tbody>
            {sortedUsers.map(user => (
              <tr key={user.id} className="bg-white border-b border-slate-200 hover:bg-slate-50/50">
                <td className="px-6 py-4 font-medium text-slate-900">{user.name}</td>
                <td className="px-6 py-4">{user.email}</td>
                <td className="px-6 py-4"><span className="px-2 py-1 text-xs font-semibold uppercase rounded-full bg-slate-200 text-slate-700">{user.role}</span></td>
                <td className="px-6 py-4 max-w-xs truncate">
                  {user.associatedHomeIds.map(id => homes.find(h => h.id === id)?.name).join(', ') || 'N/A'}
                </td>
                <td className="px-6 py-4 flex justify-end gap-2">
                  <button onClick={() => openEditModal(user)} className="text-sky-600 hover:text-sky-800 transition-colors" aria-label={`Edit ${user.name}`}><EditIcon /></button>
                  <button onClick={() => handleDelete(user.id)} className="text-red-600 hover:text-red-800 transition-colors" aria-label={`Delete ${user.name}`}><TrashIcon /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal isOpen={isModalOpen} onClose={closeModal} title={editingUser ? 'Edit User' : 'Add User'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="userName" className="block text-sm font-medium text-slate-700">User Name</label>
            <input type="text" id="userName" value={name} onChange={e => setName(e.target.value)} required className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-sm shadow-sm placeholder-slate-400 focus:outline-none focus:ring-sky-500 focus:border-sky-500" />
          </div>
          <div>
            <label htmlFor="userEmail" className="block text-sm font-medium text-slate-700">Email</label>
            <input type="email" id="userEmail" value={email} onChange={e => setEmail(e.target.value)} required className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-sm shadow-sm placeholder-slate-400 focus:outline-none focus:ring-sky-500 focus:border-sky-500" />
          </div>
          <div>
            <label htmlFor="userRole" className="block text-sm font-medium text-slate-700">Role</label>
            <select id="userRole" value={role} onChange={e => setRole(e.target.value as Role)} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-slate-300 focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm rounded-md bg-white text-slate-800">
              {Object.values(Role).map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
          {(role === Role.ADMIN || role === Role.NURSE || role === Role.PHARMACY) && (
            <div>
              <label className="block text-sm font-medium text-slate-700">Associated Homes</label>
              <div className="mt-2 space-y-2 max-h-60 overflow-y-auto p-2 border border-slate-300 rounded-md bg-slate-50/50">
                {HOMES_BY_REGION.map(region => (
                  <div key={region.region}>
                    <h4 className="font-semibold text-sm text-slate-600 mt-2 mb-1 sticky top-0 bg-slate-100 p-1 -mx-2 rounded">{region.region}</h4>
                    {region.homes.map(home => (
                       <label key={home.id} className="flex items-center p-1 rounded-md hover:bg-sky-100/50">
                        <input
                          type="checkbox"
                          checked={associatedHomeIds.includes(home.id)}
                          onChange={() => handleHomeIdChange(home.id)}
                          className="h-4 w-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500"
                        />
                        <span className="ml-2 text-sm text-slate-700">{home.name}</span>
                      </label>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          )}
          <div className="flex justify-end gap-2 pt-4">
            <button type="button" onClick={closeModal} className="px-4 py-2 bg-slate-200 text-slate-800 rounded-md hover:bg-slate-300 transition-colors">Cancel</button>
            <button type="submit" className="px-4 py-2 bg-sky-600 text-white rounded-md hover:bg-sky-700 transition-colors">{editingUser ? 'Save Changes' : 'Add User'}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default UserManagement;