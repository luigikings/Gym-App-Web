import { Route, Routes } from 'react-router-dom'
import { isSupabaseConfigured } from './lib/supabaseClient'
import SetupNotice from './components/SetupNotice'
import UserSelectPage from './pages/UserSelectPage'
import DashboardLayout from './pages/DashboardLayout'
import ExercisesPage from './pages/ExercisesPage'
import RoutinesPage from './pages/RoutinesPage'
import HistoryPage from './pages/HistoryPage'
import RecordsPage from './pages/RecordsPage'
import WorkoutPage from './pages/WorkoutPage'

function App() {
  if (!isSupabaseConfigured) return <SetupNotice />

  return (
    <Routes>
      <Route path="/" element={<UserSelectPage />} />
      <Route path="/app" element={<DashboardLayout />}>
        <Route path="ejercicios" element={<ExercisesPage />} />
        <Route path="rutinas" element={<RoutinesPage />} />
        <Route path="rutinas/historial" element={<HistoryPage />} />
        <Route path="records" element={<RecordsPage />} />
      </Route>
      <Route path="/app/entrenar/:routineId" element={<WorkoutPage />} />
    </Routes>
  )
}

export default App
