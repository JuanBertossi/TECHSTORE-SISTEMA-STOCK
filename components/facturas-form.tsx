"use client"

import React, { useState, useEffect } from "react"
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  FileText,
  Download,
  Receipt,
  CheckCircle,
  Loader2,
  Plus,
  X,
  Calculator,
} from "lucide-react"
import { useTheme } from "next-themes"
import { useToast } from "@/hooks/use-toast"

interface InvoiceItem {
  description: string
  quantity: string
  unitPrice: string
  total: number
}

interface InvoiceData {
  customerName: string
  customerEmail: string
  customerPhone: string
  customerAddress: string
  invoiceNumber: string
  date: string
  items: InvoiceItem[]
  subtotal: number
  discount: number
  total: number
  paymentMethod: string
  notes: string
}

const metodosPago = [
  "Efectivo",
  "Transferencia",
  "Mercado Pago",
  "Tarjeta",
  "Cheque",
  "Otro",
]

// Función para formatear moneda
function formatCurrency(value: number) {
  return value.toLocaleString("es-AR", {
    style: "currency",
    currency: "ARS",
    minimumFractionDigits: 2,
  })
}

// Función para generar y descargar PDF con soporte para modo oscuro - ACTUALIZADA PARA TECHSTORE
const generatePDF = (data: InvoiceData, isDark: boolean = false) => {
  // Colores adaptativos para el PDF - CAMBIADOS A AZUL PARA TECHSTORE
  const colors = isDark ? {
    background: '#1f2937',
    cardBg: '#374151',
    text: '#f9fafb',
    textMuted: '#d1d5db',
    primary: '#3b82f6', // Azul para TECHSTORE
    border: '#4b5563',
    tableBg: '#4b5563',
    tableAlt: '#374151'
  } : {
    background: '#ffffff',
    cardBg: '#f8f9fa',
    text: '#333333',
    textMuted: '#666666',
    primary: '#1d4ed8', // Azul para TECHSTORE
    border: '#dddddd',
    tableBg: '#1d4ed8',
    tableAlt: '#f8f9fa'
  }

  const invoiceHTML = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Factura ${data.invoiceNumber} - TECHSTORE</title>
      <style>
        body { 
          font-family: Arial, sans-serif; 
          margin: 40px; 
          color: ${colors.text}; 
          line-height: 1.6; 
          background-color: ${colors.background};
        }
        .header { 
          text-align: center; 
          margin-bottom: 30px; 
          border-bottom: 3px solid ${colors.primary}; 
          padding-bottom: 20px; 
        }
        .company-name { 
          font-size: 32px; 
          font-weight: bold; 
          color: ${colors.primary}; 
          margin-bottom: 5px; 
          letter-spacing: 1px;
        }
        .invoice-title { 
          font-size: 20px; 
          color: ${colors.textMuted}; 
        }
        .info-grid { 
          display: grid; 
          grid-template-columns: 1fr 1fr; 
          gap: 30px; 
          margin: 20px 0; 
        }
        .info-block { 
          background: ${colors.cardBg}; 
          padding: 20px; 
          border-radius: 8px; 
          border: 1px solid ${colors.border};
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .info-title { 
          font-weight: bold; 
          font-size: 14px; 
          color: ${colors.primary}; 
          margin-bottom: 10px; 
          text-transform: uppercase; 
          border-bottom: 1px solid ${colors.border};
          padding-bottom: 5px;
        }
        .table { 
          width: 100%; 
          border-collapse: collapse; 
          margin: 20px 0; 
          border: 1px solid ${colors.border};
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .table th { 
          background: ${colors.tableBg}; 
          color: ${isDark ? colors.text : '#ffffff'}; 
          padding: 15px; 
          text-align: left; 
          border: 1px solid ${colors.border};
          font-weight: bold;
        }
        .table td { 
          padding: 12px; 
          border: 1px solid ${colors.border}; 
          color: ${colors.text};
        }
        .table tr:nth-child(odd) { 
          background: ${colors.tableAlt}; 
        }
        .table tr:nth-child(even) { 
          background: ${colors.background}; 
        }
        .totals { 
          margin-top: 30px; 
          text-align: right; 
        }
        .totals-table { 
          margin-left: auto; 
          width: 350px; 
          border: 1px solid ${colors.border};
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .totals-table td { 
          padding: 12px; 
          font-size: 16px; 
          border: 1px solid ${colors.border};
          color: ${colors.text};
        }
        .total-final { 
          font-weight: bold; 
          font-size: 22px; 
          color: ${colors.primary}; 
          border-top: 3px solid ${colors.primary}; 
          background: ${colors.cardBg};
        }
        .footer { 
          margin-top: 40px; 
          padding-top: 20px; 
          border-top: 1px solid ${colors.border}; 
          color: ${colors.textMuted}; 
          text-align: center;
        }
        @media print {
          body { margin: 20px; }
          .header { page-break-after: avoid; }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="company-name">TECHSTORE</div>
        <div class="invoice-title">FACTURA N° ${data.invoiceNumber}</div>
      </div>

      <div class="info-grid">
        <div class="info-block">
          <div class="info-title">Datos del Cliente</div>
          <strong>${data.customerName}</strong><br>
          ${data.customerEmail ? `Email: ${data.customerEmail}<br>` : ''}
          ${data.customerPhone ? `Teléfono: ${data.customerPhone}<br>` : ''}
          ${data.customerAddress ? `Dirección: ${data.customerAddress}` : ''}
        </div>
        
        <div class="info-block">
          <div class="info-title">Información de la Factura</div>
          <strong>Fecha:</strong> ${new Date(data.date).toLocaleDateString('es-AR')}<br>
          <strong>Método de Pago:</strong> ${data.paymentMethod}<br>
          <strong>Estado:</strong> <span style="color: ${colors.primary}; font-weight: bold;">Generada</span>
        </div>
      </div>

      <table class="table">
        <thead>
          <tr>
            <th>Descripción</th>
            <th style="text-align: center;">Cantidad</th>
            <th style="text-align: right;">Precio Unit.</th>
            <th style="text-align: right;">Total</th>
          </tr>
        </thead>
        <tbody>
          ${data.items.map(item => `
            <tr>
              <td>${item.description}</td>
              <td style="text-align: center;">${item.quantity}</td>
              <td style="text-align: right;">${formatCurrency(Number(item.unitPrice))}</td>
              <td style="text-align: right; font-weight: bold;">${formatCurrency(item.total)}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>

      <div class="totals">
        <table class="totals-table">
          <tr>
            <td>Subtotal:</td>
            <td style="text-align: right; font-weight: bold;">${formatCurrency(data.subtotal)}</td>
          </tr>
          <tr>
            <td>Descuento:</td>
            <td style="text-align: right; font-weight: bold; color: #ef4444;">-${formatCurrency(data.discount)}</td>
          </tr>
          <tr class="total-final">
            <td>TOTAL:</td>
            <td style="text-align: right;">${formatCurrency(data.total)}</td>
          </tr>
        </table>
      </div>

      ${data.notes ? `
        <div class="footer">
          <div class="info-title">Notas</div>
          <p style="text-align: left; margin-top: 10px;">${data.notes}</p>
        </div>
      ` : ''}

      <div class="footer">
        <p style="font-size: 12px; margin-top: 30px;">
          Factura generada el ${new Date().toLocaleDateString('es-AR')} a las ${new Date().toLocaleTimeString('es-AR')}
          <br>
          <strong>TECHSTORE</strong> - Sistema de Facturación
          <br>
          <small>Tema: ${isDark ? 'Oscuro' : 'Claro'}</small>
        </p>
      </div>
    </body>
    </html>
  `

  // Crear y descargar el archivo HTML
  const element = document.createElement("a")
  const file = new Blob([invoiceHTML], { type: "text/html;charset=utf-8" })
  element.href = URL.createObjectURL(file)
  element.download = `Factura_${data.invoiceNumber}_TECHSTORE.html`
  document.body.appendChild(element)
  element.click()
  document.body.removeChild(element)
  URL.revokeObjectURL(element.href)
}

export default function FacturacionForm() {
  const { theme, resolvedTheme } = useTheme()
  const { toast } = useToast()
  const [mounted, setMounted] = useState(false)

  // Evitar hidratación incorrecta
  useEffect(() => {
    setMounted(true)
  }, [])

  const isDark = mounted && (resolvedTheme === 'dark' || theme === 'dark')

  const [formData, setFormData] = useState({
    customerName: "",
    customerEmail: "",
    customerPhone: "",
    customerAddress: "",
    invoiceNumber: "",
    date: new Date().toISOString().split("T")[0],
    paymentMethod: "",
    notes: "",
    discount: "",
  })

  const [items, setItems] = useState<InvoiceItem[]>([
    { description: "", quantity: "1", unitPrice: "0", total: 0 },
  ])

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isGenerating, setIsGenerating] = useState(false)
  const [invoiceGenerated, setInvoiceGenerated] = useState(false)
  const [lastGeneratedInvoice, setLastGeneratedInvoice] = useState<InvoiceData | null>(null)

  // Validación mejorada
  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    // Validar campos obligatorios
    if (!formData.customerName.trim()) {
      newErrors.customerName = "Nombre del cliente es requerido"
    }
    
    if (!formData.invoiceNumber.trim()) {
      newErrors.invoiceNumber = "Número de factura es requerido"
    }
    
    if (!formData.date.trim()) {
      newErrors.date = "Fecha es requerida"
    }
    
    if (!formData.paymentMethod) {
      newErrors.paymentMethod = "Método de pago es requerido"
    }

    // Validar email si está presente
    if (formData.customerEmail.trim() && !/\S+@\S+\.\S+/.test(formData.customerEmail)) {
      newErrors.customerEmail = "Email inválido"
    }

    // Validar items - CORREGIDO
    const validItems = items.filter(item => {
      const hasDescription = item.description.trim().length > 0
      const hasValidQuantity = Number(item.quantity) > 0 && !isNaN(Number(item.quantity))
      const hasValidPrice = Number(item.unitPrice) > 0 && !isNaN(Number(item.unitPrice))
      
      return hasDescription && hasValidQuantity && hasValidPrice
    })

    if (validItems.length === 0) {
      newErrors.items = "Debe agregar al menos un producto/servicio válido con descripción, cantidad y precio"
    }

    console.log("Errores de validación:", newErrors)
    console.log("Items válidos:", validItems)
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const addItem = () => {
    setItems([...items, { description: "", quantity: "1", unitPrice: "0", total: 0 }])
  }

  const removeItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index))
    }
  }

  const updateItem = (index: number, field: keyof InvoiceItem, value: string) => {
    if ((field === "quantity" || field === "unitPrice") && value !== "") {
      if (!/^\d*\.?\d*$/.test(value)) return
    }

    const newItems = [...items]
    newItems[index] = { ...newItems[index], [field]: value }

    const quantityNum = Number(newItems[index].quantity)
    const unitPriceNum = Number(newItems[index].unitPrice)

    if (!isNaN(quantityNum) && !isNaN(unitPriceNum)) {
      newItems[index].total = quantityNum * unitPriceNum
    } else {
      newItems[index].total = 0
    }

    setItems(newItems)
  }

  const updateDiscount = (value: string) => {
    if (value !== "" && !/^\d*\.?\d*$/.test(value)) return
    setFormData((prev) => ({ ...prev, discount: value }))
  }

  const subtotal = items.reduce((sum, item) => sum + item.total, 0)
  const discountPercent = Number(formData.discount) || 0
  const discountAmount = (subtotal * discountPercent) / 100
  const total = subtotal - discountAmount

  const generateInvoiceNumber = () => {
    const now = new Date()
    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, "0")
    const day = String(now.getDate()).padStart(2, "0")
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, "0")
    const invoiceNum = `TS-${year}${month}${day}-${random}` // Cambié OD por TS (TECHSTORE)
    setFormData({ ...formData, invoiceNumber: invoiceNum })
  }

  // Función de submit corregida
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    console.log("Iniciando validación...")
    
    if (!validateForm()) {
      console.log("Validación falló")
      toast({
        title: "❌ Error en el formulario",
        description: "Por favor, complete todos los campos requeridos",
        variant: "destructive",
        duration: 4000,
      })
      return
    }

    console.log("Validación exitosa, generando factura...")
    setIsGenerating(true)

    try {
      // Filtrar solo items válidos
      const validItems = items.filter(item => {
        const hasDescription = item.description.trim().length > 0
        const hasValidQuantity = Number(item.quantity) > 0 && !isNaN(Number(item.quantity))
        const hasValidPrice = Number(item.unitPrice) > 0 && !isNaN(Number(item.unitPrice))
        
        return hasDescription && hasValidQuantity && hasValidPrice
      })

      const invoiceData: InvoiceData = {
        ...formData,
        items: validItems,
        subtotal,
        discount: discountAmount,
        total,
      }

      console.log("Datos de la factura:", invoiceData)

      // Simular tiempo de procesamiento
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Generar y descargar la factura como HTML con tema actual
      generatePDF(invoiceData, isDark)
      
      setLastGeneratedInvoice(invoiceData)
      setInvoiceGenerated(true)

      toast({
        title: "✅ Factura generada exitosamente",
        description: `Factura ${invoiceData.invoiceNumber} descargada correctamente`,
        duration: 4000,
      })

    } catch (error) {
      console.error("Error generando factura:", error)
      toast({
        title: "❌ Error al generar factura",
        description: "Hubo un problema al generar la factura. Intente nuevamente.",
        variant: "destructive",
        duration: 4000,
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const handleDownloadAgain = () => {
    if (lastGeneratedInvoice) {
      generatePDF(lastGeneratedInvoice, isDark)
      toast({
        title: "📄 Factura descargada",
        description: "La factura se descargó nuevamente",
        duration: 3000,
      })
    }
  }

  const clearForm = () => {
    setFormData({
      customerName: "",
      customerEmail: "",
      customerPhone: "",
      customerAddress: "",
      invoiceNumber: "",
      date: new Date().toISOString().split("T")[0],
      paymentMethod: "",
      notes: "",
      discount: "",
    })
    setItems([{ description: "", quantity: "1", unitPrice: "0", total: 0 }])
    setErrors({})
    setInvoiceGenerated(false)
    setLastGeneratedInvoice(null)
  }

  // No renderizar hasta que esté montado
  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background p-2 sm:p-4 md:p-6 transition-colors duration-200">
      <div className="max-w-4xl mx-auto">
        {/* Header - ACTUALIZADO PARA TECHSTORE */}
        <div className="mb-4 sm:mb-8">
          <div className="flex items-center gap-2 sm:gap-3 mb-2">
            <div className="p-2 bg-blue-600 rounded-lg">
              <Receipt className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-blue-600">
                Sistema de Facturación - TECHSTORE
              </h1>
              <p className="text-sm sm:text-base text-muted-foreground">
                Genere facturas profesionales con descarga automática
              </p>
            </div>
          </div>
        </div>

        <Card className="shadow-lg border-0 dark:border">
          <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-t-lg p-4 sm:p-6">
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <FileText className="w-4 h-4 sm:w-5 sm:h-5" />
              Nueva Factura
            </CardTitle>
            <CardDescription className="text-blue-100 text-sm">
              Complete los datos para generar su factura profesional
            </CardDescription>
          </CardHeader>

          <CardContent className="p-3 sm:p-4 md:p-6">
            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6" noValidate>
              {/* Información del cliente */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-blue-600 border-b border-blue-200 pb-2">
                  Información del Cliente
                </h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="customerName" className="text-sm font-medium">
                      Nombre Cliente *
                    </Label>
                    <Input
                      id="customerName"
                      value={formData.customerName}
                      onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                      className={`${errors.customerName ? "border-red-500" : ""} h-11 sm:h-10`}
                      placeholder="Nombre completo del cliente"
                    />
                    {errors.customerName && (
                      <p className="text-red-500 text-xs mt-1">{errors.customerName}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="customerEmail" className="text-sm font-medium">
                      Email
                    </Label>
                    <Input
                      id="customerEmail"
                      type="email"
                      value={formData.customerEmail}
                      onChange={(e) => setFormData({ ...formData, customerEmail: e.target.value })}
                      className={`${errors.customerEmail ? "border-red-500" : ""} h-11 sm:h-10`}
                      placeholder="cliente@email.com"
                    />
                    {errors.customerEmail && (
                      <p className="text-red-500 text-xs mt-1">{errors.customerEmail}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="customerPhone" className="text-sm font-medium">
                      Teléfono
                    </Label>
                    <Input
                      id="customerPhone"
                      value={formData.customerPhone}
                      onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
                      className="h-11 sm:h-10"
                      placeholder="+54 11 1234-5678"
                    />
                  </div>

                  <div>
                    <Label htmlFor="customerAddress" className="text-sm font-medium">
                      Dirección
                    </Label>
                    <Textarea
                      id="customerAddress"
                      value={formData.customerAddress}
                      onChange={(e) => setFormData({ ...formData, customerAddress: e.target.value })}
                      rows={2}
                      className="text-sm"
                      placeholder="Dirección completa"
                    />
                  </div>
                </div>
              </div>

              {/* Información de la factura */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-blue-600 border-b border-blue-200 pb-2">
                  Información de la Factura
                </h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="invoiceNumber" className="text-sm font-medium">
                      Número de Factura *
                    </Label>
                    <div className="flex gap-2">
                      <Input
                        id="invoiceNumber"
                        value={formData.invoiceNumber}
                        onChange={(e) => setFormData({ ...formData, invoiceNumber: e.target.value })}
                        className={`${errors.invoiceNumber ? "border-red-500" : ""} h-11 sm:h-10`}
                        placeholder="TS-20250127-001"
                      />
                      <Button
                        type="button"
                        onClick={generateInvoiceNumber}
                        variant="outline"
                        size="sm"
                        className="px-3 whitespace-nowrap h-11 sm:h-10"
                      >
                        AUTO
                      </Button>
                    </div>
                    {errors.invoiceNumber && (
                      <p className="text-red-500 text-xs mt-1">{errors.invoiceNumber}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="date" className="text-sm font-medium">
                      Fecha *
                    </Label>
                    <Input
                      id="date"
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      className={`${errors.date ? "border-red-500" : ""} h-11 sm:h-10`}
                    />
                    {errors.date && (
                      <p className="text-red-500 text-xs mt-1">{errors.date}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="paymentMethod" className="text-sm font-medium">
                      Método de Pago *
                    </Label>
                    <Select value={formData.paymentMethod} onValueChange={(value) => setFormData({ ...formData, paymentMethod: value })}>
                      <SelectTrigger className={`${errors.paymentMethod ? "border-red-500" : ""} h-11 sm:h-10`}>
                        <SelectValue placeholder="Seleccionar método" />
                      </SelectTrigger>
                      <SelectContent>
                        {metodosPago.map((metodo) => (
                          <SelectItem key={metodo} value={metodo}>
                            {metodo}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.paymentMethod && (
                      <p className="text-red-500 text-xs mt-1">{errors.paymentMethod}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Items */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-blue-600 border-b border-blue-200 pb-2">
                    Productos / Servicios *
                  </h3>
                  {errors.items && (
                    <p className="text-red-500 text-sm">{errors.items}</p>
                  )}
                </div>
                
                <div className="space-y-3">
                  {items.map((item, index) => (
                    <div key={index} className="p-4 border rounded-lg bg-muted/50 space-y-3">
                      <div>
                        <Label className="text-xs text-muted-foreground">Descripción</Label>
                        <Input
                          placeholder="Descripción del producto/servicio"
                          value={item.description}
                          onChange={(e) => updateItem(index, "description", e.target.value)}
                          className="mt-1 h-11 sm:h-10"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-end">
                        <div>
                          <Label className="text-xs text-muted-foreground">Cantidad</Label>
                          <Input
                            type="text"
                            placeholder="1"
                            value={item.quantity}
                            onChange={(e) => updateItem(index, "quantity", e.target.value)}
                            className="mt-1 h-11 sm:h-10"
                          />
                        </div>

                        <div>
                          <Label className="text-xs text-muted-foreground">Precio Unit.</Label>
                          <Input
                            type="text"
                            placeholder="0.00"
                            value={item.unitPrice}
                            onChange={(e) => updateItem(index, "unitPrice", e.target.value)}
                            className="mt-1 h-11 sm:h-10"
                          />
                        </div>

                        <div>
                          <Label className="text-xs text-muted-foreground">Total</Label>
                          <div className="mt-1 h-11 sm:h-10 px-3 py-2 border rounded-md bg-background flex items-center">
                            <span className="font-medium text-blue-600 text-sm">
                              {formatCurrency(item.total)}
                            </span>
                          </div>
                        </div>

                        {items.length > 1 && (
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            onClick={() => removeItem(index)}
                            className="h-11 sm:h-10"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <Button 
                  type="button" 
                  onClick={addItem} 
                  variant="outline" 
                  className="w-full sm:w-auto h-11 sm:h-10"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Agregar Producto/Servicio
                </Button>
              </div>

              {/* Totales */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-blue-600 border-b border-blue-200 pb-2">
                  Totales
                </h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="discount" className="text-sm font-medium">
                      Descuento (%)
                    </Label>
                    <Input
                      id="discount"
                      type="text"
                      placeholder="0"
                      value={formData.discount}
                      onChange={(e) => updateDiscount(e.target.value)}
                      className="h-11 sm:h-10"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Subtotal:</span>
                      <span className="font-medium">{formatCurrency(subtotal)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Descuento:</span>
                      <span className="font-medium text-red-600">-{formatCurrency(discountAmount)}</span>
                    </div>
                    <div className="flex justify-between text-lg font-bold text-blue-600 border-t pt-2">
                      <span>TOTAL:</span>
                      <span>{formatCurrency(total)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Notas */}
              <div>
                <Label htmlFor="notes" className="text-sm font-medium">
                  Notas adicionales
                </Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={3}
                  placeholder="Notas, términos y condiciones..."
                  className="mt-1"
                />
              </div>

              {/* Botones */}
              <div className="flex flex-col gap-3 pt-6 border-t">
                {invoiceGenerated && lastGeneratedInvoice && (
                  <div className="flex items-center gap-3 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                    <CheckCircle className="w-5 h-5 text-blue-600" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
                        Factura {lastGeneratedInvoice.invoiceNumber} generada exitosamente
                      </p>
                    </div>
                    <Button
                      type="button"
                      onClick={handleDownloadAgain}
                      variant="outline"
                      size="sm"
                      className="border-blue-300 text-blue-700 hover:bg-blue-100"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Descargar nuevamente
                    </Button>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={clearForm}
                    disabled={isGenerating}
                    className="w-full sm:w-auto h-12 sm:h-10"
                  >
                    Limpiar Formulario
                  </Button>

                  <Button 
                    type="submit" 
                    disabled={isGenerating}
                    className="bg-blue-600 hover:bg-blue-700 w-full sm:flex-1 h-12 sm:h-10"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Generando factura...
                      </>
                    ) : (
                      <>
                        <FileText className="w-4 h-4 mr-2" />
                        Generar Factura {isDark ? '(Tema Oscuro)' : '(Tema Claro)'}
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
