import React, { useRef, useState } from 'react'
import { Screen, UserInfo } from '../App'
import styles from './ProfileScreen.module.css'

interface Props {
  navigate: (s: Screen) => void
  user: UserInfo
  setUser: React.Dispatch<React.SetStateAction<UserInfo>>
  darkMode: boolean
  setDarkMode: (v: boolean) => void
}

const ProfileScreen: React.FC<Props> = ({ navigate, user, setUser, darkMode, setDarkMode }) => {
  const [editName, setEditName] = useState(user.name)
  const [nameError, setNameError] = useState('')
  const [saved, setSaved] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const handlePhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = ev => {
      setUser(prev => ({ ...prev, photo: ev.target?.result as string }))
    }
    reader.readAsDataURL(file)
  }

  const handleNameChange = (val: string) => {
    const cleaned = val.replace(/[^a-zA-ZÀ-ÖØ-öø-ÿñÑ\s]/g, '')
    setEditName(cleaned)
    setNameError(val !== cleaned ? 'Letters lang ang pwede sa pangalan.' : '')
  }

  const handleSave = () => {
    if (nameError) return
    if (editName.trim().length < 2) { setNameError('Masyadong maikli ang pangalan.'); return }
    setUser(prev => ({ ...prev, name: editName.trim() }))
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.headerBg}>
        <button className={styles.backBtn} onClick={() => navigate('home')}>←</button>
        <h2 className={styles.headerTitle}>Aking Profile</h2>

        {/* Photo */}
        <div className={styles.photoWrap}>
          <div className={styles.photoCircle} onClick={() => fileRef.current?.click()}>
            {user.photo
              ? <img src={user.photo} alt="profile" className={styles.photoImg} />
              : <span className={styles.photoInitial}>{user.name.charAt(0).toUpperCase()}</span>
            }
            <div className={styles.photoOverlay}><span>📷</span></div>
          </div>
          <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handlePhoto} />
          <p className={styles.photoHint}>I-tap para baguhin ang larawan</p>
        </div>

        <div className={styles.nameBadge}>
          <p className={styles.displayName}>{user.name}</p>
          <span className={styles.roleBadge}>
            {user.role === 'driver' ? '🛺 Driver' : '🧍 Pasahero'}
          </span>
        </div>
      </div>

      {/* Body */}
      <div className={styles.body}>

        {/* Dark mode toggle */}
        <div className={styles.toggleCard}>
          <div className={styles.toggleInfo}>
            <span className={styles.toggleIcon}>{darkMode ? '🌙' : '☀️'}</span>
            <div>
              <p className={styles.toggleLabel}>{darkMode ? 'Dark Mode' : 'Light Mode'}</p>
              <p className={styles.toggleSub}>Baguhin ang tema ng app</p>
            </div>
          </div>
          <button
            className={`${styles.toggleBtn} ${darkMode ? styles.toggleOn : styles.toggleOff}`}
            onClick={() => setDarkMode(!darkMode)}
          >
            <span className={`${styles.toggleThumb} ${darkMode ? styles.thumbOn : ''}`} />
          </button>
        </div>

        {/* Edit pangalan */}
        <p className={styles.sectionLabel}>I-edit ang Pangalan</p>
        <div className={styles.formGroup}>
          <label className={styles.fieldLabel}>Buong Pangalan</label>
          <input
            className={`${styles.input} ${nameError ? styles.inputError : ''}`}
            value={editName}
            onChange={e => handleNameChange(e.target.value)}
            placeholder="Buong Pangalan"
          />
          {nameError && <span className={styles.errorMsg}>⚠️ {nameError}</span>}
        </div>

        {/* Phone — read only */}
        <div className={styles.formGroup}>
          <label className={styles.fieldLabel}>Cellphone Number</label>
          <div className={styles.phoneRow}>
            <span className={styles.prefix}>🇵🇭 +63</span>
            <input
              className={`${styles.input} ${styles.phoneInput}`}
              type="tel"
              value={user.phone}
              readOnly
              disabled
              style={{ opacity: 0.6, cursor: 'not-allowed' }}
            />
          </div>
          <span style={{ color: '#888', fontSize: 12 }}>Hindi mababago ang numero.</span>
        </div>

        <button
          className={`${styles.saveBtn} ${saved ? styles.savedBtn : ''}`}
          onClick={handleSave}
        >
          {saved ? '✓ Na-save na!' : 'I-save ang Pagbabago'}
        </button>

        {/* Menu */}
        <p className={styles.sectionLabel} style={{ marginTop: 8 }}>Iba pa</p>

        <button className={styles.menuItem} onClick={() => navigate('history')}>
          <span className={styles.menuIcon}>🕐</span>
          <span className={styles.menuLabel}>Kasaysayan ng Biyahe</span>
          <span className={styles.menuArrow}>›</span>
        </button>

        <button className={styles.menuItem} onClick={() => navigate('earnings')}>
          <span className={styles.menuIcon}>💰</span>
          <span className={styles.menuLabel}>Aking Kita</span>
          <span className={styles.menuArrow}>›</span>
        </button>

        {[
          { icon: '⭐', label: 'Mga Rating ko' },
          { icon: '💳', label: 'Paraan ng Bayad' },
          { icon: '🔔', label: 'Mga Notipikasyon' },
          { icon: '🛡️', label: 'Privacy at Seguridad' },
          { icon: '❓', label: 'Tulong at Suporta' },
        ].map(item => (
          <button key={item.label} className={styles.menuItem}>
            <span className={styles.menuIcon}>{item.icon}</span>
            <span className={styles.menuLabel}>{item.label}</span>
            <span className={styles.menuArrow}>›</span>
          </button>
        ))}

        <button className={styles.signOutBtn} onClick={() => navigate('login')}>
          🚪 Mag-sign Out
        </button>
      </div>
    </div>
  )
}

export default ProfileScreen