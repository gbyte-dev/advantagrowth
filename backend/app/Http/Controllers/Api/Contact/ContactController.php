<?php

namespace App\Http\Controllers\Api\Contact;

use App\Http\Controllers\Controller;
use App\Models\ContactMessage;
use Illuminate\Http\Request;

class ContactController extends Controller
{
    /**
     * Customer submits contact form.
     */
    public function storeMessage(Request $request)
    {
        $request->validate([
            'restaurant_id' => 'required|integer|exists:restaurants,id',
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'phone' => 'nullable|string|max:30',
            'subject' => 'required|string|max:255',
            'message' => 'required|string|max:5000',
        ]);

        $message = ContactMessage::create([
            'restaurant_id' => $request->restaurant_id,
            'name' => $request->name,
            'email' => $request->email,
            'phone' => $request->phone,
            'subject' => $request->subject,
            'message' => $request->message,
            'is_read' => false,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Your message has been sent successfully.',
            'contact_message' => $message,
        ], 201);
    }

    /**
     * Owner gets all contact messages.
     */
    public function messages(Request $request)
    {
        $restaurantId = $request->user()->restaurant_id;

        $messages = ContactMessage::where(
            'restaurant_id',
            $restaurantId
        )
            ->orderBy('id', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'messages' => $messages,
        ]);
    }

    /**
     * Owner marks message as read/unread.
     */
    public function toggleMessageRead(Request $request, $id)
    {
        $message = ContactMessage::where(
            'restaurant_id',
            $request->user()->restaurant_id
        )->findOrFail($id);

        $message->is_read = !$message->is_read;
        $message->save();

        return response()->json([
            'success' => true,
            'message' => 'Message status updated.',
            'is_read' => $message->is_read,
        ]);
    }

    /**
     * Owner deletes a message.
     */
    public function destroyMessage(Request $request, $id)
    {
        $message = ContactMessage::where(
            'restaurant_id',
            $request->user()->restaurant_id
        )->findOrFail($id);

        $message->delete();

        return response()->json([
            'success' => true,
            'message' => 'Message deleted successfully.',
        ]);
    }
}