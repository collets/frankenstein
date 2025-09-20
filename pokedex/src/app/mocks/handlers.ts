import { http, HttpResponse } from 'msw';

export const handlers = [
  http.get('https://pokeapi.co/api/v2/pokemon/:id', ({ params }) => {
    const id = Number(params.id);
    return HttpResponse.json({ id, name: `pokemon-${id}` });
  }),
];

