
export enum ViewType {
  FRONT = '正面（对称性与受力）',
  SIDE = '侧面（生理曲度与姿态）'
}

export enum Severity {
  SEVERE = '严重',
  MODERATE = '中度',
  MILD = '轻微'
}

export interface BodyIssue {
  issueName: string;
  severity: Severity;
  description: string;
  suggestion: string;
  points: { x: number, y: number, label: string }[];
}

export interface AnalysisResult {
  overallScore: number;
  viewDetected: ViewType;
  issues: BodyIssue[];
  summary: string;
}
