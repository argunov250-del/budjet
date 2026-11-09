import { NeuInput } from '../../components/NeuInput';

/** Inset text field (alias of the shared NeuInput) */
export const Field = NeuInput;

export const digits = (s: string) => parseInt(s.replace(/\D/g, ''), 10) || 0;
