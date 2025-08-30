'use client'
import { useEffect, useState } from 'react'

export default function CookieConsent() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const s = localStorage.getItem('cookie-consent-v1')
    if (!s) setVisible(true)
  }, [])

  const updateConsent = (allowAnalytics: boolean, allowAds: boolean) => {
    const consent = {
      ad_storage: allowAds ? 'granted' : 'denied',
      ad_user_data: allowAds ? 'granted' : 'denied',
      ad_personalization: allowAds ? 'granted' : 'denied',
      analytics_storage: allowAnalytics ? 'granted' : 'denied',
      functionality_storage: 'granted',
      security_storage: 'granted'
    }
    // @ts-ignore
    window.gtag?.('consent', 'update', consent)
    localStorage.setItem('cookie-consent-v1', JSON.stringify(consent))
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div className="fixed inset-x-0 bottom-0 z-50">
      <div className="mx-auto max-w-4xl m-4 p-4 rounded-2xl border bg-white shadow">
        <p className="text-sm text-gray-700">
          Używamy plików cookie do funkcji serwisu i analityki. Możesz zaakceptować wszystkie albo wybrać tylko niezbędne.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <button className="btn" onClick={()=>updateConsent(false,false)}>Tylko niezbędne</button>
          <button className="btn" onClick={()=>updateConsent(true,false)}>Zgoda na analitykę</button>
          <button className="btn btn-primary" onClick={()=>updateConsent(true,true)}>Akceptuję wszystko</button>
        </div>
      </div>
    </div>
  )
}
