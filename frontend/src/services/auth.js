/**
 * Mock Authentication Service
 */

const MOCK_USERS = [
  {
    identifier: 'admin@gmail.com',
    password: '123456',
    user: {
      name: 'Admin Horse Racing',
      email: 'admin@gmail.com',
      phone: '0987654321',
      walletBalance: '$15,000.00',
    }
  },
  {
    identifier: '0987654321',
    password: '123456',
    user: {
      name: 'Racer Pro',
      email: 'racer@gmail.com',
      phone: '0987654321',
      walletBalance: '$2,500.00',
    }
  }
];

export function loginAPI(identifier, password) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const trimmedIdentifier = identifier ? identifier.trim() : '';
      
      const matchedRecord = MOCK_USERS.find(
        (u) => u.identifier.toLowerCase() === trimmedIdentifier.toLowerCase() && u.password === password
      );

      if (matchedRecord) {
        resolve(matchedRecord.user);
      } else {
        reject(new Error('Invalid phone, email or password. Please try again.'));
      }
    }, 1500); // 1.5s delay
  });
}

export function loginWithGoogleAPI() {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        name: 'Google Racer User',
        email: 'googleuser@gmail.com',
        phone: 'N/A',
        walletBalance: '$9,999.00',
      });
    }, 1200); // 1.2s delay
  });
}

export function signupAPI(name, email, password) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (!name || !email || !password) {
        reject(new Error('Please fill in all fields.'));
        return;
      }
      
      const trimmedEmail = email.trim().toLowerCase();
      const userExists = MOCK_USERS.some(
        (u) => u.identifier.toLowerCase() === trimmedEmail
      );
      
      if (userExists) {
        reject(new Error('An account with this email already exists.'));
        return;
      }
      
      const newUser = {
        name,
        email: trimmedEmail,
        phone: 'N/A',
        walletBalance: '$0.00',
      };
      
      // Save new user temporarily in MOCK_USERS for active session login
      MOCK_USERS.push({
        identifier: trimmedEmail,
        password,
        user: newUser
      });

      resolve(newUser);
    }, 1500);
  });
}

