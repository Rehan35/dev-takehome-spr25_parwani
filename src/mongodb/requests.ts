import mongoose, { Schema, model, models } from 'mongoose';
import { RequestStatus } from "@/lib/types/request";


const ItemRequestSchema = new Schema({
    requestorName: {
        type: String,
        required: true,
        minLength: 3,
        maxLength: 30,
    },
    itemRequested: {
        type: String,
        required: true,
        minLength: 2,
        maxLength: 100
    },
    createdDate: {
        type: Date,
        required: true,
        default: Date.now,
    },
    lastEditedDate: {
        type: Date,
        required: true,
        default: Date.now
    },
    status: {
        type: String,
        required: true,
        enum: ['pending', 'completed', 'approved', 'rejected'],
        default: 'pending'
    }
},
{ collection: 'requests' });

const ItemRequest = models.ItemRequest || mongoose.model('ItemRequest', ItemRequestSchema);

export default ItemRequest