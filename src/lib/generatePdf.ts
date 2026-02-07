/**
 * PDF Generation Utility
 * 
 * Generates a printable PDF from a Memory Book's pages.
 * Uses jsPDF for PDF creation and loads images directly.
 */

import jsPDF from 'jspdf';
import type { BookPage } from '../components/book/BookViewer';

// A4 dimensions in mm
const PAGE_W = 210;
const PAGE_H = 297;
const MARGIN = 15;
const CONTENT_W = PAGE_W - MARGIN * 2;

// Fonts
const TITLE_SIZE = 22;
const BODY_SIZE = 11;
const PAGE_NUM_SIZE = 9;
const CAPTION_SIZE = 9;

/**
 * Load an image URL as a base64 data URL.
 * Works with: data URLs (pass-through), Firebase Storage URLs, backend URLs.
 */
async function loadImageAsDataUrl(url: string): Promise<string | null> {
    if (!url || url.trim() === '') {
        console.warn('[PDF] loadImage: empty URL, skipping');
        return null;
    }

    // Already a data URL — use directly (most common for persisted images)
    if (url.startsWith('data:')) {
        console.log('[PDF] loadImage: using existing data URL', `(${(url.length / 1024).toFixed(0)}KB)`);
        return url;
    }

    // Remote URL — fetch with CORS
    const shortUrl = url.length > 80 ? url.substring(0, 77) + '...' : url;
    console.log(`[PDF] loadImage: fetching ${shortUrl}`);

    // Retry up to 2 times for network issues
    for (let attempt = 1; attempt <= 2; attempt++) {
        try {
            const response = await fetch(url, { mode: 'cors' });
            if (!response.ok) {
                console.warn(`[PDF] loadImage: HTTP ${response.status} for ${shortUrl} (attempt ${attempt})`);
                if (attempt < 2) continue;
                return null;
            }

            const blob = await response.blob();
            console.log(`[PDF] loadImage: downloaded ${(blob.size / 1024).toFixed(0)}KB (${blob.type})`);

            return new Promise((resolve) => {
                const reader = new FileReader();
                reader.onloadend = () => resolve(reader.result as string);
                reader.onerror = () => {
                    console.warn('[PDF] loadImage: FileReader failed for', shortUrl);
                    resolve(null);
                };
                reader.readAsDataURL(blob);
            });
        } catch (err) {
            console.warn(`[PDF] loadImage: fetch failed (attempt ${attempt}):`, shortUrl, err);
            if (attempt < 2) {
                await new Promise(r => setTimeout(r, 500)); // wait 500ms before retry
            }
        }
    }

    console.error('[PDF] loadImage: all attempts failed for', shortUrl);
    return null;
}

/**
 * Detect image format from a data URL or URL string.
 * jsPDF needs 'JPEG' or 'PNG' as format hint.
 */
function detectImageFormat(dataUrl: string): string {
    if (dataUrl.startsWith('data:image/png')) return 'PNG';
    if (dataUrl.startsWith('data:image/webp')) return 'PNG'; // treat webp as PNG for jsPDF
    return 'JPEG'; // default for data:image/jpeg and remote URLs
}

/**
 * Wraps text to fit within maxWidth and returns array of lines.
 */
function wrapText(pdf: jsPDF, text: string, maxWidth: number): string[] {
    return pdf.splitTextToSize(text, maxWidth) as string[];
}

export interface PdfProgress {
    current: number;
    total: number;
    label: string;
}

/**
 * Generate a PDF from book pages.
 */
export async function generateBookPdf(
    bookTitle: string,
    pages: BookPage[],
    onProgress?: (progress: PdfProgress) => void,
): Promise<Blob> {
    const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const totalSteps = pages.length + 1; // +1 for setup

    onProgress?.({ current: 0, total: totalSteps, label: 'Preparando...' });

    // ── Cover page ──────────────────────────────────────────────
    const coverPage = pages[0];
    if (coverPage) {
        // Background gradient effect (light teal)
        pdf.setFillColor(240, 253, 253);
        pdf.rect(0, 0, PAGE_W, PAGE_H, 'F');

        // Cover image
        const coverImg = await loadImageAsDataUrl(coverPage.imageUrl);
        onProgress?.({ current: 1, total: totalSteps, label: 'Capa...' });

        if (coverImg) {
            try {
                const imgW = CONTENT_W;
                const imgH = imgW * 0.65; // ~16:10 aspect
                const imgX = MARGIN;
                const imgY = 30;
                pdf.addImage(coverImg, detectImageFormat(coverImg), imgX, imgY, imgW, imgH);
            } catch (e) {
                console.warn('[PDF] Failed to add cover image:', e);
            }
        }

        // Title
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(TITLE_SIZE);
        pdf.setTextColor(30, 30, 30);
        const titleLines = wrapText(pdf, bookTitle, CONTENT_W);
        const titleY = coverImg ? 30 + CONTENT_W * 0.65 + 15 : 80;
        pdf.text(titleLines, PAGE_W / 2, titleY, { align: 'center' });

        // Subtitle / description
        if (coverPage.description) {
            pdf.setFont('helvetica', 'normal');
            pdf.setFontSize(BODY_SIZE);
            pdf.setTextColor(100, 100, 100);
            const descLines = wrapText(pdf, coverPage.description, CONTENT_W - 20);
            pdf.text(descLines, PAGE_W / 2, titleY + titleLines.length * 8 + 5, { align: 'center' });
        }

        // Footer line
        pdf.setDrawColor(0, 229, 229); // primary-teal
        pdf.setLineWidth(0.5);
        pdf.line(MARGIN + 30, PAGE_H - 25, PAGE_W - MARGIN - 30, PAGE_H - 25);
        pdf.setFontSize(CAPTION_SIZE);
        pdf.setTextColor(150, 150, 150);
        pdf.text('Memory Book', PAGE_W / 2, PAGE_H - 18, { align: 'center' });
    }

    // ── Content pages ───────────────────────────────────────────
    for (let i = 1; i < pages.length; i++) {
        const page = pages[i];
        pdf.addPage();

        onProgress?.({ current: i + 1, total: totalSteps, label: `Página ${i}/${pages.length - 1}...` });

        // Determine if this is the back cover
        const isBackCover = i === pages.length - 1;

        // Page background
        pdf.setFillColor(255, 255, 255);
        pdf.rect(0, 0, PAGE_W, PAGE_H, 'F');

        // Load and add image
        const imgData = await loadImageAsDataUrl(page.imageUrl);
        let imageBottomY = MARGIN;

        if (imgData) {
            try {
                const imgW = CONTENT_W;
                const imgH = imgW * 0.7; // ~3:2 aspect
                const imgX = MARGIN;
                const imgY = MARGIN;
                pdf.addImage(imgData, detectImageFormat(imgData), imgX, imgY, imgW, imgH);
                imageBottomY = imgY + imgH;
            } catch (e) {
                console.warn(`[PDF] Failed to add image for page ${i}:`, e);
            }
        }

        // Title
        if (page.title) {
            const titleFontSize = isBackCover ? 16 : 14;
            pdf.setFont('helvetica', 'bold');
            pdf.setFontSize(titleFontSize);
            pdf.setTextColor(30, 30, 30);
            const pageTitleLines = wrapText(pdf, page.title, CONTENT_W);
            pdf.text(pageTitleLines, MARGIN, imageBottomY + 10);
            imageBottomY += 10 + pageTitleLines.length * 6;
        }

        // Description
        if (page.description) {
            pdf.setFont('helvetica', 'normal');
            pdf.setFontSize(BODY_SIZE);
            pdf.setTextColor(60, 60, 60);
            const textLines = wrapText(pdf, page.description, CONTENT_W);
            const maxLines = Math.floor((PAGE_H - imageBottomY - 25) / 5);
            const clampedLines = textLines.slice(0, maxLines);
            pdf.text(clampedLines, MARGIN, imageBottomY + 5);
        }

        // Page number (not on back cover)
        if (!isBackCover) {
            pdf.setFont('helvetica', 'normal');
            pdf.setFontSize(PAGE_NUM_SIZE);
            pdf.setTextColor(180, 180, 180);
            pdf.text(`${i}`, PAGE_W / 2, PAGE_H - 12, { align: 'center' });
        }

        // Decorative line at bottom
        pdf.setDrawColor(230, 230, 230);
        pdf.setLineWidth(0.3);
        pdf.line(MARGIN + 20, PAGE_H - 18, PAGE_W - MARGIN - 20, PAGE_H - 18);
    }

    onProgress?.({ current: totalSteps, total: totalSteps, label: 'Finalizando...' });

    return pdf.output('blob');
}

/**
 * Generate and download a PDF.
 */
export async function downloadBookAsPdf(
    bookTitle: string,
    pages: BookPage[],
    onProgress?: (progress: PdfProgress) => void,
): Promise<void> {
    const blob = await generateBookPdf(bookTitle, pages, onProgress);

    // Create download link
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${bookTitle.replace(/[^a-zA-Z0-9\s-_àáâãéêíóôõúüçÀÁÂÃÉÊÍÓÔÕÚÜÇ]/g, '').trim()}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}
