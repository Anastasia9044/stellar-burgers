const selectors = {
  modal: '[data-cy="modal"]',
  modalTitle: '[data-cy="modal-title"]',
  modalClose: '[data-cy="modal-close"]',
  modalOverlay: '[data-cy="modal-overlay"]',
  orderButton: '[data-cy="order-button"]',
  orderNumber: '[data-cy="order-number"]'
};

describe('Конструктор бургера', () => {
  beforeEach(() => {
    cy.login();

    cy.intercept('GET', '**/api/ingredients', {
      fixture: 'ingredients.json'
    }).as('getIngredients');
    cy.intercept('GET', '**/api/auth/user', { fixture: 'user.json' }).as(
      'getUser'
    );
    cy.intercept('POST', '/api/orders', { fixture: 'order.json' }).as(
      'createOrder'
    );

    cy.visit('/');
    cy.wait('@getIngredients');
    cy.wait('@getUser');
  });

  it('Добавление ингредиента в конструктор', () => {
    const bun = 'Краторная булка N-200i';
    const main = 'Биокотлета из марсианской Магнаты';

    cy.contains(bun).parent().find('button').click();
    cy.get('.constructor-element').should('contain', `${bun} (верх)`);
    cy.get('.constructor-element').should('contain', `${bun} (низ)`);

    cy.contains(main).parent().find('button').click();
    cy.get('.constructor-element').should('contain', main);
  });

  describe('Модальное окно ингредиента', () => {
    it('Открывается по клику на ингредиент', () => {
      cy.contains('Краторная булка N-200i').click();
      cy.get(selectors.modal).should('be.visible');
      cy.get(selectors.modalTitle).should('contain', 'Детали ингредиента');
    });

    it('Закрывается по клику на крестик', () => {
      cy.contains('Краторная булка N-200i').click();
      cy.get(selectors.modalClose).click();
      cy.get(selectors.modal).should('not.exist');
    });

    it('Закрывается по клику на оверлей', () => {
      cy.contains('Краторная булка N-200i').click();
      cy.get(selectors.modalOverlay).click({ force: true });
      cy.get(selectors.modal).should('not.exist');
    });
  });

  describe('Оформление заказа', () => {
    it('Оформление заказа и проверка модального окна', () => {
      cy.contains('Краторная булка N-200i').parent().find('button').click();
      cy.contains('Биокотлета из марсианской Магнаты')
        .parent()
        .find('button')
        .click();

      cy.get(selectors.orderButton).contains('Оформить заказ').click();

      cy.wait('@createOrder')
        .its('response.body')
        .then((body) => {
          console.log('🔍 Ответ API:', body);
          expect(body).to.have.property('success', true);
          expect(body.order).to.have.property('number', 58321);
        });

      cy.get(selectors.orderNumber).should('be.visible');

      cy.get(selectors.modalOverlay).click({ force: true });
      cy.get(selectors.modal).should('not.exist');

      cy.get('.constructor-element').should('have.length.lessThan', 3);
    });
  });
});
