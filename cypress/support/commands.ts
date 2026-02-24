Cypress.Commands.add('login', () => {
  cy.setCookie('accessToken', 'fake-access-token');
  window.localStorage.setItem('refreshToken', 'fake-refresh-token');
});
