import { auth } from '@/auth'

export default auth((req) => {
  const isCheckout = req.nextUrl.pathname.startsWith('/checkout')
  const isAdmin = req.nextUrl.pathname.startsWith('/admin')

  if ((isCheckout || isAdmin) && !req.auth) {
    const url = new URL('/api/auth/signin', req.url)
    url.searchParams.set('callbackUrl', req.nextUrl.pathname)
    return Response.redirect(url)
  }
})

export const config = {
  matcher: ['/checkout/:path*', '/admin/:path*'],
}
