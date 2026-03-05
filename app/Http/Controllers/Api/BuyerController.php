<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Buyer;

class BuyerController extends Controller
{
    public function index()
    {
        $buyers = Buyer::with('sales')
            ->latest()
            ->paginate(10);

        return response()->json($buyers);
    }

    public function store(Request $request)
    {
        $buyer = Buyer::create([
            'email' => $request->email,
            'company' => $request->company,
            'pic_name' => $request->pic_name,
            'assigned_sales' => $request->assigned_sales,
            'is_active' => $request->is_active ?? true,
            'registered_at' => now()
        ]);

        return response()->json($buyer);
    }

    public function show($id)
    {
        return Buyer::with('sales')->findOrFail($id);
    }

    public function update(Request $request, $id)
    {
        $buyer = Buyer::findOrFail($id);

        $buyer->update($request->only([
            'email',
            'company',
            'pic_name',
            'assigned_sales',
            'is_active'
        ]));

        return response()->json($buyer);
    }

    public function destroy($id)
    {
        Buyer::findOrFail($id)->delete();

        return response()->json([
            'message' => 'Buyer deleted'
        ]);
    }
}
