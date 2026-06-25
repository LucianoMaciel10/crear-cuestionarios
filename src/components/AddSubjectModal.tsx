import { useState } from 'react';
import Button from './common/Button';

type AddSubjectModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (nombre: string) => Promise<void>;
};

function AddSubjectModal({ isOpen, onClose, onAdd }: AddSubjectModalProps) {
  const [nombre, setNombre] = useState('');

  if (!isOpen) return null;

  const handleGuardar = async () => {
    if (nombre.trim() === '') return;
    await onAdd(nombre);
    setNombre('');
    onClose();
  };

  const handleCancelar = () => {
    setNombre('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="w-full max-w-sm p-6 bg-white rounded-lg shadow-xl">
        <h2 className="mb-4 text-xl font-bold text-gray-900">Nueva Materia</h2>
        <input
          autoFocus
          type="text"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          placeholder="Nombre de la materia"
          className="w-full px-3 py-2 mb-6 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={handleCancelar}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={() => void handleGuardar()} disabled={nombre.trim() === ''}>
            Guardar
          </Button>
        </div>
      </div>
    </div>
  );
}

export default AddSubjectModal;
