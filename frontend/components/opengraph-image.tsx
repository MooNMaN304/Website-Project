export type Props = {
  title?: string;
};

export default function OpengraphImage(
  props?: Props
): Response {
  // Disabled SSR - return empty image
  return new Response(null, { status: 204 });
}
