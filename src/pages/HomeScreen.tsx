import React, { useEffect, useRef, useState } from 'react'
import { Screen, UserRole, UserInfo } from '../App'
import styles from './HomeScreen.module.css'

interface Props {
  navigate: (s: Screen) => void
  role: UserRole
  user: UserInfo
}

const recentPlaces = [
  { icon: '🏠', name: 'Bahay', desc: 'Pook Uno, Brgy. Santo Niño' },
  { icon: '🏪', name: 'Palengke', desc: 'Sentral na Palengke' },
  { icon: '🏥', name: 'Ospital', desc: 'Municipal Health Center' },
]

const quickDestinations = [
  { icon: '🏫', label: 'Paaralan',   discount: '10% Discount', navigateTo: 'booking' as Screen },
  { icon: '📦', label: 'Delivery',   discount: null,           navigateTo: 'booking' as Screen },
  { icon: '🔧', label: 'Hardware',   discount: null,           navigateTo: 'booking' as Screen },
  { icon: '🛺', label: 'Rent Trike', discount: null,           navigateTo: 'booking' as Screen },
]

const HomeScreen: React.FC<Props> = ({ navigate, user }) => {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)
  const [locStatus, setLocStatus] = useState<'loading' | 'ok' | 'error'>('loading')

  useEffect(() => {
    if (!document.getElementById('leaflet-css')) {
      const link = document.createElement('link')
      link.id = 'leaflet-css'
      link.rel = 'stylesheet'
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
      document.head.appendChild(link)
    }

    const loadLeaflet = () =>
      new Promise<void>((resolve) => {
        if ((window as any).L) { resolve(); return }
        const script = document.createElement('script')
        script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
        script.onload = () => resolve()
        document.head.appendChild(script)
      })

    const initMap = (lat: number, lng: number) => {
      if (!mapRef.current || mapInstanceRef.current) return
      const L = (window as any).L

      const map = L.map(mapRef.current, {
        center: [lat, lng],
        zoom: 16,
        zoomControl: false,
        attributionControl: false,
      })

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19 }).addTo(map)

      L.control.attribution({ position: 'bottomright', prefix: false })
        .addAttribution('© <a href="https://openstreetmap.org/copyright">OSM</a>')
        .addTo(map)

      const tricyIcon = L.divIcon({
        html: `<div style="font-size:30px;line-height:1;filter:drop-shadow(0 2px 6px rgba(0,0,0,0.35))">🛺</div>`,
        className: '',
        iconSize: [36, 36],
        iconAnchor: [18, 36],
      })

      L.marker([lat, lng], { icon: tricyIcon })
        .addTo(map)
        .bindPopup('<b>📍 Nandito ka!</b>')
        .openPopup()

      L.circle([lat, lng], {
        radius: 80,
        color: '#F59E0B',
        fillColor: '#FDE68A',
        fillOpacity: 0.3,
        weight: 2,
      }).addTo(map)

      mapInstanceRef.current = map
    }

    loadLeaflet().then(() => {
      if (!navigator.geolocation) {
        setLocStatus('error')
        initMap(14.5995, 120.9842)
        return
      }

      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLocStatus('ok')
          initMap(pos.coords.latitude, pos.coords.longitude)
        },
        () => {
          setLocStatus('error')
          initMap(14.5995, 120.9842)
        },
        { enableHighAccuracy: true, timeout: 10000 }
      )
    })

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }
    }
  }, [])

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <div className={styles.locationBadge}>
            <span>📍</span>
            <span className={styles.locationText}>
              {locStatus === 'loading' && 'Hinahanap lokasyon…'}
              {locStatus === 'ok'      && 'Kasalukuyang Lokasyon'}
              {locStatus === 'error'   && 'Hindi makuha ang lokasyon'}
            </span>
            <span className={styles.chevron}>▾</span>
          </div>
          <h2 className={styles.greeting}>Kumusta, {user.name.split(' ')[0]}! 👋</h2>
        </div>
        <div className={styles.avatar} onClick={() => navigate('profile')} style={{ cursor: 'pointer' }}>
          {user.photo
            ? <img src={user.photo} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} alt="avatar" />
            : user.name.charAt(0).toUpperCase()
          }
        </div>
      </div>

      <div className={styles.mapArea}>
        {locStatus === 'loading' && (
          <div className={styles.mapLoading}>
            <span>📡</span>
            <p>Hinahanap ang iyong lokasyon…</p>
          </div>
        )}
        <div ref={mapRef} className={styles.leafletMap} />
      </div>

      <div className={styles.sheet}>
        <button className={styles.whereBtn} onClick={() => navigate('booking')}>
          <span className={styles.whereIcon}>🔍</span>
          <span className={styles.whereText}>Saan ka pupunta?</span>
        </button>

        <div className={styles.quickRow}>
          {quickDestinations.map(d => (
            <button key={d.label} className={styles.quickBtn} onClick={() => navigate(d.navigateTo)}>
              <span className={styles.quickIcon}>{d.icon}</span>
              <span className={styles.quickLabel}>{d.label}</span>
              {d.discount && <span className={styles.discountBadge}>{d.discount}</span>}
            </button>
          ))}
        </div>

        <div className={styles.section}>
          <p className={styles.sectionTitle}>Mga Lugar na Napuntahan</p>
          {recentPlaces.map(p => (
            <button key={p.name} className={styles.recentItem} onClick={() => navigate('booking')}>
              <div className={styles.recentIconWrap}><span>{p.icon}</span></div>
              <div className={styles.recentInfo}>
                <span className={styles.recentName}>{p.name}</span>
                <span className={styles.recentDesc}>{p.desc}</span>
              </div>
              <span className={styles.recentArrow}>→</span>
            </button>
          ))}
        </div>
      </div>

      <div className={styles.bottomNav}>
        <button className={`${styles.navItem} ${styles.navActive}`} onClick={() => navigate('home')}>
          <span>🏠</span><span>Home</span>
        </button>
        <button className={styles.navItem} onClick={() => navigate('history')}>
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

export default HomeScreen
