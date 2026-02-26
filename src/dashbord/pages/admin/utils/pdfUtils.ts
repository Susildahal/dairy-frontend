import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import DateConverter from '@remotemerge/nepali-date-converter'
import { smartRenderText, preloadNepaliFonts } from './nepaliFont'

// ─── BS Date helpers using @remotemerge/nepali-date-converter ────────────────

/** Format a JS Date as "DD/MM/YYYY BS" using English digits — safe for jsPDF */
export const formatBsDateEn = (adDate: Date): string => {
  try {
    const y = adDate.getFullYear()
    const m = String(adDate.getMonth() + 1).padStart(2, '0')
    const d = String(adDate.getDate()).padStart(2, '0')
    const bs = new DateConverter(`${y}-${m}-${d}`).toBs()
    return `${bs.date}/${bs.month}/${bs.year} BS`
  } catch {
    return adDate.toLocaleDateString('en-GB')
  }
}

/** Format today's date as "DD/MM/YYYY BS" */
export const todayBsString = (): string => formatBsDateEn(new Date())

// Nepali number formatter with English fallback
export const toNepaliNumber = (num: number | null | undefined): string => {
  if (num === null || num === undefined) return '0'
  try {
    const formattedNum = typeof num === 'number' ? num.toFixed(2) : String(num)
    const d = ['०','१','२','३','४','५','६','७','८','९']
    return formattedNum.replace(/\d/g, (digit) => d[parseInt(digit)] || digit)
  } catch {
    return typeof num === 'number' ? num.toFixed(2) : String(num)
  }
}

// ─── Single-User Monthly PDF ──────────────────────────────────────────────────
export const generateUserMonthlyPDF = async (userData: any[], userName: string, monthDetails: any) => {
  if (!userData || userData.length === 0) { alert('No data available'); return }

  await preloadNepaliFonts()

  const doc = new jsPDF('p', 'mm', 'a4')
  const pageWidth  = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()

  try {
    // ── Title ─────────────────────────────────────────────────────
    doc.setFontSize(16)
    doc.setFont('helvetica', 'bold')
    doc.text('Monthly Milk Collection Report', pageWidth / 2, 15, { align: 'center' })

    // Green underline
    doc.setDrawColor(34, 197, 94)
    doc.setLineWidth(0.5)
    doc.line(15, 19, pageWidth - 15, 19)

    // ── Info block  (each row is 9 mm apart – no merging) ─────────
    // "User:" label in bold, actual name rendered via canvas for Nepali support
    doc.setFontSize(10)
    doc.setFont('helvetica', 'bold')
    doc.text('User:',      15, 28)
    doc.text('Month:',     15, 37)
    doc.text('Generated:', 15, 46)

    doc.setFont('helvetica', 'normal')
    // user name – may be Nepali
    smartRenderText(doc, userName, 38, 28, { fontSize: 10 })
    // month – may be Nepali
    smartRenderText(doc, `${monthDetails?.month || ''} ${monthDetails?.year || ''}`, 38, 37, { fontSize: 10 })
    // generated date in BS
    doc.text(
      `${todayBsString()}  (${new Date().toLocaleDateString('en-GB')})`,
      38, 46
    )

    // Second divider
    doc.setDrawColor(200, 200, 200)
    doc.setLineWidth(0.2)
    doc.line(15, 51, pageWidth - 15, 51)

    // ── Table ─────────────────────────────────────────────────────
    const tableData = userData.map((entry: any, idx: number) => [
      `${idx + 1}`,                                            // # index
      formatBsDateEn(new Date(entry.createdAt)),               // BS date with English digits
      entry.session === 'morning' ? 'Morning' : 'Evening',    // session in English
      (parseFloat(entry.todaymilk)  || 0).toFixed(2),
      `${(parseFloat(entry.todayfit)  || 0).toFixed(2)}%`,
      `Rs.${(parseFloat(entry.todaymoney) || 0).toFixed(2)}`,
    ])

    const totalMilk  = userData.reduce((s, e) => s + (parseFloat(e.todaymilk)  || 0), 0)
    const totalMoney = userData.reduce((s, e) => s + (parseFloat(e.todaymoney) || 0), 0)
    const avgFat     = userData.length ? userData.reduce((s, e) => s + (parseFloat(e.todayfit)  || 0), 0) / userData.length : 0

    autoTable(doc, {
      head: [['#', 'Date (BS)', 'Session', 'Milk (L)', 'Fat %', 'Amount (Rs)']],
      body: tableData,
      foot: [['', '', 'TOTAL', `${totalMilk.toFixed(2)} L`, `${avgFat.toFixed(2)}%`, `Rs.${totalMoney.toFixed(2)}`]],
      startY: 54,
      styles:     { fontSize: 8, cellPadding: 2, lineColor: [200,200,200], lineWidth: 0.1 },
      headStyles: { fillColor: [34,197,94], textColor: 255, fontStyle: 'bold', fontSize: 8 },
      footStyles: { fillColor: [34,197,94], textColor: 255, fontStyle: 'bold', fontSize: 8, halign: 'right' },
      alternateRowStyles: { fillColor: [249,250,251] },
      margin: { left: 15, right: 15 },
      columnStyles: {
        0: { cellWidth: 10, halign: 'center' },
        1: { cellWidth: 38, halign: 'center' },
        2: { cellWidth: 22, halign: 'center' },
        3: { cellWidth: 26, halign: 'right'  },
        4: { cellWidth: 24, halign: 'right'  },
        5: { cellWidth: 31, halign: 'right'  },
      },
      rowPageBreak: 'avoid',
      showHead: 'everyPage',
      showFoot: 'lastPage',
    })

    // ── Summary ───────────────────────────────────────────────────
    const finalY = (doc as any).lastAutoTable.finalY || 150

    doc.setDrawColor(34,197,94); doc.setLineWidth(0.3)
    doc.line(15, finalY + 5, pageWidth - 15, finalY + 5)

    doc.setFontSize(11); doc.setFont('helvetica', 'bold')
    doc.text('Summary', 15, finalY + 13)

    doc.setFontSize(9); doc.setFont('helvetica', 'normal')
    doc.text(`Total Milk  : ${totalMilk.toFixed(2)} L`,        15, finalY + 21)
    doc.text(`Total Amount: Rs. ${totalMoney.toFixed(2)}`,      15, finalY + 28)
    doc.text(`Avg Fat     : ${avgFat.toFixed(2)} %`,            15, finalY + 35)
    doc.text(`Total Days  : ${userData.length}`,                15, finalY + 42)

    // ── Footer ────────────────────────────────────────────────────
    doc.setFontSize(7); doc.setFont('helvetica', 'italic'); doc.setTextColor(140,140,140)
    doc.text('Dairy Management System', pageWidth / 2, pageHeight - 7, { align: 'center' })
    doc.setTextColor(0,0,0)

  } catch (err) {
    console.error('PDF error:', err)
    alert('Error generating PDF.')
    doc.setFontSize(14)
    doc.text('Milk Report', 15, 15)
    doc.setFontSize(10)
    smartRenderText(doc, `User: ${userName}`, 15, 25, { fontSize: 10 })
    doc.text(`Month: ${monthDetails?.month || ''} ${monthDetails?.year || ''}`, 100, 25)
    autoTable(doc, {
      head: [['#', 'Date (BS)', 'Milk(L)', 'Amount(Rs)']],
      body: userData.map((e, i) => [
        `${i+1}`,
        formatBsDateEn(new Date(e.createdAt)),
        `${(parseFloat(e.todaymilk)  || 0).toFixed(2)}`,
        `${(parseFloat(e.todaymoney) || 0).toFixed(2)}`,
      ]),
      startY: 35, styles: { fontSize: 8, cellPadding: 1.5 },
    })
  }

  const safeUser = userName.replace(/[^\w\s-]/g, '').trim() || userName.substring(0, 20) || 'User'
  const safeMonth = (monthDetails?.month || 'Month').replace(/[^\w\s-]/g, '').trim() || monthDetails?.month || 'Month'
  doc.save(`${safeUser}_${safeMonth}_${monthDetails?.year || 'Year'}.pdf`)
}

// ─── All-Users Monthly PDF ────────────────────────────────────────────────────
export const generateAllUsersPDF = async (allUsersData: any[], monthDetails: any) => {
  if (!allUsersData || allUsersData.length === 0) { alert('No data available'); return }

  await preloadNepaliFonts()

  const doc = new jsPDF('p', 'mm', 'a4')
  const pageWidth = doc.internal.pageSize.getWidth()

  try {
    // ── Title ─────────────────────────────────────────────────────
    doc.setFontSize(14); doc.setFont('helvetica', 'bold')
    doc.text('All Users Monthly Report', pageWidth / 2, 13, { align: 'center' })

    doc.setDrawColor(59,130,246); doc.setLineWidth(0.4)
    doc.line(15, 17, pageWidth - 15, 17)

    doc.setFontSize(9); doc.setFont('helvetica', 'normal')
    doc.text(
      `${monthDetails?.month || ''} ${monthDetails?.year || ''}  |  Generated: ${todayBsString()}`,
      pageWidth / 2, 24, { align: 'center' }
    )

    doc.setDrawColor(200,200,200); doc.setLineWidth(0.2)
    doc.line(15, 27, pageWidth - 15, 27)

    // ── Group by user ─────────────────────────────────────────────
    const userGroups = allUsersData.reduce((groups: any, entry: any) => {
      const uid = entry.userid
      if (!groups[uid]) groups[uid] = { userName: entry.user?.name || 'Unknown', totalMilk: 0, totalMoney: 0, dayCount: 0 }
      groups[uid].totalMilk  += parseFloat(entry.todaymilk)  || 0
      groups[uid].totalMoney += parseFloat(entry.todaymoney) || 0
      groups[uid].dayCount   += 1
      return groups
    }, {})

    const groupList        = Object.values(userGroups) as any[]
    const originalNames   = groupList.map((g: any) => g.userName)

    // compute totals before table (needed by foot row)
    const totMilkFoot  = groupList.reduce((s, g) => s + g.totalMilk,  0)
    const totMoneyFoot = groupList.reduce((s, g) => s + g.totalMoney, 0)

    const summaryData = groupList.map((g: any, i: number) => [
      `${i + 1}`,
      g.userName.length > 20 ? g.userName.substring(0, 20) + '…' : g.userName,
      `${g.totalMilk.toFixed(2)}`,
      `${g.totalMoney.toFixed(0)}`,
      `${g.dayCount}`,
    ])

    autoTable(doc, {
      head: [['#', 'Name', 'Milk (L)', 'Amount (Rs)', 'Days']],
      body: summaryData,
      foot: [['', 'TOTAL', `${totMilkFoot.toFixed(2)} L`, `Rs.${totMoneyFoot.toFixed(2)}`, `${groupList.length}`]],
      startY: 30,
      styles:     { fontSize: 7, cellPadding: 1, lineColor: [180,180,180], lineWidth: 0.1, halign: 'center' },
      headStyles: { fillColor: [59,130,246], textColor: 255, fontStyle: 'bold', fontSize: 7, cellPadding: 1.2 },
      footStyles: { fillColor: [59,130,246], textColor: 255, fontStyle: 'bold', fontSize: 7, halign: 'right' },
      alternateRowStyles: { fillColor: [248,249,250] },
      margin: { left: 10, right: 10 },
      columnStyles: {
        0: { cellWidth: 10 },
        1: { cellWidth: 65, halign: 'left' },
        2: { cellWidth: 28, halign: 'right' },
        3: { cellWidth: 30, halign: 'right' },
        4: { cellWidth: 18 },
      },
      rowPageBreak: 'avoid',
      showHead: 'everyPage',
      showFoot: 'lastPage',
      willDrawCell: (data) => {
        if (data.column.index === 1 && data.section === 'body') {
          const name = originalNames[data.row.index]
          if (name && /[\u0900-\u097F]/.test(name)) data.cell.text = []
        }
      },
      didDrawCell: (data) => {
        if (data.column.index === 1 && data.section === 'body') {
          const name = originalNames[data.row.index]
          if (name && /[\u0900-\u097F]/.test(name)) {
            const display = name.length > 20 ? name.substring(0, 20) + '…' : name
            smartRenderText(doc, display, data.cell.x + 2, data.cell.y + data.cell.height / 2 + 1, { fontSize: 7, align: 'left' })
          }
        }
      },
    })

    // ── Totals ────────────────────────────────────────────────────
    const finalY = (doc as any).lastAutoTable.finalY || 150

    doc.setDrawColor(59,130,246); doc.setLineWidth(0.3)
    doc.line(10, finalY + 5, pageWidth - 10, finalY + 5)

    doc.setFontSize(9); doc.setFont('helvetica', 'bold')
    doc.text(
      `Total: Milk ${totMilkFoot.toFixed(2)} L  |  Amount Rs. ${totMoneyFoot.toFixed(0)}  |  ${groupList.length} Users`,
      pageWidth / 2, finalY + 12, { align: 'center' }
    )

    doc.setFontSize(7); doc.setFont('helvetica', 'italic'); doc.setTextColor(140,140,140)
    doc.text('Dairy Management System', pageWidth / 2, doc.internal.pageSize.getHeight() - 7, { align: 'center' })
    doc.setTextColor(0,0,0)

  } catch (err) {
    console.error('PDF error:', err)
    alert('Error generating PDF.')
    doc.setFontSize(12); doc.text('All Users – Error Mode', 15, 15)
    doc.setFontSize(9);  doc.text(`${monthDetails?.month || ''} ${monthDetails?.year || ''}`, 15, 25)
    const names = Array.from(new Set(allUsersData.map(e => e.user?.name || 'Unknown'))).sort() as string[]
    let y = 40
    names.forEach((n, i) => { doc.setFontSize(8); doc.text(`${i+1}. ${n.substring(0,25)}`, 15, y); y += 6 })
  }

  doc.save(`AllUsers_${monthDetails?.month || 'M'}_${monthDetails?.year || 'Y'}.pdf`)
}
