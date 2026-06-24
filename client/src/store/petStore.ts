import { create } from 'zustand';
import type { Pet } from '../types';

interface PetState {
  pets: Pet[];
  currentPet: Pet | null;

  setPets: (pets: Pet[]) => void;
  setCurrentPet: (pet: Pet | null) => void;
  addPet: (pet: Pet) => void;
  updatePet: (pet: Pet) => void;
  removePet: (petId: string) => void;
  clearPets: () => void;
}

/**
 * Pet store — manages the list of user's pets and the currently selected pet.
 */
export const usePetStore = create<PetState>((set) => ({
  pets: [],
  currentPet: null,

  setPets: (pets: Pet[]) => {
    set((state) => ({
      pets,
      currentPet: state.currentPet
        ? pets.find((p) => p.id === state.currentPet?.id) || pets[0] || null
        : pets[0] || null,
    }));
  },

  setCurrentPet: (pet: Pet | null) => {
    set({ currentPet: pet });
  },

  addPet: (pet: Pet) => {
    set((state) => ({
      pets: [...state.pets, pet],
      currentPet: state.currentPet || pet,
    }));
  },

  updatePet: (pet: Pet) => {
    set((state) => ({
      pets: state.pets.map((p) => (p.id === pet.id ? pet : p)),
      currentPet: state.currentPet?.id === pet.id ? pet : state.currentPet,
    }));
  },

  removePet: (petId: string) => {
    set((state) => {
      const pets = state.pets.filter((p) => p.id !== petId);
      const currentPet =
        state.currentPet?.id === petId ? pets[0] || null : state.currentPet;
      return { pets, currentPet };
    });
  },

  clearPets: () => {
    set({ pets: [], currentPet: null });
  },
}));
