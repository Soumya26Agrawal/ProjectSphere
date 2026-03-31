import React, { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { Toaster } from 'react-hot-toast'
import { fetchMe } from './store'
import AppLayout from './components/layout/AppLayout'
import LoginPage from './pages/LoginPage'
import ProjectsPage from './pages/ProjectsPage'
import SummaryPage from './pages/SummaryPage'
import BoardPage from './pages/BoardPage'
import BacklogPage from './pages/BacklogPage'
import TimelinePage from './pages/TimelinePage'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { Toaster } from 'react-hot-toast'
import { fetchMe } from './store'
import AppLayout from './components/layout/AppLayout'
import LoginPage from './pages/LoginPage'
import ProjectsPage from './pages/ProjectsPage'
import SummaryPage from './pages/SummaryPage'
import BoardPage from './pages/BoardPage'
import BacklogPage from './pages/BacklogPage'
import TimelinePage from './pages/TimelinePage'
import DefectsPage from './pages/DefectsPage'
 
function PrivateRoute({ children }) {
  const token = useSelector(s => s.auth.token)
  return token ? children : <Navigate to="/login" replace />
}
 
export default function App() {
  const dispatch = useDispatch()
  const token = useSelector(s => s.auth.token)
 
  useEffect(() => { if (token) dispatch(fetchMe()) }, [token])
 
  return (
    <BrowserRouter>
      <Toaster position="top-right" toastOptions={{
        style: { background:'#22272b', color:'#c9d1d9', border:'1px solid #3b4147', fontSize:'13px', fontFamily:'Inter,sans-serif' },
        success: { iconTheme: { primary:'#22c55e', secondary:'#fff' } },
        error:   { iconTheme: { primary:'#ef4444', secondary:'#fff' } },
      }}/>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<PrivateRoute><AppLayout /></PrivateRoute>}>
          <Route index element={<Navigate to="/projects" replace />} />
          <Route path="projects" element={<ProjectsPage />} />
          <Route path="projects/:projectId" element={<Navigate to="summary" replace />} />
          <Route path="projects/:projectId/summary"  element={<SummaryPage />} />
          <Route path="projects/:projectId/board"    element={<BoardPage />} />
          <Route path="projects/:projectId/backlog"  element={<BacklogPage />} />
          <Route path="projects/:projectId/timeline" element={<TimelinePage />} />
          <Route path="projects/:projectId/defects"  element={<DefectsPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
m './pages/TimelinePage'
import DefectsPage from './pages/DefectsPage'
 
function PrivateRoute({ children }) {
  const token = useSelector(s => s.auth.token)
  return token ? children : <Navigate to="/login" replace />
}
 
export default function App() {
  const dispatch = useDispatch()
  const token = useSelector(s => s.auth.token)
 
  useEffect(() => { if (token) dispatch(fetchMe()) }, [token])
 
  return (
    <BrowserRouter>
      <Toaster position="top-right" toastOptions={{
        style: { background:'#22272b', color:'#c9d1d9', border:'1px solid #3b4147', fontSize:'13px', fontFamily:'Inter,sans-serif' },
        success: { iconTheme: { primary:'#22c55e', secondary:'#fff' } },
        error:   { iconTheme: { primary:'#ef4444', secondary:'#fff' } },
      }}/>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<PrivateRoute><AppLayout /></PrivateRoute>}>
          <Route index element={<Navigate to="/projects" replace />} />
          <Route path="projects" element={<ProjectsPage />} />
          <Route path="projects/:projectId" element={<Navigate to="summary" replace />} />
          <Route path="projects/:projectId/summary"  element={<SummaryPage />} />
          <Route path="projects/:projectId/board"    element={<BoardPage />} />
          <Route path="projects/:projectId/backlog"  element={<BacklogPage />} />
          <Route path="projects/:projectId/timeline" element={<TimelinePage />} />
          <Route path="projects/:projectId/defects"  element={<DefectsPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}