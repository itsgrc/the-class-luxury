// src/components/WeatherWidget.tsx
import { useEffect, useState } from 'react'
import { Cloud, Sun, CloudRain, Wind } from 'lucide-react'

interface WeatherDay {
  date: string
  maxC: number
  minC: number
  desc: string
  icon: 'sun' | 'cloud' | 'rain' | 'wind'
}

interface WttrHourly {
  weatherDesc: Array<{ value: string }>
  windspeedKmph: string
}

interface WttrDay {
  date: string
  maxtempC: string
  mintempC: string
  hourly: WttrHourly[]
}

interface Props {
  location: string
}

// Parse wttr.in JSON response
async function fetchWeather(location: string): Promise<WeatherDay[]> {
  const loc = encodeURIComponent(location.split(',')[0].trim())
  const res = await fetch(`https://wttr.in/${loc}?format=j1`)
  if (!res.ok) throw new Error('weather fetch failed')
  const data = await res.json() as { weather: WttrDay[] }
  return data.weather.slice(0, 3).map((d: WttrDay) => {
    const desc = d.hourly[4]?.weatherDesc?.[0]?.value ?? ''
    const icon: WeatherDay['icon'] =
      /rain|drizzle|shower/i.test(desc) ? 'rain' :
      /cloud|overcast/i.test(desc) ? 'cloud' :
      /wind/i.test(desc) ? 'wind' : 'sun'
    return {
      date: d.date,
      maxC: parseInt(d.maxtempC),
      minC: parseInt(d.mintempC),
      desc,
      icon,
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
