import { getYouTubeEmbedUrl } from "@/lib/menu-utils";

type VideoEmbedProps = {
  videoUrl?: string;
};

export function VideoEmbed({ videoUrl }: VideoEmbedProps) {
  const embedUrl = getYouTubeEmbedUrl(videoUrl);

  if (!embedUrl) {
    return (
      <div className="flex h-full min-h-40 items-center justify-center rounded-lg border border-dashed bg-muted/40 text-sm text-muted-foreground">
        動画なし
      </div>
    );
  }

  return (
    <div className="aspect-video w-full overflow-hidden rounded-lg bg-muted">
      <iframe
        src={embedUrl}
        title="練習参考動画"
        className="h-full w-full"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    </div>
  );
}
