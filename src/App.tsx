import React, { useState } from 'react'
import SplashScreen from './pages/SplashScreen'
import LoginScreen from './pages/LoginScreen'
import HomeScreen from './pages/HomeScreen'
import BookingScreen from './pages/BookingScreen'
import DriverSearchScreen from './pages/DriverSearchScreen'
import DriverModeScreen from './pages/DriverModeScreen'
import ProfileScreen from './pages/ProfileScreen'
import HistoryScreen from './pages/HistoryScreen'
import EarningsScreen from './pages/EarningsScreen'

export type Screen =
  | 'splash'
  | 'login'
  | 'home'
  | 'booking'
  | 'driver-search'
  | 'driver-mode'
  | 'profile'
  | 'history'
  | 'earnings'

export type UserRole = 'passenger' | 'driver' | null

export interface UserInfo {
  name: string
  phone: string
  role: UserRole
  photo: string | null
}

const App: React.FC = () => {
  const [screen, setScreen] = useState<Screen>('splash')
  const [user, setUser] = useState<UserInfo>({
    name: '',
    phone: '',
    role: null,
    photo: null,
  })
  const [darkMode, setDarkMode] = useState(false)

  const navigate = (s: Screen) => setScreen(s)

  return (
    <div
      data-theme={darkMode ? 'dark' : 'light'}
      style={{
        maxWidth: 430,
        margin: '0 auto',
        height: '100vh',
        position: 'relative',
        overflow: 'hidden',
        background: 'var(--color-bg)',
      }}
    >
      {screen === 'splash'        && <SplashScreen navigate={navigate} />}
      {screen === 'login'         && <LoginScreen navigate={navigate} setUser={setUser} />}
      {screen === 'home'          && <HomeScreen navigate={navigate} role={user.role} user={user} />}
      {screen === 'booking'       && <BookingScreen navigate={navigate} />}
      {screen === 'driver-search' && <DriverSearchScreen navigate={navigate} />}
      {screen === 'driver-mode'   && <DriverModeScreen navigate={navigate} />}
      {screen === 'profile'       && <ProfileScreen navigate={navigate} user={user} setUser={setUser} darkMode={darkMode} setDarkMode={setDarkMode} />}
      {screen === 'history'       && <HistoryScreen navigate={navigate} user={user} />}
      {screen === 'earnings'      && <EarningsScreen navigate={navigate} user={user} />}
    </div>
  )
}

export default App