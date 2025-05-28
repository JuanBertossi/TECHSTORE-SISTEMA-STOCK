"use client"

import { useState, useEffect } from "react"
import { sql, testConnection, checkConfiguration } from "../lib/neon"
import type { Product, Movement, PriceHistory, StockAlert } from "../types/inventory"

export function useInventoryNeon() {
  const [products, setProducts] = useState<Product[]>([])
  const [movements, setMovements] = useState<Movement[]>([])
  const [priceHistory, setPriceHistory] = useState<PriceHistory[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [connectionStatus, setConnectionStatus] = useState<"connecting" | "connected" | "error" | "offline">(
    "connecting",
  )

  // Cargar datos iniciales
  useEffect(() => {
    initializeConnection()
  }, [])

  const initializeConnection = async () => {
    try {
      setLoading(true)
      setError(null)
      setConnectionStatus("connecting")

      console.log("🚀 Iniciando conexión a Neon...")

      // Verificar configuración primero
      const config = checkConfiguration()
      if (!config.hasUrl) {
        throw new Error("Variable de entorno DATABASE_URL no configurada correctamente")
      }

      if (!config.urlValid) {
        throw new Error("URL de Neon inválida. Debe ser una URL de neon.tech")
      }

      // Probar conexión
      const connectionTest = await testConnection()
      console.log("📊 Resultado de conexión:", connectionTest)

      if (!connectionTest.success) {
        setConnectionStatus("error")

        // Proporcionar mensajes de error más específicos
        let userFriendlyMessage = connectionTest.message

        switch (connectionTest.errorType) {
          case "TABLE_NOT_FOUND":
            userFriendlyMessage =
              "⚠️ Las tablas no existen en la base de datos. Ejecuta el script SQL para crear las tablas 'productos', 'categorias', 'movimientos' y 'alertas_stock'."
            break
          case "INVALID_CREDENTIALS":
            userFriendlyMessage = "🔑 Credenciales inválidas. Verifica que DATABASE_URL sea correcta."
            break
          case "PERMISSION_DENIED":
            userFriendlyMessage = "🚫 Sin permisos. Verifica la configuración de tu base de datos en Neon."
            break
          case "NETWORK_ERROR":
            userFriendlyMessage = "🌐 Error de red. Verifica tu conexión a internet y la URL de Neon."
            break
        }

        throw new Error(userFriendlyMessage)
      }

      setConnectionStatus("connected")
      console.log("✅ Conexión establecida, cargando datos...")

      // Si la conexión es exitosa, cargar datos
      await loadAllData()
    } catch (err) {
      console.error("❌ Error en inicialización:", err)
      setConnectionStatus("error")
      setError(err instanceof Error ? err.message : "Error al conectar con la base de datos")

      // Fallback a modo offline con datos de ejemplo
      console.log("📱 Activando modo offline con datos de ejemplo...")
      loadSampleData()
    } finally {
      setLoading(false)
    }
  }

  const loadSampleData = () => {
    console.log("📋 Cargando datos de ejemplo...")

    const sampleProducts: Product[] = [
      {
        id: "sample-1",
        code: "TECH-NB-001",
        name: "Notebook Dell Inspiron 15 (DEMO)",
        category: "Notebooks",
        price: 950000,
        cost: 690000,
        quantity: 11,
        minStock: 4,
        description: "Datos de ejemplo - Notebook Intel Core i5, 8GB RAM",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: "sample-2",
        code: "TECH-KB-001",
        name: "Teclado Mecánico Logitech G Pro (DEMO)",
        category: "Periféricos",
        price: 135000,
        cost: 85000,
        quantity: 2,
        minStock: 8,
        description: "Datos de ejemplo - Teclado mecánico gaming",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: "sample-3",
        code: "TECH-NB-002",
        name: "Notebook HP Pavilion Gaming (DEMO)",
        category: "Notebooks",
        price: 950000,
        cost: 690000,
        quantity: 1,
        minStock: 4,
        description: "Datos de ejemplo - Notebook gaming",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ]

    setProducts(sampleProducts)
    setMovements([])
    setPriceHistory([])
    setConnectionStatus("offline")
  }

  const loadAllData = async () => {
    try {
      setError(null)
      console.log("📊 Cargando datos desde Neon...")

      // Cargar productos con categorías usando JOIN - EXCLUIR PRODUCTOS ELIMINADOS
      const productosData = await sql`
        SELECT 
          p.id,
          p.codigo,
          p.nombre,
          p.stock_actual,
          p.stock_minimo,
          p.costo_unitario,
          p.precio_venta,
          p.valor_total,
          c.nombre as categoria_nombre
        FROM productos p
        LEFT JOIN categorias c ON p.categoria_id = c.id
        WHERE p.deleted_at IS NULL
        ORDER BY p.nombre ASC
      `

      console.log("✅ Productos cargados:", productosData?.length || 0)

      // Cargar movimientos
      const movimientosData = await sql`
        SELECT * FROM movimientos 
        ORDER BY fecha DESC
      `

      console.log("✅ Movimientos cargados:", movimientosData?.length || 0)

      // Mapear productos al formato esperado
      const mappedProducts: Product[] = (productosData || []).map((item: any) => ({
        id: item.id,
        code: item.codigo,
        name: item.nombre,
        category: item.categoria_nombre || "Sin categoría",
        price: item.precio_venta,
        cost: item.costo_unitario,
        quantity: item.stock_actual,
        minStock: item.stock_minimo,
        description: `Producto ${item.nombre}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }))

      // Mapear movimientos al formato esperado
      const mappedMovements: Movement[] = (movimientosData || []).map((item: any) => ({
        id: item.id,
        productId: item.producto_id,
        type: item.tipo.toLowerCase() === "entrada" ? "entrada" : "salida",
        quantity: item.cantidad,
        reason: item.motivo || "Sin motivo especificado",
        date: item.fecha,
        previousQuantity: item.stock_antes,
        newQuantity: item.stock_despues,
      }))

      setProducts(mappedProducts)
      setMovements(mappedMovements)
      setPriceHistory([]) // No hay historial de precios en tu esquema actual

      console.log("🎉 Todos los datos cargados exitosamente")
    } catch (err) {
      console.error("❌ Error cargando datos:", err)
      setError(err instanceof Error ? err.message : "Error al cargar datos")
      throw err
    }
  }

  // Agregar producto
  const addProduct = async (productData: Omit<Product, "id" | "createdAt" | "updatedAt">) => {
    try {
      setError(null)

      if (connectionStatus === "offline") {
        throw new Error("No hay conexión a la base de datos. Funcionalidad limitada en modo offline.")
      }

      console.log("➕ Agregando producto:", productData.name)

      // Primero obtener o crear la categoría
      const categoriaResult = await sql`
        SELECT id FROM categorias 
        WHERE nombre = ${productData.category}
        LIMIT 1
      `

      let categoriaId: string

      if (categoriaResult.length === 0) {
        // La categoría no existe, crearla
        console.log("📁 Creando nueva categoría:", productData.category)
        const newCategoria = await sql`
          INSERT INTO categorias (nombre) 
          VALUES (${productData.category}) 
          RETURNING id
        `
        categoriaId = newCategoria[0].id
      } else {
        categoriaId = categoriaResult[0].id
      }

      // Insertar el producto
      const data = await sql`
        INSERT INTO productos (
          codigo, nombre, categoria_id, stock_actual, 
          stock_minimo, costo_unitario, precio_venta
        ) VALUES (
          ${productData.code}, ${productData.name}, ${categoriaId},
          ${productData.quantity}, ${productData.minStock}, 
          ${productData.cost}, ${productData.price}
        ) RETURNING *
      `

      console.log("✅ Producto agregado exitosamente:", data)
      await loadAllData()
      return data
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Error al agregar producto"
      console.error("❌ Error agregando producto:", errorMessage)
      setError(errorMessage)
      throw new Error(errorMessage)
    }
  }

  // Actualizar producto
  const updateProduct = async (id: string, updates: Partial<Product>) => {
    try {
      setError(null)

      if (connectionStatus === "offline") {
        throw new Error("No hay conexión a la base de datos. Funcionalidad limitada en modo offline.")
      }

      // Obtener o crear categoría si se está actualizando
      let categoria_id: string | undefined

      if (updates.category) {
        const categoriaResult = await sql`
          SELECT id FROM categorias 
          WHERE nombre = ${updates.category}
          LIMIT 1
        `

        if (categoriaResult.length === 0) {
          // La categoría no existe, crearla
          const newCategoria = await sql`
            INSERT INTO categorias (nombre) 
            VALUES (${updates.category}) 
            RETURNING id
          `
          categoria_id = newCategoria[0].id
        } else {
          categoria_id = categoriaResult[0].id
        }
      }

      // Construir query de actualización dinámicamente
      const updateFields = []
      const updateValues = []

      if (updates.code) {
        updateFields.push('codigo = $' + (updateValues.length + 1))
        updateValues.push(updates.code)
      }
      if (updates.name) {
        updateFields.push('nombre = $' + (updateValues.length + 1))
        updateValues.push(updates.name)
      }
      if (categoria_id) {
        updateFields.push('categoria_id = $' + (updateValues.length + 1))
        updateValues.push(categoria_id)
      }
      if (updates.quantity !== undefined) {
        updateFields.push('stock_actual = $' + (updateValues.length + 1))
        updateValues.push(updates.quantity)
      }
      if (updates.minStock !== undefined) {
        updateFields.push('stock_minimo = $' + (updateValues.length + 1))
        updateValues.push(updates.minStock)
      }
      if (updates.cost !== undefined) {
        updateFields.push('costo_unitario = $' + (updateValues.length + 1))
        updateValues.push(updates.cost)
      }
      if (updates.price !== undefined) {
        updateFields.push('precio_venta = $' + (updateValues.length + 1))
        updateValues.push(updates.price)
      }

      if (updateFields.length === 0) {
        throw new Error("No hay campos para actualizar")
      }

      // Agregar el ID al final
      updateValues.push(id)
      const idParam = '$' + updateValues.length

      const data = await sql`
        UPDATE productos 
        SET ${sql.unsafe(updateFields.join(', '))}
        WHERE id = ${id}
        RETURNING *
      `

      await loadAllData()
      return data
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Error al actualizar producto"
      setError(errorMessage)
      throw new Error(errorMessage)
    }
  }

  // Eliminar producto (soft delete) - VERSIÓN CORREGIDA PARA NEON
  const deleteProduct = async (id: string) => {
    try {
      setError(null)

      if (connectionStatus === "offline") {
        throw new Error("No hay conexión a la base de datos. Funcionalidad limitada en modo offline.")
      }

      console.log("🗑️ Desactivando producto (soft delete):", id)

      // Usar función SQL directa en lugar de RPC
      const result = await sql`
        SELECT sp_desactivar_producto(${id}) as result
      `

      const data = result[0]?.result

      if (!data || !data.success) {
        throw new Error(data?.message || "Error al eliminar producto")
      }

      console.log("✅ Producto desactivado exitosamente:", data.producto_nombre)
      
      await loadAllData()
      return data

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Error al eliminar producto"
      console.error("❌ Error eliminando producto:", errorMessage)
      setError(errorMessage)
      throw new Error(errorMessage)
    }
  }

  // Agregar movimiento
  const addMovement = async (productId: string, type: "entrada" | "salida", quantity: number, reason: string) => {
    try {
      setError(null)

      if (connectionStatus === "offline") {
        throw new Error("No hay conexión a la base de datos. Funcionalidad limitada en modo offline.")
      }

      if (!reason.trim()) {
        throw new Error("El motivo del movimiento es obligatorio")
      }

      // Obtener el producto actual
      const producto = await sql`
        SELECT stock_actual, precio_venta 
        FROM productos 
        WHERE id = ${productId}
      `

      if (producto.length === 0) {
        throw new Error("Producto no encontrado")
      }

      const stockAntes = producto[0].stock_actual
      const stockDespues = type === "entrada" ? stockAntes + quantity : stockAntes - quantity

      // Validar que no se pueda sacar más stock del disponible
      if (type === "salida" && stockDespues < 0) {
        throw new Error(`Stock insuficiente. Disponible: ${stockAntes}, Solicitado: ${quantity}`)
      }

      // Insertar el movimiento
      await sql`
        INSERT INTO movimientos (
          producto_id, fecha, tipo, cantidad, motivo, 
          stock_antes, stock_despues, valor_total
        ) VALUES (
          ${productId}, ${new Date().toISOString().split("T")[0]}, 
          ${type === "entrada" ? "Entrada" : "Salida"}, ${quantity}, 
          ${reason.trim()}, ${stockAntes}, ${stockDespues}, 
          ${producto[0].precio_venta * quantity}
        )
      `

      // Actualizar el stock del producto
      await sql`
        UPDATE productos 
        SET stock_actual = ${stockDespues} 
        WHERE id = ${productId}
      `

      await loadAllData()
      return true
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Error al procesar movimiento"
      setError(errorMessage)
      throw new Error(errorMessage)
    }
  }

  // Actualización masiva de precios por categoría
  const updatePricesByCategory = async (category: string, percentage: number) => {
    try {
      setError(null)

      if (connectionStatus === "offline") {
        throw new Error("No hay conexión a la base de datos. Funcionalidad limitada en modo offline.")
      }

      // Obtener la categoría
      const categoriaData = await sql`
        SELECT id FROM categorias 
        WHERE nombre = ${category}
        LIMIT 1
      `

      if (categoriaData.length === 0) {
        throw new Error("Categoría no encontrada")
      }

      // Obtener productos de la categoría (solo no eliminados)
      const productos = await sql`
        SELECT id, precio_venta 
        FROM productos 
        WHERE categoria_id = ${categoriaData[0].id} 
        AND deleted_at IS NULL
      `

      // Actualizar precios
      for (const producto of productos) {
        const newPrice = Math.round(producto.precio_venta * (1 + percentage / 100))
        await sql`
          UPDATE productos 
          SET precio_venta = ${newPrice} 
          WHERE id = ${producto.id}
        `
      }

      await loadAllData()
      return productos
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Error al actualizar precios"
      setError(errorMessage)
      throw new Error(errorMessage)
    }
  }

  // Limpiar todos los movimientos
  const clearAllMovements = async () => {
    try {
      setError(null)
  
      if (connectionStatus === "offline") {
        throw new Error("No hay conexión a la base de datos.")
      }
  
      console.log("🗑️ Eliminando todos los movimientos...")
  
      await sql`DELETE FROM movimientos`
  
      await loadAllData() // Recargar datos
      console.log("✅ Todos los movimientos eliminados")
  
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Error al eliminar movimientos"
      setError(errorMessage)
      throw new Error(errorMessage)
    }
  }

  // Funciones que funcionan en modo offline
  const getLowStockAlerts = (): StockAlert[] => {
    return products
      .filter((product) => product.quantity <= product.minStock)
      .map((product) => ({
        product,
        currentStock: product.quantity,
        minStock: product.minStock,
        difference: product.minStock - product.quantity,
      }))
  }

  const getMovementsByProduct = (productId: string) => {
    return movements
      .filter((movement) => movement.productId === productId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  }

  const getPriceHistoryByProduct = (productId: string) => {
    return priceHistory
      .filter((price) => price.productId === productId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  }

  const getTotalInventoryValue = () => {
    return products.reduce((total, product) => total + product.price * product.quantity, 0)
  }

  const getTotalInventoryCost = () => {
    return products.reduce((total, product) => total + product.cost * product.quantity, 0)
  }

  return {
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
    refreshData: loadAllData,
    retryConnection: initializeConnection,
  }
}
