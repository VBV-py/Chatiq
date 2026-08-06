import { useRef } from "react";
import { Attachment } from "../../types/message";
import { humanFileSize } from "../../utils/fileSize";
interface Props { attachments: Attachment[]; messageType: string; }

export function MediaPreview({ attachments, messageType }: Props) {
  const videoRefs = useRef<Record<string, HTMLVideoElement | null>>({});

  const playInFullscreen = async (id: string) => {
    const video = videoRefs.current[id];
    if (!video) return;
    try {
      if (video.requestFullscreen) {
        await video.requestFullscreen();
      }
      await video.play();
    } catch {
      // Ignore autoplay/fullscreen failures from browser policies.
    }
  };

  const downloadAttachment = (fileUrl: string, fileName: string) => {
    const link = document.createElement("a");
    link.href = fileUrl;
    link.download = fileName;
    link.target = "_blank";
    link.rel = "noreferrer";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!attachments.length) return null;
  return (
    <div className="media-preview">
      {attachments.map(a => {
        if (messageType === "video" || a.mime_type?.startsWith("video/")) {
          return (
            <div key={a.id} className="video-preview">
              <video
                ref={(el) => { videoRefs.current[a.id] = el; }}
                src={a.file_url}
                controls={false}
              />
              <button
                type="button"
                className="video-open-btn"
                onClick={() => playInFullscreen(a.id)}
                title="Play fullscreen"
                aria-label="Play video in fullscreen"
              >
                ▶
              </button>
            </div>
          );
        }

        if (messageType === "image" || a.mime_type?.startsWith("image/"))
          return (
            <div key={a.id} className="image-preview">
              <img
                src={a.file_url}
                alt={a.file_name}
                onClick={() => downloadAttachment(a.file_url, a.file_name)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    downloadAttachment(a.file_url, a.file_name);
                  }
                }}
                title="Download image"
                aria-label="Download image"
              />
            </div>
          );
        if (messageType === "audio" || a.mime_type?.startsWith("audio/"))
          return <audio key={a.id} src={a.file_url} controls style={{ width: "100%" }} />;
        return (
          <a key={a.id} href={a.file_url} target="_blank" rel="noreferrer" className="file-preview">
            <span className="file-icon">📎</span>
            <div className="file-info">
              <span className="file-name">{a.file_name}</span>
              <span className="file-size">{humanFileSize(a.file_size)}</span>
            </div>
          </a>
        );
      })}
    </div>
  );
}
