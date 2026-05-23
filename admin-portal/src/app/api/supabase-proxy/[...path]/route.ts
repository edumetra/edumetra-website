import { NextRequest, NextResponse } from 'next/server';

async function proxy(request: NextRequest, params: { path: string[] }) {
  const supabaseBase = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!supabaseBase) {
    return NextResponse.json({ error: 'SUPABASE_URL is not configured on server' }, { status: 500 });
  }

  const path = params.path?.join('/') ?? '';
  let query = request.nextUrl.search;

  // Enforce visible reviews only for unauthenticated/public reads
  if (request.method === 'GET' && path === 'rest/v1/reviews') {
      const url = new URL(request.url);
      url.searchParams.set('moderation_status', 'eq.visible');
      query = url.search;
  }

  const target = `${supabaseBase.replace(/\/$/, '')}/${path}${query}`;

  try {
    const bodyAllowed = !['GET', 'HEAD'].includes(request.method.toUpperCase());
    const headers = new Headers(request.headers);
    headers.delete('host');
    headers.delete('connection');
    headers.delete('content-length');

    let bodyText = undefined;
    if (bodyAllowed) {
        bodyText = await request.text();
        // Force new reviews to be pending
        if (request.method === 'POST' && path === 'rest/v1/reviews') {
            try {
                const bodyJson = JSON.parse(bodyText);
                if (Array.isArray(bodyJson)) {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    bodyJson.forEach((item: any) => item.moderation_status = 'pending');
                } else {
                    bodyJson.moderation_status = 'pending';
                }
                bodyText = JSON.stringify(bodyJson);
            } catch (e) {
                // Ignore parse errors
            }
        }
    }

    const upstream = await fetch(target, {
      method: request.method,
      headers,
      body: bodyText,
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

