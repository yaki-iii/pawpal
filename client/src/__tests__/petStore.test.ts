import { describe, it, expect, beforeEach } from 'vitest';
import { usePetStore } from '../store/petStore';
import type { Pet } from '../types';
import { PetSpecies, PetGender } from '../types';

const resetStore = () => {
  usePetStore.setState({
    pets: [],
    currentPet: null,
  });
};

const createMockPet = (id: string, name: string = '煤球'): Pet => ({
  id,
  userId: 'user-1',
  name,
  species: PetSpecies.DOG,
  breed: '柯基',
  gender: PetGender.MALE,
  birthday: '2023-06-15T00:00:00.000Z',
  weight: 12.5,
  photo: '',
  neutered: true,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
});

describe('PetStore', () => {
  beforeEach(() => {
    resetStore();
  });

  describe('setPets', () => {
    it('should set the pets list', () => {
      const pets = [createMockPet('pet-1'), createMockPet('pet-2', '年糕')];
      usePetStore.getState().setPets(pets);

      expect(usePetStore.getState().pets).toHaveLength(2);
    });

    it('should auto-select first pet if no current pet is set', () => {
      const pets = [createMockPet('pet-1'), createMockPet('pet-2', '年糕')];
      usePetStore.getState().setPets(pets);

      expect(usePetStore.getState().currentPet?.id).toBe('pet-1');
    });

    it('should keep current pet if it exists in the new list', () => {
      const pets = [createMockPet('pet-1'), createMockPet('pet-2', '年糕')];
      usePetStore.getState().setPets(pets);
      usePetStore.getState().setCurrentPet(pets[1]);

      // Set pets again with same list
      usePetStore.getState().setPets(pets);

      expect(usePetStore.getState().currentPet?.id).toBe('pet-2');
    });

    it('should fallback to first pet if current pet is no longer in list', () => {
      const pets = [createMockPet('pet-1'), createMockPet('pet-2', '年糕')];
      usePetStore.getState().setPets(pets);
      usePetStore.getState().setCurrentPet(pets[1]);

      // Set pets without pet-2
      usePetStore.getState().setPets([createMockPet('pet-1')]);

      expect(usePetStore.getState().currentPet?.id).toBe('pet-1');
    });

    it('should set currentPet to null when pets list is empty', () => {
      usePetStore.getState().setPets([createMockPet('pet-1')]);
      usePetStore.getState().setPets([]);

      expect(usePetStore.getState().currentPet).toBeNull();
    });
  });

  describe('setCurrentPet', () => {
    it('should set the current pet', () => {
      const pet = createMockPet('pet-1');
      usePetStore.getState().setCurrentPet(pet);

      expect(usePetStore.getState().currentPet).toEqual(pet);
    });

    it('should allow setting current pet to null', () => {
      usePetStore.getState().setCurrentPet(createMockPet('pet-1'));
      usePetStore.getState().setCurrentPet(null);

      expect(usePetStore.getState().currentPet).toBeNull();
    });
  });

  describe('addPet', () => {
    it('should add a pet to the list', () => {
      const pet = createMockPet('pet-1');
      usePetStore.getState().addPet(pet);

      expect(usePetStore.getState().pets).toHaveLength(1);
      expect(usePetStore.getState().pets[0].id).toBe('pet-1');
    });

    it('should auto-select the first pet if no current pet', () => {
      const pet = createMockPet('pet-1');
      usePetStore.getState().addPet(pet);

      expect(usePetStore.getState().currentPet?.id).toBe('pet-1');
    });

    it('should NOT change current pet if one is already selected', () => {
      const pet1 = createMockPet('pet-1');
      const pet2 = createMockPet('pet-2', '年糕');
      usePetStore.getState().addPet(pet1);
      usePetStore.getState().addPet(pet2);

      expect(usePetStore.getState().currentPet?.id).toBe('pet-1');
    });
  });

  describe('updatePet', () => {
    it('should update the pet in the list', () => {
      const pet = createMockPet('pet-1');
      usePetStore.getState().setPets([pet]);

      const updated = { ...pet, name: '新名字', weight: 15.0 };
      usePetStore.getState().updatePet(updated);

      expect(usePetStore.getState().pets[0].name).toBe('新名字');
      expect(usePetStore.getState().pets[0].weight).toBe(15.0);
    });

    it('should update currentPet if it is the one being updated', () => {
      const pet = createMockPet('pet-1');
      usePetStore.getState().setPets([pet]);

      const updated = { ...pet, name: '新名字' };
      usePetStore.getState().updatePet(updated);

      expect(usePetStore.getState().currentPet?.name).toBe('新名字');
    });

    it('should NOT change currentPet if updating a different pet', () => {
      const pet1 = createMockPet('pet-1');
      const pet2 = createMockPet('pet-2', '年糕');
      usePetStore.getState().setPets([pet1, pet2]);
      usePetStore.getState().setCurrentPet(pet1);

      const updatedPet2 = { ...pet2, name: '新名字' };
      usePetStore.getState().updatePet(updatedPet2);

      expect(usePetStore.getState().currentPet?.id).toBe('pet-1');
      expect(usePetStore.getState().currentPet?.name).toBe('煤球');
    });
  });

  describe('removePet', () => {
    it('should remove a pet from the list', () => {
      const pet1 = createMockPet('pet-1');
      const pet2 = createMockPet('pet-2', '年糕');
      usePetStore.getState().setPets([pet1, pet2]);

      usePetStore.getState().removePet('pet-1');

      expect(usePetStore.getState().pets).toHaveLength(1);
      expect(usePetStore.getState().pets[0].id).toBe('pet-2');
    });

    it('should set currentPet to next available if current is removed', () => {
      const pet1 = createMockPet('pet-1');
      const pet2 = createMockPet('pet-2', '年糕');
      usePetStore.getState().setPets([pet1, pet2]);
      usePetStore.getState().setCurrentPet(pet1);

      usePetStore.getState().removePet('pet-1');

      expect(usePetStore.getState().currentPet?.id).toBe('pet-2');
    });

    it('should set currentPet to null if the only pet is removed', () => {
      const pet = createMockPet('pet-1');
      usePetStore.getState().setPets([pet]);

      usePetStore.getState().removePet('pet-1');

      expect(usePetStore.getState().currentPet).toBeNull();
    });

    it('should not change currentPet if a different pet is removed', () => {
      const pet1 = createMockPet('pet-1');
      const pet2 = createMockPet('pet-2', '年糕');
      usePetStore.getState().setPets([pet1, pet2]);
      usePetStore.getState().setCurrentPet(pet1);

      usePetStore.getState().removePet('pet-2');

      expect(usePetStore.getState().currentPet?.id).toBe('pet-1');
    });
  });

  describe('clearPets', () => {
    it('should clear all pets and current pet', () => {
      usePetStore.getState().setPets([createMockPet('pet-1'), createMockPet('pet-2', '年糕')]);

      usePetStore.getState().clearPets();

      expect(usePetStore.getState().pets).toEqual([]);
      expect(usePetStore.getState().currentPet).toBeNull();
    });
  });
});
