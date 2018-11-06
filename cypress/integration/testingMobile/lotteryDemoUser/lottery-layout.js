// / <reference types="Cypress" />
import '../../../support/commands.mobile';
import { getPriodData } from '../../../support/utility.mobile'
import * as lotteryListsJson from '../../../fixtures/mobileLotteryList.json';

describe('Mobile Lottery Page - Demo', () => {
  before(() => {
  });

  beforeEach(() => {
    Cypress.Cookies.defaults({
      whitelist: /username|access_token|acType|popText/
    });
    cy.apiRoute();
    cy.visit(Cypress.config().baseUrl, {
      onBeforeLoad(win) {
        cy.stub(win, 'open')
          .as('windowOpen')
      },
    });
    cy.getCookie('acType').then((response) => {
      if (!response) cy.demoLogin();
    });
  });

  // 限定彩种cid 白名单
  const onlyLotteryLists = [];
  let newPriod;
  lotteryListsJson.data.forEach((item) => {
    // 白名单
    if (!Cypress._.isEmpty(onlyLotteryLists) && !onlyLotteryLists.includes(item.cid)) return;
    // 黑名单 香港六合彩 测试环境开奖问题 跳过
    if ([10].includes(item.cid)) return;
    describe(`检查彩种 ${item.name}`, () => {
      beforeEach(() => {
        cy.apiRoute();
        cy.openLotteryPage(item.cid);
        cy.wait(['@lotteryList', '@lotteryGame', '@newPriod'])
        .spread((lotteryList, playTree, priod) => {
          if (![116, 118].includes(item.cid)) {
            expect(priod.response.body.data).not.to.be.empty
            assert.isArray(priod.response.body.data, '接口[有]取得当前奖期资料')
          }
          newPriod = getPriodData(priod.response.body.data);
        });
      });
      it(`[玩法组] [玩法内容] 显示资料`, () => {
        cy.checkPlayKinds(item.cid);
        cy.checkPlayGroups(item.cid);
      });
      it('上期开奖 [期号] [球号] [doubleData] 正确', () => {
        if (![116, 118].includes(item.cid)) {
          assert.isObject(newPriod.prePriod, '接口[有]取得上期奖期资料')
        }
        cy.checkLastAwrad(newPriod.formatPreIssueAlias);
      });
      if (![116, 118].includes(item.cid)) { // 秒秒彩没有本期
        it('本期投注 [期号] [封盘] [开奖] 显示正确', () => {
          assert.isObject(newPriod.nowPriod, '接口[有]取得当前奖期资料')
          cy.checkCountdown(newPriod.nowIssueAlias);
        });
      }
    });
  });
});
