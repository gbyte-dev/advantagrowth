<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Reservation;
use App\Models\Restaurant;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ReservationController extends Controller
{
    /**
     * Customer creates reservation
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'restaurant_id' => ['required', 'integer', 'exists:restaurants,id'],
            'customer_name' => ['required', 'string', 'max:255'],
            'phone' => ['required', 'string', 'max:20'],
            'email' => ['required', 'email', 'max:255'],
            'guests' => ['required', 'integer', 'min:1', 'max:100'],
            'reservation_date' => ['required', 'date'],
            'reservation_time' => ['required'],
            'special_requests' => ['nullable', 'string', 'max:2000'],
        ]);

        /*
         * Check if same restaurant already has an active
         * reservation at the same date and time.
         *
         * Only confirmed reservations block the slot.
         */
        $alreadyBooked = Reservation::where('restaurant_id', $validated['restaurant_id'])
            ->where('reservation_date', $validated['reservation_date'])
            ->where('reservation_time', $validated['reservation_time'])
            ->where('status', 'confirmed')
            ->exists();

        if ($alreadyBooked) {
            return response()->json([
                'success' => false,
                'message' => 'This time slot is already reserved.',
            ], 409);
        }

        $reservation = Reservation::create([
            'restaurant_id' => $validated['restaurant_id'],
            'customer_name' => $validated['customer_name'],
            'phone' => $validated['phone'],
            'email' => $validated['email'],
            'guests' => $validated['guests'],
            'reservation_date' => $validated['reservation_date'],
            'reservation_time' => $validated['reservation_time'],
            'special_requests' => $validated['special_requests'] ?? null,
            'status' => 'pending',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Reservation request has been submitted.',
            'reservation' => $reservation,
        ], 201);
    }

    /**
     * Owner sees reservations of his restaurant
     */
    public function ownerReservations(Request $request)
    {
        $user = Auth::user();

        if (!$user || !$user->restaurant_id) {
            return response()->json([
                'success' => false,
                'message' => 'Restaurant not found for this owner.',
            ], 403);
        }

        $reservations = Reservation::where('restaurant_id', $user->restaurant_id)
            ->orderBy('reservation_date', 'desc')
            ->orderBy('reservation_time', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'reservations' => $reservations,
        ]);
    }

    /**
     * Owner confirms or cancels reservation
     */
    public function updateStatus(Request $request, Reservation $reservation)
    {
        $user = Auth::user();

        if (!$user || $reservation->restaurant_id !== $user->restaurant_id) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized.',
            ], 403);
        }

        $validated = $request->validate([
            'status' => ['required', 'in:confirmed,cancelled'],
        ]);

        $reservation->update([
            'status' => $validated['status'],
        ]);

        return response()->json([
            'success' => true,
            'message' => $validated['status'] === 'confirmed'
                ? 'Reservation confirmed successfully.'
                : 'Reservation cancelled successfully.',
            'reservation' => $reservation->fresh(),
        ]);
    }
}