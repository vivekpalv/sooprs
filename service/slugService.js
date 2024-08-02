const slugify = require('slugify');
const User = require('../model/user'); // Replace with your actual model

// Utility function to create a slug from a string using slugify
const createSlug = (name) => {
    return slugify(name, {
        lower: true,       // Convert to lower case
        strict: true,      // Remove special characters
        remove: /[*+~.()'"!:@]/g  // Optional: remove additional characters
    });
};

// Function to generate a unique slug
exports.generateUniqueSlug = async (name) => {
    let slug = createSlug(name);
    let uniqueSlug = slug;
    let counter = 1;

    while (await User.exists({ slug: uniqueSlug })) {
        uniqueSlug = `${slug}-${counter}`;
        counter++;
    }

    return uniqueSlug;
};