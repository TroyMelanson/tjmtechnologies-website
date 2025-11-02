import { Role, AppData, HomeRegion } from './types.ts';

export const HOMES_BY_REGION: HomeRegion[] = [
  {
    region: 'Demo Homes',
    homes: [
      { id: 'home-1', name: 'Sunset Manor (Demo)' },
      { id: 'home-2', name: 'Oakridge Living Center (Demo)' },
    ]
  },
  {
    region: 'Chaleur',
    homes: [
      { id: 'home-chaleur-1', name: 'Foyer Notre-Dame-de-Lourdes Inc.' },
      { id: 'home-chaleur-2', name: 'Manoir Brise de l\'Oasis Inc.' },
      { id: 'home-chaleur-3', name: 'Résidence Bellerive' },
      { id: 'home-chaleur-4', name: 'Résidence Normandeau' },
      { id: 'home-chaleur-5', name: 'Résidence Le Royal' },
      { id: 'home-chaleur-6', name: 'Foyer Lincour' },
      { id: 'home-chaleur-7', name: 'Manoir du Rocher' },
      { id: 'home-chaleur-8', name: 'Résidence Chez-soi' },
      { id: 'home-chaleur-9', name: 'Le Foyer Le Goulet' },
      { id: 'home-chaleur-10', name: 'Foyer Le P\'tit Abri' },
    ]
  },
  {
    region: 'Edmundston',
    homes: [
      { id: 'home-edmundston-1', name: 'Les Résidences Jodin Inc.' },
      { id: 'home-edmundston-2', name: 'Manoir Belle Vue' },
      { id: 'home-edmundston-3', name: 'Le Foyer St-Joseph de St-Basile' },
      { id: 'home-edmundston-4', name: 'Résidence M.G.M.' },
      { id: 'home-edmundston-5', name: 'Foyer Ste-Émilie' },
    ]
  },
  {
    region: 'Fredericton',
    homes: [
      { id: 'home-fredericton-1', name: 'Orchard View Long Term Care Home' },
      { id: 'home-fredericton-2', name: 'Shannex - Brunswick Hall' },
      { id: 'home-fredericton-3', name: 'Shannex - Thomas Hall' },
      { id: 'home-fredericton-4', name: 'Shannex - Neill Hall' },
      { id: 'home-fredericton-5', name: 'York Care Centre' },
      { id: 'home-fredericton-6', name: 'Windsor Court' },
      { id: 'home-fredericton-7', name: 'The Briarlea' },
    ]
  },
  {
    region: 'Miramichi',
    homes: [
      { id: 'home-miramichi-1', name: 'Losier Hall' },
      { id: 'home-miramichi-2', name: 'Miramichi Senior Citizens Home' },
      { id: 'home-miramichi-3', name: 'The Mount Saint Joseph' },
    ]
  },
  {
    region: 'Moncton',
    homes: [
      { id: 'home-moncton-1', name: 'The Moncton Hospital' },
      { id: 'home-moncton-2', name: 'Villa du Repos' },
      { id: 'home-moncton-3', name: 'Gordon Hall' },
      { id: 'home-moncton-4', name: 'Lakeside Hall' },
      { id: 'home-moncton-5', name: 'Maplestone Hall' },
      { id: 'home-moncton-6', name: 'Shannex - Faubourg du Mascaret' },
      { id: 'home-moncton-7', name: 'ProTem Health Services' },
    ]
  },
  {
    region: 'Restigouche',
    homes: [
      { id: 'home-restigouche-1', name: 'Campbellton Nursing Home Inc.' },
      { id: 'home-restigouche-2', name: 'Dalhousie Nursing Home' },
    ]
  },
  {
    region: 'Saint John',
    homes: [
      { id: 'home-saintjohn-1', name: 'Kennebec Manor' },
      { id: 'home-saintjohn-2', name: 'Loch Lomond Villa' },
      { id: 'home-saintjohn-3', name: 'Rocmaura Nursing Home' },
      { id: 'home-saintjohn-4', name: 'Shannex - Tucker Hall' },
      { id: 'home-saintjohn-5', name: 'Shannex - Embassy Hall' },
      { id: 'home-saintjohn-6', name: 'Shannex - Cohen Hall' },
    ]
  }
];


export const INITIAL_DATA: AppData = {
  users: [
    { id: 'user-0', email: 'itadmin@mar.com', name: 'IT Supervisor', role: Role.IT_ADMIN, associatedHomeIds: [] },
    { id: 'user-1', email: 'admin@mar.com', name: 'Alex Johnson', role: Role.ADMIN, associatedHomeIds: ['home-1', 'home-2'] },
    { id: 'user-2', email: 'nurse@mar.com', name: 'Brenda Smith', role: Role.NURSE, associatedHomeIds: ['home-1'] },
    { id: 'user-3', email: 'pharmacy@mar.com', name: 'Charles Lee', role: Role.PHARMACY, associatedHomeIds: ['home-1', 'home-2', 'home-chaleur-1'] },
    { id: 'user-4', email: 'nurse2@mar.com', name: 'Diana Ray', role: Role.NURSE, associatedHomeIds: ['home-2'] },
  ],
  homes: HOMES_BY_REGION.flatMap(region => region.homes),
  residents: [
    {
      id: 'res-1',
      name: 'Eleanor Vance',
      homeId: 'home-1',
      physician: 'Dr. Evelyn Reed',
      medications: [
        { id: 'med-1', name: 'Lisinopril', dosage: '10mg', notes: 'For blood pressure', times: ['08:00'] },
        { id: 'med-2', name: 'Metformin', dosage: '500mg', notes: 'With meals', times: ['08:00', '20:00'] },
      ],
    },
    {
      id: 'res-2',
      name: 'Robert Paulson',
      homeId: 'home-1',
      physician: 'Dr. Evelyn Reed',
      medications: [
        { id: 'med-3', name: 'Aspirin', dosage: '81mg', notes: 'Daily', times: ['09:00'] },
      ],
    },
    {
      id: 'res-3',
      name: 'Mary-Anne Gable',
      homeId: 'home-2',
      physician: 'Dr. Marcus Thorne',
      medications: [
        { id: 'med-4', name: 'Atorvastatin', dosage: '20mg', notes: 'At bedtime', times: ['21:00'] },
        { id: 'med-5', name: 'Levothyroxine', dosage: '50mcg', notes: 'Empty stomach', times: ['07:00'] },
      ],
    },
     {
      id: 'res-4',
      name: 'Jean-Pierre Dubois',
      homeId: 'home-chaleur-1',
      physician: 'Dr. Isabelle Moreau',
      medications: [
        { id: 'med-6', name: 'Warfarin', dosage: '5mg', notes: 'Evening', times: ['19:00'] },
      ],
    },
  ],
  records: {},
};