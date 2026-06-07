import React, { useState, useEffect, useRef } from 'react'
import { Screen } from '../App'
import styles from './BookingScreen.module.css'

interface Props { navigate: (s: Screen) => void }

interface SearchResult {
  display_name: string
  lat: string
  lon: string
}

function getDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLon = (lon2 - lon1) * Math.PI / 180
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

function computeFare(km: number) {
  const BASE = 15
  const PER_KM = 8
  return Math.round(BASE + km * PER_KM)
}

const BookingScreen: React.FC<Props> = ({ navigate }) => {
  const [dropoff, setDropoff] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [selected, setSelected] = useState<SearchResult | null>(null)
  const [searching, setSearching] = useState(false)
  const [distanceKm, setDistanceKm] = useState<number | null>(null)
  const [suggestedFare, setSuggestedFare] = useState<number>(30)
  const [offerFare, setOfferFare] = useState<number>(30)
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'gcash'>('cash')

  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)
  const routeLayerRef = useRef<any>(null)
  const debounceRef = useRef<any>(null)
  const userLatRef = useRef(14.5995)
  const userLngRef = useRef(120.9842)

  useEffect(() => {
    navigator.geolocation?.getCurrentPosition(pos => {
      userLatRef.current = pos.coords.latitude
      userLngRef.current = pos.coords.longitude
    }, undefined, { enableHighAccuracy: true })
  }, [])

  useEffect(() => {
    if (!document.getElementById('leaflet-css')) {
      const link = document.createElement('link')
      link.id = 'leaflet-css'
      link.rel = 'stylesheet'
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
      document.head.appendChild(link)
    }
    const loadLeaflet = () => new Promise<void>(resolve => {
      if ((window as any).L) { resolve(); return }
      const s = document.createElement('script')
      s.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
      s.onload = () => resolve()
      document.head.appendChild(s)
    })
    loadLeaflet().then(() => {
      if (!mapRef.current || mapInstanceRef.current) return
      const L = (window as any).L
      const map = L.map(mapRef.current, {
        center: [userLatRef.current, userLngRef.current],
        zoom: 14,
        zoomControl: false,
        attributionControl: false,
      })
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19 }).addTo(map)
      L.control.attribution({ position: 'bottomright', prefix: false })
        .addAttribution('© <a href="https://openstreetmap.org/copyright">OSM</a>')
        .addTo(map)
      const myIcon = L.divIcon({
        html: `<div style="font-size:26px;filter:drop-shadow(0 2px 4px rgba(0,0,0,0.3))">📍</div>`,
        className: '', iconSize: [30, 30], iconAnchor: [15, 30],
      })
      L.marker([userLatRef.current, userLngRef.current], { icon: myIcon })
        .addTo(map).bindPopup('<b>Nandito ka!</b>')
      mapInstanceRef.current = map
    })
    return () => {
      if (mapInstanceRef.current) { mapInstanceRef.current.remove(); mapInstanceRef.current = null }
    }
  }, [])

  const handleSearch = (val: string) => {
    setDropoff(val)
    setSelected(null)
    setDistanceKm(null)
    clearTimeout(debounceRef.current)
    if (val.trim().length < 3) { setResults([]); return }
    setSearching(true)
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(val)}&format=json&limit=6&countrycodes=ph`,
          { headers: { 'Accept-Language': 'fil,en' } }
        )
        const data = await res.json()
        setResults(data)
      } catch { setResults([]) }
      setSearching(false)
    }, 500)
  }

  const drawRoute = async (destLat: number, destLng: number) => {
    const L = (window as any).L
    const map = mapInstanceRef.current
    if (!map || !L) return
    if (routeLayerRef.current) { map.removeLayer(routeLayerRef.current); routeLayerRef.current = null }
    try {
      const url = `https://router.project-osrm.org/route/v1/driving/${userLngRef.current},${userLatRef.current};${destLng},${destLat}?overview=full&geometries=geojson`
      const res = await fetch(url)
      const data = await res.json()
      if (data.routes?.[0]) {
        const routeGeo = data.routes[0].geometry
        const layer = L.geoJSON(routeGeo, {
          style: { color: '#F59E0B', weight: 5, opacity: 0.85, lineCap: 'round', lineJoin: 'round' }
        }).addTo(map)
        routeLayerRef.current = layer
        const destIcon = L.divIcon({
          html: `<div style="font-size:26px;filter:drop-shadow(0 2px 4px rgba(0,0,0,0.3))">🏁</div>`,
          className: '', iconSize: [30, 30], iconAnchor: [15, 30],
        })
        L.marker([destLat, destLng], { icon: destIcon }).addTo(map)
          .bindPopup('<b>Destinasyon</b>').openPopup()
        map.fitBounds(layer.getBounds(), { padding: [40, 40] })
      }
    } catch (e) { console.error('Route error:', e) }
  }

  const handleSelect = (r: SearchResult) => {
    setDropoff(r.display_name.split(',')[0])
    setSelected(r)
    setResults([])
    const destLat = parseFloat(r.lat)
    const destLng = parseFloat(r.lon)
    const km = getDistanceKm(userLatRef.current, userLngRef.current, destLat, destLng)
    const fare = computeFare(km)
    setDistanceKm(km)
    setSuggestedFare(fare)
    setOfferFare(fare)
    drawRoute(destLat, destLng)
  }

  const adjustFare = (delta: number) => {
    setOfferFare(prev => Math.max(15, prev + delta))
  }

  const handleBook = () => {
    sessionStorage.setItem('tricycall_offer', JSON.stringify({
      fare: offerFare,
      destination: selected?.display_name.split(',')[0] ?? 'Hindi kilala',
      distanceKm: distanceKm?.toFixed(1) ?? '?',
      paymentMethod,
    }))
    navigate('driver-search')
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <button className={styles.backBtn} onClick={() => navigate('home')}>←</button>
        <h2 className={styles.title}>Magbook ng Tricycle</h2>
      </div>

      <div className={styles.routeCard}>
        <div className={styles.routeRow}>
          <div className={styles.dotGreen} />
          <div className={styles.routeInputWrap}>
            <span className={styles.routeLabel}>Pickup</span>
            <span className={styles.routeValue}>📍 Kasalukuyang Lokasyon</span>
          </div>
        </div>
        <div className={styles.dashedLine} />
        <div className={styles.routeRow}>
          <div className={styles.dotRed} />
          <div className={styles.routeInputWrap}>
            <span className={styles.routeLabel}>Destinasyon</span>
            <input
              className={styles.destInput}
              placeholder="I-search ang lugar..."
              value={dropoff}
              onChange={e => handleSearch(e.target.value)}
              autoFocus
            />
          </div>
        </div>
      </div>

      {results.length > 0 && (
        <div className={styles.searchResults}>
          {searching && <div className={styles.searchingText}>Naghahanap…</div>}
          {results.map((r, i) => (
            <button key={i} className={styles.resultItem} onClick={() => handleSelect(r)}>
              <span className={styles.resultIcon}>📌</span>
              <div className={styles.resultInfo}>
                <span className={styles.resultName}>{r.display_name.split(',')[0]}</span>
                <span className={styles.resultAddr}>{r.display_name.split(',').slice(1, 3).join(',').trim()}</span>
              </div>
            </button>
          ))}
        </div>
      )}
      {searching && results.length === 0 && (
        <div className={styles.searchingBar}>🔍 Naghahanap ng lugar…</div>
      )}

      <div className={styles.mapArea}>
        <div ref={mapRef} className={styles.mapContainer} />
        {!selected && (
          <div className={styles.mapHint}>
            <span>🗺️ I-search ang destinasyon para makita ang ruta</span>
          </div>
        )}
      </div>

      {selected && distanceKm !== null && (
        <div className={styles.fareSection}>
          <div className={styles.distanceRow}>
            <span className={styles.distLabel}>📏 Distansya</span>
            <span className={styles.distValue}>{distanceKm.toFixed(1)} km</span>
          </div>

          <div className={styles.fareOfferBox}>
            <p className={styles.fareOfferLabel}>Iyong Alok sa Driver</p>
            <p className={styles.fareOfferSub}>Mungkahi: ₱{suggestedFare} · Pwede mong baguhin</p>
            <div className={styles.fareAdjustRow}>
              <button className={styles.fareAdjBtn} onClick={() => adjustFare(-5)}>−₱5</button>
              <span className={styles.fareAdjAmt}>₱{offerFare}</span>
              <button className={styles.fareAdjBtn} onClick={() => adjustFare(5)}>+₱5</button>
            </div>
          </div>

          <div className={styles.paymentBox}>
            <p className={styles.paymentLabel}>💳 Paraan ng Bayad</p>
            <div className={styles.paymentOptions}>
              <button
                className={`${styles.paymentBtn} ${paymentMethod === 'cash' ? styles.paymentActive : ''}`}
                onClick={() => setPaymentMethod('cash')}
              >
                <span className={styles.paymentIcon}>💵</span>
                <div className={styles.paymentInfo}>
                  <span className={styles.paymentName}>Cash</span>
                  <span className={styles.paymentSub}>Bayad sa driver</span>
                </div>
                {paymentMethod === 'cash' && <span className={styles.paymentCheck}>✓</span>}
                <span className={styles.preferredBadge}>Preferred</span>
              </button>

              <button
                className={`${styles.paymentBtn} ${paymentMethod === 'gcash' ? styles.paymentActive : ''}`}
                onClick={() => setPaymentMethod('gcash')}
              >
                <span className={styles.paymentIcon}>📱</span>
                <div className={styles.paymentInfo}>
                  <span className={styles.paymentName}>GCash</span>
                  <span className={styles.paymentSub}>I-send sa driver</span>
                </div>
                {paymentMethod === 'gcash' && <span className={styles.paymentCheck}>✓</span>}
              </button>
            </div>
          </div>

          <button className={styles.bookBtn} onClick={handleBook}>
            🛺 I-offer sa mga Driver
          </button>
        </div>
      )}
    </div>
  )
}

export default BookingScreen