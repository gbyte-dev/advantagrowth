<?php

namespace App\Http\Controllers\Api\SupAdmin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Subscription;

class SubscriptionController extends Controller
{
    public function index(){
        $data=Subscription::latest()->get();
        return response()->json([
            'success'=>true,
            'message'=>'Subscription fetched successfully',
            'data'=>$data,
        ]);
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
        $subscription = Subscription::create($valiadte);
       return  response()->json([
            'success'=>true,
            'message'=>"Subscription created successfully",
            'data'=>$subscription,
       
       ]);
        
    }
    public function show(string $id){
        $subscription=Subscription::find($id);
        if(!$subscription){
            return response()->json([
                'success'=>false,
                'message'=>'Subscription not found'
            ],404);
        }
    return response()->json([
        'success'=>true,
        'message'=>'subscription fetched successfully',
        'data'=>$subscription

    ],201);
    }
    public function update(Request $req,$id){
        $subscription=Subscription::find($id);
        if(!$subscription){
           return responce()->json([
            'success'=>false,
            'message'=>'subscription not found',
           ]);
        }
        $validate=$req->validate([
            'name'=>'required|string',
            'slug'=>'required|string|unique:subscriptions,slug',
            'price'=>'required|numeric|min:0',
            'currency'=>'required|string|max:3',
            'interval'=>'required|string|in:month,year',
            'interval_count'=>'required|integer|min:0',
            'description' => 'nullable|string',
            'is_active' => 'boolean',
        ]);
            $subscription->update($validate);
        
        return response()->json([
            'success'=>true,
            'message'=>'subscription update successfully',
            'data'=>$subscription,
        ]);
    }
    public function toggleStatus($id){
        $subscription=Subscription::find($id);
        if(!$subscription){
            return response()->json([
                'success'=>false,
                'message'=>'subscription not found'
            ],404);
        }
        $subscription->is_active=!$subscription->is_active;
        $subscription->save();

        return response()->json([
            'success'=>true,
            'message'=>$subscription->is_active ? 'subscription activate' : 'subscriptioon deactive',
            'is_active'=>$subscription->is_active ,
        ]);
    }
        public function destroy($id){
            $subscription=Subscription::find($id);
        if(!$subscription){
            return response()->json([
                'success'=>false,
                'message'=>'subscription not found'
            ],404);
        }
        $subscription->delete();
        return response()->json([
            'success'=>true,
            'message'=>'subscription deleted successfully',

        ]);
        }

}
