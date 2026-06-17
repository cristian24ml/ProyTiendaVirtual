// src/types/index.ts
// src/types/index.ts

export interface Category {
  id: number;
  nombre: string;
}

export interface Product {
  id: number;
  nombre: string;
  precio: number;
  imagen: string;
  categoriaId: number;
  stock: number;
}

export interface CartItem extends Product {
  quantity: number;
}

/*
export interface Category {
  id: number;
  name: string;
  //icon: string;
}

export interface Product {
  id: number;
  name: string;
  price: number;
  image: string;
  categoryId: string;
}

export interface CartItem extends Product {
  quantity: number;
}
*/