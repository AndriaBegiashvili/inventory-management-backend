const express = require('express');
const { DataTypes, where } = require('sequelize')
const { Sequelize } = require('sequelize');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


const sequelize = new Sequelize('cavea', 'postgres', 'db', {
  host: 'localhost',
  dialect:  'postgres' 
});

const Inventory = sequelize.define('Inventory', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    place: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    price:{
      type: DataTypes.INTEGER,
      allowNull: false,
    }
  });
  (async () => {
    try {
      await sequelize.sync({ force: true }); 
      console.log('Table created successfully.');
      const names = ['luka', 'bego', 'karo'];
      const places = ['კავეა სითი მოლი', 'კავეა ისთ ფოინთი', 'კავეა გალერია', 'კავეა თბილისი მოლი','სათაო ოფისი'];
  
      const totalItems = 300000;
      const batchSize = 1000;
      const batches = Math.ceil(totalItems / batchSize);
  
      for (let i = 0; i < batches; i++) {
        const items = [];
        for (let j = 0; j < batchSize; j++) {
          const name = names[Math.floor(Math.random() * names.length)];
          const place = places[Math.floor(Math.random() * places.length)];
          const price = Math.floor(Math.random() * 1000) + 1;
  
          items.push({ name, place, price });
        }
  
        await Inventory.bulkCreate(items);
        console.log(`Batch ${i + 1} inserted successfully.`);
      }
  
      console.log('All items inserted successfully.');
    } catch (error) {
      console.error('Error inserting items:', error);
    } finally {
      await sequelize.close();
    }
  })();

app.get('/inventories', async (req, res) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = 20;
      const offset = (page - 1) * limit;

      const items = await Inventory.findAll({
        limit,
        offset,
        order: [['createdAt', 'DESC']],
      });
      +
      res.json(items);
    } catch (error) {
      console.error('Error retrieving items:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

  app.delete(`/inventories/:id`, async (req, res) => {
   
      const id = req.params.id;
      await Inventory.destroy({ where: { id } });
      res.send("Deleted");

    
  });
  app.post('/inventories', async (req, res) => {
    const { name, place,price } = req.body;

    const newItem = await Inventory.create({  name: name, price: price, place: place });
    res.json({ message: "Item successfully added" })
  });
  app.listen(3001, () => {
    console.log(`Server is listening on port 3001.`);
  });

