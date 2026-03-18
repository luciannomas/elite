import mongoose, { Model } from 'mongoose';

const ClienteSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  codigo: String,
  activo: { type: Boolean, default: true },
}, { timestamps: true });

const Cliente: Model<any> = mongoose.models.Cliente || mongoose.model('Cliente', ClienteSchema);
export default Cliente;
