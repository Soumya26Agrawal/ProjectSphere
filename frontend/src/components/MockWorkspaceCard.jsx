import React from 'react';
import { CheckCircle2, LayoutDashboard } from 'lucide-react';

export default function MockWorkspaceCard() {
  return (
    <div className="mock-card">
      <div className="mock-header">
        <div className="mock-header-left">
          <div className="mock-icon">
            <LayoutDashboard />
          </div>
          <div className="mock-title-lines">
            <div className="line-1" />
            <div className="line-2" />
          </div>
        </div>
        <div className="mock-avatars">
          <div className="avatar avatar-1" />
          <div className="avatar avatar-2" />
          <div className="avatar avatar-3" />
        </div>
      </div>

      <div className="mock-tasks">
        <div className="task-row">
          <div className="status-done">
            <CheckCircle2 />
          </div>
          <div className="task-lines">
            <div className="line-1 w-1" />
            <div className="line-2 w-2" />
          </div>
          <div className="badge badge-done">Done</div>
        </div>

        <div className="task-row active">
          <div className="status-progress" />
          <div className="task-lines">
            <div className="line-1 w-3" />
            <div className="line-2 w-4" />
          </div>
          <div className="badge badge-progress">In Progress</div>
        </div>

        <div className="task-row transparent">
          <div className="status-todo" />
          <div className="task-lines">
            <div className="line-1 w-5" />
            <div className="line-2 w-6" />
          </div>
          <div className="badge badge-todo">Todo</div>
        </div>
      </div>

      <div className="dots-pattern">
        {[...Array(36)].map((_, i) => (
          <div key={i} className="dot" />
        ))}
      </div>
    </div>
  );
}
