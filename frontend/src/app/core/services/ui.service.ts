import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Notification, Ticket } from '../models/models';

@Injectable({ providedIn: 'root' })
export class UiService {
  /* ── Toast ── */
  toastMessage = '';
  toastVisible = false;
  private toastTimer: any;

  /* ── Dialog / Panel State ── */
  selectedTicket: Ticket | null = null;
  createIssueOpen = false;
  notifOpen = false;

  /* ── Notifications ── */
  private _notifications = new BehaviorSubject<Notification[]>([
    {id:1,icon:'assignment_ind',ic:'ni-yellow',title:'Ticket assigned to you',desc:'BUG-004: Fix login redirect loop — by Priya Sharma',time:'5 min ago',read:false},
    {id:2,icon:'bug_report',ic:'ni-red',title:'New CRITICAL defect reported',desc:'BUG-002: Kanban cards disappear on drag-and-drop',time:'22 min ago',read:false},
    {id:3,icon:'comment',ic:'ni-green',title:'New comment on #1',desc:'Rajesh Kumar commented on JWT Authentication ticket',time:'1 hour ago',read:false},
    {id:4,icon:'sprint',ic:'ni-blue',title:'Sprint 3 milestone reached',desc:'Sprint 3 is 65% complete — 5 of 8 stories done',time:'2 hours ago',read:false},
    {id:5,icon:'task_alt',ic:'ni-green',title:'Issue #1 moved to Done',desc:'JWT Authentication marked Done by Arjun Kumar',time:'Yesterday',read:true},
    {id:6,icon:'person_add',ic:'ni-blue',title:'Added to Sprint 3',desc:'You were added as assignee to PS-007: Defect Tracker APIs',time:'Yesterday',read:true},
  ]);

  notifications$ = this._notifications.asObservable();
  get notifications(): Notification[] { return this._notifications.getValue(); }
  get unreadCount(): number { return this.notifications.filter(n => !n.read).length; }

  /* ── Toast Methods ── */
  toast(msg: string): void {
    this.toastMessage = msg;
    this.toastVisible = true;
    clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => { this.toastVisible = false; }, 2800);
  }

  /* ── Notification Methods ── */
  readNotif(id: number): void {
    const notifs = this.notifications.map(n => n.id === id ? {...n, read:true} : n);
    this._notifications.next(notifs);
  }

  markAllRead(): void {
    this._notifications.next(this.notifications.map(n => ({...n, read:true})));
    this.toast('All notifications marked as read');
  }

  /* ── Ticket Detail Dialog ── */
  openTicket(ticket: Ticket): void {
    this.selectedTicket = ticket;
  }

  closeTicket(): void {
    this.selectedTicket = null;
  }

  /* ── Create Issue Dialog ── */
  openCreateIssue(): void {
    this.createIssueOpen = true;
  }

  closeCreateIssue(): void {
    this.createIssueOpen = false;
  }

  /* ── Notification Panel ── */
  toggleNotif(): void {
    this.notifOpen = !this.notifOpen;
  }

  closeNotif(): void {
    this.notifOpen = false;
  }
}
