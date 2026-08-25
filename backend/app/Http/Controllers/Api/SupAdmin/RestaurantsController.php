<?php

namespace App\Http\Controllers\Api\SupAdmin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Restaurant;
use App\Models\Subscription;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Cache;

class RestaurantsController extends Controller
{
    /**
     * Fetch (and cache) live exchange rates, quoted against USD.
     */
    private function getExchangeRates(): array
    {
        return Cache::remember('exchange_rates_usd', now()->addHours(12), function () {
            try {
                // Local WAMP PHP has no configured CA bundle (curl.cainfo), so SSL
                // verification is skipped for this public, non-sensitive, read-only rate feed.
                $response = Http::withOptions(['verify' => false])
                    ->timeout(5)
                    ->get('https://open.er-api.com/v6/latest/USD');

                if ($response->successful() && $response->json('result') === 'success') {
                    return $response->json('rates') ?? [];
                }
            } catch (\Exception $e) {
                // fall through to empty rates below
            }

            return [];
        });
    }

    /**
     * Convert an amount from one currency to another using USD-based rates.
     * Falls back to the original amount if either currency's rate is unavailable.
     */
    private function convertCurrency(float $amount, string $from, string $to, array $rates): float
    {
        if ($from === $to) {
            return $amount;
        }

        if (!isset($rates[$from]) || !isset($rates[$to])) {
            return $amount;
        }

        $usdAmount = $amount / $rates[$from];
        return $usdAmount * $rates[$to];
    }

    /**
     * Dashboard KPI stats.
     */
    public function stats(Request $request)
    {
        try {
            $targetCurrency = strtoupper($request->query('currency', 'INR'));
            $rates = $this->getExchangeRates();

            $totalRestaurants = Restaurant::count();
            $activeRestaurants = Restaurant::where('is_active', true)->count();
            $inactiveRestaurants = Restaurant::where('is_active', false)->count();

            $activeSubscriptions = Subscription::where('is_active', true)->get(['price', 'currency']);
            $totalRevenue = $activeSubscriptions->sum(function ($subscription) use ($targetCurrency, $rates) {
                return $this->convertCurrency(
                    (float) $subscription->price,
                    strtoupper($subscription->currency ?? 'USD'),
                    $targetCurrency,
                    $rates
                );
            });

            return response()->json([
                'success' => true,
                'data' => [
                    'total_restaurants' => $totalRestaurants,
                    'active_restaurants' => $activeRestaurants,
                    'inactive_restaurants' => $inactiveRestaurants,
                    'total_revenue' => round($totalRevenue, 2),
                    'currency' => $targetCurrency,
                ],
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch dashboard stats.',
            ], 500);
        }
    }

    /**
     * Revenue trend for the dashboard chart — for each day in the range,
     * the total price of subscriptions created on or before that day
     * (that are still active), compared against the same point one period earlier.
     */
    public function revenueTrend(Request $request)
    {
        try {
            $days = max(1, (int) $request->query('days', 30));
            $targetCurrency = strtoupper($request->query('currency', 'INR'));
            $rates = $this->getExchangeRates();

            $subscriptions = Subscription::where('is_active', true)->get(['price', 'currency', 'created_at']);

            $convertedPrice = function ($subscription) use ($targetCurrency, $rates) {
                return $this->convertCurrency(
                    (float) $subscription->price,
                    strtoupper($subscription->currency ?? 'USD'),
                    $targetCurrency,
                    $rates
                );
            };

            $today = now()->startOfDay();
            $series = [];

            for ($i = $days - 1; $i >= 0; $i--) {
                $date = $today->copy()->subDays($i);
                $cutoff = $date->copy()->endOfDay();
                $previousCutoff = $date->copy()->subDays($days)->endOfDay();

                $currentTotal = $subscriptions
                    ->filter(fn ($s) => $s->created_at->lte($cutoff))
                    ->sum($convertedPrice);

                $previousTotal = $subscriptions
                    ->filter(fn ($s) => $s->created_at->lte($previousCutoff))
                    ->sum($convertedPrice);

                $series[] = [
                    'date' => $date->format('Y-m-d'),
                    'current' => round($currentTotal, 2),
                    'previous' => round($previousTotal, 2),
                ];
            }

            return response()->json([
                'success' => true,
                'data' => $series,
                'currency' => $targetCurrency,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch revenue trend.',
            ], 500);
        }
    }

    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        try {
            $data = Restaurant::latest()->get();

            return response()->json([
                'success' => true,
                'message' => 'Restaurants fetched successfully',
                'data' => $data,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch restaurants. Please try again.',
            ], 500);
        }
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $req)
    {
        $validate=$req->validate([
            'name' => 'required|string|max:255',
            'legal_name' => 'nullable|string|max:255',
            'business_category' => 'nullable|string|max:255',
            'vat_number' => 'nullable|string|max:255',
            'address_line_1' => 'nullable|string|max:255',
            'address_line_2' => 'nullable|string|max:255',
            'city' => 'nullable|string|max:255',
            'postal_code' => 'nullable|string|max:30',
            'country' => 'nullable|string|max:100',
            'phone' => 'required|string|max:20',
            'email' => 'required|email|max:255|unique:restaurants,email',
            'password' => 'required|string|min:6',
            'website' => 'nullable|string|max:255',
            'currency' => 'nullable|string|max:10',
            'timezone' => 'nullable|string|max:100',
            'opening_time' => 'nullable|date_format:H:i',
            'closing_time' => 'nullable|date_format:H:i',
        ]);
        try {
            $validate['slug'] = Str::slug($validate['name']) . '-' . time();
            $restaurant = Restaurant::create($validate);

            return response()->json([
                'success' => true,
                'message' => 'Restaurant created successfully',
                'data' => $restaurant,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to create restaurant. Please try again.',
            ], 500);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        try {
            $restaurant = Restaurant::find($id);
            if (!$restaurant) {
                return response()->json([
                    'success' => false,
                    'message' => 'Restaurant not found',
                ], 404);
            }

            return response()->json([
                'success' => true,
                'message' => 'Restaurant fetched successfully',
                'data' => $restaurant,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch restaurant. Please try again.',
            ], 500);
        }
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $req, string $id)
    {
        $restaurant=Restaurant::find($id);
           if(!$restaurant){
            return response()->json([
                 'success' => false,
            'message' => 'Restaurant not found',
            ],404);
        }

          $validate=$req->validate([
            'name' => 'required|string|max:255',
            'legal_name' => 'nullable|string|max:255',
            'business_category' => 'nullable|string|max:255',
            'vat_number' => 'nullable|string|max:255',
            'address_line_1' => 'nullable|string|max:255',
            'address_line_2' => 'nullable|string|max:255',
            'city' => 'nullable|string|max:255',
            'postal_code' => 'nullable|string|max:30',
            'country' => 'nullable|string|max:100',
            'phone' => 'required|string|max:20',
            'email' => 'required|email|max:255|unique:restaurants,email,' . $id,
            'password' => 'nullable|string|min:6',
            'website' => 'nullable|string|max:255',
            'currency' => 'nullable|string|max:10',
            'timezone' => 'nullable|string|max:100',
            'opening_time' => 'nullable|date_format:H:i',
            'closing_time' => 'nullable|date_format:H:i',
        ]);

        if (empty($validate['password'])) {
            unset($validate['password']);
        }

        try {
            $restaurant->update($validate);

            return response()->json([
                'success' => true,
                'message' => 'Restaurant updated successfully',
                'data' => $restaurant->fresh(),
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update restaurant. Please try again.',
            ], 500);
        }
    }

    /**
     * Toggle the active/blocked status of the specified resource.
     */
    public function toggleStatus(string $id)
    {
        $restaurant = Restaurant::find($id);
        if (!$restaurant) {
            return response()->json([
                'success' => false,
                'message' => 'Restaurant not found',
            ], 404);
        }

        try {
            $restaurant->is_active = !$restaurant->is_active;
            $restaurant->save();

            return response()->json([
                'success' => true,
                'message' => $restaurant->is_active ? 'Restaurant unblocked successfully' : 'Restaurant blocked successfully',
                'is_active' => $restaurant->is_active,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update restaurant status. Please try again.',
            ], 500);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $restaurant=Restaurant::find($id);
        if(!$restaurant){
            return response()->json([
            'success' => false,
            'message' => 'Restaurant not found',
            ],404);
        }
        try {
            $restaurant->delete();

            return response()->json([
                'success' => true,
                'message' => 'Restaurant deleted successfully',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete restaurant. Please try again.',
            ], 500);
        }
    }
}
