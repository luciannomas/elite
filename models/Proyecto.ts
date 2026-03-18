import mongoose, { Model } from 'mongoose';

const ProyectoSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  clienteNombre: String,
  ubicacion: String,
  activo: { type: Boolean, default: true },
}, { timestamps: true });

const Proyecto: Model<any> = mongoose.models.Proyecto || mongoose.model('Proyecto', ProyectoSchema);
export default Proyecto;
