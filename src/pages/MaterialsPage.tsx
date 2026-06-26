import { useState } from "react";
import { useMaterials } from "../hooks/useMaterials";
import MaterialCard from "../components/domain/MaterialCard";
import AddMaterialModal from "../components/AddMaterialModal";
import Button from "../components/common/Button";

function MaterialsPage() {
  const { materials, addMaterial, removeMaterial, loading } = useMaterials();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleAddMaterial = async (
    nombre: string,
    tipo: "texto" | "pdf" | "docx" | "txt" | "md",
    contenidoOriginal?: string | ArrayBuffer,
  ): Promise<string> => {
    const id = await addMaterial(nombre, tipo, contenidoOriginal);
    setIsModalOpen(false);
    return id;
  };

  if (loading) {
    return (
      <div className="p-8 text-center text-gray-500">
        Cargando materiales...
      </div>
    );
  }

  return (
    <div className="max-w-4xl p-6 mx-auto">
      <header className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Mis Materiales</h1>
        <Button variant="primary" onClick={() => setIsModalOpen(true)}>
          Añadir material
        </Button>
      </header>

      <section className="grid gap-4">
        {materials.length > 0 ? (
          materials.map((material) => (
            <MaterialCard
              key={material.id}
              material={material}
              onDelete={removeMaterial}
            />
          ))
        ) : (
          <div className="p-12 text-center border-2 border-dashed border-gray-300 rounded-lg">
            <p className="text-gray-500">
              Todavía no hay materiales. Crea el primero para comenzar.
            </p>
          </div>
        )}
      </section>

      <AddMaterialModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAdd={handleAddMaterial}
      />
    </div>
  );
}

export default MaterialsPage;
