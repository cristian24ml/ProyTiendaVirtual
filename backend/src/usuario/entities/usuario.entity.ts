import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Rol } from 'src/rol/entities/rol.entity';

@Entity()
export class Usuario {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  nombreCompleto: string;

  @Column({ unique: true })
  username: string;

  @Column()
  password: string;

  @Column({ nullable: true })
  nivelPassword: string; // débil, intermedia, fuerte

  @Column({ nullable: true })
  rolId: number;

  @ManyToOne(() => Rol, (rol) => rol.usuarios, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'rolId' })
  rol: Rol;
}
