import { useEffect, useMemo, useState } from 'react';
import { fromHN, fromTechCrunch, fromTheVerge } from '../../../shared/fetchers';

import { normalizeAndSort } from '../../../shared/normalize';
import { ALL_CATEGORIES, Category, NewsItem, Source } from '../../../shared/types';
type State = 'idle' | 'loading' | 'ready' | 'error';

export const HomePage = () => {
  const [state, setState] = useState<State>('idle');
  const [items, setItems] = useState<NewsItem[]>([]);
  const [sourceFilter, setSourceFilter] = useState<Source | 'all'>('all');
  const [categoryFilter, setCategoryFilter] = useState<Category | 'all'>('all');
  const [q, setQ] = useState('');

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
          setItems(normalizeAndSort(all).slice(0, 80));
          setState('ready');
        }
      } catch {
        if (!cancelled) setState('error');
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const filtered = useMemo(() => {
    return items.filter(i => {
      const bySource = sourceFilter === 'all' || i.source === sourceFilter;
      const byCategory = categoryFilter === 'all' || i.categories.includes(categoryFilter);
      const byQuery = q.trim()
        ? (i.title.toLowerCase().includes(q.toLowerCase()))
        : true;
      return bySource && byCategory && byQuery;
    });
  }, [items, sourceFilter, categoryFilter, q]);

  return (
    <main className="container py-4">
      <div className="d-flex flex-wrap align-items-center gap-3 mb-3">
        <h1 className="display-6 m-0">Trending Tech Stories</h1>

        {/* Source filter */}
        <div className="btn-group ms-auto">
          {(['all','techcrunch','theverge','hn'] as const).map((s) => (
            <button
              key={s}
              className={`btn btn-sm ${sourceFilter === s ? 'btn-primary' : 'btn-outline-primary'}`}
              onClick={() => setSourceFilter(s as any)}
            >
              {s.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Category + search */}
      <div className="d-flex flex-wrap gap-2 align-items-center mb-3">
        <select
          className="form-select form-select-sm"
          style={{ maxWidth: 260 }}
          value={categoryFilter === 'all' ? '' : categoryFilter}
          onChange={(e) => setCategoryFilter((e.target.value || 'all') as any)}
        >
          <option value="">All Categories</option>
          {ALL_CATEGORIES.map(c => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>

        <input
          className="form-control form-control-sm"
          style={{ maxWidth: 280 }}
          placeholder="Search title…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
      </div>

      <p className="text-muted mb-4">
        Sources: TechCrunch · The Verge · Hacker News — client-only via RSS/API
      </p>

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
                  <div className="d-flex flex-wrap gap-1 mb-2">
                    {item.categories.map(cat => (
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
          ))}
          {filtered.length === 0 && (
            <div className="col-12">
              <div className="alert alert-warning">No stories match your filters.</div>
            </div>
          )}
        </div>
      )}
    </main>
  );
};

