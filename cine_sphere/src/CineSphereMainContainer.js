import React from "react";
import "./CineSphereMainContainer.css";
import { searchMovies, getHiddenGems } from "./tmdbApi";

/**
 * PUBLIC_INTERFACE
 * CineSphereMainContainer displays six main regional industry columns (Hollywood, Bollywood, Kollywood, Tollywood, Sandalwood, Mollywood).
 * Each column vertically stacks all seven CineSphere features, parameterized by region/language.
 * All features fetch or filter movie data according to the given regional/language context.
 * 
 * Responsive layout: On large screens, columns appear side by side; on tablets and mobile, columns stack vertically.
 * 
 * Edits: Added inline explanatory comments and improved clarity for future maintainability.
 */

// -- Configuration for the six major regional columns --
const CINE_COLUMNS = [
  {
    key: "hollywood",
    label: "Hollywood",
    language: "en",
    regionLabel: "USA/English",
    tmdbRegions: { lang: "en", region: "US" },
  },
  {
    key: "bollywood",
    label: "Bollywood",
    language: "hi",
    regionLabel: "India/Hindi",
    tmdbRegions: { lang: "hi", region: "IN" },
  },
  {
    key: "kollywood",
    label: "Kollywood",
    language: "ta",
    regionLabel: "India/Tamil",
    tmdbRegions: { lang: "ta", region: "IN" },
  },
  {
    key: "tollywood",
    label: "Tollywood",
    language: "te",
    regionLabel: "India/Telugu",
    tmdbRegions: { lang: "te", region: "IN" },
  },
  {
    key: "sandalwood",
    label: "Sandalwood",
    language: "kn",
    regionLabel: "India/Kannada",
    tmdbRegions: { lang: "kn", region: "IN" },
  },
  {
    key: "mollywood",
    label: "Mollywood",
    language: "ml",
    regionLabel: "India/Malayalam",
    tmdbRegions: { lang: "ml", region: "IN" },
  },
];

// Minimal local wrappers: All feature components receive props { regionConfig }
function MovieMoodMatcher({ regionConfig }) {
  // Extend original: Pass correct language for search
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
    } catch (err) {
      setError("Failed to fetch movies.");
      setMovies([]);
    }
    setLoading(false);
  }
  return (
    <div style={{ width: "100%" }}>
      <form onSubmit={handleSearch} style={{ marginBottom: 12, width: "100%" }}>
        <input
          type="text"
          style={{
            padding: 7,
            fontSize: 15,
            borderRadius: 6,
            border: "1.5px solid #f394ff",
            width: "75%",
            marginRight: 6,
          }}
          placeholder={`Enter mood/genre (e.g., comedy)`}
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
              <li key={movie.id} style={{ marginBottom: 9, display: "flex", gap: 10, alignItems: "center" }}>
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

// --- Guess the Movie Game ---
// The game is the same logic, but uses the column's regionConfig.language for region-specific movie fetching
function GuessTheMovieGame({ regionConfig }) {
  const LEVELS = [
    { blur: 8, desc: "Popular", obscure: false, hintPenalty: 2 },
    { blur: 13, desc: "Less Popular", obscure: false, hintPenalty: 3 },
    { blur: 16, desc: "Hidden Gems", obscure: true, hintPenalty: 4 },
    { blur: 20, desc: "Obscure", obscure: true, hintPenalty: 5 },
  ];
  const MAX_LEVEL = 5;
  const INITIAL_SCORE = 0;

  const [level, setLevel] = React.useState(1);
  const [score, setScore] = React.useState(INITIAL_SCORE);
  const [round, setRound] = React.useState(1);

  const [movie, setMovie] = React.useState(null);
  const [guess, setGuess] = React.useState('');
  const [status, setStatus] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [reveal, setReveal] = React.useState(false);
  const [error, setError] = React.useState('');

  const [hintActor, setHintActor] = React.useState(false);
  const [hintYear, setHintYear] = React.useState(false);
  const [hintTitle, setHintTitle] = React.useState(false);
  const [hintActorValue, setHintActorValue] = React.useState('');
  const [hintTitleValue, setHintTitleValue] = React.useState('');
  const [hintYearValue, setHintYearValue] = React.useState('');

  const config = level <= LEVELS.length ? LEVELS[level-1] : LEVELS[LEVELS.length-1];

  function resetHints() {
    setHintActor(false); setHintTitle(false); setHintYear(false);
    setHintActorValue(''); setHintTitleValue(''); setHintYearValue('');
  }

  async function fetchGameMovie() {
    setLoading(true); setError(""); setReveal(false); setStatus(""); setGuess(""); resetHints();
    try {
      let found = null;
      if (config.obscure) {
        for (let tries = 0; tries < 5; tries++) {
          const gems = await getHiddenGems(Math.floor(Math.random() * 3) + 1, regionConfig.language);
          if (gems.length > 0) {
            found = gems[Math.floor(Math.random() * gems.length)];
            if (found.poster_path && found.title) break;
          }
        }
      } else {
        for (let tries = 0; tries < 5; tries++) {
          const page = Math.floor(Math.random() * 10) + 1;
          let lang = regionConfig.language;
          let apiUrl =
            `https://api.themoviedb.org/3/discover/movie?api_key=5bc67d3b06aecbd18121a3cbbc16eb59` +
            `&with_original_language=${lang}&with_language=${lang}&sort_by=popularity.desc` +
            `&include_adult=false&page=${page}`;
          const res = await fetch(apiUrl);
          if (!res.ok) throw new Error("Failed to load movie posters.");
          const data = await res.json();
          const posters = (data.results || []).filter(m =>
            m.poster_path && m.title && !m.adult && m.original_language === lang
          );
          if (posters.length > 0) {
            found = posters[Math.floor(Math.random() * posters.length)];
            break;
          }
        }
      }
      if (!found) throw new Error("Couldn't get a suitable poster. Try again!");
      setMovie(found);
    } catch (err) {
      setError("Could not get movie poster. Try again later.");
      setMovie(null);
    }
    setLoading(false);
  }

  React.useEffect(() => {
    fetchGameMovie();
    // eslint-disable-next-line
  }, [level, round]);

  function handleGuess(e) {
    e.preventDefault();
    if (!movie) return;
    function clean(s) { return s.replace(/\W/g, '').toLowerCase(); }
    if (clean(guess) === clean(movie.title)) {
      setStatus("success"); setReveal(true);
      const penalties = [hintActor, hintYear, hintTitle].filter(Boolean).length * config.hintPenalty;
      setScore(s => s + (5 - penalties));
    } else {
      setStatus("fail"); setReveal(false); setScore(s => s - 1);
    }
  }

  async function handleHintActor() {
    if (!movie || hintActor) return;
    setHintActor(true); setScore(s => s - config.hintPenalty);
    try {
      const url = `https://api.themoviedb.org/3/movie/${movie.id}/credits?api_key=5bc67d3b06aecbd18121a3cbbc16eb59`
        + `&with_language=${regionConfig.language}`;
      let res = await fetch(url);
      if (res.ok) {
        let data = await res.json();
        let lead = (data.cast && data.cast.length) ? data.cast[0].name : null;
        setHintActorValue(lead ? `Lead Actor: ${lead}` : "No lead actor found.");
      } else { setHintActorValue("No lead actor found."); }
    } catch { setHintActorValue("No lead actor found."); }
  }

  function handleHintYear() {
    if (!movie || hintYear) return;
    setHintYear(true); setScore(s => s - config.hintPenalty);
    setHintYearValue(
      movie.release_date
        ? `Release Year: ${movie.release_date.slice(0,4)}`
        : "Year unavailable."
    );
  }

  function handleHintTitle() {
    if (!movie || hintTitle) return;
    setHintTitle(true); setScore(s => s - config.hintPenalty);
    const wordSplit = movie.title.split(' ');
    if (movie.title.length >= 6) {
      const masked = wordSplit
        .map(w => {
          if (w.length < 3) return w;
          const visible = Math.ceil(w.length * 0.4);
          return w.slice(0, visible) + "_".repeat(w.length - visible);
        })
        .join(' ');
      setHintTitleValue(`Partial Title: ${masked}`);
    } else { setHintTitleValue("Partial title unavailable."); }
  }

  function handleGiveUp() {
    setReveal(true); setStatus(""); setScore(s => s - 3);
    if (!hintActor) handleHintActor();
    if (!hintYear) handleHintYear();
    if (!hintTitle) handleHintTitle();
  }

  function handleNextLevel() {
    setLevel(lvl => lvl + 1); setRound(r => r + 1);
    setMovie(null); setStatus(""); setGuess(""); setReveal(false); setError(""); resetHints();
  }

  function handleRestartGame() {
    setLevel(1); setRound(r => r + 1); setScore(INITIAL_SCORE);
    setMovie(null); setStatus(""); setGuess(""); setReveal(false); setError(""); resetHints();
  }

  function progressUI() {
    return (
      <div style={{
        display: "flex", alignItems: "center", gap: 14, width: "100%", marginBottom: 13, justifyContent: "center"
      }}>
        <span style={{
          background: "#f394ff", color: "#1f1f47", borderRadius: 8, padding: "2.5px 13px", fontWeight: 600
        }}>Level {level}</span>
        <div style={{
          background: "#eaeaea", borderRadius: 8, width: 100, height: 10, overflow: "hidden", border: "1px solid #f1e2fb"
        }}>
          <div style={{
            width: `${(level / MAX_LEVEL) * 100}%`,
            background: "#f394ff", height: "100%"
          }}></div>
        </div>
        <span style={{ fontWeight: 500, color: "#f394ff" }}>Score: {score}</span>
      </div>
    );
  }

  return (
    <div style={{ width: "100%", minHeight: 260, display: "flex", flexDirection: "column", alignItems: "center" }}>
      {progressUI()}
      {loading && (
        <div style={{ fontStyle: "italic", fontWeight: 500, color: "#8c42a8", margin: "22px 0" }}>Loading a mystery poster...</div>
      )}
      {error && (
        <div style={{ color: "#fff0ee", background: "#e34", borderRadius: 6, padding: "8px 12px", fontSize: "0.98rem", margin: "18px 0" }}>{error}</div>
      )}
      {!loading && movie && (
        <div style={{
          width: "100%", display: "flex", flexDirection: "column", alignItems: "center"
        }}>
          <div style={{ position: "relative", margin: "0 0 18px 0" }}>
            <img
              src={`https://image.tmdb.org/t/p/w342${movie.poster_path}`}
              alt="Guess the movie from this poster"
              width={120}
              height={160}
              style={{
                filter: reveal ? "none" : `blur(${config.blur}px) brightness(0.99) grayscale(0.07)`,
                borderRadius: "14px",
                boxShadow: !reveal ? "0 0 0 3px #f394ffcc, 0 3px 16px #1f1f4770" : "0 0 0 2px #8c42a8",
                border: "1.5px solid #f394ff",
                background: "#f6eaff",
                transition: "filter 0.35s cubic-bezier(.6,.8,.4,1)",
                objectFit: "cover",
              }}
            />
            {status === "success" && (
              <span style={{
                position: "absolute", left: 0, top: 0, width: "100%", height: "100%",
                borderRadius: "14px",
                background: "rgba(243, 148, 255, 0.82)",
                color: "#1f1f47", fontWeight: 700, fontSize: "1.13rem",
                display: "flex", justifyContent: "center", alignItems: "center",
                textShadow: "#fff 0 2px 8px",
                zIndex: 2,
              }}>
                🎉 Correct! <span style={{fontWeight:400, fontSize:"0.98rem", marginLeft:5}}>
                  [+{5 - [hintActor, hintYear, hintTitle].filter(Boolean).length * config.hintPenalty}]
                </span>
              </span>
            )}
            {status === "fail" && (
              <span style={{
                position: "absolute", left: 0, top: 0, width: "100%", height: "100%",
                borderRadius: "14px",
                background: "rgba(255,255,255,0.68)",
                color: "#de2072", fontWeight: 700, fontSize: "1.08rem",
                display: "flex", justifyContent: "center", alignItems: "center",
                zIndex: 2, textShadow: "#fff 0 2px 11px",
                border: "1.5px solid #de2072"
              }}>
                ❌ Try Again! [-1]
              </span>
            )}
            {reveal && status !== "success" && (
              <div style={{
                position: "absolute", left: 0, bottom: "-37px", width: "100%",
                color: "#1f1f47", fontWeight: 600, fontSize: "1.01rem",
                display: "flex", justifyContent: "center", alignItems: "center",
                textShadow: "#fff 0 2px 8px", background: "#f394ff33",
                borderRadius: "0 0 12px 12px", padding: "6px 0",
                zIndex: 2, borderTop: "1.5px solid #8c42a8"
              }}>
                🎬 <span style={{marginLeft: 5}}>{movie.title}</span>
              </div>
            )}
          </div>
          {!reveal && (
            <>
              <form onSubmit={handleGuess} style={{ width: "90%", display: "flex", alignItems: "center", marginBottom: 9 }}>
                <input
                  aria-label="Guess the movie title"
                  type="text"
                  style={{
                    padding: 8, fontSize: 15, borderRadius: 6, border: "1.5px solid #f394ff",
                    width: "70%", marginRight: 7, outline: status==="fail"?"2px solid #de2072":"none"
                  }}
                  placeholder="Type your guess…"
                  value={guess}
                  onChange={e => { setGuess(e.target.value); setStatus(""); }}
                  disabled={loading}
                  spellCheck={false}
                  autoComplete="off"
                />
                <button className="btn" style={{ padding: "8px 22px" }} type="submit" disabled={loading || !guess.trim()}>
                  Guess
                </button>
              </form>
              <div style={{ display: "flex", gap: "6px", marginTop: 6, marginBottom: 4, flexWrap: "wrap" }}>
                <button
                  type="button"
                  className="btn"
                  style={{ background: "#b8b8ff", color: "#1f1f47", fontSize: "0.97rem" }}
                  onClick={handleHintActor}
                  disabled={hintActor}
                  title="Reveal the lead actor"
                >
                  Lead Actor {hintActor && "✓"}
                </button>
                <button
                  type="button"
                  className="btn"
                  style={{ background: "#b8c2fd", color: "#1f1f47", fontSize: "0.97rem" }}
                  onClick={handleHintYear}
                  disabled={hintYear}
                  title="Reveal the release year"
                >
                  Release Year {hintYear && "✓"}
                </button>
                <button
                  type="button"
                  className="btn"
                  style={{ background: "#d7b3fa", color: "#1f1f47", fontSize: "0.97rem" }}
                  onClick={handleHintTitle}
                  disabled={hintTitle}
                  title="Show a partial version of the title"
                >
                  Partial Title {hintTitle && "✓"}
                </button>
              </div>
              <div>
                {hintActor && (
                  <div style={{
                    color: "#f394ff", background: "#f6eaff", border: "1.2px solid #f394ff60", borderRadius: 7, fontSize: "0.98rem", padding: "0.33em 0.8em",
                    marginBottom: 2
                  }}>{hintActorValue}</div>
                )}
                {hintYear && (
                  <div style={{
                    color: "#f394ff", background: "#eef4ff", border: "1.2px solid #b8c2fd", borderRadius: 7, fontSize: "0.98rem", padding: "0.33em 0.8em",
                    marginBottom: 2
                  }}>{hintYearValue}</div>
                )}
                {hintTitle && (
                  <div style={{
                    color: "#d7b3fa", background: "#f6eefb", border: "1.2px solid #d7b3fa66", borderRadius: 7, fontSize: "0.98rem", padding: "0.33em 0.8em",
                    marginBottom: 2
                  }}>{hintTitleValue}</div>
                )}
              </div>
              <button className="btn" style={{ background: "#f394ff", color: "#1f1f47", marginTop: 5, fontSize: "0.97rem" }} type="button" onClick={handleGiveUp}>
                Reveal Answer [-3]
              </button>
            </>
          )}
          {(reveal || status === "success") && (
            <>
              {level < MAX_LEVEL && (
                <button className="btn" style={{ background: "#1f1f47", color: "#f394ff", marginTop: 16, fontSize: "1.01rem" }} type="button" onClick={handleNextLevel}>
                  Next Level →
                </button>
              )}
              {level >= MAX_LEVEL && (
                <button className="btn" style={{ background: "#1f1f47", color: "#f394ff", marginTop: 16, fontSize: "1.01rem" }} type="button" onClick={handleRestartGame}>
                  Restart Game
                </button>
              )}
            </>
          )}
        </div>
      )}
      {!loading && !movie && !error && (
        <div style={{ marginTop: 24, padding: "16px 6px", color: "#f394ff" }}>
          No poster available.{" "}
          <button className="btn" style={{ marginLeft: 4 }} onClick={handleRestartGame}>
            Retry
          </button>
        </div>
      )}
    </div>
  );
}

// --- Hidden Gems Explorer ---
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
      .finally(() => {
        if (isMounted) setLoading(false);
      });
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
          <li key={gem.id} style={{ marginBottom: 9, display: "flex", alignItems: "center", gap: 10 }}>
            {gem.poster_path && (
              <img src={`https://image.tmdb.org/t/p/w92${gem.poster_path}`} width={38} height={54} alt="" style={{ borderRadius: 6, border: "1.5px solid #f394ff" }} />
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

// -- Placeholder features for coming soon + label
function PlaceholderFeature({ title }) {
  return (
    <div className="cinesphere-placeholder">
      <span>
        <strong>Coming Soon:</strong> {title}
      </span>
    </div>
  );
}

// --- CineSphere Column as one region ---
function CineSphereFeatureColumn({ regionConfig }) {
  return (
    <div className="cinesphere-feature-col sixcol">
      <div className="cinesphere-feature-col-header">
        <div className="cinesphere-feature-region-label">{regionConfig.label}</div>
        <div className="cinesphere-feature-region-sub">{regionConfig.regionLabel}</div>
      </div>
      <div className="cinesphere-feature-box">
        <h2 className="cinesphere-feature-title">Movie Mood Matcher</h2>
        <div className="cinesphere-feature-desc">
          Type your mood and get {regionConfig.label.toLowerCase()} matches.
        </div>
        <MovieMoodMatcher regionConfig={regionConfig} />
      </div>
      <div className="cinesphere-feature-box">
        <h2 className="cinesphere-feature-title">Guess the Movie Game</h2>
        <div className="cinesphere-feature-desc">
          Blurred poster: guess the {regionConfig.label} movie title!
        </div>
        <GuessTheMovieGame regionConfig={regionConfig} />
      </div>
      <div className="cinesphere-feature-box">
        <h2 className="cinesphere-feature-title">Hidden Gems Explorer</h2>
        <div className="cinesphere-feature-desc">
          Discover underrated {regionConfig.label} movies.
        </div>
        <HiddenGemsExplorer regionConfig={regionConfig} />
      </div>
      <div className="cinesphere-feature-box">
        <h2 className="cinesphere-feature-title">Film Detective</h2>
        <div className="cinesphere-feature-desc">
          Enter clues like actor name, quote, or year to find the {regionConfig.label} movie.
        </div>
        <PlaceholderFeature title="Film Detective" />
      </div>
      <div className="cinesphere-feature-box">
        <h2 className="cinesphere-feature-title">Binge Planner</h2>
        <div className="cinesphere-feature-desc">
          Plan your {regionConfig.label} movie or TV marathon.
        </div>
        <PlaceholderFeature title="Binge Planner" />
      </div>
      <div className="cinesphere-feature-box">
        <h2 className="cinesphere-feature-title">Regional Movie Explorer</h2>
        <div className="cinesphere-feature-desc">
          Explore top {regionConfig.label} picks and rare finds.
        </div>
        <PlaceholderFeature title="Regional Movie Explorer" />
      </div>
      <div className="cinesphere-feature-box">
        <h2 className="cinesphere-feature-title">Scene Breakdown Visualizer</h2>
        <div className="cinesphere-feature-desc">
          Visualize iconic scenes from {regionConfig.label} movies.
        </div>
        <PlaceholderFeature title="Scene Breakdown Visualizer" />
      </div>
    </div>
  );
}

/**
 * PUBLIC_INTERFACE
 * CineSphereMainContainer
 * If selectedRegion prop is set, only show the features column for that single region (stacked UX).
 * If not set, show the original grid for all regions (legacy/demo).
 */
function CineSphereMainContainer({ selectedRegion }) {
  return (
    <div className="cinesphere-main-container">
      <h1 className="cinesphere-title">CineSphere</h1>
      {selectedRegion ? (
        <div style={{ display: "flex", justifyContent: "center" }}>
          <CineSphereFeatureColumn regionConfig={selectedRegion} />
        </div>
      ) : (
        <div className="cinesphere-feature-grid sixcol-grid">
          {CINE_COLUMNS.map(regionConfig => (
            <CineSphereFeatureColumn
              key={regionConfig.key}
              regionConfig={regionConfig}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default CineSphereMainContainer;
