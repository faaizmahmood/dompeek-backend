const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const SALT_ROUNDS = 10;

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        match: [/^\S+@\S+\.\S+$/, 'Invalid email format']
    },

    passwordHash: {
        type: String,
        required: true
    },

    name: {
        type: String,
        trim: true
    },

    verified: {
        type: Boolean,
        default: false
    },

    role: {
        type: String,
        enum: ['free', 'pro', 'admin'],
        default: 'free'
    },

    // Rate limiting per day
    apiCount: {
        type: Number,
        default: 0
    },
    lastAccess: {
        type: String // Format: 'YYYY-MM-DD'
    },

    // API access (optional for advanced/pro users)
    apiKey: {
        type: String,
        unique: true,
        sparse: true
    },
    apiKeyCreatedAt: {
        type: Date
    }
}, {
    timestamps: true
});


// Hash password only if modified or new
userSchema.pre('save', async function (next) {
    if (!this.isModified('passwordHash')) return next();

    try {
        const salt = await bcrypt.genSalt(SALT_ROUNDS);
        this.passwordHash = await bcrypt.hash(this.passwordHash, salt);
        next();
    } catch (err) {
        next(err);
    }
});


// Compare plain password with hashed password
userSchema.methods.comparePassword = async function (plainPassword) {
    return bcrypt.compare(plainPassword, this.passwordHash);
};


module.exports = mongoose.model('User', userSchema);
