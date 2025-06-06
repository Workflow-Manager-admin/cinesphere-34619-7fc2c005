import React from "react";
import "./CineSphereMainContainer.css";
import { searchMovies, getHiddenGems } from "./tmdbApi";

/**
 * PUBLIC_INTERFACE
 * CineSphereMainContainer - shows chosen region only, and inside: two horizontally-arranged rows with clear labels.
 * - 'What to watch' (4 features): Hidden Gems Explorer, Movie Mood Matcher, Regional Movie Explorer, Binge Planner
 * - 'Games' (2 features): Film Detective, Guess the Movie Game
 * Each feature is in a horizontally arranged box. All others are removed.
 * Responsive Flex styling; legacy multi-region layout is removed.
 */

// ---- Minimal Feature Components ----

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
  // For brevity: minimal demo logic, reused from earlier version
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
  const [gems, setGems] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState("");
  React.useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError("");
    getHiddenGems(1, regionConfig.language)
      .then(res => {
        if (isMounted) setGems(res.slice(0, 6));
      })
      .catch(() => {
        if (isMounted) setError("Failed to load hidden gems.");
      })
      .finally(() => { if (isMounted) setLoading(false); });
    return () => { isMounted = false; };
  }, [regionConfig.language]);
  return (
    <div style={{ width: "100%" }}>
      {loading && <div style={{ fontStyle: "italic" }}>Loading...</div>}
      {error && (
        <div style={{ color: "#fff0ee", background: "#e34", borderRadius: 6, padding: "6px 8px", fontSize: "0.98rem" }}>{error}</div>
      )}
      <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
        {gems.map(gem => (
          <li key={gem.id} style={{ marginBottom: 7, display: "flex", alignItems: "center", gap: 10 }}>
            {gem.poster_path && (
              <img src={`https://image.tmdb.org/t/p/w92${gem.poster_path}`} width={34} height={48} alt="" style={{ borderRadius: 6, border: "1.5px solid #f394ff" }} />
            )}
            <span style={{ fontWeight: 500 }}>{gem.title}</span>
            <span style={{ color: "#f394ff", fontSize: 13, marginLeft: 3 }}>★ {gem.vote_average?.toFixed(1)}</span>
            <span style={{ color: "#aaaac1", fontSize: 13 }}>{gem.release_date ? `(${gem.release_date.slice(0, 4)})` : ""}</span>
          </li>
        ))}
      </ul>
      {!loading && !error && gems.length === 0 && (
        <div className="cinesphere-placeholder">
          <span>
            Find hidden gems: Low-popularity, high-rated {regionConfig.label} movies!
          </span>
        </div>
      )}
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

// ---- Layout Rows ----

function FeatureBox({ title, desc, children }) {
  return (
    <div className="cinesphere-feature-rowbox">
      <h2 className="cinesphere-feature-row-title">{title}</h2>
      <div className="cinesphere-feature-row-desc">{desc}</div>
      <div>{children}</div>
    </div>
  );
}

function WhatToWatchRow({ regionConfig }) {
  return (
    <div className="cinesphere-row-list">
      <FeatureBox
        title="Hidden Gems Explorer"
        desc={`Discover underrated ${regionConfig.label} movies.`}
      ><HiddenGemsExplorer regionConfig={regionConfig} /></FeatureBox>

      <FeatureBox
        title="Movie Mood Matcher"
        desc={`Type your mood and get ${regionConfig.label.toLowerCase()} matches.`}
      ><MovieMoodMatcher regionConfig={regionConfig} /></FeatureBox>

      <FeatureBox
        title="Regional Movie Explorer"
        desc={`Explore top ${regionConfig.label} picks and rare finds.`}
      ><PlaceholderFeature title="Regional Movie Explorer" /></FeatureBox>

      <FeatureBox
        title="Binge Planner"
        desc={`Plan your ${regionConfig.label} movie or TV marathon.`}
      ><PlaceholderFeature title="Binge Planner" /></FeatureBox>
    </div>
  );
}

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

// ---- Main Container ----
function CineSphereMainContainer({ selectedRegion }) {
  // Default: assume region selection is done
  if (!selectedRegion) return <div className="cinesphere-main-container" style={{paddingTop:60}}><div>No region selected.</div></div>;

  return (
    <div className="cinesphere-main-container">
      <div className="cinesphere-region-title-label">
        <span className="cinesphere-region-main">{selectedRegion.label}</span>
        <span className="cinesphere-region-sub">{selectedRegion.regionLabel}</span>
      </div>
      <div className="cinesphere-main-horiz">
        <section className="cinesphere-horiz-section">
          <div className="cinesphere-row-label">What to watch</div>
          <WhatToWatchRow regionConfig={selectedRegion} />
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
