import { Request, Response, NextFunction } from 'express';
import { Document } from 'mongoose';

// Interfaces pour les modèles
export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  passwordResetToken?: string;
  passwordResetExpires?: Date;
  comparePassword(enteredPassword: string): Promise<boolean>;
}

export interface IExpense extends Document {
  amount: number;
  description: string;
  category: string;
  tags: string[];
  date: Date;
  user: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICategory extends Document {
  name: string;
  color: string;
  user: string;
}

export interface ITag extends Document {
  name: string;
  user: string;
}

// Types pour les requêtes Express avec user authentifié
export interface AuthenticatedRequest extends Request {
  user?: IUser;
}

// Types pour les contrôleurs
export type ControllerFunction = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => Promise<void> | void;

// Types pour les filtres de dépenses
export interface ExpenseFilters {
  category?: string;
  tags?: string;
  startDate?: string;
  endDate?: string;
  minAmount?: string;
  maxAmount?: string;
  search?: string;
}
