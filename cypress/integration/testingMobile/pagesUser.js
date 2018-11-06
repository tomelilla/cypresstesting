
import '../../support/commands.mobile';
import { lotteryConst } from '../../support/utility'
import { roundAmt, fmoney } from '../../support/utility.mobile';
let userData = {};

describe('Mobile Page', () => {
  before(() => {
    cy.apiRoute();
    cy.readFile('cypress/fixtures/mobileDemoLogin.json').then((response) => {
      userData = response;
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
  it('user Login', () => {
    cy.getCookie('acType').then((response) => {
      if (response) return;
      cy.contains('登录').click();
      cy.userLogin();
      cy.wait(2000);
      cy.get('.dialog-header > .q-btn > .q-btn-inner > .q-icon').click();
    });
  });
  // userLogin
  it('AccountManage', () => {

  });
  it('AccountInfo', () => {

  });
  it('AccountInfoDetail', () => {

  });
  it('AccountNotification', () => {

  });
  it('Deposit', () => {

  });
  it('WithdrawalsBind', () => {

  });
  it('Withdrawals', () => {

  });
  it('Crowd', () => {

  });
  it('CrowdHome', () => {

  });
  it('CrowdDetail', () => {

  });
  it('CrowdMyInfo', () => {

  });
  it('CrowdMyInfoDetail', () => {

  });
  it('CrowdStarted', () => {

  });
  it('user Logout', () => {
    cy.openHomeMenu();
    cy.contains('退出').click();
    cy.wait(1000);
  });
});
