export default function Image() {
  // Disabled SSR - return empty image
  return new Response(null, { status: 204 });
}
