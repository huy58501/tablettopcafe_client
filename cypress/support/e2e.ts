// Import commands.js using ES2015 syntax:
import './commands';

// Alternatively you can use CommonJS syntax:
// require('./commands')

// Prevent TypeScript errors when accessing Cypress globals
declare global {
  namespace Cypress {
    interface Chainable {
      // Add custom commands here
    }
  }
}
