import mongoose, { Document, Model } from 'mongoose';

export interface IRegistroDoc extends Document {
  fecha: Date;
  trabajoRealizadoEn: 'campo' | 'taller';
  estadoActividad: string;
  llego_al_mastil?: string;
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
  status: 'pre_aprobado' | 'aprobado' | 'rechazado';
  submittedBy: mongoose.Types.ObjectId;
  approvedBy?: mongoose.Types.ObjectId;
  approvedAt?: Date;
  rechazadoMotivo?: string;
}

const RegistroSchema = new mongoose.Schema<IRegistroDoc>({
  fecha: { type: Date, required: true },
  trabajoRealizadoEn: { type: String, enum: ['campo', 'taller'], required: true },
  estadoActividad: { type: String, required: true },
  llego_al_mastil: String,
  clienteNombre: String,
  proyectoNombre: String,
  tipoProyecto: String,
  tareaTexto: String,
  ovOdoo: String,
  excluirDeMetricas: { type: Boolean, default: false },
  encargadoNombre: String,
  personalACargo: String,
  nPersonas: Number,
  vehiculoPatente: String,
  kmInicial: Number,
  kmFinal: Number,
  kmRecorridos: Number,
  standByHoras: Number,
  standByCategoria: String,
  standByDetalle: String,
  horaInicio: String,
  horaInicioField: String,
  horaFinField: String,
  horaFin: String,
  horasTotalesDec: Number,
  horasSitioDec: Number,
  horasTrasladoDec: Number,
  hospedaje: String,
  observaciones: String,
  status: { type: String, enum: ['pre_aprobado', 'aprobado', 'rechazado'], default: 'pre_aprobado' },
  submittedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  approvedAt: Date,
  rechazadoMotivo: String,
}, { timestamps: true });

RegistroSchema.index({ submittedBy: 1, fecha: -1 });
RegistroSchema.index({ status: 1, createdAt: -1 });
RegistroSchema.index({ fecha: -1 });

const Registro: Model<IRegistroDoc> = mongoose.models.Registro || mongoose.model<IRegistroDoc>('Registro', RegistroSchema);
export default Registro;
