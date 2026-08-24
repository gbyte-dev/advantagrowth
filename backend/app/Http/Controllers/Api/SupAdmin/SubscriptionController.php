<?php

namespace App\Http\Controllers\Api\SupAdmin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Subscription;

class SubscriptionController extends Controller
{
    public function index(){
        try {
            $data = Subscription::latest()->get();

            return response()->json([
                'success' => true,
                'message' => 'Subscriptions fetched successfully',
                'data' => $data,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch subscriptions. Please try again.',
            ], 500);
        }
    }
    public function store(Request $req){
        $valiadte=$req->validate([
            'name'=>'required|string',
            'slug'=>'required|string|unique:subscriptions,slug',
            'price'=>'required|numeric|min:0',
            'currency'=>'required|string|max:3',
            'interval'=>'required|string|in:month,year',
            'interval_count'=>'required|integer|min:0',
            'description' => 'nullable|string',
            'is_active' => 'boolean',

        ]);
        try {
            $subscription = Subscription::create($valiadte);

            return response()->json([
                'success' => true,
                'message' => 'Subscription created successfully',
                'data' => $subscription,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to create subscription plan. Please try again.',
            ], 500);
        }
    }
    public function show(string $id){
        try {
            $subscription = Subscription::find($id);
            if (!$subscription) {
                return response()->json([
                    'success' => false,
                    'message' => 'Subscription not found',
                ], 404);
            }

            return response()->json([
                'success' => true,
                'message' => 'Subscription fetched successfully',
                'data' => $subscription,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch subscription. Please try again.',
            ], 500);
        }
    }
    public function update(Request $req,$id){
        $subscription=Subscription::find($id);
        if(!$subscription){
           return response()->json([
            'success'=>false,
            'message'=>'subscription not found',
           ],404);
        }
        $validate=$req->validate([
            'name'=>'required|string',
            'slug'=>'required|string|unique:subscriptions,slug,' . $id,
            'price'=>'required|numeric|min:0',
            'currency'=>'required|string|max:3',
            'interval'=>'required|string|in:month,year',
            'interval_count'=>'required|integer|min:0',
            'description' => 'nullable|string',
            'is_active' => 'boolean',
        ]);
            try {
                $subscription->update($validate);

                return response()->json([
                    'success' => true,
                    'message' => 'Subscription updated successfully',
                    'data' => $subscription->fresh(),
                ]);
            } catch (\Exception $e) {
                return response()->json([
                    'success' => false,
                    'message' => 'Failed to update subscription plan. Please try again.',
                ], 500);
            }
    }
    public function toggleStatus($id){
        $subscription=Subscription::find($id);
        if(!$subscription){
            return response()->json([
                'success'=>false,
                'message'=>'subscription not found'
            ],404);
        }
        try {
            $subscription->is_active = !$subscription->is_active;
            $subscription->save();

            return response()->json([
                'success' => true,
                'message' => $subscription->is_active ? 'Subscription activated' : 'Subscription deactivated',
                'is_active' => $subscription->is_active,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update subscription status. Please try again.',
            ], 500);
        }
    }
        public function destroy($id){
            $subscription=Subscription::find($id);
        if(!$subscription){
            return response()->json([
                'success'=>false,
                'message'=>'subscription not found'
            ],404);
        }
        try {
            $subscription->delete();

            return response()->json([
                'success' => true,
                'message' => 'Subscription deleted successfully',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete subscription plan. Please try again.',
            ], 500);
        }
        }

}
