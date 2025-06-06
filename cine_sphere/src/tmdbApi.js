//
// PUBLIC_INTERFACE
// tmdbApi.js - Minimal utility for interacting with The Movie Database (TMDb) API from frontend.
// DO NOT hardcode or expose the API key in any repo meant for production. Here, it's directly referenced for demo/development per requirements.
//
const TMDB_API_URL = "https://api.themoviedb.org/3";
const TMDB_API_KEY = "5bc67d3b06aecbd18121a3cbbc16eb59";

/**
 * PUBLIC_INTERFACE
 * searchMovies - Search for movies by a query (e.g., for mood-based searching).
 * If Tamil (Kollywood), use discover fallback with genre mapping if normal search yields no results.
 * @param {string} query         // user mood or genre etc.
 * @param {number} page
 * @param {string} language      // language code (e.g. "en", "hi", "ta", "te", "kn", "ml")
 * @param {string} region        // region/country code (e.g., "US", "IN"), optional
 * @return {Promise<Array>} List of movie objects (filtered for given language)
 *
 * PUBLIC_INTERFACE
 */
export async function searchMovies(query, page = 1, language = "ta", region = "IN") {
    // NOTE: TMDb 'search/movie' does NOT support &with_original_language=<code>, that's only for 'discover'.
    // Use only &language and &region params; post-filter results for original_language.
    const url = `${TMDB_API_URL}/search/movie?api_key=${TMDB_API_KEY}` +
        `&query=${encodeURIComponent(query)}` +
        `&page=${page}` +
        `&language=${language}` +
        `&region=${region}` +
        `&include_adult=false`;

    try {
        const res = await fetch(url);
        if (!res.ok) throw new Error("TMDb searchMovies failed");
        const data = await res.json();

        // Filter strictly for original_language (post-filter on client; required for Tamil etc.)
        let results = (data.results || []).filter(
            m => m && m.original_language && m.original_language.toLowerCase() === language.toLowerCase()
        );
        // Fallback: If no results AND Tamil (Kollywood), try discover fallback with genre mapping.
        if (results.length === 0 && language.toLowerCase() === "ta") {
            // Try genre-mapping fallback for "mood"
            const mappedGenreId = getKollywoodGenreIdFromMood(query);
            if (mappedGenreId) {
                // Use TMDb discover endpoint for Tamil movies of that genre
                const discoverUrl = `${TMDB_API_URL}/discover/movie?api_key=${TMDB_API_KEY}` +
                    `&with_genres=${mappedGenreId}` +
                    `&sort_by=popularity.desc` +
                    `&with_original_language=ta` +
                    `&language=ta` +
                    `&region=IN` +
                    `&page=${page}` +
                    `&include_adult=false`;
                const discoverRes = await fetch(discoverUrl);
                if (discoverRes.ok) {
                    const discoverData = await discoverRes.json();
                    results = (discoverData.results || []).filter(
                        m => m && m.original_language && m.original_language.toLowerCase() === "ta"
                    );
                }
            }
        }
        return results;
    } catch (err) {
        // fallback mechanism inside UI if required
        return [];
    }
}

/**
 * Maps a mood (string) to a TMDb genre ID appropriate for Kollywood films.
 * Returns null if no mapping possible.
 * Uses best-effort mapping based on mood genre intuition.
 */
function getKollywoodGenreIdFromMood(query) {
    if (!query || typeof query !== "string") return null;
    const norm = query.trim().toLowerCase();
    // Common Kollywood-genre mood mappings; expand with more as needed.
    // TMDb genre IDs: https://developer.themoviedb.org/docs/genre-movie-list
    const genreMap = {
        happy: 35,        // Comedy
        comedy: 35,
        funny: 35,
        romance: 10749,   // Romance
        love: 10749,
        romantic: 10749,
        action: 28,       // Action
        adventure: 12,    // Adventure
        suspense: 53,     // Thriller
        thriller: 53,
        drama: 18,        // Drama
        emotional: 18,
        crime: 80,        // Crime
        mystery: 9648,    // Mystery
        family: 10751,    // Family
        horror: 27,       // Horror
        scary: 27,
        fantasy: 14,      // Fantasy
        musical: 10402,   // Music
        music: 10402,
        war: 10752,       // War
        history: 36,      // History
        science: 878,     // Science Fiction
        sci: 878,
        "sci-fi": 878
    };
    // If multiple words, pick first matching (splits by whitespace)
    const words = norm.split(/\s+/);
    for (let i = 0; i < words.length; i++) {
        if (genreMap[words[i]]) return genreMap[words[i]];
    }
    // If full first word not there, fallback on partial match (substring)
    for (let key in genreMap) {
        if (norm.includes(key)) return genreMap[key];
    }
    return null;
}

/**
 * PUBLIC_INTERFACE
 * getHiddenGems - Fetch movies that are lesser known (low pop.) but highly rated.
 * For demo, TMDb discover endpoint with filters.
 * @param {number} page
 * @param {string} region - "en" for Hollywood, "ta" for Kollywood (default "ta")
 * @return {Promise<Array>} List of hidden gem movies
 */
export async function getHiddenGems(page = 1, region = "ta") {
    // Criteria: low popularity, high vote avg, min vote count to filter junk
    const lang = region === "en" ? "en" : "ta";
    const url = `${TMDB_API_URL}/discover/movie?api_key=${TMDB_API_KEY}`
        + `&sort_by=vote_average.desc`
        + `&vote_count.gte=50`
        + `&vote_average.gte=7`
        + `&with_original_language=${lang}`
        + `&popularity.lte=10`
        + `&with_language=${lang}`
        + `&page=${page}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error("TMDb getHiddenGems failed");
    const data = await res.json();
    // Filter to ensure original language is correct
    return (data.results || []).filter(m => m.original_language === lang);
}
