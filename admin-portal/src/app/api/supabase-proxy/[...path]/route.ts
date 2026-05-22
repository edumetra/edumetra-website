import { NextRequest, NextResponse } from 'next/server';

async function proxy(request: NextRequest, params: { path: string[] }) {
  const supabaseBase = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!supabaseBase) {
    return NextResponse.json({ error: 'SUPABASE_URL is not configured on server' }, { status: 500 });
  }

  const path = params.path?.join('/') ?? '';
  const query = request.nextUrl.search;
  const target = `${supabaseBase.replace(/\/$/, '')}/${path}${query}`;

  try {
    const bodyAllowed = !['GET', 'HEAD'].includes(request.method.toUpperCase());
    const headers = new Headers(request.headers);
    headers.delete('host');
    headers.delete('connection');
    headers.delete('content-length');

    const upstream = await fetch(target, {
      method: request.method,
      headers,
      body: bodyAllowed ? await request.text() : undefined,
    });

    return new NextResponse(upstream.body, {
      status: upstream.status,
      headers: upstream.headers,
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Supabase proxy failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 502 }
    );
  }
}

export async function GET(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  return proxy(request, await context.params);
}

export async function POST(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  return proxy(request, await context.params);
}

export async function PUT(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  return proxy(request, await context.params);
}

export async function PATCH(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  return proxy(request, await context.params);
}

export async function DELETE(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  return proxy(request, await context.params);
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204 });
}
