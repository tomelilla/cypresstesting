// / <reference types="Cypress" />
import '../../../support/commands.mobile';
import {
  getKinds,
} from '../../../support/utility.mobile'

import * as lotteryListsJson from '../../../fixtures/mobileLotteryList.json';
import * as demoLoginJson from '../../../fixtures/mobileDemoLogin.json';

describe('Mobile Lottery Page - Demo', () => {
  before(() => {
  });

  beforeEach(() => {
    // Cypress.Cookies.debug(true);
    Cypress.Cookies.defaults({
      whitelist: /username|access_token|acType|popText/
    });
    cy.apiRoute();
    cy.visit(`${Cypress.config().baseUrl}/404`, {
      onBeforeLoad(win) {
        win.document.cookie = `access_token=${demoLoginJson.access_token};`;
        // win.document.cookie = `username=${demoLoginJson.username};`; // 不要写中文会坏掉
        win.document.cookie = `acType=${demoLoginJson.acType};`;
      },
    });
  });
  // 白名单
  const onlyLotteryLists = [110];
  lotteryListsJson.data.forEach((item) => {
    // 白名单
    if (!Cypress._.isEmpty(onlyLotteryLists) && !onlyLotteryLists.includes(item.cid)) return;
    // 香港六合彩 测试环境开奖问题 跳过
    if ([10, 116, 118].includes(item.cid)) return;
    describe(`彩种 ${item.name} 投注`, () => {
      beforeEach(() => {
        cy.apiRoute();
        cy.openLotteryPage(item.cid);
        cy.wait(['@lotteryList', '@lotteryGame', '@newPriod'])
        .spread((lotteryList, playTree, priod) => {
          if (![116, 118].includes(item.cid)) {
            expect(priod.response.body.data).not.to.be.empty
          }
        });
      });
      const lotteryObj = getKinds(item.cid);
      const tabList = Cypress._.get(lotteryObj, 'tabList', []);
      const lotteryUrl = Cypress._.get(lotteryObj, 'url', '');
      // 一般 不含tabs类
      tabList
      .filter(f => !['连码', '任选', '1-5球', '正特', '特码'].includes(f))
      .forEach((kinds) => {
        it(`${item.name} 投注 ${kinds}`, () => {
          cy.wait(1000);
          cy.randomBet(kinds);
        });
      });
      // 1-5球
      tabList.filter(f => ['1-5球'].includes(f)).forEach((kinds) => {
        // 广西快十
        if (/\/gs\//.test(lotteryUrl)) {
          ['第一球', '第二球', '第三球', '第四球', '第五球']
          .forEach((tabLabel, i) => {
            it(`${item.name} 投注 ${kinds}-${tabLabel}`, () => {
              cy.contains(kinds).click();
              cy.wait(1000);
              cy.randomBet(tabLabel);
            });
          })
        } else {
          // 一般正常
          it(`${item.name} 投注 ${kinds}`, () => {
            cy.wait(1000);
            cy.randomBet(kinds);
          });
        }
      })
      // 连码类
      tabList.filter(f => ['连码', '任选', '正特', '特码'].includes(f)).forEach((kinds) => {
        let maxBetLength = [], tabChildList = [];
        switch (kinds) {
          case '任选':
            maxBetLength = [1, 2, 3, 4, 5];
            tabChildList = ['任选一', '任选二', '任选三', '任选四', '任选五'];
            // 广西快十
            if (/\/gs\//.test(lotteryUrl)) {
              tabChildList = ['任选一', '任选二', '任选三', '任选四'];
            }
            break;
          case '正特':
            Cypress._.range(1,6).forEach((i) => {
              maxBetLength.push(Cypress._.random(3,9));
              tabChildList.push(`正${i}特`);
            })
            break;
          case '连肖':
          case '连尾':
            maxBetLength = [3, 4, 5, 6];
            tabChildList = ['二连', '三连', '四连', '五连'];
            break;
          case '特码':
          maxBetLength = [Cypress._.random(3,9), Cypress._.random(3,9)];
          tabChildList = ['特码A', '特码B'];
            break;
          case '连码':
            maxBetLength = [1, 2, 3, 4, 5, 6, 7, 8, 5, 5];
            tabChildList = ['一中一', '二中二', '三中三', '四中四', '五中五', '六中五',
            '七中五', '八中五', '前二组选', '前三组选'];
            // 广东快十
            if (/\/gd\//.test(lotteryUrl)) {
              maxBetLength = [2, 10, 3, 3];
              tabChildList = ['连二连组', '连二连直', '连三前组', '连三连组'];
            }
            if (/\/lhc\//.test(lotteryUrl)) {
              maxBetLength = [
                Cypress._.random(4,10),
                Cypress._.random(3,7),
                Cypress._.random(2,7),
                Cypress._.random(2,7),
                Cypress._.random(2,7),
                4,
              ];
              tabChildList = ['三全中', '三中二', '二全中', '二中特', '特串', '四全中'];
            }
            break;
          default:
            break;
        }
        tabChildList
        .forEach((tabLabel, i) => {
          it(`${item.name} 投注 ${kinds}-${tabLabel}`, () => {
            cy.contains(kinds).click();
            cy.wait(1000);
            cy.randomBet(tabLabel, maxBetLength[i]);
          });
        })
      })

    });
  });

});
