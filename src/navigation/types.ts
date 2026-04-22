export type RootStackParamList = {
  Splash: undefined;
  Home: undefined;
  SubjectSelection: undefined;
  TestSetup: { subject: string };
  Test: { subject: string, questionCount: number };
  Result: { 
    score: number, 
    totalQuestions: number, 
    correctAnswers: number, 
    incorrectAnswers: number, 
    accuracy: number, 
    timeTaken: number,
    subject: string,
    wrongQuestions: any[]
  };
  Analytics: undefined;
  Settings: undefined;
};
