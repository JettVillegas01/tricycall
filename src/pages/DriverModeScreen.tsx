import React, { useState, useEffect, useRef } from 'react'
import { Screen } from '../App'
import styles from './DriverModeScreen.module.css'

interface Props { navigate: (s: Screen) => void }

interface RideRequest {
  id: number
  passengerName: string
  initial: string
  distM: number
  destination: string
  distanceKm: string
  offeredFare: number
  eta: number
  pickupLat: number
  pickupLng: number
  destLat: number
  destLng: number
}

interface Step {
  instruction: string
  distanceM: number
  direction: '↑' | '↰' | '↱' | '⟳'
}

interface ChatMessage {
  from: 'driver' | 'passenger'
  text: string
  time: string
}

type ActiveState = 'idle' | 'searching' | 'accepted' | 'navigating_pickup' | 'navigating_dest' | 'cancelled'

const MOCK_REQUESTS: RideRequest[] = [
  {
    id: 1, passengerName: 'Ana Reyes', initial: 'A',
    distM: 180, destination: 'Sentral na Palengke', distanceKm: '1.2',
    offeredFare: 25, eta: 3,
    pickupLat: 14.6010, pickupLng: 120.9850,
    destLat: 14.5940, destLng: 120.9800,
  },
  {
    id: 2, passengerName: 'Ben Gomez', initial: 'B',
    distM: 320, destination: 'Municipal Hall', distanceKm: '2.4',
    offeredFare: 35, eta: 5,
    pickupLat: 14.6030, pickupLng: 120.9870,
    destLat: 14.5980, destLng: 120.9820,
  },
  {
    id: 3, passengerName: 'Cita Villanueva', initial: 'C',
    distM: 500, destination: 'Paaralan ng Bayan', distanceKm: '3.1',
    offeredFare: 40, eta: 8,
    pickupLat: 14.6050, pickupLng: 120.9890,
    destLat: 14.5920, destLng: 120.9780,
  },
]

const QUICK_MESSAGES = [
  'Papunta na ako! 🛺',
  '5 minuto na lang!',
  'Nandito na ako sa pickup.',
  'Sandali lang, may trapik.',
  'Kumain muna tayo bago pumunta.',
]

const MOCK_PASSENGER_REPLIES = [
  'Sige, salamat! 😊',
  'Ok, hihintayin kita.',
  'Nandito ako sa tapat ng gate.',
  'Dahan-dahan lang, ok lang.',
]

function parseSteps(legs: any[]): Step[] {
  if (!legs?.length) return []
  return legs[0].steps.slice(0, 6).map((s: any) => {
    const type = s.maneuver?.type ?? ''
    const modifier = s.maneuver?.modifier ?? ''
    let direction: Step['direction'] = '↑'
    if (type === 'turn') {
      if (modifier.includes('left')) direction = '↰'
      else if (modifier.includes('right')) direction = '↱'
    } else if (type === 'rotary' || type === 'roundabout') {
      direction = '⟳'
    }
    const raw = s.name ? `Patungo sa ${s.name}` : 'Ituloy ang daan'
    return { instruction: raw, distanceM: Math.round(s.distance), direction }
  })
}

const DriverModeScreen: React.FC<Props> = ({ navigate }) => {
  const [online, setOnline] = useState(false)
  const [requests, setRequests] = useState<RideRequest[]>([])
  const [activeState, setActiveState] = useState<ActiveState>('idle')
  const [acceptedRide, setAcceptedRide] = useState<RideRequest | null>(null)
  const [earnings, setEarnings] = useState(320)
  const [countdown, setCountdown] = useState(15)
  const [steps, setSteps] = useState<Step[]>([])
  const [currentStep, setCurrentStep] = useState(0)
  const [routeLoading, setRouteLoading] = useState(false)
  const [searchSeconds, setSearchSeconds] = useState(0)
  const [showChat, setShowChat] = useState(false)
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([])
  const [chatInput, setChatInput] = useState('')
  const chatBottomRef = useRef<HTMLDivElement>(null)

  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)
  const routeLayerRef = useRef<any>(null)
  const markersRef = useRef<any[]>([])
  const countdownRef = useRef<any>(null)
  const searchTimerRef = useRef<any>(null)
  const driverLatRef = useRef(14.5995)
  const driverLngRef = useRef(120.9842)

  // Get driver GPS
  useEffect(() => {
    navigator.geolocation?.getCurrentPosition(pos => {
      driverLatRef.current = pos.coords.latitude
      driverLngRef.current = pos.coords.longitude
    }, undefined, { enableHighAccuracy: true })
  }, [])

  // Leaflet init — always mount the map div, use invalidateSize on show
  useEffect(() => {
    const loadLeaflet = () => new Promise<void>(resolve => {
      if (!document.getElementById('leaflet-css')) {
        const link = document.createElement('link')
        link.id = 'leaflet-css'
        link.rel = 'stylesheet'
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
        document.head.appendChild(link)
      }
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
        center: [driverLatRef.current, driverLngRef.current],
        zoom: 15,
        zoomControl: false,
        attributionControl: false,
      })
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        // Force tile load even when container was hidden
        updateWhenIdle: false,
        keepBuffer: 4,
      }).addTo(map)
      L.control.attribution({ position: 'bottomright', prefix: false })
        .addAttribution('© <a href="https://openstreetmap.org/copyright">OSM</a>')
        .addTo(map)
      const driverIcon = L.divIcon({
        html: `<div style="font-size:28px;filter:drop-shadow(0 2px 6px rgba(0,0,0,0.35))">🛺</div>`,
        className: '', iconSize: [34, 34], iconAnchor: [17, 34],
      })
      L.marker([driverLatRef.current, driverLngRef.current], { icon: driverIcon })
        .addTo(map).bindPopup('<b>Ikaw</b>').openPopup()
      mapInstanceRef.current = map
      // invalidate after a tick so the container has correct size
      setTimeout(() => map.invalidateSize(), 100)
    })
    return () => {
      if (mapInstanceRef.current) { mapInstanceRef.current.remove(); mapInstanceRef.current = null }
    }
  }, [])

  // Invalidate map size whenever it becomes visible
  useEffect(() => {
    if ((online || activeState === 'navigating_pickup' || activeState === 'navigating_dest') && mapInstanceRef.current) {
      setTimeout(() => mapInstanceRef.current?.invalidateSize(), 150)
    }
  }, [online, activeState])

  // Draw route on map
  const drawRoute = async (
    fromLat: number, fromLng: number,
    toLat: number, toLng: number,
    toLabel: string, toEmoji: string
  ) => {
    const L = (window as any).L
    const map = mapInstanceRef.current
    if (!map || !L) return
    if (routeLayerRef.current) { map.removeLayer(routeLayerRef.current); routeLayerRef.current = null }
    markersRef.current.forEach(m => map.removeLayer(m))
    markersRef.current = []

    setRouteLoading(true)
    try {
      const url = `https://router.project-osrm.org/route/v1/driving/${fromLng},${fromLat};${toLng},${toLat}?overview=full&geometries=geojson&steps=true`
      const res = await fetch(url)
      const data = await res.json()
      if (data.routes?.[0]) {
        const route = data.routes[0]
        const layer = L.geoJSON(route.geometry, {
          style: { color: '#F59E0B', weight: 5, opacity: 0.9, lineCap: 'round', lineJoin: 'round' }
        }).addTo(map)
        routeLayerRef.current = layer
        const destIcon = L.divIcon({
          html: `<div style="font-size:26px;filter:drop-shadow(0 2px 4px rgba(0,0,0,0.3))">${toEmoji}</div>`,
          className: '', iconSize: [30, 30], iconAnchor: [15, 30],
        })
        const m = L.marker([toLat, toLng], { icon: destIcon }).addTo(map)
          .bindPopup(`<b>${toLabel}</b>`).openPopup()
        markersRef.current.push(m)
        map.fitBounds(layer.getBounds(), { padding: [50, 50] })
        setSteps(parseSteps(route.legs))
        setCurrentStep(0)
      }
    } catch (e) { console.error(e) }
    setRouteLoading(false)
  }

  // Online toggle triggers mock requests
  useEffect(() => {
    if (!online) { setRequests([]); setActiveState('idle'); return }
  }, [online])

  // Countdown for requests
  useEffect(() => {
    if (requests.length === 0) { setCountdown(15); return }
    setCountdown(15)
    countdownRef.current = setInterval(() => {
      setCountdown(c => {
        if (c <= 1) { clearInterval(countdownRef.current); setRequests([]); return 15 }
        return c - 1
      })
    }, 1000)
    return () => clearInterval(countdownRef.current)
  }, [requests.length > 0])

  const handleFindPassenger = () => {
    if (!online) return
    setActiveState('searching')
    setSearchSeconds(0)
    setRequests([])
    let sec = 0
    searchTimerRef.current = setInterval(() => {
      sec++
      setSearchSeconds(sec)
    }, 1000)
    setTimeout(() => {
      clearInterval(searchTimerRef.current)
      setRequests(MOCK_REQUESTS)
      setActiveState('idle')
    }, 4000)
  }

  const handleStopSearch = () => {
    clearInterval(searchTimerRef.current)
    setActiveState('idle')
    setRequests([])
    setSearchSeconds(0)
  }

  const handleAccept = (r: RideRequest) => {
    clearInterval(countdownRef.current)
    setRequests([])
    setAcceptedRide(r)
    setActiveState('navigating_pickup')
    setEarnings(prev => prev + r.offeredFare)
    // Init chat with a greeting from passenger
    setChatMessages([{
      from: 'passenger',
      text: `Kumusta! Nasa ${r.distM}m lang ako. Salamat! 😊`,
      time: new Date().toLocaleTimeString('fil-PH', { hour: '2-digit', minute: '2-digit' }),
    }])
    setShowChat(false)
    drawRoute(driverLatRef.current, driverLngRef.current, r.pickupLat, r.pickupLng, r.passengerName, '👤')
  }

  const handleDecline = (id: number) => setRequests(prev => prev.filter(r => r.id !== id))

  const handlePickedUp = () => {
    if (!acceptedRide) return
    setActiveState('navigating_dest')
    drawRoute(acceptedRide.pickupLat, acceptedRide.pickupLng, acceptedRide.destLat, acceptedRide.destLng, acceptedRide.destination, '🏁')
  }

  const handleArrived = () => {
    setActiveState('idle')
    setAcceptedRide(null)
    setSteps([])
    setShowChat(false)
    setChatMessages([])
    if (routeLayerRef.current && mapInstanceRef.current) {
      mapInstanceRef.current.removeLayer(routeLayerRef.current)
      routeLayerRef.current = null
    }
    markersRef.current.forEach(m => mapInstanceRef.current?.removeLayer(m))
    markersRef.current = []
  }

  const handleCancelRide = () => {
    if (acceptedRide) setEarnings(prev => prev - acceptedRide.offeredFare)
    setAcceptedRide(null)
    setActiveState('cancelled')
    setSteps([])
    setShowChat(false)
    setChatMessages([])
    setTimeout(() => setActiveState('idle'), 2000)
  }

  const toggleOnline = () => {
    setOnline(v => !v)
    setActiveState('idle')
    setAcceptedRide(null)
    setRequests([])
    setSteps([])
    setShowChat(false)
    setChatMessages([])
  }

  // Chat send
  const sendMessage = (text: string) => {
    if (!text.trim()) return
    const now = new Date().toLocaleTimeString('fil-PH', { hour: '2-digit', minute: '2-digit' })
    const msg: ChatMessage = { from: 'driver', text: text.trim(), time: now }
    setChatMessages(prev => [...prev, msg])
    setChatInput('')
    // Mock passenger reply after 2s
    setTimeout(() => {
      const reply = MOCK_PASSENGER_REPLIES[Math.floor(Math.random() * MOCK_PASSENGER_REPLIES.length)]
      setChatMessages(prev => [...prev, {
        from: 'passenger',
        text: reply,
        time: new Date().toLocaleTimeString('fil-PH', { hour: '2-digit', minute: '2-digit' }),
      }])
    }, 2000)
  }

  // Auto scroll chat
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chatMessages])

  const isNavigating = activeState === 'navigating_pickup' || activeState === 'navigating_dest'

  return (
    <div className={styles.container}>

      {/* Header — hidden during navigation */}
      {!isNavigating && (
        <div className={styles.header}>
          <div>
            <h2 className={styles.title}>Driver Mode</h2>
            <span className={`${styles.statusBadge} ${online ? styles.online : styles.offline}`}>
              {online ? '● Online' : '○ Offline'}
            </span>
          </div>
          <div className={styles.earnings}>
            <span className={styles.earningsLabel}>Kita Ngayon</span>
            <span className={styles.earningsAmt}>₱{earnings}</span>
          </div>
        </div>
      )}

      {/* Nav bar during navigation */}
      {isNavigating && acceptedRide && (
        <div className={styles.navBar}>
          <div className={styles.navPhase}>
            {activeState === 'navigating_pickup'
              ? `👤 Pickup: ${acceptedRide.passengerName}`
              : `🏁 Destination: ${acceptedRide.destination}`}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button className={styles.chatNavBtn} onClick={() => setShowChat(v => !v)}>
              💬 {chatMessages.length > 0 && <span className={styles.chatBadge}>{chatMessages.filter(m => m.from === 'passenger').length}</span>}
            </button>
            <span className={styles.navFare}>₱{acceptedRide.offeredFare}</span>
          </div>
        </div>
      )}

      {/* Turn-by-turn strip */}
      {isNavigating && steps.length > 0 && !showChat && (
        <div className={styles.turnStrip}>
          <div className={styles.turnArrow}>{steps[currentStep]?.direction ?? '↑'}</div>
          <div className={styles.turnText}>
            <span className={styles.turnDist}>
              {steps[currentStep]?.distanceM < 1000
                ? `${steps[currentStep]?.distanceM}m`
                : `${(steps[currentStep]?.distanceM / 1000).toFixed(1)}km`}
            </span>
            <span className={styles.turnInstruction}>{steps[currentStep]?.instruction}</span>
          </div>
          <div className={styles.turnNav}>
            {currentStep > 0 && (
              <button className={styles.turnNavBtn} onClick={() => setCurrentStep(c => c - 1)}>‹</button>
            )}
            {currentStep < steps.length - 1 && (
              <button className={styles.turnNavBtn} onClick={() => setCurrentStep(c => c + 1)}>›</button>
            )}
          </div>
        </div>
      )}
      {isNavigating && routeLoading && (
        <div className={styles.routeLoading}>🔍 Kinukwenta ang ruta…</div>
      )}

      {/* Map — always rendered, shown/hidden via CSS */}
      <div className={styles.mapArea}>
        {!online && !isNavigating && (
          <div className={styles.mapPlaceholder}>
            <span style={{ fontSize: 36, opacity: 0.4 }}>🗺️</span>
            <p style={{ fontSize: 13, color: '#059669', fontWeight: 600 }}>Mapa ng iyong Ruta</p>
          </div>
        )}
        <div
          ref={mapRef}
          className={styles.leafletMap}
          style={{ display: online || isNavigating ? 'block' : 'none' }}
        />

        {/* Chat overlay on top of map */}
        {isNavigating && showChat && acceptedRide && (
          <div className={styles.chatOverlay}>
            <div className={styles.chatHeader}>
              <div className={styles.chatPassengerInfo}>
                <div className={styles.chatAvatar}>{acceptedRide.initial}</div>
                <div>
                  <p className={styles.chatName}>{acceptedRide.passengerName}</p>
                  <p className={styles.chatStatus}>
                    {activeState === 'navigating_pickup' ? 'Papunta sa pickup' : 'Papunta sa destinasyon'}
                  </p>
                </div>
              </div>
              <button className={styles.chatCloseBtn} onClick={() => setShowChat(false)}>✕</button>
            </div>

            <div className={styles.chatMessages}>
              {chatMessages.map((msg, i) => (
                <div key={i} className={`${styles.chatBubble} ${msg.from === 'driver' ? styles.bubbleDriver : styles.bubblePassenger}`}>
                  <span className={styles.bubbleText}>{msg.text}</span>
                  <span className={styles.bubbleTime}>{msg.time}</span>
                </div>
              ))}
              <div ref={chatBottomRef} />
            </div>

            {/* Quick messages */}
            <div className={styles.quickMsgRow}>
              {QUICK_MESSAGES.map((q, i) => (
                <button key={i} className={styles.quickMsgBtn} onClick={() => sendMessage(q)}>{q}</button>
              ))}
            </div>

            <div className={styles.chatInputRow}>
              <input
                className={styles.chatInput}
                placeholder="I-type ang mensahe…"
                value={chatInput}
                onChange={e => setChatInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') sendMessage(chatInput) }}
              />
              <button className={styles.chatSendBtn} onClick={() => sendMessage(chatInput)}>➤</button>
            </div>
          </div>
        )}
      </div>

      {/* Stats + Toggle — hidden during navigation */}
      {!isNavigating && (
        <>
          <div className={styles.statsRow}>
            <div className={styles.statItem}>
              <span className={styles.statNum}>12</span>
              <span className={styles.statLabel}>Biyahe</span>
            </div>
            <div className={styles.statDivider} />
            <div className={styles.statItem}>
              <span className={styles.statNum}>4.9⭐</span>
              <span className={styles.statLabel}>Rating</span>
            </div>
            <div className={styles.statDivider} />
            <div className={styles.statItem}>
              <span className={styles.statNum}>₱{earnings}</span>
              <span className={styles.statLabel}>Kita</span>
            </div>
          </div>

          <div className={styles.toggleSection}>
            <div className={styles.toggleInfo}>
              <p className={styles.toggleTitle}>
                {online ? 'Handa kang tumanggap ng biyahe!' : 'I-on para makatanggap ng biyahe'}
              </p>
              <p className={styles.toggleSub}>
                {online ? 'Naghahanap ng pasahero…' : 'Pindutin ang pindutan para magsimula'}
              </p>
            </div>
            <button
              className={`${styles.toggleBtn} ${online ? styles.toggleOn : styles.toggleOff}`}
              onClick={toggleOnline}
            >
              {online ? 'ONLINE' : 'OFFLINE'}
            </button>
          </div>

          {/* Find Passenger Button */}
          {online && activeState === 'idle' && (
            <div className={styles.findPassengerWrap}>
              <button className={styles.findPassengerBtn} onClick={handleFindPassenger}>
                🔍 Maghanap ng Pasahero
              </button>
            </div>
          )}

          {/* Searching state */}
          {online && activeState === 'searching' && (
            <div className={styles.searchingWrap}>
              <div className={styles.searchingInner}>
                <div className={styles.searchSpinner}>🛺</div>
                <div className={styles.searchText}>
                  <span className={styles.searchTitle}>Naghahanap ng pasahero…</span>
                  <span className={styles.searchSub}>{searchSeconds}s na naghahanap</span>
                </div>
                <button className={styles.stopSearchBtn} onClick={handleStopSearch}>✕</button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Cancelled banner */}
      {activeState === 'cancelled' && (
        <div className={styles.cancelledBanner}>✕ Nakanselang biyahe</div>
      )}

      {/* Bottom action during navigation */}
      {isNavigating && acceptedRide && !showChat && (
        <div className={styles.navActions}>
          {activeState === 'navigating_pickup' ? (
            <>
              <button className={styles.cancelRideBtn} onClick={handleCancelRide}>✕ Kanselahin</button>
              <button className={styles.arrivedBtn} onClick={handlePickedUp}>
                ✓ Na-pick up na si {acceptedRide.passengerName.split(' ')[0]}
              </button>
            </>
          ) : (
            <>
              <button className={styles.cancelRideBtn} onClick={handleCancelRide}>✕ Kanselahin</button>
              <button className={styles.arrivedBtn} onClick={handleArrived}>
                🏁 Nakarating na sa destinasyon
              </button>
            </>
          )}
        </div>
      )}

      {/* Ride requests overlay */}
      {requests.length > 0 && activeState === 'idle' && (
        <div className={styles.requestOverlay}>
          <div className={styles.requestCard}>
            <div className={styles.requestHeader}>
              <span className={styles.newRide}>MGA ALOK NG PASAHERO 🔔</span>
              <span className={styles.countdown}>{countdown}s</span>
            </div>
            <div className={styles.requestList}>
              {requests.map(r => (
                <div key={r.id} className={styles.requestItem}>
                  <div className={styles.reqPassenger}>
                    <div className={styles.passengerAvatar}>{r.initial}</div>
                    <div className={styles.reqInfo}>
                      <span className={styles.passengerName}>{r.passengerName}</span>
                      <span className={styles.passengerDist}>{r.distM}m · {r.distanceKm}km biyahe</span>
                    </div>
                    <div className={styles.reqFareWrap}>
                      <span className={styles.reqFareLabel}>Alok</span>
                      <span className={styles.reqFare}>₱{r.offeredFare}</span>
                    </div>
                  </div>
                  <div className={styles.reqRoute}>
                    <span className={styles.greenDot} />
                    <span>Pickup: {r.distM}m mula sa iyo</span>
                    <span className={styles.routeArrow}>→</span>
                    <span className={styles.redDot} />
                    <span>{r.destination}</span>
                  </div>
                  <div className={styles.reqActions}>
                    <button className={styles.declineBtn} onClick={() => handleDecline(r.id)}>Tanggihan</button>
                    <button className={styles.acceptBtn} onClick={() => handleAccept(r)}>✓ Tanggapin</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Bottom nav — hidden during navigation */}
      {!isNavigating && (
        <div className={styles.bottomNav}>
          <button className={styles.navItem} onClick={() => navigate('home')}>
            <span>🏠</span><span>Home</span>
          </button>
          <button className={styles.navItem}>
            <span>🕐</span><span>Kasaysayan</span>
          </button>
          <button className={styles.navItem}>
            <span>💰</span><span>Kita</span>
          </button>
          <button className={styles.navItem} onClick={() => navigate('profile')}>
            <span>👤</span><span>Profile</span>
          </button>
        </div>
      )}
    </div>
  )
}

export default DriverModeScreen