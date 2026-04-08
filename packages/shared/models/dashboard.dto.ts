/** DTO para la respuesta del endpoint de dashboard con datos pre-calculados */

import { NoteSentiment } from "./note.enum";

export type DashboardPeriod = "semana" | "mes" | "trimestre" | "anual";

export interface ChartDataItem {
  type: string;
  value: number;
}

export interface tableDataItem {
  topic: string;
  subtopic: string;
  audience: number;
  totalNotes: number;
  [NoteSentiment.POSITIVO]: string;
  [NoteSentiment.NEGATIVO]: string;
  [NoteSentiment.NEUTRO]: string;
}

/** Datos pre-calculados para la sección "Comportamiento y temáticas principales" */
export interface DashboardBehaviorSection {
  totalNotes: number;
  directNotes: number;
  indirectNotes: number;
  tableData: tableDataItem[];
  sentimentData: ChartDataItem[];
  /** Porcentaje de diferencia en publicaciones directas vs período anterior */
  comparisonDirectPercentage?: number;
}

/** Datos pre-calculados para la sección "Publicaciones y audiencia por sentimiento" */
export interface DashboardSentimentSection {
  mediaData: ChartDataItem[];
}

/** Respuesta completa del endpoint /notes/dashboard */
export interface DashboardDataDto {
  period: DashboardPeriod;
  behavior: DashboardBehaviorSection;
  sentiment: DashboardSentimentSection;
}
