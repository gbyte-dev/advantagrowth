"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import api from "@/lib/axios";

type Restaurant = {
  id: number;
  name: string;
  slug: string;
  logo?: string | null;
  phone?: string;
  email?: string;
  address?: string;
};

export default function CustomerRestaurantsPage() {
  const router = useRouter();

  const [restaurants, setRestaurants] =
    useState<Restaurant[]>([]);

  const [loading, setLoading] =
    useState(true);

  const loadRestaurants = async () => {
    try {
      const res = await api.get(
        "/restaurants"
      );

      setRestaurants(
        res.data.restaurants || []
      );
    } catch (error) {
      console.error(
        "Restaurant loading error:",
        error
      );

      alert(
        "Unable to load restaurants."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRestaurants();
  }, []);

  const openRestaurant = (
    slug: string
  ) => {
    router.push(
      `/customer/restaurant/${slug}`
    );
  };

  if (loading) {
    return (
      <main className="customer-restaurants-page">
        <div className="customer-page-header">
          <h1>Restaurants</h1>
          <p>
            Loading restaurants...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="customer-restaurants-page">

      <div className="customer-page-header">

        <h1>
          Choose Restaurant
        </h1>

        <p>
          Select a restaurant to view
          its menu and reviews.
        </p>

      </div>


      {restaurants.length === 0 ? (

        <div className="empty-state">

          <h2>
            No Restaurants Available
          </h2>

          <p>
            There are currently no active
            restaurants.
          </p>

        </div>

      ) : (

        <div className="restaurant-list">

          {restaurants.map(
            (restaurant) => (

              <div
                className="restaurant-row"
                key={restaurant.id}
                onClick={() =>
                  openRestaurant(
                    restaurant.slug
                  )
                }
              >

                <div className="restaurant-info">

                  <h2>
                    {restaurant.name}
                  </h2>

                  {restaurant.address && (
                    <p>
                      {restaurant.address}
                    </p>
                  )}

                  {restaurant.phone && (
                    <p>
                      {restaurant.phone}
                    </p>
                  )}

                </div>


                <div className="restaurant-action">

                  <span>
                    View Menu →
                  </span>

                </div>

              </div>

            )
          )}

        </div>

      )}

    </main>
  );
}