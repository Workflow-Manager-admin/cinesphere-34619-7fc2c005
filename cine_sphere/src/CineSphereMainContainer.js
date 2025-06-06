import React from "react";
import "./CineSphereMainContainer.css";

/**
 * PUBLIC_INTERFACE
 * CineSphereMainContainer displays seven feature columns for CineSphere,
 * each with a title, description, and placeholder for future API-driven components.
 */
function CineSphereMainContainer() {
  const features = [
    {
      name: "Movie Mood Matcher",
      description: "Type your mood and get a list of movies that match it.",
    },
    {
      name: "Guess the Movie Game (Poster Edition)",
      description: "View a blurred movie poster and guess the movie title.",
    },
    {
      name: "Hidden Gems Explorer",
      description: "Discover underrated or low-popularity movies with high ratings.",
    },
    {
      name: "Film Detective",
      description:
        "Enter clues like actor name, quote, or year to find the movie.",
    },
    {
      name: "Binge Planner",
      description:
        "Input available hours and get movie/TV show suggestions that fit exactly into that time.",
    },
    {
      name: "Regional Movie Explorer",
      description:
        "Filter and explore top-rated or rare movies by region or language.",
    },
    {
      name: "Scene Breakdown Visualizer",
      description:
        "Visualize how a scene is built, including mood, lighting, camera angles, and plot points.",
    },
  ];

  return (
    <div className="cinesphere-main-container">
      <h1 className="cinesphere-title">CineSphere</h1>
      <div className="cinesphere-feature-grid">
        {features.map((feature, idx) => (
          <div className="cinesphere-feature-col" key={feature.name}>
            <div className="cinesphere-feature-box">
              <h2 className="cinesphere-feature-title">{feature.name}</h2>
              <div className="cinesphere-feature-desc">
                {feature.description}
              </div>
              <div className="cinesphere-placeholder">
                <span>
                  {/* Placeholder for the interactive component */}
                  <strong>Coming Soon:</strong> {feature.name}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default CineSphereMainContainer;
