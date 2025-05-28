"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  FileText,
  TrendingUp,
  Package,
  Users,
  BarChart3,
  Download,
  Database,
  Calendar,
  Building2,
  Loader2,
  CheckCircle,
} from "lucide-react"
import { exportCustomReport } from "./lib/export-utils"

// Mock data para simular base de datos SQL Server - TechStore
const mockData = {
  sucursales: [
    { id: 1, nombre: "TechStore Centro", ciudad: "Buenos Aires" },
    { id: 2, nombre: "TechStore Norte", ciudad: "Córdoba" },
    { id: 3, nombre: "TechStore Sur", ciudad: "Rosario" },
    { id: 4, nombre: "TechStore Oeste", ciudad: "Mendoza" },
  ],

  vendedores: [
    { id: 1, nombre: "Carlos Mendez", sucursal_id: 1, ventas_mes: 1850000 },
    { id: 2, nombre: "Ana Rodriguez", sucursal_id: 1, ventas_mes: 2120000 },
    { id: 3, nombre: "Luis Garcia", sucursal_id: 2, ventas_mes: 1780000 },
    { id: 4, nombre: "Maria Lopez", sucursal_id: 2, ventas_mes: 2400000 },
    { id: 5, nombre: "Pedro Silva", sucursal_id: 3, ventas_mes: 1650000 },
    { id: 6, nombre: "Sofia Martinez", sucursal_id: 4, ventas_mes: 1890000 },
  ],

  productos: [
    { id: 1, nombre: "Notebook Dell Inspiron 15", categoria: "Notebooks", precio: 450000, stock: 3, minimo: 8 },
    { id: 2, nombre: 'Monitor Samsung 24" Full HD', categoria: "Monitores", precio: 180000, stock: 5, minimo: 10 },
    { id: 3, nombre: "Teclado Mecánico Logitech", categoria: "Periféricos", precio: 85000, stock: 2, minimo: 6 },
    { id: 4, nombre: "Mouse Gaming Razer", categoria: "Periféricos", precio: 65000, stock: 4, minimo: 8 },
    { id: 5, nombre: "Notebook HP Pavilion Gaming", categoria: "Notebooks", precio: 720000, stock: 1, minimo: 5 },
    { id: 6, nombre: 'Monitor LG 27" 4K', categoria: "Monitores", precio: 320000, stock: 6, minimo: 8 },
    { id: 7, nombre: "Procesador AMD Ryzen 5", categoria: "Componentes", precio: 180000, stock: 8, minimo: 12 },
    { id: 8, nombre: "Placa de Video RTX 4060", categoria: "Componentes", precio: 420000, stock: 2, minimo: 6 },
  ],

  ventas: [
    { id: 1, fecha: "2024-01-15", producto_id: 1, vendedor_id: 1, cantidad: 2, total: 900000, sucursal_id: 1 },
    { id: 2, fecha: "2024-01-16", producto_id: 2, vendedor_id: 2, cantidad: 3, total: 540000, sucursal_id: 1 },
    { id: 3, fecha: "2024-01-17", producto_id: 3, vendedor_id: 3, cantidad: 5, total: 425000, sucursal_id: 2 },
    { id: 4, fecha: "2024-01-18", producto_id: 4, vendedor_id: 4, cantidad: 8, total: 520000, sucursal_id: 2 },
    { id: 5, fecha: "2024-01-19", producto_id: 5, vendedor_id: 5, cantidad: 1, total: 720000, sucursal_id: 3 },
    { id: 6, fecha: "2024-01-20", producto_id: 6, vendedor_id: 6, cantidad: 2, total: 640000, sucursal_id: 4 },
    { id: 7, fecha: "2024-01-21", producto_id: 7, vendedor_id: 1, cantidad: 4, total: 720000, sucursal_id: 1 },
    { id: 8, fecha: "2024-01-22", producto_id: 8, vendedor_id: 2, cantidad: 1, total: 420000, sucursal_id: 1 },
  ],
}

type ReportType = "ventas" | "stock" | "vendedores" | "categorias"

interface ReportConfig {
  tipo: ReportType
  fechaDesde: string
  fechaHasta: string
  sucursal: string
}

export default function TechStoreReportGenerator() {
  const [config, setConfig] = useState<ReportConfig>({
    tipo: "ventas",
    fechaDesde: "2024-01-01",
    fechaHasta: "2024-01-31",
    sucursal: "todas",
  })

  const [isConnecting, setIsConnecting] = useState(false)
  const [isConnected, setIsConnected] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [reportData, setReportData] = useState<any[]>([])
  const [showPreview, setShowPreview] = useState(false)

  const reportTypes = [
    { value: "ventas", label: "Reporte de Ventas Detallado", icon: TrendingUp },
    { value: "stock", label: "Stock Bajo Mínimo", icon: Package },
    { value: "vendedores", label: "Top Vendedores", icon: Users },
    { value: "categorias", label: "Análisis por Categorías", icon: BarChart3 },
  ]

  // Simular conexión a SQL Server
  const connectToDatabase = async () => {
    setIsConnecting(true)
    setIsConnected(false)

    // Simular tiempo de conexión
    await new Promise((resolve) => setTimeout(resolve, 2000))

    setIsConnecting(false)
    setIsConnected(true)
  }

  // Generar datos del reporte según el tipo
  const generateReportData = () => {
    switch (config.tipo) {
      case "ventas":
        return mockData.ventas.map((venta) => {
          const producto = mockData.productos.find((p) => p.id === venta.producto_id)
          const vendedor = mockData.vendedores.find((v) => v.id === venta.vendedor_id)
          const sucursal = mockData.sucursales.find((s) => s.id === venta.sucursal_id)
          return {
            fecha: venta.fecha,
            producto: producto?.nombre,
            vendedor: vendedor?.nombre,
            sucursal: sucursal?.nombre,
            cantidad: venta.cantidad,
            total: venta.total,
          }
        })

      case "stock":
        return mockData.productos
          .filter((p) => p.stock < p.minimo)
          .map((producto) => ({
            producto: producto.nombre,
            categoria: producto.categoria,
            stockActual: producto.stock,
            stockMinimo: producto.minimo,
            diferencia: producto.minimo - producto.stock,
            estado: "Crítico",
          }))

      case "vendedores":
        return mockData.vendedores
          .sort((a, b) => b.ventas_mes - a.ventas_mes)
          .map((vendedor, index) => {
            const sucursal = mockData.sucursales.find((s) => s.id === vendedor.sucursal_id)
            return {
              ranking: index + 1,
              vendedor: vendedor.nombre,
              sucursal: sucursal?.nombre,
              ventasMes: vendedor.ventas_mes,
              meta: 1800000,
              cumplimiento: ((vendedor.ventas_mes / 1800000) * 100).toFixed(1),
            }
          })

      case "categorias":
        const categorias = ["Notebooks", "Monitores", "Periféricos", "Componentes"]
        return categorias.map((categoria) => {
          const productosCategoria = mockData.productos.filter((p) => p.categoria === categoria)
          const ventasCategoria = mockData.ventas.filter((v) => productosCategoria.some((p) => p.id === v.producto_id))
          const totalVentas = ventasCategoria.reduce((sum, v) => sum + v.total, 0)
          const cantidadVendida = ventasCategoria.reduce((sum, v) => sum + v.cantidad, 0)

          return {
            categoria,
            productos: productosCategoria.length,
            ventasTotal: totalVentas,
            cantidadVendida,
            promedioVenta: totalVentas / (cantidadVendida || 1),
          }
        })

      default:
        return []
    }
  }

  const handleGenerateReport = async () => {
    if (!isConnected) {
      await connectToDatabase()
    }

    setIsGenerating(true)

    // Simular generación de reporte
    await new Promise((resolve) => setTimeout(resolve, 1500))

    const data = generateReportData()
    setReportData(data)
    setShowPreview(true)
    setIsGenerating(false)
  }

  const handleDownloadPDF = () => {
    const reportTitle = reportTypes.find((t) => t.value === config.tipo)?.label || "Reporte"
    exportCustomReport(reportData, config.tipo, reportTitle)
  }

  const renderPreviewTable = () => {
    if (!reportData.length) return null

    const columns = Object.keys(reportData[0])

    return (
      <div className="mt-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Vista Previa del Reporte</h3>
          <Button onClick={handleDownloadPDF} className="bg-blue-600 hover:bg-blue-700">
            <Download className="w-4 h-4 mr-2" />
            Descargar PDF
          </Button>
        </div>

        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                {columns.map((column) => (
                  <TableHead key={column} className="font-semibold">
                    {column.charAt(0).toUpperCase() + column.slice(1).replace(/([A-Z])/g, " $1")}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {reportData.map((row, index) => (
                <TableRow key={index}>
                  {columns.map((column) => (
                    <TableCell key={column}>
                      {(typeof row[column] === "number" && column.includes("total")) ||
                      column.includes("ventas") ||
                      column.includes("precio") ? (
                        `$${row[column].toLocaleString()}`
                      ) : column === "estado" && row[column] === "Crítico" ? (
                        <Badge variant="destructive">{row[column]}</Badge>
                      ) : column === "cumplimiento" ? (
                        <Badge variant={Number.parseFloat(row[column]) >= 100 ? "default" : "secondary"}>
                          {row[column]}%
                        </Badge>
                      ) : (
                        row[column]
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    )
  }

  useEffect(() => {
    connectToDatabase()
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-600 rounded-lg">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Generador de Reportes</h1>
              <p className="text-gray-600">TechStore - Sistema de Reportes Empresariales</p>
            </div>
          </div>

          {/* Estado de conexión */}
          <div className="flex items-center gap-2 mt-4">
            <Database className="w-4 h-4 text-gray-500" />
            {isConnecting ? (
              <div className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                <span className="text-sm text-gray-600">Conectando a SQL Server...</span>
              </div>
            ) : isConnected ? (
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="text-sm text-green-600">Conectado a SQL Server</span>
              </div>
            ) : (
              <span className="text-sm text-red-600">Desconectado</span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Panel de Configuración */}
          <div className="lg:col-span-1">
            <Card className="shadow-lg border-0">
              <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-t-lg">
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Configuración del Reporte
                </CardTitle>
                <CardDescription className="text-blue-100">
                  Selecciona los parámetros para generar tu reporte
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                {/* Tipo de Reporte */}
                <div className="space-y-2">
                  <Label htmlFor="tipo" className="text-sm font-medium">
                    Tipo de Reporte
                  </Label>
                  <Select
                    value={config.tipo}
                    onValueChange={(value: ReportType) => setConfig({ ...config, tipo: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {reportTypes.map((type) => {
                        const Icon = type.icon
                        return (
                          <SelectItem key={type.value} value={type.value}>
                            <div className="flex items-center gap-2">
                              <Icon className="w-4 h-4" />
                              {type.label}
                            </div>
                          </SelectItem>
                        )
                      })}
                    </SelectContent>
                  </Select>
                </div>

                <Separator />

                {/* Filtros de Fecha */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    <Label className="text-sm font-medium">Período</Label>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="fechaDesde" className="text-xs text-gray-500">
                        Desde
                      </Label>
                      <Input
                        id="fechaDesde"
                        type="date"
                        value={config.fechaDesde}
                        onChange={(e) => setConfig({ ...config, fechaDesde: e.target.value })}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="fechaHasta" className="text-xs text-gray-500">
                        Hasta
                      </Label>
                      <Input
                        id="fechaHasta"
                        type="date"
                        value={config.fechaHasta}
                        onChange={(e) => setConfig({ ...config, fechaHasta: e.target.value })}
                        className="mt-1"
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Filtro de Sucursal */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-gray-500" />
                    <Label htmlFor="sucursal" className="text-sm font-medium">
                      Sucursal
                    </Label>
                  </div>
                  <Select value={config.sucursal} onValueChange={(value) => setConfig({ ...config, sucursal: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todas">Todas las sucursales</SelectItem>
                      {mockData.sucursales.map((sucursal) => (
                        <SelectItem key={sucursal.id} value={sucursal.id.toString()}>
                          {sucursal.nombre} - {sucursal.ciudad}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Separator />

                {/* Botón Generar */}
                <Button
                  onClick={handleGenerateReport}
                  disabled={isGenerating || isConnecting}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3"
                  size="lg"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Generando Reporte...
                    </>
                  ) : (
                    <>
                      <FileText className="w-4 h-4 mr-2" />
                      Generar Reporte
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Panel de Resultados */}
          <div className="lg:col-span-2">
            <Card className="shadow-lg border-0 min-h-[600px]">
              <CardHeader className="bg-gray-50 border-b">
                <CardTitle>Resultados del Reporte</CardTitle>
                <CardDescription>
                  {showPreview
                    ? `Mostrando ${reportData.length} registros del reporte de ${reportTypes.find((t) => t.value === config.tipo)?.label}`
                    : "Configura y genera un reporte para ver los resultados"}
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                {!showPreview ? (
                  <div className="flex flex-col items-center justify-center h-96 text-gray-500">
                    <FileText className="w-16 h-16 mb-4 text-gray-300" />
                    <h3 className="text-lg font-medium mb-2">No hay datos para mostrar</h3>
                    <p className="text-center text-sm">
                      Selecciona los parámetros del reporte y haz clic en "Generar Reporte" para ver los resultados.
                    </p>
                  </div>
                ) : (
                  renderPreviewTable()
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Cards de Estadísticas Rápidas */}
        {isConnected && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-8">
            <Card className="p-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm">Total Sucursales</p>
                  <p className="text-2xl font-bold">{mockData.sucursales.length}</p>
                </div>
                <Building2 className="w-8 h-8 text-blue-200" />
              </div>
            </Card>

            <Card className="p-4 bg-gradient-to-r from-green-500 to-green-600 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm">Vendedores Activos</p>
                  <p className="text-2xl font-bold">{mockData.vendedores.length}</p>
                </div>
                <Users className="w-8 h-8 text-green-200" />
              </div>
            </Card>

            <Card className="p-4 bg-gradient-to-r from-purple-500 to-purple-600 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm">Productos Tech</p>
                  <p className="text-2xl font-bold">{mockData.productos.length}</p>
                </div>
                <Package className="w-8 h-8 text-purple-200" />
              </div>
            </Card>

            <Card className="p-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100 text-sm">Ventas del Mes</p>
                  <p className="text-2xl font-bold">{mockData.ventas.length}</p>
                </div>
                <TrendingUp className="w-8 h-8 text-orange-200" />
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
