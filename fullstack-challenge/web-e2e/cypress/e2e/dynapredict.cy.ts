describe('DynaPredict E2E', () => {
  it('redireciona para login quando nao autenticado', () => {
    cy.visit('/maquinas');
    cy.url().should('include', 'login');
  });

  it('pagina de login exibe formulario', () => {
    cy.visit('/login');
    cy.get('input[type="email"]').should('be.visible');
    cy.get('input[type="password"]').should('be.visible');
    cy.contains('button', 'Entrar').should('be.visible');
  });

  it('login com credenciais validas', () => {
    cy.visit('/login');
    cy.get('input[type="email"]').clear().type('admin@dynapredict.com');
    cy.get('input[type="password"]').clear().type('senha123');
    cy.contains('button', 'Entrar').click();
    cy.url({ timeout: 10000 }).should('include', 'maquinas');
    cy.contains('Maquinas').should('be.visible');
  });

  it('fluxo completo: login, criar maquina, logout', () => {
    cy.visit('/login');
    cy.get('input[type="email"]').clear().type('admin@dynapredict.com');
    cy.get('input[type="password"]').clear().type('senha123');
    cy.contains('button', 'Entrar').click();
    cy.url({ timeout: 10000 }).should('include', 'maquinas');
    cy.contains('button', 'Nova Maquina').click();
    cy.url().should('include', 'nova');
    cy.get('form input').first().clear().type('Maquina Teste E2E');
    cy.get('form [role="button"]').first().click();
    cy.get('[role="option"]').contains('Fan').click();
    cy.contains('button', 'Salvar').click();
    cy.url().should('include', 'maquinas');
    cy.contains('Maquina Teste E2E').should('be.visible');
    cy.contains('button', 'Sair').click();
    cy.url().should('include', 'login');
  });
});

describe('pagina inicial', () => {
  it('redireciona para login ou maquinas', () => {
    cy.visit('/');
    cy.url({ timeout: 5000 }).should('satisfy', (url: string) =>
      url.includes('login') || url.includes('maquinas')
    );
  });
});
