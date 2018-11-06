// / <reference types="Cypress" />
// import {
//   visitBlc
// } from '../../support/utility.js'
import {
  openMenu,
  checkRoutePageUrl,
  dialogClose,
} from '../../support/utility.mobile.js'
import '../../support/commands.mobile';

describe('Mobile Home Page - Demo', () => {
  before(() => {
    cy.viewport('iphone-6');
    cy.apiRoute();
    cy.visit(Cypress.config().baseUrl);
    cy.getCookie('acType').then((response) => {
      if (!response) {
        cy.contains('试玩').click();
        cy.demoLogin();
      }
    });
  });

  beforeEach(() => {
    Cypress.Cookies.preserveOnce("username", "access_token", "acType", "popText125");
    cy.viewport('iphone-6');
    cy.apiRoute();
    cy.visit(Cypress.config().baseUrl, {
      onBeforeLoad(win) {
        cy.stub(win, 'open').as('windowOpen')
      },
    });
  });

  describe('demo Login', () => {
    it('header 显示[游客], 左边显示[Menu]Icon', () => {
      // 另开视窗检查
      cy.get('.q-toolbar').should('contain', '游客')
      .find('.q-btn > .q-btn-inner > .q-icon')
      .should('be.visible').and('have.class', 'icon-tool--nav');
    });
    it('Menu 内显示[游客], 余额[2,000.00] 金额正确', () => {
      openMenu();
      cy.get('.index-left > .q-layout-drawer')
      .should('be.visible')
      .and('contain', '游客').and('contain', '2,000.00');
    });

    ['充值', '提款', '帐户明细'].forEach((item) => {
      it(`侧Menu 游客身份 [不可]使用${item}功能, 提示注册`, () => {
        openMenu();
        cy.get('.q-layout-drawer > .q-list')
        .contains(item).click();
        cy.wait(500)
        cy.get('.modal-auto__body__content').should('contain', '游客不能访问该功能，是否注册会员？');
        dialogClose();
      });
    });

    ['充值', '提款'].forEach((item) => {
      it(`主Menu 游客身份 [不可]使用${item}功能, 提示注册`, () => {
        cy.get('.lobbyBody > :nth-child(1)')
        .contains(item).parent().click();
        cy.wait(500)
        cy.get('.modal-auto__body__content').should('contain', '游客不能访问该功能，是否注册会员？');
        dialogClose();
      });
    });

    it('侧Menu 游客身分 [可]使用在线客服功能, 另开新视窗, 网址如接口提供', () => {
      openMenu();
      cy.contains('在线客服').click();
      cy.get('@cust').then((response) => {
        cy.get('@windowOpen').should('be.calledWith', response.response.body.data.h5CustUrl);
      });
    });

    it('主Menu 游客身分 [可]使用在线客服功能, 另开新视窗, 网址如接口提供', () => {
      cy.get('.lobbyBody > :nth-child(1) > .q-list  > :nth-child(4)').should('contain', '在线客服').click();
      cy.get('@cust').then((response) => {
        cy.get('@windowOpen').should('be.calledWith', response.response.body.data.h5CustUrl);
      });
    });

    it('主Menu - 优惠活动 路由页面正常', () => {
      cy.get('.lobbyBody > :nth-child(1) > .q-list  > :nth-child(3)').should('contain', '优惠活动').click();
      checkRoutePageUrl('/activity', '优惠活动');
      cy.wait(['@activity']);
      cy.get('@activity').then(({response}) => {
        const res = response.body.data.rows.length;
        if (res === 0) return;
        cy.get('.activity-list').should(($c) => {
          expect($c).not.to.be.empty;
        });
      });
    });

    it('热门游戏区块 众筹彩 游客身份 [不可]使用', () => {
      cy.contains('众筹彩').parent().click();
      dialogClose();
    });

    it('热门游戏区块 彩种显示 依照接口提供前9个显示', () => {
      cy.wait(['@lotteryList']);
      cy.get('@lotteryList').then((response) => {
        const res = response.response.body;
        expect(res.err).to.eq("SUCCESS");
        assert.isArray(res.data);
        const listArr = res.data.slice(0, 9);
        listArr.forEach((item, i) => {
          const x = i+2;
          cy.get(`.lottery-block__list > :nth-child(${x})`).should('contain', item.name)
          .find('img')
          .invoke('attr', 'src')
          .should('includes', item.imgUrl);
        })
      });
    });

    it('热门游戏区块 更多游戏 打开侧memu 彩种依接口显示', () => {
      cy.contains('更多游戏').parent().click();
      cy.get('.lottery-left-drawer-scroll-area').should('contain', '游客').and('contain', '返回首页大厅');
      cy.wait(['@lotteryList']);
      cy.get('@lotteryList').then((response) => {
        const randrom = Cypress._.random(response.response.body.data.length);
        let pageItem;
        response.response.body.data.forEach((item, i) => {
          const x = i + 1;
          cy.get(`.lottery-left-drawer-scroll-area > .q-list > :nth-child(3) > :nth-child(${x})`).should('contain', item.name);
          if ((i+1) === randrom) {
            pageItem = item;
          }
        })
        cy.get(`.lottery-left-drawer-scroll-area > .q-list > :nth-child(3) > :nth-child(${randrom})`).click();
        cy.wait(['@newPriod', '@lotteryGame']).then(() => {
          cy.get('.q-layout').should('contain', pageItem.name);
          cy.get('.q-btn-round > .q-btn-inner > .q-icon').click();
          cy.get(':nth-child(2) > .lottery-left-drawer-scroll-area__list__item').click();
        })
      });
    });

    it('热门游戏区块 APP下载功能 依照接口提供是否另开新视窗', () => {
      cy.get('@app').then(({response}) => {
        const url = Cypress._.get(response, 'body.data.url', false);
        cy.contains('APP下载').parent().click();
        if (url) cy.get('@windowOpen').should('be.calledWith', url);
      });
    });

    it('FOOTER 游客身份 [可]检视 往期开奖', () => {
      cy.contains('往期开奖').parent().click();
      cy.wait(['@pastView']);
      checkRoutePageUrl('/pastView', '往期开奖')
    });

    it('FOOTER 游客身份 [可]检视 投注记录', () => {
      cy.contains('投注记录').parent().click();
      cy.wait(['@betRecord']);
      checkRoutePageUrl('/betRecord', '投注记录')
    });

    it('FOOTER 游客身份 [可]检视 个人中心', () => {
      cy.contains('个人中心').parent().click();
      cy.get('.q-layout').should('contain', '个人中心');
      checkRoutePageUrl('/personal', '个人中心')
    });

  });
});
