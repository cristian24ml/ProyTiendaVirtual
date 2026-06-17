import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { PedidoService } from './pedido.service';
import { CreatePedidoDto } from './dto/create-pedido.dto';
import { UpdatePedidoDto } from './dto/update-pedido.dto';
import { AuthGuard } from 'src/auth/auth.guard';
import { PersonalGuard } from 'src/auth/personal.guard';

@Controller('pedido')
export class PedidoController {
  constructor(private readonly pedidoService: PedidoService) {}

  @Post()
  create(@Body() createPedidoDto: CreatePedidoDto) {
    return this.pedidoService.create(createPedidoDto);
  }

  @Get()
  @UseGuards(AuthGuard, PersonalGuard)
  findAll() {
    return this.pedidoService.findAll();
  }

  @Get('mas-vendidos')
  @UseGuards(AuthGuard, PersonalGuard)
  getMasVendidos() {
    return this.pedidoService.getMasVendidos();
  }

  @Get(':id')
  @UseGuards(AuthGuard, PersonalGuard)
  findOne(@Param('id') id: string) {
    return this.pedidoService.findOne(+id);
  }

  @Patch(':id')
  @UseGuards(AuthGuard, PersonalGuard)
  update(@Param('id') id: string, @Body() updatePedidoDto: UpdatePedidoDto) {
    return this.pedidoService.update(+id, updatePedidoDto);
  }

  @Delete(':id')
  @UseGuards(AuthGuard, PersonalGuard)
  remove(@Param('id') id: string) {
    return this.pedidoService.remove(+id);
  }
}
