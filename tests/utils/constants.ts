export const ERROR_MESSAGES = {
  checkoutFirstNameRequired: 'Error: First Name is required',
  checkoutLastNameRequired: 'Error: Last Name is required',
  checkoutPostalCodeRequired: 'Error: Postal Code is required',
  lockedOutUser: 'Epic sadface: Sorry, this user has been locked out.',
  invalidCredentials: 'Epic sadface: Username and password do not match any user in this service',
  usernameRequired: 'Epic sadface: Username is required',
  passwordRequired: 'Epic sadface: Password is required',
};
export const PROTECTED_ROUTES = [
  {
    url: 'checkout-step-one.html',
  },
  {
    url: 'checkout-step-two.html',
  },
  {
    url: 'checkout-complete.html',
  },
  {
    url: 'inventory-item.html?id=0',
  },
  {
    url: 'cart.html'
  },
  {
    url : 'checkout-complete.html'
  }
]
  
