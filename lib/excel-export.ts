// Función auxiliar para exportar datos a CSV (VERSIÓN FINAL CORREGIDA)
function exportToCSV(data: any[], filename: string): void {
  if (!data || data.length === 0) {
    alert("No hay datos disponibles para exportar.");
    return;
  }

  const headers = Object.keys(data[0]);
  
  // Headers completamente limpios
  const cleanHeaders = headers.map(header => {
    return header
      .replace(/[áàäâ]/g, 'a')
      .replace(/[éèëê]/g, 'e')
      .replace(/[íìïî]/g, 'i')
      .replace(/[óòöô]/g, 'o')
      .replace(/[úùüû]/g, 'u')
      .replace(/ñ/g, 'n')
      .replace(/ç/g, 'c')
      .replace(/[ÁÀÄÂ]/g, 'A')
      .replace(/[ÉÈËÊ]/g, 'E')
      .replace(/[ÍÌÏÎ]/g, 'I')
      .replace(/[ÓÒÖÔ]/g, 'O')
      .replace(/[ÚÙÜÛ]/g, 'U')
      .replace(/Ñ/g, 'N')
      .replace(/Ç/g, 'C');
  });
  
  // Crear CSV con formato específico para Excel
  const csvRows = [
    cleanHeaders.join(";"),
    ...data.map(row => 
      headers.map(header => {
        let value = row[header] ?? '';
        
        // Limpiar completamente los valores
        if (typeof value === 'string') {
          value = value
            .replace(/;/g, ",")
            .replace(/"/g, "'")
            .replace(/\n/g, " ")
            .replace(/\r/g, "")
            .replace(/[áàäâ]/g, 'a')
            .replace(/[éèëê]/g, 'e')
            .replace(/[íìïî]/g, 'i')
            .replace(/[óòöô]/g, 'o')
            .replace(/[úùüû]/g, 'u')
            .replace(/ñ/g, 'n')
            .replace(/ç/g, 'c')
            .replace(/[ÁÀÄÂ]/g, 'A')
            .replace(/[ÉÈËÊ]/g, 'E')
            .replace(/[ÍÌÏÎ]/g, 'I')
            .replace(/[ÓÒÖÔ]/g, 'O')
            .replace(/[ÚÙÜÛ]/g, 'U')
            .replace(/Ñ/g, 'N')
            .replace(/Ç/g, 'C');
        }
        
        return value;
      }).join(";")
    )
  ];

  // Crear contenido CSV con BOM UTF-8
  const csvContent = csvRows.join("\r\n");
  
  // BOM UTF-8 específico para Excel (basado en resultados de búsqueda)
  const BOM = new Uint8Array([0xEF, 0xBB, 0xBF]);
  const csvBytes = new TextEncoder().encode(csvContent);
  const finalContent = new Uint8Array(BOM.length + csvBytes.length);
  finalContent.set(BOM);
  finalContent.set(csvBytes, BOM.length);
  
  const blob = new Blob([finalContent], { 
    type: "text/csv;charset=utf-8;" 
  });
  
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}


// Exporta el inventario a un archivo Excel (CSV)
export function exportInventoryToExcel(products: any[] | any, filename: string = "inventario-techstore.csv"): void {
  let productArray: any[] = [];
  if (Array.isArray(products)) {
    productArray = products;
  } else if (products && typeof products === 'object') {
    if (Array.isArray(products.products)) {
      productArray = products.products;
    } else if (Array.isArray(products.data)) {
      productArray = products.data;
    } else if (Array.isArray(products.items)) {
      productArray = products.items;
    } else {
      alert("El formato de los datos del inventario no es compatible.");
      return;
    }
  } else {
    alert("Formato de datos no válido para exportar inventario.");
    return;
  }

  if (productArray.length === 0) {
    alert("No hay productos en el inventario para exportar.");
    return;
  }

  // Mapear con headers SIN TILDES
  const exportData = productArray.map((product, index) => ({
    "Codigo": product.code || product.id || `PROD-${index + 1}`,
    "Nombre": product.name || product.nombre || "Sin nombre",
    "Categoria": product.category || product.categoria || "Sin categoria",
    "Descripcion": product.description || product.descripcion || '',
    "Costo Unitario": product.cost || product.costo || 0,
    "Precio Venta": product.price || product.precio || 0,
    "Stock Actual": product.quantity || product.stock || product.cantidad || 0,
    "Stock Minimo": product.minStock || product.stockMinimo || 0,
    "Valor Total": (product.price || product.precio || 0) * (product.quantity || product.stock || product.cantidad || 0),
    "Margen Unitario": (product.price || product.precio || 0) - (product.cost || product.costo || 0),
    "Margen Porcentaje": (product.cost || product.costo || 0) > 0 ? 
      Math.round(((product.price || product.precio || 0) - (product.cost || product.costo || 0)) / (product.cost || product.costo || 0) * 100) : 0,
  }));

  exportToCSV(exportData, filename);
}

// Exporta el inventario a un archivo HTML descargable - CORREGIDO
export function exportInventoryToHTML(products: any[] | any, filename: string = "inventario-techstore.html"): void {
  let productArray: any[] = [];
  if (Array.isArray(products)) {
    productArray = products;
  } else if (products && typeof products === 'object') {
    if (Array.isArray(products.products)) {
      productArray = products.products;
    } else if (Array.isArray(products.data)) {
      productArray = products.data;
    } else if (Array.isArray(products.items)) {
      productArray = products.items;
    } else {
      alert("El formato de los datos del inventario no es compatible.");
      return;
    }
  } else {
    alert("Formato de datos no válido para exportar inventario.");
    return;
  }
  
  if (productArray.length === 0) {
    alert("No hay productos en el inventario para exportar.");
    return;
  }

  // Headers sin tildes para HTML también
  const headers = [
    "Codigo", "Nombre", "Categoria", "Descripcion", "Costo Unitario",
    "Precio Venta", "Stock Actual", "Stock Minimo", "Valor Total", "Margen Unitario", "Margen %", "Proveedor"
  ];

  let html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Inventario Techstore</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        h2 { color: #333; text-align: center; }
        table { border-collapse: collapse; width: 100%; margin-top: 20px; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f4f4f4; font-weight: bold; }
        tr:nth-child(even) { background-color: #f9f9f9; }
        .number { text-align: right; }
      </style>
    </head>
    <body>
      <h2>Inventario Techstore</h2>
      <p>Fecha de exportacion: ${new Date().toLocaleDateString()}</p>
      <table>
        <thead>
          <tr>${headers.map(h => `<th>${h}</th>`).join("")}</tr>
        </thead>
        <tbody>
          ${productArray.map((product, index) => `
            <tr>
              <td>${product.code || product.id || `PROD-${index + 1}`}</td>
              <td>${product.name || product.nombre || "Sin nombre"}</td>
              <td>${product.category || product.categoria || "Sin categoria"}</td>
              <td>${product.description || product.descripcion || ''}</td>
              <td class="number">$${(product.cost || product.costo || 0).toLocaleString()}</td>
              <td class="number">$${(product.price || product.precio || 0).toLocaleString()}</td>
              <td class="number">${product.quantity || product.stock || product.cantidad || 0}</td>
              <td class="number">${product.minStock || product.stockMinimo || 0}</td>
              <td class="number">$${((product.price || product.precio || 0) * (product.quantity || product.stock || product.cantidad || 0)).toLocaleString()}</td>
              <td class="number">$${((product.price || product.precio || 0) - (product.cost || product.costo || 0)).toLocaleString()}</td>
              <td class="number">${(product.cost || product.costo || 0) > 0 ? Math.round(((product.price || product.precio || 0) - (product.cost || product.costo || 0)) / (product.cost || product.costo || 0) * 100) : 0}%</td>
              <td>${product.supplier || product.proveedor || ''}</td>
            </tr>
          `).join("")}
        </tbody>
      </table>
    </body>
    </html>
  `;

  // Crear y descargar el archivo HTML
  const blob = new Blob([html], { type: "text/html;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// Exporta movimientos de inventario a Excel (CSV) - CORREGIDO
export function exportMovementsToExcel(movements: any[], filename: string = "movimientos-ovidio-descartables.csv"): void {
  if (!movements || movements.length === 0) {
    alert("No hay movimientos para exportar.");
    return;
  }

  const exportData = movements.map(movement => ({
    "Fecha": movement.date ? new Date(movement.date).toLocaleDateString("es-ES") : '',
    "Tipo": movement.type === "entrada" ? "Entrada" : "Salida",
    "Producto": movement.productName || "Producto no encontrado",
    "Codigo": movement.productCode || "N/A",
    "Cantidad": movement.quantity || 0,
    "Motivo": movement.reason || movement.motivo || '',
    "Stock Anterior": movement.previousQuantity || 0,
    "Stock Nuevo": movement.newQuantity || 0,
    "Valor": movement.value || 0
  }));

  exportToCSV(exportData, filename);
}

// Exporta reportes de ventas a Excel (CSV) - CORREGIDO
export function exportSalesToExcel(sales: any[], filename: string = "reporte-ventas.csv"): void {
  if (!sales || sales.length === 0) {
    alert("No hay ventas para exportar.");
    return;
  }

  const exportData = sales.map(sale => ({
    "Fecha": sale.date || sale.fecha || '',
    "Numero Venta": sale.saleNumber || sale.numeroVenta || '',
    "Cliente": sale.customerName || sale.nombreCliente || '',
    "Producto": sale.productName || sale.nombreProducto || '',
    "Cantidad": sale.quantity || sale.cantidad || 0,
    "Precio Unitario": sale.unitPrice || sale.precioUnitario || 0,
    "Total": sale.total || 0,
    "Metodo Pago": sale.paymentMethod || sale.metodoPago || '',
    "Vendedor": sale.seller || sale.vendedor || ''
  }));

  exportToCSV(exportData, filename);
}

// Exporta datos genéricos a Excel (CSV)
export function exportGenericToExcel(data: any[], filename: string = "export.csv"): void {
  exportToCSV(data, filename);
}

export const exportInventoryReport = exportInventoryToHTML;

// Exporta reporte de categorías a Excel (CSV) - CORREGIDO
export function exportCategoriesReport(categories: any[], filename: string = "reporte-categorias.csv"): void {
  if (!categories || categories.length === 0) {
    alert("No hay categorias para exportar.");
    return;
  }

  const exportData = categories.map(category => ({
    "ID": category.id || '',
    "Nombre": category.name || category.nombre || category.category || '',
    "Descripcion": category.description || category.descripcion || '',
    "Productos": category.products || category.productCount || category.cantidadProductos || 0,
    "Cantidad Total": category.totalQuantity || category.cantidadTotal || 0,
    "Valor Total": category.totalValue || category.valorTotal || 0,
    "Margen Porcentaje": category.marginPercentage || category.margenPorcentaje || 0,
    "Estado": category.status || category.estado || 'Activo',
    "Fecha Creacion": category.createdAt || category.fechaCreacion || '',
    "Ultima Modificacion": category.updatedAt || category.ultimaModificacion || ''
  }));

  exportToCSV(exportData, filename);
}

// También agrega la función para exportar categorías a Excel que falta
export function exportCategoriesToExcel(categories: any[], filename: string = "categorias-techstore.csv"): void {
  exportCategoriesReport(categories, filename);
}
