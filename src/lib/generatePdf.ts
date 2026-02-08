/**
 * PDF Generation Utility — Memory Book Style
 *
 * Generates a beautiful landscape PDF that looks like a real printed photo book.
 * Uses jsPDF with custom fonts (Playfair Display + Lora) matching the site,
 * the Memory Book logo, and the site colour palette.
 */

import jsPDF from 'jspdf';
import type { BookPage } from '../components/book/BookViewer';

// ── Asset imports (Vite resolves these to URLs) ───────────────────────────
import playfairBoldUrl from '../assets/fonts/PlayfairDisplay-Bold.ttf?url';
import loraRegularUrl from '../assets/fonts/Lora-Regular.ttf?url';
import logoUrl from '../assets/logo_round.png?url';

// ── Site Colour Palette (RGB) ─────────────────────────────────────────────
const TEAL      = [0,   229, 229] as const;
const CORAL     = [255, 138, 122] as const;
const AMBER     = [255, 179, 71 ] as const;
const BG_CREAM  = [253, 251, 247] as const;
const BG_SOFT   = [247, 250, 252] as const;
const TXT_MAIN  = [26,  32,  44 ] as const;
const TXT_MUTED = [113, 128, 150] as const;
const SHADOW    = [230, 228, 224] as const;

// ── Landscape A4 dimensions (mm) ──────────────────────────────────────────
const PAGE_W = 297;
const PAGE_H = 210;
const MARGIN = 18;
const INNER_PAD = 12;

// ── Typography sizes ──────────────────────────────────────────────────────
const COVER_TITLE_SIZE = 32;
const COVER_SUBTITLE_SIZE = 13;
const PAGE_TITLE_SIZE = 18;
const BODY_SIZE = 11;
const BODY_LINE_H = 5.5;
const PAGE_NUM_SIZE = 9;
const CAPTION_SIZE = 8;

// ── Font names (registered with jsPDF) ────────────────────────────────────
const FONT_PLAYFAIR = 'PlayfairDisplay';
const FONT_LORA = 'Lora';

// ══════════════════════════════════════════════════════════════════════════
// ██  HELPERS
// ══════════════════════════════════════════════════════════════════════════

/**
 * Fetch a binary asset and return as base64 string (no data: prefix).
 */
async function fetchAsBase64(url: string): Promise<string> {
    const res = await fetch(url);
    const buf = await res.arrayBuffer();
    const bytes = new Uint8Array(buf);
    let binary = '';
    for (let i = 0; i < bytes.length; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
}

/**
 * Load and register custom fonts + logo with jsPDF.
 * Returns the logo as a data URL (or null).
 */
async function loadAssets(pdf: jsPDF): Promise<string | null> {
    // ── Fonts ──────────────────────────────────────────────────────
    try {
        const [playfairB64, loraB64] = await Promise.all([
            fetchAsBase64(playfairBoldUrl),
            fetchAsBase64(loraRegularUrl),
        ]);

        // Playfair Display Bold
        pdf.addFileToVFS('PlayfairDisplay-Bold.ttf', playfairB64);
        pdf.addFont('PlayfairDisplay-Bold.ttf', FONT_PLAYFAIR, 'bold');

        // Lora Regular
        pdf.addFileToVFS('Lora-Regular.ttf', loraB64);
        pdf.addFont('Lora-Regular.ttf', FONT_LORA, 'normal');

        console.log('[PDF] Custom fonts registered');
    } catch (e) {
        console.warn('[PDF] Failed to load custom fonts, using fallbacks:', e);
        // Fallbacks are handled by setTitleFont / setBodyFont
    }

    // ── Logo ───────────────────────────────────────────────────────
    try {
        return await loadImageAsDataUrl(logoUrl);
    } catch {
        console.warn('[PDF] Failed to load logo');
        return null;
    }
}

/**
 * Safely set the title font (Playfair Display Bold, fallback to Times Bold).
 */
function setTitleFont(pdf: jsPDF) {
    try {
        pdf.setFont(FONT_PLAYFAIR, 'bold');
    } catch {
        pdf.setFont('times', 'bold');
    }
}

/**
 * Safely set the body font (Lora Regular, fallback to Helvetica Normal).
 */
function setBodyFont(pdf: jsPDF, style: 'normal' | 'italic' = 'normal') {
    try {
        pdf.setFont(FONT_LORA, 'normal');
    } catch {
        pdf.setFont('helvetica', style);
    }
}

/**
 * Load an image URL as a base64 data URL.
 */
async function loadImageAsDataUrl(url: string): Promise<string | null> {
    if (!url || url.trim() === '') return null;
    if (url.startsWith('data:')) return url;

    for (let attempt = 1; attempt <= 2; attempt++) {
        try {
            const response = await fetch(url, { mode: 'cors' });
            if (!response.ok) { if (attempt < 2) continue; return null; }
            const blob = await response.blob();
            return new Promise((resolve) => {
                const reader = new FileReader();
                reader.onloadend = () => resolve(reader.result as string);
                reader.onerror = () => resolve(null);
                reader.readAsDataURL(blob);
            });
        } catch {
            if (attempt < 2) await new Promise(r => setTimeout(r, 500));
        }
    }
    return null;
}

function detectImageFormat(dataUrl: string): string {
    if (dataUrl.startsWith('data:image/png')) return 'PNG';
    if (dataUrl.startsWith('data:image/webp')) return 'PNG';
    return 'JPEG';
}

function wrapText(pdf: jsPDF, text: string, maxWidth: number): string[] {
    return pdf.splitTextToSize(text, maxWidth) as string[];
}

/** Decorative ornament: diamond + side lines. */
function drawOrnament(pdf: jsPDF, cx: number, cy: number, width: number) {
    const half = width / 2;
    pdf.setDrawColor(...TEAL);
    pdf.setLineWidth(0.4);
    pdf.line(cx - half, cy, cx - 6, cy);
    pdf.line(cx + 6, cy, cx + half, cy);
    pdf.setFillColor(...TEAL);
    const d = 2;
    pdf.triangle(cx, cy - d, cx + d, cy, cx, cy + d, 'F');
    pdf.triangle(cx, cy - d, cx - d, cy, cx, cy + d, 'F');
}

/** Thin decorative border inside a page. */
function drawPageBorder(pdf: jsPDF) {
    pdf.setDrawColor(...TEAL);
    pdf.setLineWidth(0.25);
    pdf.roundedRect(10, 10, PAGE_W - 20, PAGE_H - 20, 3, 3, 'S');
}

/** Soft shadow rectangle. */
function drawSoftShadow(pdf: jsPDF, x: number, y: number, w: number, h: number) {
    pdf.setFillColor(...SHADOW);
    pdf.roundedRect(x + 2, y + 2, w, h, 3, 3, 'F');
}

/** Framed image with white border and shadow. */
function drawFramedImage(pdf: jsPDF, imgData: string, x: number, y: number, w: number, h: number) {
    drawSoftShadow(pdf, x, y, w, h);
    pdf.setFillColor(255, 255, 255);
    pdf.roundedRect(x - 3, y - 3, w + 6, h + 6, 4, 4, 'F');
    pdf.addImage(imgData, detectImageFormat(imgData), x, y, w, h);
}

/** Draw the logo at a specific position. */
function drawLogo(pdf: jsPDF, logoData: string | null, x: number, y: number, size: number) {
    if (!logoData) return;
    try {
        pdf.addImage(logoData, 'PNG', x, y, size, size);
    } catch { /* skip */ }
}

// ── Progress type ─────────────────────────────────────────────────────────

export interface PdfProgress {
    current: number;
    total: number;
    label: string;
}

// ══════════════════════════════════════════════════════════════════════════
// ██  MAIN GENERATOR
// ══════════════════════════════════════════════════════════════════════════

export async function generateBookPdf(
    bookTitle: string,
    pages: BookPage[],
    onProgress?: (progress: PdfProgress) => void,
): Promise<Blob> {
    const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
    const totalSteps = pages.length + 2;

    onProgress?.({ current: 0, total: totalSteps, label: 'Carregando fontes...' });

    // Load custom fonts + logo
    const logoData = await loadAssets(pdf);

    onProgress?.({ current: 1, total: totalSteps, label: 'Preparando capa...' });

    // ══════════════════════════════════════════════════════════════════════
    // ██  COVER PAGE
    // ══════════════════════════════════════════════════════════════════════
    const coverPage = pages[0];
    if (coverPage) {
        // Background
        pdf.setFillColor(...BG_CREAM);
        pdf.rect(0, 0, PAGE_W, PAGE_H, 'F');
        drawPageBorder(pdf);

        // Teal bar top + coral bar bottom
        pdf.setFillColor(...TEAL);
        pdf.rect(0, 0, PAGE_W, 4, 'F');
        pdf.setFillColor(...CORAL);
        pdf.rect(0, PAGE_H - 4, PAGE_W, 4, 'F');

        // Logo at top-left
        drawLogo(pdf, logoData, MARGIN + 2, 14, 12);

        // Cover image
        const coverImg = await loadImageAsDataUrl(coverPage.imageUrl);

        const imgW = 150;
        const imgH = 105;
        const imgX = (PAGE_W - imgW) / 2;
        const imgY = 22;

        if (coverImg) {
            try { drawFramedImage(pdf, coverImg, imgX, imgY, imgW, imgH); }
            catch (e) { console.warn('[PDF] cover image error:', e); }
        }

        // Title — Playfair Display Bold
        const titleStartY = imgY + imgH + 20;
        setTitleFont(pdf);
        pdf.setFontSize(COVER_TITLE_SIZE);
        pdf.setTextColor(...TXT_MAIN);
        const titleLines = wrapText(pdf, bookTitle, PAGE_W - 80);
        pdf.text(titleLines, PAGE_W / 2, titleStartY, { align: 'center' });

        // Ornament
        const ornY = titleStartY + titleLines.length * 12 + 6;
        drawOrnament(pdf, PAGE_W / 2, ornY, 70);

        // Subtitle — Lora
        if (coverPage.description) {
            setBodyFont(pdf);
            pdf.setFontSize(COVER_SUBTITLE_SIZE);
            pdf.setTextColor(...TXT_MUTED);
            const descLines = wrapText(pdf, coverPage.description, PAGE_W - 100);
            pdf.text(descLines.slice(0, 3), PAGE_W / 2, ornY + 12, { align: 'center' });
        }

        // Footer branding
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(CAPTION_SIZE);
        pdf.setTextColor(...TXT_MUTED);
        pdf.text('Memory Book', PAGE_W / 2, PAGE_H - 14, { align: 'center' });
    }

    // ══════════════════════════════════════════════════════════════════════
    // ██  CONTENT PAGES
    // ══════════════════════════════════════════════════════════════════════
    const lastIndex = pages.length - 1;

    for (let i = 1; i < pages.length; i++) {
        const page = pages[i];
        pdf.addPage();
        onProgress?.({ current: i + 1, total: totalSteps, label: `Página ${i}/${pages.length - 1}...` });

        const isBackCover = i === lastIndex;
        const isEven = i % 2 === 0;

        // ── BACK COVER ────────────────────────────────────────────────
        if (isBackCover) {
            await drawBackCover(pdf, page, bookTitle, logoData);
            continue;
        }

        // ── CONTENT PAGE ──────────────────────────────────────────────
        pdf.setFillColor(...BG_CREAM);
        pdf.rect(0, 0, PAGE_W, PAGE_H, 'F');
        drawPageBorder(pdf);

        // Logo watermark (top corner, opposite of image side)
        const logoX = isEven ? MARGIN + 2 : PAGE_W - MARGIN - 10;
        drawLogo(pdf, logoData, logoX, 12, 8);

        const imgData = await loadImageAsDataUrl(page.imageUrl);

        // Layout: divide page into two halves
        const contentTop = MARGIN + 6;
        const contentBottom = PAGE_H - MARGIN - 10;
        const contentH = contentBottom - contentTop;
        const halfW = (PAGE_W - MARGIN * 2 - INNER_PAD) / 2;

        // Image area (alternates sides)
        const imgAreaX = isEven ? MARGIN + halfW + INNER_PAD : MARGIN;
        const imgAreaY = contentTop;
        const imgAreaW = halfW;
        const imgAreaH = contentH;

        // Text area (opposite side)
        const txtAreaX = isEven ? MARGIN : MARGIN + halfW + INNER_PAD;
        const txtAreaW = halfW;

        // ── Image ────────────────────────────────────────────────
        if (imgData) {
            try { drawFramedImage(pdf, imgData, imgAreaX, imgAreaY, imgAreaW, imgAreaH); }
            catch (e) { console.warn(`[PDF] image error page ${i}:`, e); }
        }

        // ── Text side ────────────────────────────────────────────
        // Vertical teal accent line
        const accentX = isEven ? txtAreaX + txtAreaW + 4 : txtAreaX - 6;
        pdf.setDrawColor(...TEAL);
        pdf.setLineWidth(0.8);
        pdf.line(accentX, contentTop + 8, accentX, contentBottom - 8);

        let cursorY = contentTop + 18;

        // Life phase / date tag
        if (page.date) {
            pdf.setFont('helvetica', 'bold');
            pdf.setFontSize(7);
            const tagText = page.date.toUpperCase();
            const tagW = Math.min(pdf.getTextWidth(tagText) + 12, txtAreaW);
            pdf.setFillColor(...TEAL);
            pdf.roundedRect(txtAreaX, cursorY - 5, tagW, 8, 2, 2, 'F');
            pdf.setTextColor(255, 255, 255);
            pdf.text(tagText, txtAreaX + 6, cursorY);
            cursorY += 16;
        }

        // Title — Playfair Display Bold
        if (page.title) {
            setTitleFont(pdf);
            pdf.setFontSize(PAGE_TITLE_SIZE);
            pdf.setTextColor(...TXT_MAIN);
            const titleLines = wrapText(pdf, page.title, txtAreaW - 8);
            pdf.text(titleLines.slice(0, 3), txtAreaX, cursorY);
            cursorY += Math.min(titleLines.length, 3) * 7.5 + 6;

            // Coral divider
            pdf.setDrawColor(...CORAL);
            pdf.setLineWidth(0.8);
            pdf.line(txtAreaX, cursorY, txtAreaX + Math.min(45, txtAreaW * 0.4), cursorY);
            cursorY += 10;
        }

        // Description — Lora Regular
        if (page.description) {
            setBodyFont(pdf);
            pdf.setFontSize(BODY_SIZE);
            pdf.setTextColor(...TXT_MUTED);
            const textLines = wrapText(pdf, page.description, txtAreaW - 8);
            const maxLines = Math.floor((contentBottom - cursorY - 10) / BODY_LINE_H);
            pdf.text(textLines.slice(0, Math.max(maxLines, 3)), txtAreaX, cursorY);
        }

        // Page number (outer corner)
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(PAGE_NUM_SIZE);
        pdf.setTextColor(...TXT_MUTED);
        const pnX = isEven ? PAGE_W - MARGIN - 2 : MARGIN + 2;
        const pnAlign: 'right' | 'left' = isEven ? 'right' : 'left';
        pdf.text(`${i}`, pnX, PAGE_H - 14, { align: pnAlign });

        // Bottom center dots
        pdf.setFillColor(...AMBER);
        const dotsY = PAGE_H - 14.5;
        for (let d = -1; d <= 1; d++) pdf.circle(PAGE_W / 2 + d * 4, dotsY, 0.6, 'F');
    }

    onProgress?.({ current: totalSteps, total: totalSteps, label: 'Finalizando...' });
    return pdf.output('blob');
}

// ══════════════════════════════════════════════════════════════════════════
// ██  BACK COVER
// ══════════════════════════════════════════════════════════════════════════

async function drawBackCover(
    pdf: jsPDF, page: BookPage, bookTitle: string, logoData: string | null,
) {
    pdf.setFillColor(...BG_SOFT);
    pdf.rect(0, 0, PAGE_W, PAGE_H, 'F');
    drawPageBorder(pdf);

    // Colour bars (inverted from cover)
    pdf.setFillColor(...CORAL);
    pdf.rect(0, 0, PAGE_W, 4, 'F');
    pdf.setFillColor(...TEAL);
    pdf.rect(0, PAGE_H - 4, PAGE_W, 4, 'F');

    // Ornament
    drawOrnament(pdf, PAGE_W / 2, 24, 80);

    // Image
    const imgW = 120;
    const imgH = 85;
    const imgX = (PAGE_W - imgW) / 2;
    const imgY = 36;

    const imgData = await loadImageAsDataUrl(page.imageUrl);
    if (imgData) {
        try { drawFramedImage(pdf, imgData, imgX, imgY, imgW, imgH); }
        catch { /* skip */ }
    }

    let cursorY = imgY + imgH + 18;

    // Title — Playfair
    if (page.title) {
        setTitleFont(pdf);
        pdf.setFontSize(20);
        pdf.setTextColor(...TXT_MAIN);
        const lines = wrapText(pdf, page.title, PAGE_W - 80);
        pdf.text(lines, PAGE_W / 2, cursorY, { align: 'center' });
        cursorY += lines.length * 8 + 6;
    }

    // Description — Lora
    if (page.description) {
        setBodyFont(pdf);
        pdf.setFontSize(BODY_SIZE);
        pdf.setTextColor(...TXT_MUTED);
        const lines = wrapText(pdf, page.description, PAGE_W - 100);
        pdf.text(lines.slice(0, 5), PAGE_W / 2, cursorY, { align: 'center' });
        cursorY += Math.min(lines.length, 5) * BODY_LINE_H + 12;
    }

    // Ornament
    drawOrnament(pdf, PAGE_W / 2, Math.min(cursorY + 4, PAGE_H - 44), 50);

    // Logo centered
    drawLogo(pdf, logoData, PAGE_W / 2 - 6, PAGE_H - 42, 12);

    // Footer
    setTitleFont(pdf);
    pdf.setFontSize(12);
    pdf.setTextColor(...TXT_MAIN);
    pdf.text(bookTitle, PAGE_W / 2, PAGE_H - 24, { align: 'center' });

    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(CAPTION_SIZE);
    pdf.setTextColor(...TXT_MUTED);
    pdf.text('Made with Memory Book', PAGE_W / 2, PAGE_H - 16, { align: 'center' });
}

// ══════════════════════════════════════════════════════════════════════════
// ██  DOWNLOAD HELPER
// ══════════════════════════════════════════════════════════════════════════

export async function downloadBookAsPdf(
    bookTitle: string,
    pages: BookPage[],
    onProgress?: (progress: PdfProgress) => void,
): Promise<void> {
    const blob = await generateBookPdf(bookTitle, pages, onProgress);

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${bookTitle.replace(/[^a-zA-Z0-9\s\-_àáâãéêíóôõúüçÀÁÂÃÉÊÍÓÔÕÚÜÇ]/g, '').trim()}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}
