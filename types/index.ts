export type Role = 'jefe_cuadrilla' | 'auditor' | 'super_admin';
export type RegistroStatus = 'pre_aprobado' | 'aprobado' | 'rechazado';

export interface IRegistro {
  _id: string;
  fecha: string;
  trabajoRealizadoEn: 'campo' | 'taller';
  estadoActividad: string;
  llego_al_mastil?: 'si' | 'no';
  clienteNombre?: string;
  proyectoNombre?: string;
  tipoProyecto?: string;
  tareaTexto?: string;
  ovOdoo?: string;
  excluirDeMetricas: boolean;
  encargadoNombre?: string;
  personalACargo?: string;
  nPersonas?: number;
  vehiculoPatente?: string;
  kmInicial?: number;
  kmFinal?: number;
  kmRecorridos?: number;
  standByHoras?: number;
  standByCategoria?: string;
  standByDetalle?: string;
  horaInicio?: string;
  horaInicioField?: string;
  horaFinField?: string;
  horaFin?: string;
  horasTotalesDec?: number;
  horasSitioDec?: number;
  horasTrasladoDec?: number;
  hospedaje?: string;
  observaciones?: string;
  status: RegistroStatus;
  submittedBy: string | { _id: string; name: string; email: string };
  approvedBy?: string | { _id: string; name: string };
  approvedAt?: string;
  rechazadoMotivo?: string;
  createdAt: string;
  updatedAt: string;
}

export interface IUser {
  _id: string;
  name: string;
  email: string;
  role: Role;
  active: boolean;
  lastLogin?: string;
  createdAt: string;
}
