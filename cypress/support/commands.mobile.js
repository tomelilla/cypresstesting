
import {
    openLotteryPage,
} from '../support/utility.js'
import Tesseract from 'tesseract.js'

Cypress.Commands.add('visitPage', (obj) => {
    cy.visit(Cypress.env("target"), obj);
})
Cypress.Commands.add('apiRoute', () => {
  cy.server();
  cy.route('/forseti/api/pay/receiptClient').as('payWay');
  cy.route('/forseti/api/pay/tradeList?searchType=1&*').as('accountInfo');
  cy.route('/forseti/api/payment/memberBank').as('memberBankInfo');
  cy.route('/forseti/api/playsTree*').as('lotteryGame');
  cy.route('/forseti/api/priodDataNewly?lotteryId=*').as('newPriod');
  cy.route('/forseti/api/priodDataNewlys?sideType=2').as('pastView');
  cy.route('/forseti/api/openNums/doubleCount*').as('pastViewInfo');
  cy.route('/forseti/api/openNums/loadBead*').as('loadBeadInfo');
  cy.route('/forseti/api/openNums/doubleLong*').as('dsLongInfo');
  cy.route('/forseti/apid/cms/activity*').as('activity');
  cy.route('/forseti/apid/cms/carousel').as('carousel');
  cy.route('/forseti/apid/cms/copyright?type=3&code=AT01').as('deposit');
  cy.route('/forseti/apid/cms/msg/status?*').as('msgStatus');
  cy.route('/forseti/apid/cms/notices?*').as('cmsNotices');
  cy.route('/forseti/apid/cms/popText').as('popText');
  cy.route('/forseti/apid/cms/site').as('site');
  cy.route('/forseti/apid/config/appConfig').as('app');
  cy.route('/forseti/apid/config/custConfig').as('cust');
  cy.route('/forseti/apid/icons').as('hotGameIcon');
  cy.route('/forseti/apid/lotterys?*').as('lotteryList');
  cy.route('/forseti/apid/payment/banks').as('paymentBanks');
  cy.route('/hermes/api/balance/get?*').as('balance');
  cy.route('/uaa/apid/member/code/get?time=*').as('code');
  cy.route('/apid/serverCurrentTime*').as('sysTime');
  cy.route('/forseti/apid/cms/copyright*').as('about');
  cy.route('/forseti/apid/config/registerConfig*').as('regConfig');
  cy.route('/v1/crowdfunding/ranking').as('ranking');
  cy.route('/v1/crowdfunding/scrollwin').as('scrollWin');
  cy.route('GET', '/uaa/oauth/logout').as('logout');
  cy.route('POST', '/forseti/api/orders/orderList').as('betRecord');
  cy.route('POST', '/uaa/apid/member/login').as('userLogin');
  cy.route('POST', '/uaa/apid/member/testLogin').as('testLogin');
  cy.route('POST', '/forseti/api/orders/betOrder').as('betOrder');
});
Cypress.Commands.add('demoLogin', () => {
  cy.get(':nth-child(3) > .q-btn-inner > div').as('DemoPlay')
    .click(); // .wait(1000);
  cy.wait(['@testLogin']).then((response) => {
    expect(response.response.body.err).to.eq("SUCCESS"); //遊客登入成功
    const data = Cypress._.extend( response.response.body.data, {
      loginTime: new Date().getTime()
    })
    cy.writeFile('cypress/fixtures/mobileDemoLogin.json', data);
  });
  // 弹窗提示
  cy.get('.modal-auto__body__content').as('autoDialog')
    .should('be.visible').contains('登录成功');
  cy.getCookie('access_token').should('have.property', 'value');
  cy.getCookie('acType').should('have.property', 'value', '2');
  cy.get('.modal-footer').should('be.not.visible');
})

Cypress.Commands.add('closeDialog', () => {
  cy.get('.modal-content').should('be.visible');
  cy.get('.icon-pop').should('have.class', 'icon-pop--notice');
  cy.wait(500);
  cy.get('.q-btn-outline > .q-btn-inner').should('be.visible').and('contain', '取消').click();
  cy.get('.modal-auto__body__content').should('be.not.visible');
});
Cypress.Commands.add('openHomeMenu', () => {
  cy.get('.q-toolbar').find('.q-btn > .q-btn-inner > .q-icon')
  .should('be.visible').and('have.class', 'icon-tool--nav').click();
});
Cypress.Commands.add('openLotteryPage', (cid) => {
  const baseUrl = Cypress.config('baseUrl');
  const url = openLotteryPage(cid);
  cy.visit(`${baseUrl}${url.url}`);
});

Cypress.Commands.add('ocrCode', (codeImg) => {
  return new Cypress.Promise((resolve, reject) => {
    Tesseract.recognize(`data:image/png;base64,${codeImg}`)
    .then((result) => resolve(result.text.trim()));
  })
});

Cypress.Commands.add('userLogin', () => {
  cy.get('.q-field').should(($c) => {
    expect($c).to.have.length(3);
  });
  cy.get(':nth-child(1) > .q-field > :nth-child(1) > .q-field-label > .q-field-label-inner')
  .should('contain', '帐号');
  cy.get(':nth-child(1) > .q-field > :nth-child(1) > .q-field-content > .q-if > .q-if-inner > .col')
  .type(Cypress.env('user'));
  cy.get(':nth-child(2) > .q-field > :nth-child(1) > .q-field-content > .q-if > .q-if-inner > .col')
  .type(Cypress.env('password'));
  cy.get('@code').then(({response}) => {
    cy.wrap(null).then(() => {
      return cy.ocrCode(Cypress._.get(response, 'body.data.code', false)).then((response) => {
        cy.get(':nth-child(3) > .q-field > :nth-child(1) > .q-field-content > .q-if > .q-if-inner > .col').type(response);
      });
    });
    cy.wait(1000);
    cy.get(':nth-child(5) > .q-btn > .q-btn-inner').should('contain', '登录').click();
    cy.wait(['@userLogin']).then((response) => {
      const data = Cypress._.extend( response.response.body.data, {
        loginTime: new Date().getTime()
      })
      cy.writeFile('cypress/fixtures/mobileUserLogin.json', data);
    });
    cy.get('.modal-content').should('contain', '登录成功');
    cy.url().should('contain', `${Cypress.config().baseUrl}`);
    cy.get('.modal-content').should('contain', '登录成功');
    // cy.getCookie('username').should('have.property', 'value', Cypress.env('user'));
    cy.getCookie('access_token').should('have.property', 'value');
    cy.getCookie('acType').should('have.property', 'value', '1');
  });
})


Cypress.Commands.add('checkCountdown', (nowIssueAlias) => {
  cy.get('.colmun > :nth-child(2) > span').should('be.visible')
    .invoke('html')
    .should('match', /(\d{2}:\d{2}|已封盘)/)
  // 开奖时间
  cy.get('.colmun > :nth-child(3) > span').should('be.visible')
    .invoke('html')
    .should('match', /\d{2}:\d{2}/)
  cy.get('.lottery-countdown__code')
    .invoke('html')
    .should('match', new RegExp(`第(${nowIssueAlias})期`));
});
Cypress.Commands.add('checkLastAwrad', (formatPreIssueAlias) => {
  cy.get('.lottery-top__priod-code__code')
    .invoke('html')
    .should('match', new RegExp(formatPreIssueAlias));
  cy.get('.past-view-ball > .q-list')
    .should($el => { expect($el).not.to.be.empty; });
  cy.get('.items-stretch > .items-end')
    .should($el => { expect($el).not.to.be.empty; });
});
Cypress.Commands.add('checkPlayKinds', (cid) => {
  const kinds = openLotteryPage(cid);
  cy.get('.col-3 > .scroll > .q-list > button')
    .should(($button) => {
      expect($button).not.to.be.empty;
      kinds.tabList.forEach((label, i) => {
        expect($button.eq(i)).to.contain(label);
      })
    });
});
Cypress.Commands.add('checkPlayGroups', () => {
  cy.get('.play-tree__list > .play-tree__block')
    .should(($block) => { expect($block).not.to.be.empty; });
});

Cypress.Commands.add('getNewPriod', () => {
  return cy.wait('@newPriod')
  .then((response) => {
    expect(response.response.body.data).not.to.be.empty
    return cy.getPriodData(response.response.body.data, 0);
  });
});

Cypress.Commands.add('randomBetClick', (maxBetCount = 0) => {
  cy.get('.play-tree__block__list').find('.bet-item').filter('div')
  .then(($el) => {
    if (maxBetCount == 0) {
      maxBetCount = Cypress._.random(3, 10);
    }
    const randomRange = Cypress._.sampleSize(Cypress._.range($el.length), maxBetCount);
    randomRange.forEach((i) => {
      cy.wrap($el.eq(i)).click();
    })
  });
  cy.get('.q-if-inner > .col').type(`{backspace}{backspace}${Cypress._.random(1,3)}`);
});

Cypress.Commands.add('waitOpen', () => {
  cy.get('.lottery-footer__fongpan').should('not.exist');
  cy.get('.colmun > :nth-child(2) > span').then((response) => {
    const timeout = Cypress.moment.duration(response.text(), "mm:ss").get('ms');
    if (timeout < 20000) {
      cy.log('timeout', timeout);
      cy.wait(timeout);
    }
    cy.get('.colmun > :nth-child(3) > span').then((response) => {
      if (/00:0\d{1}|已封盘/.test(response.text())){
        cy.wait(timeout);
      }
    });
  });
  // const endTime = Cypress.$('.colmun > :nth-child(3) > span').text();
  // const isClose = Cypress.$('.lottery-footer__fongpan').text();
  // const closeTime = Cypress.$('.colmun > :nth-child(2) > span').text();
  // if (/00:0\d{1}|已封盘/.test(closeTime) || isClose != '') {
  // }
});

Cypress.Commands.add('checkAboutInfo', () => {
  // cy.wait('@about').then((response) => {
  cy.getApi('@about').then((response) => {
    const data = Cypress._.get(response, 'data.0');
    cy.get('.cms-content').should('be.visible').invoke('html').should('includes', data.content);
    // cy.get('.q-toolbar-title').should('contain', data.title);
  });
});

Cypress.Commands.add('getApi', (name) => {
  return cy.wait(name).then((response) => {
    return Cypress._.get(response, 'response.body');
  });
});


Cypress.Commands.add('betOrder', () => {
  cy.get('.btn-bet > .q-btn-inner > div')
  .should('contain', '下注')
  .click();
  cy.wait(500);
  cy.get('.modal-bet > .modal-content').contains('确定').click();
  cy.wait(['@betOrder']);
  cy.get('@betOrder').then((response) => {
    const orderId = Cypress._.get(response.response.body, 'data.orderId', false);
    assert.isString(orderId, 'value is string')
  });
});

Cypress.Commands.add('randomBet', (kindsLabel, maxBet = 0) => {
  cy.route('POST', '/forseti/api/orders/betOrder').as('betOrder');
  cy.contains(kindsLabel).click();
  cy.wait(1000)
  cy.waitOpen();
  if (kindsLabel === '连码') {
    return;
  }
  cy.randomBetClick(maxBet);
  cy.betOrder();
});
