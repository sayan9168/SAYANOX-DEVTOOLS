export type Severity = "info" | "warning" | "error";
export interface Finding {
  rule: string;
  message: string;
  severity: Severity;
  line: number;
  column?: number;
  suggestion?: string;
}
export interface AnalysisResult {
  file: string;
  findings: Finding[];
  score: number;
}
