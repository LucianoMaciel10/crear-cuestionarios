import type { IMateria } from "../../data/models/materia.model";
import Button from "../common/Button";
import Card from "../common/Card";

type SubjectCardProps = {
  subject: IMateria;
  onDelete: (id: string) => void | Promise<void>;
};

function SubjectCard({ subject, onDelete }: SubjectCardProps) {
  return (
    <Card className="p-4 flex items-center justify-between">
      <h3 className="text-lg font-medium text-gray-900 dark:text-gray-50">
        {subject.nombre}
      </h3>
      <Button
        variant="secondary"
        onClick={() => void onDelete(subject.id)}
        size="sm"
      >
        Eliminar
      </Button>
    </Card>
  );
}

export default SubjectCard;
