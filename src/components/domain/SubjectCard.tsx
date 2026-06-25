import type { IMateria } from '../../data/models/materia.model';
import Button from '../common/Button';

type SubjectCardProps = {
  subject: IMateria;
  onDelete: (id: string) => void | Promise<void>;
};

function SubjectCard({ subject, onDelete }: SubjectCardProps) {
  return (
    <div className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg shadow-sm">
      <h3 className="text-lg font-medium text-gray-900">{subject.nombre}</h3>
      <Button 
        variant="secondary"
        onClick={() => void onDelete(subject.id)}
        className="text-sm py-2 px-4"
      >
        Eliminar
      </Button>
    </div>
  );
}

export default SubjectCard;
