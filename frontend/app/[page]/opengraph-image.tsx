export default function Image({ params }: { params: { page: string } }) {
  // Disabled SSR - return empty image
  return new Response(null, { status: 204 });
}
