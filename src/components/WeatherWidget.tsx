import { useEffect, useState } from 'react'
import { Cloud, Sun, CloudRain, Wind } from 'lucide-react'

interface WeatherDay {
  date: string
  maxC: number
  minC: number
  desc: string
  icon: 'sun' | 'cloud' | 'rain' | 'wind'
}

interface Props {
  location: string
}

// WMO weather code → icon
function wmoIcon(code: number): WeatherDay['icon'] {
  if (code === 0 || code === 1) return 'sun'
  if (code >= 61 && code <= 67) return 'rain'
  if (code >= 80 && code <= 82) return 'rain'
  if (code >= 95) return 'rain'
  if (code >= 51 && code <= 57) return 'rain'
  if (code === 3 || (code >= 45 && code <= 48)) return 'cloud'
  if (code === 2) return 'cloud'
  return 'sun'
}

// WMO code → Italian description
function wmoDesc(code: number): string {
  if (code === 0) return 'Soleggiato'
  if (code === 1) return 'Prevalentemente sereno'
  if (code === 2) return 'Parzialmente nuvoloso'
  if (code === 3) return 'Nuvoloso'
  if (code >= 51 && code <= 57) return 'Pioggerella'
  if (code >= 61 && code <= 67) return 'Pioggia'
  if (code >= 71 && code <= 77) return 'Neve'
  if (code >= 80 && code <= 82) return 'Acquazzoni'
  if (code >= 95) return 'Temporale'
  return 'Variabile'
}

async function fetchWeather(location: string): Promise<WeatherDay[]> {
  const name = encodeURIComponent(location.split(',')[0].trim())
  const geoRes = await fetch(
    `https://geocoding-api.open-meteo.com/v1/search?name=${name}&count=1&language=it&format=json`
  )
  if (!geoRes.ok) throw new Error('geocoding failed')
  const geoData = await geoRes.json() as { results?: Array<{ latitude: number; longitude: number }> }
  const coords = geoData.results?.[0]
  if (!coords) throw new Error('location not found')

  const wxRes = await fetch(
    `https://api.open-meteo.com/v1/forecast?latitude=${coords.latitude}&longitude=${coords.longitude}` +
    `&daily=temperature_2m_max,temperature_2m_min,weathercode&forecast_days=3&timezone=auto`
  )
  if (!wxRes.ok) throw new Error('weather fetch failed')
  const wxData = await wxRes.json() as {
    daily: {
      time: string[]
      temperature_2m_max: number[]
      temperature_2m_min: number[]
      weathercode: number[]
    }
  }

  return wxData.daily.time.map((date, i) => {
    const code = wxData.daily.weathercode[i]
    return {
      date,
      maxC: Math.round(wxData.daily.temperature_2m_max[i]),
      minC: Math.round(wxData.daily.temperature_2m_min[i]),
      desc: wmoDesc(code),
      icon: wmoIcon(code),
    }
  })
}

const ICON_MAP = { sun: Sun, cloud: Cloud, rain: CloudRain, wind: Wind }

export function WeatherWidget({ location }: Props) {
  const [days, setDays] = useState<WeatherDay[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    fetchWeather(location)
      .then(setDays)
      .catch(() => setDays([]))
      .finally(() => setLoading(false))
  }, [location])

  if (loading) {
    return (
      <div className="flex gap-2">
        {[0, 1, 2].map(i => (
          <div key={i} className="skeleton h-16 flex-1 rounded-xl" />
        ))}
      </div>
    )
  }

  if (days.length === 0) return null

  return (
    <div>
      <p className="text-[10px] text-[#5A4F44] uppercase tracking-wider mb-2">Meteo prossimi 3 giorni</p>
      <div className="flex gap-2">
        {days.map(d => {
          const Icon = ICON_MAP[d.icon]
          return (
            <div key={d.date} className="flex-1 bg-[#FCFAF5] border border-[rgba(197,160,89,0.15)] rounded-xl p-3 text-center">
              <p className="text-[10px] text-[#5A4F44] mb-1.5">
                {new Date(d.date).toLocaleDateString('it-IT', { weekday: 'short' })}
              </p>
              <Icon size={16} className="text-[#C5A059] mx-auto mb-1.5" />
              <p className="font-[family-name:var(--font-family-mono)] text-sm text-[#1C1C1C]">{d.maxC}°</p>
              <p className="text-[10px] text-[#5A4F44]">{d.minC}°</p>
            </div>
          )
        })}
      </div>
    </div>
  )
}
