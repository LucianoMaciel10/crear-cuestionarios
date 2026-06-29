import { useState } from "react";
import Button from "./common/Button";
import Modal from "./common/Modal";

type AddSubjectModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (nombre: string) => Promise<void>;
};

function AddSubjectModal({ isOpen, onClose, onAdd }: AddSubjectModalProps) {
  const [nombre, setNombre] = useState("");

  const handleGuardar = async () => {
    if (nombre.trim() === "") return;
    await onAdd(nombre);
    setNombre("");
    onClose();
  };

  const handleCancelar = () => {
    setNombre("");
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Nueva Materia" size="sm">
      <div className="space-y-4">
        <input
          autoFocus
          type="text"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          placeholder="Nombre de la materia"
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400"
        />
      </div>
      <div className="flex justify-end gap-3 mt-6">
        <Button variant="secondary" onClick={handleCancelar}>
          Cancelar
        </Button>
        <Button
          variant="primary"
          onClick={() => void handleGuardar()}
          disabled={nombre.trim() === ""}
        >
          Guardar
        </Button>
      </div>
    </Modal>
  );
}

export default AddSubjectModal;
