//para crear las actividades
export class CreateProductoDto {
  nombre: string;
  precio: number;
  imagen: string;
  categoriaId: number; // Envíamos solo el ID numérico de la categoría
  stock?: number;
}
