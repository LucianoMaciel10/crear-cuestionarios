// src/pages/MaterialDetail.tsx
import { useParams } from "react-router-dom";

function MaterialDetail() {
  const { subjectId, materialId } = useParams<{
    subjectId: string;
    materialId: string;
  }>();

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-50 mb-4">
        Detalle del Material
      </h1>
      <p className="text-gray-700 dark:text-gray-300">
        Material ID: {materialId}
      </p>
      <p className="text-gray-700 dark:text-gray-300">
        Materia ID: {subjectId}
      </p>
    </div>
  );
}

export default MaterialDetail;
