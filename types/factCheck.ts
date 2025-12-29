export interface FactClaim {
  claim: string;
  confidence: 'low' | 'medium' | 'high';
  suggested_query?: string;
  note?: string;
}

export interface FactCheckCitation {
  url: string;
  title?: string;
}

export interface FactCheckEvaluation {
  claim: string;
  verdict: 'supported' | 'contradicted' | 'uncertain';
  confidence: string;
  corrected_claim?: string;
  notes?: string;
  citations?: FactCheckCitation[];
}

export interface FactCheckLog {
  original: string;
  rewritten: string;
  evaluations: FactCheckEvaluation[];
  references: FactCheckCitation[];
  timestamp: number;
  isLocalOnly?: boolean;
}

export interface FactCheckWebResponse {
  rewritten: string;
  evaluations: FactCheckEvaluation[];
  references: FactCheckCitation[];
}

