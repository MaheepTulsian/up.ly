// src/store/formStore.js
import { create } from 'zustand';

const useFormDataStore = create((set, get) => ({
  formData: {
    personal: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      dob: '',
      street: '',
      city: '',
      state: '',
      country: '',
      zipcode: ''
    },
    academics: null,
    projects: null,
    skills: null,
    workExperience: null,
    certifications: null,
  },
  updateFormData: (formType, data) => set((state) => ({
    formData: { 
      ...state.formData, 
      [formType]: data 
    }
  })),
  getFormData: (formType) => {
    if (!formType) {
      console.error("formType is undefined or null");
      return null;
    }
    return get().formData[formType];
  }
}));

export default useFormDataStore;
