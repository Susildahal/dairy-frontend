// Nepali Font Configuration for jsPDF
// This file contains the font configuration for supporting Nepali/Devanagari characters in PDFs

/**
 * HOW IT WORKS:
 * 
 * 1. jsPDF's standard fonts (Helvetica, Times, Courier) don't support Unicode characters
 *    like Devanagari script used in Nepali.
 * 
 * 2. To fix this, we use a canvas-based approach:
 *    - Create a temporary HTML canvas element
 *    - Use browser's native font rendering (which supports all Unicode)
 *    - Draw the Nepali text on canvas with proper fonts (Noto Sans Devanagari, Mukta)
 *    - Convert canvas to image (PNG)
 *    - Insert image into PDF
 * 
 * 3. This approach ensures:
 *    - Perfect rendering of all Nepali characters
 *    - No need to embed large font files in the app
 *    - Works with any Unicode text
 *    - Maintains visual quality
 * 
 * Usage: Use smartRenderText() instead of doc.text() for any text that might contain Nepali
 */

import { jsPDF } from 'jspdf'

// Base64 encoded Noto Sans Devanagari Regular font (subset for common Nepali characters)
// This is a minimal subset to reduce file size while supporting Nepali text
const notoSansDevanagariBase64 = `AAEAAAASAQAABAAgRFNJRwAAAAEAABLYAAAACEdERUYAKQAUAAAS0AAAACBHUE9TJ1hDIwAAEvAAAABYR1NVQgABAAAAAALIAAAACk9TLzJddG6cAAABbAAAAGBjbWFw+iVP9AAAAdwAAAFSY3Z0IABRAF4AAANQAAAABGdhc3D//wADAAAS6AAAAAgZ2x5Zr5z7WAAAA1QAAAZYaGVhZB9s3fMAAADcAAAANmhoZWEHmQO7AAABFAAAACRobXR4H7gAhwAAAUwAAAAgbG9jYQYGBV4AAANUAAAAEm1heHAASgBYAAABOAAAACBuYW1lhqCSIQAACtAAAAQwcG9zdP+1AGUAABGAAAAAIAAAAgAzAAAAAAADAgAAAAGQAAUAAAKZAswAAACPApkCzAAAAesAMwEJAAACAAUDAAAAAAAAAAAAAAAAAAAAAAAAAAAAAFBmRWQAwOAG4mIC7P6sADwD7ACWAAAAAQAAAAAAAAAAAAAAIAAAAAAAAgAAAAMAAAAUAAMAAQAAABQABAE+AAAANAAgAAQAFOAJ4Bvg` // This is truncated, full font would be larger

/**
 * Add Nepali font support to jsPDF document
 * @param doc - jsPDF document instance
 */
export const addNepaliFont = (doc: jsPDF): void => {
  try {
    // For now, we'll use a workaround with base fonts and proper encoding
    // In production, you would add the full Noto Sans Devanagari font
    
    // Note: This is a placeholder. For full Nepali support, you need to:
    // 1. Download Noto Sans Devanagari from Google Fonts
    // 2. Convert TTF to base64 using: https://rawgit.com/MrRio/jsPDF/master/fontconverter/fontconverter.html
    // 3. Add the full base64 string here
    
    console.log('Nepali font support initialized')
  } catch (error) {
    console.error('Error adding Nepali font:', error)
  }
}

/**
 * Alternative approach: Use canvas-based text rendering for Nepali characters
 * This is a more reliable method for complex Unicode text
 */
export const renderNepaliText = (
  doc: jsPDF,
  text: string,
  x: number,
  y: number,
  options?: { fontSize?: number; align?: 'left' | 'center' | 'right' }
): void => {
  try {
    // Create a temporary canvas element
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    
    if (!ctx) {
      // Fallback to regular text if canvas fails
      doc.text(text, x, y, options as any)
      return
    }
    
    const fontSize = options?.fontSize || 12
    const scale = 2 // Higher resolution
    
    // Set canvas font with proper Nepali font support
    ctx.font = `${fontSize * scale}px 'Noto Sans Devanagari', 'Mukta', 'Kalimati', sans-serif`
    
    // Measure text
    const metrics = ctx.measureText(text)
    const textWidth = metrics.width / scale
    const textHeight = fontSize * 1.2
    
    // Set canvas size
    canvas.width = metrics.width + 10
    canvas.height = textHeight * scale + 10
    
    // Redraw with proper settings (have to reset after size change)
    ctx.font = `${fontSize * scale}px 'Noto Sans Devanagari', 'Mukta', 'Kalimati', sans-serif`
    ctx.fillStyle = '#000000'
    ctx.textBaseline = 'top'
    
    // Draw text
    ctx.fillText(text, 5, 5)
    
    // Calculate position based on alignment
    let finalX = x
    if (options?.align === 'center') {
      finalX = x - textWidth / 2
    } else if (options?.align === 'right') {
      finalX = x - textWidth
    }
    
    // Add canvas as image to PDF
    const imgData = canvas.toDataURL('image/png')
    doc.addImage(imgData, 'PNG', finalX, y - textHeight * 0.8, textWidth, textHeight)
    
  } catch (error) {
    console.error('Error rendering Nepali text:', error)
    // Fallback to regular text
    doc.text(text, x, y, options as any)
  }
}

/**
 * Check if text contains Nepali/Devanagari characters
 */
export const containsNepaliCharacters = (text: string): boolean => {
  // Devanagari Unicode range: U+0900 to U+097F
  const devanagariRegex = /[\u0900-\u097F]/
  return devanagariRegex.test(text)
}

/**
 * Render text with automatic detection of Nepali characters
 */
export const smartRenderText = (
  doc: jsPDF,
  text: string,
  x: number,
  y: number,
  options?: { fontSize?: number; align?: 'left' | 'center' | 'right'; fontStyle?: 'normal' | 'bold' | 'italic' }
): void => {
  if (containsNepaliCharacters(text)) {
    renderNepaliText(doc, text, x, y, options)
  } else {
    // Use regular jsPDF text rendering for English text
    if (options?.fontStyle) {
      doc.setFont('helvetica', options.fontStyle)
    }
    if (options?.fontSize) {
      doc.setFontSize(options.fontSize)
    }
    doc.text(text, x, y, { align: options?.align })
  }
}

/**
 * Preload Nepali fonts to ensure they're available for PDF generation
 * Call this once when the app loads or before generating PDFs
 */
export const preloadNepaliFonts = (): Promise<void> => {
  return new Promise((resolve) => {
    // Create a hidden element to force font loading
    const testElement = document.createElement('div')
    testElement.style.position = 'absolute'
    testElement.style.left = '-9999px'
    testElement.style.fontFamily = "'Noto Sans Devanagari', 'Mukta', sans-serif"
    testElement.textContent = 'भरत तिमल्सिना' // Sample Nepali text
    document.body.appendChild(testElement)
    
    // Use FontFaceSet API if available
    if ('fonts' in document) {
      Promise.all([
        (document as any).fonts.load("12px 'Noto Sans Devanagari'"),
        (document as any).fonts.load("12px 'Mukta'")
      ]).then(() => {
        document.body.removeChild(testElement)
        console.log('Nepali fonts preloaded successfully')
        resolve()
      }).catch(() => {
        // Fallback - just wait a bit for fonts to load
        setTimeout(() => {
          document.body.removeChild(testElement)
          resolve()
        }, 500)
      })
    } else {
      // Fallback for older browsers
      setTimeout(() => {
        document.body.removeChild(testElement)
        resolve()
      }, 500)
    }
  })
}
