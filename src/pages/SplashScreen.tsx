import React, { useEffect } from 'react'
import { Screen } from '../App'
import styles from './SplashScreen.module.css'

interface Props { navigate: (s: Screen) => void }

const SplashScreen: React.FC<Props> = ({ navigate }) => {
  useEffect(() => {
    const t = setTimeout(() => navigate('login'), 2800)
    return () => clearTimeout(t)
  }, [navigate])

  return (
    <div className={styles.container}>
      {/* Background decoration */}
      <div className={styles.bgCircle1} />
      <div className={styles.bgCircle2} />

      <div className={styles.content}>
        {/* Tricycle icon */}
        <div className={styles.iconWrap}>
          <span className={styles.icon}>🛺</span>
        </div>

        <h1 className={styles.title}>TricyCall</h1>
        <p className={styles.tagline}>Ang iyong lokal na sakay,<br/>sa dulo ng iyong daliri.</p>
      </div>

      <div className={styles.footer}>
        <div className={styles.dots}>
          <span className={`${styles.dot} ${styles.active}`} />
          <span className={styles.dot} />
          <span className={styles.dot} />
        </div>
        <p className={styles.footerText}>Para sa probinsya, para sa lahat.</p>
      </div>
    </div>
  )
}

export default SplashScreen
