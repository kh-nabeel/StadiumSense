describe('StadiumSense Attendee Flow', () => {
  beforeEach(() => {
    cy.visit('http://localhost:5173')
    // Wait for app to load (anonymous auth + Firebase init)
    cy.get('[id="root"]', { timeout: 10000 }).should('exist')
  })

  it('loads the attendee view', () => {
    cy.contains('StadiumSense').should('be.visible')
    cy.contains('Attendee View').should('be.visible')
    // LIVE badge
    cy.contains('LIVE').should('be.visible')
  })

  it('shows the crowd density map/fallback', () => {
    // Map tab is default
    cy.get('[aria-label="Main navigation"]').should('exist')
    // Either the map renders or the zone cards fallback appears
    cy.get('[role="main"]').should('be.visible')
  })

  it('navigates to the Queues tab and shows concession stands', () => {
    cy.get('button[aria-label="Queues"]').click()
    cy.contains('Concession Queues').should('be.visible')
    // At least one queue card should render
    cy.get('article').should('have.length.at.least', 1)
    // First stand should show a wait time
    cy.get('article').first().should('contain.text', 'min')
  })

  it('expands a queue card to show menu items', () => {
    cy.get('button[aria-label="Queues"]').click()
    cy.get('article').first().click()
    // Menu section appears
    cy.contains('Menu').should('be.visible')
  })

  it('navigates to the Order tab', () => {
    cy.get('button[aria-label="Order"]').click()
    cy.contains('Food Pre-Order').should('be.visible')
    cy.contains('Choose a Stand').should('be.visible')
  })

  it('can select a stand and add items to cart', () => {
    cy.get('button[aria-label="Order"]').click()
    // Pick the first open stand
    cy.get('[aria-label^="Select"]').first().click()
    cy.contains('Choose Items').should('be.visible')
    // Add first item
    cy.get('[aria-label^="Add one"]').first().click()
    // Quantity should become 1
    cy.contains('1').should('be.visible')
    // Continue button should be enabled
    cy.contains('Continue →').should('not.be.disabled')
  })

  it('navigates to the Alerts tab', () => {
    cy.get('button[aria-label="Alerts"]').click()
    cy.contains('Stadium Alerts').should('be.visible')
  })

  it('can navigate to staff dashboard', () => {
    cy.visit('http://localhost:5173/staff')
    cy.contains('Staff Operations').should('be.visible')
    cy.contains('Live Occupancy').should('be.visible')
  })
})
