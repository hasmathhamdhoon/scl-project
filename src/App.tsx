import { useEffect, useMemo, useState } from 'react'
import {
  ArrowDownLeft, ArrowRight, ArrowUpRight, Bell, BookOpen, CalendarDays,
  Check, ChevronDown, ChevronLeft, ChevronRight, CircleHelp,
  Download, Fingerprint, GraduationCap, LayoutDashboard, LogOut, Menu,
  MoreHorizontal, Plus, QrCode, Search, ShieldCheck, SlidersHorizontal,
  Sparkles, Users, X,
} from 'lucide-react'
import { classList, demoAccounts, staff as initialStaff, students as initialStudents, type Role, type Staff, type Student } from './data'

type Page = 'Overview' | 'Students' | 'Staff' | 'Attendance' | 'Gate pass' | 'Academics' | 'Clubs & sports' | 'Settings'
type GateEvent = { name: string; id: string; action: 'Entry' | 'Exit'; time: string; type: 'Student' | 'Staff' }
type PassRequest = { name: string; className: string; reason: string; time: string; status: 'Pending' | 'Approved' | 'Declined' }

const navigation: { name: Page; icon: typeof LayoutDashboard; roles: Role[] }[] = [
  { name: 'Overview', icon: LayoutDashboard, roles: ['Principal', 'Office Staff', 'Academic Staff', 'Teacher', 'Security', 'Parent', 'Student'] },
  { name: 'Students', icon: GraduationCap, roles: ['Principal', 'Office Staff', 'Academic Staff', 'Teacher', 'Parent', 'Student'] },
  { name: 'Staff', icon: Users, roles: ['Principal', 'Office Staff'] },
  { name: 'Attendance', icon: CalendarDays, roles: ['Principal', 'Office Staff', 'Academic Staff', 'Teacher', 'Parent', 'Student'] },
  { name: 'Gate pass', icon: ArrowDownLeft, roles: ['Principal', 'Office Staff', 'Security', 'Parent'] },
  { name: 'Academics', icon: BookOpen, roles: ['Principal', 'Academic Staff', 'Teacher', 'Parent', 'Student'] },
  { name: 'Clubs & sports', icon: Sparkles, roles: ['Principal', 'Teacher', 'Parent', 'Student'] },
  { name: 'Settings', icon: SlidersHorizontal, roles: ['Principal', 'Office Staff'] },
]

const roleOptions: Role[] = ['Principal', 'Office Staff', 'Academic Staff', 'Teacher', 'Security', 'Parent', 'Student']

const gateEvents: GateEvent[] = [
  { name: 'Amaya Perera', id: 'STU-2024-0184', action: 'Entry', time: '08:12 AM', type: 'Student' },
  { name: 'Maya Fernando', id: 'STF-2018-007', action: 'Entry', time: '08:08 AM', type: 'Staff' },
  { name: 'Kavindu Silva', id: 'STU-2024-0207', action: 'Entry', time: '08:04 AM', type: 'Student' },
  { name: 'Hiruni Jayawardena', id: 'STU-2024-0163', action: 'Entry', time: '08:02 AM', type: 'Student' },
]

const initialPasses: PassRequest[] = [
  { name: 'Senuri de Alwis', className: '12-A', reason: 'Doctor appointment', time: '10:45 AM', status: 'Pending' },
  { name: 'Kavindu Silva', className: '9-B', reason: 'Family commitment', time: '11:20 AM', status: 'Pending' },
  { name: 'Hiruni Jayawardena', className: '11-A', reason: 'Feeling unwell', time: '09:30 AM', status: 'Approved' },
]

function Avatar({ initials, color = 'lavender', size = 'normal' }: { initials: string; color?: string; size?: 'normal' | 'large' }) {
  return <span className={`avatar avatar-${color} ${size === 'large' ? 'avatar-large' : ''}`}>{initials}</span>
}

function Badge({ children, tone = 'green' }: { children: React.ReactNode; tone?: 'green' | 'amber' | 'red' | 'blue' | 'gray' }) {
  return <span className={`badge badge-${tone}`}><span className="badge-dot" />{children}</span>
}

function Logo() {
  return <div className="brand-mark"><span className="brand-leaf">✳</span></div>
}

function Login({ onLogin }: { onLogin: (email: string, password: string) => string | null }) {
  const [email, setEmail] = useState('principal@greenfield.edu')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [remaining, setRemaining] = useState(() => {
    const until = Number(localStorage.getItem('greenfield-lock-until') || 0)
    return Math.max(0, Math.ceil((until - Date.now()) / 1000))
  })

  useEffect(() => {
    if (remaining <= 0) return
    const timer = window.setTimeout(() => setRemaining((value) => Math.max(0, value - 1)), 1000)
    return () => window.clearTimeout(timer)
  }, [remaining])

  function submit(event: React.FormEvent) {
    event.preventDefault()
    if (remaining > 0) return
    const message = onLogin(email.trim().toLowerCase(), password)
    setError(message || '')
    if (message === 'locked') setRemaining(30)
  }

  return (
    <main className="login-shell">
      <section className="login-art">
        <div className="login-art-top"><Logo /><span>GREENFIELD <b>ACADEMY</b></span></div>
        <div className="art-copy">
          <span className="eyebrow"><span className="live-dot" /> A school community, connected</span>
          <h1>Every day,<br />a chance to <em>grow.</em></h1>
          <p>One thoughtful space for the people, progress, and little moments that make our school special.</p>
        </div>
        <div className="art-bottom">
          <div className="art-quote">“Education is not the filling of a pail, but the lighting of a fire.”</div>
          <div className="art-quote-by">W. B. YEATS <span>·</span> GREENFIELD ACADEMY</div>
        </div>
        <span className="art-orb orb-one" /><span className="art-orb orb-two" /><span className="art-sun">✳</span>
      </section>
      <section className="login-panel">
        <div className="login-top-mobile"><Logo /><span>GREENFIELD <b>ACADEMY</b></span></div>
        <div className="login-form-wrap">
          <div className="welcome-tag">WELCOME BACK</div>
          <h2>Sign in to your<br />school portal.</h2>
          <p className="login-subtitle">Your school day, all in one place.</p>
          <form onSubmit={submit} className="login-form">
            <label htmlFor="email">Email address</label>
            <input id="email" type="email" autoComplete="username" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@greenfield.edu" required />
            <div className="label-row"><label htmlFor="password">Password</label><a href="#help" onClick={(event) => event.preventDefault()}>Forgot password?</a></div>
            <input id="password" type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Enter your password" required />
            {error && error !== 'locked' && <p className="login-error">{error}</p>}
            {remaining > 0 && <p className="login-error">Too many attempts. Try again in {remaining}s.</p>}
            <button className="button button-dark login-button" type="submit" disabled={remaining > 0}>Sign in <ArrowRight size={17} /></button>
          </form>
          <div className="login-demo"><div className="demo-icon"><ShieldCheck size={17} /></div><div><b>Exploring the portal?</b><span>Use any role's email and password <code>Greenfield123!</code></span></div></div>
          <div className="login-foot">Need a hand? <a href="#support" onClick={(event) => event.preventDefault()}>Contact school office</a><span>© 2025 Greenfield Academy</span></div>
        </div>
      </section>
    </main>
  )
}

function App() {
  const [session, setSession] = useState<{ email: string; role: Role; name: string } | null>(() => {
    try { return JSON.parse(localStorage.getItem('greenfield-session') || 'null') as { email: string; role: Role; name: string } | null } catch { return null }
  })
  const [page, setPage] = useState<Page>('Overview')
  const [roleMenu, setRoleMenu] = useState(false)
  const [mobileNav, setMobileNav] = useState(false)
  const [search, setSearch] = useState('')
  const [students, setStudents] = useState(initialStudents)
  const [staff, setStaff] = useState(initialStaff)
  const [passes, setPasses] = useState(initialPasses)
  const [events, setEvents] = useState(gateEvents)
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null)
  const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null)
  const [modal, setModal] = useState<'student' | 'staff' | 'scan' | 'pass' | null>(null)
  const [toast, setToast] = useState('')
  const [scanValue, setScanValue] = useState('')
  const [scanMessage, setScanMessage] = useState('')
  const [filterClass, setFilterClass] = useState('All classes')

  function showToast(message: string) {
    setToast(message)
    window.setTimeout(() => setToast(''), 2600)
  }

  function login(email: string, password: string) {
    const until = Number(localStorage.getItem('greenfield-lock-until') || 0)
    if (until > Date.now()) return 'locked'
    const account = demoAccounts[email]
    if (!account || account.password !== password) {
      const attempts = Number(localStorage.getItem('greenfield-attempts') || 0) + 1
      localStorage.setItem('greenfield-attempts', String(attempts))
      if (attempts >= 3) {
        localStorage.setItem('greenfield-lock-until', String(Date.now() + 30_000))
        localStorage.setItem('greenfield-attempts', '0')
        return 'locked'
      }
      return `That email and password don't match. ${3 - attempts} ${3 - attempts === 1 ? 'attempt' : 'attempts'} remaining.`
    }
    localStorage.removeItem('greenfield-attempts')
    localStorage.removeItem('greenfield-lock-until')
    const nextSession = { email, role: account.role, name: account.name }
    localStorage.setItem('greenfield-session', JSON.stringify(nextSession))
    setSession(nextSession)
    return null
  }

  function changeRole(role: Role) {
    if (!session) return
    const next = { ...session, role }
    setSession(next)
    localStorage.setItem('greenfield-session', JSON.stringify(next))
    const nextPage = navigation.find((item) => item.name === page && item.roles.includes(role))?.name ?? 'Overview'
    setPage(nextPage)
    setRoleMenu(false)
  }

  const canManageStudents = session?.role === 'Principal' || session?.role === 'Office Staff'
  const canManageStaff = session?.role === 'Principal' || session?.role === 'Office Staff'
  const canManageAcademics = session?.role === 'Principal' || session?.role === 'Teacher' || session?.role === 'Academic Staff'
  const canManagePasses = session?.role === 'Principal' || session?.role === 'Office Staff'
  const allowedNavigation = navigation.filter((item) => session && item.roles.includes(session.role))
  const filteredStudents = useMemo(() => students.filter((student) => {
    const matchesQuery = `${student.name} ${student.id} ${student.grade} ${student.className}`.toLowerCase().includes(search.toLowerCase())
    return matchesQuery && (filterClass === 'All classes' || student.className === filterClass)
  }), [students, search, filterClass])

  if (!session) return <Login onLogin={login} />

  const pageTitles: Record<Page, string> = {
    Overview: 'A lovely day to learn.', Students: 'Our students', Staff: 'The people behind it all',
    Attendance: 'Here, every day counts.', 'Gate pass': 'Campus in & out',
    Academics: 'Learning in progress', 'Clubs & sports': 'Find your thing.', Settings: 'A little housekeeping',
  }
  const today = new Date()
  const dateLabel = today.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })

  function recordScan() {
    const match = students.find((student) => student.id.toLowerCase() === scanValue.trim().toLowerCase())
    const staffMatch = staff.find((member) => member.id.toLowerCase() === scanValue.trim().toLowerCase())
    const person = match?.name || staffMatch?.name
    const id = match?.id || staffMatch?.id
    if (!person || !id) {
      setScanMessage('No student or staff member found with that ID.')
      return
    }
    const lastEvent = events.find((event) => event.id === id)
    const action = lastEvent?.action === 'Entry' ? 'Exit' : 'Entry'
    const newEvent: GateEvent = { name: person, id, action, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), type: match ? 'Student' : 'Staff' }
    setEvents((currentEvents) => [newEvent, ...currentEvents])
    setScanMessage(`${person} checked ${action === 'Entry' ? 'in' : 'out'} successfully.`)
    setScanValue('')
    showToast(`${action} recorded`)
  }

  function addStudent(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const data = new FormData(event.currentTarget)
    const name = String(data.get('name')).trim()
    const id = String(data.get('id')).trim()
    const className = String(data.get('className'))
    if (students.some((student) => student.id.toLowerCase() === id.toLowerCase())) {
      showToast('A student with that ID already exists')
      return
    }
    const newStudent: Student = {
      id, name, grade: `Grade ${className.split('-')[0]}`, className, status: 'Present',
      email: `${name.toLowerCase().replaceAll(' ', '.')}@student.greenfield.edu`,
      parent: String(data.get('parent')).trim(), parentNic: String(data.get('nic')).trim(),
      emergency: String(data.get('emergency')).trim(), clubs: [], attendance: 100,
      initials: name.split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase(), color: 'blue',
    }
    setStudents((currentStudents) => [newStudent, ...currentStudents])
    setModal(null)
    showToast('Student profile added')
  }

  function addStaffMember(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const data = new FormData(event.currentTarget)
    const name = String(data.get('name')).trim()
    setStaff((members) => [{ id: `STF-2025-${String(members.length + 1).padStart(3, '0')}`, name, title: String(data.get('title')), department: String(data.get('department')), email: String(data.get('email')), phone: String(data.get('phone')), nic: String(data.get('nic')), status: 'Off campus', initials: name.split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase(), color: 'mint' }, ...members])
    setModal(null)
    showToast('Staff profile added')
  }

  function updatePass(index: number, status: PassRequest['status']) {
    setPasses((requests) => requests.map((request, requestIndex) => requestIndex === index ? { ...request, status } : request))
    showToast(`Short leave ${status.toLowerCase()}`)
  }

  return (
    <div className="app-shell">
      <aside className={`sidebar ${mobileNav ? 'sidebar-open' : ''}`}>
        <div className="sidebar-brand"><Logo /><div><b>GREENFIELD</b><span>ACADEMY PORTAL</span></div><button className="icon-button mobile-close" onClick={() => setMobileNav(false)} aria-label="Close menu"><X size={19} /></button></div>
        <div className="school-switch"><div className="school-avatar">G</div><div><b>Greenfield Academy</b><span>Colombo, Sri Lanka</span></div><ChevronDown size={15} /></div>
        <div className="nav-caption">YOUR SCHOOL</div>
        <nav className="main-nav">
          {allowedNavigation.map(({ name, icon: Icon }) => (
            <button key={name} onClick={() => { setPage(name); setMobileNav(false) }} className={`nav-item ${page === name ? 'nav-active' : ''}`}>
              <Icon size={18} strokeWidth={page === name ? 2.2 : 1.8} /><span>{name}</span>{name === 'Gate pass' && <span className="nav-count">2</span>}
            </button>
          ))}
        </nav>
        <div className="sidebar-spacer" />
        <div className="sidebar-help"><div className="help-mark"><CircleHelp size={18} /></div><div><b>Need a hand?</b><span>We're happy to help.</span><button onClick={() => showToast('The school office is ready to help you.')}>Get support <ArrowRight size={13} /></button></div></div>
        <button className="profile-switch" onClick={() => setRoleMenu((open) => !open)}>
          <Avatar initials={session.name.split(' ').map((part) => part[0]).join('').slice(0, 2)} color="peach" />
          <span className="profile-copy"><b>{session.name}</b><span>{session.role}</span></span><MoreHorizontal size={19} />
        </button>
      </aside>
      {mobileNav && <button className="nav-scrim" onClick={() => setMobileNav(false)} aria-label="Close navigation" />}

      <main className="main-area">
        <header className="topbar">
          <button className="icon-button menu-button" onClick={() => setMobileNav(true)} aria-label="Open menu"><Menu size={21} /></button>
          <div className="breadcrumb"><span>Greenfield Academy</span><ChevronRight size={14} /><b>{page}</b></div>
          <div className="topbar-tools">
            <label className="global-search"><Search size={16} /><input value={search} onChange={(event) => { setSearch(event.target.value); if (event.target.value) setPage('Students') }} placeholder="Find a student by name or ID..." /><kbd>⌘ K</kbd></label>
            <button className="icon-button notification-button" aria-label="Notifications" onClick={() => showToast('You’re all caught up!')}><Bell size={18} /><i /></button>
            <div className="role-picker-wrap">
              <button className="role-picker" onClick={() => setRoleMenu((open) => !open)}><Avatar initials={session.name.split(' ').map((part) => part[0]).join('').slice(0, 2)} color="peach" /><span>{session.role}</span><ChevronDown size={14} /></button>
              {roleMenu && <div className="role-menu"><span className="role-menu-label">PREVIEW AS</span>{roleOptions.map((role) => <button key={role} onClick={() => changeRole(role)} className={session.role === role ? 'role-selected' : ''}>{role}{session.role === role && <Check size={14} />}</button>)}<div className="role-menu-divider" /><button onClick={() => { setSession(null); localStorage.removeItem('greenfield-session'); setRoleMenu(false) }}><LogOut size={14} /> Sign out</button></div>}
            </div>
          </div>
        </header>
        <div className="content-area">
          <div className="page-intro"><div><div className="date-line"><span className="date-dot" />{dateLabel} <span>·</span> Term 2, Week 8</div><h1>{pageTitles[page]}</h1><p>{page === 'Overview' ? `Good morning, ${session.name.split(' ')[0]}. Here's what's happening across campus.` : `A little look at ${page.toLowerCase()} across our school community.`}</p></div><div className="intro-actions"><button className="button button-light" onClick={() => showToast('Your report is being prepared.')}><Download size={16} /> Export report</button>{(page === 'Students' && canManageStudents) && <button className="button button-dark" onClick={() => setModal('student')}><Plus size={16} /> Add student</button>}{(page === 'Staff' && canManageStaff) && <button className="button button-dark" onClick={() => setModal('staff')}><Plus size={16} /> Add staff</button>}</div></div>

          {page === 'Overview' && <Overview role={session.role} students={students} passes={passes} setPage={setPage} onScan={() => { setModal('scan'); setScanMessage('') }} showToast={showToast} />}
          {page === 'Students' && <StudentsPage students={filteredStudents} allCount={students.length} search={search} setSearch={setSearch} filterClass={filterClass} setFilterClass={setFilterClass} canManage={canManageStudents} onSelect={setSelectedStudent} onAdd={() => setModal('student')} />}
          {page === 'Staff' && <StaffPage staff={staff} onAdd={() => setModal('staff')} canManage={canManageStaff} onSelect={setSelectedStaff} />}
          {page === 'Attendance' && <AttendancePage canManage={canManageAcademics} filterClass={filterClass} setFilterClass={setFilterClass} onScan={() => { setModal('scan'); setScanMessage('') }} showToast={showToast} />}
          {page === 'Gate pass' && <GatePassPage role={session.role} events={events} passes={passes} canManage={canManagePasses} onScan={() => { setModal('scan'); setScanMessage('') }} onUpdate={updatePass} onAddPass={() => setModal('pass')} />}
          {page === 'Academics' && <AcademicsPage canManage={canManageAcademics} showToast={showToast} />}
          {page === 'Clubs & sports' && <ClubsPage canManage={canManageAcademics} showToast={showToast} />}
          {page === 'Settings' && <SettingsPage showToast={showToast} />}

          <footer className="page-footer"><span>Made with care for the Greenfield community <span className="footer-heart">♥</span></span><span>GREENFIELD ACADEMY <i>·</i> 2025</span></footer>
        </div>
      </main>
      {selectedStudent && <StudentModal student={selectedStudent} onClose={() => setSelectedStudent(null)} />}
      {selectedStaff && <StaffModal staffMember={selectedStaff} onClose={() => setSelectedStaff(null)} />}
      {modal === 'student' && <FormModal title="A new student" subtitle="Let's make a little room for someone new." onClose={() => setModal(null)} onSubmit={addStudent} submitLabel="Add student"><label>Student full name<input name="name" required placeholder="e.g. Maya Perera" /></label><label>Student ID<input name="id" required placeholder="e.g. STU-2025-0001" /></label><label>Class<select name="className">{classList.map((item) => <option key={item}>{item}</option>)}</select></label><div className="form-two"><label>Parent / guardian<input name="parent" required placeholder="Full name" /></label><label>Parent NIC<input name="nic" required placeholder="NIC number" /></label></div><label>Emergency contact<input name="emergency" required placeholder="+94 ..." /></label></FormModal>}
      {modal === 'staff' && <FormModal title="A new colleague" subtitle="Add a member to the Greenfield team." onClose={() => setModal(null)} onSubmit={addStaffMember} submitLabel="Add staff member"><label>Full name<input name="name" required placeholder="e.g. Maya Perera" /></label><label>Role / title<input name="title" required placeholder="e.g. Teacher · Mathematics" /></label><div className="form-two"><label>Department<select name="department"><option>Academic</option><option>Non-academic</option><option>Administration</option><option>Leadership</option></select></label><label>School email<input name="email" required type="email" placeholder="name@greenfield.edu" /></label></div><div className="form-two"><label>Phone<input name="phone" required placeholder="+94 ..." /></label><label>NIC<input name="nic" required placeholder="NIC number" /></label></div></FormModal>}
      {modal === 'scan' && <FormModal title="Campus check-in" subtitle="Scan a student ID or enter the ID number to record an arrival or departure." onClose={() => setModal(null)} onSubmit={(event) => { event.preventDefault(); recordScan() }} submitLabel="Record entry / exit"><div className="scan-visual"><span><QrCode size={36} /></span><b>Ready to scan</b><small>Student & staff ID cards</small></div><label>Student or staff ID<input value={scanValue} onChange={(event) => setScanValue(event.target.value)} required placeholder="e.g. STU-2024-0184" /></label>{scanMessage && <p className={scanMessage.startsWith('No') ? 'login-error' : 'scan-success'}>{scanMessage}</p>}</FormModal>}
      {modal === 'pass' && <FormModal title="Request short leave" subtitle="Let the office know why a student needs to leave early." onClose={() => setModal(null)} onSubmit={(event) => { event.preventDefault(); const data = new FormData(event.currentTarget); setPasses((items) => [{ name: String(data.get('name')), className: String(data.get('className')), reason: String(data.get('reason')), time: String(data.get('time')), status: 'Pending' }, ...items]); setModal(null); showToast('Short leave request sent to the office') }} submitLabel="Send request"><label>Student name<input name="name" required placeholder="Full name" /></label><div className="form-two"><label>Class<select name="className">{classList.map((item) => <option key={item}>{item}</option>)}</select></label><label>Departure time<input name="time" type="time" required /></label></div><label>Reason for short leave<textarea name="reason" required placeholder="Please share a little detail..." rows={3} /></label></FormModal>}
      {toast && <div className="toast"><span><Check size={15} /></span>{toast}</div>}
    </div>
  )
}

function Overview({ role, students, passes, setPage, onScan, showToast }: { role: Role; students: Student[]; passes: PassRequest[]; setPage: (page: Page) => void; onScan: () => void; showToast: (message: string) => void }) {
  const stats = role === 'Student' || role === 'Parent'
    ? [{ label: 'My attendance', value: '96%', detail: 'Looking good this term', icon: CalendarDays, color: 'green', trend: '↑ 2.4%' }, { label: 'Average score', value: '88.4', detail: 'Across 6 subjects', icon: BookOpen, color: 'blue', trend: '↑ 4.1%' }, { label: 'Clubs & sports', value: '2', detail: 'A little something for you', icon: Sparkles, color: 'purple', trend: '' }]
    : [{ label: 'Students enrolled', value: '2,000', detail: '+24 since last term', icon: GraduationCap, color: 'blue', trend: '↑ 3.2%' }, { label: 'Staff members', value: '100', detail: '90 academic · 10 support', icon: Users, color: 'purple', trend: 'All teams' }, { label: 'Here today', value: '94.8%', detail: 'A great day to be here', icon: CalendarDays, color: 'green', trend: '↑ 1.6%' }]
  const pending = passes.filter((pass) => pass.status === 'Pending').length
  return <div className="overview-grid">
    <section className="stats-row">{stats.map(({ label, value, detail, icon: Icon, color, trend }) => <article className="stat-card" key={label}><div className="stat-top"><span>{label}</span><span className={`stat-icon icon-${color}`}><Icon size={18} /></span></div><div className="stat-value">{value}</div><div className="stat-foot"><span>{detail}</span>{trend && <b className="trend">{trend}</b>}</div></article>)}</section>
    <section className="overview-main">
      <article className="card attendance-card"><div className="card-head"><div><span className="section-kicker">THE BIG PICTURE</span><h2>Attendance overview</h2><p>More students showing up, every week.</p></div><button className="select-button" onClick={() => showToast('Showing this term')} >This term <ChevronDown size={14} /></button></div><div className="chart-summary"><b>94.8%</b><span className="chart-positive"><ArrowUpRight size={14} /> 1.6% <small>vs. last term</small></span></div><div className="chart"><div className="chart-y-labels"><span>100%</span><span>80%</span><span>60%</span><span>40%</span></div><div className="chart-plot"><div className="chart-gridline line-one" /><div className="chart-gridline line-two" /><div className="chart-gridline line-three" /><div className="bar-set">{[63, 76, 69, 84, 78, 91, 73, 88, 82, 96, 87, 94].map((height, index) => <div className="bar-column" key={index}><span className="bar-value" style={{ height: `${height}%` }} /><span className="bar-label">{['W1', 'W2', 'W3', 'W4', 'W5', 'W6', 'W7', 'W8', 'W9', 'W10', 'W11', 'W12'][index]}</span></div>)}</div></div></div><div className="chart-legend"><span><i className="legend-student" /> This term</span><span><i className="legend-last" /> Last term</span><span className="chart-period">TERM 2 · 2025</span></div></article>
      <article className="card today-card"><div className="card-head"><div><span className="section-kicker">AROUND CAMPUS</span><h2>Today at a glance</h2></div><span className="today-live"><i /> LIVE</span></div><div className="today-metric"><span className="metric-dot present-dot" /><div><b>1,896 <small>students present</small></b><span>94.8% of the school</span></div><b className="metric-percent">94.8%</b></div><div className="today-metric"><span className="metric-dot absent-dot" /><div><b>72 <small>away today</small></b><span>31 excused · 41 unreported</span></div><b className="metric-percent">3.6%</b></div><div className="today-metric"><span className="metric-dot late-dot" /><div><b>32 <small>arrived late</small></b><span>Most before 8:20 AM</span></div><b className="metric-percent">1.6%</b></div><div className="metric-footer"><span>All grades <b>·</b> Updated just now</span><button onClick={() => setPage('Attendance')}>View attendance <ArrowRight size={14} /></button></div></article>
    </section>
    <section className="overview-bottom">
      <article className="card activity-card"><div className="card-head"><div><span className="section-kicker">HAPPENING NOW</span><h2>Recent activity</h2></div><button className="text-button" onClick={() => setPage('Gate pass')}>See everything <ArrowRight size={14} /></button></div><div className="activity-list">{[
        { name: 'Maya Fernando', detail: 'Checked in at the main gate', time: '8:08 AM', initials: 'MF', color: 'lavender', icon: ArrowDownLeft, tone: 'activity-in' },
        { name: 'Amaya Perera', detail: 'Marked present in Grade 10-A', time: '8:12 AM', initials: 'AP', color: 'peach', icon: Check, tone: 'activity-check' },
        { name: 'Short leave request', detail: `${pending} requests are waiting for review`, time: '10:45 AM', initials: 'SL', color: 'blue', icon: ArrowUpRight, tone: 'activity-out' },
      ].map(({ name, detail, time, initials, color, icon: Icon, tone }) => <div className="activity-row" key={name}><Avatar initials={initials} color={color} /><div className="activity-info"><b>{name}</b><span>{detail}</span></div><span className={`activity-action ${tone}`}><Icon size={14} /></span><time>{time}</time></div>)}</div></article>
      <article className="card shortcut-card"><div className="card-head"><div><span className="section-kicker">QUICK SHORTCUTS</span><h2>What would you like to do?</h2></div></div><div className="shortcut-grid"><button onClick={() => setPage('Students')}><span className="shortcut-icon short-blue"><GraduationCap size={19} /></span><b>Find a student</b><span>Search profiles</span><ArrowRight size={15} className="shortcut-arrow" /></button><button onClick={onScan}><span className="shortcut-icon short-green"><QrCode size={18} /></span><b>Scan ID</b><span>Class check-in</span><ArrowRight size={15} className="shortcut-arrow" /></button><button onClick={() => setPage('Gate pass')}><span className="shortcut-icon short-purple"><ArrowUpRight size={18} /></span><b>Short leave</b><span>Review requests</span><span className="shortcut-number">{pending}</span></button><button onClick={() => setPage('Academics')}><span className="shortcut-icon short-yellow"><BookOpen size={18} /></span><b>Enter marks</b><span>Assessment book</span><ArrowRight size={15} className="shortcut-arrow" /></button></div></article>
    </section>
    <section className="card student-snapshot"><div className="card-head"><div><span className="section-kicker">A FEW FAMILIAR FACES</span><h2>Student snapshot</h2></div><button className="text-button" onClick={() => setPage('Students')}>All students <ArrowRight size={14} /></button></div><div className="snapshot-list">{students.slice(0, 4).map((student) => <button className="snapshot-item" key={student.id} onClick={() => setPage('Students')}><Avatar initials={student.initials} color={student.color} /><span className="snapshot-name"><b>{student.name}</b><small>{student.className} <i>·</i> {student.id}</small></span><Badge tone={student.status === 'Present' ? 'green' : student.status === 'Late' ? 'amber' : 'red'}>{student.status}</Badge><ChevronRight size={15} className="snapshot-chevron" /></button>)}</div></section>
    <div className="side-note"><div className="note-spark">✳</div><div><b>A little note for today</b><p>“The beautiful thing about learning is that no one can take it away from you.”</p><span>B. B. KING</span></div></div>
  </div>
}

function StudentsPage({ students, allCount, search, setSearch, filterClass, setFilterClass, canManage, onSelect, onAdd }: { students: Student[]; allCount: number; search: string; setSearch: (value: string) => void; filterClass: string; setFilterClass: (value: string) => void; canManage: boolean; onSelect: (student: Student) => void; onAdd: () => void }) {
  return <section className="card full-card table-card"><div className="table-toolbar"><div><h2>Student directory</h2><p>{search ? `${students.length} matching ${students.length === 1 ? 'student' : 'students'}` : `${allCount.toLocaleString()} students across all grades`}</p></div><div className="table-tools"><label className="table-search"><Search size={15} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search name or ID..." /></label><select className="select-button" value={filterClass} onChange={(event) => setFilterClass(event.target.value)}><option>All classes</option>{classList.map((item) => <option key={item}>{item}</option>)}</select>{canManage && <button className="button button-dark button-small" onClick={onAdd}><Plus size={15} /> Add student</button>}</div></div>
    <div className="table-wrap"><table><thead><tr><th>STUDENT</th><th>STUDENT ID</th><th>CLASS</th><th>ATTENDANCE</th><th>TODAY</th><th /></tr></thead><tbody>{students.map((student) => <tr key={student.id} onClick={() => onSelect(student)}><td><div className="person-cell"><Avatar initials={student.initials} color={student.color} /><span><b>{student.name}</b><small>{student.email}</small></span></div></td><td><span className="id-text">{student.id}</span></td><td><span className="class-tag">{student.className}</span></td><td><div className="attendance-cell"><span className="attendance-track"><i style={{ width: `${student.attendance}%` }} /></span><b>{student.attendance}%</b></div></td><td><Badge tone={student.status === 'Present' ? 'green' : student.status === 'Late' ? 'amber' : 'red'}>{student.status}</Badge></td><td><button className="row-arrow" aria-label={`View ${student.name}`}><ChevronRight size={16} /></button></td></tr>)}</tbody></table>{students.length === 0 && <div className="empty-state"><Search size={22} /><b>No students found</b><span>Try a different name, ID, or class.</span></div>}</div><div className="table-pagination"><span>Showing <b>{students.length ? 1 : 0}–{students.length}</b> of <b>{search ? students.length : allCount.toLocaleString()}</b> students</span><div><button aria-label="Previous page"><ChevronLeft size={16} /></button><button className="page-current">1</button><button>2</button><button>3</button><span>…</span><button>100</button><button aria-label="Next page"><ChevronRight size={16} /></button></div></div></section>
}

function StaffPage({ staff, onAdd, canManage, onSelect }: { staff: Staff[]; onAdd: () => void; canManage: boolean; onSelect: (staffMember: Staff) => void }) {
  return <><div className="staff-summary"><div className="staff-summary-card"><span className="stat-icon icon-blue"><Users size={18} /></span><div><b>100</b><span>staff members</span></div></div><div className="staff-summary-card"><span className="stat-icon icon-purple"><BookOpen size={18} /></span><div><b>90</b><span>academic staff</span></div></div><div className="staff-summary-card"><span className="stat-icon icon-peach"><Sparkles size={18} /></span><div><b>10</b><span>non-academic staff</span></div></div><div className="staff-summary-card"><span className="stat-icon icon-green"><Fingerprint size={18} /></span><div><b>87</b><span>on campus today</span></div></div></div><section className="card full-card table-card"><div className="table-toolbar"><div><h2>Staff directory</h2><p>A good school starts with good people.</p></div><div className="table-tools"><label className="table-search"><Search size={15} /><input placeholder="Find a colleague..." /></label><button className="select-button"><SlidersHorizontal size={14} /> Department <ChevronDown size={14} /></button>{canManage && <button className="button button-dark button-small" onClick={onAdd}><Plus size={15} /> Add staff</button>}</div></div>  <div className="table-wrap"><table><thead><tr><th>TEAM MEMBER</th><th>DEPARTMENT</th><th>STAFF ID</th><th>ATTENDANCE</th><th>STATUS</th><th /></tr></thead><tbody>{staff.map((member, index) => <tr key={member.email} onClick={() => onSelect(member)}><td><div className="person-cell"><Avatar initials={member.initials} color={member.color} /><span><b>{member.name}</b><small>{member.title}</small></span></div></td><td>{member.department}</td><td><span className="id-text">{member.id}</span></td><td><div className="attendance-cell"><span className="attendance-track"><i style={{ width: `${96 - index * 2}%` }} /></span><b>{96 - index * 2}%</b></div></td><td><Badge tone={member.status === 'On campus' ? 'green' : 'gray'}>{member.status}</Badge></td><td><button className="row-arrow"><MoreHorizontal size={16} /></button></td></tr>)}</tbody></table></div><div className="staff-footnote"><Fingerprint size={16} /> Staff attendance is synced with the campus fingerprint system.</div></section></>
}

function AttendancePage({ canManage, filterClass, setFilterClass, onScan, showToast }: { canManage: boolean; filterClass: string; setFilterClass: (value: string) => void; onScan: () => void; showToast: (message: string) => void }) {
  return <><div className="attendance-stats"><div className="attendance-summary-card"><span>STUDENTS PRESENT</span><b>1,896</b><div><span className="summary-bar"><i style={{ width: '94.8%' }} /></span><small>94.8% of 2,000</small></div></div><div className="attendance-summary-card"><span>STUDENTS ABSENT</span><b>72</b><div><span className="summary-bar summary-red"><i style={{ width: '44%' }} /></span><small>31 excused · 41 unreported</small></div></div><div className="attendance-summary-card"><span>ARRIVED LATE</span><b>32</b><div><span className="summary-bar summary-amber"><i style={{ width: '27%' }} /></span><small>Most before 8:20 AM</small></div></div></div><div className="two-column"><section className="card class-attendance"><div className="card-head"><div><span className="section-kicker">CLASSROOM CHECK-IN</span><h2>Class attendance</h2><p>Today's attendance, by class.</p></div><div className="table-tools"><select className="select-button" value={filterClass} onChange={(event) => setFilterClass(event.target.value)}><option>All classes</option>{classList.map((item) => <option key={item}>{item}</option>)}</select>{canManage && <button className="button button-dark button-small" onClick={onScan}><QrCode size={15} /> Scan ID</button>}</div></div><div className="class-list">{(filterClass === 'All classes' ? ['10-A', '9-B', '11-A', '8-C', '12-A', '7-B'] : [filterClass]).map((className, index) => <div className="class-row" key={className}><div className={`class-emblem emblem-${index % 4}`}>{className.split('-')[0]}</div><div className="class-name"><b>Grade {className.split('-')[0]} · {className.split('-')[1]}</b><span>Ms. {['Maya Fernando', 'Ruwan Jayasinghe', 'Ayesha Silva', 'Kasun Perera'][index % 4]}</span></div><div className="class-count"><b>{[28, 31, 26, 29, 24, 30][index]}<small> / {[30, 32, 27, 30, 25, 30][index]}</small></b><span>students present</span></div><div className="class-progress"><span className="attendance-track"><i style={{ width: `${[93, 97, 96, 97, 96, 100][index]}%` }} /></span><b>{[93, 97, 96, 97, 96, 100][index]}%</b></div><ChevronRight size={16} className="class-chevron" /></div>)}</div></section><aside className="attendance-side"><section className="card scanner-card"><div className="scanner-tag"><QrCode size={17} /> CLASS ID SCANNER</div><h2>A quick scan,<br />and they're in.</h2><p>Scan a student's ID card at the classroom door to mark them present.</p><div className="scanner-demo"><div className="scanner-frame"><QrCode size={45} /></div><div><b>Ready when you are</b><span>Scanner connected</span></div><i /></div>{canManage && <button className="button button-dark wide-button" onClick={onScan}>Open ID scanner <ArrowRight size={15} /></button>}</section><section className="card fingerprint-card"><div className="fingerprint-heading"><span className="fingerprint-icon"><Fingerprint size={20} /></span><div><b>Staff fingerprint</b><span>Campus entry system</span></div><span className="connected-dot"><i /> LIVE</span></div><div className="fingerprint-data"><div><span>In today</span><b>87 <small>/ 100</small></b></div><div><span>Last sync</span><b>Just now</b></div></div><button className="text-button" onClick={() => showToast('Latest staff attendance is synced from the fingerprint system.')}>View staff attendance <ArrowRight size={14} /></button></section></aside></div></>
}

function GatePassPage({ role, events, passes, canManage, onScan, onUpdate, onAddPass }: { role: Role; events: GateEvent[]; passes: PassRequest[]; canManage: boolean; onScan: () => void; onUpdate: (index: number, status: PassRequest['status']) => void; onAddPass: () => void }) {
  return <><div className="gate-banner"><div className="gate-banner-icon"><ShieldCheck size={22} /></div><div><b>Campus is safe and sound.</b><span>Gate activity is being monitored. Last system sync just now.</span></div><span className="connected-dot"><i /> ALL SYSTEMS LIVE</span></div><div className="two-column gate-columns"><section className="card gate-table"><div className="card-head"><div><span className="section-kicker">CAMPUS MOVEMENT</span><h2>Recent check-ins</h2><p>Every arrival and departure, in one place.</p></div>{role === 'Security' && <button className="button button-dark button-small" onClick={onScan}><QrCode size={15} /> Scan ID</button>}</div><div className="gate-event-list">{events.map((event, index) => <div className="gate-event" key={`${event.id}-${index}`}><Avatar initials={event.name.split(' ').map((part) => part[0]).join('').slice(0, 2)} color={index % 2 ? 'mint' : 'lavender'} /><div className="gate-event-person"><b>{event.name}</b><span>{event.id} <i>·</i> {event.type}</span></div><span className={`gate-direction ${event.action === 'Entry' ? 'direction-in' : 'direction-out'}`}>{event.action === 'Entry' ? <ArrowDownLeft size={14} /> : <ArrowUpRight size={14} />}{event.action}</span><time>{event.time}</time></div>)}</div><button className="table-more">View all gate activity <ArrowRight size={14} /></button></section><section className="card short-leave-card"><div className="card-head"><div><span className="section-kicker">A LITTLE EARLY TODAY</span><h2>Short leave requests</h2><p>Approve a student leaving before the bell.</p></div><span className="pending-count">{passes.filter((pass) => pass.status === 'Pending').length}</span></div><div className="leave-list">{passes.map((pass, index) => <div className="leave-request" key={`${pass.name}-${index}`}><div className="leave-person"><Avatar initials={pass.name.split(' ').map((part) => part[0]).join('').slice(0, 2)} color={index % 2 ? 'peach' : 'blue'} /><div><b>{pass.name}</b><span>{pass.className} <i>·</i> {pass.time}</span></div></div><div className="leave-reason"><span>REASON</span><b>{pass.reason}</b></div>{pass.status === 'Pending' && canManage ? <div className="leave-actions"><button className="approve-button" onClick={() => onUpdate(index, 'Approved')}><Check size={14} /> Approve</button><button className="decline-button" onClick={() => onUpdate(index, 'Declined')}>Decline</button></div> : <Badge tone={pass.status === 'Approved' ? 'green' : pass.status === 'Pending' ? 'amber' : 'red'}>{pass.status}</Badge>}</div>)}</div>{(role === 'Parent' || role === 'Office Staff' || role === 'Principal') && <button className="button button-light wide-button leave-create" onClick={onAddPass}><Plus size={15} /> Request short leave</button>}</section></div></>
}

function AcademicsPage({ canManage, showToast }: { canManage: boolean; showToast: (message: string) => void }) {
  const subjects = [{ name: 'Mathematics', teacher: 'Maya Fernando', avg: '84.2', trend: '+3.1%', color: 'blue', initials: 'MF' }, { name: 'Science', teacher: 'Ruwan Jayasinghe', avg: '81.7', trend: '+1.8%', color: 'green', initials: 'RJ' }, { name: 'English Literature', teacher: 'Ayesha Silva', avg: '88.5', trend: '+4.2%', color: 'purple', initials: 'AS' }, { name: 'History', teacher: 'Nimal Perera', avg: '79.8', trend: '+0.6%', color: 'peach', initials: 'NP' }]
  return <><div className="academics-banner"><div className="academics-banner-art"><BookOpen size={27} /></div><div><span>TERM 2 · ASSESSMENT 02</span><h2>A season of growing minds.</h2><p>Marks, progress, and the little steps that add up.</p></div><button className="button button-dark" onClick={() => showToast('Assessment book opened')}><BookOpen size={15} /> Assessment book</button></div><div className="academic-kpis"><div className="card academic-kpi"><span>OVERALL AVERAGE</span><b>83.6<small>/ 100</small></b><span className="kpi-trend">↑ 2.8% from last term</span></div><div className="card academic-kpi"><span>ASSESSMENT COMPLETION</span><b>76<small>%</small></b><span className="kpi-trend">1,520 of 2,000 submitted</span></div><div className="card academic-kpi"><span>SUBJECTS TRACKED</span><b>12</b><span className="kpi-trend">Across grades 6–12</span></div></div><section className="card full-card"><div className="card-head"><div><span className="section-kicker">THE WHOLE PICTURE</span><h2>Subject performance</h2><p>A quick look at how everyone is doing this term.</p></div><button className="select-button">All grades <ChevronDown size={14} /></button></div><div className="subject-grid">{subjects.map((subject) => <article className="subject-card" key={subject.name}><div className={`subject-icon subject-${subject.color}`}><BookOpen size={18} /></div><span className="subject-trend">{subject.trend} <ArrowUpRight size={13} /></span><h3>{subject.name}</h3><div className="subject-teacher"><Avatar initials={subject.initials} color={subject.color} /> {subject.teacher}</div><div className="subject-score"><b>{subject.avg}</b><span>class average</span></div><span className="attendance-track subject-track"><i style={{ width: `${subject.avg}%` }} /></span><button onClick={() => showToast(canManage ? `Opening ${subject.name} marks` : `${subject.name} assessment details`)}>{canManage ? 'Manage marks' : 'View results'} <ArrowRight size={14} /></button></article>)}</div></section></>
}

function ClubsPage({ canManage, showToast }: { canManage: boolean; showToast: (message: string) => void }) {
  const clubs = [{ name: 'Science Club', type: 'ACADEMIC', description: 'Curious minds, experiments, and ideas that reach beyond the classroom.', members: 42, day: 'Tuesdays · 3:15 PM', color: 'club-blue', icon: '✳' }, { name: 'Cricket', type: 'SPORTS', description: 'A team, a pitch, and a love for the game. Everyone gets a turn at the crease.', members: 36, day: 'Mon & Thu · 3:30 PM', color: 'club-green', icon: '◉' }, { name: 'Debate Society', type: 'CULTURE', description: 'Big questions, brave voices, and listening as much as we speak.', members: 28, day: 'Wednesdays · 3:00 PM', color: 'club-purple', icon: '“' }, { name: 'Art Circle', type: 'CREATIVE', description: 'Make a little mess. Find your canvas. See the world in a new way.', members: 31, day: 'Fridays · 2:45 PM', color: 'club-peach', icon: '◒' }, { name: 'Swimming', type: 'SPORTS', description: 'Finding your rhythm in the water, one length at a time.', members: 24, day: 'Tues & Fri · 3:30 PM', color: 'club-teal', icon: '≈' }, { name: 'Robotics', type: 'ACADEMIC', description: 'Dream it, build it, and see what happens when you press the button.', members: 19, day: 'Thursdays · 3:15 PM', color: 'club-yellow', icon: '⌘' }]
  return <><div className="clubs-intro"><div><span className="section-kicker">MORE THAN A CLASSROOM</span><h2>There's a place for everyone.</h2><p>A dozen little communities to discover. Find the one that feels like yours.</p></div><div className="club-count"><b>12</b><span>clubs & teams</span></div></div><div className="club-grid">{clubs.map((club) => <article className="card club-card" key={club.name}><div className={`club-art ${club.color}`}><span>{club.icon}</span><span className="club-members">{club.members} members</span></div><div className="club-info"><span className="club-type">{club.type}</span><h3>{club.name}</h3><p>{club.description}</p><div className="club-day"><CalendarDays size={14} />{club.day}</div><button onClick={() => showToast(canManage ? `Managing ${club.name}` : `You're on the list to learn more about ${club.name}!`)}>{canManage ? 'Manage club' : 'Find out more'} <ArrowRight size={14} /></button></div></article>)}</div></>
}

function SettingsPage({ showToast }: { showToast: (message: string) => void }) {
  return <div className="settings-layout"><section className="card settings-card"><div className="card-head"><div><span className="section-kicker">YOUR ACCOUNT</span><h2>Who gets to see what.</h2><p>A role for every part of our school community.</p></div></div><div className="access-list">{roleOptions.map((role, index) => <div className="access-row" key={role}><span className={`access-role-icon access-${index}`}><Users size={17} /></span><div><b>{role}</b><span>{['All access · manage everything', 'Manage staff and student details', 'Manage student academic records', 'Manage class and academic records', 'Campus entry and exit only', 'Read student and academic details', 'Read own profile and records'][index]}</span></div><Badge tone={index < 2 ? 'blue' : 'gray'}>{index < 2 ? 'Admin' : index === 4 ? 'Operations' : index < 4 ? 'Limited' : 'Read only'}</Badge></div>)}</div></section><aside className="settings-side"><section className="card device-card"><div className="fingerprint-device-icon"><Fingerprint size={28} /></div><span className="section-kicker">CONNECTED SYSTEMS</span><h3>Staff fingerprint</h3><p>Staff entry and exit are recorded with the campus fingerprint system.</p><div className="device-status"><span><i /> Connected</span><span>Synced just now</span></div></section><section className="card device-card"><div className="fingerprint-device-icon device-qr"><QrCode size={27} /></div><span className="section-kicker">CONNECTED SYSTEMS</span><h3>Student ID scanners</h3><p>Classroom QR scanners make daily attendance a little easier.</p><div className="device-status"><span><i /> 13 scanners online</span><span>All classes</span></div></section><button className="button button-light wide-button" onClick={() => showToast('School portal preferences are up to date.')}>Portal preferences <ArrowRight size={15} /></button></aside></div>
}

function StudentModal({ student, onClose }: { student: Student; onClose: () => void }) {
  return <div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose() }}><section className="modal student-profile-modal"><button className="modal-close" onClick={onClose} aria-label="Close"><X size={18} /></button><div className="student-profile-top"><Avatar initials={student.initials} color={student.color} size="large" /><span><Badge tone={student.status === 'Present' ? 'green' : student.status === 'Late' ? 'amber' : 'red'}>{student.status} today</Badge><h2>{student.name}</h2><p>{student.grade} · Class {student.className}</p></span></div><div className="student-profile-id"><span>STUDENT ID</span><b>{student.id}</b><button onClick={() => navigator.clipboard?.writeText(student.id)}><Download size={14} /> Copy ID</button></div><div className="profile-detail-grid"><div><span>STUDENT EMAIL</span><b>{student.email}</b></div><div><span>TERM ATTENDANCE</span><b>{student.attendance}%</b></div><div><span>PARENT / GUARDIAN</span><b>{student.parent}</b></div><div><span>PARENT NIC</span><b>{student.parentNic}</b></div><div className="detail-emergency"><span>EMERGENCY CONTACT</span><b>{student.emergency}</b></div></div><div className="profile-clubs"><span>CLUBS & SPORTS</span><div>{student.clubs.length ? student.clubs.map((club) => <span className="class-tag" key={club}>{club}</span>) : <span className="muted-copy">No clubs added yet</span>}</div></div><button className="button button-dark wide-button" onClick={onClose}>Done</button></section></div>
}

function StaffModal({ staffMember, onClose }: { staffMember: Staff; onClose: () => void }) {
  return <div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose() }}><section className="modal student-profile-modal"><button className="modal-close" onClick={onClose} aria-label="Close"><X size={18} /></button><div className="student-profile-top"><Avatar initials={staffMember.initials} color={staffMember.color} size="large" /><span><Badge tone={staffMember.status === 'On campus' ? 'green' : 'gray'}>{staffMember.status}</Badge><h2>{staffMember.name}</h2><p>{staffMember.title}</p></span></div><div className="student-profile-id"><span>STAFF ID</span><b>{staffMember.id}</b><button onClick={() => navigator.clipboard?.writeText(staffMember.id)}><Download size={14} /> Copy ID</button></div><div className="profile-detail-grid"><div><span>EMAIL ADDRESS</span><b>{staffMember.email}</b></div><div><span>DEPARTMENT</span><b>{staffMember.department}</b></div><div><span>CONTACT NUMBER</span><b>{staffMember.phone}</b></div><div><span>NIC</span><b>{staffMember.nic}</b></div></div><button className="button button-dark wide-button" onClick={onClose}>Done</button></section></div>
}

function FormModal({ title, subtitle, children, onClose, onSubmit, submitLabel }: { title: string; subtitle: string; children: React.ReactNode; onClose: () => void; onSubmit: (event: React.FormEvent<HTMLFormElement>) => void; submitLabel: string }) {
  return <div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose() }}><section className="modal form-modal"><button className="modal-close" onClick={onClose} aria-label="Close"><X size={18} /></button><span className="modal-kicker">GREENFIELD ACADEMY</span><h2>{title}</h2><p className="modal-subtitle">{subtitle}</p><form className="modal-form" onSubmit={onSubmit}>{children}<div className="modal-actions"><button type="button" className="button button-light" onClick={onClose}>Cancel</button><button type="submit" className="button button-dark">{submitLabel} <ArrowRight size={15} /></button></div></form></section></div>
}

export default App
