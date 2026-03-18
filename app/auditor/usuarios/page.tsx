'use client';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Loader2, Pencil, Trash2, Plus, X, Check } from 'lucide-react';
import type { IUser, Role } from '@/types';

const roleLabels: Record<Role, string> = {
  jefe_cuadrilla: 'Jefe de Cuadrilla',
  auditor: 'Auditor',
  super_admin: 'Super Admin',
};

const roleColors: Record<Role, string> = {
  jefe_cuadrilla: '#1d6fb8',
  auditor: '#9e6a03',
  super_admin: '#238636',
};

const inputStyle = {
  backgroundColor: '#21262d', border: '1px solid #30363d', borderRadius: 8,
  color: 'white', padding: '8px 12px', width: '100%', fontSize: 14, outline: 'none',
};

export default function UsuariosPage() {
  const [users, setUsers] = useState<IUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editUser, setEditUser] = useState<IUser | null>(null);
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'jefe_cuadrilla' as Role, active: true });
  const [saving, setSaving] = useState(false);

  useEffect(() => { loadUsers(); }, []);

  async function loadUsers() {
    setLoading(true);
    const res = await fetch('/api/usuarios').then(r => r.json());
    if (res.success) setUsers(res.data);
    setLoading(false);
  }

  function openCreate() {
    setEditUser(null);
    setForm({ name: '', email: '', password: '', role: 'jefe_cuadrilla', active: true });
    setShowForm(true);
  }

  function openEdit(user: IUser) {
    setEditUser(user);
    setForm({ name: user.name, email: user.email, password: '', role: user.role, active: user.active });
    setShowForm(true);
  }

  async function handleSave() {
    if (!form.name || !form.email) { toast.error('Nombre y email son requeridos'); return; }
    if (!editUser && !form.password) { toast.error('La contraseña es requerida para nuevos usuarios'); return; }
    setSaving(true);
    const payload: any = { name: form.name, email: form.email, role: form.role, active: form.active };
    if (form.password) payload.password = form.password;
    const url = editUser ? `/api/usuarios/${editUser._id}` : '/api/usuarios';
    const method = editUser ? 'PUT' : 'POST';
    const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) }).then(r => r.json());
    if (res.success) {
      toast.success(editUser ? 'Usuario actualizado' : 'Usuario creado');
      setShowForm(false);
      loadUsers();
    } else {
      toast.error(res.error || 'Error al guardar');
    }
    setSaving(false);
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`¿Eliminar a ${name}?`)) return;
    const res = await fetch(`/api/usuarios/${id}`, { method: 'DELETE' }).then(r => r.json());
    if (res.success) { toast.success('Usuario eliminado'); loadUsers(); }
    else toast.error(res.error);
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Usuarios</h1>
          <p className="text-sm mt-1" style={{ color: '#8b949e' }}>{users.length} usuarios registrados</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold text-white"
          style={{ backgroundColor: '#1d6fb8' }}
        >
          <Plus className="w-4 h-4" />
          Nuevo Usuario
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 animate-spin" style={{ color: '#1d6fb8' }} /></div>
      ) : (
        <>
          {/* ── MOBILE: cards ── */}
          <div className="flex flex-col gap-3 sm:hidden">
            {users.map(u => (
              <div key={u._id} className="rounded-xl px-4 py-3" style={{ backgroundColor: '#161b22', border: '1px solid #21262d' }}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex items-center justify-center w-9 h-9 rounded-full text-white text-sm font-bold shrink-0" style={{ backgroundColor: '#1d6fb8' }}>
                      {u.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-white truncate">{u.name}</p>
                      <p className="text-xs truncate" style={{ color: '#8b949e' }}>{u.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0 ml-2">
                    <button onClick={() => openEdit(u)} className="p-2 rounded hover:bg-[#21262d] transition-colors">
                      <Pencil className="w-4 h-4" style={{ color: '#8b949e' }} />
                    </button>
                    <button onClick={() => handleDelete(u._id, u.name)} className="p-2 rounded hover:bg-[#21262d] transition-colors">
                      <Trash2 className="w-4 h-4" style={{ color: '#da3633' }} />
                    </button>
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-2.5">
                  <span className="px-2 py-0.5 rounded-full text-xs font-medium" style={{ backgroundColor: `${roleColors[u.role]}20`, color: roleColors[u.role] }}>
                    {roleLabels[u.role]}
                  </span>
                  <span className="text-xs" style={{ color: u.active ? '#3fb950' : '#f85149' }}>
                    {u.active ? '● Activo' : '● Inactivo'}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* ── DESKTOP: tabla ── */}
          <div className="hidden sm:block rounded-xl overflow-hidden" style={{ backgroundColor: '#161b22', border: '1px solid #21262d' }}>
            <table className="w-full">
              <thead>
                <tr style={{ borderBottom: '1px solid #21262d' }}>
                  {['Nombre', 'Email', 'Rol', 'Estado', 'Acciones'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: '#8b949e' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y" style={{ borderColor: '#21262d' }}>
                {users.map(u => (
                  <tr key={u._id} className="hover:bg-[#1c2128] transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full text-white text-sm font-bold shrink-0" style={{ backgroundColor: '#1d6fb8' }}>
                          {u.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="text-sm font-medium text-white">{u.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm" style={{ color: '#8b949e' }}>{u.email}</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-1 rounded-full text-xs font-medium" style={{ backgroundColor: `${roleColors[u.role]}20`, color: roleColors[u.role] }}>
                        {roleLabels[u.role]}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs" style={{ color: u.active ? '#3fb950' : '#f85149' }}>
                        {u.active ? '● Activo' : '● Inactivo'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button onClick={() => openEdit(u)} className="p-1.5 rounded hover:bg-[#21262d] transition-colors">
                          <Pencil className="w-4 h-4" style={{ color: '#8b949e' }} />
                        </button>
                        <button onClick={() => handleDelete(u._id, u.name)} className="p-1.5 rounded hover:bg-[#21262d] transition-colors">
                          <Trash2 className="w-4 h-4" style={{ color: '#da3633' }} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.7)' }}>
          <div className="w-full max-w-md rounded-2xl p-6" style={{ backgroundColor: '#161b22', border: '1px solid #21262d' }}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-semibold text-white">{editUser ? 'Editar Usuario' : 'Nuevo Usuario'}</h2>
              <button onClick={() => setShowForm(false)} className="p-1 rounded hover:bg-[#21262d]">
                <X className="w-5 h-5" style={{ color: '#8b949e' }} />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: '#8b949e' }}>Nombre completo</label>
                <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} style={inputStyle} />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: '#8b949e' }}>Email</label>
                <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} style={inputStyle} />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: '#8b949e' }}>Contraseña {editUser && '(dejar vacío para no cambiar)'}</label>
                <input type="password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} style={inputStyle} placeholder={editUser ? '••••••••' : 'Contraseña'} />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: '#8b949e' }}>Rol</label>
                <select value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value as Role }))} style={{ ...inputStyle, appearance: 'none' }}>
                  <option value="jefe_cuadrilla">Jefe de Cuadrilla</option>
                  <option value="auditor">Auditor</option>
                  <option value="super_admin">Super Admin</option>
                </select>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setForm(f => ({ ...f, active: !f.active }))}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm"
                  style={{ backgroundColor: form.active ? 'rgba(35,134,54,0.15)' : '#21262d', color: form.active ? '#3fb950' : '#8b949e' }}
                >
                  {form.active ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                  {form.active ? 'Activo' : 'Inactivo'}
                </button>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowForm(false)} className="flex-1 py-2.5 rounded-lg text-sm font-medium" style={{ backgroundColor: '#21262d', color: '#e6edf3' }}>
                Cancelar
              </button>
              <button onClick={handleSave} disabled={saving} className="flex-1 py-2.5 rounded-lg text-sm font-semibold text-white flex items-center justify-center gap-2 disabled:opacity-60" style={{ backgroundColor: '#1d6fb8' }}>
                {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                {editUser ? 'Guardar cambios' : 'Crear usuario'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
