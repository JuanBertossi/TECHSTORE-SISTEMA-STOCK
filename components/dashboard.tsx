"use client"
import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Header } from "./header"
import { ProductForm } from "./product-form"
import { ProductListTable } from "./product-list-table"
import { LowStockAlerts } from "./low-stock-alerts"
import { MovementHistory } from "./movement-history"
import { BulkPriceUpdate } from "./bulk-price-update"
import { StockValueReport } from "./stock-value-report"
import FacturacionForm from "../components/facturas-form"
import { useInventoryNeon } from "../hooks/use-inventory-neon"
import type { Product } from "../types/inventory"
import { useToast } from "@/hooks/use-toast"
import {
  Package,
  AlertTriangle,
  AlertCircle,
  DollarSign,
  TrendingUp,
  Loader2,
  RefreshCw,
  WifiOff,
  Database,
  Settings,
  ArrowLeft,
  Plus,
  List,
  DollarSign as PriceIcon,
  BarChart3,
  Receipt,
  Eye,
  History,
  ShoppingCart,
  Package2,
  Home,
  ChevronRight,
  Search,
  Filter,
  CheckCircle,
  Menu,
  X
} from "lucide-react"

export function Dashboard() {
  const { toast } = useToast()
  const [activeSection, setActiveSection] = useState("products")
  const [isMobile, setIsMobile] = useState(false)

  const {
    products,
    movements,
    priceHistory,
    loading,
    error,
    connectionStatus,
    addProduct,
    updateProduct,
    deleteProduct,
    addMovement,
    clearAllMovements,
    getLowStockAlerts,
    getMovementsByProduct,
    getPriceHistoryByProduct,
    updatePricesByCategory,
    getTotalInventoryValue,
    getTotalInventoryCost,
    refreshData,
    retryConnection,
  } = useInventoryNeon()
  
  // Estados existentes
  const [showAddProduct, setShowAddProduct] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [showMovementModal, setShowMovementModal] = useState(false)
  const [selectedProductForMovement, setSelectedProductForMovement] = useState<Product | null>(null)
  const [movementType, setMovementType] = useState<"entrada" | "salida">("entrada")
  const [movementQuantity, setMovementQuantity] = useState("1")
  const [movementReason, setMovementReason] = useState("")
  const [customReason, setCustomReason] = useState("")
  const [useCustomReason, setUseCustomReason] = useState(false)
  const [movementError, setMovementError] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Detectar dispositivo móvil
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const lowStockAlerts = getLowStockAlerts()
  const totalValue = getTotalInventoryValue()
  const totalCost = getTotalInventoryCost()

  // Estadísticas para el header
  const headerStats = {
    totalProducts: products.length,
    totalValue: totalValue,
    movements: movements.length,
    alerts: lowStockAlerts.length
  }

  const handleNavigation = (section: string) => {
    setActiveSection(section)
    // Resetear estados cuando cambia de sección
    if (section !== 'add') {
      setEditingProduct(null)
      setShowAddProduct(false)
    }
    if (section === 'add') {
      setShowAddProduct(true)
    }
  }

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product)
    setShowAddProduct(true)
    setActiveSection('add')
  }

  const handleCancelEdit = () => {
    setEditingProduct(null)
    setShowAddProduct(false)
    setActiveSection('products')
  }

  // Funciones de manejo existentes
  const handleAddProduct = async (productData: Omit<Product, "id" | "createdAt" | "updatedAt">) => {
    try {
      setIsSubmitting(true)
      await addProduct(productData)
      setShowAddProduct(false)
      setEditingProduct(null)
      setActiveSection('products')

      toast({
        title: "✅ Producto agregado",
        description: `${productData.name} se agregó correctamente al inventario.`,
        duration: 3000,
      })
    } catch (err) {
      console.error("Error en handleAddProduct:", err)
      const errorMessage = err instanceof Error ? err.message : "Error desconocido"
      toast({
        title: "❌ Error al agregar producto",
        description: errorMessage,
        variant: "destructive",
        duration: 5000,
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleUpdateProduct = async (productData: Omit<Product, "id" | "createdAt" | "updatedAt">) => {
    if (editingProduct) {
      try {
        setIsSubmitting(true)
        await updateProduct(editingProduct.id, productData)
        setEditingProduct(null)
        setShowAddProduct(false)
        setActiveSection('products')

        toast({
          title: "✅ Producto actualizado",
          description: `${productData.name} se actualizó correctamente.`,
          duration: 3000,
        })
      } catch (err) {
        console.error("Error en handleUpdateProduct:", err)
        const errorMessage = err instanceof Error ? err.message : "Error desconocido"
        toast({
          title: "❌ Error al actualizar producto",
          description: errorMessage,
          variant: "destructive",
          duration: 5000,
        })
      } finally {
        setIsSubmitting(false)
      }
    }
  }

  const handleQuickSale = (product: Product) => {
    if (product.quantity > 0) {
      setSelectedProductForMovement(product)
      setMovementType("salida")
      setMovementQuantity("1")
      setMovementReason("Venta a cliente")
      setCustomReason("")
      setUseCustomReason(false)
      setShowMovementModal(true)
    }
  }

  const handleQuickStock = (product: Product) => {
    setSelectedProductForMovement(product)
    setMovementType("entrada")
    setMovementQuantity("5")
    setMovementReason("Reposición de stock")
    setCustomReason("")
    setUseCustomReason(false)
    setShowMovementModal(true)
  }

  const handleMovementSubmit = async () => {
    setMovementError("")
    setIsSubmitting(true)

    try {
      const finalReason = useCustomReason ? customReason.trim() : movementReason
      const quantity = Number(movementQuantity)

      if (!finalReason) {
        setMovementError("El motivo del movimiento es obligatorio")
        return
      }

      if (quantity <= 0) {
        setMovementError("La cantidad debe ser mayor a 0")
        return
      }

      if (selectedProductForMovement) {
        await addMovement(selectedProductForMovement.id, movementType, quantity, finalReason)
        setShowMovementModal(false)
        setSelectedProductForMovement(null)
        setMovementQuantity("1")
        setMovementReason("")
        setCustomReason("")
        setUseCustomReason(false)
        setMovementError("")

        const actionText = movementType === "entrada" ? "agregó stock" : "registró venta"
        const emoji = movementType === "entrada" ? "📦" : "💰"

        toast({
          title: `${emoji} ${movementType === "entrada" ? "Stock agregado" : "Venta registrada"}`,
          description: `Se ${actionText} de ${quantity} unidades para ${selectedProductForMovement.name}.`,
          duration: 3000,
        })
      }
    } catch (err) {
      setMovementError(err instanceof Error ? err.message : "Error al procesar el movimiento")
      toast({
        title: "❌ Error en movimiento",
        description: err instanceof Error ? err.message : "No se pudo procesar el movimiento.",
        variant: "destructive",
        duration: 4000,
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const predefinedReasons = {
    entrada: [
      "Compra a proveedor",
      "Devolución de cliente",
      "Reposición de stock",
      "Ajuste de inventario (corrección)",
      "Transferencia desde otra sucursal",
      "Producto en consignación",
      "Recuperación de producto reparado",
    ],
    salida: [
      "Venta a cliente",
      "Venta online",
      "Producto defectuoso/dañado",
      "Muestra para cliente",
      "Transferencia a otra sucursal",
      "Devolución a proveedor",
      "Robo/pérdida",
      "Producto vencido/obsoleto",
      "Uso interno/demostración",
    ],
  }

  const renderContent = () => {
    switch (activeSection) {
      case 'products':
        return (
          <div className="space-y-4">
            {!isMobile && (
              <div>
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Package2 className="h-5 w-5 text-blue-600" />
                  Lista de Productos
                </h3>
                <p className="text-sm text-muted-foreground">
                  Gestiona tu inventario: editar, eliminar, y realizar movimientos de stock
                </p>
              </div>
            )}
            <ProductListTable
              products={products}
              onEdit={handleEditProduct}
              onDelete={deleteProduct}
              onQuickSale={handleQuickSale}
              onQuickStock={handleQuickStock}
              getMovementsByProduct={getMovementsByProduct}
              getPriceHistoryByProduct={getPriceHistoryByProduct}
            />
          </div>
        )
      
      case 'add':
        return (
          <div className="space-y-4">
            {connectionStatus === "offline" ? (
              <Alert>
                <WifiOff className="h-4 w-4" />
                <AlertDescription>
                  <strong>Funcionalidad no disponible sin conexión</strong><br />
                  Para agregar productos necesitas estar conectado a la base de datos.
                </AlertDescription>
              </Alert>
            ) : (
              <div className="space-y-4">
                {!isMobile && (
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    {editingProduct && (
                      <Button 
                        variant="outline" 
                        onClick={handleCancelEdit}
                        className="flex items-center gap-2"
                      >
                        <ArrowLeft className="h-4 w-4" />
                        Volver a la lista
                      </Button>
                    )}
                  </div>
                )}

                <ProductForm
                  onSubmit={editingProduct ? handleUpdateProduct : handleAddProduct}
                  initialData={editingProduct || undefined}
                  editing={!!editingProduct}
                  isEditing={!!editingProduct}
                  existingCodes={products.map(p => p.code)}
                  products={products}
                  onCancel={handleCancelEdit}
                />
              </div>
            )}
          </div>
        )
      
      case 'movements':
        return (
          <div className="space-y-4">
            <MovementHistory 
              movements={movements} 
              products={products} 
              onClearMovements={clearAllMovements}
            />
          </div>
        )
      
      case 'alerts':
        return (
          <div className="space-y-4">
            <LowStockAlerts
              alerts={lowStockAlerts}
              onAddStock={(productId) => {
                const product = products.find((p) => p.id === productId)
                if (product) handleQuickStock(product)
              }}
            />
          </div>
        )
      
      case 'prices':
        return (
          <div className="space-y-4">
            {connectionStatus === "offline" ? (
              <Alert>
                <WifiOff className="h-4 w-4" />
                <AlertDescription>
                  <strong>Funcionalidad no disponible sin conexión</strong><br />
                  Para actualizar precios necesitas estar conectado a la base de datos.
                </AlertDescription>
              </Alert>
            ) : (
              <div className="space-y-4">
                <BulkPriceUpdate products={products} onUpdatePrices={updatePricesByCategory} />
              </div>
            )}
          </div>
        )
      
      case 'billing':
        return <FacturacionForm />
      
      case 'reports':
        return (
          <div className="space-y-4">
            {!isMobile && (
              <div>
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-blue-600" />
                  Reportes y Análisis
                </h3>
                <p className="text-sm text-muted-foreground">
                  Información detallada sobre el valor de tu inventario
                </p>
              </div>
            )}
            <StockValueReport 
              products={products} 
              totalInventoryValue={totalValue} 
              totalInventoryCost={totalCost} 
            />
          </div>
        )
      
      default:
        return (
          <div className="text-center py-8">
            <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">Sección no encontrada</p>
          </div>
        )
    }
  }

  if (loading) {
    return (
      <TooltipProvider>
        <div className="min-h-screen bg-background">
          <Header 
            onNavigate={handleNavigation}
            currentSection={activeSection}
            stats={headerStats}
          />
          <div className="container mx-auto p-4 md:p-6 flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
              <p className="text-muted-foreground">Cargando inventario...</p>
              <p className="text-sm text-muted-foreground mt-2">Conectando con la base de datos...</p>
            </div>
          </div>
        </div>
      </TooltipProvider>
    )
  }

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-background">
        <Header 
          onNavigate={handleNavigation}
          currentSection={activeSection}
          stats={headerStats}
        />
        
        <div className="container mx-auto p-3 sm:p-4 md:p-6 space-y-4 md:space-y-6">
          {/* Error Alert */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                <div>
                  <p className="font-medium">No se pudo conectar a la base de datos</p>
                  <p className="text-sm">{error}</p>
                  <p className="text-xs mt-1">Verifica tu conexión a internet y la configuración</p>
                </div>
                <Button size="sm" variant="outline" onClick={retryConnection}>
                  <RefreshCw className="h-3 w-3 mr-1" />
                  Intentar de nuevo
                </Button>
              </AlertDescription>
            </Alert>
          )}

          {/* Cards de Métricas - Solo en desktop */}
          {!isMobile && (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
              <Card>
                <CardContent className="p-4 md:p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs md:text-sm text-muted-foreground">Total Productos</p>
                      <p className="text-xl md:text-3xl font-bold">{products.length}</p>
                      <p className="text-xs text-muted-foreground hidden md:block">
                        {connectionStatus === "offline" ? "Datos de ejemplo" : "Productos en inventario"}
                      </p>
                    </div>
                    <Package className="h-6 w-6 md:h-8 md:w-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4 md:p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs md:text-sm text-muted-foreground">Valor Inventario</p>
                      <p className="text-xl md:text-3xl font-bold">${totalValue.toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground hidden md:block">Valor total en stock</p>
                    </div>
                    <DollarSign className="h-6 w-6 md:h-8 md:w-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>

              <Card 
                className="cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-105 hover:ring-2 hover:ring-purple-200"
                onClick={() => handleNavigation('movements')}
              >
                <CardContent className="p-4 md:p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs md:text-sm text-muted-foreground">Movimientos</p>
                      <p className="text-xl md:text-3xl font-bold text-purple-600">{movements.length}</p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <span className="inline-block w-2 h-2 bg-purple-500 rounded-full"></span>
                        Click para ver historial
                      </p>
                    </div>
                    <div className="relative">
                      <TrendingUp className="h-6 w-6 md:h-8 md:w-8 text-purple-600" />
                      {movements.length > 0 && (
                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-purple-500 rounded-full"></div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card 
                className={`cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-105 ${
                  lowStockAlerts.length > 0 
                    ? 'ring-2 ring-red-200 hover:ring-red-300' 
                    : 'hover:ring-2 hover:ring-gray-200'
                }`}
                onClick={() => handleNavigation('alerts')}
              >
                <CardContent className="p-4 md:p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs md:text-sm text-muted-foreground">Alertas Stock</p>
                      <p className={`text-xl md:text-3xl font-bold ${lowStockAlerts.length > 0 ? 'text-red-600' : 'text-gray-600'}`}>
                        {lowStockAlerts.length}
                      </p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        {lowStockAlerts.length > 0 ? (
                          <>
                            <span className="inline-block w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                            Click para ver detalles
                          </>
                        ) : (
                          "Todo en stock"
                        )}
                      </p>
                    </div>
                    <div className="relative">
                      <AlertTriangle className={`h-6 w-6 md:h-8 md:w-8 ${lowStockAlerts.length > 0 ? 'text-red-600' : 'text-gray-400'}`} />
                      {lowStockAlerts.length > 0 && (
                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Título de sección para móviles */}
          {isMobile && (
            <div className="mb-4">
              <h2 className="text-lg font-semibold">
                {activeSection === 'products' && 'Lista de Productos'}
                {activeSection === 'add' && (editingProduct ? 'Editar Producto' : 'Agregar Producto')}
                {activeSection === 'movements' && 'Historial de Movimientos'}
                {activeSection === 'alerts' && 'Alertas de Stock'}
                {activeSection === 'billing' && 'Sistema de Facturación'}
                {activeSection === 'reports' && 'Reportes y Análisis'}
                {activeSection === 'prices' && 'Actualizar Precios'}
              </h2>
            </div>
          )}

          {/* Navegación por pestañas - Solo desktop */}
          {!isMobile && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-xl">Herramientas de Gestión</CardTitle>
                <p className="text-sm text-muted-foreground">Selecciona una opción para comenzar</p>
              </CardHeader>
              <CardContent>
                <Tabs value={activeSection} onValueChange={handleNavigation} className="w-full">
                  <TabsList className="grid w-full grid-cols-5 h-auto p-1">
                    <TabsTrigger value="products" className="flex flex-col items-center gap-2 py-3 px-4">
                      <List className="h-5 w-5" />
                      <div className="text-center">
                        <div className="font-medium">Ver Productos</div>
                        <div className="text-xs text-muted-foreground">Lista completa</div>
                      </div>
                    </TabsTrigger>
                    
                    <TabsTrigger value="add" className="flex flex-col items-center gap-2 py-3 px-4" disabled={connectionStatus === "offline"}>
                      <Plus className="h-5 w-5" />
                      <div className="text-center">
                        <div className="font-medium">Agregar</div>
                        <div className="text-xs text-muted-foreground">Nuevo producto</div>
                      </div>
                    </TabsTrigger>
                    
                    <TabsTrigger value="prices" className="flex flex-col items-center gap-2 py-3 px-4" disabled={connectionStatus === "offline"}>
                      <PriceIcon className="h-5 w-5" />
                      <div className="text-center">
                        <div className="font-medium">Precios</div>
                        <div className="text-xs text-muted-foreground">Actualizar masivo</div>
                      </div>
                    </TabsTrigger>
                    
                    <TabsTrigger value="reports" className="flex flex-col items-center gap-2 py-3 px-4">
                      <BarChart3 className="h-5 w-5" />
                      <div className="text-center">
                        <div className="font-medium">Reportes</div>
                        <div className="text-xs text-muted-foreground">Análisis</div>
                      </div>
                    </TabsTrigger>
                    
                    <TabsTrigger value="billing" className="flex flex-col items-center gap-2 py-3 px-4">
                      <Receipt className="h-5 w-5" />
                      <div className="text-center">
                        <div className="font-medium">Facturación</div>
                        <div className="text-xs text-muted-foreground">Generar facturas</div>
                      </div>
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </CardContent>
            </Card>
          )}

          {/* Contenido principal */}
          {renderContent()}
        </div>

        {/* Modal para movimientos */}
        <Dialog open={showMovementModal} onOpenChange={setShowMovementModal}>
          <DialogContent className="max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-base md:text-lg">
                {movementType === "entrada" ? "📦 Agregar Stock" : "🛒 Registrar Venta"}
                {connectionStatus === "offline" && (
                  <Badge variant="outline" className="text-orange-600">
                    Offline
                  </Badge>
                )}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              {connectionStatus === "offline" && (
                <Alert>
                  <WifiOff className="h-4 w-4" />
                  <AlertDescription>
                    Sin conexión a la base de datos. Los movimientos no se pueden registrar en modo offline.
                  </AlertDescription>
                </Alert>
              )}

              {selectedProductForMovement && (
                <div className="p-4 bg-muted rounded-lg">
                  <p className="font-medium text-sm md:text-base">{selectedProductForMovement.name}</p>
                  <p className="text-sm text-muted-foreground">
                    <span className="font-semibold">Stock actual:</span> {selectedProductForMovement.quantity} unidades
                  </p>
                  <p className="text-sm text-muted-foreground">
                    <span className="font-semibold">Precio:</span> ${selectedProductForMovement.price.toLocaleString()}
                  </p>
                </div>
              )}

              {movementError && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{movementError}</AlertDescription>
                </Alert>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="movementQuantity">Cantidad *</Label>
                  <Input
                    id="movementQuantity"
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={movementQuantity}
                    onChange={(e) => {
                      const value = e.target.value
                      if (value === "" || /^\d+$/.test(value)) {
                        setMovementQuantity(value)
                      }
                    }}
                    placeholder="1"
                    disabled={connectionStatus === "offline"}
                    className="h-11 sm:h-10"
                  />
                  {movementType === "salida" && selectedProductForMovement && (
                    <p className="text-xs text-muted-foreground">
                      Máximo disponible: {selectedProductForMovement.quantity} unidades
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Valor Total</Label>
                  <div className="h-11 sm:h-10 px-3 py-2 border rounded-md bg-muted flex items-center">
                    <span className="font-medium text-green-600 text-sm md:text-base">
                      ${((selectedProductForMovement?.price || 0) * Number(movementQuantity || 0)).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  <Label className="text-sm font-medium">Motivo del movimiento *</Label>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <input
                        type="radio"
                        id="predefined"
                        checked={!useCustomReason}
                        onChange={() => setUseCustomReason(false)}
                        disabled={connectionStatus === "offline"}
                      />
                      <Label htmlFor="predefined" className="text-sm">
                        Seleccionar
                      </Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="radio"
                        id="custom"
                        checked={useCustomReason}
                        onChange={() => setUseCustomReason(true)}
                        disabled={connectionStatus === "offline"}
                      />
                      <Label htmlFor="custom" className="text-sm">
                        Escribir
                      </Label>
                    </div>
                  </div>
                </div>

                {!useCustomReason ? (
                  <div className="space-y-2">
                    <Select
                      value={movementReason}
                      onValueChange={setMovementReason}
                      disabled={connectionStatus === "offline"}
                    >
                      <SelectTrigger className="h-11 sm:h-10">
                        <SelectValue placeholder="Selecciona un motivo..." />
                      </SelectTrigger>
                      <SelectContent>
                        {predefinedReasons[movementType].map((reason) => (
                          <SelectItem key={reason} value={reason}>
                            {reason}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Textarea
                      value={customReason}
                      onChange={(e) => setCustomReason(e.target.value)}
                      placeholder="Describe el motivo específico del movimiento..."
                      rows={3}
                      disabled={connectionStatus === "offline"}
                      className="text-sm"
                    />
                  </div>
                )}
              </div>

              <div className="flex flex-col sm:flex-row gap-2 pt-4">
                <Button
                  onClick={handleMovementSubmit}
                  disabled={
                    isSubmitting ||
                    connectionStatus === "offline" ||
                    (!useCustomReason && !movementReason.trim()) ||
                    (useCustomReason && !customReason.trim()) ||
                    !movementQuantity ||
                    Number(movementQuantity) <= 0
                  }
                  className={`flex-1 h-11 sm:h-10 ${
                    movementType === "entrada" ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"
                  }`}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Procesando...
                    </>
                  ) : movementType === "entrada" ? (
                    "✅ Agregar Stock"
                  ) : (
                    "💰 Registrar Venta"
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowMovementModal(false)
                    setMovementError("")
                    setCustomReason("")
                    setUseCustomReason(false)
                  }}
                  className="flex-1 h-11 sm:h-10"
                  disabled={isSubmitting}
                >
                  Cancelar
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  )
}
