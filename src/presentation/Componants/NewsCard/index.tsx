import { useRef } from "react";
import type { NewsItem } from "../../../shared/types";
import { useBookmarks } from "../../../shared/useBookmarks";
import { bookmarkKey } from "../../../shared/bookmarkKey"; // ⬅️ add
import "./index.css";

type Props = { item: NewsItem };

export default function NewsCard({ item }: Props) {
  const { isBookmarked, toggle } = useBookmarks();

  const wrapperRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const rafId = useRef<number | null>(null);

  // ✅ use a stable, URL-based key
  const key = bookmarkKey(item);

  const reset = () => {
    if (!innerRef.current) return;
    innerRef.current.style.transform =
      "translateZ(0) scale(1) rotateX(0deg) rotateY(0deg)";
    innerRef.current.style.boxShadow =
      "0 1px 2px rgba(0,0,0,.08), 0 4px 10px rgba(0,0,0,.06)";
  };

  const handleMouseEnter = () => {
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
    const px = x / rect.width - 0.5;
    const py = y / rect.height - 0.5;
    const maxTilt = 12;
    const rotateY = px * maxTilt;
    const rotateX = -py * maxTilt;

    if (rafId.current) cancelAnimationFrame(rafId.current);
    rafId.current = requestAnimationFrame(() => {
      if (!innerRef.current) return;
      innerRef.current.style.transition = "transform 40ms linear, box-shadow 120ms ease";
      innerRef.current.style.transform =
        `translateZ(0) scale(1.035) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
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

  const bookmarked = isBookmarked(key); // ✅ check with stable key

  const onBookmarkClick: React.MouseEventHandler<HTMLButtonElement> = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggle(key); // ✅ store with stable key
  };

  return (
    <div
      ref={wrapperRef}
      className="news-tilt"
      onMouseEnter={handleMouseEnter}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <div ref={innerRef} className="card news-tilt__inner h-100 rounded-4 overflow-hidden">
        {/* Bookmark button */}
        <button
          className={`news-bookmark-btn ${bookmarked ? "is-active" : ""}`}
          onClick={onBookmarkClick}
          aria-pressed={bookmarked}
          aria-label={bookmarked ? "Remove bookmark" : "Add bookmark"}
          title={bookmarked ? "Remove bookmark" : "Add bookmark"}
        >
          <i className={bookmarked ? "fa-solid fa-bookmark" : "fa-regular fa-bookmark"} />
        </button>

        <div className="card-body">
          <span className="badge bg-secondary text-uppercase mb-2">{item.source}</span>
          <h5 className="card-title">
            <a href={item.url} target="_blank" rel="noreferrer" className="stretched-link text-decoration-none">
              {item.title}
            </a>
          </h5>
          <div className="d-flex flex-wrap gap-1 mb-2">
            {item.categories.map((cat) => (
              <span key={cat} className="badge text-bg-light border">{cat}</span>
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
