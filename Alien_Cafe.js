
const express = require('express');
const path = require('path');
const fs = require('fs');
 

const app = express();

app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({extended:true}));

const menu = [
    { id: 1, name: "Nebula Noodles", price: 9.99 },
    { id: 2, name: "Cosmic Crystals", price: 12.99 },
    { id: 3, name: "Lunar Lollipops", price: 7.49 },
    { id: 4, name: "Intergalactic Ice Cream", price: 13.99 },
    { id: 5, name: "Alien Sushi Rolls", price: 3.99 },
    { id: 6, name: "Galactic Gummies", price: 10.99 },
    { id: 7, name: "Meteorite Macarons", price: 11.99 },
    { id: 8, name: "Extraterrestrial Energy Bars", price: 6.99 },
    { id: 9, name: "UFO Pizzas", price: 9.29 },
    { id: 10, name: "Alien Ambrosia Salad", price: 8.29 },
    { id: 11, name: "Interstellar Smoothies", price: 13.49 },
    { id: 12, name: "Nebula Nachos", price: 4.49 },
    { id: 13, name: "Martian Muffins", price: 17.99 },
    { id: 14, name: "Galaxy Granola Bars", price: 6.79 },
    { id: 15, name: "Comet Cupcakes", price: 10.49 }
];
let profiles=[]
let orders=[]
function readProfiles() {
    try {
        const profilesData = fs.readFileSync("profiles.json", "utf-8");
        return JSON.parse(profilesData) || [];
    } catch (err) {
        console.error("Error reading or parsing profiles.json:", err);
        return [];
    }
}

app.get('/register', (req, res) => {
    res.sendFile(path.join(__dirname,'public','register.html'))
});

app.post('/register', (req, res) => {
    try {
        const newProfile = req.body;
        const profiles=readProfiles()
        newProfile.id = profiles.length > 0 ? Math.max(...profiles.map(profile => profile.id)) + 1 : 1;
        profiles.push(newProfile);
        fs.writeFileSync('profiles.json', JSON.stringify(profiles, null, 2));
        res.redirect(`/profiles/${newProfile.id}`);
    } catch (err) {
        console.error("Error writing profiles.json:", err);
        res.status(500).send("Error saving profile");
    }
});

// Route to handle GET requests for fetching a specific profile by ID
app.get('/profiles/:id', (req, res) => {
    const profileId = parseInt(req.params.id);
    const profiles=readProfiles();
    const profile = profiles.find(profile => profile.id === profileId);
    if (profile) {
        // res.sendFile(path.join(__dirname,'public','profile.html'))
        res.render('profile',{profile:profile,menu: menu})
    } else {
        res.status(404).json({ error: 'Profile not found' });
    }
});
// Route to handle PUT requests for updating a specific profile by ID
app.put('/profiles/:id', (req, res) => {
    try {
        const profileId = parseInt(req.params.id);
        let profiles = readProfiles(); // Function to read profiles from JSON file
        const index = profiles.findIndex(profile => profile.id === profileId);
        if (index !== -1) {
            profiles[index] = { ...profiles[index], ...req.body };
            fs.writeFileSync('profiles.json', JSON.stringify(profiles, null, 2)); // Save profiles to JSON file
            res.json(profiles[index]);
        } else {
            res.status(404).json({ error: 'Profile not found' });
        }
    } catch (err) {
        console.error("Error updating profile:", err);
        res.status(500).send("Error updating profile");
    }
});
app.get('/profile/:id/edit', (req, res) => {
    const profileId = parseInt(req.params.id);
    let profiles = readProfiles(); // Function to read profiles from JSON file
    const profile = profiles.find(profile => profile.id === profileId);
    if (profile) {
        // Render the edit form with the profile data
        res.render('editProfile', { profile });
    } else {
        res.status(404).json({ error: 'Profile not found' });
    }
});
app.post('/profile/:id/edit', (req, res) => {
    try {
        const profileId = parseInt(req.params.id);
        let profiles = readProfiles(); // Function to read profiles from JSON file
        const index = profiles.findIndex(profile => profile.id === profileId);
        if (index !== -1) {
            // Update profile data based on the submitted form data
            profiles[index] = { ...profiles[index], ...req.body };
            fs.writeFileSync('profiles.json', JSON.stringify(profiles, null, 2)); // Save profiles to JSON file
            
            // Redirect the user to the profile page with the updated data
            res.redirect(`/profiles/${profileId}`);
        } else {
            res.status(404).json({ error: 'Profile not found' });
        }
    } catch (err) {
        console.error("Error updating profile:", err);
        res.status(500).send("Error updating profile");
    }
});




// Route to handle DELETE requests for deleting a specific profile by ID
app.delete('/profiles/:id', (req, res) => {
    try {
        const profileId = parseInt(req.params.id);
        let profiles = readProfiles(); 
        const index = profiles.findIndex(profile => profile.id === profileId);
        
        if (index !== -1) {
            profiles.splice(index, 1);
            fs.writeFileSync('profiles.json', JSON.stringify(profiles, null, 2));
            return res.status(204).send(); 
        } 
        
        return res.status(404).json({ error: 'Profile not found' }); // Return the response to ensure only one response is sent
        
    } catch (err) {
        console.error("Error deleting profile:", err);
        return res.status(500).send("Error deleting profile");
    }
});

// Route to handle POST requests for creating orders
app.post('/orders', (req, res) => {
    try {
        const newOrder = req.body;
        const orders = readOrders();
        newOrder.id = orders.length > 0 ? Math.max(...orders.map(order => order.id)) + 1 : 1;
        newOrder.status = 'pending';
        orders.push(newOrder);
        fs.writeFileSync('orders.json', JSON.stringify(orders, null, 2)); // Save orders to JSON file
        res.status(201).json(newOrder);
    } catch (err) {
        console.error("Error creating order:", err);
        res.status(500).send("Error creating order");
    }
});

// Route to handle GET requests for fetching a specific order by ID
app.get('/orders/:id', (req, res) => {
    try {
        const orderId = parseInt(req.params.id);
        const orders = readOrders(); // Function to read orders from JSON file
        const order = orders.find(order => order.id === orderId);
        if (order) {
            res.json(order);
        } else {
            res.status(404).json({ error: 'Order not found' });
        }
    } catch (err) {
        console.error("Error fetching order:", err);
        res.status(500).send("Error fetching order");
    }
});

// Route to handle PUT requests for updating a specific order by ID
app.put('/orders/:id', (req, res) => {
    try {
        const orderId = parseInt(req.params.id);
        const updatedOrder = req.body;
        const orders = readOrders(); // Function to read orders from JSON file
        const index = orders.findIndex(order => order.id === orderId);
        if (index !== -1) {
            orders[index] = { ...orders[index], ...updatedOrder };
            fs.writeFileSync('orders.json', JSON.stringify(orders, null, 2)); // Save orders to JSON file
            res.json(orders[index]);
        } else {
            res.status(404).json({ error: 'Order not found' });
        }
    } catch (err) {
        console.error("Error updating order:", err);
        res.status(500).send("Error updating order");
    }
});

// Route to handle DELETE requests for deleting a specific order by ID
app.delete('/orders/:id', (req, res) => {
    try {
        const orderId = parseInt(req.params.id);
        let orders = readOrders(); // Function to read orders from JSON file
        const index = orders.findIndex(order => order.id === orderId);
        if (index !== -1) {
            orders.splice(index, 1);
            fs.writeFileSync('orders.json', JSON.stringify(orders, null, 2)); // Save orders to JSON file
            res.status(204).send();
        } else {
            res.status(404).json({ error: 'Order not found' });
        }
    } catch (err) {
        console.error("Error deleting order:", err);
        res.status(500).send("Error deleting order");
    }
});

// // Route to handle POST requests for creating orders
// app.post('/orders', (req, res) => {
//     try {
//         const newOrder = req.body;
//         const orders = readOrders(); // Function to read orders from JSON file
//         newOrder.id = orders.length > 0 ? Math.max(...orders.map(order => order.id)) + 1 : 1;
//         newOrder.status = 'pending';
//         orders.push(newOrder);
//         fs.writeFileSync('orders.json', JSON.stringify(orders, null, 2)); // Save orders to JSON file
//         res.status(201).json(newOrder);
//     } catch (err) {
//         console.error("Error creating order:", err);
//         res.status(500).send("Error creating order");
//     }
// });
// // Route to handle GET requests for fetching a specific order by ID
// app.get('/orders/:id', (req, res) => {
//     try {
//         const orderId = parseInt(req.params.id);
//         const orders = readOrders(); // Function to read orders from JSON file
//         const order = orders.find(order => order.id === orderId);
//         if (order) {
//             res.json(order);
//         } else {
//             res.status(404).json({ error: 'Order not found' });
//         }
//     } catch (err) {
//         console.error("Error fetching order:", err);
//         res.status(500).send("Error fetching order");
//     }
// });
// // Route to handle PUT requests for updating a specific order by ID
// app.put('/orders/:id', (req, res) => {
//     try {
//         const orderId = parseInt(req.params.id);
//         const updatedOrder = req.body;
//         const orders = readOrders(); // Function to read orders from JSON file
//         const index = orders.findIndex(order => order.id === orderId);
//         if (index !== -1) {
//             orders[index] = { ...orders[index], ...updatedOrder };
//             fs.writeFileSync('orders.json', JSON.stringify(orders, null, 2)); // Save orders to JSON file
//             res.json(orders[index]);
//         } else {
//             res.status(404).json({ error: 'Order not found' });
//         }
//     } catch (err) {
//         console.error("Error updating order:", err);
//         res.status(500).send("Error updating order");
//     }
// });
// // Route to handle DELETE requests for deleting a specific order by ID
// app.delete('/orders/:id', (req, res) => {
//     try {
//         const orderId = parseInt(req.params.id);
//         let orders = readOrders(); // Function to read orders from JSON file
//         const index = orders.findIndex(order => order.id === orderId);
//         if (index !== -1) {
//             orders.splice(index, 1);
//             fs.writeFileSync('orders.json', JSON.stringify(orders, null, 2)); // Save orders to JSON file
//             res.status(204).send();
//         } else {
//             res.status(404).json({ error: 'Order not found' });
//         }
//     } catch (err) {
//         console.error("Error deleting order:", err);
//         res.status(500).send("Error deleting order");
//     }
// });

// Route to handle GET requests for fetching the menu
app.get('/menu', (req, res) => {
    res.json(menu);
});


// Route to handle POST requests for confirming orders
app.post('/confirm-order', (req, res) => {
    const confirmOrder = req.body.confirm;
    if (confirmOrder === 'yes') {
        // Send the order to the JSON database
        // Redirect to the feedback page
        res.redirect('/feedback');
    } else {
        // Stay on the current page (profile page)
        res.redirect(req.get('referer'));
    }
});

// Route to handle GET requests for the feedback page
app.get('/feedback', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'feedback.html'));
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server is listening on port ${port}`);
});









