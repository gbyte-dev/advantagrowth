<?php

namespace App\Http\Controllers\Api\SupAdmin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Restaurant;
use Illuminate\Support\Str;

class RestaurantsController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $data=Restaurant::latest()->get();
        return response()->json([
            'success'=>true,
            'message'=>'Restaurants fetched successfully',
            'data'=> $data,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $req)
    {
        $validate=$req->validate([
            'name'=>'required|string',
            'phone'=>'required',
            'email'=>'required',
        ]);
        $validate['slug'] = Str::slug($validate['name']) . '-' . time();
        $restaurant=Restaurant::create($validate);
        return response()->json([
            'success'=>true,
            'message'=>'resaurant created successfully',
            'data'=>$restaurant,
        ]);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $restorent = Restaurant::find($id);
        if(!$restorent){
            return response()->json([
                 'success' => false,
            'message' => 'Restaurant not found',
            ],404);
        }
        return response()->json([
            'success'=>true,
            'message'=>'Restaurant Fetched successfully',
            'data'=>$restorent,
        ]);
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
            'name'=>'required|string',
            'phone'=>'required',
            'email'=>'required',
        ]);
        $restaurant->update($validate);

        return response()->json([
            'success'=>true,
            'message'=>'restorent update successfully',
            'data'=>$restaurant->fresh(),
        ]);

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
        $restaurant->delete();

        return response()->json([
        'success' => true,
        'message' => 'Restaurant deleted successfully',
    ]);
    }
}
