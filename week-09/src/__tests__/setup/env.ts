import dotenv from 'dotenv';

// Carga las variables de prueba (secretos JWT) antes de que se importe config/env.ts
dotenv.config({ path: '.env.test' });
