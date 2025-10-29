import { useState } from 'react';
import { Bolt Database } from '../../lib/Bolt Database';
import { Plus, Trash2, Building2, MapPin, Phone, Mail, X, Key, Eye, EyeOff, Copy } from 'lucide-react';

interface ElevatorData {
  location_name: string;
  address: string;
  elevator_type: 'hydraulic' | 'electromechanical' | 'traction';
  model: string;
  serial_number: string;
  capacity_kg: number;
  floors: number;
  installation_date: string;
}

interface ClientFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function ClientForm({ onSuccess, onCancel }: ClientFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [clientData, setClientData] = useState({
    company_name: '',
    building_name: '',
    contact_name: '',
    contact_email: '',
    contact_phone: '',
    rut: '',
    address: '',
    password: '',
    confirmPassword: '',
  });

  const [generatedClientCode, setGeneratedClientCode] = useState<string | null>(null);
  const [generatedQRCode, setGeneratedQRCode] = useState<string | null>(null);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [totalEquipments, setTotalEquipments] = useState<number>(1);
  const [identicalElevators, setIdenticalElevators] = useState(false);
  const [elevatorCount, setElevatorCount] = useState(1);
  const [templateElevator, setTemplateElevator] = useState<ElevatorData>({
    location_name: '',
    address: '',
    elevator_type: 'hydraulic',
    model: '',
    serial_number: '',
    capacity_kg: 450,
    floors: 0,
    installation_date: new Date().toISOString().split('T')[0],
  });

  const [elevators, setElevators] = useState<ElevatorData[]>([
    {
      location_name: '',
      address: '',
      elevator_type: 'hydraulic',
      model: '',
      serial_number: '',
      capacity_kg: 450,
      floors: 0,
      installation_date: new Date().toISOString().split('T')[0],
    },
  ]);

  const addElevator = () => {
    if (elevators.length >= totalEquipments) {
      alert(`No puedes agregar más de ${totalEquipments} ascensores. Este es el número de equipos especificado.`);
      return;
    }
    setElevators([
      ...elevators,
      {
        location_name: '',
        address: '',
        elevator_type: 'hydraulic',
        model: '',
        serial_number: '',
        capacity_kg: 450,
        floors: 0,
        installation_date: new Date().toISOString().split('T')[0],
      },
    ]);
  };

  const removeElevator = (index: number) => {
    if (elevators.length > 1) {
      setElevators(elevators.filter((_, i) => i !== index));
    }
  };

  const updateElevator = (index: number, field: keyof ElevatorData, value: any) => {
    const updated = [...elevators];
    updated[index] = { ...updated[index], [field]: value };
    setElevators(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!identicalElevators && elevators.length !== totalEquipments) {
      setError(`Debes agregar exactamente ${totalEquipments} ascensores. Actualmente tienes ${elevators.length}.`);
      setLoading(false);
      return;
    }

    if (identicalElevators && elevatorCount !== totalEquipments) {
      setError(`El número de ascensores idénticos (${elevatorCount}) debe coincidir con el N° de Equipos (${totalEquipments}).`);
      setLoading(false);
      return;
    }

    if (clientData.password !== clientData.confirmPassword) {
      setError('Las contraseñas no coinciden');
      setLoading(false);
      return;
    }

    if (clientData.password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres');
      setLoading(false);
      return;
    }

    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: clientData.contact_email,
        password: clientData.password,
        options: {
          data: {
            full_name: clientData.contact_name,
            role: 'client',
          },
        },
      });

      if (authError) throw authError;

      if (authData.user) {
        const { data: profile, error: profileError } = await Bolt Database
          .from('profiles')
          .insert({
            id: authData.user.id,
            role: 'client',
            full_name: clientData.contact_name,
            email: clientData.contact_email,
            phone: clientData.contact_phone || null,
            is_active: true,
          })
          .select()
          .single();

        if (profileError) throw profileError;

        const clientCode = `CLI-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

        const { data: client, error: clientError } = await Bolt Database
          .from('clients')
          .insert({
            profile_id: profile.id,
            company_name: clientData.company_name,
            building_name: clientData.building_name,
            contact_name: clientData.contact_name,
            contact_email: clientData.contact_email,
            contact_phone: clientData.contact_phone,
            rut: clientData.rut || null,
            address: clientData.address,
            is_active: true,
          })
          .select()
          .single();

        if (clientError) throw clientError;

        let elevatorsToInsert;

        if (identicalElevators) {
          elevatorsToInsert = Array(elevatorCount).fill(null).map((_, index) => ({
            client_id: client.id,
            location_name: templateElevator.location_name || `Ascensor ${index + 1}`,
            address: templateElevator.address,
            elevator_type: templateElevator.elevator_type,
            model: templateElevator.model,
            serial_number: templateElevator.serial_number ? `${templateElevator.serial_number}-${index + 1}` : '',
            capacity_kg: templateElevator.capacity_kg,
            floors: templateElevator.floors,
            installation_date: templateElevator.installation_date,
            status: 'active' as const,
          }));
        } else {
          elevatorsToInsert = elevators.map((elevator) => ({
            client_id: client.id,
            location_name: elevator.location_name,
            address: elevator.address,
            elevator_type: elevator.elevator_type,
            model: elevator.model,
            serial_number: elevator.serial_number,
            capacity_kg: elevator.capacity_kg,
            floors: elevator.floors,
            installation_date: elevator.installation_date,
            status: 'active' as const,
          }));
        }

        const { error: elevatorsError } = await Bolt Database
          .from('elevators')
          .insert(elevatorsToInsert);

        if (elevatorsError) throw elevatorsError;

        const QRCode = (await import('qrcode')).default;
        const qrDataURL = await QRCode.toDataURL(clientCode, {
          width: 300,
          margin: 1,
          color: {
            dark: '#000000',
            light: '#FFFFFF'
          }
        });

        setGeneratedClientCode(clientCode);
        setGeneratedQRCode(qrDataURL);
      }

      if (onSuccess) onSuccess();
    } catch (err: any) {
      setError(err.message || 'Error al crear el cliente');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 max-h-[90vh] overflow-y-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Building2 className="w-6 h-6 text-blue-600" />
          <h2 className="text-2xl font-bold text-slate-900">Nuevo Cliente</h2>
        </div>
        {onCancel && (
          <button
            onClick={onCancel}
            className="p-2 hover:bg-slate-100 rounded-lg transition"
          >
            <X className="w-5 h-5 text-slate-600" />
          </button>
        )}
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="border-b border-slate-200 pb-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Información del Cliente</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Razón Social *
              </label>
              <input
                type="text"
                required
                value={clientData.company_name}
                onChange={(e) => setClientData({ ...clientData, company_name: e.target.value })}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                <Building2 className="w-4 h-4 inline mr-1" />
                Nombre Edificio *
              </label>
              <input
                type="text"
                required
                value={clientData.building_name}
                onChange={(e) => setClientData({ ...clientData, building_name: e.target.value })}
                placeholder="Ej: Trinidad 1"
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="text-xs text-slate-500 mt-1">Este nombre aparecerá en todos los documentos PDF y búsquedas</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                RUT
              </label>
              <input
                type="text"
                value={clientData.rut}
                onChange={(e) => setClientData({ ...clientData, rut: e.target.value })}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Contacto *
              </label>
              <input
                type="text"
                required
                value={clientData.contact_name}
                onChange={(e) => setClientData({ ...clientData, contact_name: e.target.value })}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                <Mail className="w-4 h-4 inline mr-1" />
                Email *
              </label>
              <input
                type="email"
                required
                value={clientData.contact_email}
                onChange={(e) => setClientData({ ...clientData, contact_email: e.target.value })}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                <Phone className="w-4 h-4 inline mr-1" />
                Teléfono *
              </label>
              <input
                type="tel"
                required
                value={clientData.contact_phone}
                onChange={(e) => setClientData({ ...clientData, contact_phone: e.target.value })}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                <MapPin className="w-4 h-4 inline mr-1" />
                Dirección *
              </label>
              <input
                type="text"
                required
                value={clientData.address}
                onChange={(e) => setClientData({ ...clientData, address: e.target.value })}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        <div className="border-b border-slate-200 pb-6">
          <div className="flex items-center gap-3 mb-4">
            <Key className="w-5 h-5 text-slate-600" />
            <h3 className="text-lg font-semibold text-slate-900">Credenciales de Acceso</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Contraseña *
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={clientData.password}
                  onChange={(e) => setClientData({ ...clientData, password: e.target.value })}
                  className="w-full px-4 py-2 pr-10 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Mínimo 8 caracteres"
                  minLength={8}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Confirmar Contraseña *
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  required
                  value={clientData.confirmPassword}
                  onChange={(e) => setClientData({ ...clientData, confirmPassword: e.target.value })}
                  className="w-full px-4 py-2 pr-10 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Repetir contraseña"
                  minLength={8}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="md:col-span-2 bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-sm text-blue-800">
                El cliente podrá acceder al sistema con el email <strong>{clientData.contact_email || '(pendiente)'}</strong> y la contraseña que establezcas.
              </p>
            </div>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-slate-900">
              Ascensores
            </h3>
          </div>

          <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <label className="block text-sm font-medium text-slate-700 mb-2">
              N° de Equipos *
            </label>
            <input
              type="number"
              min="1"
              max="50"
              required
              value={totalEquipments}
              onChange={(e) => {
                const value = parseInt(e.target.value) || 1;
                setTotalEquipments(value);
                if (identicalElevators) {
                  setElevatorCount(value);
                }
              }}
              className="w-32 px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
            />
            <p className="text-xs text-blue-700 mt-2">
              Especifica cuántos ascensores tiene el edificio. Este será el límite de equipos que puedes registrar.
            </p>
          </div>

          <div className="mb-6 p-4 bg-slate-50 rounded-lg border border-slate-200">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={identicalElevators}
                onChange={(e) => setIdenticalElevators(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
              />
              <div>
                <span className="font-medium text-slate-900">¿Todos los ascensores son idénticos?</span>
                <p className="text-sm text-slate-600">Activa esta opción si todos comparten las mismas características</p>
              </div>
            </label>

            {identicalElevators && (
              <div className="mt-4">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  ¿Cuántos ascensores? *
                </label>
                <input
                  type="number"
                  min="1"
                  max={totalEquipments}
                  required={identicalElevators}
                  value={elevatorCount}
                  onChange={(e) => {
                    const value = parseInt(e.target.value) || 1;
                    if (value > totalEquipments) {
                      alert(`No puedes tener más ascensores (${value}) que el número de equipos especificado (${totalEquipments})`);
                      return;
                    }
                    setElevatorCount(value);
                  }}
                  className="w-32 px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="text-xs text-slate-600 mt-1">
                  Debe coincidir con el N° de Equipos ({totalEquipments})
                </p>
              </div>
            )}
          </div>

          {identicalElevators ? (
            <div className="border border-slate-200 rounded-lg p-4 bg-white">
              <h4 className="font-semibold text-slate-900 mb-4">
                <Copy className="w-4 h-4 inline mr-2" />
                Características Comunes (se crearán {elevatorCount} ascensor{elevatorCount > 1 ? 'es' : ''})
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Ubicación Base
                  </label>
                  <input
                    type="text"
                    value={templateElevator.location_name}
                    onChange={(e) => setTemplateElevator({ ...templateElevator, location_name: e.target.value })}
                    placeholder="Ej: Torre Principal"
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Dirección *
                  </label>
                  <input
                    type="text"
                    required={identicalElevators}
                    value={templateElevator.address}
                    onChange={(e) => setTemplateElevator({ ...templateElevator, address: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Tipo *
                  </label>
                  <select
                    value={templateElevator.elevator_type}
                    onChange={(e) => setTemplateElevator({ ...templateElevator, elevator_type: e.target.value as any })}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="hydraulic">Hidráulico</option>
                    <option value="electromechanical">Electromecánico</option>
                    <option value="traction">Tracción</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Modelo
                  </label>
                  <input
                    type="text"
                    value={templateElevator.model}
                    onChange={(e) => setTemplateElevator({ ...templateElevator, model: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    N° de Serie Base
                  </label>
                  <input
                    type="text"
                    value={templateElevator.serial_number}
                    onChange={(e) => setTemplateElevator({ ...templateElevator, serial_number: e.target.value })}
                    placeholder="Se agregará -1, -2, etc."
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Capacidad (kg) *
                  </label>
                  <input
                    type="number"
                    required={identicalElevators}
                    value={templateElevator.capacity_kg}
                    onChange={(e) => setTemplateElevator({ ...templateElevator, capacity_kg: parseInt(e.target.value) })}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Pisos *
                  </label>
                  <input
                    type="number"
                    required={identicalElevators}
                    value={templateElevator.floors}
                    onChange={(e) => setTemplateElevator({ ...templateElevator, floors: parseInt(e.target.value) })}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Fecha de Instalación *
                  </label>
                  <input
                    type="date"
                    required={identicalElevators}
                    value={templateElevator.installation_date}
                    onChange={(e) => setTemplateElevator({ ...templateElevator, installation_date: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>
          ) : (
            <>
              <button
                type="button"
                onClick={addElevator}
                className="mb-4 flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                <Plus className="w-4 h-4" />
                Agregar Ascensor
              </button>

              <div className="space-y-6">
                {elevators.map((elevator, index) => (
                  <div key={index} className="border border-slate-200 rounded-lg p-4 bg-slate-50">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-semibold text-slate-900">Ascensor #{index + 1}</h4>
                      {elevators.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeElevator(index)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Ubicación/Nombre *
                        </label>
                        <input
                          type="text"
                          required
                          value={elevator.location_name}
                          onChange={(e) => updateElevator(index, 'location_name', e.target.value)}
                          placeholder="Ej: Edificio A, Torre Norte"
                          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Dirección del Ascensor *
                        </label>
                        <input
                          type="text"
                          required
                          value={elevator.address}
                          onChange={(e) => updateElevator(index, 'address', e.target.value)}
                          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Tipo de Ascensor *
                        </label>
                        <select
                          value={elevator.elevator_type}
                          onChange={(e) => updateElevator(index, 'elevator_type', e.target.value)}
                          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                        >
                          <option value="hydraulic">Hidráulico</option>
                          <option value="electromechanical">Electromecánico</option>
                          <option value="traction">Tracción</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Modelo
                        </label>
                        <input
                          type="text"
                          value={elevator.model}
                          onChange={(e) => updateElevator(index, 'model', e.target.value)}
                          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Número de Serie
                        </label>
                        <input
                          type="text"
                          value={elevator.serial_number}
                          onChange={(e) => updateElevator(index, 'serial_number', e.target.value)}
                          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Capacidad (kg) *
                        </label>
                        <input
                          type="number"
                          required
                          value={elevator.capacity_kg}
                          onChange={(e) => updateElevator(index, 'capacity_kg', parseInt(e.target.value))}
                          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Pisos *
                        </label>
                        <input
                          type="number"
                          required
                          value={elevator.floors}
                          onChange={(e) => updateElevator(index, 'floors', parseInt(e.target.value))}
                          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Fecha de Instalación *
                        </label>
                        <input
                          type="date"
                          required
                          value={elevator.installation_date}
                          onChange={(e) => updateElevator(index, 'installation_date', e.target.value)}
                          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {generatedClientCode && generatedQRCode && (
          <div className="border border-green-200 bg-green-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-green-900 mb-4 flex items-center gap-2">
              <Building2 className="w-5 h-5" />
              Cliente Creado Exitosamente
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Código Único del Cliente
                </label>
                <div className="bg-white border border-slate-300 rounded-lg p-3 font-mono text-sm">
                  {generatedClientCode}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Código QR Generado
                </label>
                <div className="bg-white border border-slate-300 rounded-lg p-3 flex justify-center">
                  <img src={generatedQRCode} alt="QR Code" className="w-32 h-32" />
                </div>
              </div>
            </div>
            <p className="text-sm text-green-700 mt-4">
              El código QR ha sido generado automáticamente. Puedes acceder a todos los códigos QR desde la vista "Gestión de Códigos QR".
            </p>
          </div>
        )}

        <div className="flex gap-4 pt-4 border-t border-slate-200">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              disabled={loading}
              className="flex-1 px-6 py-3 border border-slate-300 text-slate-700 rounded-lg font-semibold hover:bg-slate-50 transition disabled:opacity-50"
            >
              Cancelar
            </button>
          )}
          <button
            type="submit"
            disabled={loading}
            className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50"
          >
            {loading ? 'Guardando...' : 'Crear Cliente'}
          </button>
        </div>
      </form>
    </div>
  );
}
