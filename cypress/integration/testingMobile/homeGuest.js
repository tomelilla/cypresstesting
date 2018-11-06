// / <reference types="Cypress" />
// import {
//   visitBlc
// } from '../../support/utility.js'
import {
  roundAmt,
  dialogClose,
} from '../../support/utility.mobile.js'
import '../../support/commands.mobile';

describe('Mobile Home Page', () => {
  before(() => {
    cy.viewport('iphone-6');
    // cy.apiRoute();
    // visitBlc();
    // cy.visit(Cypress.config().baseUrl, {
    //   onBeforeLoad(win) {
    //     cy.stub(win, 'open').as('windowOpen')
    //   },
    // });
    cy.clearCookies();
  });

  beforeEach(() => {
    cy.viewport('iphone-6');
    cy.apiRoute();
    cy.visit(Cypress.config().baseUrl, {
      onBeforeLoad(win) {
        cy.stub(win, 'open').as('windowOpen')
      },
    });
  });

  it('首页 header', () => {
    cy.wait(['@activity', '@carousel', '@scrollWin']);
    cy.get('.q-toolbar')
    .should('contain', '登录')
    .should('contain', '注册')
    .should('contain', '试玩');
    cy.contains('登录').click();
    cy.get('.login__contain__box').should('contain', '帐号').and('contain', '七天内免登录');
    cy.go(-1);
    cy.wait(['@activity', '@carousel', '@scrollWin']);
    cy.contains('注册').click();
    cy.get('.q-list').should('contain', '登录密码').and('contain', '验证码');
    cy.go(-1);
    cy.get('.account-block > .q-list > .q-item').should(($qItem) => {
      expect($qItem).to.have.length(4);
    });
    cy.get('.lobbyBody > :nth-child(1) > .q-list > :nth-child(1)')
    .should('contain', '充值').click();
    dialogClose();
    cy.get('.lobbyBody > :nth-child(1) > .q-list > :nth-child(2)').should('contain', '提款').click();
    dialogClose();
    cy.get('.lobbyBody > :nth-child(1) > .q-list > :nth-child(3)').should('contain', '优惠活动').click();
    cy.get('.q-toolbar-title').should('contain', '优惠活动');
    cy.get('.activity-list').should(($c) => {
      expect($c).not.to.be.empty;
    });
    cy.get('.q-toolbar > .q-btn').should('have.class', 'header__toolbar__go-back-btn').click();
    cy.get('.lobbyBody > :nth-child(1) > .q-list > :nth-child(4)').should('contain', '在线客服').click();
    cy.get('@windowOpen').should('be.called');
  });

  it('最新消息', () => {
    cy.wait(['@cmsNotices'])
    .then((response) => {
      console.info('response', response);
      const res = response.response.body;
      expect(res.err).to.eq("SUCCESS");
      assert.isArray(res.data);
      const marqueeText = res.data
        .sort((x, y) => y.weight - x.weight)
        .map((item) => item.content).join('<span class="space"></span>');
      cy.get('.marquee--top > .marquee__content > .marquee__content_text')
      .invoke('html')
      .should('includes', marqueeText);
    });
  });

  it('轮播图', () => {
    cy.wait(['@carousel'])
    .then((response) => {
      const res = response.response.body;
      expect(res.err).to.eq("SUCCESS");
      assert.isArray(res.data.itemPO);
      res.data.itemPO.forEach((item, i) => {
        cy.get('.q-carousel-slide.relative-position').find('.q-display-3 > a')
        .eq(i).should('have.attr', 'href', item.link)
        .find('img').invoke('attr', 'src')
        .should('includes', item.titlePic) ;
      });
    });
  });

  it('主游戏区', () => {
    cy.wait(['@lotteryList']);
    cy.get('@lotteryList').then((response) => {
      const res = response.response.body;
      expect(res.err).to.eq("SUCCESS");
      assert.isArray(res.data);
      const lotteryList = res.data.slice(0, 9)
      cy.get('.hotgame-area').find('.lottery-block__list__item').should(($c) => {
        expect($c).to.have.length(12);
        expect($c.eq(0)).to.contain('众筹彩');
        expect($c.eq(10)).to.contain('更多游戏');
        expect($c.eq(11)).to.contain('APP下载');
        lotteryList.forEach((item, i) => {
          expect($c.eq(i+1)).to.contain(item.name);
        });
      });
    });
  });

  it('优惠活动', () => {
    cy.wait(['@activity']).then((response) => {
      const res = response.response.body;
      expect(res.err).to.eq("SUCCESS");
      assert.isArray(res.data.rows);
      const list = Cypress._.head(res.data.rows);
      cy.get('.promoindex_area')
        .should('contain', '更多 >')
        .find('.q-icon').should('have.class',  'icon-tool--lobby-activity');
      cy.get('.activity__banner').invoke('attr', 'src').should('includes', list.titlePic);
    });
  });

  it('帮助中心', () => {
    cy.get('.cooper')
      // .should('be.visible')
      .should('contain', '合作加盟')
      .find('.q-icon')
      .should('have.class', 'icon-tool--lobby-cooper');
    const testList = [
      {label:'新手教程', icon: 'icon-lobby--new', path: '/tutorial'},
      {label:'代理加盟', icon: 'icon-lobby--agent', path: '/agent'},
      {label:'关于我们', icon: 'icon-lobby--about', path: '/about'},
    ];
    cy.get('.account-block.tri > ul > li').should(($c) => {
      expect($c).to.have.length(3);
      testList.forEach((item, i) => {
        expect($c.eq(i)).to.contain(item.label);
        expect($c.eq(i).find('.icon-lobby')).to.have.class(item.icon);
      })
    });
    cy.wait(1000);
    testList.forEach((item, i) => {
      cy.get(`.${item.icon}`).parent().should('contain', item.label).click();
      cy.url().should('contain', `${Cypress.config().baseUrl}${item.path}`);
      cy.get('.q-layout')
      .should('contain', item.label);
      cy.get('.q-toolbar > .q-btn')
      .should('contain', 'keyboard_arrow_left')
      .click();
    })
  });

  it('众筹滚动显示', () => {
    cy.wait(['@scrollWin']).then((response) => {
      const res = response.response.body;
      expect(res.code).to.eq(0);
      assert.isArray(res.data);
      const text = res.data
      .map(item => (`<br>恭喜会员 ${item.userAccount} 在 ${item.lotteryName} 获得奖金 ${roundAmt(item.revenue)} 元`))
      .join("")
      cy.get('.crowdfunding-index-box')
      .should('be.visible')
      .find('marquee').as('marquee')
      cy.get("@marquee")
      .should('be.visible')
      .invoke('attr', 'direction').should('includes', 'up')
      cy.get("@marquee")
      .invoke('html').should('includes', text)
    });
  });

  it('众筹 - 彩神/富豪榜', () => {
    cy.get('.crowdfunding-index__tool-icon > .q-icon')
      .should('have.class', 'icon-crowdfunding-tool')
      .click();

    cy.get('.crowdfunding-index__list')
      .should('be.visible')
      .should('contain', '彩神榜').and('contain', '富豪榜').as('list');
    cy.wait(['@ranking']).then((response) => {
      const res = response.response.body;
      expect(res.code).to.eq(0);
      assert.isArray( res.data.prizeRankingList )
      expect(res.data.prizeRankingList.length).to.eq(10);
      assert.isArray( res.data.richestRanking )
      expect(res.data.richestRanking.length).to.eq(10);
      cy.get('.crowdfunding-index__table__item').should('have.length', 20);
      cy.get('.icon-crowdfunding-tool--arrow-down').click();
      cy.contains('彩神榜')
        .should('not.exist');
    });
  });

  it.only('footer', () => {
    const testList = [
      {label: '首页大厅', icon: 'icon-tool--nav-home', path: ''},
      {label: '往期开奖', icon: 'icon-tool--nav-pastview', path: '/pastView'},
      {label: '投注记录', icon: 'icon-tool--nav-betrecord', path: '/betRecord'},
      {label: '个人中心', icon: 'icon-tool--nav-personal', path: '/personal'},
    ];
    cy.get('footer.q-layout-footer > ').find('.q-tabs-scroller > .q-tab').should(($c) => {
      expect($c).to.have.length(4);
      testList.forEach((item, i) => {
        expect($c.eq(i)).to.contain(item.label);
        expect($c.eq(i).find('.q-icon')).to.have.class(item.icon);
      });
    });
    testList.forEach((item, i) => {
      cy.get(`.${item.icon}`).click();
      cy.wait(300);
      if (i > 0) {
        dialogClose();
        // cy.get(`.${item.icon}`).parent().should('not.have.class', 'active');
      }
    });
  });



});
