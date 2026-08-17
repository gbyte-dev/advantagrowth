"use client";

import { useEffect, useMemo, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import RestaurantNavbar from "@/components/customer/RestaurantNavbar";
import AuthGuard from "@/components/AuthGuard";
import api from "@/lib/axios";
import "./restaurant.css";

type MarqueeItem = {
  id: number;
  text: string;
  sort_order: number;
  is_active: boolean;
};


// ----- TYPES -----
type Restaurant = {
  id: number;
  name: string;
  slug: string;
  logo?: string | null;
  phone?: string;
  email?: string;
  address?: string;

  // ABOUT
  about_years?: string | null;
  about_title?: string | null;
  about_description?: string | null;
  about_image_1?: string | null;
  about_image_2?: string | null;
  about_feature_1_title?: string | null;
  about_feature_1_description?: string | null;
  about_feature_2_title?: string | null;
  about_feature_2_description?: string | null;
  about_feature_3_title?: string | null;
  about_feature_3_description?: string | null;

  // HERO
  hero_badge?: string | null;
  hero_title_line_1?: string | null;
  hero_title_line_2?: string | null;
  hero_title_line_3?: string | null;
  hero_title_line_4?: string | null;
  hero_description?: string | null;
  hero_image?: string | null;
  hero_owner_name?: string | null;
  hero_deal_title?: string | null;
  hero_deal_subtitle?: string | null;
  hero_delivery_time?: string | null;
  hero_delivery_subtitle?: string | null;
  hero_rating?: string | null;
  hero_reviews?: string | null;
  hero_explore_button?: string | null;
  hero_story_button?: string | null;
  hero_customers_count?: string | null;
  hero_menu_count?: string | null;
  hero_chefs_count?: string | null;
  hero_experience_count?: string | null;
};


type MenuItem = {
  id: number;
  name: string;
  description?: string | null;
  price: number;
  food_type: string;
  is_available: boolean;
};

type CartItem = MenuItem & {
  quantity: number;
};

type Category = {
  id: number;
  name: string;
  items: MenuItem[];
};

type Review = {
  id: number;
  rating: number;
  review?: string | null;
  customer?: {
    id: number;
    name?: string;
  };
  created_at?: string;
};
type Staff = {
  id: number;
  owner_name: string;
  username?: string;
  staff_role?: string;
  profile_image?: string | null;
  is_active: boolean;
};

const getStaffImageUrl = (
  image: string | null | undefined
) => {
  if (!image) {
    return null;
  }

  if (
    image.startsWith("http://") ||
    image.startsWith("https://")
  ) {
    return image;
  }

  const apiUrl =
    process.env.NEXT_PUBLIC_API_URL ||
    "http://127.0.0.1:8000/api";

  const backendUrl = apiUrl.replace(/\/api\/?$/, "");

  return `${backendUrl}/storage/${image}`;
};

const getRestaurantImageUrl = (
  image: string | null | undefined
) => {
  if (!image) {
    return null;
  }

  if (
    image.startsWith("http://") ||
    image.startsWith("https://")
  ) {
    return image;
  }

  const apiUrl =
    process.env.NEXT_PUBLIC_API_URL ||
    "http://127.0.0.1:8000/api";

  const backendUrl = apiUrl.replace(/\/api\/?$/, "");

  return `${backendUrl}/storage/${image}`;
};

const getHeroImageUrl = (
  image: string | null | undefined,
  fallback: string
) => {
  if (!image) {
    return fallback;
  }

  if (
    image.startsWith("http://") ||
    image.startsWith("https://")
  ) {
    return image;
  }

  const apiUrl =
    process.env.NEXT_PUBLIC_API_URL ||
    "http://127.0.0.1:8000/api";

  const backendUrl = apiUrl.replace(/\/api\/?$/, "");

  return `${backendUrl}/storage/${image}`;
};

export default function RestaurantDashboard() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  const [marqueeItems, setMarqueeItems] = useState<MarqueeItem[]>([]);
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    if (typeof window === "undefined") {
      return [];
    }

    try {
      const savedCart = localStorage.getItem("restaurant_cart");

      return savedCart ? JSON.parse(savedCart) : [];
    } catch (error) {
      console.error("Failed to load cart:", error);
      return [];
    }
  });
  useEffect(() => {
    try {
      localStorage.setItem(
        "restaurant_cart",
        JSON.stringify(cartItems)
      );
    } catch (error) {
      console.error("Failed to save cart:", error);
    }
  }, [cartItems]);
  const [selectedMenuItem, setSelectedMenuItem] = useState<MenuItem | null>(null);
  const [itemQuantity, setItemQuantity] = useState(1);
  const [showItemPopup, setShowItemPopup] = useState(false);
  const [showCart, setShowCart] = useState(false);
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  // track expanded state per category id so each category can toggle independently
  const [showFullMenuMap, setShowFullMenuMap] = useState<Record<number, boolean>>({});
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [reviews, setReviews] = useState<Review[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [staffLoading, setStaffLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [reviewsLoading, setReviewsLoading] = useState(false);



  // Review form
  const [rating, setRating] = useState(5);
  const [reviewText, setReviewText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);

  const sliderRef = useRef<HTMLDivElement>(null);
  const [currentSlide, setCurrentSlide] = useState(0);

  const [contactForm, setContactForm] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "General Inquiry",
    message: "",
  });

  const [contactSubmitting, setContactSubmitting] =
    useState(false);

  const [contactSuccess, setContactSuccess] =
    useState(false);

  const [contactError, setContactError] =
    useState("");

  // ============================================================
  // RESERVATION
  // ============================================================

  const [reservationForm, setReservationForm] = useState({
    name: "",
    email: "",
    phone: "",
    reservation_date: "",
    reservation_time: "",
    guests: 2,
    special_request: "",
  });

  const [reservationSubmitting, setReservationSubmitting] = useState(false);
  const [reservationSuccess, setReservationSuccess] = useState(false);
  const [reservationError, setReservationError] = useState("");

  const heroSlides = [
    {
      title: "Welcome to",
      highlight: restaurant?.name || "Our Restaurant",
      subtitle: "Delicious Food, Great Ambiance",
      bg: "hero-slide-1",
    },
    {
      title: "Fresh & Healthy",
      highlight: "Made with Love",
      subtitle: "Daily fresh ingredients, crafted for you",
      bg: "hero-slide-2",
    },
  ];

  // Auto-slide
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const fetchMarqueeItems = async () => {
      try {
        const response = await api.get(
          `/restaurants/${slug}/marquee`
        );

        if (response.data?.success) {
          setMarqueeItems(response.data.marquee_items || []);
        }
      } catch (error) {
        console.error("Failed to load marquee items:", error);
        setMarqueeItems([]);
      }
    };

    if (slug) {
      fetchMarqueeItems();
    }
  }, [slug]);

  // Load restaurant & menu
  useEffect(() => {
    if (!slug) return;
    let cancelled = false;

    const loadRestaurant = async () => {
      try {
        setLoading(true);
        const restaurantRes = await api.get(`/restaurants/${slug}`);
        if (cancelled) return;


        const restaurantData = restaurantRes.data?.restaurant;

if (!restaurantData?.id) {
  throw new Error("Restaurant information is missing.");
}

setRestaurant(restaurantData);

// Save restaurant context for cart / checkout
try {
  localStorage.setItem(
    "selected_restaurant",
    JSON.stringify({
      id: restaurantData.id,
      name: restaurantData.name,
      slug: restaurantData.slug,
      logo: restaurantData.logo || null,
      phone: restaurantData.phone || null,
      email: restaurantData.email || null,
      address: restaurantData.address || null,
    })
  );

  // Also keep simple ID/slug values for checkout compatibility
  localStorage.setItem(
    "restaurant_id",
    String(restaurantData.id)
  );

  localStorage.setItem(
    "restaurant_slug",
    restaurantData.slug
  );
} catch (storageError) {
  console.error(
    "Failed to save restaurant information:",
    storageError
  );
}


        const menuRes = await api.get(`/restaurants/${slug}/menu`);

        if (cancelled) return;

        setCategories(menuRes.data.categories || []);

        await loadReviews();
        await loadStaff();
      } catch (error) {
        console.error(error);
        if (!cancelled) alert("Unable to load restaurant.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadRestaurant();
    return () => { cancelled = true; };
  }, [slug]);

  // Load reviews
  const loadReviews = async () => {
    if (!slug) return;
    try {
      setReviewsLoading(true);
      const response = await api.get(`/restaurants/${slug}/reviews`);
      setReviews(response.data.reviews || []);
    } catch (error: any) {
      console.error(error);
    } finally {
      setReviewsLoading(false);
    }
  };

  const loadStaff = async () => {
    if (!slug) return;

    try {
      setStaffLoading(true);

      const response = await api.get(`/restaurants/${slug}/staff`);

      setStaff(response.data.staff || []);
    } catch (error: any) {
      console.error("Staff loading error:", error);
      setStaff([]);
    } finally {
      setStaffLoading(false);
    }
  };

  // Top reviews for scrolling
  const scrollingReviews = useMemo(() => {
    return [...reviews]
      .sort((a, b) => b.rating - a.rating)
      .slice(0, 10);
  }, [reviews]);

  const openItemPopup = (item: MenuItem) => {
    setSelectedMenuItem(item);
    setItemQuantity(1);
    setShowItemPopup(true);
  };

  const closeItemPopup = () => {
    setShowItemPopup(false);
    setSelectedMenuItem(null);
    setItemQuantity(1);
  };

  const addToCart = () => {
    if (!selectedMenuItem) return;

    setCartItems((current) => {
      const existing = current.find(
        (item) => item.id === selectedMenuItem.id
      );

      if (existing) {
        return current.map((item) =>
          item.id === selectedMenuItem.id
            ? {
              ...item,
              quantity: item.quantity + itemQuantity,
            }
            : item
        );
      }

      return [
        ...current,
        {
          ...selectedMenuItem,
          quantity: itemQuantity,
        },
      ];
    });

    closeItemPopup();
  };

  const increaseCartQuantity = (itemId: number) => {
    setCartItems((current) =>
      current.map((item) =>
        item.id === itemId
          ? {
            ...item,
            quantity: item.quantity + 1,
          }
          : item
      )
    );
  };

  const decreaseCartQuantity = (itemId: number) => {
    setCartItems((current) =>
      current
        .map((item) =>
          item.id === itemId
            ? {
              ...item,
              quantity: item.quantity - 1,
            }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const removeFromCart = (itemId: number) => {
    setCartItems((current) =>
      current.filter((item) => item.id !== itemId)
    );
  };

  const cartCount = cartItems.reduce(
    (total, item) => total + item.quantity,
    0
  );

  const cartTotal = cartItems.reduce(
    (total, item) =>
      total + Number(item.price) * item.quantity,
    0
  );

  // Submit review
  const submitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!restaurant) return;

    const token = localStorage.getItem("token");
    if (!token) {
      alert("Please login as customer first.");
      return;
    }

    try {
      setSubmitting(true);
      const response = await api.post(
        "/customer/reviews",
        { restaurant_id: restaurant.id, rating, review: reviewText },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setReviews((current) => [response.data.review, ...current]);
      setReviewText("");
      setRating(5);
      setShowReviewForm(false);
      alert("Review submitted successfully.");
    } catch (error: any) {
      console.error(error);
      alert(error.response?.data?.message || "Unable to submit review.");
    } finally {
      setSubmitting(false);
    }
  };
  const handleContactChange = (
    e: React.ChangeEvent<
      HTMLInputElement |
      HTMLTextAreaElement |
      HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;

    setContactForm((current) => ({
      ...current,
      [name]: value,
    }));
  };


  const submitContactForm = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    console.log("CONTACT FORM SUBMIT FIRED");

    setContactSubmitting(true);
    setContactSuccess(false);
    setContactError("");

    try {
      if (!restaurant?.id) {
        alert("Restaurant information is not available.");
        return;
      }

      const response = await api.post(
        "/contact/messages",
        {
          restaurant_id: restaurant.id,
          name: contactForm.name,
          email: contactForm.email,
          phone: contactForm.phone,
          subject: contactForm.subject,
          message: contactForm.message,
        }
      );

      console.log("CONTACT API SUCCESS:", response.data);

      setContactForm({
        name: "",
        email: "",
        phone: "",
        subject: "General Inquiry",
        message: "",
      });

      setContactSuccess(true);

      alert("Message sent successfully!");
    } catch (error: any) {
      console.error("CONTACT API ERROR:", error);

      alert(
        error.response?.data?.message ||
        "Unable to send your message."
      );

      setContactError(
        error.response?.data?.message ||
        "Unable to send your message. Please try again."
      );
    } finally {
      setContactSubmitting(false);
    }
  };

  // ============================================================
  // RESERVATION FORM CHANGE
  // ============================================================

  const handleReservationChange = (
    e: React.ChangeEvent<
      HTMLInputElement |
      HTMLTextAreaElement |
      HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;

    setReservationForm((current) => ({
      ...current,
      [name]:
        name === "guests"
          ? Number(value)
          : value,
    }));

    setReservationSuccess(false);
    setReservationError("");
  };


  // ============================================================
  // SUBMIT RESERVATION
  // ============================================================

  const submitReservation = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    if (!restaurant?.id) {
      setReservationError(
        "Restaurant information is not available."
      );
      return;
    }

    setReservationSubmitting(true);
    setReservationSuccess(false);
    setReservationError("");

    try {
      const response = await api.post("/reservations", {
        restaurant_id: restaurant.id,
        customer_name: reservationForm.name,
        phone: reservationForm.phone,
        email: reservationForm.email,
        guests: Number(reservationForm.guests),
        reservation_date: reservationForm.reservation_date,
        reservation_time: reservationForm.reservation_time,
        special_requests: reservationForm.special_request,
      });

      console.log(
        "RESERVATION SUCCESS:",
        response.data
      );

      // Clear form
      setReservationForm({
        name: "",
        email: "",
        phone: "",
        reservation_date: "",
        reservation_time: "",
        guests: 2,
        special_request: "",
      });

      // Show success message
      setReservationSuccess(true);

    } catch (error: any) {

      console.error(
        "RESERVATION ERROR:",
        error
      );

      setReservationError(
        error.response?.data?.message ||
        "Unable to submit reservation request. Please try again."
      );

    } finally {
      setReservationSubmitting(false);
    }
  };

  const getStars = (r: number) => {
    return Array.from({ length: 5 }, (_, i) => i < r);
  };







  // ✅ FIX: Loading state with AuthGuard
  if (loading) {
    return (
      <AuthGuard allowedRoles={["customer"]}>

        <main className="restaurant-page">
          <div className="restaurant-loading">
            <div className="loading-spinner"></div>
            <p>Loading restaurant...</p>
          </div>
        </main>
      </AuthGuard>
    );
  }

  // ✅ FIX: Not found state
  if (!restaurant) {
    return (
      <AuthGuard allowedRoles={["customer"]}>
        <main className="restaurant-page">
          <div className="restaurant-not-found">
            <i className="fas fa-store-slash"></i>
            <h2>Restaurant not found</h2>
          </div>
        </main>
      </AuthGuard>
    );
  }

  // ✅ FIX: Main return with all content
  return (
    <AuthGuard allowedRoles={["customer"]}>
      <RestaurantNavbar restaurant={restaurant} />
      {!showCart && cartItems.length > 0 && (
  <button
    type="button"
    className="floating-cart-btn"
    onClick={() => setShowCart(true)}
  >
    <span className="floating-cart-icon">
      <i className="fa-solid fa-cart-shopping"></i>

      <span className="floating-cart-count">
        {cartCount}
      </span>
    </span>

    <span className="floating-cart-text">
      View Cart
    </span>

    <span className="floating-cart-total">
      ₹{cartTotal.toFixed(2)}
    </span>
  </button>
)}

      <main className="restaurant-page">

        <section id="hero">
          <div className="hs hs1"></div>
          <div className="hs hs2"></div>

          <div className="hbgtxt">
            {restaurant.hero_title_line_2 || restaurant.name}
          </div>

          <div className="container">
            <div
              className="row align-items-center g-5"
              style={{ minHeight: "88vh" }}
            >

              {/* =========================
          LEFT SIDE
      ========================== */}
              <div className="col-lg-6">

                {/* BADGE */}
                <div className="hbadge">
                  <div className="hbi">
                    <i className="fas fa-star"></i>
                  </div>

                  <span>
                    {restaurant.hero_badge || "Welcome to our restaurant"}
                  </span>
                </div>

                {/* TITLE */}
                <h1 className="htitle">

                  {restaurant.hero_title_line_1 && (
                    <>
                      {restaurant.hero_title_line_1}
                      <br />
                    </>
                  )}

                  {restaurant.hero_title_line_2 && (
                    <span className="hl">
                      {restaurant.hero_title_line_2}
                    </span>
                  )}

                  {restaurant.hero_title_line_3 && (
                    <>
                      <br />
                      {restaurant.hero_title_line_3}
                    </>
                  )}

                  {restaurant.hero_title_line_4 && (
                    <>
                      <br />
                      {restaurant.hero_title_line_4}
                    </>
                  )}

                </h1>

                {/* DESCRIPTION */}
                <p className="hdesc">
                  {restaurant.hero_description ||
                    "Delicious food prepared fresh for you."}
                </p>

                {/* BUTTONS */}
                <div className="d-flex flex-wrap gap-3 mb-2">

                  <a href="#menu" className="btn-red">
                    <i className="fas fa-utensils"></i>

                    {restaurant.hero_explore_button ||
                      "Explore Menu"}
                  </a>

                  <a
                    href="#about"
                    className="magnific_popup btn-play popup-youtube"
                  >
                    <div className="pico">
                      <i className="fas fa-play"></i>
                    </div>

                    <span>
                      {restaurant.hero_story_button ||
                        "Our Story"}
                    </span>
                  </a>

                </div>

                {/* STATS */}
                <div className="hstats d-flex gap-3 flex-wrap mt-4">

                  {/* CUSTOMERS */}
                  <div className="hstat">
                    <span className="snum">
                      {restaurant.hero_customers_count || "—"}
                    </span>

                    <small>
                      Happy Customers
                    </small>
                  </div>

                  <div className="sdiv"></div>

                  {/* MENU */}
                  <div className="hstat">
                    <span className="snum">
                      {restaurant.hero_menu_count || "—"}
                    </span>

                    <small>
                      Menu Items
                    </small>
                  </div>

                  <div className="sdiv"></div>

                  {/* CHEFS */}
                  <div className="hstat">
                    <span className="snum">
                      {restaurant.hero_chefs_count || "—"}
                    </span>

                    <small>
                      Expert Chefs
                    </small>
                  </div>

                  <div className="sdiv"></div>

                  {/* EXPERIENCE */}
                  <div className="hstat">
                    <span className="snum">
                      {restaurant.hero_experience_count || "—"}
                    </span>

                    <small>
                      Experience
                    </small>
                  </div>

                </div>

              </div>


              {/* =========================
          RIGHT SIDE
      ========================== */}
              <div className="col-lg-6">

                <div
                  style={{
                    position: "relative",
                    textAlign: "center",
                  }}
                >

                  {/* MAIN RESTAURANT IMAGE */}
                  <div className="hcircle">

                    {getRestaurantImageUrl(
                      restaurant.hero_image
                    ) ? (
                      <img
                        src={getRestaurantImageUrl(
                          restaurant.hero_image
                        )!}
                        alt={restaurant.name}
                        style={{
                          width: "90%",
                          height: "90%",
                          objectFit: "cover",
                          borderRadius: "50%",
                        }}
                      />
                    ) : (
                      <Image
                        src={
                          restaurant.logo ||
                          "/img/banner-img.jpg"
                        }
                        alt={restaurant.name}
                        width={432}
                        height={432}
                        style={{
                          width: "90%",
                          height: "90%",
                          objectFit: "cover",
                          borderRadius: "50%",
                        }}
                      />
                    )}

                  </div>


                  {/* DEAL CARD */}
                  <div className="fcard fc1">

                    <div className="fcoi r">
                      <i className="fas fa-fire"></i>
                    </div>

                    <div>

                      <span className="fcnum">
                        {restaurant.hero_deal_title ||
                          "Special Deal"}
                      </span>

                      <span className="fcsm">
                        {restaurant.hero_deal_subtitle ||
                          "Great value for everyone"}
                      </span>

                    </div>

                  </div>


                  {/* RATING CARD */}
                  <div className="fcard fc2">

                    <div className="fcoi y">
                      <i className="fas fa-star"></i>
                    </div>

                    <div>

                      <span className="fcnum">
                        {restaurant.hero_rating ||
                          "5.0 ★"}
                      </span>

                      <span className="fcsm">
                        {restaurant.hero_reviews ||
                          "Happy Customers"}
                      </span>

                    </div>

                  </div>


                  {/* DELIVERY CARD */}
                  <div className="fcard fc3">

                    <div className="fcoi g">
                      <i className="fas fa-clock"></i>
                    </div>

                    <div>

                      <span className="fcnum">
                        {restaurant.hero_delivery_time ||
                          "Fast Delivery"}
                      </span>

                      <span className="fcsm">
                        {restaurant.hero_delivery_subtitle ||
                          "Fresh & Fast"}
                      </span>

                    </div>

                  </div>

                </div>

              </div>

            </div>
          </div>
        </section>

        {/* DYNAMIC MARQUEE */}
        {marqueeItems.length > 0 && (
          <div className="mqsec">
            <div className="mqtrack">

              {marqueeItems.map((item) => (
                <div
                  className="mqitem"
                  key={item.id}
                >
                  <i className="fas fa-circle"></i>
                  {item.text}
                </div>
              ))}

              {marqueeItems.map((item) => (
                <div
                  className="mqitem"
                  key={`duplicate-${item.id}`}
                >
                  <i className="fas fa-circle"></i>
                  {item.text}
                </div>
              ))}

            </div>
          </div>
        )}


        {/* What we offer */}

        {/* <!-- ABOUT --> */}
        <section id="about">
          <div className="container">
            <div className="row align-items-center g-5">

              {/* LEFT IMAGES */}
              <div className="col-lg-5" data-aos="fade-right">
                <div className="astack">

                  <div className="aexp">
                    <span className="anum">
                      {restaurant.about_years || "12+"}
                    </span>

                    <small>
                      Years of<br />
                      Excellence
                    </small>
                  </div>

                  <div className="amain">
                    <img
                      src={
                        restaurant.about_image_1
                          ? `${process.env.NEXT_PUBLIC_API_URL?.replace(
                            "/api",
                            ""
                          )}/storage/${restaurant.about_image_1}`
                          : "/img/about1.jpg"
                      }
                      alt={restaurant.name}
                    />
                  </div>

                  <div className="asm">
                    <img
                      src={
                        restaurant.about_image_2
                          ? `${process.env.NEXT_PUBLIC_API_URL?.replace(
                            "/api",
                            ""
                          )}/storage/${restaurant.about_image_2}`
                          : "/img/about2.jpg"
                      }
                      alt={restaurant.name}
                    />
                  </div>

                </div>
              </div>


              {/* RIGHT CONTENT */}
              <div className="col-lg-7" data-aos="fade-left">

                <span className="slbl">
                  Our Story
                </span>


                <h2 className="stitle text-start">

                  {restaurant.about_title ||
                    `We Invite You to Visit Our Food Restaurant`}

                </h2>


                <div className="sline lft"></div>


                <p className="sdesc mb-4">

                  {restaurant.about_description ||
                    "Discover delicious food, great ambiance and memorable experiences at our restaurant."}

                </p>


                {/* FEATURES */}
                <div className="mb-4">


                  {/* FEATURE 1 */}
                  {restaurant.about_feature_1_title && (
                    <div className="fti">

                      <div className="ftico r">
                        <i className="fas fa-leaf"></i>
                      </div>

                      <div>

                        <h6>
                          {restaurant.about_feature_1_title}
                        </h6>

                        <p>
                          {restaurant.about_feature_1_description}
                        </p>

                      </div>

                    </div>
                  )}


                  {/* FEATURE 2 */}
                  {restaurant.about_feature_2_title && (
                    <div className="fti">

                      <div className="ftico y">
                        <i className="fas fa-award"></i>
                      </div>

                      <div>

                        <h6>
                          {restaurant.about_feature_2_title}
                        </h6>

                        <p>
                          {restaurant.about_feature_2_description}
                        </p>

                      </div>

                    </div>
                  )}


                  {/* FEATURE 3 */}
                  {restaurant.about_feature_3_title && (
                    <div className="fti">

                      <div className="ftico g">
                        <i className="fas fa-shipping-fast"></i>
                      </div>

                      <div>

                        <h6>
                          {restaurant.about_feature_3_title}
                        </h6>

                        <p>
                          {restaurant.about_feature_3_description}
                        </p>

                      </div>

                    </div>
                  )}

                </div>


                <a href="#menu" className="btn-red">

                  <i className="fas fa-book-open"></i>

                  View Full Menu

                </a>

              </div>

            </div>
          </div>
        </section>


        {/* MENU SECTION */}
        <section id="menu">
          <div className="container">

            {/* SECTION HEADER */}
            <div
              className="text-center mb-4"
              data-aos="fade-up"
            >
              <span className="slbl">
                What's Cooking
              </span>

              <h2 className="stitle">
                Our Delicious <span>Menu</span>
              </h2>

              <div className="sline"></div>
            </div>

            {/* CATEGORY FILTERS */}
            {categories.length > 0 && (
              <div className="menu-category-filter">

                {/* ALL */}
                <button
                  type="button"
                  className={`menu-category-btn ${selectedCategory === "All"
                    ? "active"
                    : ""
                    }`}
                  onClick={() => {
                    setSelectedCategory("All");
                    setShowFullMenuMap({});
                  }}
                >
                  All
                </button>

                {/* DYNAMIC CATEGORIES */}
                {categories.map((category) => (
                  <button
                    key={category.id}
                    type="button"
                    className={`menu-category-btn ${selectedCategory === category.name
                      ? "active"
                      : ""
                      }`}
                    onClick={() => {
                      setSelectedCategory(category.name);
                      setShowFullMenuMap({});
                    }}
                  >
                    {category.name}
                  </button>
                ))}

              </div>
            )}

            {/* NO MENU */}
            {categories.length === 0 ? (

              <div className="text-center py-5">

                <div
                  style={{
                    fontSize: "3rem",
                    marginBottom: "15px",
                  }}
                >
                  🍽️
                </div>

                <h3>No menu items available</h3>

                <p style={{ color: "#888" }}>
                  This restaurant has not added any menu
                  items yet.
                </p>

              </div>

            ) : (

              /* FILTERED MENU */
              <div className="menu-filtered-content">

                {categories
                  .filter(
                    (category) =>
                      selectedCategory === "All" ||
                      category.name === selectedCategory
                  )
                  .map((category) => (

                    <div
                      key={category.id}
                      className="menu-category-block mb-5"
                      data-aos="fade-up"
                    >

                      {/* EMPTY CATEGORY */}
                      {category.items.length === 0 ? (

                        <div className="text-center py-3">

                          <p style={{ color: "#888" }}>
                            No items available in this
                            category.
                          </p>

                        </div>

                      ) : (

                        <div>
                          <div className="menu-items-grid">
                            {(showFullMenuMap[category.id]
                              ? category.items
                              : category.items.slice(0, 6)
                            ).map((item) => (
                              <div
                                key={item.id}
                                className="menu-item-grid"
                                data-aos="fade-up"
                              >
                                <div className="mcard">

                                  <div className="mimg">
                                    <div className="menu-item-placeholder">
                                      <i className="fas fa-utensils"></i>
                                    </div>
                                  </div>

                                  <div className="mbody">
                                    <div className="mname">
                                      {item.name}
                                    </div>

                                    <div className="mdesc">
                                      {item.description || "Delicious food prepared fresh for you."}
                                    </div>

                                    <div className="mfooter">
                                      <span className="mprice">
                                        ₹{Number(item.price).toFixed(2)}
                                      </span>

                                      <div className="menu-card-actions">
                                        <span className="mtype">
                                          {item.food_type}
                                        </span>

                                        <button
                                          type="button"
                                          className="menu-add-btn"
                                          onClick={() => openItemPopup(item)}
                                          aria-label={`Add ${item.name} to cart`}
                                        >
                                          <i className="fas fa-plus"></i>
                                        </button>
                                      </div>
                                    </div>
                                  </div>

                                </div>
                              </div>
                            ))}
                          </div>

                          {category.items.length > 6 && (
                            <div className="menu-view-more-wrapper">
                              <button
                                type="button"
                                className="menu-view-more-btn"
                                onClick={() =>
                                  setShowFullMenuMap((prev) => ({
                                    ...prev,
                                    [category.id]: !prev[category.id],
                                  }))
                                }
                              >
                                {showFullMenuMap[category.id] ? (
                                  <>
                                    Show Less
                                    <i className="fas fa-chevron-up"></i>
                                  </>
                                ) : (
                                  <>
                                    View More Menu
                                    <i className="fas fa-arrow-down"></i>
                                  </>
                                )}
                              </button>
                            </div>
                          )}
                        </div>
                      )}

                    </div>

                  ))}

              </div>

            )}

          </div>
        </section>

        {/* STAFF */}
        <section id="staff">
          <div className="container">

            <div
              className="text-center mb-5"
              data-aos="fade-up"
            >
              <span className="slbl">
                Our Team
              </span>

              <h2 className="stitle">
                Meet Our <span>Staff</span>
              </h2>

              <div className="sline"></div>
            </div>

            {staffLoading ? (
              <div className="text-center py-5">
                <div className="loading-spinner"></div>
                <p>Loading our team...</p>
              </div>
            ) : staff.length === 0 ? (
              <div className="text-center py-5">
                <div style={{ fontSize: "3rem", marginBottom: "15px" }}>
                  👨‍🍳
                </div>

                <h3>Our Team</h3>

                <p style={{ color: "#888" }}>
                  Staff information is not available yet.
                </p>
              </div>
            ) : (
              <div className="staff-grid">

                {staff.map((member, index) => (
                  <div
                    className="staff-grid-item"
                    key={member.id}
                    data-aos="fade-up"
                    data-aos-delay={index * 80}
                  >
                    <div className="chcard">

                      {/* STAFF IMAGE */}
                      <div className="chimg">

                        {getStaffImageUrl(member.profile_image) ? (
                          <img
                            src={getStaffImageUrl(member.profile_image)!}
                            alt={member.owner_name}
                          />
                        ) : (
                          <div className="staff-avatar-placeholder">
                            <i className="fas fa-user"></i>
                          </div>
                        )}

                        {/* SOCIAL / ACTION */}
                        <div className="chsoc">

                          <a
                            href="#contact-section"
                            title="Contact Restaurant"
                          >
                            <i className="fas fa-phone"></i>
                          </a>

                          <a
                            href="#contact-section"
                            title="Email Restaurant"
                          >
                            <i className="fas fa-envelope"></i>
                          </a>

                          <a
                            href="#reviews"
                            title="Reviews"
                          >
                            <i className="fas fa-star"></i>
                          </a>

                        </div>

                      </div>

                      {/* STAFF INFO */}
                      <div className="chbody">

                        <div className="chnm">
                          {member.owner_name}
                        </div>

                        <div className="chrole">
                          {member.staff_role || "Restaurant Staff"}
                        </div>

                        <div className="chexp">
                          <i className="fas fa-user-check"></i>
                          Active Staff
                        </div>

                      </div>

                    </div>
                  </div>
                ))}

              </div>
            )}

          </div>
        </section>

        {/* ============================================================
    RESERVATION SECTION
============================================================ */}

        <section id="reservation">

          <div className="container">

            {/* SECTION HEADER */}
            <div
              className="text-center mb-5"
              data-aos="fade-up"
            >
              <span className="slbl">
                Book a Table
              </span>

              <h2 className="stitle">
                Make a <span>Reservation</span>
              </h2>

              <div className="sline"></div>

              <p
                className="sdesc mx-auto"
                style={{ maxWidth: "500px" }}
              >
                Reserve your table for a memorable dining experience.
                We recommend booking 24 hours in advance for weekend
                evenings.
              </p>
            </div>


            {/* RESERVATION CONTENT */}
            <div className="row g-4 justify-content-center">

              {/* ========================================================
          LEFT — RESERVATION INFO
      ======================================================== */}

              <div
                className="col-lg-4"
                data-aos="fade-right"
              >

                <div className="reservation-info">

                  <h4>
                    Contact Info
                  </h4>

                  <p className="reservation-info-subtitle">
                    We're happy to help you plan the perfect dining
                    experience.
                  </p>


                  {/* OPENING HOURS */}
                  <div className="reservation-info-item">

                    <div className="reservation-info-icon">
                      <i className="fas fa-clock"></i>
                    </div>

                    <div>
                      <strong>
                        OPENING HOURS
                      </strong>

                      <span>
                        Wed - Sun, 9 AM - 11 PM
                      </span>
                    </div>

                  </div>


                  {/* PHONE */}
                  <div className="reservation-info-item">

                    <div className="reservation-info-icon">
                      <i className="fas fa-phone"></i>
                    </div>

                    <div>
                      <strong>
                        CALL FOR BOOKING
                      </strong>

                      <span>
                        {restaurant.phone || "+1 (800) 123-4567"}
                      </span>
                    </div>

                  </div>


                  {/* GROUP DINING */}
                  <div className="reservation-info-item">

                    <div className="reservation-info-icon">
                      <i className="fas fa-users"></i>
                    </div>

                    <div>
                      <strong>
                        GROUP DINING
                      </strong>

                      <span>
                        Special menus for 10+ guests
                      </span>
                    </div>

                  </div>


                  {/* LOCATION */}
                  <div className="reservation-info-item">

                    <div className="reservation-info-icon">
                      <i className="fas fa-map-marker-alt"></i>
                    </div>

                    <div>
                      <strong>
                        LOCATION
                      </strong>

                      <span>
                        {restaurant.address || "Address not available"}
                      </span>
                    </div>

                  </div>

                </div>

              </div>


              {/* ========================================================
          RIGHT — RESERVATION FORM
      ======================================================== */}

              <div
                className="col-lg-8"
                data-aos="fade-left"
              >

                <div className="reservation-form-card">

                  <form onSubmit={submitReservation}>

                    <div className="row g-3">


                      {/* NAME */}
                      <div className="col-md-6">

                        <label className="flbl">
                          Full Name *
                        </label>

                        <input
                          type="text"
                          name="name"
                          className="fctrl"
                          placeholder="John Doe"
                          value={reservationForm.name}
                          onChange={handleReservationChange}
                          required
                        />

                      </div>


                      {/* PHONE */}
                      <div className="col-md-6">

                        <label className="flbl">
                          Phone Number *
                        </label>

                        <input
                          type="tel"
                          name="phone"
                          className="fctrl"
                          placeholder="+1 (800) 000-0000"
                          value={reservationForm.phone}
                          onChange={handleReservationChange}
                          required
                        />

                      </div>


                      {/* EMAIL */}
                      <div className="col-md-6">

                        <label className="flbl">
                          Email Address *
                        </label>

                        <input
                          type="email"
                          name="email"
                          className="fctrl"
                          placeholder="you@email.com"
                          value={reservationForm.email}
                          onChange={handleReservationChange}
                          required
                        />

                      </div>


                      {/* GUESTS */}
                      <div className="col-md-6">

                        <label className="flbl">
                          Number of Guests *
                        </label>

                        <select
                          name="guests"
                          className="fctrl"
                          value={reservationForm.guests}
                          onChange={handleReservationChange}
                          required
                        >

                          <option value={1}>
                            1 Person
                          </option>

                          <option value={2}>
                            2 People
                          </option>

                          <option value={3}>
                            3 People
                          </option>

                          <option value={4}>
                            4 People
                          </option>

                          <option value={5}>
                            5 People
                          </option>

                          <option value={6}>
                            6 People
                          </option>

                          <option value={7}>
                            7 People
                          </option>

                          <option value={8}>
                            8 People
                          </option>

                          <option value={9}>
                            9 People
                          </option>

                          <option value={10}>
                            10 People
                          </option>

                        </select>

                      </div>


                      {/* DATE */}
                      <div className="col-md-6">

                        <label className="flbl">
                          Date *
                        </label>

                        <input
                          type="date"
                          name="reservation_date"
                          className="fctrl"
                          value={reservationForm.reservation_date}
                          onChange={handleReservationChange}
                          min={new Date().toISOString().split("T")[0]}
                          required
                        />

                      </div>


                      {/* TIME */}
                      <div className="col-md-6">

                        <label className="flbl">
                          Time *
                        </label>

                        <input
                          type="time"
                          name="reservation_time"
                          className="fctrl"
                          value={reservationForm.reservation_time}
                          onChange={handleReservationChange}
                          required
                        />

                      </div>


                      {/* SPECIAL REQUEST */}
                      <div className="col-12">

                        <label className="flbl">
                          Special Requests
                        </label>

                        <textarea
                          name="special_request"
                          className="fctrl"
                          rows={4}
                          placeholder="Allergies, dietary needs, special occasions..."
                          value={reservationForm.special_request}
                          onChange={handleReservationChange}
                        />

                      </div>


                      {/* ERROR */}
                      {reservationError && (

                        <div className="col-12">

                          <div className="reservation-error">
                            <i className="fas fa-exclamation-circle"></i>

                            <span>
                              {reservationError}
                            </span>
                          </div>

                        </div>

                      )}


                      {/* SUCCESS */}
                      {reservationSuccess && (

                        <div className="col-12">

                          <div className="reservation-success">

                            <i className="fas fa-check-circle"></i>

                            <div>
                              <strong>
                                Reservation Request Submitted
                              </strong>

                              <p>
                                Your reservation request has been submitted
                                successfully. Our restaurant team will contact
                                you by phone or email to confirm your booking.
                              </p>
                            </div>

                          </div>

                        </div>

                      )}


                      {/* SUBMIT BUTTON */}
                      <div className="col-12">

                        <button
                          type="submit"
                          className="reservation-submit-btn"
                          disabled={reservationSubmitting}
                        >

                          {reservationSubmitting ? (
                            <>
                              <i className="fas fa-spinner fa-spin"></i>
                              Submitting Request...
                            </>
                          ) : (
                            <>
                              <i className="fas fa-calendar-check"></i>
                              Confirm Reservation
                            </>
                          )}

                        </button>

                      </div>

                    </div>

                  </form>

                </div>

              </div>

            </div>

          </div>

        </section>

        {/* REVIEWS SECTION */}
        <section className="restaurant-reviews" id="reviews">
          <div className="restaurant-container">
            <div className="section-header">
              <span className="section-badge">Testimonials</span>
              <h2>What Our <span className="text-highlight">Customers</span> Say</h2>
              <p>Real feedback from real diners</p>
            </div>

            {reviewsLoading ? (
              <div className="loading-reviews">
                <div className="loading-spinner-sm"></div>
                <p>Loading reviews...</p>
              </div>
            ) : reviews.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">
                  <i className="fas fa-star"></i>
                </div>
                <h3>No Reviews Yet</h3>
                <p>Be the first to share your experience!</p>
              </div>
            ) : (
              <div className="reviews-grid" ref={sliderRef}>
                {scrollingReviews.map((item) => (
                  <div className="review-card" key={item.id}>
                    <div className="review-stars">
                      {getStars(item.rating).map((filled, i) => (
                        <i key={i} className={`fas fa-star ${filled ? "star-filled" : "star-empty"}`}></i>
                      ))}
                    </div>
                    <p className="review-text">
                      {item.review || "Great experience!"}
                    </p>
                    <div className="review-author">
                      <div className="review-avatar">
                        {(item.customer?.name || "C").charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <strong>{item.customer?.name || "Customer"}</strong>
                        <span>Verified Customer</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="review-action">
              <button className="write-review-btn" onClick={() => setShowReviewForm(!showReviewForm)}>
                <i className={`fas fa-${showReviewForm ? "times" : "edit"}`}></i>
                {showReviewForm ? "Cancel" : "Write a Review"}
              </button>
            </div>

            {showReviewForm && (
              <div className="review-form-card">
                <h3>Share Your Experience</h3>
                <form onSubmit={submitReview}>
                  <div className="form-group">
                    <label>Your Rating</label>
                    <div className="input-wrapper">
                      <i className="fas fa-star input-icon"></i>
                      <select value={rating} onChange={(e) => setRating(Number(e.target.value))}>
                        <option value={5}>⭐⭐⭐⭐⭐ Excellent</option>
                        <option value={4}>⭐⭐⭐⭐ Very Good</option>
                        <option value={3}>⭐⭐⭐ Good</option>
                        <option value={2}>⭐⭐ Average</option>
                        <option value={1}>⭐ Poor</option>
                      </select>
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Your Review</label>
                    <textarea
                      value={reviewText}
                      onChange={(e) => setReviewText(e.target.value)}
                      placeholder="Tell us about your experience..."
                      rows={4}
                      required
                      className="review-textarea"
                    />
                  </div>
                  <button type="submit" className="submit-review-btn" disabled={submitting}>
                    {submitting ? (
                      <><i className="fas fa-spinner fa-spin"></i> Submitting...</>
                    ) : (
                      <><i className="fas fa-paper-plane"></i> Submit Review</>
                    )}
                  </button>
                </form>
              </div>
            )}
          </div>
        </section>

        {/* ============================================================
    CONTACT SECTION
============================================================ */}
        <section id="contact-section">

          <div className="container">

            {/* SECTION HEADER */}
            <div
              className="text-center mb-5"
              data-aos="fade-up"
            >
              <span className="slbl">
                Get In Touch
              </span>

              <h2 className="stitle">
                Contact <span>Us</span>
              </h2>

              <div className="sline"></div>

              <p
                className="sdesc mx-auto"
                style={{ maxWidth: "480px" }}
              >
                Have a question, feedback, or want to plan
                a special event? We'd love to hear from you.
              </p>
            </div>


            <div className="menu-items-grid">


              {/* ========================================================
          LEFT — CONTACT INFORMATION
      ======================================================== */}
              <div
                className="col-lg-4"
                data-aos="fade-right"
              >

                <div className="ctdark">

                  <h4>
                    Let's Talk
                  </h4>

                  <p className="ctsub">
                    We typically respond within 2 hours
                    during business hours.
                  </p>


                  {/* ADDRESS */}
                  <div className="ctitem">

                    <div className="cticon">
                      <i className="fas fa-map-marker-alt"></i>
                    </div>

                    <div className="ctinfo">

                      <strong>
                        Address
                      </strong>

                      <span>
                        {restaurant.address || "Address not available"}
                      </span>

                    </div>

                  </div>


                  {/* PHONE */}
                  <div className="ctitem">

                    <div className="cticon">
                      <i className="fas fa-phone-alt"></i>
                    </div>

                    <div className="ctinfo">

                      <strong>
                        Phone
                      </strong>

                      <span>
                        {restaurant.phone || "Phone not available"}
                      </span>

                    </div>

                  </div>


                  {/* EMAIL */}
                  <div className="ctitem">

                    <div className="cticon">
                      <i className="fas fa-envelope"></i>
                    </div>

                    <div className="ctinfo">

                      <strong>
                        Email
                      </strong>

                      <span>
                        {restaurant.email || "Email not available"}
                      </span>

                    </div>

                  </div>


                  {/* SOCIAL LINKS */}

                </div>

              </div>


              {/* ========================================================
          RIGHT — CONTACT FORM
      ======================================================== */}
              <div
                className="col-lg-8"
                data-aos="fade-left"
              >

                <div className="fcard">

                  <form
                    onSubmit={submitContactForm}
                  >

                    <div className="row g-3">


                      {/* NAME */}
                      <div className="col-sm-6">

                        <label className="flbl">
                          Your Name *
                        </label>

                        <input
                          type="text"
                          name="name"
                          className="fctrl"
                          placeholder="John Doe"
                          value={contactForm.name}
                          onChange={handleContactChange}
                          required
                        />

                      </div>


                      {/* EMAIL */}
                      <div className="col-sm-6">

                        <label className="flbl">
                          Email Address *
                        </label>

                        <input
                          type="email"
                          name="email"
                          className="fctrl"
                          placeholder="you@email.com"
                          value={contactForm.email}
                          onChange={handleContactChange}
                          required
                        />

                      </div>


                      {/* PHONE */}
                      <div className="col-sm-6">

                        <label className="flbl">
                          Phone Number
                        </label>

                        <input
                          type="tel"
                          name="phone"
                          className="fctrl"
                          placeholder="+91 98765 43210"
                          value={contactForm.phone}
                          onChange={handleContactChange}
                        />

                      </div>


                      {/* SUBJECT */}
                      <div className="col-sm-6">

                        <label className="flbl">
                          Subject *
                        </label>

                        <select
                          name="subject"
                          className="fctrl"
                          value={contactForm.subject}
                          onChange={handleContactChange}
                          required
                        >

                          <option value="General Inquiry">
                            General Inquiry
                          </option>

                          <option value="Catering & Events">
                            Catering & Events
                          </option>

                          <option value="Feedback">
                            Feedback
                          </option>

                          <option value="Partnership">
                            Partnership
                          </option>

                          <option value="Media & Press">
                            Media & Press
                          </option>

                        </select>

                      </div>


                      {/* MESSAGE */}
                      <div className="col-12">

                        <label className="flbl">
                          Message *
                        </label>

                        <textarea
                          name="message"
                          className="fctrl"
                          rows={5}
                          placeholder="Write your message here..."
                          value={contactForm.message}
                          onChange={handleContactChange}
                          required
                        />

                      </div>


                      {/* ERROR */}
                      {contactError && (

                        <div className="col-12">

                          <div
                            style={{
                              padding: "12px 16px",
                              borderRadius: "8px",
                              background: "#fff1f1",
                              color: "#d32f2f",
                            }}
                          >
                            {contactError}
                          </div>

                        </div>

                      )}


                      {/* SUCCESS */}
                      {contactSuccess && (

                        <div className="col-12">

                          <div className="sucmsg">

                            <i className="fas fa-check-circle"></i>

                            <p>
                              Message sent! We'll reply
                              within 2 hours.
                            </p>

                          </div>

                        </div>

                      )}


                      {/* SUBMIT */}
                      <div className="col-12">

                        <button
                          type="submit"
                          className="btn-red"
                          disabled={contactSubmitting}
                        >

                          {contactSubmitting ? (

                            <>
                              <i className="fas fa-spinner fa-spin"></i>
                              Sending...
                            </>

                          ) : (

                            <>
                              <i className="fas fa-paper-plane"></i>
                              Send Message
                            </>

                          )}

                        </button>

                      </div>

                    </div>

                  </form>

                </div>

              </div>

            </div>

          </div>

        </section>
        {showItemPopup && selectedMenuItem && (
          <div
            className="order-item-overlay"
            onClick={closeItemPopup}
          >
            <div
              className="order-item-popup"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                className="order-popup-close"
                onClick={closeItemPopup}
              >
                <i className="fas fa-times"></i>
              </button>

              <div className="order-popup-image">
                <i className="fas fa-utensils"></i>
              </div>

              <div className="order-popup-content">
                <span className="order-popup-type">
                  {selectedMenuItem.food_type}
                </span>

                <h3>{selectedMenuItem.name}</h3>

                <p>
                  {selectedMenuItem.description ||
                    "Delicious food prepared fresh for you."}
                </p>

                <div className="order-popup-price">
                  ₹{Number(selectedMenuItem.price).toFixed(2)}
                </div>

                <div className="order-popup-bottom">
                  <div className="quantity-control">
                    <button
                      type="button"
                      onClick={() =>
                        setItemQuantity((qty) => Math.max(1, qty - 1))
                      }
                    >
                      −
                    </button>

                    <span>{itemQuantity}</span>

                    <button
                      type="button"
                      onClick={() =>
                        setItemQuantity((qty) => qty + 1)
                      }
                    >
                      +
                    </button>
                  </div>

                  <button
                    type="button"
                    className="add-to-cart-popup-btn"
                    onClick={addToCart}
                  >
                    <i className="fas fa-shopping-cart"></i>
                    Add to Cart
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

      </main>
      {showCart && (
        <div
          className="cart-overlay"
          onClick={() => setShowCart(false)}
        >
          <div
            className="cart-drawer"
            onClick={(e) => e.stopPropagation()}
          >

            {/* CART HEADER */}
            <div className="cart-header">

              <div>
                <span className="cart-header-label">
                  Your Order
                </span>

                <h3>
                  Shopping Cart
                </h3>
              </div>

              <button
                type="button"
                className="cart-close-btn"
                onClick={() => setShowCart(false)}
              >
                <i className="fas fa-times"></i>
              </button>

            </div>


            {/* CART ITEMS */}
            <div className="cart-items">

              {cartItems.length === 0 ? (

                <div className="cart-empty">
                  <i className="fas fa-shopping-basket"></i>

                  <h4>Your cart is empty</h4>

                  <p>
                    Add some delicious items from the menu.
                  </p>
                </div>

              ) : (

                cartItems.map((item) => (

                  <div
                    className="cart-item"
                    key={item.id}
                  >

                    <div className="cart-item-image">
                      <i className="fas fa-utensils"></i>
                    </div>


                    <div className="cart-item-info">

                      <h4>
                        {item.name}
                      </h4>

                      <span className="cart-item-price">
                        ₹{Number(item.price).toFixed(2)}
                      </span>


                      <div className="cart-item-bottom">

                        <div className="cart-quantity">

                          <button
                            type="button"
                            onClick={() =>
                              decreaseCartQuantity(item.id)
                            }
                          >
                            −
                          </button>

                          <span>
                            {item.quantity}
                          </span>

                          <button
                            type="button"
                            onClick={() =>
                              increaseCartQuantity(item.id)
                            }
                          >
                            +
                          </button>

                        </div>


                        <strong className="cart-item-total">
                          ₹
                          {(
                            Number(item.price) *
                            item.quantity
                          ).toFixed(2)}
                        </strong>

                      </div>


                      <button
                        type="button"
                        className="cart-remove-btn"
                        onClick={() =>
                          removeFromCart(item.id)
                        }
                      >
                        Remove
                      </button>

                    </div>

                  </div>

                ))

              )}

            </div>


            {/* CART FOOTER */}
            {cartItems.length > 0 && (

              <div className="cart-footer">

                <div className="cart-summary-row">
                  <span>
                    Subtotal
                  </span>

                  <strong>
                    ₹{cartTotal.toFixed(2)}
                  </strong>
                </div>


                <div className="cart-summary-row">
                  <span>
                    Delivery
                  </span>

                  <strong>
                    Calculated at checkout
                  </strong>
                </div>


                <div className="cart-summary-divider"></div>


                <div className="cart-summary-total">
                  <span>
                    Total
                  </span>

                  <strong>
                    ₹{cartTotal.toFixed(2)}
                  </strong>
                </div>


                <button
  type="button"
  className="go-to-cart-btn"
  onClick={() => {
    setShowCart(false);
    router.push(
  `/cart?slug=${encodeURIComponent(slug)}`
);
  }}
>
  Go to Cart
  <i className="fas fa-arrow-right"></i>
</button>

              </div>

            )}

          </div>
        </div>
      )}
    </AuthGuard>
  );
}                 