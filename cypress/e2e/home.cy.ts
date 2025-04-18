describe('Home Page', () => {
  beforeEach(() => {
    cy.visit('/');
    cy.get('input[name="username"]').type('admin');
    cy.get('input[name="password"]').type('admin123');
    cy.get('button[type="submit"]').click();
  });

  it('should load the homepage successfully', () => {
    // Check if the page loads
    cy.url().should('include', '/');
    // Verify the page is interactive
    cy.get('body').should('be.visible');
  });
});
