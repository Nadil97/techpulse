import { useEffect, useMemo, useState } from 'react';
import { fromHN, fromTechCrunch, fromTheVerge } from '../../../shared/fetchers';

import { normalizeAndSort } from '../../../shared/normalize';
import { NewsItem, Source } from '../../../shared/types';
type State = 'idle' | 'loading' | 'ready' | 'error';

export const HomePage = () => {
  const [state, setState] = useState<State>('idle');
  const [items, setItems] = useState<NewsItem[]>([]);
  const [filter, setFilter] = useState<Source | 'all'>('all');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setState('loading');
      try {
        const [tc, verge, hn] = await Promise.allSettled([
          fromTechCrunch(),
          fromTheVerge(),
          fromHN(),
        ]);

        const all: NewsItem[] = [
          ...(tc.status === 'fulfilled' ? tc.value : []),
          ...(verge.status === 'fulfilled' ? verge.value : []),
          ...(hn.status === 'fulfilled' ? hn.value : []),
        ];

        if (!cancelled) {
          setItems(normalizeAndSort(all).slice(0, 60));
          setState('ready');
        }
      } catch (e) {
        if (!cancelled) setState('error');
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const filtered = useMemo(
    () => (filter === 'all' ? items : items.filter(i => i.source === filter)),
    [items, filter]
  );

  return (
    <main className="container py-4">
      <div className="d-flex flex-wrap align-items-center gap-3 mb-3">
        <h1 className="display-6 m-0">Trending Tech Stories</h1>
        <div className="ms-auto">
          <div className="btn-group">
            {(['all','techcrunch','theverge','hn'] as const).map((s) => (
              <button
                key={s}
                className={`btn btn-sm ${filter === s ? 'btn-primary' : 'btn-outline-primary'}`}
                onClick={() => setFilter(s as any)}
              >
                {s.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      </div>

      <p className="text-muted">Sources: TechCrunch · The Verge · Hacker News</p>

      {state === 'loading' && (
        <div className="d-flex justify-content-center my-5">
          <div className="spinner-border" role="status" aria-label="loading" />
        </div>
      )}

      {state === 'error' && (
        <div className="alert alert-danger">
          Failed to load news. Please try again.
        </div>
      )}

      {state === 'ready' && (
        <div className="row g-3">
          {filtered.map((item) => (
            <div className="col-md-6 col-lg-4" key={item.id}>
              <div className="card h-100">
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
                  <p className="card-text small text-muted mb-0">
                    {item.points != null && <>▲ {item.points} points · </>}
                    {item.commentsCount != null && <>{item.commentsCount} comments · </>}
                    {item.publishedAt && new Date(item.publishedAt).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="col-12">
              <div className="alert alert-warning">No stories found for this filter.</div>
            </div>
          )}
        </div>
      )}
    </main>
  );
};
