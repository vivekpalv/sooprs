const mongoose = require('mongoose');

const skillSchema = new mongoose.Schema({
    name:{
        type: String,
        unique: true,
        required: true
    },
    badge:{
        path: String
    }
}, {timestamps: true});

const Skill = mongoose.model('sp_skill', skillSchema);
module.exports = Skill;