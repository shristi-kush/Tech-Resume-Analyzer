import * as DocumentPicker from "expo-document-picker";
import { useEffect, useRef, useState } from "react";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import {
  analyzeResume,
  analyzeResumeFromLink,
  checkApiHealth,
  checkOllamaStatus,
} from "../api/client";
import {
  AnalysisMode,
  AnalysisModePicker,
} from "../components/AnalysisModePicker";
import { AnalysisSplash, getAnalysisSteps } from "../components/AnalysisSplash";
import { Button } from "../components/Button";
import { EmptyState } from "../components/EmptyState";
import { Input } from "../components/Input";
import { FeedCard } from "../components/FeedCard";
import { PageHeader } from "../components/PageHeader";
import { ResumePreview } from "../components/ResumePreview";
import { ScreenLayout } from "../components/ScreenLayout";
import { StatusPill } from "../components/StatusPill";
import { PageImages } from "../constants/pexels";
import { colors, layout, radius, spacing, typography } from "../theme";
import { RootStackParamList } from "../navigation/types";
import {
  getResumeFileValidationError,
  getResumeLinkValidationError,
  linkDisplayHost,
  normalizeResumeUrl,
} from "../utils/resumeLink";

const STEP_MS = 1100;
const FINISH_MS = 450;

function delay(ms: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms));
}

export function AnalyzeScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [file, setFile] = useState<DocumentPicker.DocumentPickerAsset | null>(
    null,
  );
  const [resumeLink, setResumeLink] = useState("");
  const [importedLink, setImportedLink] = useState<string | null>(null);
  const [analysisMode, setAnalysisMode] = useState<AnalysisMode>("nlp");
  const [analyzing, setAnalyzing] = useState(false);
  const [splashStep, setSplashStep] = useState(0);
  const [serviceOnline, setServiceOnline] = useState<boolean | null>(null);
  const [detailedAvailable, setDetailedAvailable] = useState<boolean | null>(
    null,
  );
  const stepTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const splashSteps = getAnalysisSteps(analysisMode);

  useEffect(() => {
    checkApiHealth().then(setServiceOnline);
    checkOllamaStatus().then((s) => setDetailedAvailable(s.available));
  }, []);

  useEffect(() => {
    return () => {
      if (stepTimerRef.current) clearInterval(stepTimerRef.current);
    };
  }, []);

  const pickPdf = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: "application/pdf",
      copyToCacheDirectory: true,
    });
    if (result.canceled || !result.assets[0]) return;

    const asset = result.assets[0];
    const fileError = getResumeFileValidationError(
      asset.name ?? "",
      asset.mimeType,
    );
    if (fileError) {
      Alert.alert("Not a PDF", fileError);
      return;
    }

    setFile(asset);
    setImportedLink(null);
    setResumeLink("");
  };

  const importFromLink = () => {
    const linkError = getResumeLinkValidationError(resumeLink);
    if (linkError) {
      Alert.alert("Not a PDF link", linkError);
      return;
    }
    setImportedLink(normalizeResumeUrl(resumeLink));
    setFile(null);
    Alert.alert(
      "PDF link ready",
      "Tap Analyze to process this resume. The server will download the PDF from your link.",
    );
  };

  const clearResume = () => {
    setFile(null);
    setImportedLink(null);
    setResumeLink("");
  };

  const effectiveLink =
    importedLink ||
    (resumeLink.trim() ? normalizeResumeUrl(resumeLink) : null);
  const hasResume = Boolean(file?.uri || effectiveLink);

  const stopStepTimer = () => {
    if (stepTimerRef.current) {
      clearInterval(stepTimerRef.current);
      stepTimerRef.current = null;
    }
  };

  const startStepTimer = (stepsCount: number) => {
    stopStepTimer();
    stepTimerRef.current = setInterval(() => {
      setSplashStep((prev) => {
        const holdAt = Math.max(0, stepsCount - 2);
        if (prev >= holdAt) return prev;
        return prev + 1;
      });
    }, STEP_MS);
  };

  const onAnalyze = async () => {
    if (!hasResume) {
      Alert.alert(
        "Tech resume",
        "Select a PDF or import a public PDF link (e.g. Google Drive).",
      );
      return;
    }

    if (file) {
      const fileError = getResumeFileValidationError(
        file.name ?? "",
        file.mimeType,
      );
      if (fileError) {
        Alert.alert("Not a PDF", fileError);
        return;
      }
    }

    if (effectiveLink && !file) {
      const linkError = getResumeLinkValidationError(effectiveLink);
      if (linkError) {
        Alert.alert("Not a PDF link", linkError);
        return;
      }
    }

    if (analysisMode === "ollama" && detailedAvailable === false) {
      Alert.alert(
        "Detailed review unavailable",
        "This option is not available right now. Please use quick scan, or try again later.",
      );
      return;
    }

    const steps = getAnalysisSteps(analysisMode);
    setSplashStep(0);
    setAnalyzing(true);
    startStepTimer(steps.length);

    try {
      const data = effectiveLink && !file
        ? await analyzeResumeFromLink({
            resumeUrl: effectiveLink,
            analysisMode,
          })
        : await analyzeResume({
            uri: file!.uri,
            fileName: file!.name || "resume.pdf",
            analysisMode,
          });

      stopStepTimer();
      setSplashStep(steps.length - 1);
      await delay(FINISH_MS);
      setAnalyzing(false);
      navigation.navigate("Results", { result: data });
    } catch (e: unknown) {
      stopStepTimer();
      setAnalyzing(false);
      Alert.alert("Error", e instanceof Error ? e.message : "Analysis failed");
    }
  };

  const runLabel = "Analyze";

  return (
    <>
      <ScreenLayout>
        <PageHeader
          title="Analyze your tech resume"
          subtitle="Software, data, mobile, DevOps & more"
          imageUri={PageImages.analyze}
          height={220}
          right={
            serviceOnline !== null ? (
              <StatusPill
                label={serviceOnline ? "Online" : "Offline"}
                tone={serviceOnline ? "success" : "warning"}
              />
            ) : undefined
          }
        />

        <FeedCard
          title="Analysis type"
          subtitle="Pick how deeply we review your engineering profile"
          accent="skills"
        >
          <AnalysisModePicker
            value={analysisMode}
            onChange={setAnalysisMode}
            detailedAvailable={detailedAvailable}
          />
          <Text style={styles.modeHint}>
            {analysisMode === "nlp"
              ? "Best for a fast read on skills, track, and tech resume structure."
              : "Best for deeper feedback on projects, gaps, and upskilling."}
          </Text>
        </FeedCard>

        <FeedCard title="Tech resume (PDF only)" accent="skills" noPadding>
          <View style={styles.linkSection}>
            <Input
              label="Or paste a PDF link (Google Drive or .pdf URL)"
              value={resumeLink}
              onChangeText={setResumeLink}
              placeholder="https://drive.google.com/file/d/..."
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="url"
            />
          </View>

          {file ? (
            <ResumePreview
              uri={file.uri}
              fileName={file.name ?? "resume.pdf"}
              fileSize={file.size}
            />
          ) : effectiveLink ? (
            <View style={styles.linkReady}>
              <Text style={styles.linkReadyTitle}>PDF ready from link</Text>
              <Text style={styles.linkReadyHost}>
                {linkDisplayHost(effectiveLink)}
              </Text>
              <Text style={styles.linkReadyHint} numberOfLines={2}>
                {effectiveLink}
              </Text>
              <Pressable onPress={clearResume} hitSlop={8}>
                <Text style={styles.clearLink}>Remove</Text>
              </Pressable>
            </View>
          ) : (
            <View style={styles.emptyWrap}>
              <EmptyState
                message="No tech resume attached"
                hint="PDF only — select a .pdf file or paste a public Google Drive / .pdf link"
              />
            </View>
          )}

          <View style={[styles.actions, hasResume && styles.actionsPad]}>
            <View style={styles.actionBtn}>
              <Button
                title="Select PDF"
                onPress={pickPdf}
                variant="secondary"
              />
            </View>
            <View style={styles.actionBtn}>
              <Button
                title="Import link"
                onPress={importFromLink}
                variant="secondary"
                disabled={!resumeLink.trim()}
              />
            </View>
          </View>
          <View style={[styles.analyzeRow, hasResume && styles.actionsPad]}>
            <Button
              title={runLabel}
              onPress={onAnalyze}
              loading={analyzing}
              disabled={!hasResume}
            />
          </View>
        </FeedCard>
      </ScreenLayout>

      <AnalysisSplash
        visible={analyzing}
        steps={splashSteps}
        currentIndex={splashStep}
        mode={analysisMode}
      />
    </>
  );
}

const styles = StyleSheet.create({
  modeHint: { ...typography.caption, marginTop: spacing.lg },
  linkSection: {
    paddingHorizontal: layout.cardPadding,
    paddingTop: layout.cardPadding,
  },
  emptyWrap: { padding: layout.cardPadding },
  linkReady: {
    marginHorizontal: layout.cardPadding,
    padding: spacing.lg,
    backgroundColor: colors.backgroundAlt,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  linkReadyTitle: { ...typography.bodyStrong, color: colors.text },
  linkReadyHost: { ...typography.captionMedium, color: colors.accent, marginTop: spacing.xs },
  linkReadyHint: { ...typography.caption, color: colors.textMuted, marginTop: spacing.sm },
  clearLink: { ...typography.captionBold, color: colors.accent, marginTop: spacing.md },
  actions: {
    flexDirection: "row",
    gap: spacing.md,
    paddingHorizontal: layout.cardPadding,
    paddingTop: spacing.lg,
  },
  actionsPad: {
    paddingBottom: 0,
  },
  actionBtn: { flex: 1 },
  analyzeRow: {
    paddingHorizontal: layout.cardPadding,
    paddingTop: spacing.md,
    paddingBottom: layout.cardPadding,
  },
});
