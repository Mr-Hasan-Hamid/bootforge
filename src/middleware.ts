import { NextResponse } from 'next/server';

export function middleware() {
  // Pass through all requests — no redirects needed
  // bootforge.vercel.app is the primary domain
  return NextResponse.next();
}

