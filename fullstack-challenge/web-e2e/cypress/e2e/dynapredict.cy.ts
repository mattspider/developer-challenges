function login() {
  cy.visit('/login');
  cy.get('input[type="email"]').clear().type('admin@dynapredict.com');
  cy.get('input[type="password"]').clear().type('senha123');
  cy.contains('button', 'Entrar').click();
  cy.url({ timeout: 10000 }).should('include', 'maquinas');
}

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

  it('login com credenciais invalidas exibe erro', () => {
    cy.visit('/login');
    cy.get('input[type="email"]').clear().type('admin@dynapredict.com');
    cy.get('input[type="password"]').clear().type('senha-errada');
    cy.contains('button', 'Entrar').click();
    cy.url().should('include', 'login');
    cy.contains('Email ou senha invalidos').should('be.visible');
  });

  it('login com credenciais validas', () => {
    login();
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
    cy.get('.MuiSelect-select').click();
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

describe('editar maquina', () => {
  beforeEach(() => {
    login();
  });

  it('edita nome e tipo da maquina', () => {
    cy.contains('Maquina Teste E2E', { timeout: 10000 }).should('be.visible');
    cy.contains('tr', 'Maquina Teste E2E').find('button').eq(1).click();
    cy.url().should('include', 'editar');
    cy.get('form input').first().should('have.value', 'Maquina Teste E2E').clear().type('Maquina Editada E2E');
    cy.get('.MuiSelect-select').click();
    cy.get('[role="option"]').contains('Pump').click();
    cy.contains('button', 'Salvar').click();
    cy.url().should('include', 'maquinas');
    cy.contains('Maquina Editada E2E', { timeout: 10000 }).should('be.visible');
    cy.contains('Pump').should('be.visible');
  });
});

describe('pontos da maquina', () => {
  beforeEach(() => {
    login();
    cy.get('[title="Pontos"]').first().click();
    cy.url({ timeout: 5000 }).should('include', '/pontos');
    cy.contains('Pontos de Monitoramento').should('be.visible');
  });

  it('cria ponto de monitoramento', () => {
    cy.contains('Criar Ponto').should('be.visible');
    cy.contains('Criar Ponto').parent().find('form input').first().clear().type('Ponto E2E');
    cy.contains('Criar Ponto').parent().find('button').contains('Criar').click();
    cy.contains('Ponto E2E', { timeout: 10000 }).should('be.visible');
  });

  it('edita ponto e associa sensor', () => {
    cy.contains('Ponto E2E', { timeout: 10000 }).should('be.visible');
    cy.contains('Ponto E2E').parents('tr').find('button').contains('Editar').click();
    cy.get('[role="dialog"]').find('input').clear().type('Ponto Editado E2E');
    cy.get('[role="dialog"]').contains('button', 'Salvar').click();
    cy.contains('Ponto Editado E2E', { timeout: 10000 }).should('be.visible');
    cy.contains('Ponto Editado E2E').parents('tr').find('button').contains('Adicionar Sensor').click();
    cy.get('[role="dialog"]').find('input').first().clear().type('SEN-001-E2E');
    cy.get('[role="dialog"]').find('.MuiSelect-select').click();
    cy.get('[role="option"]').contains('HF+').click();
    cy.get('[role="dialog"]').contains('button', 'Salvar').click();
    cy.contains('SEN-001-E2E', { timeout: 10000 }).should('be.visible');
  });

  it('exclui ponto', () => {
    cy.contains('Ponto Editado E2E', { timeout: 10000 }).should('be.visible');
    cy.window().then((win) => {
      cy.stub(win, 'confirm').returns(true);
    });
    cy.contains('Ponto Editado E2E').parents('tr').find('button').contains('Excluir').click();
    cy.contains('Ponto Editado E2E', { timeout: 15000 }).should('not.exist');
  });
});

describe('pagina pontos de monitoramento', () => {
  beforeEach(() => {
    login();
  });

  it('acessa e exibe tabela de pontos', () => {
    cy.contains('Pontos de Monitoramento').first().click();
    cy.url().should('include', 'monitoring-points');
    cy.contains('Pontos de Monitoramento').should('be.visible');
    cy.get('table').should('be.visible');
    cy.get('th').contains('Nome da Maquina').should('be.visible');
    cy.get('th').contains('Nome do Ponto').should('be.visible');
  });

  it('ordena por coluna', () => {
    cy.contains('Pontos de Monitoramento').first().click();
    cy.url().should('include', 'monitoring-points');
    cy.get('th').contains('Nome da Maquina').click();
    cy.get('table').should('be.visible');
  });
});
