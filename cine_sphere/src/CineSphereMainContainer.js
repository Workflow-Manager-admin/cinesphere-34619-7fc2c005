import React, { useState } from "react";
import "./CineSphereMainContainer.css";
import { searchMovies, getHiddenGems } from "./tmdbApi";

/**
 * PUBLIC_INTERFACE
 * CineSphereMainContainer displays seven feature columns for CineSphere,
 * now integrating TMDb API for "Movie Mood Matcher" and "Hidden Gems Explorer".
 */

function MovieMoodMatcher() {
  const [query, setQuery] = useState("");
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSearch(e) {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    setError("");
    try {
      const res = await searchMovies(query.trim());
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
          placeholder="Enter your mood or genre (e.g., 'happy', 'thriller')"
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
              Try a mood keyword &mdash; Get instant movie suggestions!
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * PUBLIC_INTERFACE
 * GuessTheMovieGame - Interactive game to guess a TMDb movie from a blurred poster.
 */
function GuessTheMovieGame() {
  const [movie, setMovie] = React.useState(null); // { poster_path, title }
  const [guess, setGuess] = React.useState("");
  const [status, setStatus] = React.useState(""); // "success" | "fail" | ""
  const [loading, setLoading] = React.useState(false);
  const [reveal, setReveal] = React.useState(false);
  const [error, setError] = React.useState("");
  const [requestId, setRequestId] = React.useState(0);

  // Fetches a random popular movie with poster
  async function fetchRandomMovie() {
    setLoading(true);
    setError("");
    setReveal(false);
    setStatus("");
    setGuess("");
    try {
      // Try up to 5 times to get a poster
      let found = null;
      for (let tries = 0; tries < 5; tries++) {
        // Grab a random page (TMDb allows 1-500 for popularity): randomizing increases randomness
        const page = Math.floor(Math.random() * 30) + 1;
        const url = `https://api.themoviedb.org/3/movie/popular?api_key=5bc67d3b06aecbd18121a3cbbc16eb59&page=${page}`;
        const res = await fetch(url);
        if (!res.ok) throw new Error("Failed to load movie posters.");
        const data = await res.json();
        const posters = data.results.filter(m => m.poster_path && m.title && !m.adult);
        if (posters.length > 0) {
          found = posters[Math.floor(Math.random() * posters.length)];
          break;
        }
      }
      if (!found) throw new Error("No poster found. Try again!");
      setMovie(found);
    } catch (err) {
      setError("Could not get movie poster. Try again later.");
      setMovie(null);
    }
    setLoading(false);
  }

  React.useEffect(() => {
    fetchRandomMovie();
    // Dependency "requestId" allows user to restart round.
    // eslint-disable-next-line
  }, [requestId]);

  function handleGuess(e) {
    e.preventDefault();
    if (!movie) return;
    // Fuzzy match: case-insensitive, ignore punctuation, whitespace
    function clean(s) {
      return s.replace(/\W/g, '').toLowerCase();
    }
    if (clean(guess) === clean(movie.title)) {
      setStatus("success");
      setReveal(true);
    } else {
      setStatus("fail");
      setReveal(false);
    }
  }

  function handleGiveUp() {
    setReveal(true);
    setStatus("");
  }

  function handleRestart() {
    setMovie(null);
    setRequestId(prev => prev + 1);
    setStatus("");
    setGuess("");
    setReveal(false);
    setError("");
  }

  return (
    <div style={{ width: "100%", minHeight: 260, display: "flex", flexDirection: "column", alignItems: "center" }}>
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
              width={170}
              height={240}
              style={{
                filter: reveal ? "none" : "blur(16px) brightness(0.97) grayscale(0.07)",
                borderRadius: "14px",
                boxShadow: !reveal ? "0 0 0 3px #f394ffcc, 0 3px 16px #1f1f4770" : "0 0 0 2px #8c42a8",
                border: "1.5px solid #f394ff",
                background: "#f6eaff",
                transition: "filter 0.4s cubic-bezier(.6,.8,.4,1)",
                objectFit: "cover",
              }}
            />
            {/* Overlay success/fail */}
            {status === "success" && (
              <span style={{
                position: "absolute", left: 0, top: 0, width: "100%", height: "100%",
                borderRadius: "14px",
                background: "rgba(243, 148, 255, 0.78)",
                color: "#1f1f47", fontWeight: 700, fontSize: "1.4rem",
                display: "flex", justifyContent: "center", alignItems: "center",
                textShadow: "#fff 0 2px 8px",
                zIndex: 2,
              }}>
                🎉 Correct!
              </span>
            )}
            {status === "fail" && (
              <span style={{
                position: "absolute", left: 0, top: 0, width: "100%", height: "100%",
                borderRadius: "14px",
                background: "rgba(255,255,255,0.68)",
                color: "#de2072", fontWeight: 700, fontSize: "1.1rem",
                display: "flex", justifyContent: "center", alignItems: "center",
                zIndex: 2, textShadow: "#fff 0 2px 11px",
                border: "1.5px solid #de2072"
              }}>
                ❌ Try Again!
              </span>
            )}
            {/* Show the answer if revealed but not a win */}
            {reveal && status !== "success" && (
              <div style={{
                position: "absolute", left: 0, bottom: "-37px", width: "100%",
                color: "#1f1f47", fontWeight: 600, fontSize: "1.17rem",
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
          )}
          {!reveal && (
            <button className="btn" style={{ background: "#f394ff", color: "#1f1f47", marginTop: 4, fontSize: "0.97rem" }} type="button" onClick={handleGiveUp}>
              Reveal Answer
            </button>
          )}
          {(reveal || status === "success") && (
            <button className="btn" style={{ background: "#1f1f47", color: "#f394ff", marginTop: 16, fontSize: "1.01rem" }} type="button" onClick={handleRestart}>
              Play Again
            </button>
          )}
        </div>
      )}
      {!loading && !movie && !error && (
        <div style={{ marginTop: 24, padding: "16px 6px", color: "#f394ff" }}>No poster available. <button className="btn" style={{marginLeft: 4}} onClick={handleRestart}>Retry</button></div>
      )}
    </div>
  );
}

// Hidden Gems Explorer demo: show low-popularity, high-rated movies
function HiddenGemsExplorer() {
  const [gems, setGems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  // Only fetch once when opened
  React.useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError("");
    getHiddenGems()
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
  }, []);
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
            Find real hidden gems: Low-popularity, high-rated movies from TMDb!
          </span>
        </div>
      )}
    </div>
  );
}

function CineSphereMainContainer() {
  // Column order and labeling is preserved from the original design.
  return (
    <div className="cinesphere-main-container">
      <h1 className="cinesphere-title">CineSphere</h1>
      <div className="cinesphere-feature-grid">
        {/* Movie Mood Matcher */}
        <div className="cinesphere-feature-col">
          <div className="cinesphere-feature-box">
            <h2 className="cinesphere-feature-title">Movie Mood Matcher</h2>
            <div className="cinesphere-feature-desc">
              Type your mood and get a list of movies that match it.
            </div>
            <MovieMoodMatcher />
          </div>
        </div>
        {/* Guess the Movie Game */}
        <div className="cinesphere-feature-col">
          <div className="cinesphere-feature-box">
            <h2 className="cinesphere-feature-title">Guess the Movie Game (Poster Edition)</h2>
            <div className="cinesphere-feature-desc">
              View a blurred movie poster and guess the movie title.
            </div>
            <GuessTheMovieGame />
          </div>
        </div>
        {/* Hidden Gems Explorer */}
        <div className="cinesphere-feature-col">
          <div className="cinesphere-feature-box">
            <h2 className="cinesphere-feature-title">Hidden Gems Explorer</h2>
            <div className="cinesphere-feature-desc">
              Discover underrated or low-popularity movies with high ratings.
            </div>
            <HiddenGemsExplorer />
          </div>
        </div>
        {/* Film Detective */}
        <div className="cinesphere-feature-col">
          <div className="cinesphere-feature-box">
            <h2 className="cinesphere-feature-title">Film Detective</h2>
            <div className="cinesphere-feature-desc">
              Enter clues like actor name, quote, or year to find the movie.
            </div>
            <div className="cinesphere-placeholder">
              <span>
                <strong>Coming Soon:</strong> Film Detective
              </span>
            </div>
          </div>
        </div>
        {/* Binge Planner */}
        <div className="cinesphere-feature-col">
          <div className="cinesphere-feature-box">
            <h2 className="cinesphere-feature-title">Binge Planner</h2>
            <div className="cinesphere-feature-desc">
              Input available hours and get movie/TV show suggestions that fit exactly into that time.
            </div>
            <div className="cinesphere-placeholder">
              <span>
                <strong>Coming Soon:</strong> Binge Planner
              </span>
            </div>
          </div>
        </div>
        {/* Regional Movie Explorer */}
        <div className="cinesphere-feature-col">
          <div className="cinesphere-feature-box">
            <h2 className="cinesphere-feature-title">Regional Movie Explorer</h2>
            <div className="cinesphere-feature-desc">
              Filter and explore top-rated or rare movies by region or language.
            </div>
            <div className="cinesphere-placeholder">
              <span>
                <strong>Coming Soon:</strong> Regional Movie Explorer
              </span>
            </div>
          </div>
        </div>
        {/* Scene Breakdown Visualizer */}
        <div className="cinesphere-feature-col">
          <div className="cinesphere-feature-box">
            <h2 className="cinesphere-feature-title">Scene Breakdown Visualizer</h2>
            <div className="cinesphere-feature-desc">
              Visualize how a scene is built, including mood, lighting, camera angles, and plot points.
            </div>
            <div className="cinesphere-placeholder">
              <span>
                <strong>Coming Soon:</strong> Scene Breakdown Visualizer
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CineSphereMainContainer;
