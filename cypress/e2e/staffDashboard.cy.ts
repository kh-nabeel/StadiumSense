describe('Staff Dashboard E2E Workflow', () => {
  beforeEach(() => {
    cy.visit('/staff');
  });

  it('renders the Dashboard overview properly', () => {
    cy.contains('Loading StadiumSense').should('not.exist');
    cy.get('h1').should('contain', 'JN Stadium Ops Dashboard');
    cy.get('div').contains('Total Present').should('be.visible');
    cy.get('div').contains('Match Progress').should('be.visible');
  });

  it('allows staff to view alert broadcast panel', () => {
    cy.get('h2').contains('Broadcast Alert').should('be.visible');
    cy.get('textarea[placeholder="Enter alert message..."]').should('exist');
    cy.get('select').eq(0).should('exist'); // Zone selector
  });

  it('displays the stadium map heatmap', () => {
    cy.get('.stadium-map').should('exist');
  });
});
