import type { IMateria } from "../../data/models/materia.model";
import Button from "../common/Button";
import Card from "../common/Card";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import Modal from "../common/Modal";

type SubjectCardProps = {
  subject: IMateria;
  onDelete: (id: string) => void | Promise<void>;
  onEdit: (id: string, newName: string) => void | Promise<void>;
};

function SubjectCard({ subject, onDelete, onEdit }: SubjectCardProps) {
  const navigate = useNavigate();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [newName, setNewName] = useState(subject.nombre);

  const handleEdit = async () => {
    if (newName.trim() === "") return;
    await onEdit(subject.id, newName);
    setIsEditModalOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && newName.trim() !== "") {
      void handleEdit();
    } else if (e.key === "Escape") {
      setIsEditModalOpen(false);
    }
  };

  return (
    <>
      <Card className="p-4 flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-50">
          {subject.nombre}
        </h3>
        <div className="flex gap-2">
          <Button
            variant="secondary"
            onClick={() => navigate(`/materiales/${subject.id}`)}
            size="sm"
          >
            Materiales
          </Button>
          <Button
            variant="secondary"
            onClick={() => navigate(`/cuestionario-gestion/${subject.id}`)}
            size="sm"
          >
            Cuestionarios
          </Button>
          <Button
            variant="secondary"
            onClick={() => navigate(`/flashcards/${subject.id}`)}
            size="sm"
          >
            Flashcards
          </Button>
          <Button
            variant="secondary"
            onClick={() => navigate(`/estadisticas/${subject.id}`)}
            size="sm"
          >
            Estadísticas
          </Button>
          <Button
            variant="secondary"
            onClick={() => setIsEditModalOpen(true)}
            size="sm"
          >
            Editar
          </Button>
          <Button
            variant="secondary"
            onClick={() => setIsDeleteModalOpen(true)}
            size="sm"
          >
            Eliminar
          </Button>
        </div>
      </Card>

      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Editar Materia"
        size="sm"
      >
        <div className="space-y-4 p-4">
          <input
            autoFocus
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400"
          />
        </div>
        <div className="flex justify-end gap-3 p-4 border-t border-gray-200 dark:border-gray-700">
          <Button
            variant="secondary"
            onClick={() => setIsEditModalOpen(false)}
            size="sm"
          >
            Cancelar
          </Button>
          <Button
            variant="primary"
            onClick={handleEdit}
            size="sm"
            disabled={newName.trim() === ""}
          >
            Guardar
          </Button>
        </div>
      </Modal>

      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Confirmar Eliminación"
        size="sm"
      >
        <div className="space-y-4 p-4">
          <p className="text-gray-700 dark:text-gray-300">
            ¿Estás seguro de que deseas eliminar la materia "{subject.nombre}"?
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Esta acción no se puede deshacer y eliminará todos los materiales,
            preguntas y datos asociados.
          </p>
        </div>
        <div className="flex justify-end gap-3 p-4 border-t border-gray-200 dark:border-gray-700">
          <Button
            variant="secondary"
            onClick={() => setIsDeleteModalOpen(false)}
            size="sm"
          >
            Cancelar
          </Button>
          <Button
            variant="danger"
            onClick={() => {
              void onDelete(subject.id);
              setIsDeleteModalOpen(false);
            }}
            size="sm"
          >
            Eliminar
          </Button>
        </div>
      </Modal>
    </>
  );
}

export default SubjectCard;
