/** Normalize Google Drive share links to direct-download form (client hint only). */
export function normalizeResumeUrl(url: string): string {
  const trimmed = url.trim();
  const fileIdFromPath = trimmed.match(/drive\.google\.com\/file\/d\/([^/]+)/);
  if (fileIdFromPath) {
    return `https://drive.google.com/uc?export=download&id=${fileIdFromPath[1]}`;
  }
  const fileIdFromQuery = trimmed.match(/[?&]id=([^&]+)/);
  if (trimmed.includes('drive.google.com') && fileIdFromQuery) {
    return `https://drive.google.com/uc?export=download&id=${fileIdFromQuery[1]}`;
  }
  return trimmed;
}

const NON_PDF_EXT =
  /\.(jpe?g|png|gif|webp|bmp|heic|docx?|xlsx?|pptx?|txt|zip|rar|mp4|mov)(\?|#|$)/i;

export function isValidResumeUrl(url: string): boolean {
  const normalized = normalizeResumeUrl(url);
  try {
    const parsed = new URL(normalized);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

/** True if URL is likely a PDF (Drive share links allowed; server verifies content). */
export function linkLooksLikePdf(url: string): boolean {
  const normalized = normalizeResumeUrl(url).toLowerCase();
  if (!isValidResumeUrl(url)) return false;
  if (NON_PDF_EXT.test(normalized)) return false;
  if (normalized.includes('drive.google.com')) return true;
  if (/\.pdf(\?|#|$)/i.test(normalized)) return true;
  return false;
}

export function getResumeLinkValidationError(url: string): string | null {
  const trimmed = url.trim();
  if (!trimmed) return 'Paste a resume link first.';
  if (!isValidResumeUrl(trimmed)) {
    return 'Enter a valid http:// or https:// link.';
  }
  if (!linkLooksLikePdf(trimmed)) {
    return 'Only PDF resumes are supported. Use a .pdf link or a public Google Drive PDF link.';
  }
  return null;
}

export function isPdfFileName(fileName: string, mimeType?: string | null): boolean {
  const name = (fileName || '').trim().toLowerCase();
  const mime = (mimeType || '').trim().toLowerCase();
  if (mime && mime !== 'application/pdf') return false;
  if (name && !name.endsWith('.pdf')) return false;
  return Boolean(name.endsWith('.pdf') || mime === 'application/pdf');
}

export function getResumeFileValidationError(
  fileName: string,
  mimeType?: string | null,
): string | null {
  if (!isPdfFileName(fileName, mimeType)) {
    return 'Only PDF files are supported. Please select a .pdf resume.';
  }
  return null;
}

export function linkDisplayHost(url: string): string {
  try {
    return new URL(normalizeResumeUrl(url)).hostname.replace(/^www\./, '');
  } catch {
    return 'PDF link';
  }
}
