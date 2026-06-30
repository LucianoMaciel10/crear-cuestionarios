import type { IMateria } from "../../data/models/materia.model";
import Button from "../common/Button";
import Card from "../common/Card";
import { useNavigate } from "react-router-dom";

type SubjectCardProps = {
  subject: IMateria;
  onDelete: (id: string) => void | Promise<void>;
};

function SubjectCard({ subject, onDelete }: SubjectCardProps) {
  const navigate = useNavigate();

  return (
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
          onClick={() => void onDelete(subject.id)}
          size="sm"
        >
          Eliminar
        </Button>
      </div>
    </Card>
  );
}

export default SubjectCard;
