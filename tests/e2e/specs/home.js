describe('Home page', () => {
  it('Visits as anonymous user', () => {
    cy.visit('/');
    cy.get('header > h1').should('contain', 'Backcountry Buddy');
    cy.get('.login-form').should('contain', 'Login');
    cy.get('.login-form .user-avatar').should('not.exist');
  });

  it('Visits as authenticated user', () => {
    cy.visit('/');
    cy.login();
    cy.get('header > h1').should('contain', 'Backcountry Buddy');
    cy.get('.login-form').should('not.contain', 'Login');
    cy.get('.login-form .user-avatar').should('exist');
    cy.logout();
  });
});
