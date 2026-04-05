import React from "react";
import { Pie } from "@ant-design/plots";
import { DASHBOARD_THEME, getPieConfig } from "./DashboardTheme";
import type { SectionBehaviorProps } from "./types";

/**
 * Sección 1: "Comportamiento y temáticas principales"
 * Muestra barra de resumen (publicaciones) + gráfico pie de sentimiento.
 */
const SectionBehavior: React.FC<SectionBehaviorProps> = ({
  dateRange,
  behaviorData: {
    sentimentData,
    totalNotes,
    directNotes,
    indirectNotes,
    tableData,
  },
}) => {
  const directPct =
    totalNotes > 0 ? ((directNotes / totalNotes) * 100).toFixed(1) : "0.0";
  const indirectPct =
    totalNotes > 0 ? ((indirectNotes / totalNotes) * 100).toFixed(1) : "0.0";
  const sentimentColumns = Array.from(
    new Set(
      tableData.flatMap((row) =>
        Object.keys(row).filter(
          (key) => !["topic", "subtopic", "audience"].includes(key),
        ),
      ),
    ),
  );

  return (
    <div
      style={{
        ...DASHBOARD_THEME.sectionContainer,
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Renglón de fecha */}
      {dateRange && <div style={DASHBOARD_THEME.dateStyle}>{dateRange}</div>}
      {/* Título */}
      <div style={DASHBOARD_THEME.titleStyle}>
        Comportamiento y temáticas principales
      </div>
      {/* Barra de resumen */}
      <div
        style={{
          display: "flex",
          height: 90,
          borderRadius: 6,
          overflow: "hidden",
          marginTop: 4,
        }}
      >
        {/* Publicaciones */}
        <div
          style={{
            flex: 1,
            background: "#3c357b",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <span
            style={{
              color: "#fff",
              fontSize: 36,
              fontWeight: 700,
              lineHeight: 1,
            }}
          >
            {totalNotes}
          </span>
          <span
            style={{
              color: "#fff",
              fontSize: 14,
              fontWeight: 500,
              marginTop: 4,
            }}
          >
            Publicaciones
          </span>
        </div>

        {/* Sección verde dividida en 3 */}
        <div
          style={{
            flex: 6,
            background: "#00b050",
            marginLeft: 4,
            marginRight: 4,
            display: "flex",
            color: "#fff",
          }}
        >
          {/* Parte 1 */}
          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              textAlign: "center",
              padding: "8px 6px",
            }}
          >
            <div style={{ fontSize: 30, fontWeight: 700, lineHeight: 1 }}>
              {directNotes}
            </div>
            <div style={{ fontSize: 12, marginTop: 6 }}>
              El volumen total de la conversación
            </div>
            <div style={{ fontSize: 16, fontWeight: 700, marginTop: 4 }}>
              {directPct}%
            </div>
          </div>

          {/* Parte 2 */}
          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              padding: "8px 10px",
              borderLeft: "1px solid rgba(255,255,255,0.35)",
              borderRight: "1px solid rgba(255,255,255,0.35)",
              textAlign: "left",
            }}
          >
            <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 6 }}>
              Publicaciones directas
            </div>
            <div style={{ fontSize: 12, lineHeight: 1.25 }}>
              Empresa o Grupo Empresarial
            </div>
            <div style={{ fontSize: 12, lineHeight: 1.25 }}>
              Financiera - especializadas
            </div>
            <div style={{ fontSize: 12, lineHeight: 1.25 }}>
              Presidente – Ricardo Roa
            </div>
          </div>

          {/* Parte 3 */}
          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              textAlign: "center",
              padding: "8px 6px",
            }}
          >
            <div style={{ fontSize: 34, fontWeight: 900, lineHeight: 1 }}>
              ⬆ 12.5%
            </div>
            <div style={{ fontSize: 13, marginTop: 6 }}>
              vs. semana anterior
            </div>
          </div>
        </div>

        {/* Sección gris */}
        <div
          style={{
            flex: 1,
            background: "#595959",
            color: "#fff",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
            padding: "8px 6px",
          }}
        >
          <div style={{ fontSize: 28, fontWeight: 700, lineHeight: 1 }}>
            {indirectPct}%
          </div>
          <div style={{ fontSize: 14, marginTop: 6, lineHeight: 1.25 }}>
            Publicaciones Indirectas
          </div>
        </div>
      </div>

      <div
        style={{
          display: "flex",
          gap: 12,
          marginTop: 12,
          alignItems: "flex-start",
        }}
      >
        <div
          style={{
            flex: 1,
            border: "1px solid #d9d9d9",
            borderRadius: 6,
            overflow: "visible",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                fontSize: 10,
                color: "#4d4d4d",
              }}
            >
              <thead>
                <tr style={{ background: "#f5f5f5" }}>
                  <th
                    style={{
                      textAlign: "left",
                      padding: "5px 6px",
                      borderBottom: "1px solid #e8e8e8",
                    }}
                  >
                    Topic
                  </th>
                  <th
                    style={{
                      textAlign: "left",
                      padding: "5px 6px",
                      borderBottom: "1px solid #e8e8e8",
                    }}
                  >
                    Subtopic
                  </th>
                  <th
                    style={{
                      textAlign: "right",
                      padding: "5px 6px",
                      borderBottom: "1px solid #e8e8e8",
                    }}
                  >
                    Audiencia
                  </th>
                  {sentimentColumns.map((column) => (
                    <th
                      key={column}
                      style={{
                        textAlign: "right",
                        padding: "5px 6px",
                        borderBottom: "1px solid #e8e8e8",
                        textTransform: "capitalize",
                      }}
                    >
                      {column}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {tableData.map((row, index) => (
                  <tr key={`${row.topic}-${row.subtopic}-${index}`}>
                    <td
                      style={{
                        padding: "4px 6px",
                        borderBottom: "1px solid #f0f0f0",
                      }}
                    >
                      {row.topic}
                    </td>
                    <td
                      style={{
                        padding: "4px 6px",
                        borderBottom: "1px solid #f0f0f0",
                      }}
                    >
                      {row.subtopic}
                    </td>
                    <td
                      style={{
                        textAlign: "right",
                        padding: "4px 6px",
                        borderBottom: "1px solid #f0f0f0",
                      }}
                    >
                      {row.audience}
                    </td>
                    {sentimentColumns.map((column) => (
                      <td
                        key={`${row.subtopic}-${column}-${index}`}
                        style={{
                          textAlign: "right",
                          padding: "4px 6px",
                          borderBottom: "1px solid #f0f0f0",
                        }}
                      >
                        {String(row[column as keyof typeof row] ?? 0)}
                      </td>
                    ))}
                  </tr>
                ))}
                {tableData.length === 0 && (
                  <tr>
                    <td
                      colSpan={3 + sentimentColumns.length}
                      style={{
                        padding: "10px 6px",
                        textAlign: "center",
                        color: "#4d4d4d",
                      }}
                    >
                      No hay datos para mostrar
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div
          style={{
            flex: 1,
            display: "flex",
            alignItems: "stretch",
            justifyContent: "center",
            background: DASHBOARD_THEME.sectionBg,
          }}
        >
          <Pie
            {...getPieConfig(sentimentData)}
            style={{
              width: "100%",
              height: "100%",
              background: DASHBOARD_THEME.sectionBg,
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default SectionBehavior;
