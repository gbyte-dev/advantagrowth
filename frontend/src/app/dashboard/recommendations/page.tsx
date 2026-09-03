"use client";

import {
  useCallback,
  useEffect,
  useState,
} from "react";
import api from "@/lib/axios";
import {
  showError,
  showSuccess,
} from "@/lib/feedback";

type RecommendationCategory =
  | "Operations"
  | "Menu"
  | "Marketing"
  | "Inventory";

type Recommendation = {
  id: number;
  title: string;
  category: RecommendationCategory;
  priority: "high" | "medium" | "low";
  confidence: number;
  description: string;
  problem: string;
  solution: string;
  expected_impact: string;
  status: string;
  icon: string;
  accent:
    | "orange"
    | "green"
    | "purple"
    | "blue";
};

type ApiRecommendation = Omit<
  Recommendation,
  "icon" | "accent"
>;

type RecommendationGeneration = {
  id: number;
  status: string;
  period_start: string;
  period_end: string;
  model: string;
  generated_at: string | null;

  summary: {
    headline: string;
    overview: string;
    focus_area: string;
  };

  recommendations:
    ApiRecommendation[];
};

type RecommendationIndexResponse = {
  success: boolean;
  message: string;

  data: {
    generation:
      | RecommendationGeneration
      | null;

    latest_attempt: {
      id: number;
      status: string;
      generated_at: string | null;
      failed_at: string | null;
      failure_reason: string | null;
      created_at: string;
    } | null;
  };
};

type RecommendationGenerateResponse = {
  success: boolean;
  message: string;

  data: {
    generation:
      RecommendationGeneration;
  };
};

/*
|--------------------------------------------------------------------------
| API error message
|--------------------------------------------------------------------------
*/

function getErrorMessage(
  error: unknown,
  fallback: string
): string {
  if (
    typeof error === "object" &&
    error !== null &&
    "response" in error
  ) {
    const responseError =
      error as {
        response?: {
          data?: {
            message?: string;
          };
        };
      };

    return (
      responseError.response
        ?.data?.message ||
      fallback
    );
  }

  if (error instanceof Error) {
    return error.message;
  }

  return fallback;
}

/*
|--------------------------------------------------------------------------
| Category design
|--------------------------------------------------------------------------
|
| Backend icon/accent return nahi karta.
| UI category ke according icon aur colour decide karti hai.
|
*/

function getCategoryDesign(
  category: RecommendationCategory
): {
  icon: string;
  accent:
    | "orange"
    | "green"
    | "purple"
    | "blue";
} {
  if (category === "Menu") {
    return {
      icon:
        "fa-arrow-trend-up",
      accent:
        "green",
    };
  }

  if (category === "Marketing") {
    return {
      icon:
        "fa-users",
      accent:
        "purple",
    };
  }

  if (category === "Inventory") {
    return {
      icon:
        "fa-boxes-stacked",
      accent:
        "blue",
    };
  }

  return {
    icon:
      "fa-chart-line",
    accent:
      "orange",
  };
}

/*
|--------------------------------------------------------------------------
| Convert API recommendation into UI recommendation
|--------------------------------------------------------------------------
*/

function prepareRecommendation(
  item: ApiRecommendation
): Recommendation {
  const design =
    getCategoryDesign(
      item.category
    );

  return {
    ...item,
    icon:
      design.icon,
    accent:
      design.accent,
  };
}

export default function RecommendationsPage() {
  const [
    recommendations,
    setRecommendations,
  ] =
    useState<Recommendation[]>(
      []
    );

  const [loading, setLoading] =
    useState(true);

  const [generating, setGenerating] =
    useState(false);

  const [error, setError] =
    useState("");

  /*
  |--------------------------------------------------------------------------
  | Load latest saved recommendations
  |--------------------------------------------------------------------------
  |
  | Ye request sirf database se data lati hai.
  | Isse Gemini quota use nahi hota.
  |
  */

  const loadRecommendations =
    useCallback(async () => {
      try {
        setLoading(true);
        setError("");

        const response =
          await api.get<RecommendationIndexResponse>(
            "/owner/recommendations"
          );

        const items =
          response.data.data
            ?.generation
            ?.recommendations ||
          [];

        setRecommendations(
          items.map(
            prepareRecommendation
          )
        );
      } catch (requestError) {
        const message =
          getErrorMessage(
            requestError,
            "Unable to load recommendations."
          );

        setError(message);
      } finally {
        setLoading(false);
      }
    }, []);

  useEffect(() => {
    loadRecommendations();
  }, [loadRecommendations]);

  /*
  |--------------------------------------------------------------------------
  | Generate new recommendations
  |--------------------------------------------------------------------------
  |
  | Sirf is button par Gemini API call hoti hai.
  |
  */

  const handleGenerate =
    async () => {
      if (generating) {
        return;
      }

      try {
        setGenerating(true);
        setError("");

        const response =
          await api.post<RecommendationGenerateResponse>(
            "/owner/recommendations/generate"
          );

        const generated =
        response.data.data
          ?.generation;

        const items =
          generated
            ?.recommendations ||
          [];

        setRecommendations(
          items.map(
            prepareRecommendation
          )
        );

        showSuccess(
          response.data.message ||
            "AI recommendations generated successfully."
        );
      } catch (requestError) {
        const message =
          getErrorMessage(
            requestError,
            "Unable to generate AI recommendations."
          );

        setError(message);
        showError(message);
      } finally {
        setGenerating(false);
      }
    };

  return (
    <div className="recommendations-page">
      <div className="recommendations-container">
        {/* PAGE HEADER */}

        <div className="recommendations-header">
          <div>
            <h1>
              Recommendations
            </h1>

            <p>
              Data-backed recommendations
              generated from your
              restaurant&apos;s real
              performance data.
            </p>
          </div>

          <button
            type="button"
            className="recommendations-generate-btn"
            onClick={
              handleGenerate
            }
            disabled={
              generating ||
              loading
            }
          >
            {generating ? (
              <>
                <i className="fas fa-spinner fa-spin" />
                Generating...
              </>
            ) : (
              <>
                <i className="fas fa-wand-magic-sparkles" />
                Generate New
              </>
            )}
          </button>
        </div>

        {/* ERROR */}

        {error && (
          <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
            <div className="flex items-start gap-3">
              <i className="fas fa-circle-exclamation mt-1 text-red-600" />

              <div>
                <p className="m-0 text-sm font-semibold text-red-800">
                  {error}
                </p>

                {!recommendations.length && (
                  <button
                    type="button"
                    onClick={
                      loadRecommendations
                    }
                    className="mt-3 rounded-lg bg-red-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-red-700"
                  >
                    Try Again
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* LIST */}

        <div className="recommendations-list">
          {loading ? (
            <div className="recommendations-empty">
              <div>
                <i className="fas fa-spinner fa-spin" />
              </div>

              <h3>
                Loading recommendations
              </h3>

              <p>
                Fetching your latest saved
                AI recommendations.
              </p>
            </div>
          ) : recommendations.length ===
            0 ? (
            <div className="recommendations-empty">
              <div>
                <i className="fas fa-lightbulb" />
              </div>

              <h3>
                No recommendations yet
              </h3>

              <p>
                Generate new recommendations
                to see insights here.
              </p>
            </div>
          ) : (
            recommendations.map(
              (item) => (
                <article
                  key={item.id}
                  className="recommendation-card"
                >
                  <div
                    className={`recommendation-main-icon recommendation-main-icon-${item.accent}`}
                  >
                    <i
                      className={`fas ${item.icon}`}
                    />
                  </div>

                  <div className="recommendation-card-body">
                    <div className="recommendation-heading">
                      <h2>
                        {item.title}
                      </h2>

                      <span
                        className={`recommendation-category category-${item.category.toLowerCase()}`}
                      >
                        {
                          item.category
                        }
                      </span>
                    </div>

                    <p className="recommendation-description">
                      {
                        item.description
                      }
                    </p>

                    <div className="recommendation-ps">
                      <div className="recommendation-ps-block recommendation-ps-problem">
                        <span className="recommendation-ps-label">
                          <i className="fas fa-circle-exclamation" />
                          Problem
                        </span>

                        <p>
                          {item.problem}
                        </p>
                      </div>

                      <div className="recommendation-ps-block recommendation-ps-solution">
                        <span className="recommendation-ps-label">
                          <i className="fas fa-lightbulb" />
                          Solution
                        </span>

                        <p>
                          {item.solution}
                        </p>
                      </div>
                    </div>
                  </div>
                </article>
              )
            )
          )}
        </div>
      </div>
    </div>
  );
}