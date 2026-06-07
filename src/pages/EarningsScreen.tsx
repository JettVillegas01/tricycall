import React, { useState } from 'react'
import { Screen, UserInfo } from '../App'
import styles from './EarningsScreen.module.css'

interface Props {
  navigate: (s: Screen) => void
  user: UserInfo
}

const weeklyData = [
  { day: 'Lun', amount: 320, trips: 8 },
  { day: 'Mar', amount: 480, trips: 12 },
  { day: 'Miy', amount: 250, trips: 6 },
  { day: 'Huw', amount: 560, trips: 14 },
  { day: 'Biy', amount: 620, trips: 15 },
  { day: 'Sab', amount: 740, trips: 18 },
  { day: 'Lin', amount: 390, trips: 10 },
]

const recentEarnings = [
  { id: 1, passenger: 'Juan D.', from: 'Brgy. Maliwanag', to: 'Palengke', time: '8:32 AM', fare: '₱35', date: 'Ngayon' },
  { id: 2, passenger: 'Maria S.', from: 'Brgy. Maliwanag', to: 'Paaralan', time: '7:15 AM', fare: '₱25', date: 'Ngayon' },
  { id: 3, passenger: 'Pedro R.', from: 'Ospital', to: 'Palengke', time: '3:00 PM', fare: '₱40', date: 'Kahapon' },
  { id: 4, passenger: 'Ana L.', from: 'Palengke', to: 'Bahay', time: '11:30 AM', fare: '₱30', date: 'Kahapon' },
  { id: 5, passenger: 'Rico M.', from: 'Hardware', to: 'Brgy. Sto. Niño', time: '9:00 AM', fare: '₱45', date: 'Kahapon' },
]

const maxAmount = Math.max(...weeklyData.map(d => d.amount))
const totalWeek = weeklyData.reduce((s, d) => s + d.amount, 0)
const totalTrips = weeklyData.reduce((s, d) => s + d.trips, 0)
const todayEarnings = weeklyData[weeklyData.length - 1].amount

const EarningsScreen: React.FC<Props> = ({ navigate, user }) => {
  const [activeDay, setActiveDay] = useState(6) // default: Linggo (last)

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <button className={styles.backBtn} onClick={() => navigate('home')}>←</button>
        <h2 className={styles.title}>Aking Kita</h2>
      </div>

      <div className={styles.scroll}>
        {/* Today summary */}
        <div className={styles.heroCard}>
          <p className={styles.heroLabel}>Kita Ngayon</p>
          <p className={styles.heroAmount}>₱{todayEarnings.toLocaleString()}</p>
          <div className={styles.heroRow}>
            <div className={styles.heroStat}>
              <span className={styles.heroStatNum}>{weeklyData[6].trips}</span>
              <span className={styles.heroStatLabel}>Biyahe</span>
            </div>
            <div className={styles.heroDivider} />
            <div className={styles.heroStat}>
              <span className={styles.heroStatNum}>₱{Math.round(todayEarnings / weeklyData[6].trips)}</span>
              <span className={styles.heroStatLabel}>Avg / Biyahe</span>
            </div>
            <div className={styles.heroDivider} />
            <div className={styles.heroStat}>
              <span className={styles.heroStatNum}>⭐ 4.8</span>
              <span className={styles.heroStatLabel}>Rating</span>
            </div>
          </div>
        </div>

        {/* Weekly chart */}
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <p className={styles.sectionTitle}>Lingguhang Kita</p>
            <p className={styles.sectionTotal}>₱{totalWeek.toLocaleString()} / {totalTrips} biyahe</p>
          </div>

          <div className={styles.chartCard}>
            <div className={styles.chart}>
              {weeklyData.map((d, i) => (
                <button
                  key={d.day}
                  className={`${styles.barWrap} ${activeDay === i ? styles.barActive : ''}`}
                  onClick={() => setActiveDay(i)}
                >
                  {activeDay === i && (
                    <span className={styles.barLabel}>₱{d.amount}</span>
                  )}
                  <div
                    className={styles.bar}
                    style={{ height: `${(d.amount / maxAmount) * 100}%` }}
                  />
                  <span className={styles.barDay}>{d.day}</span>
                </button>
              ))}
            </div>

            {activeDay !== null && (
              <div className={styles.dayDetail}>
                <span>📅 {weeklyData[activeDay].day}</span>
                <span>🛺 {weeklyData[activeDay].trips} biyahe</span>
                <span>💰 ₱{weeklyData[activeDay].amount}</span>
              </div>
            )}
          </div>
        </div>

        {/* Recent earnings */}
        <div className={styles.section}>
          <p className={styles.sectionTitle}>Pinakabagong Kita</p>
          <div className={styles.earningsList}>
            {recentEarnings.map(e => (
              <div key={e.id} className={styles.earningItem}>
                <div className={styles.earningAvatar}>
                  {e.passenger.charAt(0)}
                </div>
                <div className={styles.earningInfo}>
                  <span className={styles.earningPassenger}>{e.passenger}</span>
                  <span className={styles.earningRoute}>{e.from} → {e.to}</span>
                  <span className={styles.earningTime}>{e.date} · {e.time}</span>
                </div>
                <span className={styles.earningFare}>{e.fare}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Monthly summary */}
        <div className={styles.monthCard}>
          <p className={styles.monthTitle}>📊 Buwanang Buod</p>
          <div className={styles.monthGrid}>
            <div className={styles.monthItem}>
              <span className={styles.monthNum}>₱12,480</span>
              <span className={styles.monthLabel}>Kabuuang Kita</span>
            </div>
            <div className={styles.monthItem}>
              <span className={styles.monthNum}>312</span>
              <span className={styles.monthLabel}>Kabuuang Biyahe</span>
            </div>
            <div className={styles.monthItem}>
              <span className={styles.monthNum}>₱40</span>
              <span className={styles.monthLabel}>Pinakamataas / Biyahe</span>
            </div>
            <div className={styles.monthItem}>
              <span className={styles.monthNum}>⭐ 4.8</span>
              <span className={styles.monthLabel}>Avg Rating</span>
            </div>
          </div>
        </div>

        <div style={{ height: 20 }} />
      </div>

      {/* Bottom nav */}
      <div className={styles.bottomNav}>
        <button className={styles.navItem} onClick={() => navigate('home')}>
          <span>🏠</span><span>Home</span>
        </button>
        <button className={styles.navItem} onClick={() => navigate('history')}>
          <span>🕐</span><span>Kasaysayan</span>
        </button>
        <button className={`${styles.navItem} ${styles.navActive}`}>
          <span>💰</span><span>Kita</span>
        </button>
        <button className={styles.navItem} onClick={() => navigate('profile')}>
          <span>👤</span><span>Profile</span>
        </button>
      </div>
    </div>
  )
}

export default EarningsScreen