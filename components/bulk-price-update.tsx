"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import type { Product } from "../types/inventory"
import { TrendingUp, Calculator } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface BulkPriceUpdateProps {
  products: Product[]
  onUpdatePrices: (category: string, percentage: number) => void
}

export function BulkPriceUpdate({ products, onUpdatePrices }: BulkPriceUpdateProps) {
  const { toast } = useToast()
  const [selectedCategory, setSelectedCategory] = useState("")
  const [percentage, setPercentage] = useState(0)

  const categories = Array.from(new Set(products.map((p) => p.category)))

  const affectedProducts = selectedCategory ? products.filter((p) => p.category === selectedCategory) : []

  const handleUpdate = () => {
    if (selectedCategory && percentage !== 0) {
      onUpdatePrices(selectedCategory, percentage)

      // Notificación de éxito
      const actionText = percentage > 0 ? "aumentaron" : "redujeron"
      const emoji = percentage > 0 ? "📈" : "📉"

      toast({
        title: `${emoji} Precios actualizados`,
        description: `Los precios de ${selectedCategory} se ${actionText} ${Math.abs(percentage)}%.`,
        duration: 3000,
      })

      setSelectedCategory("")
      setPercentage(0)
    }
  }

  const previewPrices = affectedProducts.map((product) => ({
    ...product,
    newPrice: Math.round(product.price * (1 + percentage / 100)),
  }))

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="h-5 w-5" />
          Actualización Masiva de Precios
        </CardTitle>
        <CardDescription>Actualiza los precios de todos los productos de una categoría</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="category">Categoría</Label>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona una categoría" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="percentage">Porcentaje de Cambio (%)</Label>
            <Input
              id="percentage"
              type="number"
              value={percentage}
              onChange={(e) => setPercentage(Number(e.target.value))}
              placeholder="10 para aumentar 10%, -5 para reducir 5%"
            />
          </div>
        </div>

        {selectedCategory && affectedProducts.length > 0 && (
          <div className="mt-6">
            <h4 className="font-medium mb-3">Vista Previa - {affectedProducts.length} productos afectados:</h4>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {previewPrices.map((product) => (
                <div key={product.id} className="flex justify-between items-center p-2 bg-muted rounded">
                  <span className="text-sm">{product.name}</span>
                  <div className="text-sm">
                    <span className="text-muted-foreground">${product.price.toLocaleString()}</span>
                    <TrendingUp className="h-3 w-3 inline mx-1" />
                    <span className={percentage > 0 ? "text-green-600" : "text-red-600"}>
                      ${product.newPrice.toLocaleString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              className="w-full bg-blue-600 hover:bg-blue-700"
              disabled={!selectedCategory || percentage === 0 || affectedProducts.length === 0}
            >
              Actualizar Precios
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>¿Confirmar actualización de precios?</AlertDialogTitle>
              <AlertDialogDescription>
                Se actualizarán los precios de {affectedProducts.length} productos en la categoría "{selectedCategory}"
                con un cambio del {percentage > 0 ? "+" : ""}
                {percentage}%. Esta acción no se puede deshacer.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={handleUpdate} className="bg-blue-600 hover:bg-blue-700">
                Confirmar Actualización
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardContent>
    </Card>
  )
}
