import { CreateDetallePedidoDto } from 'src/detalle-pedido/dto/create-detalle-pedido.dto';

export class CreatePedidoDto {
  nombreCompleto?: string;
  telefono?: string;
  correo?: string;
  total: number;
  usuarioId?: number;
  metodoPago?: string;
  detalles?: CreateDetallePedidoDto[];
}
