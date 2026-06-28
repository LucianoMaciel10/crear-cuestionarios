// src/services/subject.service.test.ts
import { describe, it, expect, beforeEach, vi } from "vitest";
import * as subjectService from "./subject.service";
import { db } from "../data/db/dexie-db";
import type { IMateria } from "../data/models/materia.model";

// Mockear Dexie para no interactuar con IndexedDB real durante las pruebas
const mockMaterias: IMateria[] = [];

vi.mock("../data/db/dexie-db", () => ({
  db: {
    materias: {
      toArray: vi.fn(() => Promise.resolve(mockMaterias)),
      add: vi.fn((materia: IMateria) => {
        mockMaterias.push(materia);
        return Promise.resolve(materia.id);
      }),
      delete: vi.fn((id: string) => {
        const index = mockMaterias.findIndex((m) => m.id === id);
        if (index !== -1) {
          mockMaterias.splice(index, 1);
        }
        return Promise.resolve();
      }),
    },
  },
}));

describe("subject.service", () => {
  beforeEach(() => {
    // Limpiar el mock antes de cada prueba
    mockMaterias.length = 0; // Vaciar el array
    vi.clearAllMocks();
  });

  it("should return an empty array when no subjects exist", async () => {
    const subjects = await subjectService.getAll();
    expect(subjects).toEqual([]);
    expect(db.materias.toArray).toHaveBeenCalledTimes(1);
  });

  it("should add a new subject", async () => {
    const nombre = "Matemáticas";
    const id = await subjectService.add(nombre); // La descripción es opcional

    expect(id).toBeTypeOf("string");
    expect(id).not.toBeNull();
    expect(mockMaterias).toHaveLength(1);
    expect(mockMaterias[0]).toEqual({
      id,
      nombre,
      descripcion: "",
    });
    expect(db.materias.add).toHaveBeenCalledTimes(1);
  });

  it("should retrieve all subjects", async () => {
    await subjectService.add("Física");
    await subjectService.add("Química");

    const subjects = await subjectService.getAll();
    expect(subjects).toHaveLength(2);
    expect(subjects[0].nombre).toBe("Física");
    expect(subjects[1].nombre).toBe("Química");
  });

  it("should remove a subject", async () => {
    const id1 = await subjectService.add("Historia");
    await subjectService.add("Geografía");

    await subjectService.remove(id1);

    const subjects = await subjectService.getAll();
    expect(subjects).toHaveLength(1);
    expect(subjects[0].nombre).toBe("Geografía");
    expect(db.materias.delete).toHaveBeenCalledWith(id1);
  });

  it("should not throw error if trying to remove non-existent subject", async () => {
    await subjectService.add("Biología");
    await expect(
      subjectService.remove("non-existent-id"),
    ).resolves.toBeUndefined();
    const subjects = await subjectService.getAll();
    expect(subjects).toHaveLength(1); // Still one subject
  });
});
