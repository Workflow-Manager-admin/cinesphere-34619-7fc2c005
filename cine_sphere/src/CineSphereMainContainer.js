import React from "react";
import "./CineSphereMainContainer.css";
import { searchMovies, getHiddenGems } from "./tmdbApi";

/**
 * PUBLIC_INTERFACE
 * CineSphereMainContainer - After region selection, displays only that region,
 * with two horizontal, labeled feature rows ("What to watch" and "Games") on the left.
 * Each feature is in its own horizontally-arranged card; responsive, modern, and decluttered.
 */

// --- Minimal Feature Components ---

function MovieMoodMatcher({ regionConfig }) {
  const [query, setQuery] = React.useState("");
  const [movies, setMovies] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState("");
  async function handleSearch(e) {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    setError("");
    try {
      const res = await searchMovies(query.trim(), 1, regionConfig.language);
      setMovies(res.slice(0, 6));
    } catch {
      setError("Failed to fetch movies.");
      setMovies([]);
    }
    setLoading(false);
  }
  return (
    <div style={{ width: "100%" }}>
      <form onSubmit={handleSearch} style={{ marginBottom: 8, width: "100%" }}>
        <input
          type="text"
          style={{
            padding: 7,
            fontSize: 15,
            borderRadius: 6,
            border: "1.5px solid #f394ff",
            width: "68%",
            marginRight: 6,
          }}
          placeholder={`Enter mood/genre`}
          value={query}
          onChange={e => setQuery(e.target.value)}
        />
        <button type="submit" className="btn" style={{ padding: "7px 18px" }}>
          Search
        </button>
      </form>
      {loading && <div style={{ fontStyle: "italic" }}>Loading...</div>}
      {error && (
        <div style={{ color: "#fff0ee", background: "#e34", borderRadius: 6, padding: "6px 8px", fontSize: "0.98rem" }}>{error}</div>
      )}
      <div>
        {movies.length > 0 && (
          <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
            {movies.map(movie => (
              <li key={movie.id} style={{ marginBottom: 8, display: "flex", alignItems: "center", gap: 10 }}>
                {movie.poster_path && (
                  <img src={`https://image.tmdb.org/t/p/w92${movie.poster_path}`} width={38} height={54} alt="" style={{ borderRadius: 6, border: "1.5px solid #f394ff" }}/>
                )}
                <span style={{ fontWeight: 500 }}>{movie.title}</span>
                <span style={{ color: "#9c9caa", fontSize: 13 }}>{movie.release_date ? `(${movie.release_date.slice(0, 4)})` : ""}</span>
              </li>
            ))}
          </ul>
        )}
        {!loading && !error && movies.length === 0 && (
          <div className="cinesphere-placeholder">
            <span>
              Try a mood keyword — Get instant {regionConfig.label} picks!
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

function GuessTheMovieGame({ regionConfig }) {
  // Minimal poster guessing logic, one per round, only for selected region
  const [guess, setGuess] = React.useState("");
  const [round, setRound] = React.useState(1);
  const [movie, setMovie] = React.useState(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState("");
  const [status, setStatus] = React.useState("");
  const [reveal, setReveal] = React.useState(false);

  async function fetchGameMovie() {
    setLoading(true); setError(""); setReveal(false); setStatus(""); setGuess("");
    try {
      const gems = await getHiddenGems(Math.floor(Math.random() * 2) + 1, regionConfig.language);
      let found = gems.find(g => g.poster_path && g.title) || gems[0];
      setMovie(found);
    } catch {
      setError("Could not get movie poster. Try again later.");
      setMovie(null);
    }
    setLoading(false);
  }

  React.useEffect(() => { fetchGameMovie(); /* eslint-disable-next-line */ }, [round]);

  function handleGuess(e) {
    e.preventDefault();
    if (!movie) return;
    function clean(s) { return s.replace(/\W/g, '').toLowerCase(); }
    if (clean(guess) === clean(movie.title)) {
      setStatus("success"); setReveal(true);
    } else {
      setStatus("fail"); setReveal(false);
    }
  }

  function handleNext() { setRound(r => r + 1); setGuess(""); setReveal(false); setMovie(null); setStatus(""); setError(""); }

  return (
    <div style={{ width: "100%", minHeight: 180 }}>
      {loading && <div style={{ fontStyle: "italic", color: "#8c42a8" }}>Loading movie...</div>}
      {error && (
        <div style={{ color: "#fff0ee", background: "#e34", borderRadius: 6, padding: "8px 12px", fontSize: "0.98rem", margin: "10px 0" }}>{error}</div>
      )}
      {!loading && movie && (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
          <div style={{ position: "relative", margin: "0 0 8px 0" }}>
            <img
              src={`https://image.tmdb.org/t/p/w185${movie.poster_path}`}
              alt="Guess the movie"
              width={78}
              height={108}
              style={{
                filter: reveal ? "none" : "blur(12px) brightness(0.96) grayscale(0.1)",
                borderRadius: "10px",
                border: "1.5px solid #f394ff",
                background: "#f6eaff",
                objectFit: "cover",
              }}
            />
            {status === "success" && (
              <span style={{
                position: "absolute", left: 0, top: 0, width: "100%", height: "100%", background: "rgba(243,148,255,0.80)",
                color: "#1f1f47", fontWeight: 700, fontSize: "1.01rem", borderRadius: 10, display: "flex",
                justifyContent: "center", alignItems: "center", zIndex: 1
              }}>🎉 Correct!</span>
            )}
            {status === "fail" && (
              <span style={{
                position: "absolute", left: 0, top: 0, width: "100%", height: "100%", background: "rgba(255,255,255,0.6)",
                color: "#de2072", fontWeight: 700, fontSize: "0.99rem", borderRadius: 10, display: "flex",
                justifyContent: "center", alignItems: "center", zIndex: 1
              }}>❌ Try Again!</span>
            )}
          </div>
          {!reveal && (
            <form onSubmit={handleGuess} style={{ width: "100%", display: "flex", alignItems: "center", marginBottom: 3 }}>
              <input
                type="text"
                aria-label="Guess the movie title"
                style={{
                  padding: 7, fontSize: 15, borderRadius: 6, border: "1.5px solid #f394ff",
                  width: "60%", marginRight: 7, outline: status === "fail" ? "2px solid #de2072" : "none"
                }}
                placeholder="Type your guess…"
                value={guess}
                onChange={e => { setGuess(e.target.value); setStatus(""); }}
                autoComplete="off"
                disabled={loading}
              />
              <button className="btn" style={{ padding: "7px 18px" }} type="submit" disabled={loading || !guess.trim()}>Guess</button>
            </form>
          )}
          {(reveal || status === "success") && (
            <button className="btn" style={{ background: "#f394ff", color: "#1f1f47", marginTop: 4, fontSize: "0.99rem" }} type="button" onClick={handleNext}>
              Next Poster →
            </button>
          )}
        </div>
      )}
      {!loading && !movie && !error && (
        <div style={{ marginTop: 12, padding: "4px 2px", color: "#f394ff" }}>
          No poster available. <button className="btn" style={{ marginLeft: 2 }} onClick={handleNext}>Retry</button>
        </div>
      )}
    </div>
  );
}

function HiddenGemsExplorer({ regionConfig }) {
  // Enhanced: Robust client-side pagination for Top IMDb (Hidden Gems Explorer)
  const PAGE_SIZE = 8; // No. of movies to show per "page"
  const [gems, setGems] = React.useState([]);             // All gems loaded so far
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState("");
  const [page, setPage] = React.useState(1);              // Tracks next remote page to fetch from TMDb
  const [displayCount, setDisplayCount] = React.useState(PAGE_SIZE); // Number of items actually displayed to user
  const [hasMoreRemote, setHasMoreRemote] = React.useState(true);    // More pages possibly available remotely
  const [localGemsEndReached, setLocalGemsEndReached] = React.useState(false);

  // Reset everything when regionConfig.language changes
  React.useEffect(() => {
    setGems([]);
    setPage(1);
    setDisplayCount(PAGE_SIZE);
    setHasMoreRemote(true);
    setLocalGemsEndReached(false);
    setError("");
  }, [regionConfig.language]);

  // Fetch another remote "page" of data from TMDb (only if we don't already have enough locally)
  React.useEffect(() => {
    let isMounted = true;
    async function fetchMoreRemote() {
      setLoading(true);
      setError("");
      try {
        const res = await getHiddenGems(page, regionConfig.language);
        if (!isMounted) return;
        // Only add new/unique
        setGems(prev => {
          const idSet = new Set(prev.map(g => g.id));
          const newGems = res.filter(m => !idSet.has(m.id));
          // If nothing new in this page, end further remote fetches.
          if (newGems.length === 0) setHasMoreRemote(false);
          return [...prev, ...newGems];
        });
        // Set hasMoreRemote: less than 20 on a remote page may mean TMDb is exhausted (or < PAGE_SIZE not enough)
        if (res.length < 20) setHasMoreRemote(false);
      } catch {
        if (isMounted) setError("Failed to load hidden gems.");
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    // Whenever we've displayed everything we have locally, and want more, fetch remote
    // Only trigger on actual intent to grow (i.e., displayCount > gems.length)
    if (displayCount > gems.length && hasMoreRemote && !loading) {
      fetchMoreRemote();
    }
    return () => { isMounted = false; };
  }, [displayCount, page, hasMoreRemote, regionConfig.language]);

  // Whether "Show more" should still be clickable
  const canShowMore =
    !loading && (
      (displayCount < gems.length) || (hasMoreRemote)
    );

  // Show actual visible gems: must not exceed gems.length
  const visible = gems.slice(0, displayCount);

  // Handle Show More
  function handleShowMore() {
    // If we have enough locally for another "page", just display more
    if (displayCount < gems.length) {
      setDisplayCount(prev => prev + PAGE_SIZE);
      // Don't need to trigger remote fetch here
      setLocalGemsEndReached(false);
    } else if (hasMoreRemote && !loading) {
      // Ask for next remote page, and after it loads, displayCount will re-trigger if there's more
      setPage(prev => prev + 1);
      setDisplayCount(prev => prev + PAGE_SIZE);
      setLocalGemsEndReached(false);
    } else {
      // No more remotely, and displayed all locally
      setLocalGemsEndReached(true);
    }
  }

  React.useEffect(() => {
    // If we just set displayCount to cover everything, but nothing left, flag local end
    if (!hasMoreRemote && displayCount >= gems.length && gems.length !== 0) {
      setLocalGemsEndReached(true);
    }
  }, [displayCount, gems.length, hasMoreRemote]);

  return (
    <div style={{ width: "100%" }}>
      {loading && gems.length === 0 && <div style={{ fontStyle: "italic" }}>Loading...</div>}
      {error && (
        <div style={{ color: "#fff0ee", background: "#e34", borderRadius: 6, padding: "6px 8px", fontSize: "0.98rem" }}>{error}</div>
      )}
      <ul style={{ listStyle: "none", padding: 0, margin: 0, maxHeight: 380, overflowY: "auto" }}>
        {visible.map(gem => (
          <li key={gem.id} style={{
            marginBottom: 7,
            display: "flex", alignItems: "center", gap: 10,
            background: "#f9f7fb",
            borderRadius: 8,
            padding: "4px 6px",
            boxShadow: "0 1px 5px #e6dde825",
            minHeight: 48
          }}>
            {gem.poster_path && (
              <img src={`https://image.tmdb.org/t/p/w92${gem.poster_path}`} width={34} height={48} alt="" style={{ borderRadius: 6, border: "1.5px solid #f394ff", background: "#f3eaff" }} />
            )}
            <span style={{ fontWeight: 500, color: "#000" }}>{gem.title}</span>
            <span style={{ color: "#000", fontSize: 13, marginLeft: 3 }}>★ {gem.vote_average?.toFixed(1)}</span>
            <span style={{ color: "#000", fontSize: 13 }}>{gem.release_date ? `(${gem.release_date.slice(0, 4)})` : ""}</span>
          </li>
        ))}
      </ul>
      {!loading && !error && visible.length === 0 && (
        <div className="cinesphere-placeholder">
          <span>
            Find hidden gems: Low-popularity, high-rated {regionConfig.label} movies!
          </span>
        </div>
      )}
      <div style={{ textAlign: "center", marginTop: 10 }}>
        {canShowMore && (
          <button
            type="button"
            className="btn"
            style={{
              background: "#f394ff",
              color: "#1f1f47",
              fontWeight: 600,
              fontSize: "0.99rem",
              borderRadius: 7,
              margin: "7px auto 0 auto",
              minWidth: 98,
              boxShadow: "0 2px 6px #1f1f4730"
            }}
            onClick={handleShowMore}
            disabled={loading}
          >
            Show more
          </button>
        )}
        {!canShowMore && localGemsEndReached && (
          <span style={{ color: "#8473a5", fontStyle: "italic", marginTop: 7, display: "inline-block" }}>
            No more results.
          </span>
        )}
        {loading && gems.length > 0 && (
          <span style={{ color: "#8473a5", fontStyle: "italic", marginTop: 7, display: "inline-block" }}>Loading…</span>
        )}
      </div>
    </div>
  );
}

function PlaceholderFeature({ title }) {
  return (
    <div className="cinesphere-placeholder">
      <span>
        <strong>Coming Soon:</strong> {title}
      </span>
    </div>
  );
}

// --- Feature Card Layouts ---

function FeatureBox({ title, desc, children }) {
  return (
    <div className="cinesphere-feature-rowbox">
      <h2 className="cinesphere-feature-row-title">{title}</h2>
      <div className="cinesphere-feature-row-desc">{desc}</div>
      <div>{children}</div>
    </div>
  );
}

/**
 * WhatToWatchGrid - Displays "What to watch" features in a 2x2 grid (two rows, two columns per row).
 * Each card/feature is responsive and preserves mobile usability.
 */
function WhatToWatchGrid({ regionConfig }) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(2, 1fr)",
        gridGap: 28,
        padding: "15px 4px 18px 4px",
        background: "#fcfcfc",
        borderRadius: "0 0 18px 18px",
        boxShadow: "0 2px 9px #b5aac228",
        width: "100%",
      }}
      className="cinesphere-row-list cinesphere-what2watch-grid"
    >
      <FeatureBox
        title="Top IMDb"
        desc={`Discover top-rated ${regionConfig.label} movies as ranked on IMDb.`}
      >
        <HiddenGemsExplorer regionConfig={regionConfig} />
      </FeatureBox>

      <FeatureBox
        title="Movie Mood Matcher"
        desc={`Type your mood and get ${regionConfig.label.toLowerCase()} matches.`}
      >
        <MovieMoodMatcher regionConfig={regionConfig} />
      </FeatureBox>

      <FeatureBox
        title="Regional Movie Explorer"
        desc={`Explore top ${regionConfig.label} picks and rare finds.`}
      >
        <PlaceholderFeature title="Regional Movie Explorer" />
      </FeatureBox>

      <FeatureBox
        title="Binge Planner"
        desc={`Plan your ${regionConfig.label} movie or TV marathon.`}
      >
        <PlaceholderFeature title="Binge Planner" />
      </FeatureBox>
    </div>
  );
}

// Horizontal "Games" row: 2 feature cards side by side (responsive)
function GamesRow({ regionConfig }) {
  return (
    <div className="cinesphere-row-list">
      <FeatureBox
        title="Film Detective"
        desc={`Enter clues like actor name, quote, or year to find the ${regionConfig.label} movie.`}
      ><PlaceholderFeature title="Film Detective" /></FeatureBox>

      <FeatureBox
        title="Guess the Movie Game"
        desc={`Blurred poster: guess the ${regionConfig.label} movie title!`}
      ><GuessTheMovieGame regionConfig={regionConfig} /></FeatureBox>
    </div>
  );
}

/**
 * PUBLIC_INTERFACE
 * CineSphereMainContainer
 * Only displays feature UI (not region/language selection). When no region is selected, 
 * it should not render the feature grid at all (responsibility for language selection
 * is elsewhere). The 2x2 grid is used ONLY after a region is selected.
 */
function CineSphereMainContainer({ selectedRegion }) {
  // If no region selected, render nothing (App handles region/language selection UI)
  if (!selectedRegion) {
    return null;
  }

  return (
    <div className="cinesphere-main-container">
      <div className="cinesphere-region-title-label">
        <span className="cinesphere-region-main">{selectedRegion.label}</span>
        <span className="cinesphere-region-sub">{selectedRegion.regionLabel}</span>
      </div>
      <div className="cinesphere-main-horiz">
        <section className="cinesphere-horiz-section">
          <div className="cinesphere-row-label">What to watch</div>
          <WhatToWatchGrid regionConfig={selectedRegion} />
        </section>
        <section className="cinesphere-horiz-section">
          <div className="cinesphere-row-label">Games</div>
          <GamesRow regionConfig={selectedRegion} />
        </section>
      </div>
    </div>
  );
}

export default CineSphereMainContainer;
