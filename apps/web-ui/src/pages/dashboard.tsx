import React, { useState, useEffect } from "react";
import PptxGenJS from "pptxgenjs";
import html2canvas from "html2canvas";
import { DatePicker, Button, message } from "antd";
import dayjs from "dayjs";
import isoWeek from "dayjs/plugin/isoWeek";
dayjs.extend(isoWeek);
import api from "../services/Agent";
import { useQuery } from "react-query";
import { Pie } from "@ant-design/plots";

/** Paleta centralizada del dashboard — cambiar aquí afecta todas las secciones */
const DASHBOARD_THEME = {
  /** Fondo de cada tarjeta / sección */
  sectionBg: "#fff",
  /** Color de los títulos de sección */
  titleColor: "#00684d",
  /** Fondo de la slide en el PPT (hex sin #) */
  slideBgHex: "FFFFFF",
  /** Estilo del renglón de fecha (aplica a todas las secciones) */
  dateStyle: {
    background: "#fff",
    color: "#989898",
    padding: "6px 0",
    textAlign: "left" as const,
    borderRadius: 4,
    fontSize: 12,
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  /** Estilo de los títulos de sección (aplica a todas las secciones) */
  titleStyle: {
    color: "#00684d",
    fontWeight: 700,
    fontSize: 32,
    textAlign: "left",
  },
} as const;

const DashboardPage: React.FC = () => {
  const [selectedDates, setSelectedDates] = useState<
    [dayjs.Dayjs | null, dayjs.Dayjs | null] | null
  >(null);
  const [minDate, setMinDate] = useState<string | null>(null);
  const [maxDate, setMaxDate] = useState<string | null>(null);

  useEffect(() => {
    const fetchDates = async () => {
      try {
        const res = await api.post("/notes/dates", {});
        setMinDate(res.data.minDate);
        setMaxDate(res.data.maxDate);
        if (res.data.maxDate) {
          const max = dayjs(res.data.maxDate, "YYYY-MM-DD");
          setSelectedDates([max.startOf("isoWeek"), max.endOf("isoWeek")]);
        }
      } catch {
        setMinDate(null);
        setMaxDate(null);
      }
    };
    fetchDates();
  }, []);

  const {
    data: notes,
    isLoading,
    error,
    refetch,
  } = useQuery(
    ["notes", selectedDates],
    async () => {
      if (!(selectedDates?.[0] && selectedDates?.[1])) return [];
      const res = await api.post("/notes/list", {
        startDate: selectedDates[0]?.format("YYYY-MM-DD"),
        endDate: selectedDates[1]?.format("YYYY-MM-DD"),
      });
      return res.data;
    },
    { enabled: !!selectedDates?.[0] && !!selectedDates?.[1] },
  );

  const handleDateChange = (
    dates: [dayjs.Dayjs | null, dayjs.Dayjs | null] | null,
  ) => {
    setSelectedDates(dates);
    refetch();
  };

  // Agrupar por sentimiento
  const sentimentData = React.useMemo(() => {
    if (!notes) return [];
    const counts: Record<string, number> = {};
    notes.forEach((n: { sentiment?: string }) => {
      const s = n.sentiment || "Sin sentimiento";
      counts[s] = (counts[s] || 0) + 1;
    });
    return Object.entries(counts).map(([type, value]) => ({ type, value }));
  }, [notes]);

  // Agrupar por tipo de medio
  const mediaData = React.useMemo(() => {
    if (!notes) return [];
    const counts: Record<string, number> = {};
    notes.forEach((n: { media?: string }) => {
      const m = n.media || "Sin medio";
      counts[m] = (counts[m] || 0) + 1;
    });
    return Object.entries(counts).map(([type, value]) => ({ type, value }));
  }, [notes]);

  const pieConfigs = [
    {
      title: "Notas por sentimiento",
      data: sentimentData,
      label: "sentimiento",
    },
    {
      title: "Notas por tipo de medio",
      data: mediaData,
      label: "medio",
    },
  ];

  const getPieConfig = (data: any[]) => ({
    appendPadding: 10,
    data,
    angleField: "value",
    colorField: "type",
    radius: 1,
    label: {
      content: ({ type, percent }: { type: string; percent: number }) =>
        `${type}: ${(percent * 100).toFixed(1)}%`,
    },
    interactions: [{ type: "element-active" }],
  });

  const getCurrentWeek = (): [dayjs.Dayjs, dayjs.Dayjs] => {
    const today = dayjs();
    return [today.startOf("isoWeek"), today.endOf("isoWeek")];
  };

  // Formatear la fecha seleccionada
  const meses = [
    "enero",
    "febrero",
    "marzo",
    "abril",
    "mayo",
    "junio",
    "julio",
    "agosto",
    "septiembre",
    "octubre",
    "noviembre",
    "diciembre",
  ];
  let fechaRango = "";
  if (selectedDates && selectedDates[0] && selectedDates[1]) {
    const inicio = selectedDates[0];
    const fin = selectedDates[1];
    const diaInicio = inicio.format("DD");
    const mesInicio = meses[inicio.month()];
    const diaFin = fin.format("DD");
    const mesFin = meses[fin.month()];
    const anio = fin.format("YYYY");
    if (mesInicio === mesFin) {
      fechaRango = `${mesInicio.charAt(0).toUpperCase() + mesInicio.slice(1)} ${diaInicio} a ${diaFin} de ${anio}`;
    } else {
      fechaRango = `${mesInicio.charAt(0).toUpperCase() + mesInicio.slice(1)} ${diaInicio} a ${mesFin.charAt(0).toUpperCase() + mesFin.slice(1)} ${diaFin} de ${anio}`;
    }
  }

  // Títulos personalizados por sección
  const seccionTitulos = [
    {
      titulo: "Comportamiento y temáticas principales",
      color: DASHBOARD_THEME.titleColor,
    },
    {
      titulo: "Publicaciones y audiencia por\nsentimiento",
      color: DASHBOARD_THEME.titleColor,
    },
  ];

  // Contenido principal
  let content;
  if (isLoading) {
    content = <div>Cargando datos...</div>;
  } else if (error) {
    content = <div>Error al cargar datos</div>;
  } else {
    content = (
      <div id="dashboard-fixed-sections">
        {pieConfigs.map((cfg, idx) => (
          <div
            key={cfg.title}
            style={{
              margin: "32px auto",
              width: 960,
              height: 540,
              background: DASHBOARD_THEME.sectionBg,
              borderRadius: 8,
              padding: 24,
              boxSizing: "border-box",
              overflow: "hidden",
            }}
          >
            {/* Renglón de fecha */}
            {fechaRango && (
              <div style={DASHBOARD_THEME.dateStyle}>{fechaRango}</div>
            )}
            {/* Título personalizado */}
            <div style={DASHBOARD_THEME.titleStyle}>
              {seccionTitulos[idx]?.titulo || cfg.title}
            </div>
            {/* Renglón de resumen (solo primera sección) */}
            {idx === 0 && (
              <div
                style={{
                  display: "flex",
                  height: 70,
                  borderRadius: 6,
                  overflow: "hidden",
                  marginTop: 4,
                }}
              >
                {/* 1/5 — Publicaciones */}
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
                    {notes?.length ?? 0}
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
                {/* Sección verde */}
                <div
                  style={{
                    flex: 3,
                    background: "#00b050",
                    marginLeft: 4,
                    marginRight: 4,
                  }}
                />
                {/* Sección gris */}
                <div
                  style={{
                    flex: 1,
                    background: "#595959",
                  }}
                />
              </div>
            )}
            <Pie
              {...getPieConfig(cfg.data)}
              style={{
                width: 640,
                height: 360,
                margin: "0 auto",
                background: DASHBOARD_THEME.sectionBg,
              }}
            />
          </div>
        ))}
      </div>
    );
  }

  // Exportar a PowerPoint usando solo los elementos visibles
  const handleExportPPTX = async () => {
    if (!pieConfigs.length || pieConfigs.every((cfg) => !cfg.data.length)) {
      message.warning("No hay datos para exportar");
      return;
    }
    try {
      const pptx = new PptxGenJS();

      // Capturar las secciones fijas visibles
      const fixedSections = document.querySelectorAll(
        "#dashboard-fixed-sections > div",
      );
      for (let i = 0; i < fixedSections.length; i++) {
        const sectionDiv = fixedSections[i] as HTMLDivElement;
        if (sectionDiv) {
          const slide = pptx.addSlide();
          slide.background = { color: DASHBOARD_THEME.slideBgHex };
          await new Promise((res) => setTimeout(res, 300));
          const canvas = await html2canvas(sectionDiv, {
            backgroundColor: DASHBOARD_THEME.sectionBg,
            useCORS: true,
            width: 960,
            height: 540,
            scale: 1,
          });
          const imgData = canvas.toDataURL("image/png");
          slide.addImage({ data: imgData, x: 0, y: 0, w: 10, h: 5.625 });
        }
      }

      await pptx.writeFile({ fileName: "dashboard-notas.pptx" });
      message.success("Presentación descargada correctamente");
    } catch (err) {
      console.error(err);
      message.error("Error al generar la presentación");
    }
  };

  return (
    <div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 24,
        }}
      >
        <div>
          <DatePicker.RangePicker
            value={selectedDates}
            onChange={handleDateChange}
            style={{ minWidth: 240 }}
            allowClear={false}
            disabledDate={(current) => {
              if (!minDate || !maxDate) return false;
              const min = dayjs(minDate, "YYYY-MM-DD");
              const max = dayjs(maxDate, "YYYY-MM-DD");
              return current < min || current > max;
            }}
            renderExtraFooter={() => (
              <button
                style={{ width: "100%" }}
                onClick={() => setSelectedDates(getCurrentWeek())}
              >
                Seleccionar semana actual
              </button>
            )}
          />
        </div>
        <div>
          <Button
            type="primary"
            onClick={handleExportPPTX}
            style={{ marginLeft: 16 }}
          >
            Descargar PPTX
          </Button>
        </div>
      </div>
      <div>{content}</div>
    </div>
  );
};

export default DashboardPage;
