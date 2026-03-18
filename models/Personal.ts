import mongoose, { Model } from 'mongoose';

const PersonalSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  activo: { type: Boolean, default: true },
}, { timestamps: true });

const Personal: Model<any> = mongoose.models.Personal || mongoose.model('Personal', PersonalSchema);
export default Personal;
