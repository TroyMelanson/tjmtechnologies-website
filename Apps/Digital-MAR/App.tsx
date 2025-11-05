import React, { useState, useEffect, useCallback } from 'react';
import LoginScreen from './components/LoginScreen.tsx';
import Dashboard from './components/Dashboard.tsx';
import { User, AppData, AuditLogEntry } from './types.ts';
import { INITIAL_DATA } from './constants.ts';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [appData, setAppData] = useState<AppData>(INITIAL_DATA);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // NOTE: This application uses the browser's localStorage for data persistence.
    // This is suitable for a single-user prototype. For a real-world, multi-user
    // application, this data would be fetched from and saved to a backend server
    // connected to a database (e.g., on the Azure Canadian Cloud to meet data
    // residency requirements).
    try {
      const savedUser = localStorage.getItem('mar_user');
      const savedData = localStorage.getItem('mar_data');

      if (savedUser) {
        setCurrentUser(JSON.parse(savedUser));
      }

      if (savedData) {
        const parsedData = JSON.parse(savedData);
        // Migration for adding new features if they don't exist in old data
        if (!parsedData.users) parsedData.users = INITIAL_DATA.users;
        if (!parsedData.auditLog) parsedData.auditLog = [];
        
        setAppData(parsedData);
      } else {
        // First time load, save initial data
        localStorage.setItem('mar_data', JSON.stringify(INITIAL_DATA));
      }
    } catch (error) {
      console.error("Failed to load data from local storage", error);
      // If loading fails, reset to initial state
      localStorage.setItem('mar_data', JSON.stringify(INITIAL_DATA));
      setAppData(INITIAL_DATA);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    localStorage.setItem('mar_user', JSON.stringify(user));
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('mar_user');
  };

  const handleDataUpdate = useCallback((newAppData: AppData) => {
    // In a real application, this function would send the updated data to a backend API.
    // Here, we're saving it to localStorage to simulate persistence.
    setAppData(newAppData);
    localStorage.setItem('mar_data', JSON.stringify(newAppData));
  }, []);

  const logAction = useCallback((action: string, residentId: string) => {
    if (!currentUser) return;
    
    const newLogEntry: AuditLogEntry = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString(),
      userId: currentUser.id,
      userName: currentUser.name,
      residentId,
      action,
    };

    setAppData(prevData => {
      const newData = {
        ...prevData,
        auditLog: [...prevData.auditLog, newLogEntry],
      };
      // Also save the updated data to localStorage immediately
      localStorage.setItem('mar_data', JSON.stringify(newData));
      return newData;
    });

  }, [currentUser]);

  const handleDownloadBackup = () => {
    try {
      const dataStr = JSON.stringify(appData, null, 2);
      const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
      const exportFileDefaultName = `mar_backup_${new Date().toISOString().split('T')[0]}.json`;
      
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();
    } catch (error) {
        alert('Error creating backup file.');
        console.error("Backup failed", error);
    }
  };

  const handleUploadBackup = (file: File) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const result = event.target?.result;
        if (typeof result === 'string') {
          const restoredData: AppData = JSON.parse(result);
          // Basic validation to ensure the file is a valid backup
          if (restoredData.homes && restoredData.residents && restoredData.records && restoredData.users) {
            // Ensure audit log exists in restored data, or add it
            if (!restoredData.auditLog) {
                restoredData.auditLog = [];
            }
            handleDataUpdate(restoredData);
            alert('Backup restored successfully!');
          } else {
            alert('Invalid backup file format.');
          }
        }
      } catch (error) {
        alert('Failed to read or parse the backup file.');
        console.error("Restore failed", error);
      }
    };
    reader.readAsText(file);
  };

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }
  
  return (
    <>
      {currentUser && appData ? (
        <Dashboard 
          user={currentUser} 
          appData={appData} 
          onLogout={handleLogout}
          onDataUpdate={handleDataUpdate}
          onDownloadBackup={handleDownloadBackup}
          onUploadBackup={handleUploadBackup}
          logAction={logAction}
        />
      ) : (
        <LoginScreen onLogin={handleLogin} users={appData.users} />
      )}
    </>
  );
};

export default App;