import React, { useState } from 'react'
import { Screen, UserInfo } from '../App'
import styles from './HistoryScreen.module.css'

interface Props {
  navigate: (s: Screen) => void
  user: UserInfo
}

const allTrips = [
  // Ngayon
  {
    id: 1,
    passenger: 'Ana Reyes',
    time: '3:45 PM',
    km: '1.2 km',
    from: 'Kasalukuyang Lokasyon',
    to: 'Sentral na Palengke',
    fare: 25,
    status: 'Tapos na',
    date: 'Ngayon',
  },
  {
    id: 2,
    passenger: 'Ben Gomez',
    time: '2:10 PM',
    km: '2.4 km',
    from: 'Brgy. San Jose',
    to: 'Municipal Hall',
    fare: 35,
    status: 'Tapos na',
    date: 'Ngayon',
  },
  {
    id: 3,
    passenger: 'Cita Villanueva',
    time: '1:30 PM',
    km: '—',
    from: '—',
    to: '—',
    fare: 0,
    status: 'Nakanselang',
    date: 'Ngayon',
  },
  {
    id: 4,
    passenger: 'Danny Ramos',
    time: '11:05 AM',
    km: '3.1 km',
    from: 'Brgy. Maliwanag',
    to: 'Ospital ng Bayan',
    fare: 45,
    status: 'Tapos na',
    date: 'Ngayon',
  },
  {
    id: 5,
    passenger: 'Evelyn Torres',
    time: '9:20 AM',
    km: '1.8 km',
    from: 'Palengke',
    to: 'Paaralan ng Bayan',
    fare: 30,
    status: 'Tapos na',
    date: 'Ngayon',
  },
  // Kahapon
  {
    id: 6,
    passenger: 'Felix Santos',
    time: '6:45 PM',
    km: '2.0 km',
    from: 'Brgy. Sto. Niño',
    to: 'Palengke',
    fare: 30,
    status: 'Tapos na',
    date: 'Kahapon',
  },
  {
    id: 7,
    passenger: 'Gloria Dela Cruz',
    time: '4:00 PM',
    km: '—',
    from: '—',
    to: '—',
    fare: 0,
    status: 'Nakanselang',
    date: 'Kahapon',
  },
  {
    id: 8,
    passenger: 'Henry Bautista',
    time: '2:30 PM',
    km: '4.5 km',
    from: 'Brgy. Maliwanag',
    to: 'Mall ng Bayan',
    fare: 55,
    status: 'Tapos na',
    date: 'Kahapon',
  },
  {
    id: 9,
    passenger: 'Imelda Lim',
    time: '10:15 AM',
    km: '1.5 km',
    from: 'Paaralan',
    to: 'Brgy. Maliwanag',
    fare: 25,
    status: 'Tapos na',
    date: 'Kahapon',
  },
  {
    id: 10,
    passenger: 'Jose Fernandez',
    time: '8:00 AM',
    km: '2.8 km',
    from: 'Ospital',
    to: 'Brgy. San Jose',
    fare: 40,
    status: 'Tapos na',
    date: 'Kahapon',
  },
  // Linggong ito
  {
    id: 11,
    passenger: 'Karen Mendoza',
    time: '7:30 PM',
    km: '3.3 km',
    from: 'Mall ng Bayan',
    to: 'Brgy. Sto. Niño',
    fare: 45,
    status: 'Tapos na',
    date: 'Linggong ito',
  },
  {
    id: 12,
    passenger: 'Lorenzo Aquino',
    time: '5:10 PM',
    km: '1.0 km',
    from: 'Palengke',
    to: 'Municipal Hall',
    fare: 20,
    status: 'Tapos na',
    date: 'Linggong ito',
  },
  {
    id: 13,
    passenger: 'Maria Clara',
    time: '3:45 PM',
    km: '—',
    from: '—',
    to: '—',
    fare: 0,
    status: 'Nakanselang',
    date: 'Linggong ito',
  },
  {
    id: 14,
    passenger: 'Nestor Pascual',
    time: '1:20 PM',
    km: '5.2 km',
    from: 'Brgy. San Jose',
    to: 'Lungsod ng Antipolo',
    fare: 70,
    status: 'Tapos na',
    date: 'Linggong ito',
  },
  {
    id: 15,
    passenger: 'Ofelia Cruz',
    time: '9:00 AM',
    km: '1.8 km',
    from: 'Brgy. Maliwanag',
    to: 'Paaralan',
    fare: 30,
    status: 'Tapos na',
    date: 'Linggong ito',
  },
  {
    id: 16,
    passenger: 'Pedro Reyes',
    time: '8:15 AM',
    km: '2.1 km',
    from: 'Bahay',
    to: 'Palengke',
    fare: 30,
    status: 'Tapos na',
    date: 'Linggong ito',
  },
]

const tabs = ['Lahat', 'Ngayon', 'Kahapon', 'Linggong ito']

const todayEarnings = allTrips
  .filter(t => t.date === 'Ngayon' && t.status === 'Tapos na')
  .reduce((s, t) => s + t.fare, 0)

const todayTrips = allTrips.filter(t => t.date === 'Ngayon' && t.status === 'Tapos na').length

const HistoryScreen: React.FC<Props> = ({ navigate, user }) => {
  const [activeTab, setActiveTab] = useState('Lahat')

  const filtered = activeTab === 'Lahat'
    ? allTrips
    : allTrips.filter(t => t.date === activeTab)

  const grouped: { [key: string]: typeof allTrips } = {}
  filtered.forEach(t => {
    if (!grouped[t.date]) grouped[t.date] = []
    grouped[t.date].push(t)
  })

  const dateOrder = ['Ngayon', 'Kahapon', 'Linggong ito']

  const dateLabel: Record<string, string> = {
    'Ngayon': 'NGAYON — HUNYO 7',
    'Kahapon': 'KAHAPON — HUNYO 6',
    'Linggong ito': 'LINGGONG ITO — HUNYO 1–6',
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerTop}>
          <span className={styles.headerSub}>
            {user.role === 'driver' ? 'Driver Mode' : 'Pasahero Mode'}
          </span>
          <h2 className={styles.headerTitle}>Kasaysayan ng Biyahe</h2>
        </div>
      </div>

      <div className={styles.tabRow}>
        {tabs.map(tab => (
          <button
            key={tab}
            className={`${styles.tab} ${activeTab === tab ? styles.tabActive : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className={styles.summaryRow}>
        <div className={styles.summaryItem}>
          <span className={styles.summaryLabel}>Kabuuang kita ngayong araw</span>
          <span className={styles.summaryAmount}>₱{todayEarnings}</span>
        </div>
        <div className={styles.summaryItem} style={{ alignItems: 'flex-end' }}>
          <span className={styles.summaryLabel}>Bilang ng biyahe</span>
          <span className={styles.summaryCount}>{todayTrips}</span>
        </div>
      </div>

      <div className={styles.list}>
        {dateOrder.map(date => {
          const trips = grouped[date]
          if (!trips) return null
          return (
            <div key={date}>
              <p className={styles.dateLabel}>
                {dateLabel[date] ?? date.toUpperCase()}
              </p>
              {trips.map(trip => (
                <div key={trip.id} className={styles.tripCard}>
                  <div className={styles.tripTop}>
                    <div className={styles.avatar}>
                      {trip.passenger.charAt(0)}
                    </div>
                    <div className={styles.tripMid}>
                      <span className={styles.passengerName}>{trip.passenger}</span>
                      <span className={styles.tripMeta}>{trip.time} · {trip.km}</span>
                    </div>
                    <div className={styles.tripRight}>
                      <span className={styles.tripFare}>
                        {trip.fare > 0 ? `₱${trip.fare}` : '₱0'}
                      </span>
                      <span className={`${styles.statusBadge} ${
                        trip.status === 'Tapos na' ? styles.statusDone :
                        styles.statusCancel
                      }`}>
                        {trip.status}
                      </span>
                    </div>
                  </div>

                  {trip.from !== '—' && (
                    <div className={styles.tripRoute}>
                      <div className={styles.routeRow}>
                        <span className={styles.dotGreen} />
                        <span className={styles.routeText}>{trip.from}</span>
                      </div>
                      <div className={styles.routeRow}>
                        <span className={styles.dotRed} />
                        <span className={styles.routeText}>{trip.to}</span>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )
        })}
      </div>

      <div className={styles.bottomNav}>
        <button className={styles.navItem} onClick={() => navigate('home')}>
          <span>🏠</span><span>Home</span>
        </button>
        <button className={`${styles.navItem} ${styles.navActive}`}>
          <span>🕐</span><span>Kasaysayan</span>
        </button>
        <button className={styles.navItem} onClick={() => navigate('earnings')}>
          <span>💰</span><span>Kita</span>
        </button>
        <button className={styles.navItem} onClick={() => navigate('profile')}>
          <span>👤</span><span>Profile</span>
        </button>
      </div>
    </div>
  )
}

export default HistoryScreen