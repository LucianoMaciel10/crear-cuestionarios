import { useState } from 'react';
import { useSubjects } from '../hooks/useSubjects';
import SubjectCard from '../components/domain/SubjectCard';
import AddSubjectModal from '../components/AddSubjectModal';
import Button from '../components/common/Button';

function Dashboard() {
  const { subjects, addSubject, removeSubject, loading } = useSubjects();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleAddSubject = async (nombre: string) => {
    await addSubject(nombre);
    setIsModalOpen(false);
  };

  if (loading) {
    return <div className="p-8 text-center text-gray-500">Cargando...</div>;
  }

  return (
    <div className="max-w-4xl p-6 mx-auto">
      <header className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Mis Materias</h1>
        <Button variant="primary" onClick={() => setIsModalOpen(true)}>
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
            />
          ))
        ) : (
          <div className="p-12 text-center border-2 border-dashed border-gray-300 rounded-lg">
            <p className="text-gray-500">Todavía no hay materias. Crea la primera para comenzar.</p>
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
