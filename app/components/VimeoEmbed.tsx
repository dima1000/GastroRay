"use client";

type Props = { id: string; title: string };

export default function VimeoEmbed({ id, title }: Props) {
  return (
    <div
      className="relative w-full overflow-hidden rounded-2xl border"
      style={{ aspectRatio: "16 / 9" }}
    >
      <iframe
        src={`https://player.vimeo.com/video/${id}?badge=0&title=0&byline=0&portrait=0`}
        title={title}
        loading="lazy"
        className="absolute inset-0 h-full w-full"
        allow="autoplay; fullscreen; picture-in-picture"
        allowFullScreen
      />
    </div>
  );
}
