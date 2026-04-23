import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Ticket, Defect, Engineer, Notification, Sprint, HistoryItem, KanbanColumn } from '../models/models';

@Injectable({ providedIn: 'root' })
export class DataService {
  private _tickets = new BehaviorSubject<Ticket[]>([
    {id:1,type:'STORY',sum:'Implement JWT Authentication',desc:'Set up Spring Security with JWT for all API endpoints. Includes token generation, validation, and refresh flow.',ass:'Arjun Kumar',rep:'Rajesh Kumar',pri:'HIGH',status:'DONE',pts:8,epic:'Authentication',labels:'backend,security',sprint:'Sprint 3',comments:[{user:'Rajesh Kumar',text:'Good progress. Make sure to handle token expiry edge cases.',time:'Jan 10'}]},
    {id:2,type:'STORY',sum:'Build Kanban Dashboard UI',desc:'Create drag-and-drop Kanban board using Angular CDK. Must support column reorder and real-time status updates.',ass:'Priya Sharma',rep:'Arjun Kumar',pri:'HIGH',status:'IN_PROGRESS',pts:13,epic:'Chat System',labels:'frontend,angular',sprint:'Sprint 3',comments:[]},
    {id:3,type:'TASK',sum:'Design MySQL Schema for all entities',desc:'Create all tables with FK constraints for tickets, sprints, epics, defects, comments and attachments.',ass:'Ravi Patel',rep:'Rajesh Kumar',pri:'MEDIUM',status:'DONE',pts:5,epic:'Defect Engine',labels:'database',sprint:'Sprint 3',comments:[]},
    {id:4,type:'BUG',sum:'Fix login redirect loop on session timeout',desc:'After session expiry, user gets stuck in an infinite redirect loop. No error message is displayed to the user.',ass:'Sneha Iyer',rep:'Priya Sharma',pri:'CRITICAL',status:'IN_PROGRESS',pts:3,epic:'Authentication',labels:'bug,auth',sprint:'Sprint 3',comments:[{user:'Arjun Kumar',text:'Reproduced locally. Root cause is in AuthGuard. Will fix in next commit.',time:'Feb 3'}]},
    {id:5,type:'STORY',sum:'Analytics Charts Integration with Chart.js',desc:'Wire Chart.js charts to live backend analytics APIs. Implement KPI cards with real-time data and auto-refresh.',ass:'Arjun Kumar',rep:'Rajesh Kumar',pri:'MEDIUM',status:'TESTED',pts:8,epic:'Analytics',labels:'frontend,charts',sprint:'Sprint 3',comments:[]},
    {id:6,type:'TASK',sum:'Setup CI/CD Pipeline with GitHub Actions',desc:'Configure GitHub Actions for auto-deploy to staging and production on merge to main branch.',ass:'Ravi Patel',rep:'Arjun Kumar',pri:'LOW',status:'TO_DO',pts:5,epic:'Defect Engine',labels:'devops',sprint:'Sprint 3',comments:[]},
    {id:7,type:'STORY',sum:'Defect Tracker CRUD REST APIs',desc:'REST endpoints for creating, updating, resolving defects with complete audit trail and notification support.',ass:'Sneha Iyer',rep:'Rajesh Kumar',pri:'HIGH',status:'TO_DO',pts:8,epic:'Defect Engine',labels:'backend',sprint:'Sprint 3',comments:[]},
    {id:8,type:'STORY',sum:'Sprint Velocity Reporting Module',desc:'Calculate and display velocity per sprint. Compare planned vs completed story points with trend analysis.',ass:'Priya Sharma',rep:'Arjun Kumar',pri:'MEDIUM',status:'BACKLOG',pts:5,epic:'Analytics',labels:'analytics',sprint:null,comments:[]},
    {id:9,type:'TASK',sum:'User Role Management Admin Panel',desc:'Admin panel for assigning and revoking roles to team members with audit logs.',ass:'Arjun Kumar',rep:'Rajesh Kumar',pri:'HIGH',status:'BACKLOG',pts:8,epic:'Authentication',labels:'admin',sprint:null,comments:[]},
    {id:10,type:'STORY',sum:'Real-time Lobby Chat System',desc:'Real-time team chat using WebSockets and STOMP protocol. Support mentions and notifications.',ass:'Ravi Patel',rep:'Priya Sharma',pri:'MEDIUM',status:'BACKLOG',pts:13,epic:'Chat System',labels:'websockets',sprint:null,comments:[]},
    {id:11,type:'STORY',sum:'File Attachment Support for Tickets',desc:'Allow file uploads for tickets and defects. Store on S3 with signed URL access and virus scanning.',ass:'Mohan Tej',rep:'Arjun Kumar',pri:'LOW',status:'BACKLOG',pts:8,epic:'Defect Engine',labels:'storage',sprint:null,comments:[]},
  ]);

  private _defects = new BehaviorSubject<Defect[]>([
    {id:1,bid:'BUG-001',title:'Login button unresponsive on Safari',env:'macOS 14, Safari 17, Staging',sev:'HIGH',rep:'ALWAYS',desc:'Clicking the Login button on Safari does nothing. No console errors visible. Issue started after the latest deployment on Jan 28.',exp:'User should be redirected to the dashboard after successful login.',act:'Nothing happens after clicking the Login button. No network request is made.',steps:'1. Open Safari browser\n2. Navigate to the login page\n3. Enter valid credentials\n4. Click the Login button\n5. Observe — no response, no network call',ass:'Arjun Kumar',status:'OPEN'},
    {id:2,bid:'BUG-002',title:'Kanban cards disappear on drag-and-drop',env:'Windows 11, Chrome 120, Production',sev:'CRITICAL',rep:'SOMETIMES',desc:'When dragging a ticket card between columns, the card occasionally vanishes completely from the board without any error.',exp:'The card should move to the target column and persist.',act:'Card disappears entirely. Board count shows incorrect number. Refresh restores it.',steps:'1. Open Dashboard\n2. Drag any card from To Do\n3. Drop into In Progress column\n4. Observe card disappears instead of moving',ass:'Priya Sharma',status:'IN_PROGRESS'},
    {id:3,bid:'BUG-003',title:'Analytics charts blank on first page load',env:'Ubuntu 22.04, Firefox 121',sev:'MEDIUM',rep:'ALWAYS',desc:'All chart canvases render blank when the Analytics page is opened. Switching to another tab and returning fixes the issue.',exp:'Charts display data immediately when the Analytics tab is opened.',act:'All canvases are blank. No data is rendered until a tab switch occurs.',steps:'1. Login with valid credentials\n2. Click the Analytics tab in navbar\n3. Observe all chart areas are blank',ass:'Ravi Patel',status:'OPEN'},
    {id:4,bid:'BUG-004',title:'Sprint dates not persisting after save',env:'All platforms and browsers',sev:'HIGH',rep:'ALWAYS',desc:'Sprint start and end dates revert to their original values after saving in sprint settings. Changes are not committed to database.',exp:'Updated dates are saved and reflected after page refresh.',act:'Dates revert to original values immediately after saving.',steps:'1. Navigate to Sprint Settings\n2. Edit start and end dates\n3. Click Save\n4. Refresh the page\n5. Observe dates have reverted',ass:'Sneha Iyer',status:'RESOLVED'},
    {id:5,bid:'BUG-005',title:'Story points reset to null on status change',env:'Chrome, Any OS',sev:'LOW',rep:'SOMETIMES',desc:'Story points field becomes null after changing ticket status through the dropdown. Only happens when assignee is also updated in same session.',exp:'Story points remain unchanged when updating ticket status.',act:'Story points field becomes null/empty.',steps:'1. Open any ticket detail\n2. Note the current story points value\n3. Change status from the dropdown\n4. Observe story points field becomes empty',ass:'Arjun Kumar',status:'OPEN'},
    {id:6,bid:'BUG-006',title:'Email notifications not triggered on assignment',env:'Production environment',sev:'MEDIUM',rep:'ALWAYS',desc:'Assigned team members do not receive email notifications when a ticket is assigned to them. Email service logs show no outgoing requests.',exp:'Email notification sent within 2 minutes of ticket assignment.',act:'No email is received. No entry in email service logs.',steps:'1. Create a new ticket\n2. Assign it to a team member\n3. Wait 5+ minutes\n4. Check the assigned user\'s inbox\n5. Check email service logs',ass:'Mohan Tej',status:'OPEN'},
  ]);

  tickets$ = this._tickets.asObservable();
  defects$ = this._defects.asObservable();

  get tickets(): Ticket[] { return this._tickets.getValue(); }
  get defects(): Defect[] { return this._defects.getValue(); }

  private _nextTid = 200;
  private _nextDid = 10;

  readonly engineers: Engineer[] = [
    {av:'AK',name:'Arjun Kumar',role:'DEVELOPER',email:'arjun.k@logicminds.dev',cls:'av-dev'},
    {av:'PI',name:'Priya Iyer',role:'TESTER',email:'priya.i@logicminds.dev',cls:'av-test'},
    {av:'RP',name:'Ravi Patel',role:'DEVELOPER',email:'ravi.p@logicminds.dev',cls:'av-dev'},
    {av:'SI',name:'Sneha Iyer',role:'DEVELOPER',email:'sneha.i@logicminds.dev',cls:'av-dev'},
    {av:'MT',name:'Mohan Tej',role:'TRAINEE',email:'mohan.t@logicminds.dev',cls:'av-train'},
  ];

  readonly sprints: Sprint[] = [
    {id:1,name:'Sprint 1',start:'Jan 01',end:'Jan 14',status:'DONE'},
    {id:2,name:'Sprint 2',start:'Jan 15',end:'Jan 28',status:'DONE'},
    {id:3,name:'Sprint 3',start:'Feb 01',end:'Feb 14',status:'ACTIVE'},
  ];

  readonly histData: HistoryItem[] = [
    {id:'PS-001',title:'JWT Auth Service',sprint:'Sprint 1',epic:'Authentication',ass:'Arjun Kumar',status:'DONE',start:'2025-01-01',end:'2025-01-08'},
    {id:'PS-002',title:'MySQL Schema Design',sprint:'Sprint 1',epic:'Defect Engine',ass:'Ravi Patel',status:'DONE',start:'2025-01-01',end:'2025-01-10'},
    {id:'PS-003',title:'User Login Page',sprint:'Sprint 1',epic:'Authentication',ass:'Priya Sharma',status:'DONE',start:'2025-01-05',end:'2025-01-12'},
    {id:'PS-004',title:'Spring Boot Project Setup',sprint:'Sprint 1',epic:'Defect Engine',ass:'Arjun Kumar',status:'DONE',start:'2025-01-01',end:'2025-01-06'},
    {id:'PS-005',title:'Sprint CRUD APIs',sprint:'Sprint 2',epic:'Defect Engine',ass:'Sneha Iyer',status:'DONE',start:'2025-01-15',end:'2025-01-22'},
    {id:'PS-006',title:'Kanban Column Logic',sprint:'Sprint 2',epic:'Chat System',ass:'Arjun Kumar',status:'DONE',start:'2025-01-16',end:'2025-01-25'},
    {id:'PS-007',title:'Epic Management Module',sprint:'Sprint 2',epic:'Analytics',ass:'Ravi Patel',status:'CANCELLED',start:'2025-01-18',end:'2025-01-28'},
    {id:'PS-008',title:'User Profile API',sprint:'Sprint 2',epic:'Authentication',ass:'Mohan Tej',status:'DONE',start:'2025-01-20',end:'2025-01-27'},
    {id:'PS-009',title:'Analytics KPI Endpoints',sprint:'Sprint 3',epic:'Analytics',ass:'Priya Sharma',status:'DONE',start:'2025-02-01',end:'2025-02-08'},
  ];

  readonly COLS: KanbanColumn[] = [
    {id:'TO_DO',label:'To Do',color:'#DFE1E6',text:'#42526E'},
    {id:'IN_PROGRESS',label:'In Progress',color:'#DEEBFF',text:'#0052CC'},
    {id:'TESTED',label:'Tested',color:'#EAE6FF',text:'#403294'},
    {id:'DONE',label:'Done',color:'#E3FCEF',text:'#006644'},
  ];

  readonly avColors: Record<string,string> = {
    'Arjun Kumar':'#0052CC','Priya Sharma':'#6554C0','Ravi Patel':'#008DA6',
    'Sneha Iyer':'#36B37E','Mohan Tej':'#FF991F'
  };

  avColor(name: string): string {
    return this.avColors[name] || '#0052CC';
  }

  ini(name: string): string {
    if (!name) return '?';
    return name.split(' ').map(w => w[0]).join('').toUpperCase();
  }

  lozClass(s: string): string {
    const m: Record<string,string> = {
      TO_DO:'loz-todo',IN_PROGRESS:'loz-inprog',TESTED:'loz-tested',
      DONE:'loz-done',BACKLOG:'loz-backlog',OPEN:'loz-open',
      IN_PROGRESS2:'loz-inprog2',RESOLVED:'loz-resolved',CANCELLED:'loz-cancelled'
    };
    return m[s] || 'loz-todo';
  }

  dfLoz(s: string): string {
    return s==='OPEN' ? 'loz-open' : s==='IN_PROGRESS' ? 'loz-inprog2' : 'loz-resolved';
  }

  sl(s: string): string { return s.replace(/_/g,' '); }

  itClass(t: string): string {
    return {STORY:'it-story',TASK:'it-task',BUG:'it-bug',SUBTASK:'it-subtask'}[t] || 'it-task';
  }

  itIcon(t: string): string {
    return {STORY:'bookmark',TASK:'check_box_outline_blank',BUG:'close',SUBTASK:'subdirectory_arrow_right'}[t] || 'task';
  }

  priIcon(p: string): string {
    const m: Record<string,string> = {CRITICAL:'keyboard_double_arrow_up',HIGH:'keyboard_arrow_up',MEDIUM:'drag_handle',LOW:'keyboard_arrow_down'};
    return m[p] || 'drag_handle';
  }

  priClass(p: string): string { return 'pri-' + p.toLowerCase(); }

  addTicket(t: Omit<Ticket,'id'|'comments'>): void {
    const tickets = [...this.tickets, {...t, id: ++this._nextTid, comments: []}];
    this._tickets.next(tickets);
  }

  updateTicket(id: number, changes: Partial<Ticket>): void {
    const tickets = this.tickets.map(t => t.id === id ? {...t, ...changes} : t);
    this._tickets.next(tickets);
  }

  deleteTicket(id: number): void {
    this._tickets.next(this.tickets.filter(t => t.id !== id));
  }

  addComment(ticketId: number, text: string): void {
    const tickets = this.tickets.map(t => {
      if (t.id !== ticketId) return t;
      const time = new Date().toLocaleDateString('en-US',{month:'short',day:'numeric'});
      return {...t, comments: [...t.comments, {user:'Arjun Kumar', text, time}]};
    });
    this._tickets.next(tickets);
  }

  addDefect(d: Omit<Defect,'id'|'bid'|'ass'|'status'>): void {
    const bid = 'BUG-' + String(++this._nextDid).padStart(3,'0');
    const defects = [...this.defects, {...d, id: this.defects.length+1, bid, ass:'Unassigned', status:'OPEN' as const}];
    this._defects.next(defects);
  }

  deleteDefect(id: number): void {
    this._defects.next(this.defects.filter(d => d.id !== id));
  }
}
