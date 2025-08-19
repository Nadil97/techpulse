import { useRef } from "react";
import type { NewsItem } from "../../../shared/types";
import "./index.css";

type Props = {
  item: NewsItem;
};

export default function NewsCard({ item }: Props) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const rafId = useRef<number | null>(null);

  const reset = () => {
    if (!innerRef.current) return;
    innerRef.current.style.transform =
      "translateZ(0) scale(1) rotateX(0deg) rotateY(0deg)";
    innerRef.current.style.boxShadow =
      "0 1px 2px rgba(0,0,0,.08), 0 4px 10px rgba(0,0,0,.06)";
  };

  const handleMouseEnter = () => {
    // add a slight lift immediately
    if (!innerRef.current) return;
    innerRef.current.style.transition = "transform 200ms ease, box-shadow 200ms ease";
    innerRef.current.style.transform = "translateZ(0) scale(1.02)";
    innerRef.current.style.boxShadow =
      "0 8px 24px rgba(0,0,0,.14), 0 16px 36px rgba(0,0,0,.10)";
  };

  const handleMouseMove: React.MouseEventHandler<HTMLDivElement> = (e) => {
    if (!wrapperRef.current || !innerRef.current) return;
    const rect = wrapperRef.current.getBoundingClientRect();

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    // normalize to [-0.5, 0.5]
    const px = (x / rect.width) - 0.5;
    const py = (y / rect.height) - 0.5;

    const maxTilt = 12; // deg
    const rotateY = px * maxTilt;   // left-right
    const rotateX = -py * maxTilt;  // up-down

    if (rafId.current) cancelAnimationFrame(rafId.current);
    rafId.current = requestAnimationFrame(() => {
      if (!innerRef.current) return;
      innerRef.current.style.transition = "transform 40ms linear, box-shadow 120ms ease";
      innerRef.current.style.transform =
        `translateZ(0) scale(1.035) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
      // Slightly stronger shadow when tilted
      innerRef.current.style.boxShadow =
        "0 14px 40px rgba(0,0,0,.18), 0 24px 50px rgba(0,0,0,.12)";
    });
  };

  const handleMouseLeave = () => {
    if (rafId.current) cancelAnimationFrame(rafId.current);
    if (!innerRef.current) return;
    innerRef.current.style.transition = "transform 260ms ease, box-shadow 260ms ease";
    reset();
  };

  return (
    <div
      ref={wrapperRef}
      className="news-tilt"               // perspective wrapper
      onMouseEnter={handleMouseEnter}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <div ref={innerRef} className="card news-tilt__inner h-100 rounded-4 overflow-hidden">
        <div className="card-body">
          <span className="badge bg-secondary text-uppercase mb-2">{item.source}</span>

          <h5 className="card-title">
            <a
              href={item.url}
              target="_blank"
              rel="noreferrer"
              className="stretched-link text-decoration-none"
            >
              {item.title}
            </a>
          </h5>

          <div className="d-flex flex-wrap gap-1 mb-2">
            {item.categories.map((cat) => (
              <span key={cat} className="badge text-bg-light border">
                {cat}
              </span>
            ))}
          </div>

          <p className="card-text small text-muted mb-0">
            {item.points != null && <>▲ {item.points} points · </>}
            {item.commentsCount != null && <>{item.commentsCount} comments · </>}
            {item.publishedAt && new Date(item.publishedAt).toLocaleString()}
          </p>
        </div>
      </div>
    </div>
  );
}
