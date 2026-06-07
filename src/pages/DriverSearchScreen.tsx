import React, { useState, useEffect } from 'react'
import { Screen } from '../App'
import styles from './DriverSearchScreen.module.css'

interface Props { navigate: (s: Screen) => void }

interface OfferData {
  fare: number
  destination: string
  distanceKm: string
}

interface DriverOffer {
  id: number
  name: string
  initial: string
  rating: number
  plate: string
  distM: number
  price: number
  eta: number
}

function makeDrivers(passengerFare: number): DriverOffer[] {
  return [
    { id: 1, name: 'Mang Mario Santos',  initial: 'M', rating: 4.9, plate: 'ABC 1234', distM: 180, price: passengerFare,      eta: 3 },
    { id: 2, name: 'Kuya Rene Dela Cruz', initial: 'R', rating: 4.7, plate: 'XYZ 5678', distM: 320, price: passengerFare - 5,  eta: 5 },
    { id: 3, name: 'Manong Ben Flores',   initial: 'B', rating: 4.8, plate: 'DEF 9012', distM: 450, price: passengerFare + 5,  eta: 7 },
  ].map(d => ({ ...d, price: Math.max(15, d.price) }))
}

type BookingState = 'searching' | 'offers' | 'accepted' | 'cancelled'

const DriverSearchScreen: React.FC<Props> = ({ navigate }) => {
  const [bookingState, setBookingState] = useState<BookingState>('searching')
  const [seconds, setSeconds] = useState(0)
  const [offerData, setOfferData] = useState<OfferData>({ fare: 30, destination: 'Destinasyon', distanceKm: '?' })
  const [drivers, setDrivers] = useState<DriverOffer[]>([])
  const [acceptedDriver, setAcceptedDriver] = useState<DriverOffer | null>(null)

  useEffect(() => {
    const raw = sessionStorage.getItem('tricycall_offer')
    if (raw) {
      const data: OfferData = JSON.parse(raw)
      setOfferData(data)
      setDrivers(makeDrivers(data.fare))
    } else {
      setDrivers(makeDrivers(30))
    }
  }, [])

  useEffect(() => {
    if (bookingState !== 'searching') return
    const interval = setInterval(() => setSeconds(s => s + 1), 1000)
    const timer = setTimeout(() => setBookingState('offers'), 4000)
    return () => { clearInterval(interval); clearTimeout(timer) }
  }, [bookingState])

  const handleAccept = (driver: DriverOffer) => {
    setAcceptedDriver(driver)
    setBookingState('accepted')
  }

  const handleCancel = () => {
    setBookingState('cancelled')
    setTimeout(() => navigate('home'), 1500)
  }

  return (
    <div className={styles.container}>

      {/* Searching state */}
      {bookingState === 'searching' && (
        <>
          <button className={styles.cancelBtn} onClick={handleCancel}>✕ Kanselahin</button>
          <div className={styles.content}>
            <div className={styles.pulseWrap}>
              <div className={styles.pulse3} /><div className={styles.pulse2} /><div className={styles.pulse1} />
              <div className={styles.centerIcon}>🛺</div>
            </div>
            <h2 className={styles.statusTitle}>Naghahanap ng Driver…</h2>
            <p className={styles.statusSub}>Ipinapadala ang iyong alok na ₱{offerData.fare} sa mga driver</p>
            <div className={styles.timerBadge}>
              <span className={styles.timerDot} />
              <span>{seconds}s na naghahanap</span>
            </div>
          </div>
        </>
      )}

      {/* Offers state */}
      {bookingState === 'offers' && (
        <div className={styles.offersContainer}>
          <div className={styles.offersHeader}>
            <button className={styles.backBtn} onClick={handleCancel}>←</button>
            <div>
              <h2 className={styles.offersTitle}>Mga Nag-respond na Driver</h2>
              <p className={styles.offersSub}>
                🏁 {offerData.destination} · {offerData.distanceKm} km · Iyong alok: ₱{offerData.fare}
              </p>
            </div>
          </div>

          <div className={styles.driverList}>
            {drivers.map(driver => (
              <div key={driver.id} className={styles.driverCard}>
                <div className={styles.driverTop}>
                  <div className={styles.driverAvatar}>{driver.initial}</div>
                  <div className={styles.driverInfo}>
                    <span className={styles.driverName}>{driver.name}</span>
                    <div className={styles.driverMeta}>
                      <span>⭐ {driver.rating}</span>
                      <span className={styles.metaDot}>·</span>
                      <span className={styles.plate}>{driver.plate}</span>
                      <span className={styles.metaDot}>·</span>
                      <span>{driver.distM}m</span>
                    </div>
                  </div>
                  <div className={styles.driverEta}>
                    <span className={styles.etaNum}>{driver.eta}</span>
                    <span className={styles.etaLabel}>min</span>
                  </div>
                </div>

                <div className={styles.driverBottom}>
                  <div className={styles.priceWrap}>
                    <span className={styles.priceLabel}>Presyo ng Driver</span>
                    <span className={`${styles.priceAmt} ${driver.price < offerData.fare ? styles.priceLower : driver.price > offerData.fare ? styles.priceHigher : styles.priceEqual}`}>
                      ₱{driver.price}
                    </span>
                    {driver.price < offerData.fare && <span className={styles.priceBadge} style={{background:'#D1FAE5',color:'#065F46'}}>Mas mura!</span>}
                    {driver.price > offerData.fare && <span className={styles.priceBadge} style={{background:'#FEE2E2',color:'#991B1B'}}>Counter offer</span>}
                    {driver.price === offerData.fare && <span className={styles.priceBadge} style={{background:'#EDE9FE',color:'#5B21B6'}}>Sang-ayon</span>}
                  </div>
                  <button className={styles.acceptBtn} onClick={() => handleAccept(driver)}>
                    ✓ Tanggapin
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Accepted state */}
      {bookingState === 'accepted' && acceptedDriver && (
        <div className={styles.content}>
          <div className={styles.acceptedCard}>
            <div className={styles.acceptedHeader}>
              <span className={styles.acceptedCheck}>✓</span>
              <h2 className={styles.acceptedTitle}>Na-book na!</h2>
            </div>

            <div className={styles.driverCardMini}>
              <div className={styles.driverAvatar}>{acceptedDriver.initial}</div>
              <div className={styles.driverInfo}>
                <span className={styles.driverName}>{acceptedDriver.name}</span>
                <div className={styles.driverMeta}>
                  <span>⭐ {acceptedDriver.rating}</span>
                  <span className={styles.metaDot}>·</span>
                  <span className={styles.plate}>{acceptedDriver.plate}</span>
                </div>
              </div>
              <div className={styles.driverEta}>
                <span className={styles.etaNum}>{acceptedDriver.eta}</span>
                <span className={styles.etaLabel}>min</span>
              </div>
            </div>

            <div className={styles.rideDetails}>
              <div className={styles.rideRow}>
                <span className={styles.rideLabel}>🏁 Destinasyon</span>
                <span className={styles.rideValue}>{offerData.destination}</span>
              </div>
              <div className={styles.rideRow}>
                <span className={styles.rideLabel}>📏 Distansya</span>
                <span className={styles.rideValue}>{offerData.distanceKm} km</span>
              </div>
              <div className={styles.rideRow}>
                <span className={styles.rideLabel}>💵 Napagkasunduan</span>
                <span className={styles.rideFare}>₱{acceptedDriver.price}</span>
              </div>
            </div>

            <div className={styles.actionRow}>
              <button className={styles.callBtn}>📞 Tawagan</button>
              <button className={styles.chatBtn}>💬 I-message</button>
            </div>

            <button className={styles.cancelAcceptedBtn} onClick={handleCancel}>
              ✕ Kanselahin ang Biyahe
            </button>
          </div>
        </div>
      )}

      {/* Cancelled state */}
      {bookingState === 'cancelled' && (
        <div className={styles.content}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 52 }}>😔</div>
            <h2 className={styles.statusTitle}>Nakanselang Biyahe</h2>
            <p className={styles.statusSub}>Babalik sa Home…</p>
          </div>
        </div>
      )}
    </div>
  )
}

export default DriverSearchScreen