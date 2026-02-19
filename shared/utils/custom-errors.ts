export type ErrorDetails = Record<string, unknown>;

abstract class HttpException<
  TDetails extends ErrorDetails = ErrorDetails,
> extends Error {
  constructor(
    public readonly statusCode: number,
    message: string,
    public readonly details?: TDetails,
    public readonly code?: string,
  ) {
    super(message);
    this.name = this.constructor.name;
  }
}

export class BadRequestException<
  TDetails extends ErrorDetails = ErrorDetails,
> extends HttpException<TDetails> {
  constructor(
    message = "Solicitud inválida",
    details?: TDetails,
    code?: string,
  ) {
    super(400, message, details, code);
  }
}

export class UnauthorizedException<
  TDetails extends ErrorDetails = ErrorDetails,
> extends HttpException<TDetails> {
  constructor(message = "No autorizado", details?: TDetails, code?: string) {
    super(401, message, details, code);
  }
}

export class ForbiddenException<
  TDetails extends ErrorDetails = ErrorDetails,
> extends HttpException<TDetails> {
  constructor(message = "Acceso denegado", details?: TDetails, code?: string) {
    super(403, message, details, code);
  }
}

export class NotFoundException<
  TDetails extends ErrorDetails = ErrorDetails,
> extends HttpException<TDetails> {
  constructor(
    message = "Recurso no encontrado",
    details?: TDetails,
    code?: string,
  ) {
    super(404, message, details, code);
  }
}

export class ConflictException<
  TDetails extends ErrorDetails = ErrorDetails,
> extends HttpException<TDetails> {
  constructor(message = "Conflicto", details?: TDetails, code?: string) {
    super(409, message, details, code);
  }
}

export class TooManyRequestsException<
  TDetails extends ErrorDetails = ErrorDetails,
> extends HttpException<TDetails> {
  constructor(
    message = "Demasiadas solicitudes",
    details?: TDetails,
    code?: string,
  ) {
    super(429, message, details, code);
  }
}

export class InternalServerErrorException<
  TDetails extends ErrorDetails = ErrorDetails,
> extends HttpException<TDetails> {
  constructor(
    message = "Error interno del servidor",
    details?: TDetails,
    code?: string,
  ) {
    super(500, message, details, code);
  }
}

export class BadGatewayException<
  TDetails extends ErrorDetails = ErrorDetails,
> extends HttpException<TDetails> {
  constructor(message = "Bad Gateway", details?: TDetails, code?: string) {
    super(502, message, details, code);
  }
}

export class ServiceUnavailableException<
  TDetails extends ErrorDetails = ErrorDetails,
> extends HttpException<TDetails> {
  constructor(
    message = "Servicio no disponible",
    details?: TDetails,
    code?: string,
  ) {
    super(503, message, details, code);
  }
}

export class NetworkException extends Error {
  constructor(
    message = "No se pudo conectar con el servidor. Verifica tu conexión.",
  ) {
    super(message);
    this.name = "NetworkException";
  }
}

export class RequestCancelledException extends Error {
  constructor(message = "Solicitud cancelada por el usuario.") {
    super(message);
    this.name = "RequestCancelledException";
  }
}
