
export enum Role {
  ADMIN = 'ADMIN',
  NURSE = 'NURSE',
  PHARMACY = 'PHARMACY',
  IT_ADMIN = 'IT_ADMIN',
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
  associatedHomeIds: string[];
}

export interface Home {
  id:string;
  name: string;
}

export interface HomeRegion {
  region: string;
  homes: Home[];
}

export interface Medication {
  id: string;
  name: string;
  dosage: string;
  notes: string;
  times: string[]; // HH:mm format e.g., ['08:00', '20:00']
}

export interface Resident {
  id: string;
  name: string;
  homeId: string;
  physician: string;
  medications: Medication[];
}

// Structure: { [residentId]: { [year]: { [month]: { [day]: { [medicationId]: { [time]: string } } } } } }
// The final string is the initials of the administrator
export interface AdministrationRecords {
  [residentId: string]: {
    [year: number]: {
      [month: number]: {
        [day: number]: {
          [medicationId: string]: {
            [time: string]: string;
          };
        };
      };
    };
  };
}

export interface AppData {
  users: User[];
  homes: Home[];
  residents: Resident[];
  records: AdministrationRecords;
}