import { AnalyzeResult } from '../api/client';

export type RootStackParamList = {
  Main: undefined;
  Results: { result: AnalyzeResult };
  Login: undefined;
};

export type TabParamList = {
  Home: undefined;
  Analyze: undefined;
  Feedback: undefined;
  About: undefined;
  Profile: undefined;
};
