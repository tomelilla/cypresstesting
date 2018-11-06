
import {
    confirmAPI, lotteryConst,
  } from '../support/utility.js'

Cypress.Commands.add('LoginFirstPop', () => {
  cy.get('.modal--free > .modal-content').should('be.visible')
  .get('.modal--free > .modal-content > .modal__header > .q-btn > .q-btn-inner > .q-icon').click().end()
})


Cypress.Commands.add('demoLogin', () => {
    cy.request({ //demologin api
        method: 'POST',
        url: '/uaa/apid/member/testLogin',
        headers: {
          Authorization: 'Basic d2ViX2FwcDo=',
          Host: 'api.baochi888.com',
          Origin: 'http://blc.baochi888.com',
          Referer: 'http://blc.baochi888.com',
        },
        form: true,
      }).then((res) => {
        cy.writeFile('cypress/fixtures/users.json', { access_token : `bearer ${res.body.data.access_token}`})
        expect(res.status).to.eq(200);
        expect(res.body.err).to.eq("SUCCESS"); //遊客登入成功
      })
  })

Cypress.Commands.add('visitPage', (obj) => {
    cy.visit(Cypress.env("target"), obj);
})

Cypress.Commands.add('userLogin', () => {
    const userToken = {
        access_token: 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE1MzcxOTM1NjUsInVzZXJfbmFtZSI6ImJsY3xkZHRlc3QwMSIsImF1dGhvcml0aWVzIjpbIlJPTEVfVVNFUiJdLCJqdGkiOiJmMTEwMzc5MC02Y2M5LTRmNmEtODliZC1lNGNlYjE4NGYwNGIiLCJjbGllbnRfaWQiOiJ3ZWJfYXBwIiwic2NvcGUiOlsib3BlbmlkIl19.cR38pUTGvig5mMxHhcMD4NNypiPFCSC6_cUtYNcZq_eUmGxJW_FSSBjzsZ1Wmc9vW38XBJA3uUtq6wpSnwGJkW6oUjhJ-fuCH5pZaMjHu2YvMxM8kZiap84mr5z-6t9bUYkxmt0P8rhoooy5t_3UbQxDAPO8VIxtEEl7aLYLxwbaUsbMhmKm6KmgoZnN8Y4__fC9selllLlooEWM5aXCo0DQQKIHssY_BToTrqTeugJNDDOpMFJHnf3wghLEHJSamEfcOPxZlqyhdbwwxjCokGSBxdKWFQTBPG50qe_qhch6dcQ20bGFflWzx7-07D5i-PF3DRwVdHU3bjl_4xSKOA',
        acType: '1',
        username: 'Mandy',
      };
      Cypress._.keys(userToken).forEach((key) => {
        cy.setCookie(key, userToken[key]);
      })

      Cypress.Cookies.preserveOnce("username", "access_token", "acType");
});

Cypress.Commands.add('demoLogintoLottery', (lotteryId, lotteryPage) => {
  cy.server();
  cy.route('POST','/member/v1/login/test').as('demoLogin');
  cy.visitPage();
  cy.get('.login-bar')
  .should('contain', '登录')
  .should('contain', '注册')
  .should('contain', '试玩')
  //驗證試玩登入
  cy.get('.btn-demoplay > .q-btn-inner').click();
  cy.wait('@demoLogin')
    .then((response) => {
      const {apistatus, result} = response.response.body;
      expect(apistatus).to.eq(1);
      assert.isObject(result);
      // cy.get('.user-name > .q-btn > .q-btn-inner > div')
      // .should('be.visible').and('contain', result.username);
      cy.lotteryPageRoute();
      cy.visit(`pc${lotteryPage.url}`);
      cy.getCookie('lotteryId').should('have.property','value', lotteryId.toString());
    })
})
Cypress.Commands.add('index_demoLogin', ()=>{
  // 在首页登入后停留在原本的首页
  // 註 有時候 Cypress 會 整塊 Header 消失抓不到，重跑即可
  if (!Cypress.$('.login-bar-loged').length) {
    cy.get(' div.login-bar-wrap > div:nth-child(4)>button:nth-child(3)').click()
      .wait(500); //點擊遊客登入
      if (Cypress.$('lobby-post.flex-center:visible').length !== 0) {
        cy.get('div.modal--lobbypop div.modal__header button').click();
      }
  }

})


Cypress.Commands.add('memberPage', (pageUrl) => {
  cy.server();
  cy.route('GET','/member/v1/code').as('code');
  cy.route('POST','/member/v1/login').as('userLogin');
  cy.visitPage();
  cy.wait('@code').then((response) => {
    const code = confirmAPI(response);
    const body = {
      "apiKey":"d4bcc79d9888957",
      "base64Image":`data:image/png;base64,${code.code}`,
    }
    cy.request({
      method: 'POST',
      url: 'https://api.ocr.space/parse/image',
      form: true,
      body,
    }).then((res) => {
      const codeText= res.body.ParsedResults[0].ParsedText.replace(/[a-zA-Z]|[\s]/g, '');
      cy.get('.q-list > :nth-child(1) > .q-field > :nth-child(1) > .q-field-content > .q-if > .q-if-inner > .col').type(Cypress.env("loginAccount"));
      cy.get('.q-list > :nth-child(2) > .q-field > :nth-child(1) > .q-field-content > .q-if > .q-if-inner > .col').type(Cypress.env("loginPW"));
      cy.get('.q-list > :nth-child(3) > .q-field > :nth-child(1) > .q-field-content > .q-if > .q-if-inner > .col').type(codeText? codeText: 1111);
      cy.get(':nth-child(4) > .btn-primary').click().end()
    })
    cy.wait('@userLogin').then((response)=>{
      const {apistatus, result} = response.response.body;
      if( apistatus === 1){
        expect(apistatus).to.eq(1);
        assert.isObject(result);
        cy.visit(`pc${pageUrl}`);
      } else {
        cy.wait(500).get('.modal-content')
          .contains('.modal__footer','关闭' )
          .find('.q-btn')
          .click().end();
      }
    })
  })

})

Cypress.Commands.add('userLogintoLottery', (lotteryId, lotteryPage) => {
  cy.server();
  cy.route('GET','/member/v1/code').as('code');
  cy.route('POST','/member/v1/login').as('userLogin');
  cy.visitPage();
  cy.wait('@code').then((response) => {
    const code = confirmAPI(response);
    const body = {
      "apiKey":"d4bcc79d9888957",
      "base64Image":`data:image/png;base64,${code.code}`,
    }
    cy.request({
      method: 'POST',
      url: 'https://api.ocr.space/parse/image',
      form: true,
      body,
    }).then((res) => {
      const codeText= res.body.ParsedResults[0].ParsedText.replace(/[a-zA-Z]|[\s]/g, '');
      cy.get('.q-list > :nth-child(1) > .q-field > :nth-child(1) > .q-field-content > .q-if > .q-if-inner > .col').type(Cypress.env("loginAccount"));
      cy.get('.q-list > :nth-child(2) > .q-field > :nth-child(1) > .q-field-content > .q-if > .q-if-inner > .col').type(Cypress.env("loginPW"));
      cy.get('.q-list > :nth-child(3) > .q-field > :nth-child(1) > .q-field-content > .q-if > .q-if-inner > .col').type(codeText? codeText: 1111);
      cy.get(':nth-child(4) > .btn-primary').click().end()
    })
  })
})

Cypress.Commands.add('lotteryPageRoute', () => {
  cy.server();
  cy.route('GET','/lottery/v1/recent/prize?lotteryId=*').as('lotteryHeader');
  cy.route('GET','/lottery/v1/past/prize?lotteryId=*').as('lotteryAwardHistory');
  cy.route('GET','/lottery/v1/loadBead?lotteryId=*').as('lotteryLoadBead');
  cy.route('GET','/lottery/v1/doubleLong?lotteryId=*').as('doubleLong');
  cy.route('GET','/config/v1/playsTree?lotteryId=*').as('playTree');
})

Cypress.Commands.add('lotteryHeaderFunc', (lotteryHeader) => {
  cy.get('.lottery-title__name').contains(lotteryHeader.lotteryName);
  cy.get('.lottery-award-history > .text-strong > .text-important').contains(lotteryHeader.pre.issueAlias);
  cy.get('.lottery-award-history > .col-12').contains(lotteryHeader.pre.winNumber.split(',')[0]);
  cy.get('.double-row').contains(lotteryHeader.pre.doubleData[0]);

  const nowIssueAlias = (lotteryHeader.now.endTime < Date.now()) ? lotteryHeader.next.issueAlias : lotteryHeader.now.issueAlias
  cy.get('.lottery-countdown > .text-strong > .text-important').contains(nowIssueAlias);
  if(lotteryConst.blockChainList.includes(lotteryHeader.lotteryId)) {
    cy.get('.pastview-blockchain').contains(lotteryHeader.pre.block);
  }
})

Cypress.Commands.add('lotteryLoadBeadFunc', (lotteryLoadBead, doubleLong) => {
  let loadLength = Object.keys(lotteryLoadBead).length;
  if(!Cypress._.isEmpty(doubleLong.open) || !Cypress._.isEmpty(doubleLong.unOpen)){
    loadLength = loadLength+1
  }
  const randomNum = Cypress._.random(1,loadLength-1);
  cy.get('.road-tabs > .swiper-container > .swiper-wrapper > div').its('length').should('eq', loadLength);
  // 超過1個tab 的時候再點選
  if( loadLength !== 1){
    cy.get(`.road-tabs > .swiper-container > .swiper-wrapper > :nth-child(${randomNum})`).click({waitForAnimations: false})
  }
  cy.get('.road-content').should('not.be.empty');
})

Cypress.Commands.add('lotteryAwardHistoryFunc', (lotteryAwardHistory, lotteryId) => {
  cy.get('.site-panel__header-title').should('be.visible')//往期开奖
  const randomNum = Cypress._.random(0,lotteryAwardHistory.list.length-1);
  cy.get('.last-award > tbody').contains(lotteryAwardHistory.list[randomNum].issueAlias);
  cy.get('.last-award > tbody').contains(lotteryAwardHistory.list[randomNum].winNumber.split(',')[0]);
  //更多
  cy.get('.site-panel__header-btn > .q-btn > .q-btn-inner').should('be.visible').click()
    .moreLotteryHistory(lotteryId);
})

Cypress.Commands.add('moreLotteryHistory', (lotteryId) => {
  cy.url().should('include',`/pc/history?lotteryId=${lotteryId}`)
  cy.go(-1);
})

Cypress.Commands.add('showLotteryInfo', (lotteryName) => {
  cy.get('.lottery-button-area > :nth-child(2) > .q-btn-inner').click()
  cy.get('.modal-content')
    .contains('.modal__header',lotteryName )
    .find('.q-btn > .q-btn-inner > .q-icon')
    .click().end();
})

Cypress.Commands.add('confirmTabList', (tabList) => {
  tabList.forEach((label,index) => {
    cy.get(`.bet-tags-wrap > .swiper-container > .swiper-wrapper > :nth-child(${index+1})`)
    .contains(label)
  });
})

Cypress.Commands.add('clickTab', (min,max) => {
  cy.get(`.bet-tags-wrap > .swiper-container > .swiper-wrapper > :nth-child(${Cypress._.random(min,max)})`)
        .click()
})

Cypress.Commands.add('lianBet', (lianBet) => {
  lotteryConst[lianBet].forEach((label, index) => {
    cy.get(`.bet-play-tab > .q-btn-group > :nth-child(${index+1})`).contains(label);
  })
  const randomAnyBet = Cypress._.random(1,lotteryConst[lianBet].length)
  cy.get(`.bet-play-tab > .q-btn-group > :nth-child(${randomAnyBet})`).click();
  if(randomAnyBet === 2){
    //选二连直，前码后码各要选一
    const random1 = Cypress._.random(1,20);
    cy.get(`:nth-child(1) > .bet-item-wrap > :nth-child(${random1}) > .bet-item__text`).click();
    const random2 = Cypress._.random(1,20);
    cy.get(`:nth-child(1) > .bet-item-wrap > :nth-child(${random2}) > .bet-item__text`).click();
  } else {
    //除了选二连组要选两个，其他的选三个
    const itemlength= Cypress.$('.bet-item__text').length;
    const selectNum = (randomAnyBet === 1) ? 2 : 3 ;
    const selectArray = Array.from({length: selectNum}, () => Cypress._.random(1, itemlength));
    selectArray.forEach((label, index) => {
      cy.get(`.bet-item-wrap > :nth-child(${label})`).click()
    })
  }

  cy.betOrderInput();

})

Cypress.Commands.add('anyBet', (anyBet) => {
  lotteryConst[anyBet].forEach((label, index) => {
    cy.get(`.bet-play-tab > .q-btn-group > :nth-child(${index+1})`).contains(label);
  })
  const randomAnyBet = Cypress._.random(1,lotteryConst[anyBet].length)
  cy.get(`.bet-play-tab > .q-btn-group > :nth-child(${randomAnyBet})`).click();

  if(anyBet === 'ballBet5'){
    cy.betOrder();
    return;
  }
  const itemlength= Cypress.$('.bet-item__text').length;
  if (randomAnyBet > 8) itemlength = 3;
  const selectArray = Array.from({length: randomAnyBet}, () => Cypress._.random(1,itemlength));
  selectArray.forEach((label, index) => {
    cy.get(`.bet-item-wrap > :nth-child(${label})`).click()
  })
  cy.betOrderInput();
})

Cypress.Commands.add('betOrder', () => {
  cy.get('.bet-item__text').each(($el) => {
    if (Cypress._.random(0,4) === 1) {
      cy.wrap($el).click();
    }
  })
  cy.betOrderInput();
})

Cypress.Commands.add('betOrderInput', () => {
  cy.server();
  cy.route('POST','/apid/orders/betOrder').as('betOrder');
  cy.route('GET','/order/v1/lottery/bet/list?lotteryId=*').as('lotteryList');

  // 再驗證是否已封盤
  cy.isNeedtoBet()
    .fixture('betOrder').then((json)=>{
      if(!json.couldBet){
        cy.get('.noTouch').should('be.visible');
        return;
      }
    });

  cy.get('.q-if-inner > .col').type(Cypress._.random(0,5));
  cy.get('.btn-bet > .q-btn-inner').contains('下注').click()
    .wait(500)
    .get('.modal-content > :nth-child(1) > .modal__footer > .btn-primary > .q-btn-inner > div').contains('确定').click({force: true})
  cy.wait('@betOrder').then((response) => {
    const {msg, data} = response.response.body;
    assert.isNotNull(msg, 'is not null');
    if(data && !Cypress._.isEmpty(data.orderId)){
      cy.wait('@lotteryList').then((res) => {
        const lotteryList = confirmAPI(res);
        const nameList = lotteryList.list.map((x) => x.playName);
        cy.get('.lottery-bet-history > .site-panel > .site-panel__header').contains('投注记录')//投注记录
        nameList.forEach((label,index) => {
          cy.get(`:nth-child(${index+1}) > .col-9 > .site-panel__record-play`).contains(label);
        })
      cy.get('.modal-content')
        .contains('.modal__header','成功' )
        .find('.q-btn > .q-btn-inner > .q-icon')
        .click({ force:true } ).end();
        })
    } else {
      cy.get('.modal-content')
      .contains('.modal__header','投注错误' )
      .find('.q-btn > .q-btn-inner > .q-icon')
      .click().end();
    }
  }).end();
})

Cypress.Commands.add('isNeedtoBet', (prizeCloseTime) => {
  const nowTime =Date.now();
  let waitTime = 0;
  if(nowTime - prizeCloseTime < 10000) {
    waitTime = nowTime - prizeCloseTime;
  }
  cy.wait(waitTime);
  cy.get('body').then(($body) => {
    let allowBet = true;
    if($body.text().includes('未开盘')){
      allowBet = false;
    } else if($body.text().includes('已封盘')){
      allowBet = false;
    }
    cy.writeFile('cypress/fixtures/betOrder.json', { couldBet: allowBet})
  })
})
