import type { TestCase } from "../quests/types";

export interface PyError {
  type: string;
  message: string;
  line: number | null;
}

export interface TestResult {
  name: string;
  call: string;
  expected: string;
  actual?: string;
  error?: PyError;
  passed: boolean;
}

export interface RunResult {
  stdout: string;
  error: PyError | null;
  tests: TestResult[];
}

export interface RunRequest {
  id: number;
  code: string;
  tests: TestCase[];
}

export type WorkerMessage =
  | { type: "ready" }
  | { type: "load-error"; message: string }
  | { type: "result"; id: number; result: RunResult };
