import type { APIRoute } from 'astro';
import { db } from '../../lib/firebase';

export const GET: APIRoute = async () => {
  try {
    const ref = db.collection('puntos_interes');
    const snapshot = await ref.get();
    const datos = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    return new Response(JSON.stringify(datos), {
      status: 200,
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Error al obtener puntos de interés' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
    });
  }
};
