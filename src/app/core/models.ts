export interface Cliente {
  id: number;
  documento: string;
  nombres: string;
  telefono: string;
}
export interface Servicio {
  id: number;
  codigo: string;
  nombre: string;
  precio: number;
  duracionMin: number;
  activo: boolean;
}
export interface Vehiculo {
  id: number;
  placa: string;
  marca: string;
  modelo: string;
  anio: number;
  clienteId: number;
  clienteNombre: string;
}
export interface Detalle {
  id: number;
  servicioId: number;
  servicioCodigo: string;
  servicioNombre: string;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
}
export interface Orden {
  id: number;
  numero: string;
  fecha: string;
  vehiculoId: number;
  placa: string;
  clienteNombre: string;
  kilometraje: number;
  estado: string;
  total: number;
  usuarioRegistro: string;
  motivoAnulacion: string;
  detalles: Detalle[];
}
export interface Ingreso {
  codigo: string;
  servicio: string;
  cantidadTotal: number;
  importeTotal: number;
}
export interface ApiError {
  status: number;
  mensaje: string;
  campos?: Record<string, string>;
}
