"use client";

import { useMemo, useState } from "react";
import {
  showInfo,
} from "@/lib/feedback";

type Recommendation = {
  id: number;
  title: string;
  confidence: "High Confidence" | "Medium Confidence" | "Low Confidence";
  category: "Operations" | "Menu" | "Marketing" | "Inventory";
  date: string;
  description: string;
  problemLabel: string;
  problem: string;
  opportunityLabel: string;
  opportunity: string;
  priority: "high" | "medium" | "low";
  icon: string;
  accent: "orange" | "green" | "purple" | "blue";
};

const initialRecommendations: Recommendation[] = [
  {
    id: 1,
    title: "Uneven weekly demand pattern",
    confidence: "Medium Confidence",
    category: "Operations",
    date: "18/08/2026",
    description:
      "Orders vary significantly by day of week, with Friday being the busiest and Tuesday the slowest.",
    problemLabel: "Problem",
    problem:
      "Irregular demand causes inefficient staffing and longer wait times on peak days.",
    opportunityLabel: "Opportunity",
    opportunity:
      "Optimizing schedules can reduce labor costs by 8–12% and improve customer experience.",
    priority: "high",
    icon: "fa-chart-line",
    accent: "orange",
  },
  {
    id: 2,
    title: "Top performer: Grilled Salmon",
    confidence: "High Confidence",
    category: "Menu",
    date: "18/08/2026",
    description:
      "Grilled Salmon is your top-selling item with 38 units sold, generating €931 in revenue.",
    problemLabel: "Impact",
    problem:
      "Promoting this item more prominently can significantly increase revenue.",
    opportunityLabel: "Opportunity",
    opportunity:
      "Create combo deals or feature it in promotions to boost sales further.",
    priority: "high",
    icon: "fa-arrow-trend-up",
    accent: "green",
  },
  {
    id: 3,
    title: "Low-performing items detected",
    confidence: "High Confidence",
    category: "Menu",
    date: "17/08/2026",
    description:
      "5 menu items have low sales and are impacting overall profitability.",
    problemLabel: "Impact",
    problem:
      "Low-performing items occupy menu space and inventory that could be more profitable.",
    opportunityLabel: "Opportunity",
    opportunity:
      "Consider removing or modifying these items to improve menu performance.",
    priority: "medium",
    icon: "fa-box-open",
    accent: "orange",
  },
  {
    id: 4,
    title: "Promote repeat customers",
    confidence: "Medium Confidence",
    category: "Marketing",
    date: "17/08/2026",
    description:
      "23% of customers have not returned in the last 30 days.",
    problemLabel: "Problem",
    problem:
      "Customer retention is lower than expected and repeat-order potential is being missed.",
    opportunityLabel: "Opportunity",
    opportunity:
      "Launch targeted loyalty offers or personalized return promotions.",
    priority: "medium",
    icon: "fa-users",
    accent: "purple",
  },
  {
    id: 5,
    title: "Stock planning can be improved",
    confidence: "Low Confidence",
    category: "Inventory",
    date: "16/08/2026",
    description:
      "Several ingredients show higher usage variance than expected.",
    problemLabel: "Problem",
    problem:
      "Inconsistent purchasing can increase waste and cause stock shortages.",
    opportunityLabel: "Opportunity",
    opportunity:
      "Use recent sales patterns to improve reorder quantities and stock planning.",
    priority: "low",
    icon: "fa-boxes-stacked",
    accent: "blue",
  },
];

const tabs = [
  { key: "all", label: "All" },
  { key: "Operations", label: "Operations" },
  { key: "Menu", label: "Menu" },
  { key: "Marketing", label: "Marketing" },
  { key: "Inventory", label: "Inventory" },
];

export default function RecommendationsPage() {
  const [recommendations, setRecommendations] =
    useState<Recommendation[]>(initialRecommendations);

  const [activeTab, setActiveTab] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [generating, setGenerating] = useState(false);
  const [selected, setSelected] =
    useState<Recommendation | null>(null);
  const [openMenuId, setOpenMenuId] =
    useState<number | null>(null);

  const filteredRecommendations = useMemo(() => {
    return recommendations.filter((item) => {
      const categoryMatch =
        activeTab === "all" || item.category === activeTab;

      const priorityMatch =
        priorityFilter === "all" ||
        item.priority === priorityFilter;

      return categoryMatch && priorityMatch;
    });
  }, [recommendations, activeTab, priorityFilter]);

  const counts = useMemo(() => {
    return {
      all: recommendations.length,
      Operations: recommendations.filter(
        (item) => item.category === "Operations"
      ).length,
      Menu: recommendations.filter(
        (item) => item.category === "Menu"
      ).length,
      Marketing: recommendations.filter(
        (item) => item.category === "Marketing"
      ).length,
      Inventory: recommendations.filter(
        (item) => item.category === "Inventory"
      ).length,
      high: recommendations.filter(
        (item) => item.priority === "high"
      ).length,
      medium: recommendations.filter(
        (item) => item.priority === "medium"
      ).length,
      low: recommendations.filter(
        (item) => item.priority === "low"
      ).length,
    };
  }, [recommendations]);

const handleGenerate = async () => {
  try {
    setGenerating(true);

    await new Promise((resolve) =>
      setTimeout(resolve, 1000)
    );

    showInfo(
      "Recommendation generation UI is ready. AI/backend integration can be connected next."
    );
  } finally {
    setGenerating(false);
  }
};
  const dismissRecommendation = (id: number) => {
    setRecommendations((current) =>
      current.filter((item) => item.id !== id)
    );
  };

  return (
    <div className="recommendations-page">
      <div className="recommendations-container">

        {/* PAGE HEADER */}
        <div className="recommendations-header">
          <div>
            <h1>Recommendations</h1>

            <p>
              Data-backed recommendations generated from your
              restaurant&apos;s real performance data.
            </p>
          </div>

          <button
            type="button"
            className="recommendations-generate-btn"
            onClick={handleGenerate}
            disabled={generating}
          >
            {generating ? (
              <>
                <i className="fas fa-spinner fa-spin"></i>
                Generating...
              </>
            ) : (
              <>
                <i className="fas fa-wand-magic-sparkles"></i>
                Generate New
              </>
            )}
          </button>
        </div>

        {/* FILTERS */}
        <div className="recommendations-toolbar">
          <div className="recommendations-tabs">
            {tabs.map((tab) => {
              const count =
                tab.key === "all"
                  ? counts.all
                  : counts[
                      tab.key as keyof typeof counts
                    ];

              return (
                <button
                  key={tab.key}
                  type="button"
                  className={`recommendations-tab ${
                    activeTab === tab.key
                      ? "recommendations-tab-active"
                      : ""
                  }`}
                  onClick={() =>
                    setActiveTab(tab.key)
                  }
                >
                  <span>{tab.label}</span>

                  <span className="recommendations-tab-count">
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="recommendations-filter">
            <i className="fas fa-filter"></i>

            <select
              value={priorityFilter}
              onChange={(e) =>
                setPriorityFilter(e.target.value)
              }
            >
              <option value="all">
                All Priorities
              </option>

              <option value="high">
                High Priority
              </option>

              <option value="medium">
                Medium Priority
              </option>

              <option value="low">
                Low Priority
              </option>
            </select>
          </div>
        </div>

        {/* MAIN GRID */}
        <div className="recommendations-main-grid">

          {/* LEFT COLUMN */}
          <div className="recommendations-list">

            {filteredRecommendations.length === 0 ? (
              <div className="recommendations-empty">
                <div>
                  <i className="fas fa-lightbulb"></i>
                </div>

                <h3>No recommendations found</h3>

                <p>
                  Try another category or priority filter.
                </p>
              </div>
            ) : (
              filteredRecommendations.map((item) => (
                <article
                  key={item.id}
                  className="recommendation-card"
                >
                  <div
                    className={`recommendation-main-icon recommendation-main-icon-${item.accent}`}
                  >
                    <i
                      className={`fas ${item.icon}`}
                    ></i>
                  </div>

                  <div className="recommendation-card-body">
                    <div className="recommendation-card-top">
                      <div className="recommendation-heading">
                        <h2>{item.title}</h2>

                        <div className="recommendation-badges">
                          <span
                            className={`recommendation-category category-${item.category.toLowerCase()}`}
                          >
                            {item.category}
                          </span>

                          <span
                            className={`recommendation-priority priority-${item.priority}`}
                          >
                            {item.priority} priority
                          </span>

                          <span
                            className={`recommendation-confidence ${
                              item.confidence ===
                              "High Confidence"
                                ? "confidence-high"
                                : item.confidence ===
                                  "Medium Confidence"
                                ? "confidence-medium"
                                : "confidence-low"
                            }`}
                          >
                            {item.confidence}
                          </span>
                        </div>
                      </div>

                      <div className="recommendation-meta">
                        <span>
                          <i className="fas fa-calendar-days"></i>
                          {item.date}
                        </span>

                        <div className="recommendation-menu">
                          <button
                            type="button"
                            className="recommendation-menu-btn"
                            onClick={() =>
                              setOpenMenuId((current) =>
                                current === item.id
                                  ? null
                                  : item.id
                              )
                            }
                          >
                            <i className="fas fa-ellipsis-vertical"></i>
                          </button>

                          {openMenuId === item.id && (
                            <div className="recommendation-menu-dropdown">
                              <button
                                type="button"
                                onClick={() => {
                                  dismissRecommendation(item.id);
                                  setOpenMenuId(null);
                                }}
                              >
                                <i className="fas fa-trash"></i>
                                Dismiss
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <p className="recommendation-description">
                      {item.description}
                    </p>

                    <div className="recommendation-card-footer">
                      <button
                        type="button"
                        className="recommendation-details-link"
                        onClick={() =>
                          setSelected(item)
                        }
                      >
                        View Details
                        <i className="fas fa-arrow-right"></i>
                      </button>
                    </div>
                  </div>
                </article>
              ))
            )}

          </div>

          {/* RIGHT COLUMN */}
          <aside className="recommendations-sidebar">

            {/* SUMMARY */}
            <div className="recommendations-side-card">
              <div className="recommendations-side-title">
                <i className="fas fa-chart-column"></i>
                <h3>Summary</h3>
              </div>

              <div className="recommendations-summary-list">
                <div>
                  <span className="summary-dot summary-high">
                    <i className="fas fa-fire"></i>
                  </span>

                  <span>High Priority</span>

                  <strong>{counts.high}</strong>
                </div>

                <div>
                  <span className="summary-dot summary-medium">
                    <i className="fas fa-triangle-exclamation"></i>
                  </span>

                  <span>Medium Priority</span>

                  <strong>{counts.medium}</strong>
                </div>

                <div>
                  <span className="summary-dot summary-low">
                    <i className="fas fa-circle-check"></i>
                  </span>

                  <span>Low Priority</span>

                  <strong>{counts.low}</strong>
                </div>

                <div>
                  <span className="summary-dot summary-total">
                    <i className="fas fa-lightbulb"></i>
                  </span>

                  <span>Total Recommendations</span>

                  <strong>{counts.all}</strong>
                </div>
              </div>
            </div>

            {/* EXPECTED IMPACT */}
            <div className="recommendations-side-card">
              <div className="recommendations-side-title">
                <i className="fas fa-bullseye"></i>
                <h3>Expected Impact</h3>
              </div>

              <p className="recommendations-side-copy">
                Potential improvements if all recommendations
                are implemented.
              </p>

              <div className="recommendations-impact-grid">
                <div>
                  <strong className="impact-positive">
                    +18%
                  </strong>
                  <span>Revenue Increase</span>
                </div>

                <div>
                  <strong className="impact-warning">
                    -12%
                  </strong>
                  <span>Cost Reduction</span>
                </div>

                <div>
                  <strong className="impact-positive">
                    +24%
                  </strong>
                  <span>Efficiency Gain</span>
                </div>
              </div>
            </div>

            {/* WHY THESE RECOMMENDATIONS */}
            <div className="recommendations-side-card">
              <div className="recommendations-side-title">
                <i className="fas fa-brain"></i>
                <h3>Why these recommendations?</h3>
              </div>

              <div className="recommendations-insight-list">
                <div>
                  <span className="insight-check">
                    <i className="fas fa-check"></i>
                  </span>
                  Based on real performance data
                </div>

                <div>
                  <span className="insight-check">
                    <i className="fas fa-check"></i>
                  </span>
                  Updated with latest insights
                </div>

                <div>
                  <span className="insight-check">
                    <i className="fas fa-check"></i>
                  </span>
                  Tailored for your restaurant
                </div>
              </div>
            </div>

          </aside>

        </div>

        {/* DETAIL MODAL */}
        {selected && (
          <div
            className="recommendation-modal-overlay"
            onClick={() => setSelected(null)}
          >
            <div
              className="recommendation-modal"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="recommendation-modal-header">
                <div>
                  <span>
                    {selected.category}
                  </span>

                  <h2>{selected.title}</h2>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setSelected(null)
                  }
                >
                  <i className="fas fa-times"></i>
                </button>
              </div>

              <div className="recommendation-modal-body">
                <div>
                  <span>Description</span>
                  <p>{selected.description}</p>
                </div>

                <div>
                  <span>{selected.problemLabel}</span>
                  <p>{selected.problem}</p>
                </div>

                <div className="recommendation-modal-action">
                  <i className="fas fa-wand-magic-sparkles"></i>

                  <div>
                    <span>
                      {selected.opportunityLabel}
                    </span>

                    <p>{selected.opportunity}</p>
                  </div>
                </div>
              </div>

              <div className="recommendation-modal-footer">
                <button
                  type="button"
                  className="recommendation-modal-close"
                  onClick={() =>
                    setSelected(null)
                  }
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}