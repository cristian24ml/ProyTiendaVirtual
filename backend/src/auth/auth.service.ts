import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { UsuarioService } from 'src/usuario/usuario.service';
import { LogAccesoService } from 'src/log-acceso/log-acceso.service';
import { CreateUsuarioDto } from 'src/usuario/dto/create-usuario.dto';
import {
  pbkdf2Sync,
  randomBytes,
  createHmac,
  createCipheriv,
  createDecipheriv,
} from 'crypto';

const CAPTCHA_SECRET = 'el-taller-de-los-detalles-captcha-secret-key-98765';
const TOKEN_ALGORITHM = 'aes-256-cbc';
const TOKEN_KEY = Buffer.from(
  '4a5f6e7d8c9b0a1f2e3d4c5b6a7f8e9d0c1b2a3f4e5d6c7b8a9f0e1d2c3b4a5f',
  'hex',
);
const TOKEN_IV = Buffer.from('a1b2c3d4e5f67890');

@Injectable()
export class AuthService {
  constructor(
    private readonly usuarioService: UsuarioService,
    private readonly logAccesoService: LogAccesoService,
  ) {}

  // 1. Evaluar fortaleza de contraseña
  evaluatePasswordStrength(
    password: string,
  ): 'débil' | 'intermedia' | 'fuerte' {
    if (password.length < 8) {
      return 'débil';
    }
    const hasLower = /[a-z]/.test(password);
    const hasUpper = /[A-Z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecial = /[^a-zA-Z0-9]/.test(password);

    if (hasLower && hasUpper && hasNumber && hasSpecial) {
      return 'fuerte';
    }
    if ((hasLower || hasUpper) && hasNumber) {
      return 'intermedia';
    }
    return 'débil';
  }

  // 2. Encriptar contraseña
  hashPassword(password: string): string {
    const salt = randomBytes(16).toString('hex');
    const hash = pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
    return `${salt}:${hash}`;
  }

  // 3. Comparar contraseña
  comparePassword(password: string, storedHash: string): boolean {
    try {
      const [salt, hash] = storedHash.split(':');
      const checkHash = pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString(
        'hex',
      );
      return hash === checkHash;
    } catch {
      return false;
    }
  }

  // 4. Generar Captcha
  generateCaptcha() {
    const num1 = Math.floor(Math.random() * 9) + 1;
    const num2 = Math.floor(Math.random() * 9) + 1;
    const answer = (num1 + num2).toString();
    const expires = Date.now() + 5 * 60 * 1000; // 5 minutos de validez
    const raw = `${answer}:${expires}`;
    const signature = createHmac('sha256', CAPTCHA_SECRET)
      .update(raw)
      .digest('hex');
    const token = `${raw}:${signature}`;

    return {
      pregunta: `¿Cuánto es ${num1} + ${num2}?`,
      captchaToken: token,
    };
  }

  // 5. Verificar Captcha
  verifyCaptcha(answer: string, token: string): boolean {
    try {
      const [correctAnswer, expiresStr, signature] = token.split(':');
      const expires = parseInt(expiresStr, 10);
      if (Date.now() > expires) return false;

      const checkSig = createHmac('sha256', CAPTCHA_SECRET)
        .update(`${correctAnswer}:${expiresStr}`)
        .digest('hex');
      if (signature !== checkSig) return false;

      return answer.trim() === correctAnswer;
    } catch {
      return false;
    }
  }

  // 6. Encriptar Token de Sesión (AES-256-CBC)
  generateSessionToken(payload: any): string {
    const cipher = createCipheriv(TOKEN_ALGORITHM, TOKEN_KEY, TOKEN_IV);
    const data = JSON.stringify({
      ...payload,
      exp: Date.now() + 2 * 60 * 60 * 1000,
    }); // 2 horas
    let encrypted = cipher.update(data, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return encrypted;
  }

  // 7. Decodificar/Validar Token
  validateSessionToken(token: string): any {
    try {
      const decipher = createDecipheriv(TOKEN_ALGORITHM, TOKEN_KEY, TOKEN_IV);
      let decrypted = decipher.update(token, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      const payload = JSON.parse(decrypted) as {
        exp: number;
        [key: string]: any;
      };
      if (payload.exp < Date.now()) return null;
      return payload;
    } catch {
      return null;
    }
  }

  async register(createUsuarioDto: CreateUsuarioDto) {
    if (
      !createUsuarioDto.captchaAnswer ||
      !createUsuarioDto.captchaToken ||
      !this.verifyCaptcha(
        createUsuarioDto.captchaAnswer,
        createUsuarioDto.captchaToken,
      )
    ) {
      throw new BadRequestException('Captcha inválido o expirado');
    }

    const existing = await this.usuarioService.findOneByUsername(
      createUsuarioDto.username,
    );
    if (existing) {
      throw new BadRequestException('El nombre de usuario ya está registrado');
    }

    const nivel = this.evaluatePasswordStrength(createUsuarioDto.password);
    const hashedPassword = this.hashPassword(createUsuarioDto.password);

    const userData = { ...createUsuarioDto };
    delete userData.captchaAnswer;
    delete userData.captchaToken;

    const usuario = await this.usuarioService.create({
      ...userData,
      password: hashedPassword,
    });

    // Guardar el nivel de contraseña obtenido
    usuario.nivelPassword = nivel;
    await this.usuarioService.update(usuario.id, { nivelPassword: nivel });

    return {
      id: usuario.id,
      nombreCompleto: usuario.nombreCompleto,
      username: usuario.username,
      nivelPassword: nivel,
    };
  }

  // 9. Inicio de Sesión
  async login(credentials: {
    username: string;
    password: string;
    captchaAnswer: string;
    captchaToken: string;
    ip: string;
    browser: string;
  }) {
    // Validar Captcha
    if (
      !this.verifyCaptcha(credentials.captchaAnswer, credentials.captchaToken)
    ) {
      throw new UnauthorizedException('Captcha inválido o expirado');
    }

    const usuario = await this.usuarioService.findOneByUsername(
      credentials.username,
    );
    if (
      !usuario ||
      !this.comparePassword(credentials.password, usuario.password)
    ) {
      // Registrar intento fallido si existe el usuario o no
      await this.logAccesoService.registrar({
        usuarioId: usuario ? usuario.id : undefined,
        username: credentials.username,
        ip: credentials.ip,
        evento: 'intento_fallido',
        browser: credentials.browser,
      });
      throw new UnauthorizedException('Credenciales incorrectas');
    }

    // Registrar ingreso exitoso
    await this.logAccesoService.registrar({
      usuarioId: usuario.id,
      username: usuario.username,
      ip: credentials.ip,
      evento: 'ingreso',
      browser: credentials.browser,
    });

    // Generar token
    const token = this.generateSessionToken({
      id: usuario.id,
      username: usuario.username,
      rol: usuario.rol ? usuario.rol.nombre : null,
    });

    return {
      access_token: token,
      usuario: {
        id: usuario.id,
        nombreCompleto: usuario.nombreCompleto,
        username: usuario.username,
        rol: usuario.rol ? usuario.rol.nombre : null,
      },
    };
  }

  // 10. Cierre de Sesión
  async logout(
    tokenInfo: { id?: number; username?: string } | null,
    ip: string,
    browser: string,
  ) {
    if (tokenInfo) {
      await this.logAccesoService.registrar({
        usuarioId: tokenInfo.id || 0,
        username: tokenInfo.username || 'unknown',
        ip,
        evento: 'salida',
        browser,
      });
      return { message: 'Sesión cerrada exitosamente' };
    }
    return { message: 'Token inválido' };
  }
}
