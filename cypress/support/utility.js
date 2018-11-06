
let myConfig = Cypress.config();

export const visitBlc = () => {
  cy.viewport('iphone-6');
  cy.visit(myConfig.baseUrl);
}
/** 投注betorderapi
 * @param {JSON} body
 * @param {string} lotteryPage
*/
export const betOrderAPI = (body, lotteryPage) => {
  cy.fixture('users').as('access_token').then((users)=>{
    cy.request({ //demologin api
      method: 'POST',
      url: myConfig.host + '/forseti/api/orders/betOrder',
      headers: {
        Authorization: users.access_token,
        Host: myConfig.host,
        Origin: myConfig.baseUrl,
        Referer: myConfig.baseUrl + lotteryPage,
      },
      body,
    }).then((res) => {
      expect(res.status).to.eq(200);
      expect(res.body.err).to.eq("SUCCESS"); //遊客登入成功
      assert.isString(res.body.data.orderId, 'value is string')
    })
  })
}

export const inputBet = () => {
  cy.get('.q-if-inner > .col').focus().type(Cypress._.random(1,5)).blur();
  // cy.get('.btn-bet').click()
  //     .get('.modal-bet > .modal-content').should('be.visible') //彈跳確認視窗

  // cy.get('.dialog-footer > .q-btn-outline > .q-btn-inner').contains('取消')
  //     .click()
  //     .get('.modal-bet > .modal-content').should('not.be.visible') //彈跳視窗關閉

  cy.get('.btn-bet').click()
      .get('.modal-bet > .modal-content').should('be.visible') //彈跳確認視窗

  cy.get('.dialog-footer > .bg-primary > .q-btn-inner').contains('确定')
      .click()
      .wait(500)
      .get('.modal-auto__body__content').contains('您已经成功支付')
      .should('be.visible');
}
/**
 * @name 試玩登入UI
 */
export const demoLogin = () => {
  cy.get(':nth-child(3) > .q-btn-inner > div').click()
    .wait(500)    //點擊遊客登入
    .get('.modal-auto__body__content').contains('登录成功')
    .should('be.visible')
}

/**
 * @name 試玩登出UI
 */
export const demoLogout = () => {
  cy.get('.q-toolbar > .q-btn > .q-btn-inner > .q-icon').click()
    .get('.index-left > .q-layout-drawer').should('be.visible') // 側邊欄出現
  cy.get('.lobby-left-drawer__btn-group > .q-btn > .q-btn-inner').click()
    .get('.header__btn-group').contains('试玩').should('be.visible') //登出
}
/**
 * @name 彩種連結function
 * @@param {int} lotteryID
 */
export const openLotteryPage = (lotteryID) => {
  return lotteryConst.lotteryHerf
      .find(item => item.id === lotteryID);
}

/**
 * @name 彩種回傳
 */
export const confirmAPI = (response) => {
  const {apistatus, result} = response.response.body;
  expect(apistatus).to.eq(1);
  assert.isObject(result);
  return result;
}

/**
 * @name 转换时间戳为日期
 */
export const time2Date = (timestamp, pattern = 'YYYY/MM/DD HH:mm:ss') => {
  return Cypress.moment(parseInt(timestamp, 10)).format(pattern);
}

// 金额转换,分转成元
export const roundAmt= (v) => {
  return (v / 100).toFixed(2);
}
/**
 * @name 彩種名稱及連結
 */
export const lotteryConst = {
  issueAliasLotteryIds: [8, 24, 26, 28, 32, 30, 34, 36, 38, 42, 44, 48, 50, 52],
  appendZeroLotteryList: [34, 42, 44, 10, 110],
  isolatedWinNumberLotteryIds: [10, 110, 30],
    // 使用日期时间作为奖期
  datetimeLotteryIds: [116, 118],
  /**
   * @name 區塊鏈彩
   */
  blockChainList : [48, 50, 52],
  anyBet5: ['任选一', '任选二', '任选三', '任选四', '任选五'],
  anyBet4: ['任选一', '任选二', '任选三', '任选四'],
  ballBet5: ['第一球', '第二球', '第三球', '第四球', '第五球'],
  lianBet4: ['选二连组', '选二连直', '选三前组', '选三连组'],
  lianBet10: ['一中一', '二中二', '三中三', '四中四', '五中五', '六中五', '七中五', '八中五', '前二组选', '前三组选'],
  maxLianBet10: [1, 2, 3, 4, 5, 6, 7, 8, 5, 5],
  lotteryHerf: [
    { id: 2, name: '重庆时时彩', url: '/lottery/ssc/cqssc', tabList:['两面', '1-5球', '前中后']},
    { id: 4, name: '江西11选5', url: '/lottery/11x5/jc11x5', tabList:['两面', '1-5球', '连码'] },
    { id: 6, name: '江苏快3', url: '/lottery/k3/jsk3', tabList:['单骰', '不同号', '同号', '总和'] },
    { id: 8, name: '北京PK10', url: '/lottery/pk10/bjpk10', tabList:['两面', '冠亚和值', '1-5名', '6-10名']},
    { id: 10, name: '香港六合彩', url: '/lottery/lhc/xglhc',
      tabList:['特码', '平特肖尾', '两面', '色波', '正码', '正码1-6', '正特', '连码', '自选不中', '连肖', '连尾', '特码头尾', '总肖', '特肖', '合肖', '正肖', '特码五行'] },
    { id: 12, name: '天津时时彩', url: '/lottery/ssc/tjssc', tabList:['两面', '1-5球', '前中后'] },
    { id: 14, name: '新疆时时彩', url: '/lottery/ssc/xjssc', tabList:['两面', '1-5球', '前中后']  },
    { id: 16, name: '广东11选5', url: '/lottery/11x5/gd11x5', tabList:['两面', '1-5球', '连码'] },
    { id: 18, name: '山东11选5', url: '/lottery/11x5/sd11x5', tabList:['两面', '1-5球', '连码'] },
    { id: 20, name: '安徽快3', url: '/lottery/k3/ahk3', tabList:['单骰', '不同号', '同号', '总和'] },
    { id: 22, name: '湖北快3', url: '/lottery/k3/hbk3', tabList:['单骰', '不同号', '同号', '总和']},
    { id: 24, name: '幸运boat', url: '/lottery/pk10/xyft', tabList:['两面', '冠亚和值', '1-5名', '6-10名'] },
    { id: 26, name: '北京时时彩', url: '/lottery/ssc/bjssc', tabList:['两面', '1-5球', '前中后'] },
    { id: 28, name: '台湾5分彩', url: '/lottery/ssc/twssc', tabList:['两面', '1-5球', '前中后'] },
    { id: 30, name: '幸运28', url: '/lottery/xy28/xy28', tabList:['混合', '特码和值'] },
    { id: 32, name: 'QQ分分彩', url: '/lottery/ssc/qqssc', tabList:['两面', '1-5球', '前中后'] },
    { id: 34, name: '北京快乐8', url: '/lottery/kl8/bjkl8', tabList: ['趣味', '任选']},
    { id: 38, name: '广西快十', url: '/lottery/gs/gxk10', tabList: ['趣味', '任选', '1-5球']},
    { id: 40, name: '广东快十', url: '/lottery/gd/k10', tabList: ['趣味', '任选', '连码', '1-4球', '5-8球']},
    { id: 42, name: '台湾宾果', url: '/lottery/kl8/twbingo', tabList: ['趣味', '任选'] },
    { id: 44, name: '加拿大快乐8', url: '/lottery/kl8/cakl8', tabList: ['趣味', '任选']  },
    { id: 46, name: '幸运农场', url: '/lottery/gd/xyf', tabList: ['趣味', '任选', '连码', '1-4球', '5-8球']},
    { id: 48, name: '比特币彩', url: '/lottery/ssc/btc', tabList:['两面', '1-5球', '前中后'] },
    { id: 50, name: '以太坊彩', url: '/lottery/ssc/eth', tabList:['两面', '1-5球', '前中后'] },
    { id: 52, name: '莱特币彩', url: '/lottery/ssc/ltc', tabList:['两面', '1-5球', '前中后'] },
    { id: 102, name: '秒速时时彩', url: '/lottery/ssc/msssc', tabList:['两面', '1-5球', '前中后'] },
    { id: 104, name: '秒速11选5', url: '/lottery/11x5/ms11x5', tabList:['两面', '1-5球', '连码'] },
    { id: 106, name: '秒速快3', url: '/lottery/k3/msk3', tabList:['单骰', '不同号', '同号', '总和'] },
    { id: 108, name: '秒速赛车', url: '/lottery/pk10/mssscpk10', tabList:['两面', '冠亚和值', '1-5名', '6-10名'] },
    { id: 110, name: '五分六合彩', url: '/lottery/lhc/mslhc',
      tabList:['特码', '平特肖尾', '两面', '色波', '正码', '正码1-6', '正特', '连码', '自选不中', '连肖', '连尾', '特码头尾', '总肖', '特肖', '合肖', '正肖', '特码五行'] },
    { id: 112, name: '韩国棒子分彩', url: '/lottery/ssc/krssc', tabList:['两面', '1-5球', '前中后'] },
    { id: 114, name: '东京90分彩', url: '/lottery/ssc/tkssc', tabList:['两面', '1-5球', '前中后'] },
    { id: 116, name: '重庆秒秒彩', url: '/lottery/mmc/cqssc', tabList:['两面', '1-5球', '前中后'] },
    { id: 118, name: '赛车秒秒彩', url: '/lottery/mmpk10/mmpk10', tabList:['两面', '冠亚和值', '1-5名', '6-10名']  },
    { id: 120, name: '秒速3分彩', url: '/lottery/ssc/ms3mssc', tabList:['两面', '1-5球', '前中后'] },
    { id: 998, name: '众筹彩', url: '/crowdFunding/crowdFunding' },
  ],
}

/**
 * @name 传入彩种名称取ID
 */
// 传入彩种名称 & config/v1/lotterys 传回之所有彩种资料, 回传该彩种 ID
export const findLotteryID = (lotteryName, lotterysArray) => {
  let lotteryList = [];
  lotterysArray.forEach((group, groupIndex) => {
    group.lotterys.map((lottery) => {
      lottery.groupIndex = groupIndex;
      lotteryList.push(lottery);
    })
  });
  for( let i = 0; i < lotteryList.length ;i++) {
    if (lotteryName === lotteryList[i].name) {
      return lotteryList[i].id
      }
  }
}