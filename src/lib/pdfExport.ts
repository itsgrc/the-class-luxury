export interface QuotePDFParams {
  requestId: string
  clientName: string
  listingTitle: string
  location: string
  from?: string
  to?: string
  nights?: number
  basePrice: number
  upgradeItems: Array<{ name: string; price: number }>
  discount: number
  discountLabel: string
  total: number
}

export async function generateQuotePDF(p: QuotePDFParams): Promise<void> {
  const { default: jsPDF } = await import('jspdf')
  const doc = new jsPDF({ orientation: 'portrait', format: 'a4' })
  const W = doc.internal.pageSize.getWidth()
  const GOLD: [number, number, number] = [197, 160, 89]
  const DARK: [number, number, number] = [28, 28, 28]
  const TAUPE: [number, number, number] = [90, 79, 68]
  const LIGHT: [number, number, number] = [252, 250, 245]

  // Gold header
  doc.setFillColor(...GOLD)
  doc.rect(0, 0, W, 14, 'F')
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(14)
  doc.setTextColor(255, 255, 255)
  doc.text('the Class', 14, 9.5)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.text('L\'arte del viaggio senza confini', W - 14, 9.5, { align: 'right' })

  // Title
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(20)
  doc.setTextColor(...DARK)
  doc.text('Preventivo Esclusivo', 14, 28)

  // Listing title + location
  doc.setFont('helvetica', 'italic')
  doc.setFontSize(11)
  doc.setTextColor(...TAUPE)
  doc.text(p.listingTitle, 14, 36)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.text(p.location, 14, 42)

  // Gold divider
  doc.setDrawColor(...GOLD)
  doc.setLineWidth(0.4)
  doc.line(14, 46, W - 14, 46)

  // Client + request ID
  let y = 54
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(8)
  doc.setTextColor(...TAUPE)
  doc.text('CLIENTE', 14, y)
  doc.text('ID PREVENTIVO', W / 2 + 10, y)
  doc.text('DATA', W - 50, y)

  y += 5
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  doc.setTextColor(...DARK)
  doc.text(p.clientName, 14, y)
  doc.text(p.requestId, W / 2 + 10, y)
  doc.text(new Date().toLocaleDateString('it-IT'), W - 50, y)

  y += 10

  // Period
  if (p.from || p.to) {
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(8)
    doc.setTextColor(...TAUPE)
    doc.text('PERIODO', 14, y)
    y += 5
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(10)
    doc.setTextColor(...DARK)
    const period = [p.from, p.to].filter(Boolean).join(' → ')
    doc.text(`${period}${p.nights ? ` (${p.nights} notti)` : ''}`, 14, y)
    y += 8
  }

  y += 4
  // Table header
  doc.setFillColor(...LIGHT)
  doc.rect(14, y - 4, W - 28, 9, 'F')
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(8)
  doc.setTextColor(...TAUPE)
  doc.text('VOCE', 17, y + 1)
  doc.text('IMPORTO', W - 20, y + 1, { align: 'right' })
  y += 10

  // Rows
  const row = (label: string, amount: number, color: [number, number, number] = DARK) => {
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(10)
    doc.setTextColor(...color)
    doc.text(label, 17, y)
    doc.text(`€${amount.toLocaleString('it-IT')}`, W - 20, y, { align: 'right' })
    y += 7
  }

  row('Prezzo base', p.basePrice)
  p.upgradeItems.forEach(u => row(`+ ${u.name}`, u.price, TAUPE))
  if (p.discount > 0) {
    doc.setFont('helvetica', 'italic')
    doc.setFontSize(9)
    doc.setTextColor(52, 168, 83)
    doc.text(p.discountLabel, 17, y)
    doc.text(`-${(p.discount * 100).toFixed(0)}%`, W - 20, y, { align: 'right' })
    y += 7
  }

  // Total
  doc.setDrawColor(...GOLD)
  doc.setLineWidth(0.3)
  doc.line(14, y, W - 14, y)
  y += 7
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(13)
  doc.setTextColor(...GOLD)
  doc.text('TOTALE STIMATO', 17, y)
  doc.text(`€${p.total.toLocaleString('it-IT')}`, W - 20, y, { align: 'right' })

  // Footer
  const FY = doc.internal.pageSize.getHeight() - 18
  doc.setDrawColor(220, 215, 208)
  doc.setLineWidth(0.2)
  doc.line(14, FY - 4, W - 14, FY - 4)
  doc.setFont('helvetica', 'italic')
  doc.setFontSize(7.5)
  doc.setTextColor(180, 175, 168)
  doc.text('the Class S.r.l. – Preventivo non vincolante. Prezzi indicativi, soggetti a disponibilità.', 14, FY)
  doc.text(`Generato il ${new Date().toLocaleString('it-IT')}`, W - 14, FY, { align: 'right' })

  doc.save(`preventivo_${p.requestId}.pdf`)
}
