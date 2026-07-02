import { useState } from "react";
import { useSubjects } from "../hooks/useSubjects";
import SubjectCard from "../components/domain/SubjectCard";
import AddSubjectModal from "../components/AddSubjectModal";
import Button from "../components/common/Button";

function Dashboard() {
  const { subjects, addSubject, removeSubject, editSubject, loading } =
    useSubjects();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleAddSubject = async (nombre: string) => {
    await addSubject(nombre);
    setIsModalOpen(false);
  };

  const handleEditSubject = async (id: string, nombre: string) => {
    await editSubject(id, nombre);
  };

  if (loading) {
    return (
      <div className="p-8 text-center text-gray-500 dark:text-gray-400">
        Cargando...
      </div>
    );
  }

  return (
    <div className="max-w-4xl p-6 mx-auto">
      <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-50">
            Mis Materias
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Gestiona tus materias académicas
          </p>
        </div>
        <Button variant="primary" onClick={() => setIsModalOpen(true)}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 mr-2"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 6v6m0 0v6m0-6h6m-6 0H6"
            />
          </svg>
          Añadir materia
        </Button>
      </header>

      <section className="grid gap-4">
        {subjects.length > 0 ? (
          subjects.map((subject) => (
            <SubjectCard
              key={subject.id}
              subject={subject}
              onDelete={removeSubject}
              onEdit={handleEditSubject}
            />
          ))
        ) : (
          <div className="p-12 text-center border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-12 w-12 mx-auto mb-4 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
              />
            </svg>
            <p className="text-gray-500 dark:text-gray-400">
              Todavía no hay materias. Crea la primera para comenzar.
            </p>
          </div>
        )}
      </section>

      <AddSubjectModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAdd={handleAddSubject}
      />
    </div>
  );
}

export default Dashboard;
