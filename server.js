const express = require('express');
const app = express();

app.use(express.json());

app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Lifestyle rentals API is running on your Linode dev server.'
  });
});

const PORT = 4000;

app.listen(PORT, () => {
  console.log(`API listening on http://localhost:${PORT}`);
});
