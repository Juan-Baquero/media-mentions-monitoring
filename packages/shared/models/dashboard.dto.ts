/** DTO para la respuesta del endpoint de dashboard con datos pre-calculados */

import { NoteSentiment } from "./note.enum";

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
}

/** Datos pre-calculados para la sección "Publicaciones y audiencia por sentimiento" */
export interface DashboardSentimentSection {
  mediaData: ChartDataItem[];
}

/** Respuesta completa del endpoint /notes/dashboard */
export interface DashboardDataDto {
  behavior: DashboardBehaviorSection;
  sentiment: DashboardSentimentSection;
}
