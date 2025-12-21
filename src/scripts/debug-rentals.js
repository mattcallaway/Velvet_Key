require('dotenv').config();
const { searchRentals } = require('../services/rental.service');

async function debug() {
    console.log('Starting debug of searchRentals...');
    try {
        const filters = {};
        console.log('Calling searchRentals with:', filters);
        const result = await searchRentals(filters);
        console.log('Success!', result);
    } catch (err) {
        console.error('ERROR CAUGHT IN DEBUG SCRIPT:');
        console.error(err);
    }
}

debug();
