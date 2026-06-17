import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Categoria } from 'src/categoria/entities/categoria.entity';

@Entity()
export class Producto {
  @PrimaryGeneratedColumn() // va ser auto_incrementable el ID
  id: number;

  @Column()
  nombre: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 }) // scale: los decimales
  precio: number;

  @Column()
  imagen: string;

  @Column({ default: 0 })
  stock: number;

  @Column({ nullable: true })
  categoriaId: number;

  @ManyToOne(() => Categoria, (categoria) => categoria.productos)
  @JoinColumn({ name: 'categoriaId' })
  categoria: Categoria;
}
