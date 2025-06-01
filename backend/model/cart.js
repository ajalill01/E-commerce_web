const cartSchema = new mongoose.Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'User' },
    items: [{
        product: { type: Schema.Types.ObjectId, ref: 'Product' },
        quantity: Number,
        addedAt: { type: Date, default: Date.now }
    }]
});