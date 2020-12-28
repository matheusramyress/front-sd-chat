const axios = require('axios');

const api = axios.create({
    baseURL:process.env.CHAT_URL
});

module.exports = api;
