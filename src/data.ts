export type Role =
  | 'Principal'
  | 'Office Staff'
  | 'Academic Staff'
  | 'Teacher'
  | 'Security'
  | 'Parent'
  | 'Student'

export type Student = {
  id: string
  name: string
  grade: string
  className: string
  status: 'Present' | 'Absent' | 'Late'
  email: string
  parent: string
  parentNic: string
  emergency: string
  clubs: string[]
  attendance: number
  initials: string
  color: string
}

export type Staff = {
  id: string
  name: string
  title: string
  department: string
  email: string
  phone: string
  nic: string
  status: 'On campus' | 'Off campus'
  initials: string
  color: string
}

export const demoAccounts: Record<string, { password: string; role: Role; name: string }> = {
  'principal@greenfield.edu': { password: 'Greenfield123!', role: 'Principal', name: 'Dr. Amara Perera' },
  'office@greenfield.edu': { password: 'Greenfield123!', role: 'Office Staff', name: 'Nadeesha Silva' },
  'academic@greenfield.edu': { password: 'Greenfield123!', role: 'Academic Staff', name: 'Ruwan Jayasinghe' },
  'teacher@greenfield.edu': { password: 'Greenfield123!', role: 'Teacher', name: 'Maya Fernando' },
  'security@greenfield.edu': { password: 'Greenfield123!', role: 'Security', name: 'Kasun Wijesinghe' },
  'parent@greenfield.edu': { password: 'Greenfield123!', role: 'Parent', name: 'Anjali Perera' },
  'student@greenfield.edu': { password: 'Greenfield123!', role: 'Student', name: 'Amaya Perera' },
}

const colors = ['lavender', 'mint', 'peach', 'blue', 'rose']

export const students: Student[] = [
  { id: 'STU-2024-0184', name: 'Amaya Perera', grade: 'Grade 10', className: '10-A', status: 'Present', email: 'amaya.perera@student.greenfield.edu', parent: 'Anjali Perera', parentNic: '1984•••••V', emergency: '+94 77 234 8901', clubs: ['Science Club', 'Swimming'], attendance: 96, initials: 'AP', color: colors[0] },
  { id: 'STU-2024-0207', name: 'Kavindu Silva', grade: 'Grade 9', className: '9-B', status: 'Present', email: 'kavindu.silva@student.greenfield.edu', parent: 'Malini Silva', parentNic: '1981•••••V', emergency: '+94 71 567 2340', clubs: ['Chess Club', 'Cricket'], attendance: 92, initials: 'KS', color: colors[1] },
  { id: 'STU-2024-0163', name: 'Hiruni Jayawardena', grade: 'Grade 11', className: '11-A', status: 'Late', email: 'hiruni.j@student.greenfield.edu', parent: 'Nimal Jayawardena', parentNic: '1979•••••V', emergency: '+94 76 123 5678', clubs: ['Debate Society', 'Netball'], attendance: 89, initials: 'HJ', color: colors[2] },
  { id: 'STU-2024-0281', name: 'Dilan Fernando', grade: 'Grade 8', className: '8-C', status: 'Absent', email: 'dilan.f@student.greenfield.edu', parent: 'Sanjeewa Fernando', parentNic: '1983•••••V', emergency: '+94 72 678 9012', clubs: ['Art Circle'], attendance: 94, initials: 'DF', color: colors[3] },
  { id: 'STU-2024-0119', name: 'Senuri de Alwis', grade: 'Grade 12', className: '12-A', status: 'Present', email: 'senuri.d@student.greenfield.edu', parent: 'Chathuri de Alwis', parentNic: '1978•••••V', emergency: '+94 77 890 1234', clubs: ['Music Society', 'Athletics'], attendance: 98, initials: 'SA', color: colors[4] },
  { id: 'STU-2024-0312', name: 'Owen Rajapaksha', grade: 'Grade 7', className: '7-B', status: 'Present', email: 'owen.r@student.greenfield.edu', parent: 'Tharanga Rajapaksha', parentNic: '1987•••••V', emergency: '+94 75 345 6789', clubs: ['Robotics'], attendance: 91, initials: 'OR', color: colors[0] },
  { id: 'STU-2024-0255', name: 'Sithmi Kumari', grade: 'Grade 9', className: '9-A', status: 'Late', email: 'sithmi.k@student.greenfield.edu', parent: 'Lakshman Kumari', parentNic: '1980•••••V', emergency: '+94 70 456 7890', clubs: ['Drama Club'], attendance: 87, initials: 'SK', color: colors[1] },
  { id: 'STU-2024-0146', name: 'Rehan Wickramasinghe', grade: 'Grade 10', className: '10-B', status: 'Present', email: 'rehan.w@student.greenfield.edu', parent: 'Shalini Wickramasinghe', parentNic: '1985•••••V', emergency: '+94 78 901 2345', clubs: ['Football', 'Science Club'], attendance: 95, initials: 'RW', color: colors[2] },
]

export const staff: Staff[] = [
  { id: 'STF-2018-007', name: 'Maya Fernando', title: 'Senior Teacher · Mathematics', department: 'Academic', email: 'maya.fernando@greenfield.edu', phone: '+94 77 234 8901', nic: '1984•••••V', status: 'On campus', initials: 'MF', color: 'lavender' },
  { id: 'STF-2018-008', name: 'Ruwan Jayasinghe', title: 'Academic Coordinator', department: 'Academic', email: 'ruwan.j@greenfield.edu', phone: '+94 71 567 2340', nic: '1981•••••V', status: 'On campus', initials: 'RJ', color: 'mint' },
  { id: 'STF-2018-009', name: 'Nadeesha Silva', title: 'Office Administrator', department: 'Administration', email: 'nadeesha.s@greenfield.edu', phone: '+94 76 123 5678', nic: '1979•••••V', status: 'On campus', initials: 'NS', color: 'peach' },
  { id: 'STF-2018-010', name: 'Kasun Wijesinghe', title: 'Campus Security', department: 'Non-academic', email: 'kasun.w@greenfield.edu', phone: '+94 72 678 9012', nic: '1983•••••V', status: 'On campus', initials: 'KW', color: 'blue' },
  { id: 'STF-2018-011', name: 'Dr. Amara Perera', title: 'Principal', department: 'Leadership', email: 'principal@greenfield.edu', phone: '+94 77 890 1234', nic: '1978•••••V', status: 'Off campus', initials: 'AP', color: 'rose' },
]

export const classList = ['6-A', '6-B', '7-A', '7-B', '8-A', '8-B', '8-C', '9-A', '9-B', '10-A', '10-B', '11-A', '12-A']
