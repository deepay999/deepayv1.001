<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Point;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

class PointController extends Controller {

    /**
     * GET /api/points
     * Returns current point balance, earn records and use records for the
     * authenticated user.
     */
    public function index() {
        $user    = auth()->user();
        $records = Point::where('user_id', $user->id)
            ->orderBy('id', 'desc')
            ->get();

        $balance  = $records->where('type', 'earn')->sum('amount')
            - $records->where('type', 'use')->sum('amount');

        $earned = $records->where('type', 'earn')->values();
        $used   = $records->where('type', 'use')->values();

        $notify[] = 'Points data';
        return apiResponse('points', 'success', $notify, [
            'balance'      => (int) $balance,
            'earn_records' => $earned,
            'use_records'  => $used,
        ]);
    }

    /**
     * POST /api/points/reward
     * Awards points to the authenticated user (system / internal use).
     *
     * Required JSON body:
     *   - amount      (integer, min:1)
     *   - description (string,  nullable)
     */
    public function reward(Request $request) {
        $validator = Validator::make($request->all(), [
            'amount'      => 'required|integer|min:1',
            'description' => 'nullable|string|max:255',
        ]);

        if ($validator->fails()) {
            return apiResponse('validation_error', 'error', $validator->errors()->all());
        }

        $user = auth()->user();

        $point = Point::create([
            'user_id'     => $user->id,
            'amount'      => (int) $request->amount,
            'type'        => 'earn',
            'description' => $request->description ?? 'Reward',
            'trx'         => Str::upper(Str::random(12)),
        ]);

        $notify[] = 'Points rewarded successfully';
        return apiResponse('points_rewarded', 'success', $notify, [
            'point' => $point,
        ]);
    }
}
