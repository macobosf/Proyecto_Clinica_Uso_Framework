// Cifrado en tránsito (control DES-01): el backend solo sirve por HTTPS.
export const API_URL = import.meta.env.VITE_API_URL ?? 'https://localhost:3000';
