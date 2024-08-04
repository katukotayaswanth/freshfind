'use client';
import React,{ useState, useEffect } from 'react';
import { firestore } from "@/firebase";
import { Box, Modal, Button, TextField, Typography, Stack, IconButton, Dialog, DialogActions, DialogContent, DialogTitle, Grid, Paper } from "@mui/material";
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import { collection, query, getDocs, doc, getDoc, updateDoc, setDoc, deleteDoc } from "firebase/firestore";


export default function Home() {
  const [inventory, setInventory] = useState([]);
  const [cart, setCart] = useState({});
  const [open, setOpen] = useState(false);
  const [itemName, setItemName] = useState('');
  const [itemQuantity, setItemQuantity] = useState(1);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [itemToRemove, setItemToRemove] = useState('');
  const [cartOpen, setCartOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch and update inventory
  const updateInventory = async () => {
    try {
      const snapshot = query(collection(firestore, 'inventory'));
      const docs = await getDocs(snapshot);
      const inventoryList = [];
      docs.forEach((doc) => {
        inventoryList.push({
          name: doc.id,
          ...doc.data(),
        });
      });
      setInventory(inventoryList);
    } catch (error) {
      console.error("Error fetching inventory:", error);
    }
  };

  // Add item to inventory
  const addItem = async (item, quantity) => {
    try {
      const docRef = doc(collection(firestore, 'inventory'), item);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const { quantity: currentQuantity } = docSnap.data();
        await updateDoc(docRef, { quantity: (currentQuantity || 0) + quantity });
      } else {
        await setDoc(docRef, { quantity });
      }

      await updateInventory();
    } catch (error) {
      console.error("Error adding item:", error);
    }
  };

  // Remove item from inventory
  const removeItem = async (item, quantity) => {
    try {
      const docRef = doc(collection(firestore, 'inventory'), item);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const { quantity: currentQuantity } = docSnap.data();
        if (currentQuantity <= quantity) {
          await deleteDoc(docRef);
        } else {
          await updateDoc(docRef, { quantity: currentQuantity - quantity });
        }

        await updateInventory();
      }
    } catch (error) {
      console.error("Error removing item:", error);
    }
  };

  // Handle cart updates
  const handleAddToCart = async (item, quantity) => {
    const docRef = doc(collection(firestore, 'inventory'), item);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const { quantity: currentQuantity } = docSnap.data();
      const updatedQuantity = (currentQuantity || 0) - quantity;

      if (updatedQuantity >= 0) {
        await updateDoc(docRef, { quantity: updatedQuantity });
        setCart((prevCart) => {
          const updatedCart = { ...prevCart, [item]: (prevCart[item] || 0) + quantity };
          return updatedCart;
        });
        await updateInventory();
      } else {
        console.error("Not enough stock to add to cart.");
      }
    }
  };

  const handleRemoveFromCart = async (item) => {
    if (cart[item] > 1) {
      setCart((prevCart) => {
        const updatedCart = { ...prevCart, [item]: prevCart[item] - 1 };
        return updatedCart;
      });
    } else {
      setCart((prevCart) => {
        const updatedCart = { ...prevCart };
        delete updatedCart[item];
        return updatedCart;
      });
    }
    await removeItem(item, 1);
  };

  // Open/Close modals
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const handleConfirmOpen = (item) => {
    setItemToRemove(item);
    setConfirmOpen(true);
  };

  const handleConfirmClose = () => setConfirmOpen(false);

  const handleConfirmRemove = async () => {
    await removeItem(itemToRemove, cart[itemToRemove] || 1);
    setCart((prevCart) => {
      const updatedCart = { ...prevCart };
      delete updatedCart[itemToRemove];
      return updatedCart;
    });
    setConfirmOpen(false);
  };

  const handleCartOpen = () => setCartOpen(true);
  const handleCartClose = () => setCartOpen(false);

  useEffect(() => {
    updateInventory();
  }, []);

  // Filter inventory based on search term
  const filteredInventory = inventory.filter(({ name }) => name.toLowerCase().includes(searchTerm.toLowerCase()));

  // Calculate total items in cart
  const cartItemCount = Object.values(cart).reduce((total, count) => total + count, 0);

  return (
    <Box
      width="100vw"
      height="100vh"
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      gap={2}
      bgcolor="#f5f5f5"
      p={2}
    >
      <Modal
        open={open}
        onClose={handleClose}
      >
        <Box
          position="absolute"
          top="50%"
          left="50%"
          width={400}
          bgcolor="white"
          border="2px solid #000"
          boxShadow={24}
          p={4}
          display="flex"
          flexDirection="column"
          gap={3}
          sx={{ transform: "translate(-50%, -50%)" }}
        >
          <Typography variant="h6">Add Item</Typography>
          <Stack width="100%" direction="row" spacing={2}>
            <TextField
              variant="outlined"
              fullWidth
              label="Item Name"
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
            />
            <TextField
              variant="outlined"
              type="number"
              label="Quantity"
              value={itemQuantity}
              onChange={(e) => setItemQuantity(Number(e.target.value))}
            />
            <Button
              variant="outlined"
              onClick={() => {
                if (itemName.trim() && itemQuantity > 0) {
                  addItem(itemName, itemQuantity);
                  setItemName('');
                  setItemQuantity(1);
                  handleClose();
                }
              }}
            >
              Add
            </Button>
          </Stack>
        </Box>
      </Modal>

      <Button
        variant="contained"
        onClick={handleOpen}
        startIcon={<AddIcon />}
      >
        Add New Item
      </Button>

      <Button
        variant="contained"
        onClick={handleCartOpen}
        startIcon={<AddIcon />}
      >
        View Cart ({cartItemCount})
      </Button>

      <TextField
        variant="outlined"
        placeholder="Search items..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        InputProps={{
          startAdornment: <SearchIcon />,
        }}
        sx={{ width: '800px', mb: 3 }}
      />

      <Grid container spacing={3} sx={{ width: '800px' }}>
        {filteredInventory.map(({ name, quantity }) => (
          <Grid item xs={12} sm={6} md={4} key={name}>
            <Paper elevation={3} sx={{ padding: 3, textAlign: 'center', borderRadius: 2 }}>
              <Typography variant="h5" color="#333">
                {name.charAt(0).toUpperCase() + name.slice(1)}
              </Typography>
              <Typography variant="body1" color="textSecondary" sx={{ mb: 2 }}>
                Quantity: {quantity}
              </Typography>
              <Stack direction="row" justifyContent="center" spacing={1}>
                <IconButton onClick={() => handleAddToCart(name, 1)} color="primary">
                  <AddIcon />
                </IconButton>
                <IconButton onClick={() => handleRemoveFromCart(name)} color="secondary">
                  <RemoveIcon />
                </IconButton>
              </Stack>
            </Paper>
          </Grid>
        ))}
      </Grid>

      <Dialog
        open={confirmOpen}
        onClose={handleConfirmClose}
      >
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to remove this item?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleConfirmClose} color="primary">
            Cancel
          </Button>
          <Button onClick={handleConfirmRemove} color="secondary">
            Confirm
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={cartOpen}
        onClose={handleCartClose}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Cart</DialogTitle>
        <DialogContent>
          {Object.keys(cart).length === 0 ? (
            <Typography>No items in cart.</Typography>
          ) : (
            <Stack spacing={2}>
              {Object.entries(cart).map(([item, quantity]) => (
                <Paper key={item} elevation={2} sx={{ padding: 2 }}>
                  <Typography variant="h6">{item}</Typography>
                  <Typography>Quantity: {quantity}</Typography>
                  <Stack direction="row" spacing={1}>
                    <IconButton onClick={() => handleRemoveFromCart(item)} color="secondary">
                      <RemoveIcon />
                    </IconButton>
                    <IconButton onClick={() => handleConfirmOpen(item)} color="error">
                      <DeleteIcon />
                    </IconButton>
                  </Stack>
                </Paper>
              ))}
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCartClose} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
