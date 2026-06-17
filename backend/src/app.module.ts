import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductosModule } from './productos/productos.module';
import { CategoriaModule } from './categoria/categoria.module';
import { DetallePedidoModule } from './detalle-pedido/detalle-pedido.module';
import { PedidoModule } from './pedido/pedido.module';
import { RolModule } from './rol/rol.module';
import { UsuarioModule } from './usuario/usuario.module';
import { LogAccesoModule } from './log-acceso/log-acceso.module';
import { AuthModule } from './auth/auth.module';

import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import {resolve} from 'path';
@Module({
  //conectamos la BD (mysql)
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'localhost',
      port: 3306,
      username: 'root',
      password: '',
      database: 'bdproyecto',
      autoLoadEntities: true,
      synchronize: true,
    }),

    // 2. Registramos el módulo estático aquí dentro
    ServeStaticModule.forRoot({
      // resolve() crea una ruta absoluta directa y limpia en Windows
      rootPath: resolve('uploads'), 
      serveRoot: '/uploads',
      exclude: ['/api*'],
      serveStaticOptions: {
        index: false,
      },
      /*
      rootPath: join(process.cwd(), 'uploads'), 
      serveRoot: '/uploads',
      exclude: ['/api*'],
      serveStaticOptions: {
        index: false, // 👈 ESTO ES LO CLAVE: Evita que busque 'index.html' si no encuentra el archivo
      },
      */
    }),

    ProductosModule,
    CategoriaModule,
    DetallePedidoModule,
    PedidoModule,
    RolModule,
    UsuarioModule,
    LogAccesoModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
