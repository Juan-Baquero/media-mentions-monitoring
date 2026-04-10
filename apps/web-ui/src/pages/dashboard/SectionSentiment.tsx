import React from "react";
import { DualAxes } from "@ant-design/plots";
import { NoteSentiment, NoteSentimentColor } from "@repo/shared";
import { DASHBOARD_THEME } from "./DashboardTheme";
import type { SectionSentimentProps } from "./types";

/**
 * Sección 2: "Publicaciones y audiencia por sentimiento"
 * Gráfico de barras apiladas (menciones por sentimiento) + área (audiencia), doble eje Y.
 */
const SectionSentiment: React.FC<SectionSentimentProps> = ({
  dateRange: fechaRango,
  sentimentData: { tableByTopic },
}) => {
  // Datos para las barras: una fila por (topic × sentimiento), orden fijo: Negativa → Neutra → Positiva
  const barData = tableByTopic.flatMap((row) => [
    {
      topic: row.topic,
      sentiment: NoteSentiment.NEGATIVO,
      value: Number(row[NoteSentiment.NEGATIVO]),
    },
    {
      topic: row.topic,
      sentiment: NoteSentiment.NEUTRO,
      value: Number(row[NoteSentiment.NEUTRO]),
    },
    {
      topic: row.topic,
      sentiment: NoteSentiment.POSITIVO,
      value: Number(row[NoteSentiment.POSITIVO]),
    },
  ]);

  // Datos para el área: una fila por topic
  const areaData = tableByTopic.map((row) => ({
    topic: row.topic,
    audience: row.audience,
  }));

  const sentimentOrder = [
    NoteSentiment.NEGATIVO,
    NoteSentiment.NEUTRO,
    NoteSentiment.POSITIVO,
  ];
  const sentimentColors = [
    NoteSentimentColor.NEGATIVO,
    NoteSentimentColor.NEUTRO,
    NoteSentimentColor.POSITIVO,
  ];

  const config = {
    children: [
      {
        type: "area",
        data: areaData,
        encode: { x: "topic", y: "audience" },
        scale: { y: { key: "right" } },
        style: {
          fill: "#1890ff",
          fillOpacity: 0.1,
          stroke: "transparent",
          lineWidth: 0,
        },
        axis: {
          y: { title: "Audiencia", position: "right" },
        },
        legend: false,
        tooltip: (datum: any) => ({
          name: "Audiencia",
          value: datum.audience,
        }),
      },
      {
        type: "interval",
        data: barData,
        encode: { x: "topic", y: "value", color: "sentiment" },
        transform: [{ type: "stackY" }],
        scale: {
          color: {
            domain: sentimentOrder,
            range: sentimentColors,
          },
          y: { key: "left" },
          x: { paddingInner: 0.3 },
        },
        axis: {
          y: { title: "Menciones", position: "left" },
        },
        legend: { color: { title: false } },
      },
    ],
  };

  return (
    <div style={DASHBOARD_THEME.sectionContainer}>
      {/* Renglón de fecha */}
      {fechaRango && <div style={DASHBOARD_THEME.dateStyle}>{fechaRango}</div>}
      {/* Título */}
      <div style={DASHBOARD_THEME.titleStyle}>
        {"Publicaciones y audiencia por sentimiento"}
      </div>
      {/* Gráfica — ocupa la primera mitad vertical del espacio restante */}
      <div style={{ flex: 1, height: "50%", marginTop: 16 }}>
        <DualAxes
          {...(config as unknown as Parameters<typeof DualAxes>[0])}
          style={{ height: "100%" }}
        />
      </div>
    </div>
  );
};

export default SectionSentiment;
