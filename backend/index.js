const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());

app.get('/giveaways', async (req, res) => {
  try {
    const response = await axios.get(process.env.GAMERPOWER_API_URL);
    res.json(response.data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch giveaways' });
  }
});

app.listen(port, () => {
  console.log(`Backend server listening at http://localhost:${port}`);
});
