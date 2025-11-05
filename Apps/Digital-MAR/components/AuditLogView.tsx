import React, { useMemo } from 'react';
import { AuditLogEntry } from '../types.ts';

interface AuditLogViewProps {
  auditLog: AuditLogEntry[];
  residentId: string;
}

const AuditLogView: React.FC<AuditLogViewProps> = ({ auditLog, residentId }) => {
  const filteredAndSortedLog = useMemo(() => {
    return auditLog
      .filter(entry => entry.residentId === residentId)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [auditLog, residentId]);

  return (
    <div className="overflow-x-auto">
      <h3 className="text-lg font-semibold text-slate-700 mb-4">Activity History</h3>
      {filteredAndSortedLog.length === 0 ? (
        <p className="text-slate-500 text-center py-8">No activity recorded for this resident yet.</p>
      ) : (
        <table className="w-full text-sm text-left text-slate-500">
          <thead className="text-xs text-slate-700 uppercase bg-slate-100">
            <tr>
              <th scope="col" className="px-6 py-3">Date & Time</th>
              <th scope="col" className="px-6 py-3">User</th>
              <th scope="col" className="px-6 py-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredAndSortedLog.map(entry => (
              <tr key={entry.id} className="bg-white border-b border-slate-200 hover:bg-slate-50/50">
                <td className="px-6 py-4 font-mono text-xs">
                  {new Date(entry.timestamp).toLocaleString()}
                </td>
                <td className="px-6 py-4 font-medium text-slate-800">
                  {entry.userName}
                </td>
                <td className="px-6 py-4">
                  {entry.action}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default AuditLogView;