export interface PreviewResponse {
  success: boolean;
  fileName: string;
  fileSize: number;
  totalRows: number;
  headers: string[];
  preview: Record<string, string>[];
}

export interface CRMRecord {
  created_at: string;
  name: string;
  email: string;
  country_code: string;
  mobile_without_country_code: string;
  company: string;
  city: string;
  state: string;
  country: string;
  lead_owner: string;
  crm_status: 'GOOD_LEAD_FOLLOW_UP' | 'DID_NOT_CONNECT' | 'BAD_LEAD' | 'SALE_DONE' | string;
  crm_note: string;
  data_source: string;
  possession_time: string;
  description: string;
}

export interface SkippedRecord {
  reason: string;
}

export interface BatchError {
  batch: number;
  error: string;
  affectedRecords: number;
}

export interface ProcessResponse {
  success: boolean;
  fileName: string;
  totalProcessed: number;
  totalImported: number;
  totalSkipped: number;
  records: CRMRecord[];
  skipped: SkippedRecord[];
  errors: BatchError[];
}

export type AppStep = 'upload' | 'preview' | 'processing' | 'results';
