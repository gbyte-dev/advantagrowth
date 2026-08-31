<?php

namespace App\Http\Controllers\Api\SupAdmin;

use App\Http\Controllers\Controller;
use App\Models\SubscriptionFeature;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class SubscriptionFeatureController extends Controller
{
    public function index()
    {
        $features = SubscriptionFeature::query()
            ->withCount('subscriptions')
            ->orderBy('sort_order')
            ->orderBy('name')
            ->get();

        return response()->json([
            'success' => true,
            'message' => 'Subscription features fetched successfully.',
            'data' => $features,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'key' => [
                'required',
                'string',
                'max:100',
                'regex:/^[a-z][a-z0-9_]*$/',
                'unique:subscription_features,key',
            ],
            'name' => [
                'required',
                'string',
                'max:255',
            ],
            'description' => [
                'nullable',
                'string',
            ],
            'value_type' => [
                'required',
                Rule::in([
                    'boolean',
                    'limit',
                ]),
            ],
            'unit' => [
                'nullable',
                'required_if:value_type,limit',
                'string',
                'max:50',
            ],
            'sort_order' => [
                'nullable',
                'integer',
                'min:0',
            ],
            'is_active' => [
                'nullable',
                'boolean',
            ],
        ], [
            'key.regex' =>
                'Feature key must use lowercase letters, numbers, and underscores only.',

            'unit.required_if' =>
                'Unit is required for limit-type features.',
        ]);

        if (
            $validated['value_type'] ===
            'boolean'
        ) {
            $validated['unit'] = null;
        }

        $feature =
            SubscriptionFeature::create(
                $validated
            );

        return response()->json([
            'success' => true,
            'message' => 'Subscription feature created successfully.',
            'data' => $feature,
        ], 201);
    }

    public function show(string $id)
    {
        $feature =
            SubscriptionFeature::query()
                ->withCount('subscriptions')
                ->find($id);

        if (!$feature) {
            return response()->json([
                'success' => false,
                'message' => 'Subscription feature not found.',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'Subscription feature fetched successfully.',
            'data' => $feature,
        ]);
    }

    public function update(
        Request $request,
        string $id
    ) {
        $feature =
            SubscriptionFeature::find($id);

        if (!$feature) {
            return response()->json([
                'success' => false,
                'message' => 'Subscription feature not found.',
            ], 404);
        }

        $validated = $request->validate([
            'key' => [
                'required',
                'string',
                'max:100',
                'regex:/^[a-z][a-z0-9_]*$/',
                Rule::unique(
                    'subscription_features',
                    'key'
                )->ignore($feature->id),
            ],
            'name' => [
                'required',
                'string',
                'max:255',
            ],
            'description' => [
                'nullable',
                'string',
            ],
            'value_type' => [
                'required',
                Rule::in([
                    'boolean',
                    'limit',
                ]),
            ],
            'unit' => [
                'nullable',
                'required_if:value_type,limit',
                'string',
                'max:50',
            ],
            'sort_order' => [
                'nullable',
                'integer',
                'min:0',
            ],
            'is_active' => [
                'nullable',
                'boolean',
            ],
        ], [
            'key.regex' =>
                'Feature key must use lowercase letters, numbers, and underscores only.',

            'unit.required_if' =>
                'Unit is required for limit-type features.',
        ]);

        if (
            $validated['value_type'] ===
            'boolean'
        ) {
            $validated['unit'] = null;
        }

        DB::transaction(
            function () use (
                $feature,
                $validated
            ) {
                $feature->update(
                    $validated
                );

                /*
                | Boolean features do not use limits.
                */
                if (
                    $validated['value_type'] ===
                    'boolean'
                ) {
                    $feature
                        ->planFeatures()
                        ->update([
                            'limit_value' => null,
                        ]);
                }
            }
        );

        return response()->json([
            'success' => true,
            'message' => 'Subscription feature updated successfully.',
            'data' => $feature->fresh(),
        ]);
    }

    public function toggleStatus(string $id)
    {
        $feature =
            SubscriptionFeature::find($id);

        if (!$feature) {
            return response()->json([
                'success' => false,
                'message' => 'Subscription feature not found.',
            ], 404);
        }

        $feature->is_active =
            !$feature->is_active;

        $feature->save();

        return response()->json([
            'success' => true,
            'message' => $feature->is_active
                ? 'Subscription feature activated.'
                : 'Subscription feature deactivated.',
            'is_active' => $feature->is_active,
        ]);
    }

    public function destroy(string $id)
    {
        $feature =
            SubscriptionFeature::find($id);

        if (!$feature) {
            return response()->json([
                'success' => false,
                'message' => 'Subscription feature not found.',
            ], 404);
        }

        if (
            $feature
                ->planFeatures()
                ->exists()
        ) {
            return response()->json([
                'success' => false,
                'message' =>
                    'This feature is assigned to one or more subscription plans and cannot be deleted. Deactivate it instead.',
            ], 422);
        }

        $feature->delete();

        return response()->json([
            'success' => true,
            'message' => 'Subscription feature deleted successfully.',
        ]);
    }
}