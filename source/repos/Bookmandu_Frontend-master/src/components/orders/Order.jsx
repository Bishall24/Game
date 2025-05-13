import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Grid,
  Button,
  Stepper,
  Step,
  StepLabel,
  TextField,
  Divider,
} from '@mui/material';
import { orderService } from '../../services/api';

const steps = ['Cart Review', 'Shipping Details', 'Payment', 'Confirmation'];

const Order = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [orderData, setOrderData] = useState({
    shippingAddress: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: '',
    },
    paymentMethod: {
      cardNumber: '',
      expiryDate: '',
      cvv: '',
      nameOnCard: '',
    },
  });
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadCartItems();
  }, []);

  const loadCartItems = async () => {
    try {
      const response = await orderService.getCart();
      setCartItems(response.items);
      setLoading(false);
    } catch (err) {
      setError('Failed to load cart items');
      setLoading(false);
    }
  };

  const handleNext = () => {
    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const handleInputChange = (section, field, value) => {
    setOrderData({
      ...orderData,
      [section]: {
        ...orderData[section],
        [field]: value,
      },
    });
  };

  const handlePlaceOrder = async () => {
    try {
      await orderService.placeOrder(orderData);
      handleNext();
    } catch (err) {
      setError('Failed to place order');
    }
  };

  const calculateTotal = () => {
    return cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Order Summary
            </Typography>
            {cartItems.map((item) => (
              <Box key={item.id} sx={{ mb: 2 }}>
                <Grid container spacing={2}>
                  <Grid item xs={8}>
                    <Typography>{item.title}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Quantity: {item.quantity}
                    </Typography>
                  </Grid>
                  <Grid item xs={4}>
                    <Typography align="right">
                      ${(item.price * item.quantity).toFixed(2)}
                    </Typography>
                  </Grid>
                </Grid>
              </Box>
            ))}
            <Divider sx={{ my: 2 }} />
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="h6">Total</Typography>
              <Typography variant="h6">${calculateTotal().toFixed(2)}</Typography>
            </Box>
          </Box>
        );

      case 1:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Shipping Details
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Street Address"
                  value={orderData.shippingAddress.street}
                  onChange={(e) => handleInputChange('shippingAddress', 'street', e.target.value)}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="City"
                  value={orderData.shippingAddress.city}
                  onChange={(e) => handleInputChange('shippingAddress', 'city', e.target.value)}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="State"
                  value={orderData.shippingAddress.state}
                  onChange={(e) => handleInputChange('shippingAddress', 'state', e.target.value)}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="ZIP Code"
                  value={orderData.shippingAddress.zipCode}
                  onChange={(e) => handleInputChange('shippingAddress', 'zipCode', e.target.value)}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Country"
                  value={orderData.shippingAddress.country}
                  onChange={(e) => handleInputChange('shippingAddress', 'country', e.target.value)}
                  required
                />
              </Grid>
            </Grid>
          </Box>
        );

      case 2:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Payment Details
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Name on Card"
                  value={orderData.paymentMethod.nameOnCard}
                  onChange={(e) => handleInputChange('paymentMethod', 'nameOnCard', e.target.value)}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Card Number"
                  value={orderData.paymentMethod.cardNumber}
                  onChange={(e) => handleInputChange('paymentMethod', 'cardNumber', e.target.value)}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Expiry Date"
                  value={orderData.paymentMethod.expiryDate}
                  onChange={(e) => handleInputChange('paymentMethod', 'expiryDate', e.target.value)}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="CVV"
                  value={orderData.paymentMethod.cvv}
                  onChange={(e) => handleInputChange('paymentMethod', 'cvv', e.target.value)}
                  required
                />
              </Grid>
            </Grid>
          </Box>
        );

      case 3:
        return (
          <Box>
            <Typography variant="h5" gutterBottom align="center">
              Thank you for your order!
            </Typography>
            <Typography variant="subtitle1" align="center">
              Your order number is #2001539. We have emailed your order
              confirmation, and will send you an update when your order has
              shipped.
            </Typography>
          </Box>
        );

      default:
        return null;
    }
  };

  if (loading) {
    return (
      <Container>
        <Typography>Loading...</Typography>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <Typography color="error">{error}</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Card>
        <CardContent>
          <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          {renderStepContent(activeStep)}

          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
            {activeStep !== 0 && (
              <Button onClick={handleBack} sx={{ mr: 1 }}>
                Back
              </Button>
            )}
            {activeStep === steps.length - 1 ? (
              <Button
                variant="contained"
                color="primary"
                onClick={() => window.location.href = '/'}
              >
                Return to Home
              </Button>
            ) : (
              <Button
                variant="contained"
                color="primary"
                onClick={activeStep === steps.length - 2 ? handlePlaceOrder : handleNext}
              >
                {activeStep === steps.length - 2 ? 'Place Order' : 'Next'}
              </Button>
            )}
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
};

export default Order; 