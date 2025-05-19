import type { APIRoute } from 'astro';
import { db } from '../../lib/firebase';

export const GET: APIRoute = async () => {
  try {
    const ref = db.collection('municipios');
    const snapshot = await ref.get();
    const datos = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    return new Response(JSON.stringify(datos), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Error al obtener municipios' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
