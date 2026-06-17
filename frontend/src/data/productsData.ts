//import {Product} from '../types';
// src/data/productsData.ts

import type { Product } from '../types/index'; // <-- Agrégale el .ts al final aquí para forzar a VS Code

// Productos vinculados a tus imágenes en public/products/
export const MOCK_PRODUCTS: Product[]= [
  { id: 1, 
    nombre: 'Paquete Galletas de Chocolate', 
    precio: 30.90, 
    imagen: '/products/R.jpg', 
    categoriaId: 2,
    stock: 10
  },

/*  { id: 'p2', name: 'Paquete Galletas de Chocolate y Avena', price: 39.90, image: '/products/galletas_avena.jpg', categoryId: 'cat-gal' },
  { id: 'p3', name: 'Paquete de Muffins de Vainilla', price: 39.90, image: '/products/muffins_vainilla.jpg', categoryId: 'cat-gal' },
  { id: 'p4', name: 'Paquete de 4 Galletas de Avena', price: 24.90, image: '/products/galletas_avena_simple.jpg', categoryId: 'cat-gal' },
  { id: 'p5', name: 'Café Espresso Americano', price: 15.00, image: '/products/cafe_americano.jpg', categoryId: 'cat-caf' }, 
   */
];