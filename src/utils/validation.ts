import { z } from 'zod';

// Messages d'erreur personnalisés en français
const customMessages = {
  required_error: "Ce champ est requis",
  invalid_type_error: "Type de données invalide",
};

// Schémas de validation pour l'authentification
export const loginSchema = z.object({
  email: z.string({ required_error: customMessages.required_error })
    .email("Veuillez entrer une adresse email valide")
    .min(1, "L'email est requis"),
  password: z.string({ required_error: customMessages.required_error })
    .min(1, "Le mot de passe est requis")
});

export const registerSchema = z.object({
  name: z.string({ required_error: customMessages.required_error })
    .min(2, "Le nom doit contenir au moins 2 caractères")
    .max(50, "Le nom ne peut pas dépasser 50 caractères")
    .trim(),
  email: z.string({ required_error: customMessages.required_error })
    .email("Veuillez entrer une adresse email valide")
    .min(1, "L'email est requis"),
  password: z.string({ required_error: customMessages.required_error })
    .min(6, "Le mot de passe doit contenir au moins 6 caractères")
    .max(128, "Le mot de passe ne peut pas dépasser 128 caractères")
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 
      "Le mot de passe doit contenir au moins une minuscule, une majuscule et un chiffre")
});

export const forgotPasswordSchema = z.object({
  email: z.string({ required_error: customMessages.required_error })
    .email("Veuillez entrer une adresse email valide")
    .min(1, "L'email est requis")
});

export const resetPasswordSchema = z.object({
  password: z.string({ required_error: customMessages.required_error })
    .min(8, "Le mot de passe doit contenir au moins 8 caractères")
    .max(128, "Le mot de passe ne peut pas dépasser 128 caractères")
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/, 
      "Le mot de passe doit contenir au moins une minuscule, une majuscule, un chiffre et un caractère spécial"),
  confirmPassword: z.string({ required_error: customMessages.required_error })
}).refine((data) => data.password === data.confirmPassword, {
  message: "Les mots de passe ne correspondent pas",
  path: ["confirmPassword"],
});

// Schémas de validation pour les dépenses
export const expenseSchema = z.object({
  amount: z.string({ required_error: customMessages.required_error })
    .min(1, "Le montant est requis")
    .refine((val) => {
      const num = parseFloat(val);
      return !isNaN(num) && num > 0;
    }, "Le montant doit être un nombre positif supérieur à 0"),
  description: z.string({ required_error: customMessages.required_error })
    .min(1, "La description est requise")
    .max(200, "La description ne peut pas dépasser 200 caractères")
    .trim(),
  date: z.string({ required_error: customMessages.required_error })
    .min(1, "La date est requise")
    .refine((val) => {
      const date = new Date(val);
      return !isNaN(date.getTime());
    }, "Veuillez entrer une date valide"),
  category: z.string().optional(),
  tags: z.array(z.object({
    _id: z.string(),
    name: z.string()
  })).optional().default([])
});

// Schémas de validation pour les catégories
export const categorySchema = z.object({
  name: z.string({ required_error: customMessages.required_error })
    .min(1, "Le nom de la catégorie est requis")
    .max(50, "Le nom ne peut pas dépasser 50 caractères")
    .trim(),
  color: z.string({ required_error: customMessages.required_error })
    .regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, "Veuillez sélectionner une couleur valide"),
  description: z.string()
    .max(200, "La description ne peut pas dépasser 200 caractères")
    .optional()
    .or(z.literal(""))
});

// Schémas de validation pour les tags
export const tagSchema = z.object({
  name: z.string({ required_error: customMessages.required_error })
    .min(1, "Le nom du tag est requis")
    .max(30, "Le nom ne peut pas dépasser 30 caractères")
    .trim()
});

// Fonction utilitaire pour valider un schéma et retourner les erreurs formatées
export const validateSchema = (schema, data) => {
  try {
    const result = schema.safeParse(data);
    if (result.success) {
      return { success: true, data: result.data, errors: {} };
    } else {
      const errors = {};
      result.error.errors.forEach((error) => {
        const path = error.path.join('.');
        errors[path] = error.message;
      });
      return { success: false, data: null, errors };
    }
  } catch (error) {
    return { success: false, data: null, errors: { general: "Erreur de validation" } };
  }
};

// Fonction pour valider un champ individuel en temps réel
export const validateField = (schema, fieldName, value, allData = {}) => {
  try {
    // Pour la validation d'un champ spécifique, on essaie de valider tout l'objet
    // mais on ne retourne que l'erreur du champ spécifié
    const dataToValidate = { ...allData, [fieldName]: value };
    const result = schema.safeParse(dataToValidate);
    
    if (result.success) {
      return null; // Pas d'erreur
    } else {
      // Chercher l'erreur spécifique à ce champ
      const fieldError = result.error.errors.find(error => 
        error.path.length > 0 && error.path[0] === fieldName
      );
      return fieldError ? fieldError.message : null;
    }
  } catch (error) {
    return "Erreur de validation";
  }
};
