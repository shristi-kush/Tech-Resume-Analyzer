import * as FileSystem from 'expo-file-system/legacy';
import * as IntentLauncher from 'expo-intent-launcher';
import * as Sharing from 'expo-sharing';
import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { WebView, WebViewMessageEvent } from 'react-native-webview';
import { colors, radius, spacing, typography } from '../theme';

const PREVIEW_HEIGHT = 360;
const PREVIEW_DIR = 'resume-preview';
const PDF_NAME = 'document.pdf';

type Props = {
  uri: string;
  fileName: string;
  fileSize?: number | null;
};

/** HTML shell: PDF.js renders base64 injected from React Native */
const VIEWER_HTML = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=4.0" />
  <script src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js"></script>
  <style>
    * { box-sizing: border-box; }
    html, body { margin: 0; padding: 0; background: #f1f5f9; font-family: -apple-system, sans-serif; }
    #status { text-align: center; color: #64748b; padding: 32px 16px; font-size: 14px; }
    #pages { padding: 8px; }
    canvas { display: block; width: 100% !important; height: auto !important; margin: 0 auto 12px; background: #fff; border: 1px solid #e2e8f0; }
    #err { color: #dc2626; padding: 16px; text-align: center; font-size: 13px; }
  </style>
</head>
<body>
  <div id="status">Loading PDF…</div>
  <div id="pages"></div>
  <div id="err" style="display:none"></div>
  <script>
    pdfjsLib.GlobalWorkerOptions.workerSrc =
      'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

    function post(msg) {
      if (window.ReactNativeWebView) window.ReactNativeWebView.postMessage(JSON.stringify(msg));
    }

    window.renderPdf = async function (base64) {
      const status = document.getElementById('status');
      const pages = document.getElementById('pages');
      const errEl = document.getElementById('err');
      try {
        const raw = atob(base64);
        const bytes = new Uint8Array(raw.length);
        for (let i = 0; i < raw.length; i++) bytes[i] = raw.charCodeAt(i);
        const pdf = await pdfjsLib.getDocument({ data: bytes }).promise;
        status.style.display = 'none';
        const maxPages = Math.min(pdf.numPages, 5);
        for (let n = 1; n <= maxPages; n++) {
          const page = await pdf.getPage(n);
          const baseViewport = page.getViewport({ scale: 1 });
          const scale = Math.min((window.innerWidth - 16) / baseViewport.width, 2);
          const viewport = page.getViewport({ scale });
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          canvas.width = viewport.width;
          canvas.height = viewport.height;
          pages.appendChild(canvas);
          await page.render({ canvasContext: ctx, viewport }).promise;
        }
        if (pdf.numPages > maxPages) {
          const more = document.createElement('p');
          more.style.cssText = 'text-align:center;color:#64748b;font-size:12px;padding:8px';
          more.textContent = '+' + (pdf.numPages - maxPages) + ' more page(s) — tap Open to view full PDF';
          pages.appendChild(more);
        }
        post({ type: 'ready', pages: pdf.numPages });
      } catch (e) {
        status.style.display = 'none';
        errEl.style.display = 'block';
        errEl.textContent = 'Preview failed: ' + (e.message || e);
        post({ type: 'error', message: String(e.message || e) });
      }
    };
    post({ type: 'loaded' });
  </script>
</body>
</html>`;

function toFileUri(path: string): string {
  if (path.startsWith('file://')) return path;
  return `file://${path.startsWith('/') ? '' : '/'}${path}`;
}

async function copyPdfToCache(sourceUri: string): Promise<string> {
  const base = FileSystem.cacheDirectory;
  if (!base) throw new Error('Cache directory unavailable');

  const dir = `${base.replace(/\/$/, '')}/${PREVIEW_DIR}/`;
  await FileSystem.makeDirectoryAsync(dir, { intermediates: true });

  const destUri = toFileUri(`${dir}${PDF_NAME}`);
  try {
    await FileSystem.deleteAsync(destUri, { idempotent: true });
  } catch {
    /* ignore */
  }

  await FileSystem.copyAsync({ from: sourceUri, to: destUri });
  return destUri;
}

async function readPdfBase64(fileUri: string): Promise<string> {
  // Android requires a file:// URI — bare paths cause "Unsupported scheme"
  return FileSystem.readAsStringAsync(toFileUri(fileUri), {
    encoding: FileSystem.EncodingType.Base64,
  });
}

export async function openPdfExternally(localPath: string): Promise<void> {
  const fileUri = toFileUri(localPath);

  try {
    if (Platform.OS === 'android') {
      const contentUri = await FileSystem.getContentUriAsync(fileUri);
      await IntentLauncher.startActivityAsync('android.intent.action.VIEW', {
        data: contentUri,
        flags: 1,
        type: 'application/pdf',
      });
      return;
    }

    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(fileUri, {
        mimeType: 'application/pdf',
        UTI: 'com.adobe.pdf',
        dialogTitle: 'Open resume PDF',
      });
      return;
    }

    throw new Error('No viewer available on this device');
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Could not open PDF';
    Alert.alert('Open PDF', msg);
  }
}

export function ResumePreview({ uri, fileName, fileSize }: Props) {
  const webRef = useRef<WebView>(null);
  const [localPath, setLocalPath] = useState<string | null>(null);
  const [base64, setBase64] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [webReady, setWebReady] = useState(false);
  const [injected, setInjected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pageCount, setPageCount] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      setLoading(true);
      setError(null);
      setLocalPath(null);
      setBase64(null);
      setWebReady(false);
      setInjected(false);
      setPageCount(null);

      try {
        const cached = await copyPdfToCache(uri);
        const b64 = await readPdfBase64(cached);
        if (cancelled) return;
        setLocalPath(cached);
        setBase64(b64);
      } catch (e) {
        if (!cancelled) {
          setError(
            e instanceof Error ? e.message : 'Could not read this PDF. Try another file.'
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [uri]);

  useEffect(() => {
    if (!webReady || !base64 || injected || error) return;

    const payload = JSON.stringify(base64);
    webRef.current?.injectJavaScript(`window.renderPdf(${payload}); true;`);
    setInjected(true);
  }, [webReady, base64, injected, error]);

  const onWebMessage = (event: WebViewMessageEvent) => {
    try {
      const data = JSON.parse(event.nativeEvent.data) as {
        type: string;
        pages?: number;
        message?: string;
      };
      if (data.type === 'ready' && data.pages) setPageCount(data.pages);
      if (data.type === 'error') setError(data.message ?? 'Preview failed');
    } catch {
      /* ignore */
    }
  };

  const openExternal = () => {
    if (localPath) openPdfExternally(localPath);
    else Alert.alert('Open PDF', 'PDF is not ready yet.');
  };

  const sizeLabel =
    fileSize != null ? `${(fileSize / 1024).toFixed(1)} KB` : undefined;

  return (
    <View style={styles.wrap}>
      <View style={styles.meta}>
        <View style={styles.metaText}>
          <Text style={styles.label}>PREVIEW · PDF</Text>
          <Text style={styles.name} numberOfLines={1}>
            {fileName}
          </Text>
          {sizeLabel ? <Text style={styles.size}>{sizeLabel}</Text> : null}
          {pageCount ? (
            <Text style={styles.size}>{pageCount} page{pageCount > 1 ? 's' : ''}</Text>
          ) : null}
        </View>
        <Pressable onPress={openExternal} style={styles.openBtn} disabled={!localPath}>
          <Text style={[styles.openBtnText, !localPath && styles.openBtnDisabled]}>Open</Text>
        </Pressable>
      </View>

      <View style={[styles.viewer, { height: PREVIEW_HEIGHT }]}>
        {loading && (
          <View style={styles.center}>
            <ActivityIndicator color={colors.accent} />
            <Text style={styles.hint}>Preparing PDF…</Text>
          </View>
        )}

        {!loading && error && (
          <View style={styles.center}>
            <Text style={styles.error}>{error}</Text>
            <Pressable onPress={openExternal} disabled={!localPath}>
              <Text style={styles.openLink}>Open in PDF app</Text>
            </Pressable>
          </View>
        )}

        {!loading && !error && base64 && (
          <WebView
            ref={webRef}
            source={{ html: VIEWER_HTML }}
            style={styles.webview}
            originWhitelist={['*']}
            javaScriptEnabled
            domStorageEnabled
            mixedContentMode="always"
            nestedScrollEnabled
            scrollEnabled
            showsVerticalScrollIndicator
            onMessage={onWebMessage}
            onLoadEnd={() => setWebReady(true)}
            onError={() => setError('Web preview failed. Tap Open to view the PDF.')}
            startInLoadingState
            renderLoading={() => (
              <View style={styles.center}>
                <ActivityIndicator color={colors.accent} />
                <Text style={styles.hint}>Rendering pages…</Text>
              </View>
            )}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    overflow: 'hidden',
    backgroundColor: colors.backgroundAlt,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    backgroundColor: colors.surfaceElevated,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  metaText: { flex: 1 },
  label: { ...typography.overline, color: colors.accent, fontSize: 10 },
  name: { ...typography.bodyStrong, marginTop: spacing.xs },
  size: { ...typography.caption, marginTop: spacing.xs },
  openBtn: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    backgroundColor: colors.accentMuted,
  },
  openBtnText: { ...typography.captionBold, color: colors.accent },
  openBtnDisabled: { color: colors.textMuted },
  viewer: {
    width: '100%',
    backgroundColor: colors.surface,
  },
  webview: {
    flex: 1,
    width: '100%',
    height: PREVIEW_HEIGHT,
    backgroundColor: colors.backgroundAlt,
  },
  center: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.md,
    backgroundColor: colors.surface,
  },
  hint: { ...typography.caption, marginTop: spacing.sm },
  error: { ...typography.caption, textAlign: 'center', color: colors.danger },
  openLink: {
    ...typography.captionMedium,
    color: colors.accent,
    marginTop: spacing.sm,
  },
});
