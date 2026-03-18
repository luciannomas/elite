import mongoose, { Model } from 'mongoose';

const VehiculoSchema = new mongoose.Schema({
  patente: { type: String, required: true, unique: true },
  modelo: String,
  activo: { type: Boolean, default: true },
}, { timestamps: true });

const Vehiculo: Model<any> = mongoose.models.Vehiculo || mongoose.model('Vehiculo', VehiculoSchema);
export default Vehiculo;
