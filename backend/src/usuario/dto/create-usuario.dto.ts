export class CreateUsuarioDto {
  nombreCompleto: string;
  username: string;
  password: string;
  rolId: number;
  captchaAnswer?: string;
  captchaToken?: string;
}
