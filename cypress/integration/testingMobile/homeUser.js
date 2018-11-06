// / <reference types="Cypress" />
// import {
//   visitBlc
// } from '../../support/utility.js'
import {
  openMenu,
  userLogin,
  checkRoutePageUrl,
  fmoney,
  roundAmt,
} from '../../support/utility.mobile.js'
import '../../support/commands.mobile';

describe('Mobile Home Page', () => {
  before(() => {
    cy.viewport('iphone-6');
    cy.apiRoute();
    cy.visit(Cypress.config().baseUrl);
    cy.getCookie('acType').then((response) => {
      if (!response) {
        cy.contains('登录').click();
        cy.userLogin();
      }
    });
  });

  beforeEach(() => {
    Cypress.Cookies.defaults({
      whitelist: /username|access_token|acType|popText/
    });
    cy.viewport('iphone-6');
    cy.apiRoute();
    cy.visit(Cypress.config().baseUrl, {
      onBeforeLoad(win) {
        cy.stub(win, 'open').as('windowOpen')
      },
    });
  });

  it('弹窗 公告', () => {
    // 首页登入弹窗内容验证
    cy.wait(['@popText']);
    cy.get('@popText').then((response) => {
      const { content, cid } = Cypress._.head(response.response.body.data);
      cy.getCookie(`popText${cid}`).then((response) => {
        if (!response) {
          cy.get('.modal-content').should('contain', '温馨提醒').and('contain', content);
          cy.get('.dialog-header > .q-btn').should('contain', 'close').click();
        }
      });
    });
  });
  it('Header Toolbar', () => {
    // header Name
    cy.getCookie('username').then((response) => {
      cy.get('.header__personal-info').should('be.visible').and('contain', response.value);
    });
    // 讯息提示
    cy.wait(['@msgStatus']);
    cy.get('@msgStatus').then((response) => {
      const status = response.response.body.data;
      if (status) {
        cy.get('.header__personal-info > .q-icon').should('have.class', 'active');
      }
    });
    // 侧menu
    openMenu();
    cy.get('.q-layout-drawer > .q-list > .q-list-header').should('be.visible');
  });

  it('侧menu功能 - 是否显示会员名称, 余额是否有显示', () => {
    cy.route('/hermes/api/balance/get?*').as('balance');
    openMenu();
    cy.wait(['@balance']);
    // 确认余额
    cy.get('@balance').then((response) => {
      const { balance } = response.response.body.data;
      const balanceFormat = fmoney(roundAmt(balance));
      cy.getCookie('username').then((response) => {
        cy.get('.index-left > .q-layout-drawer')
        .should('be.visible')
        .and('contain', response.value)
        .and('contain', balanceFormat);
      });
    });
  });
  it('侧menu功能 - 会员身份 充值路由页面正常', () => {
    openMenu();
    // 充值路由
    cy.get('.q-layout-drawer > .q-list > :nth-child(2)').should('contain', '充值').click();
    checkRoutePageUrl('/deposit');
    cy.wait(['@payWay', '@deposit']);
    cy.get('.modal-header > .q-btn').click();
    cy.get('.q-toolbar').should('contain', '充值');
    cy.get('.q-toolbar > .q-btn').click();
  });
  it('侧menu功能 - 会员身份 提款路由页面正常 - 已设定提款银行帐号', () => {
    openMenu();
    // 提款路由
    cy.get('.q-layout-drawer > .q-list > :nth-child(3)').should('contain', '提款').click();
    cy.wait(['@memberBankInfo']);
    checkRoutePageUrl('/withdrawals', '提款');
  });
  it('侧menu功能 - 会员身份 提款路由页面正常 - 未设定提款银行帐号', () => {
    openMenu();
    // 提款路由
    cy.get('.q-layout-drawer > .q-list > :nth-child(3)').should('contain', '提款').click();
    cy.wait(['@memberBankInfo']);
    checkRoutePageUrl('/withdrawals_bind', '开户行');
  });

  // 帐户明细路由
  it('侧menu功能 - 会员身份 帐户明细路由页面正常', () => {
    openMenu();
    cy.get('.q-layout-drawer > .q-list > :nth-child(4)').should('contain', '帐户明细').click();
    checkRoutePageUrl('/accountInfo', '帐户明细')
  });

  // 在线客服
  it('侧menu功能 - 会员身份 在线客服开启新页面', () => {
    openMenu();
    cy.get('.q-layout-drawer > .q-list > :nth-child(5)').should('contain', '在线客服').click();
    cy.get('@windowOpen').should('be.called');

  });

  it(`主Menu 会员身份 [可]使用充值功能 路由页面正常`, () => {
    cy.get('.lobbyBody > :nth-child(1)')
    .contains('充值').parent().click();
    checkRoutePageUrl('/deposit', '充值');
  });

  it(`主Menu 会员身份未设定银行帐号 [可]使用提款功能 路由页面导向开户行设定`, () => {
    cy.get('.lobbyBody > :nth-child(1)')
    .contains('提款').parent().click();
    cy.wait(['@memberBankInfo']);
    checkRoutePageUrl('/withdrawals_bind', '开户行');
  });

  it('主Menu 会员身份 [可]使用在线客服功能, 另开新视窗, 网址如接口提供', () => {
    cy.get(':nth-child(1) > .q-list > :nth-child(4)').should('contain', '在线客服').click();
    cy.get('@cust').then((response) => {
      cy.get('@windowOpen').should('be.calledWith', response.response.body.data.h5CustUrl);
    });
  });

  it('主Menu - 优惠活动 路由页面正常', () => {
    cy.get(':nth-child(1) > .q-list > :nth-child(3)').should('contain', '优惠活动').click();
    checkRoutePageUrl('/activity', '优惠活动');
    cy.get('.activity-list').should(($c) => {
      expect($c).not.to.be.empty;
    });
  });

  it('热门游戏区块 众筹彩 会员身份 [可]使用', () => {
    cy.contains('众筹彩').parent().click();
    checkRoutePageUrl('/crowdFunding/crowdFunding', '众筹彩');
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
    cy.getCookie('username').then((response) => {
      cy.get('.lottery-left-drawer-scroll-area').should('contain', response.value).and('contain', '返回首页大厅');
    });
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
    cy.get('@app').then((response) => {
      const { url } = response.response.body.data;
      cy.contains('APP下载').parent().click();
      cy.get('@app').then((response) => {
        cy.get('@windowOpen').should('be.calledWith', response.response.body.data.url);
      });
    });
  });

  it('FOOTER 会员身份 [可]检视 往期开奖', () => {
    cy.contains('往期开奖').parent().as('tab')
    cy.get('@tab').click();
    cy.wait(['@pastView']);
    checkRoutePageUrl('/pastView', '往期开奖')
    cy.get('@tab').should('not.have.class', 'active');
  });

  it('FOOTER 会员身份 [可]检视 投注记录', () => {
    cy.contains('投注记录').parent().as('tab').click();
    cy.wait(['@betRecord']);
    checkRoutePageUrl('/betRecord', '投注记录')
    cy.get('@tab').should('not.have.class', 'active');
  });

  it('FOOTER 会员身份 [可]检视 个人中心', () => {
    cy.contains('个人中心').parent().click();
    cy.get('.q-layout').should('contain', '个人中心');
    checkRoutePageUrl('/personal', '个人中心')
  });

  // 退出
  it('check logout', () => {
    cy.wait(['@activity']);
    openMenu();
    cy.contains('退出').click();
    cy.wait(['@logout']);
    cy.get('@logout').then((response) => {
      console.info('response', response);
    });
  });
});
