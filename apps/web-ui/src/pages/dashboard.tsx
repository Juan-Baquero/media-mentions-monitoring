import React, { useState, useEffect, useRef } from "react";
import PptxGenJS from "pptxgenjs";
import html2canvas from "html2canvas";
import { DatePicker, Row, Col, Card, Tabs, Button, message } from "antd";
import dayjs from "dayjs";
import isoWeek from "dayjs/plugin/isoWeek";
dayjs.extend(isoWeek);
import api from "../services/Agent";
import { useQuery } from "react-query";
import { Pie } from "@ant-design/plots";

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

  const [carouselIndex, setCarouselIndex] = useState(0);
  const chartRefs = pieConfigs.map(() => useRef<HTMLDivElement>(null));
  const hiddenChartsContainerRef = useRef<HTMLDivElement>(null);

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

  let content;
  if (isLoading) {
    content = <div>Cargando datos...</div>;
  } else if (error) {
    content = <div>Error al cargar datos</div>;
  } else {
    content = (
      <>
        {/* Secciones fijas debajo del carrusel */}
        <div id="dashboard-fixed-sections">
          {pieConfigs.map((cfg, idx) => (
            <div
              key={cfg.title}
              style={{
                margin: "32px auto",
                maxWidth: 960,
                background: "#fff",
                borderRadius: 8,
                boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                padding: 24,
              }}
            >
              <Pie
                {...getPieConfig(cfg.data)}
                style={{ width: 640, height: 360, margin: "0 auto" }}
              />
              <div
                style={{
                  textAlign: "center",
                  marginTop: 12,
                  fontWeight: 600,
                  fontSize: 18,
                }}
              >
                {cfg.title}
              </div>
            </div>
          ))}
        </div>
      </>
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
      // 1. Capturar la gráfica visible del carrusel
      const carouselDiv = chartRefs[carouselIndex]?.current;
      if (carouselDiv) {
        const slide = pptx.addSlide();
        await new Promise((res) => setTimeout(res, 300));
        const canvas = await html2canvas(carouselDiv, {
          backgroundColor: "#fff",
          useCORS: true,
          width: 960,
          height: 540,
          scale: 1,
        });
        const imgData = canvas.toDataURL("image/png");
        slide.addImage({ data: imgData, x: 0, y: 0, w: 10, h: 5.625 });
      }

      // 2. Capturar las secciones fijas (todas las gráficas debajo del carrusel)
      const fixedSections = document.querySelectorAll(
        "#dashboard-fixed-sections > div",
      );
      for (let i = 0; i < fixedSections.length; i++) {
        const sectionDiv = fixedSections[i] as HTMLDivElement;
        if (sectionDiv) {
          const slide = pptx.addSlide();
          await new Promise((res) => setTimeout(res, 300));
          const canvas = await html2canvas(sectionDiv, {
            backgroundColor: "#fff",
            useCORS: true,
            width: 960,
            height: 540,
            scale: 1,
          });
          const imgData = canvas.toDataURL("image/png");
          slide.addImage({ data: imgData, x: 0, y: 0, w: 10, h: 5.625 });
        }
      }

      await pptx.writeFile("dashboard-notas.pptx");
      message.success("Presentación descargada correctamente");
    } catch (err) {
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
