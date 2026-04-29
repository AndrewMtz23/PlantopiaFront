import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowTrendUp,
  faChartLine,
  faChartPie,
  faCrown,
  faDownload,
  faLeaf,
  faLayerGroup,
  faSeedling,
  faShop,
} from "@fortawesome/free-solid-svg-icons";
import { Button, Spinner } from "react-bootstrap";
import AdminShell from "./AdminShell";
import { apiFetch } from "../../config/api";

const currencyFormatter = new Intl.NumberFormat("es-MX", {
  style: "currency",
  currency: "MXN",
  maximumFractionDigits: 0,
});

const numberFormatter = new Intl.NumberFormat("es-MX");

const shortDateFormatter = new Intl.DateTimeFormat("es-MX", {
  day: "2-digit",
  month: "short",
});

const palette = ["#22c55e", "#0ea5a4", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6"];

const formatCurrency = (value) => currencyFormatter.format(Number(value) || 0);
const formatNumber = (value) => numberFormatter.format(Number(value) || 0);
const formatPercent = (value) => `${Number(value || 0).toFixed(1)}%`;

const getReadableDate = (value) => {
  if (!value) {
    return "Sin fecha";
  }

  const parsedDate = new Date(`${value}T00:00:00`);
  return Number.isNaN(parsedDate.getTime())
    ? value
    : shortDateFormatter.format(parsedDate);
};

const getChartBaseOptions = () => ({
  chart: {
    backgroundColor: "transparent",
    spacing: [16, 16, 16, 16],
    style: {
      fontFamily: "inherit",
    },
  },
  title: { text: undefined },
  credits: { enabled: false },
  legend: {
    itemStyle: {
      color: "#244735",
      fontWeight: "700",
    },
  },
  xAxis: {
    lineColor: "rgba(23, 63, 43, 0.14)",
    tickColor: "rgba(23, 63, 43, 0.12)",
    labels: {
      style: {
        color: "#4f6a5d",
        fontSize: "12px",
      },
    },
  },
  yAxis: {
    gridLineColor: "rgba(23, 63, 43, 0.08)",
    labels: {
      style: {
        color: "#4f6a5d",
        fontSize: "12px",
      },
    },
    title: {
      style: {
        color: "#4f6a5d",
        fontSize: "12px",
      },
    },
  },
  tooltip: {
    shared: true,
    borderWidth: 0,
    backgroundColor: "rgba(16, 41, 29, 0.94)",
    style: {
      color: "#f6fff9",
    },
  },
  colors: palette,
});

const MetricsView = () => {
  const [metricas, setMetricas] = useState(null);
  const [ventasPorSucursal, setVentasPorSucursal] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    Promise.allSettled([apiFetch("/metricasGenerales"), apiFetch("/ventasPorSucursal")])
      .then(async ([metricasResult, ventasResult]) => {
        if (metricasResult.status !== "fulfilled" || !metricasResult.value.ok) {
          const status = metricasResult.status === "fulfilled" ? metricasResult.value.status : "sin respuesta";
          throw new Error(`No fue posible cargar metricasGenerales (${status}).`);
        }

        const metricasData = await metricasResult.value.json();
        let ventasData = Array.isArray(metricasData?.ventasPorSucursal)
          ? metricasData.ventasPorSucursal
          : [];

        if (ventasResult.status === "fulfilled" && ventasResult.value.ok) {
          ventasData = await ventasResult.value.json();
        } else {
          const status = ventasResult.status === "fulfilled" ? ventasResult.value.status : "sin respuesta";
          console.warn(`No fue posible cargar ventasPorSucursal (${status}); usando respaldo de metricasGenerales.`);
        }

        if (!isMounted) {
          return;
        }

        setMetricas(metricasData);
        setVentasPorSucursal(Array.isArray(ventasData) ? ventasData : []);
      })
      .catch((fetchError) => {
        if (!isMounted) {
          return;
        }

        setError(fetchError.message || "No fue posible cargar las metricas.");
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const analytics = useMemo(() => {
    const ventas = Array.isArray(ventasPorSucursal) ? ventasPorSucursal : [];
    const productosMasVendidos = metricas?.productosMasVendidos || [];

    const sucursales = [...new Set(ventas.map((item) => item.sucursal).filter(Boolean))];
    const fechasBase = [...new Set(ventas.map((item) => item.fecha).filter(Boolean))].sort();
    const fechas = fechasBase.map((fecha) => ({
      raw: fecha,
      label: getReadableDate(fecha),
    }));

    const salesSeries = sucursales.map((sucursal, index) => ({
      name: sucursal,
      type: "areaspline",
      data: fechasBase.map((fecha) => {
        const record = ventas.find((item) => item.sucursal === sucursal && item.fecha === fecha);
        return Number(record?.total || 0);
      }),
      color: palette[index % palette.length],
    }));

    const branchPerformance = sucursales
      .map((sucursal, index) => {
        const records = ventas.filter((item) => item.sucursal === sucursal);
        const totalVentas = records.reduce((sum, item) => sum + Number(item.total || 0), 0);
        const totalRentabilidad = records.reduce(
          (sum, item) => sum + Number(item.rentabilidad || 0),
          0
        );
        const promedioRentabilidad = records.length
          ? totalRentabilidad / records.length
          : 0;

        return {
          sucursal,
          color: palette[index % palette.length],
          totalVentas,
          promedioRentabilidad,
          diasActivos: records.filter((item) => Number(item.total || 0) > 0).length,
        };
      })
      .sort((left, right) => right.totalVentas - left.totalVentas);

    const productoSeries = productosMasVendidos
      .slice(0, 5)
      .map((producto, index) => ({
        name: producto.nombre,
        y: Number(producto.cantidad || 0),
        color: palette[index % palette.length],
      }));

    const championBranch = branchPerformance[0];
    const championProduct = productosMasVendidos[0];
    const sucursalesConVentas = branchPerformance.filter((item) => item.totalVentas > 0).length;
    const volumenProductos = productosMasVendidos.reduce(
      (sum, item) => sum + Number(item.cantidad || 0),
      0
    );

    return {
      fechas,
      salesSeries,
      branchPerformance,
      productoSeries,
      championBranch,
      championProduct,
      sucursalesConVentas,
      volumenProductos,
    };
  }, [metricas, ventasPorSucursal]);

  const ventasTimelineOptions = useMemo(() => {
    const base = getChartBaseOptions();

    return {
      ...base,
      chart: {
        ...base.chart,
        type: "areaspline",
        height: 360,
      },
      subtitle: {
        text: "Lectura diaria de las sucursales con mejor ritmo comercial.",
        align: "left",
        style: {
          color: "#5b7467",
        },
      },
      xAxis: {
        ...base.xAxis,
        categories: analytics.fechas.map((fecha) => fecha.label),
      },
      yAxis: {
        ...base.yAxis,
        title: {
          text: "Ventas",
        },
        labels: {
          formatter() {
            return `$${Highcharts.numberFormat(this.value, 0)}`;
          },
        },
      },
      plotOptions: {
        areaspline: {
          stacking: "normal",
          lineWidth: 2,
          fillOpacity: 0.18,
          marker: {
            enabled: false,
          },
        },
      },
      tooltip: {
        ...base.tooltip,
        pointFormatter() {
          return `<span style="color:${this.color}">\u25CF</span> ${this.series.name}: <strong>${formatCurrency(
            this.y
          )}</strong><br/>`;
        },
      },
      series: analytics.salesSeries,
    };
  }, [analytics.fechas, analytics.salesSeries]);

  const branchPerformanceOptions = useMemo(() => {
    const base = getChartBaseOptions();

    return {
      ...base,
      chart: {
        ...base.chart,
        height: 360,
      },
      subtitle: {
        text: "Cruza ingresos con margen para detectar la sucursal mas saludable.",
        align: "left",
        style: {
          color: "#5b7467",
        },
      },
      xAxis: {
        ...base.xAxis,
        categories: analytics.branchPerformance.map((item) => item.sucursal),
      },
      yAxis: [
        {
          ...base.yAxis,
          title: {
            text: "Ventas",
          },
          labels: {
            formatter() {
              return `$${Highcharts.numberFormat(this.value, 0)}`;
            },
          },
        },
        {
          ...base.yAxis,
          title: {
            text: "Rentabilidad",
          },
          labels: {
            formatter() {
              return `${Highcharts.numberFormat(this.value, 0)}%`;
            },
          },
          opposite: true,
          max: 100,
        },
      ],
      tooltip: {
        shared: true,
        borderWidth: 0,
        backgroundColor: "rgba(16, 41, 29, 0.94)",
        style: {
          color: "#f6fff9",
        },
      },
      plotOptions: {
        column: {
          borderRadius: 14,
          pointPadding: 0.12,
        },
        spline: {
          marker: {
            radius: 5,
            lineWidth: 2,
            lineColor: "#ffffff",
          },
        },
      },
      series: [
        {
          name: "Ventas",
          type: "column",
          data: analytics.branchPerformance.map((item) => ({
            y: item.totalVentas,
            color: item.color,
          })),
        },
        {
          name: "Rentabilidad",
          type: "spline",
          yAxis: 1,
          data: analytics.branchPerformance.map((item) =>
            Number(item.promedioRentabilidad.toFixed(2))
          ),
          color: "#123926",
        },
      ],
    };
  }, [analytics.branchPerformance]);

  const topProductsOptions = useMemo(() => {
    const base = getChartBaseOptions();

    return {
      ...base,
      chart: {
        ...base.chart,
        type: "bar",
        height: 420,
      },
      subtitle: {
        text: "Los productos que realmente mueven volumen en la ventana actual.",
        align: "left",
        style: {
          color: "#5b7467",
        },
      },
      xAxis: {
        ...base.xAxis,
        categories: analytics.productoSeries.map((item) => item.name),
      },
      yAxis: {
        ...base.yAxis,
        title: {
          text: "Unidades vendidas",
        },
      },
      legend: {
        enabled: false,
      },
      plotOptions: {
        bar: {
          borderRadius: 14,
          dataLabels: {
            enabled: true,
            style: {
              color: "#123926",
              textOutline: "none",
              fontWeight: "700",
            },
          },
        },
      },
      tooltip: {
        ...base.tooltip,
        pointFormatter() {
          return `<span style="color:${this.color}">\u25CF</span> ${this.category}: <strong>${formatNumber(
            this.y
          )}</strong> unidades<br/>`;
        },
      },
      series: [
        {
          name: "Unidades",
          data: analytics.productoSeries,
        },
      ],
    };
  }, [analytics.productoSeries]);

  if (isLoading) {
    return (
      <AdminShell>
        <div className="admin-analytics-loading">
          <Spinner animation="border" role="status" />
          <p className="mb-0">Cargando el tablero de inteligencia comercial...</p>
        </div>
      </AdminShell>
    );
  }

  if (error) {
    return (
      <AdminShell>
        <section className="admin-analytics-empty">
          <span className="admin-hero__eyebrow">Analitica</span>
          <h1 className="admin-page-header__title">No se pudo cargar el tablero</h1>
          <p className="admin-page-header__text">{error}</p>
          <div className="admin-page-header__actions">
            <Button as={Link} to="/graficas" className="btn-success">
              Reintentar
            </Button>
            <Button as={Link} to="/cruds" className="admin-page-header__ghost">
              Volver al panel
            </Button>
          </div>
        </section>
      </AdminShell>
    );
  }

  return (
    <AdminShell containerClassName="admin-shell__container--wide">
      <section className="admin-page-header admin-page-header--analytics">
        <div>
          <span className="admin-page-header__eyebrow">Plantopia Analytics</span>
          <h1 className="admin-page-header__title">Centro de graficas</h1>
          <p className="admin-page-header__text">
            Tres lecturas para entender el pulso del negocio: quien vende, quien
            convierte mejor y que productos estan jalando la demanda.
          </p>
        </div>
        <div className="admin-page-header__actions">
          <Button className="btn-success" onClick={() => window.print()}>
            <FontAwesomeIcon icon={faDownload} className="me-2" />
            Exportar reporte
          </Button>
          <Button as={Link} to="/cruds" className="admin-page-header__ghost">
            Volver al panel
          </Button>
        </div>
      </section>

      <section className="admin-analytics-hero">
        <div className="admin-analytics-hero__content">
          <span className="admin-hero__eyebrow">Lectura ejecutiva</span>
          <h2 className="admin-analytics-hero__title">
            Tres frentes para leer el negocio sin perder contexto.
          </h2>
          <p className="admin-analytics-hero__text">
            El dashboard mezcla tendencia, eficiencia y demanda para que el
            equipo vea rapido donde meter inventario, donde empujar margen y
            cual sucursal esta marcando el ritmo.
          </p>

          <div className="admin-analytics-hero__insights">
            <article className="admin-analytics-insight">
              <div className="admin-analytics-insight__icon">
                <FontAwesomeIcon icon={faCrown} />
              </div>
              <div>
                <span className="admin-analytics-insight__label">Sucursal lider</span>
                <strong>{analytics.championBranch?.sucursal || "Sin datos"}</strong>
                <p>
                  {analytics.championBranch
                    ? `${formatCurrency(
                        analytics.championBranch.totalVentas
                      )} acumulados en el periodo.`
                    : "Todavia no hay registros suficientes para comparar."}
                </p>
              </div>
            </article>

            <article className="admin-analytics-insight">
              <div className="admin-analytics-insight__icon">
                <FontAwesomeIcon icon={faSeedling} />
              </div>
              <div>
                <span className="admin-analytics-insight__label">Producto estrella</span>
                <strong>{analytics.championProduct?.nombre || "Sin datos"}</strong>
                <p>
                  {analytics.championProduct
                    ? `${formatNumber(
                        analytics.championProduct.cantidad
                      )} unidades vendidas hasta ahora.`
                    : "Aun no hay suficientes ventas para detectar tendencia."}
                </p>
              </div>
            </article>
          </div>
        </div>

        <aside className="admin-analytics-hero__spotlight">
          <span className="admin-hero__eyebrow">Snapshot</span>
          <strong className="admin-analytics-hero__spotlight-value">
            {analytics.sucursalesConVentas}
          </strong>
          <p className="admin-analytics-hero__spotlight-copy">
            sucursales activas generando movimiento comercial real.
          </p>

          <div className="admin-analytics-hero__spotlight-list">
            <div>
              <span>Volumen detectado</span>
              <strong>{formatNumber(analytics.volumenProductos)} uds</strong>
            </div>
            <div>
              <span>Margen promedio</span>
              <strong>{formatPercent(metricas?.rentabilidadPromedio)}</strong>
            </div>
          </div>
        </aside>
      </section>

      <section className="admin-stats-grid">
        <article className="admin-stat-card">
          <div className="admin-stat-card__icon">
            <FontAwesomeIcon icon={faLeaf} />
          </div>
          <span className="admin-stat-card__label">Ventas totales</span>
          <strong className="admin-stat-card__value">
            {formatCurrency(metricas?.ventasTotales)}
          </strong>
          <span className="admin-stat-card__meta">Lectura acumulada de la ventana reciente</span>
        </article>

        <article className="admin-stat-card">
          <div className="admin-stat-card__icon">
            <FontAwesomeIcon icon={faChartLine} />
          </div>
          <span className="admin-stat-card__label">Rentabilidad promedio</span>
          <strong className="admin-stat-card__value">
            {formatPercent(metricas?.rentabilidadPromedio)}
          </strong>
          <span className="admin-stat-card__meta">Salud general del margen comercial</span>
        </article>

        <article className="admin-stat-card">
          <div className="admin-stat-card__icon">
            <FontAwesomeIcon icon={faShop} />
          </div>
          <span className="admin-stat-card__label">Sucursal top</span>
          <strong className="admin-stat-card__value">
            {analytics.championBranch?.sucursal || "Sin datos"}
          </strong>
          <span className="admin-stat-card__meta">La que lidera la captacion de ventas</span>
        </article>

        <article className="admin-stat-card">
          <div className="admin-stat-card__icon">
            <FontAwesomeIcon icon={faLayerGroup} />
          </div>
          <span className="admin-stat-card__label">Producto estrella</span>
          <strong className="admin-stat-card__value">
            {analytics.championProduct?.nombre || "Sin datos"}
          </strong>
          <span className="admin-stat-card__meta">La referencia con mayor traccion actual</span>
        </article>
      </section>

      <section className="admin-analytics-grid">
        <article className="admin-chart-card admin-chart-card--wide">
          <div className="admin-chart-card__header">
            <div>
              <span className="admin-table-card__eyebrow">Grafica 01</span>
              <h3 className="admin-chart-card__title">Pulso de ventas por sucursal</h3>
            </div>
            <div className="admin-chart-card__badge">
              <FontAwesomeIcon icon={faArrowTrendUp} />
              <span>Tendencia</span>
            </div>
          </div>
          <HighchartsReact highcharts={Highcharts} options={ventasTimelineOptions} />
        </article>

        <article className="admin-chart-card">
          <div className="admin-chart-card__header">
            <div>
              <span className="admin-table-card__eyebrow">Grafica 02</span>
              <h3 className="admin-chart-card__title">Ventas vs rentabilidad</h3>
            </div>
            <div className="admin-chart-card__badge">
              <FontAwesomeIcon icon={faChartPie} />
              <span>Balance</span>
            </div>
          </div>
          <HighchartsReact highcharts={Highcharts} options={branchPerformanceOptions} />
        </article>

        <article className="admin-chart-card">
          <div className="admin-chart-card__header">
            <div>
              <span className="admin-table-card__eyebrow">Grafica 03</span>
              <h3 className="admin-chart-card__title">Top productos por demanda</h3>
            </div>
            <div className="admin-chart-card__badge">
              <FontAwesomeIcon icon={faSeedling} />
              <span>Momentum</span>
            </div>
          </div>
          <HighchartsReact highcharts={Highcharts} options={topProductsOptions} />
        </article>
      </section>
    </AdminShell>
  );
};

export default MetricsView;
