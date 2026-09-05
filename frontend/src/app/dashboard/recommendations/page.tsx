"use client";

import {
  useCallback,
  useEffect,
  useMemo,
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

type RecommendationPriority =
  | "high"
  | "medium"
  | "low";

type RecommendationFeedbackValue =
  | "useful"
  | "not_useful";

type Recommendation = {
  id: number;
  title: string;
  category: RecommendationCategory;
  priority: RecommendationPriority;
  confidence: number;
  description: string;
  problem: string;
  solution: string;
  expected_impact: string;
  status: string;

  user_feedback:
  | RecommendationFeedbackValue
  | null;
};

type RecommendationGeneration = {
  id: number;
  status: string;
  period_start: string;
  period_end: string;
  model: string;
  generated_at: string | null;

  recommendations: Recommendation[];
};

type Pagination = {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  has_more: boolean;
};

type RecommendationIndexResponse = {
  success: boolean;
  message: string;

  data: {
    generation:
    | RecommendationGeneration
    | null;

    generations:
    RecommendationGeneration[];

    pagination:
    Pagination;

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

type SelectedRecommendation = {
  generationId: number;
  recommendationId: number;
};

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

function formatDate(
  value: string | null
): string {
  if (!value) {
    return "Not available";
  }

  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return value;
  }

  return new Intl.DateTimeFormat(
    "en-GB",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }
  ).format(date);
}

function categoryDesign(
  category: RecommendationCategory
): {
  icon: string;
  iconClasses: string;
  badgeClasses: string;
} {
  if (category === "Menu") {
    return {
      icon: "fa-utensils",

      iconClasses:
        "bg-emerald-100 text-emerald-700",

      badgeClasses:
        "bg-emerald-50 text-emerald-700",
    };
  }

  if (category === "Marketing") {
    return {
      icon: "fa-bullhorn",

      iconClasses:
        "bg-violet-100 text-violet-700",

      badgeClasses:
        "bg-violet-50 text-violet-700",
    };
  }

  if (category === "Inventory") {
    return {
      icon:
        "fa-boxes-stacked",

      iconClasses:
        "bg-blue-100 text-blue-700",

      badgeClasses:
        "bg-blue-50 text-blue-700",
    };
  }

  return {
    icon:
      "fa-chart-line",

    iconClasses:
      "bg-orange-100 text-orange-700",

    badgeClasses:
      "bg-orange-50 text-orange-700",
  };
}

function RecommendationDetails({
  data,
  saving,
  onFeedback,
}: {
  data: {
    generation: RecommendationGeneration;
    recommendation: Recommendation;
  } | null;

  saving: boolean;

  onFeedback: (
    recommendationId: number,
    value:
      RecommendationFeedbackValue
  ) => Promise<void>;
}) {
  if (!data) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center">
        <i className="fas fa-arrow-pointer text-3xl text-slate-300" />

        <p className="mt-3 text-sm text-slate-500">
          Select a recommendation to view its details.
        </p>
      </div>
    );
  }

  const priorityClasses =
    data.recommendation.priority ===
      "high"
      ? "bg-red-50 text-red-700"
      : data.recommendation
        .priority ===
        "medium"
        ? "bg-amber-50 text-amber-700"
        : "bg-slate-100 text-slate-700";

  return (
    <>
      {/* Selected recommendation */}

      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <p className="text-xs font-bold uppercase tracking-wider text-violet-600">
          Selected Recommendation
        </p>

        <h2 className="mt-2 text-lg font-bold leading-6 text-slate-900">
          {
            data.recommendation
              .title
          }
        </h2>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-violet-50 px-2.5 py-1 text-xs font-bold text-violet-700">
            {
              data.recommendation
                .category
            }
          </span>

          <span
            className={`rounded-full px-2.5 py-1 text-xs font-bold capitalize ${priorityClasses}`}
          >
            {
              data.recommendation
                .priority
            }{" "}
            priority
          </span>

          <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-bold text-blue-700">
            {
              data.recommendation
                .confidence
            }
            % confidence
          </span>
        </div>
      </div>

      {/* Reason / supporting data */}

      <div className="rounded-2xl border border-blue-200 bg-blue-50 p-4">
        <p className="text-xs font-bold uppercase tracking-wide text-blue-700">
          <i className="fas fa-chart-column mr-2" />
          Reason / Supporting Data
        </p>

        <p className="mt-2 text-sm leading-6 text-blue-950">
          {
            data.recommendation
              .description
          }
        </p>
      </div>

      {/* Problem and action */}

      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="mb-4">
          <p className="text-xs font-bold uppercase tracking-wide text-red-600">
            <i className="fas fa-circle-exclamation mr-2" />
            Problem
          </p>

          <p className="mt-2 text-sm leading-6 text-slate-700">
            {
              data.recommendation
                .problem
            }
          </p>
        </div>

        <div className="border-t border-slate-100 pt-4">
          <p className="text-xs font-bold uppercase tracking-wide text-emerald-600">
            <i className="fas fa-lightbulb mr-2" />
            Recommended Action
          </p>

          <p className="mt-2 text-sm leading-6 text-slate-700">
            {
              data.recommendation
                .solution
            }
          </p>
        </div>
      </div>

      {/* Expected impact */}

      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
        <p className="text-sm font-bold text-emerald-800">
          <i className="fas fa-arrow-trend-up mr-2" />
          Expected Business Impact
        </p>

        <p className="mt-2 text-sm leading-6 text-emerald-900">
          {
            data.recommendation
              .expected_impact
          }
        </p>
      </div>

      {/* Owner feedback */}

      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <p className="text-sm font-bold text-slate-900">
          Was this recommendation useful?
        </p>

        <p className="mt-1 text-xs leading-5 text-slate-500">
          Your feedback helps improve future
          recommendations.
        </p>

                {data.recommendation
          .user_feedback ? (
          <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-3">
            <div className="flex items-center gap-2 text-sm font-bold text-emerald-700">
              <i className="fas fa-circle-check" />

              Feedback submitted
            </div>

            <p className="mt-1 text-xs text-emerald-700">
              You marked this recommendation as{" "}
              <strong>
                {data.recommendation
                  .user_feedback ===
                "useful"
                  ? "Useful"
                  : "Not Useful"}
              </strong>
              .
            </p>
          </div>
        ) : (
          <div className="mt-4 grid grid-cols-2 gap-2">
            <button
              type="button"
              disabled={saving}
              onClick={() =>
                onFeedback(
                  data.recommendation.id,
                  "useful"
                )
              }
              className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-bold text-slate-600 transition hover:border-emerald-300 hover:text-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? (
                <i className="fas fa-spinner fa-spin mr-2" />
              ) : (
                <i className="fas fa-thumbs-up mr-2" />
              )}

              Useful
            </button>

            <button
              type="button"
              disabled={saving}
              onClick={() =>
                onFeedback(
                  data.recommendation.id,
                  "not_useful"
                )
              }
              className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-bold text-slate-600 transition hover:border-red-300 hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? (
                <i className="fas fa-spinner fa-spin mr-2" />
              ) : (
                <i className="fas fa-thumbs-down mr-2" />
              )}

              Not Useful
            </button>
                   </div>
        )}
        {saving && (
          <p className="mt-3 text-center text-xs font-semibold text-violet-600">
            <i className="fas fa-spinner fa-spin mr-2" />

            Saving feedback...
          </p>
        )}
      </div>
    </>
  );
}

export default function RecommendationsPage() {
  const [
    generations,
    setGenerations,
  ] =
    useState<
      RecommendationGeneration[]
    >([]);

  const [
    selected,
    setSelected,
  ] =
    useState<SelectedRecommendation | null>(
      null
    );

  const [
    detailsOpen,
    setDetailsOpen,
  ] = useState(false);

  const [loading, setLoading] =
    useState(true);

  const [
    loadingMore,
    setLoadingMore,
  ] =
    useState(false);

  const [generating, setGenerating] =
    useState(false);

  const [
    feedbackSavingId,
    setFeedbackSavingId,
  ] = useState<number | null>(
    null
  );

  const [error, setError] =
    useState("");

  const [
    currentPage,
    setCurrentPage,
  ] =
    useState(1);

  const [hasMore, setHasMore] =
    useState(false);

  const [
    totalGenerations,
    setTotalGenerations,
  ] =
    useState(0);

  /*
  |--------------------------------------------------------------------------
  | Load history
  |--------------------------------------------------------------------------
  */

  const loadRecommendations =
    useCallback(
      async (
        page = 1,
        append = false
      ) => {
        try {
          if (append) {
            setLoadingMore(true);
          } else {
            setLoading(true);
          }

          setError("");

          const response =
            await api.get<RecommendationIndexResponse>(
              `/owner/recommendations?page=${page}&per_page=5`
            );

          const data =
            response.data.data;

          const received =
            data.generations ??
            (
              data.generation
                ? [data.generation]
                : []
            );

          if (append) {
            setGenerations(
              (current) => {
                const existingIds =
                  new Set(
                    current.map(
                      (generation) =>
                        generation.id
                    )
                  );

                return [
                  ...current,

                  ...received.filter(
                    (generation) =>
                      !existingIds.has(
                        generation.id
                      )
                  ),
                ];
              }
            );
          } else {
            setGenerations(
              received
            );

            const firstGeneration =
              received[0];

            const firstRecommendation =
              firstGeneration
                ?.recommendations[0];

            setSelected(
              firstGeneration &&
                firstRecommendation
                ? {
                  generationId:
                    firstGeneration.id,

                  recommendationId:
                    firstRecommendation.id,
                }
                : null
            );
          }

          setCurrentPage(
            data.pagination
              ?.current_page ??
            page
          );

          setHasMore(
            data.pagination
              ?.has_more ??
            false
          );

          setTotalGenerations(
            data.pagination
              ?.total ??
            received.length
          );
        } catch (requestError) {
          setError(
            getErrorMessage(
              requestError,
              "Unable to load recommendations."
            )
          );
        } finally {
          setLoading(false);
          setLoadingMore(false);
        }
      },
      []
    );

  useEffect(() => {
    loadRecommendations();
  }, [loadRecommendations]);

  useEffect(() => {
    if (!detailsOpen) {
      return;
    }

    const previous =
      document.body.style.overflow;

    document.body.style.overflow =
      "hidden";

    return () => {
      document.body.style.overflow =
        previous;
    };
  }, [detailsOpen]);

  /*
  |--------------------------------------------------------------------------
  | Generate a new batch
  |--------------------------------------------------------------------------
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

        if (!generated) {
          throw new Error(
            "Generation completed without recommendation data."
          );
        }

        setGenerations(
          (current) => [
            generated,

            ...current.filter(
              (generation) =>
                generation.id !==
                generated.id
            ),
          ]
        );

        const firstRecommendation =
          generated
            .recommendations[0];

        if (firstRecommendation) {
          setSelected({
            generationId:
              generated.id,

            recommendationId:
              firstRecommendation.id,
          });
        }

        setTotalGenerations(
          (current) =>
            current + 1
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

  /*
|--------------------------------------------------------------------------
| Save recommendation feedback
|--------------------------------------------------------------------------
*/

  const handleFeedback =
    async (
      recommendationId: number,
      value:
        RecommendationFeedbackValue
    ) => {
      if (
        feedbackSavingId !==
        null
      ) {
        return;
      }

      try {
        setFeedbackSavingId(
          recommendationId
        );

        const response =
          await api.put(
            `/owner/recommendations/${recommendationId}/feedback`,
            {
              feedback:
                value,
            }
          );

        /*
         * Update the selected recommendation and
         * every visible history batch locally.
         */

        setGenerations(
          (current) =>
            current.map(
              (generation) => ({
                ...generation,

                recommendations:
                  generation
                    .recommendations
                    .map(
                      (
                        recommendation
                      ) =>
                        recommendation.id ===
                          recommendationId
                          ? {
                            ...recommendation,

                            user_feedback:
                              value,
                          }
                          : recommendation
                    ),
              })
            )
        );

        showSuccess(
          response.data
            ?.message ||
          "Feedback saved successfully."
        );
      } catch (requestError) {
        showError(
          getErrorMessage(
            requestError,
            "Unable to save recommendation feedback."
          )
        );
      } finally {
        setFeedbackSavingId(
          null
        );
      }
    };

  const handleLoadMore =
    async () => {
      if (
        loadingMore ||
        !hasMore
      ) {
        return;
      }

      await loadRecommendations(
        currentPage + 1,
        true
      );
    };

  /*
  |--------------------------------------------------------------------------
  | Selected recommendation details
  |--------------------------------------------------------------------------
  */

  const selectedData =
    useMemo(() => {
      if (!selected) {
        return null;
      }

      const generation =
        generations.find(
          (item) =>
            item.id ===
            selected.generationId
        );

      if (!generation) {
        return null;
      }

      const recommendation =
        generation
          .recommendations
          .find(
            (item) =>
              item.id ===
              selected.recommendationId
          );

      if (!recommendation) {
        return null;
      }

      return {
        generation,
        recommendation,
      };
    }, [
      generations,
      selected,
    ]);

  return (
    <div className="recommendations-page">
      <div className="recommendations-container">
        {/* HEADER */}

        <div className="recommendations-header">
          <div>
            <h1>Recommendations</h1>
            <p>
              {!loading && totalGenerations > 0
                ? `${totalGenerations} successful generation${totalGenerations === 1 ? "" : "s"
                } saved`
                : "AI-generated actions based on your POS data"}
            </p>
          </div>

          <button
            type="button"
            className="recommendations-generate-btn"
            onClick={handleGenerate}
            disabled={generating || loading}
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

        {/* Error */}

        {error && (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
            <div className="flex gap-3">
              <i className="fas fa-circle-exclamation mt-1 text-red-600" />

              <p className="m-0 text-sm font-semibold text-red-800">
                {error}
              </p>
            </div>
          </div>
        )}

        {/* Loading */}

        {loading ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">
            <i className="fas fa-spinner fa-spin text-3xl text-violet-600" />

            <h2 className="mt-4 text-lg font-bold text-slate-900">
              Loading recommendations
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              Fetching your saved AI history.
            </p>
          </div>
        ) : generations.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
            <i className="fas fa-lightbulb text-4xl text-slate-300" />

            <h2 className="mt-4 text-lg font-bold text-slate-900">
              No recommendations yet
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              Generate recommendations after
              syncing your POS data.
            </p>
          </div>
        ) : (
          <div className="grid items-start gap-4 lg:h-[calc(100vh-150px)] lg:grid-cols-[minmax(0,1fr)_360px]">
            {/* Left: all generations */}

            <div className="min-w-0 space-y-4 scrollbar-hide lg:h-full lg:overflow-y-auto lg:pr-2">
              {generations.map(
                (
                  generation,
                  generationIndex
                ) => (
                  <section
                    key={
                      generation.id
                    }
                    className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
                  >
                    {/* Generation heading */}

                    <div className="flex flex-col gap-2 border-b border-slate-100 bg-slate-50/80 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h2 className="text-sm font-bold text-slate-900">
                            Recommendation Batch #
                            {
                              generation.id
                            }
                          </h2>

                          {generationIndex ===
                            0 && (
                              <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-[11px] font-bold text-emerald-700">
                                Latest
                              </span>
                            )}
                        </div>

                        <p className="mt-1 text-xs text-slate-500">
                          {formatDate(
                            generation
                              .generated_at
                          )}
                        </p>
                      </div>

                      <div className="text-xs text-slate-500 sm:text-right">
                        <p className="m-0 font-semibold text-slate-700">
                          {
                            generation
                              .period_start
                          }
                          {" — "}
                          {
                            generation
                              .period_end
                          }
                        </p>

                        <p className="m-0 mt-1">
                          {
                            generation
                              .recommendations
                              .length
                          }{" "}
                          recommendations
                        </p>
                      </div>
                    </div>

                    {/* Compact cards */}

                    <div className="space-y-2.5 p-3">
                      {generation
                        .recommendations
                        .map(
                          (
                            recommendation
                          ) => {
                            const design =
                              categoryDesign(
                                recommendation.category
                              );

                            const isSelected =
                              selected
                                ?.generationId ===
                              generation.id &&
                              selected
                                ?.recommendationId ===
                              recommendation.id;

                            return (
                              <article
                                key={
                                  recommendation.id
                                }
                                className={`rounded-xl border p-3.5 transition ${isSelected
                                  ? "border-violet-400 bg-violet-50/50 shadow-sm ring-2 ring-violet-100"
                                  : "border-slate-200 bg-white hover:border-violet-200 hover:shadow-sm"
                                  }`}
                              >
                                <div className="flex gap-3">
                                  <div
                                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${design.iconClasses}`}
                                  >
                                    <i
                                      className={`fas ${design.icon}`}
                                    />
                                  </div>

                                  <div className="min-w-0 flex-1">
                                    <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                                      <h3 className="text-sm font-bold leading-5 text-slate-900 sm:text-base">
                                        {
                                          recommendation.title
                                        }
                                      </h3>

                                      <span
                                        className={`shrink-0 rounded-full px-2 py-1 text-[10px] font-bold ${design.badgeClasses}`}
                                      >
                                        {recommendation.category}
                                      </span>
                                    </div>

                                    <p className="mt-2 line-clamp-2 text-xs leading-5 text-slate-600 sm:text-sm">
                                      {
                                        recommendation.description
                                      }
                                    </p>

                                    <div className="mt-3 flex justify-end">
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setSelected(
                                            {
                                              generationId:
                                                generation.id,

                                              recommendationId:
                                                recommendation.id,
                                            }
                                          );
                                          setDetailsOpen(
                                            true
                                          );
                                        }}
                                        className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-3 py-2 text-xs font-bold text-white transition hover:bg-violet-600"
                                      >
                                        View Details
                                        <i className="fas fa-arrow-right text-[10px]" />
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              </article>
                            );
                          }
                        )}
                    </div>
                  </section>
                )
              )}

              {hasMore && (
                <div className="flex justify-center">
                  <button
                    type="button"
                    onClick={
                      handleLoadMore
                    }
                    disabled={
                      loadingMore
                    }
                    className="inline-flex min-w-40 items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-bold text-slate-700 shadow-sm transition hover:border-violet-300 hover:bg-violet-50 hover:text-violet-700 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {loadingMore ? (
                      <>
                        <i className="fas fa-spinner fa-spin" />
                        Loading...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-clock-rotate-left" />
                        Load More
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>

            {/* Right: selected details (desktop) */}

            <aside className="hidden space-y-3 scrollbar-hide lg:block lg:h-full lg:overflow-y-auto lg:pr-1">
              <RecommendationDetails data={selectedData} saving={feedbackSavingId === selectedData?.recommendation.id} onFeedback={handleFeedback} />
            </aside>
          </div>
        )}

        {/* Selected details (mobile / tablet drawer) */}

        {detailsOpen && (
          <div
            className="fixed inset-0 z-[60] flex flex-col justify-end bg-slate-900/50 lg:hidden"
            onClick={() => setDetailsOpen(false)}
          >
            <div
              className="max-h-[85vh] overflow-y-auto rounded-t-2xl bg-slate-50 p-4 scrollbar-hide"
              onClick={(event) =>
                event.stopPropagation()
              }
            >
              <div className="sticky top-0 -mx-4 -mt-4 mb-3 flex items-center justify-between border-b border-slate-200 bg-slate-50 px-4 py-3">
                <h2 className="m-0 text-base font-bold text-slate-900">
                  Recommendation Details
                </h2>

                <button
                  type="button"
                  onClick={() =>
                    setDetailsOpen(false)
                  }
                  className="flex h-9 w-9 items-center justify-center rounded-lg bg-white text-slate-500 shadow-sm"
                  aria-label="Close details"
                >
                  <i className="fas fa-xmark" />
                </button>
              </div>

              <div className="space-y-3 pb-2">
                <RecommendationDetails data={selectedData} saving={feedbackSavingId === selectedData?.recommendation.id} onFeedback={handleFeedback} />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}