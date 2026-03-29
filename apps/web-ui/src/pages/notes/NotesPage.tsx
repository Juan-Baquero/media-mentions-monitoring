import React, { useState, useRef } from "react";
import {
  DatePicker,
  Button,
  Row,
  Col,
  Upload,
  Modal,
  Checkbox,
  message,
} from "antd";
import { UploadOutlined } from "@ant-design/icons";
import * as XLSX from "xlsx";
import dayjs from "dayjs";
import api from "../../services/Agent";

const NotesPage: React.FC = () => {
  const [selectedDates, setSelectedDates] = useState<any>(null);
  const [sheetNames, setSheetNames] = useState<string[]>([]);
  const [selectedSheets, setSelectedSheets] = useState<string[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const workbookRef = useRef<XLSX.WorkBook | null>(null);
  const [loading, setLoading] = useState(false);

  const handleDateChange = (dates: any) => {
    setSelectedDates(dates);
  };

  const handleUpload = (file: File) => {
    const isExcel =
      file.type ===
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
      file.name.endsWith(".xlsx");
    if (!isExcel) {
      message.error("Solo se permiten archivos Excel (.xlsx)");
      return Upload.LIST_IGNORE;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const data = new Uint8Array(e.target?.result as ArrayBuffer);
      const workbook = XLSX.read(data, { type: "array" });
      workbookRef.current = workbook;
      setSheetNames(workbook.SheetNames);
      setSelectedSheets([]);
      setModalVisible(true);
    };
    reader.readAsArrayBuffer(file);
    return false; // Prevenir carga automática
  };

  const handleSheetSelect = (checkedValues: any) => {
    setSelectedSheets(checkedValues);
  };

  const columnMap: Record<string, string> = {
    Feha: "date",
    "TIPO DE MEDIO": "media",
    Medio: "mediaName",
    VARIABLES: "variables",
    Tema: "topic",
    Subtemas: "subtopics",
    Origen: "origin",
    DEPARTAMENTO: "department",
    Zona: "zone",
    Título: "title",
    RESUMEN: "summary",
    TARIFA: "rate",
    Sentimiento: "sentiment",
    VALOR: "value",
    Audiencia: "audience",
    LINK: "link",
    FUENTE: "source",
  };

  const handleModalOk = async () => {
    if (!workbookRef.current) return;
    setLoading(true);
    const notes: any[] = [];
    selectedSheets.forEach((sheetName) => {
      const ws = workbookRef.current!.Sheets[sheetName];
      const json: any[] = XLSX.utils.sheet_to_json(ws, { defval: "" });
      json.forEach((row) => {
        const note: Record<string, any> = {};
        Object.entries(columnMap).forEach(([col, key]) => {
          let value = row[col] ?? "";
          // Si la columna es fecha, formatear a YYYY-MM-DD
          if (key === "date" && value) {
            // Si es un número (serial de Excel), convertirlo
            if (typeof value === "number") {
              // Excel serial date: días desde 1899-12-30, pero Excel cuenta mal el 29/2/1900 (bug histórico), así que hay que sumar 1 día
              const utcDays = Math.floor(value);
              const utcDate = new Date(
                Date.UTC(1899, 11, 30) + (utcDays + 1) * 86400000,
              );
              value = dayjs(utcDate).format("YYYY-MM-DD");
            } else {
              // Intenta parsear con dayjs, si es válido, formatea
              const d = dayjs(value);
              value = d.isValid() ? d.format("YYYY-MM-DD") : value;
            }
          }
          note[key] = value;
        });
        notes.push(note);
      });
    });
    try {
      await api.post("/notes/import-excel", notes);
      message.success("Notas importadas correctamente");
    } catch (err) {
      message.error("Error al importar las notas");
    }
    setLoading(false);
    setModalVisible(false);
  };

  const uploadProps = {
    name: "file",
    accept: ".xlsx",
    showUploadList: false,
    beforeUpload: handleUpload,
  };

  return (
    <div>
      <Row align="middle" justify="space-between" style={{ marginBottom: 24 }}>
        <Col>
          <DatePicker.RangePicker
            value={selectedDates}
            onChange={handleDateChange}
            style={{ minWidth: 240 }}
            allowClear={false}
          />
        </Col>
        <Col>
          <Upload {...uploadProps}>
            <Button type="primary" icon={<UploadOutlined />}>
              Cargar XLSX
            </Button>
          </Upload>
        </Col>
      </Row>
      <Modal
        title="Selecciona las hojas a cargar"
        open={modalVisible}
        onOk={handleModalOk}
        onCancel={() => setModalVisible(false)}
        okButtonProps={{ disabled: selectedSheets.length === 0 || loading }}
        cancelButtonProps={{ disabled: loading }}
        maskClosable={!loading}
        closable={!loading}
      >
        {loading ? (
          <div style={{ textAlign: "center", padding: 32 }}>
            <span
              className="ant-spin ant-spin-spinning"
              style={{ fontSize: 24 }}
            >
              <svg
                viewBox="0 0 1024 1024"
                focusable="false"
                className="ant-spin-dot"
                data-icon="loading"
                width="1em"
                height="1em"
                fill="currentColor"
                aria-hidden="true"
              >
                <path d="M988 548H836c-17.7 0-32-14.3-32-32s14.3-32 32-32h152c17.7 0 32 14.3 32 32s-14.3 32-32 32zM220 516c0 17.7-14.3 32-32 32H36c-17.7 0-32-14.3-32-32s14.3-32 32-32h152c17.7 0 32 14.3 32 32zm292-292c-17.7 0-32-14.3-32-32V36c0-17.7 14.3-32 32-32s32 14.3 32 32v152c0 17.7-14.3 32-32 32zm0 576c17.7 0 32 14.3 32 32v152c0 17.7-14.3 32-32 32s-32-14.3-32-32V832c0-17.7 14.3-32 32-32zm282.6-434.6c12.5-12.5 32.8-12.5 45.3 0s12.5 32.8 0 45.3l-107.5 107.5c-12.5 12.5-32.8 12.5-45.3 0s-12.5-32.8 0-45.3l107.5-107.5zm-565.2 565.2c-12.5 12.5-32.8 12.5-45.3 0s-12.5-32.8 0-45.3l107.5-107.5c12.5-12.5 32.8-12.5 45.3 0s12.5 32.8 0 45.3L229.4 904.6zm0-722.6l107.5 107.5c12.5 12.5 12.5 32.8 0 45.3s-32.8 12.5-45.3 0L184.1 227.3c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0zm565.2 565.2l-107.5-107.5c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0l107.5 107.5c12.5 12.5 12.5 32.8 0 45.3s-32.8 12.5-45.3 0z"></path>
              </svg>
            </span>
            <div style={{ marginTop: 16 }}>Importando notas...</div>
          </div>
        ) : (
          <Checkbox.Group
            value={selectedSheets}
            onChange={handleSheetSelect}
            disabled={loading}
          >
            <Row gutter={[16, 8]}>
              {sheetNames.map((name) => (
                <Col span={8} key={name} style={{ marginBottom: 8 }}>
                  <Checkbox value={name}>
                    <span
                      style={{
                        display: "inline-block",
                        maxWidth: 120,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        verticalAlign: "middle",
                        cursor: "pointer",
                      }}
                      title={name}
                    >
                      {name}
                    </span>
                  </Checkbox>
                </Col>
              ))}
            </Row>
          </Checkbox.Group>
        )}
      </Modal>
      <h1>Notas</h1>
      <p>Aquí irá el contenido de la página de notas.</p>
    </div>
  );
};

export default NotesPage;
