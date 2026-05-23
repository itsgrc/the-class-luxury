export interface Inspiration {
  title: string
  image: string
  description: string
  category: string
}

export const inspirations: Inspiration[] = [
  { title: 'Weekend da sogno a Portofino', image: 'https://images.unsplash.com/photo-1567899378494-47b22a2ae96a?w=800&q=80', description: 'Yacht e cena stellata sul mare', category: 'Yacht' },
  { title: 'Jet privato per Ibiza', image: 'https://images.unsplash.com/photo-1540962351504-5bdd6d022c7f?w=800&q=80', description: 'Partenza da Milano, arrivo in paradiso', category: 'Jet' },
  { title: 'Villa esclusiva in Toscana', image: 'https://images.unsplash.com/photo-1613977257363-707ba9348227?w=800&q=80', description: 'Piscina, cantina privata, butler', category: 'Villa' },
  { title: 'Supercar per il weekend', image: 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=800&q=80', description: 'Ferrari o Lamborghini a scelta', category: 'Auto' },
]
