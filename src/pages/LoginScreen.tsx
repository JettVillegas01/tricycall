import React, { useState } from 'react'
import { Screen, UserRole, UserInfo } from '../App'
import styles from './LoginScreen.module.css'

interface Props {
  navigate: (s: Screen) => void
  setUser: React.Dispatch<React.SetStateAction<UserInfo>>
}

const LoginScreen: React.FC<Props> = ({ navigate, setUser }) => {
  const [selected, setSelected] = useState<UserRole>(null)
  const [phone, setPhone] = useState('')
  const [name, setName] = useState('')
  const [phoneError, setPhoneError] = useState('')
  const [nameError, setNameError] = useState('')

  const handleNameChange = (val: string) => {
    // Letters, spaces, at mga Filipino characters lang
    const cleaned = val.replace(/[^a-zA-ZÀ-ÖØ-öø-ÿñÑ\s]/g, '')
    setName(cleaned)
    if (val !== cleaned || /\d/.test(val)) {
      setNameError('Ang pangalan ay letters lang, walang numbers.')
    } else {
      setNameError('')
    }
  }

  const handlePhoneChange = (val: string) => {
    // Numbers lang
    const cleaned = val.replace(/\D/g, '')
    setPhone(cleaned)
    if (val !== cleaned) {
      setPhoneError('Invalid number — numbers lang ang pwede.')
    } else if (cleaned.length > 0 && cleaned.length < 10) {
      setPhoneError('Dapat 10 digits ang cellphone number.')
    } else if (cleaned.length === 10 && !cleaned.startsWith('9')) {
      setPhoneError('Dapat magsimula sa 9 ang number (hal. 9XX XXX XXXX).')
    } else {
      setPhoneError('')
    }
  }

  const isValid =
    !!selected &&
    name.trim().length >= 2 &&
    phone.length === 10 &&
    phone.startsWith('9') &&
    !phoneError &&
    !nameError

  const handleContinue = () => {
    if (!isValid) return
    setUser({
      name: name.trim(),
      phone,
      role: selected,
      photo: null,
    })
    navigate(selected === 'driver' ? 'driver-mode' : 'home')
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <span className={styles.logo}>🛺</span>
        <h1 className={styles.title}>TricyCall</h1>
        <p className={styles.sub}>Mag-sign in para magsimula</p>
      </div>

      <div className={styles.card}>
        {/* Role selector */}
        <p className={styles.label}>Ikaw ay isang…</p>
        <div className={styles.roleRow}>
          <button
            className={`${styles.roleBtn} ${selected === 'passenger' ? styles.roleActive : ''}`}
            onClick={() => setSelected('passenger')}
          >
            <span className={styles.roleIcon}>🧍</span>
            <span className={styles.roleName}>Pasahero</span>
            <span className={styles.roleDesc}>Gusto kong sumakay</span>
          </button>
          <button
            className={`${styles.roleBtn} ${selected === 'driver' ? styles.roleActive : ''}`}
            onClick={() => setSelected('driver')}
          >
            <span className={styles.roleIcon}>🛺</span>
            <span className={styles.roleName}>Traysikel Driver</span>
            <span className={styles.roleDesc}>Gusto kong kumita</span>
          </button>
        </div>

        {/* Pangalan */}
        <div className={styles.formGroup}>
          <label className={styles.fieldLabel}>Pangalan</label>
          <input
            className={`${styles.input} ${nameError ? styles.inputError : ''}`}
            type="text"
            placeholder="Ilagay ang iyong pangalan"
            value={name}
            onChange={e => handleNameChange(e.target.value)}
          />
          {nameError && <span className={styles.errorMsg}>⚠️ {nameError}</span>}
        </div>

        {/* Phone */}
        <div className={styles.formGroup}>
          <label className={styles.fieldLabel}>Cellphone Number</label>
          <div className={styles.phoneRow}>
            <span className={styles.prefix}>🇵🇭 +63</span>
            <input
              className={`${styles.input} ${styles.phoneInput} ${phoneError ? styles.inputError : ''}`}
              type="tel"
              inputMode="numeric"
              placeholder="9XX XXX XXXX"
              value={phone}
              onChange={e => handlePhoneChange(e.target.value)}
              maxLength={10}
            />
          </div>
          {phoneError && <span className={styles.errorMsg}>⚠️ {phoneError}</span>}
        </div>

        <button
          className={`${styles.continueBtn} ${!isValid ? styles.disabled : ''}`}
          onClick={handleContinue}
          disabled={!isValid}
        >
          Magpatuloy →
        </button>

        <p className={styles.terms}>
          Sa pagpapatuloy, sumasang-ayon ka sa aming{' '}
          <span className={styles.link}>Terms of Service</span> at{' '}
          <span className={styles.link}>Privacy Policy</span>.
        </p>
      </div>
    </div>
  )
}

export default LoginScreen