import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: { type: String, default: '' },
  address: { type: String, default: '' },
  city: { type: String, default: '' },
  avatar: { type: String, default: '' },
  role: { type: String, default: 'user' }, // phân quyền user/admin

  wishlist: [{ 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Book'
    }]
}, { timestamps: true });

export default mongoose.model('User', userSchema);