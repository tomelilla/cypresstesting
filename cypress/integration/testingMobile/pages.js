
import '../../support/commands.mobile';

describe('Mobile Page', () => {
  before(() => {
  });
  beforeEach(() => {
    cy.apiRoute();
    cy.visit(`${Cypress.config().baseUrl}`, {
      onBeforeLoad(win) {
        cy.stub(win, 'open').as('windowOpen')
      },
    });
  });
  after(() => {

  });
  it('Home', () => {
    cy.wait(['@hotGameIcon', '@lotteryList', '@activity']);
    cy.get(':nth-child(1) > .lottery-block__list__item__icon').should('be.visible');
  });
  it('Tutorial', () => {
    cy.contains('新手教程').parent().click();
    cy.checkAboutInfo();
    cy.contains('充值教程').click();
    cy.checkAboutInfo();
  });
  it('Agent - 代理加盟', () => {
    cy.contains('代理加盟').parent().click();
    cy.wait(1000);
    cy.checkAboutInfo();
  });
  it('Agent - 佣金方案', () => {
    cy.contains('代理加盟').parent().click();
    cy.wait(1000);
    cy.contains('佣金方案').click();
    cy.checkAboutInfo();
  });
  it('Agent - 代理注册', () => {
    cy.contains('代理加盟').parent().click();
    cy.wait(1000);
    cy.contains('代理注册').click();
    cy.getApi('@regConfig').then((response) => {
      const data = Cypress._.get(response, 'data');
      data.forEach((regItem, x) => {
        cy.get(`:nth-child(${x+1}) > .q-field > :nth-child(1) > .q-field-label > .q-field-label-inner`).should('be.visible').and('contain', regItem.item);
      });
      cy.get('.c-input-code').should('be.visible');
      cy.get(':nth-child(11) > .q-btn > .q-btn-inner').should('be.visible').and('contain', '立即申请');
    });
  });
  it('About', () => {
    cy.contains('关于我们').parent().click();
    cy.checkAboutInfo();
  });
  it('Activity', () => {
    cy.get('.activity__banner').should('be.visible').click();
    cy.wait('@activity');
    cy.get('.activity-list > :nth-child(1) > .q-list').should('be.visible')
      .contains('查看详情').click();
    cy.get(':nth-child(1) > .q-list > .activity-list__item__content').should('be.visible');
  });
  it('AppDownload', () => {
    cy.contains('APP下载').parent().click();
    cy.get('.app-download__content > :nth-child(1) > .q-btn').should('be.visible');
    cy.get('.app-download__content > :nth-child(2) > .q-btn').should('be.visible');
  });
  it('Reg', () => {
    cy.contains('注册').click();
    cy.getApi('@regConfig').then((response) => {
      const data = Cypress._.get(response, 'data');
      data.forEach((regItem, x) => {
        cy.get(`:nth-child(${x+2}) > .q-field > :nth-child(1) > .q-field-label > .q-field-label-inner`).should('be.visible').and('contain', regItem.item);
      });
    });
  });

});
