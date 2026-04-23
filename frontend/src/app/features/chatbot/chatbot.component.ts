import { Component, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DataService } from '../../core/services/data.service';

interface ChatMessage {
  role: 'user' | 'bot';
  html: string;
  time: string;
}

@Component({
  selector: 'app-chatbot',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chatbot.component.html',
  styleUrl: './chatbot.component.css',
})
export class ChatbotComponent {
  @ViewChild('msgContainer') msgContainer!: ElementRef;

  open = false;
  messages: ChatMessage[] = [];
  inputText = '';
  typing = false;

  constructor(private ds: DataService) {}

  toggle(): void { this.open = !this.open; }

  ask(q: string): void { this.inputText = q; this.send(); }

  send(): void {
    const msg = this.inputText.trim();
    if (!msg) return;
    this.inputText = '';
    this.addMsg('user', msg);
    this.typing = true;
    this.scroll();
    setTimeout(() => {
      this.typing = false;
      this.addMsg('bot', this.reply(msg));
      this.scroll();
    }, 600);
  }

  addMsg(role: 'user' | 'bot', html: string): void {
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    this.messages.push({ role, html, time });
  }

  scroll(): void {
    setTimeout(() => {
      if (this.msgContainer) {
        const el = this.msgContainer.nativeElement;
        el.scrollTop = el.scrollHeight;
      }
    }, 50);
  }

  reply(msg: string): string {
    const m     = msg.toLowerCase();
    const t     = this.ds.tickets;
    const d     = this.ds.defects;
    const done  = t.filter(x => x.status === 'DONE').length;
    const total = t.filter(x => x.status !== 'BACKLOG').length;
    const inprog = t.filter(x => x.status === 'IN_PROGRESS').length;
    const openD  = d.filter(x => x.status !== 'RESOLVED').length;
    const resD   = d.filter(x => x.status === 'RESOLVED').length;
    const bl     = t.filter(x => x.status === 'BACKLOG').length;

    if (m.includes('sprint') && (m.includes('progress') || m.includes('status') || m.includes('?')))
      return `<strong>Sprint 3</strong> is <strong>${Math.round(done / total * 100)}% complete</strong><br/>✅ ${done}/${total} done · 🔄 ${inprog} in progress`;
    if (m.includes('defect') || m.includes('bug'))
      return `<strong>${d.length} defects</strong> logged:<br/>🔵 ${openD} open · ✅ ${resD} resolved<br/>⚠️ ${d.filter(x => x.sev === 'CRITICAL').length} critical severity`;
    if (m.includes('critical'))
      return `<strong>${d.filter(x => x.sev === 'CRITICAL').length} critical bug:</strong><br/>"${d.find(x => x.sev === 'CRITICAL')?.title}"`;
    if (m.includes('veloc'))
      return `Sprint velocity:<br/>📊 S1: <strong>24 pts</strong> · S2: <strong>31 pts</strong> · S3: <strong>~28 pts</strong><br/>Average: <strong>27.7 pts/sprint</strong>`;
    if (m.includes('backlog'))
      return `<strong>${bl} issues</strong> in the backlog.<br/>Top priority: <em>${t.find(x => x.status === 'BACKLOG' && x.pri === 'HIGH')?.sum || 'None'}</em>`;
    if (m.includes('team') || m.includes('member'))
      return `Team: <strong>7 people</strong><br/>PM + SM + 5 engineers<br/>${inprog} tickets in progress now`;
    if (m.includes('assign') || m.includes('who'))
      return t.filter(x => x.status === 'IN_PROGRESS').map(x => `${x.ass}: <strong>${x.sum.substring(0, 30)}…</strong>`).join('<br/>');
    if (m.includes('hello') || m.includes('hi'))
      return `Hello! 👋 I can help with sprint progress, defects, velocity, backlog, or team workload. What would you like to know?`;
    return `I can answer questions about:<br/>🔹 Sprint progress &amp; status<br/>🔹 Defect counts &amp; severity<br/>🔹 Team workload &amp; assignments<br/>🔹 Sprint velocity &amp; trends`;
  }
}
