import * as DocumentPicker from "expo-document-picker";
import { useEffect, useRef, useState } from "react";
import { Alert, StyleSheet, Text, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import {
  analyzeResume,
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
import { FeedCard } from "../components/FeedCard";
import { PageHeader } from "../components/PageHeader";
import { ResumePreview } from "../components/ResumePreview";
import { ScreenLayout } from "../components/ScreenLayout";
import { StatusPill } from "../components/StatusPill";
import { PageImages } from "../constants/pexels";
import { layout, spacing, typography } from "../theme";
import { RootStackParamList } from "../navigation/types";

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
    if (!result.canceled && result.assets[0]) {
      setFile(result.assets[0]);
    }
  };

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
    if (!file?.uri) {
      Alert.alert("Tech resume", "Please upload your tech resume as a PDF.");
      return;
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
      const data = await analyzeResume({
        uri: file.uri,
        fileName: file.name || "resume.pdf",
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

        <FeedCard title="Tech resume PDF" accent="skills" noPadding>
          {file ? (
            <ResumePreview
              uri={file.uri}
              fileName={file.name ?? "resume.pdf"}
              fileSize={file.size}
            />
          ) : (
            <View style={styles.emptyWrap}>
              <EmptyState
                message="No tech resume attached"
                hint="Upload a PDF with your skills, projects, and experience"
              />
            </View>
          )}
          <View style={[styles.actions, file && styles.actionsPad]}>
            <View style={styles.actionBtn}>
              <Button
                title="Select PDF"
                onPress={pickPdf}
                variant="secondary"
              />
            </View>
            <View style={styles.actionBtn}>
              <Button
                title={runLabel}
                onPress={onAnalyze}
                loading={analyzing}
              />
            </View>
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
  emptyWrap: { padding: layout.cardPadding },
  actions: {
    flexDirection: "row",
    gap: spacing.md,
    paddingHorizontal: layout.cardPadding,
  },
  actionsPad: {
    paddingBottom: layout.cardPadding,
    paddingTop: spacing.lg,
  },
  actionBtn: { flex: 1 },
});
