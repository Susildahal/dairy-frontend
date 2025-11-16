import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'



// Nepali number formatter with English fallback
export const toNepaliNumber = (num: number | null | undefined): string => {
  if (num === null || num === undefined) return '0'
  
  try {
    const formattedNum = typeof num === 'number' ? num.toFixed(2) : String(num)
    const nepaliDigits = ['०', '१', '२', '३', '४', '५', '६', '७', '८', '९']
    return formattedNum.replace(/\d/g, (digit) => nepaliDigits[parseInt(digit)] || digit)
  } catch (error) {
    console.warn('Error converting to Nepali number, using English instead:', error)
    return typeof num === 'number' ? num.toFixed(2) : String(num)
  }
}

// Generate User Monthly PDF Function - Optimized for space
export const generateUserMonthlyPDF = (userData: any[], userName: string, monthDetails: any) => {
  if (!userData || userData.length === 0) {
    alert('No data available for PDF generation')
    return
  }

  const doc = new jsPDF('p', 'mm', 'a4')
  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  
  try {
    // Compact Header - Reduced spacing
    doc.setFontSize(16) // Reduced from 20
    doc.setFont('helvetica', 'bold')
    doc.text('Monthly Milk Collection Report', pageWidth / 2, 15, { align: 'center' }) // Reduced Y position
    
    // Compact User and Month info
    doc.setFontSize(10) // Reduced from 12
    doc.setFont('helvetica', 'normal')
    doc.text(`User: ${userName}`, 15, 25) // Reduced margins and spacing
    doc.text(`Month: ${monthDetails?.month || ''} ${monthDetails?.year || ''}`, 15, 30)
    doc.text(`Generated: ${new Date().toLocaleDateString('en-GB')}`, 15, 35)
    
    // Table data preparation
    const tableData = userData.map((entry: any) => [
      new Date(entry.createdAt).toLocaleDateString('en-GB'),
      entry.session === 'morning' ? 'AM' : 'PM', // Shortened
      `${typeof entry.todaymilk === 'number' ? entry.todaymilk.toFixed(2) : '0.00'}L`, // Removed space
      `${typeof entry.todayfit === 'number' ? entry.todayfit.toFixed(2) : '0.00'}%`,
      `Rs.${typeof entry.todaymoney === 'number' ? entry.todaymoney.toFixed(2) : '0.00'}` // Removed space
    ])
    
    // Calculate totals
    const totalMilk = userData.reduce((sum, entry) => sum + (typeof entry.todaymilk === 'number' ? entry.todaymilk : 0), 0)
    const totalMoney = userData.reduce((sum, entry) => sum + (typeof entry.todaymoney === 'number' ? entry.todaymoney : 0), 0)
    const averageFat = userData.length > 0 
      ? userData.reduce((sum, entry) => sum + (typeof entry.todayfit === 'number' ? entry.todayfit : 0), 0) / userData.length
      : 0
    
    // Compact Table - Optimized for more data
    autoTable(doc, {
      head: [['Date', 'Session', 'Milk(L)', 'Fat%', 'Amount(Rs)']],
      body: tableData,
      startY: 40, // Reduced from 70
      styles: {
        fontSize: 8, // Reduced from 10
        cellPadding: 1.5, // Reduced from 3
        lineColor: [200, 200, 200],
        lineWidth: 0.1,
      },
      headStyles: {
        fillColor: [34, 197, 94],
        textColor: 255,
        fontStyle: 'bold',
        fontSize: 8, // Consistent small size
      },
      alternateRowStyles: {
        fillColor: [249, 250, 251],
      },
      margin: { left: 15, right: 15 }, // Reduced margins
      rowPageBreak: 'avoid',
      showHead: 'everyPage',
    })

    // Calculate Y position for summary
    const finalY = (doc as any).lastAutoTable.finalY || 150
    
    // Compact Summary section
    doc.setFontSize(12) // Reduced from 14
    doc.setFont('helvetica', 'bold')
    doc.text('Summary', 15, finalY + 10) // Reduced spacing
    
    doc.setFontSize(10) // Reduced from 12
    doc.setFont('helvetica', 'normal')
    doc.text(`Total Milk: ${totalMilk.toFixed(2)}L | Total: Rs.${totalMoney.toFixed(2)}`, 15, finalY + 20)
    doc.text(`Avg Fat: ${averageFat.toFixed(2)}% | Days: ${userData.length}`, 15, finalY + 28)
    
    // Compact Footer
    doc.setFontSize(8) // Reduced from 10
    doc.setFont('helvetica', 'italic')
    doc.text('Page 1', pageWidth / 2, pageHeight - 10, { align: 'center' })
  } catch (error) {
    console.error('Error generating PDF:', error)
    alert('An error occurred while generating the PDF. Using simplified format.')
    
    // Compact fallback format
    doc.setFontSize(14)
    doc.text('Milk Collection Report - Error Mode', 15, 15)
    doc.setFontSize(10)
    doc.text(`User: ${userName} | Month: ${monthDetails?.month || ''} ${monthDetails?.year || ''}`, 15, 25)
    
    autoTable(doc, {
      head: [['Date', 'Milk(L)', 'Amount(Rs)']],
      body: userData.map(entry => [
        new Date(entry.createdAt).toLocaleDateString('en-GB'),
        `${typeof entry.todaymilk === 'number' ? entry.todaymilk.toFixed(2) : '0.00'}`,
        `${typeof entry.todaymoney === 'number' ? entry.todaymoney.toFixed(2) : '0.00'}`
      ]),
      startY: 35,
      styles: { fontSize: 8, cellPadding: 1 }
    })
  }
  
  // Save the PDF
  const fileName = `${userName}_${monthDetails?.month || 'Month'}_${monthDetails?.year || 'Year'}.pdf`
  doc.save(fileName)
}

// Generate All Users PDF - HIGHLY OPTIMIZED for 60+ users
export const generateAllUsersPDF = (allUsersData: any[], monthDetails: any) => {
  if (!allUsersData || allUsersData.length === 0) {
    alert('No data available for PDF generation')
    return
  }

  const doc = new jsPDF('p', 'mm', 'a4')
  const pageWidth = doc.internal.pageSize.getWidth()
  
  try {
    // Ultra-compact Header
    doc.setFontSize(14) // Reduced from 20
    doc.setFont('helvetica', 'bold')
    doc.text('All Users Monthly Report', pageWidth / 2, 12, { align: 'center' })
    
    // Compact Month info - single line
    doc.setFontSize(9)
    doc.setFont('helvetica', 'normal')
    doc.text(`${monthDetails?.month || ''} ${monthDetails?.year || ''} | Generated: ${new Date().toLocaleDateString('en-GB')}`, pageWidth / 2, 20, { align: 'center' })
    
    // Group data by user - optimized processing
    const userGroups = allUsersData.reduce((groups: any, entry: any) => {
      const userId = entry.userid
      if (!groups[userId]) {
        groups[userId] = {
          userName: entry.user?.name || 'Unknown User',
          totalMilk: 0,
          totalMoney: 0,
          dayCount: 0
        }
      }
      groups[userId].totalMilk += typeof entry.todaymilk === 'number' ? entry.todaymilk : 0
      groups[userId].totalMoney += typeof entry.todaymoney === 'number' ? entry.todaymoney : 0
      groups[userId].dayCount += 1
      return groups
    }, {})
    
    // Create ultra-compact summary table data
    const summaryData = Object.values(userGroups).map((group: any, index: number) => [
      `${index + 1}`, // Add index number
      group.userName.length > 15 ? group.userName.substring(0, 15) + '...' : group.userName, // Truncate long names
      `${group.totalMilk.toFixed(1)}L`, // Reduced decimal places
      `${group.totalMoney.toFixed(0)}`, // No decimals for money to save space
      `${group.dayCount}d` // Shortened 'days' to 'd'
    ])
    
    // Ultra-compact Summary table - optimized for 60+ users
    autoTable(doc, {
      head: [['#', 'User Name', 'Milk(L)', 'Amount(Rs)', 'Days']],
      body: summaryData,
      startY: 25, // Very close to header
      styles: {
        fontSize: 7, // Very small font
        cellPadding: 0.8, // Minimal padding
        lineColor: [180, 180, 180],
        lineWidth: 0.1,
        halign: 'center', // Center align all content
      },
      headStyles: {
        fillColor: [59, 130, 246],
        textColor: 255,
        fontStyle: 'bold',
        fontSize: 7,
        cellPadding: 1,
      },
      alternateRowStyles: {
        fillColor: [248, 249, 250],
      },
      margin: { left: 10, right: 10 }, // Minimal margins
      columnStyles: {
        0: { cellWidth: 8 }, // # column - very narrow
        1: { cellWidth: 55 }, // User name - largest
        2: { cellWidth: 22 }, // Milk - compact
        3: { cellWidth: 25 }, // Amount - compact  
        4: { cellWidth: 15 }, // Days - narrow
      },
      rowPageBreak: 'avoid',
      showHead: 'everyPage',
      pageBreak: 'always', // Allow page breaks when needed
    })
    
    // Compact totals at the bottom
    const finalY = (doc as any).lastAutoTable.finalY || 150
    const totalMilk = Object.values(userGroups).reduce((sum: number, group: any) => sum + group.totalMilk, 0)
    const totalMoney = Object.values(userGroups).reduce((sum: number, group: any) => sum + group.totalMoney, 0)
    const uniqueUsers = Object.keys(userGroups).length
    
    // Single line summary to save space
    doc.setFontSize(10)
    doc.setFont('helvetica', 'bold')
    doc.text(`TOTAL: ${totalMilk.toFixed(1)}L | Rs.${totalMoney.toFixed(0)} | ${uniqueUsers} Users`, pageWidth / 2, finalY + 8, { align: 'center' })
    
    // Minimal footer
    doc.setFontSize(7)
    doc.setFont('helvetica', 'italic')
    doc.text('Auto-generated', pageWidth / 2, doc.internal.pageSize.getHeight() - 8, { align: 'center' })
    
  } catch (error) {
    console.error('Error generating PDF:', error)
    alert('An error occurred while generating the PDF. Using simplified format.')
    
    // Ultra-simple fallback for high user count
    doc.setFontSize(12)
    doc.text('All Users Summary - Error Mode', 15, 15)
    doc.setFontSize(9)
    doc.text(`${monthDetails?.month || ''} ${monthDetails?.year || ''}`, 15, 25)
    
    // Simple user count and basic stats
    const users = Array.from(new Set(allUsersData.map(entry => entry.user?.name || 'Unknown'))).sort()
    doc.setFontSize(10)
    doc.text(`Total Users: ${users.length}`, 15, 40)
    
    // List users in columns to save space
    let yPos = 50
    let xPos = 15
    const maxPerColumn = 25 // Users per column
    
    users.forEach((user, index) => {
      if (index > 0 && index % maxPerColumn === 0) {
        xPos += 65 // Move to next column
        yPos = 50 // Reset Y position
      }
      
      doc.setFontSize(8)
      doc.text(`${index + 1}. ${user.length > 20 ? user.substring(0, 20) + '...' : user}`, xPos, yPos)
      yPos += 6
    })
  }
  
  // Save the PDF with compact filename
  const fileName = `AllUsers_${monthDetails?.month || 'M'}_${monthDetails?.year || 'Y'}.pdf`
  doc.save(fileName)
}