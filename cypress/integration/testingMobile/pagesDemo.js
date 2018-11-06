
import '../../support/commands.mobile';
import { lotteryConst } from '../../support/utility'
import { roundAmt, fmoney } from '../../support/utility.mobile';
// import fs from 'fs';
let userData = {};

describe('Mobile Page', () => {
  before(() => {
    cy.apiRoute();
    cy.readFile('cypress/fixtures/mobileDemoLogin.json').then((response) => {
      userData = response;
      // console.info('this.usersData', userData);
    });
    cy.visit(`${Cypress.config().baseUrl}`, {
      onBeforeLoad(win) {
        cy.stub(win, 'open').as('windowOpen')
        // win.document.cookie = `username=${userData.username};`; // TODO: 不要写中文会坏掉
        // win.document.cookie = `access_token=${userData.access_token};`;
        // win.document.cookie = `acType=${userData.acType};`;
      },
    });
  });
  beforeEach(() => {
    cy.apiRoute();
    Cypress.Cookies.defaults({
      whitelist: /username|access_token|acType|popText/
    });
  });
  after(() => {

  });
  it('Login', () => {
    cy.getCookie('acType').then((response) => {
      if (response) return;
      cy.contains('试玩').click();
      cy.wait('@testLogin');
      cy.wait(2000);
    });
  });
  // DEMO USER
  it('PastView', () => {
    cy.contains('往期开奖').parent().click();
    cy.getApi('@pastView')
    .then((response) => {
      const arr = Cypress._.get(response, 'data', [])
        .filter(item => !lotteryConst.datetimeLotteryIds.includes(item.lotteryId));
      assert.isArray(arr);
      cy.get('.past-view__item__lottery').should('have.length', arr.length);
    });
  });
  it('BetRecord', () => {
    cy.contains('投注记录').parent().click();
    cy.getApi('@betRecord').then((response) => {
      if (response.data.rows) {
        cy.get('.bet-record-all__badge').should('have.length', response.data.rows.length);
      }
    });
  });
  it('Personal', () => {
    cy.contains('个人中心').parent().click();
    cy.getApi('@balance').then((response) => {
      const balance = fmoney(roundAmt(Cypress._.get(response, 'data.balance', 0)));
      cy.get('.q-list-header > .row > span').should('contain', balance)
    });
  });
  it('Lottery', () => {
    cy.contains('首页大厅').parent().click();
    cy.get(':nth-child(2) > .lottery-block__list__item__icon').click();
  });
  it('InfoPastView', () => {
    cy.get('.q-mr-sm').click();
    cy.contains('往期开奖').click();
    cy.wait(500);
    cy.getApi('@pastViewInfo').then((response) => {
      cy.get('.past-view__item__lottery').should('have.length', response.data.length);
    });
    cy.go(-1)
  });
  it('InfoRoadBeads', () => {
    cy.get('.q-mr-sm').click();
    cy.contains('路珠').click();
    cy.getApi('@loadBeadInfo').then((response) => {
      cy.get('.q-tabs-head > .q-tabs-scroller').should('be.visible');
    });
    cy.go(-1)
  });
  it('InfoDsLong', () => {
    cy.get('.q-mr-sm').click();
    cy.contains('双面长龙').click();
    cy.getApi('@dsLongInfo').then((response) => {
      cy.get('.q-tabs-panes > .q-list > .q-item').should('have.length', response.data.length);
    });
    cy.contains('连续未开').click();
    cy.getApi('@dsLongInfo').then((response) => {
      cy.get('.q-tabs-panes > .q-list > .q-item').should('have.length', response.data.length);
    });
    cy.go(-1);
  });
  it('InfoBetRecord', () => {
    cy.get('.q-mr-sm').click();
    cy.contains('投注记录').click();
    cy.getApi('@betRecord').then((response) => {
      if (response.data.rows) {
        cy.get('.bet-record-all__badge').should('have.length', response.data.rows.length);
      }
    });
  });
  it('demo Logout', () => {
    cy.contains('首页大厅').parent().click();
    cy.openHomeMenu();
    cy.contains('退出').click();
    cy.wait(1000);
  });
});
