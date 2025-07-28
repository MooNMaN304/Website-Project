// import { NextRequest } from 'next/server';

// export async function GET(req: NextRequest, { params }: { params: { path: string[] } }) {
//   const path = params.path.join('/');
//   const authHeader = req.headers.get('authorization');

//   const response = await fetch(`http://localhost:8000/api/${path}/`, {
//     headers: {
//       'Authorization': authHeader || '',
//     },
//   });

//   return response;
// }


import { NextRequest } from 'next/server'

export async function GET(req: NextRequest, context: { params: { path: string[] } }) {
  const { path } = await context.params;
  const joinedPath = path.join('/');
  const authHeader = req.headers.get('authorization');

  const response = await fetch(`http://localhost:8000/api/${joinedPath}/`, {
    headers: {
      'Authorization': authHeader || '',
    },
  });

  return response;
}
// -------------------------------------------------------------------------------------------


export async function POST(req: NextRequest, { params }: { params: { path: string[] } }) {
  const { path } = await params;
  const joinedPath = path.join('/');
  const authHeader = req.headers.get('authorization');
  const body = await req.json();

  const response = await fetch(`http://localhost:8000/api/${joinedPath}/`, {
    method: 'POST',
    headers: {
      'Authorization': authHeader || '',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  return response;
}

export async function PUT(req: NextRequest, { params }: { params: { path: string[] } }) {
  const { path } = await params;
  const joinedPath = path.join('/');
  const authHeader = req.headers.get('authorization');
  const body = await req.json();

  const response = await fetch(`http://localhost:8000/api/${joinedPath}/`, {
    method: 'PUT',
    headers: {
      'Authorization': authHeader || '',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  return response;
}

export async function DELETE(req: NextRequest, { params }: { params: { path: string[] } }) {
  const { path } = await params;
  const joinedPath = path.join('/');
  const authHeader = req.headers.get('authorization');

  const response = await fetch(`http://localhost:8000/api/${joinedPath}/`, {
    method: 'DELETE',
    headers: {
      'Authorization': authHeader || '',
    },
  });

  return response;
}

export async function OPTIONS(req: NextRequest) {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
