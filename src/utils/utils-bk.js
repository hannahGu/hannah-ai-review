import { get } from './utilityOperationHelper';
import { PAGE } from '../constants/index';
/**
 *转换金额-千分位格式
 *
 * @param {*} val
 *
 */
// export const priceFormat = val => typeof val === 'number' && val === val;
export const priceFormat = (val) => (val || 0).toString().replace(/(\d)(?=(?:\d{3})+$)/g, '$1,');

/**
 *转换金额-千分位格式
 *
 * @param {*} val
 *
 */
// 带小数点
export const priceFormatWithDecimal = (val) => {
  if (!val && val !== 0) {
    return '';
  }
  const [int, floor] = val.toString().split('.');
  return floor && floor * 1 ? `${priceFormat(int)}.${floor}` : priceFormat(int);
};

/**
 * 判断是否为空
 *
 * @param {*} val
 */
export const isEmpty = (val) => val == null || !(Object.keys(val) || val).length;
/**
 * 回到顶部
 *
 */
export const scrollToTop = () => {
  const c = document.documentElement.scrollTop || document.body.scrollTop;
  if (c > 0) {
    window.requestAnimationFrame(scrollToTop);
    window.scrollTo(0, c - c / 8);
  }
};

export const openLiveChatWindow = () => {
  // const src =
  //   'https://v1.live800.com/live800/chatClient/chatbox.jsp?companyID=1282485&configID=47820&jid=1964805098&s=1'
  // window.location.href = src;
};

// 控制展开和收起智齿客服聊天页面
export function openLiveChat() {
  const miniProgram = sessionStorage.getItem('miniProgram');

  if (miniProgram) {
    // 小程序使用live800
    openLiveChatWindow();
  } else if (window.getzhiSDKInstance) {
    const zhiManager = window.getzhiSDKInstance();
    zhiManager.expand();
  }
}

// 计算百分比 t吊牌价，s销售价
export function percent(listPrice, salePrice) {
  const t = parseInt(listPrice);
  const s = parseInt(salePrice);
  return t > s ? `${-Math.round(((t - s) / t) * 100)}%` : 0;
}

// 图片资源cdn
export function imgUrlReplace(url, _w, _h) {
  return `${url}?x-oss-process=image/resize,m_fixed,h_${_w},w_${_h}`;
}

export function lowImg(url) {
  return `${url}?x-oss-process=image/quality,q_60`;
}
export function trackEvent() {
  // third track api
  // _satellite && _satellite.track(type, params);
}

// 面包屑导航数据
export function getBreadcrumbInfoData(data, arr) {
  if (typeof data === 'object') {
    for (const i in data) {
      if (data[i]) {
        arr.push({
          name: data[i].categoryName,
          code: data[i].categoryCode,
        });

        if (data[i].sub) {
          getBreadcrumbInfoData(
            {
              sub: data[i].sub,
            },
            arr
          );
        }
      }
    }
  }
  return arr;
}

const REG = /(http|https):\/\/[\w\-_]+(\.[\w\-_]+)+([\w\-.,@?^=%&amp;:/~+#]*[\w\-@?^=%&amp;/~+#])?/;

// menu url地址匹配
export function getMenuUrl(item) {
  if (!item) return null;
  if (item.url && REG.test(item.url)) {
    return `/subpkgs/base/pages/link/index?url=${item.url}`;
  }
  if (item.url && item.urlType === 'PRODUCT_CATEGORY') {
    return `/pages/plp/index?subclassification=${item.url}`;
  }
  if (item.url && item.urlType === 'ACTIVITY') {
    const matchList = item.url.match(/([^/]+\.html)/g);
    return `/subpkgs/page/pages/index?scene=${matchList[0]}`;
  }
  return item.url;
}

// 顶部通知栏的url地址匹配
export function tipsUrl(url) {
  if (!url) return '';
  // 带有域名的直接嵌套web-view，否则直接链接到小程序
  if (REG.test(url)) {
    return `/subpkgs/base/pages/link/index?url=${url}`;
  }
  return url;
}
// 获取spuCode 后面三位数
export function spuCodeLastThree(spuCode) {
  if (!spuCode) return '';
  return spuCode.substr(-3);
}

// 判断尺寸是否是onesize 或者 uni
export function checkIsOnesizeOrUni(sizeLists) {
  if (!sizeLists) return false;
  const REG = /\s+/g;
  return (sizeLists || []).some((size) => size.value.replace(REG, '').toLocaleLowerCase() === 'uni' || size.value.replace(REG, '').toLocaleLowerCase() === 'onesize');
}

// 判断连接是图片类型还是视频类型
export function isImageUrl(url) {
  // 后缀获取
  let suffix = '';
  // 获取类型结果
  let result = '';
  const fileArr = url.split('.');
  suffix = fileArr[fileArr.length - 1];
  if (suffix !== '') {
    suffix = suffix.toLocaleLowerCase();
    // 图片格式
    const imglist = ['png', 'jpg', 'jpeg', 'bmp', 'gif', 'jfif'];
    // 进行图片匹配
    result = imglist.find((item) => item === suffix);
    return result ? 'image' : 'video';
  }
  return '';
}

export function heightScale(height) {
  const { windowHeight } = uni.getSystemInfoSync();
  return height * (windowHeight / 812);
}
export function widthScale(width) {
  const { windowWidth } = uni.getSystemInfoSync();
  return width * (windowWidth / 375);
}
// 限制title长度，超出省略号(默认15)
export function titleLimit(title, limit = 15) {
  if (title.length > limit) {
    return `${title.substring(0, limit)}...`;
  }
  return title;
}
// 提取html内容
export function extractHtml(html) {
  const str = html.replace(/<[^<>]+>/g, '');
  return str;
}

export const checkUpdate = () => {
  if (!uni.canIUse('getUpdateManager')) {
    return;
  }
  const updateManager = uni.getUpdateManager();
  updateManager.onCheckForUpdate((res) => {
    console.log(res);
  });
  updateManager.onUpdateReady((res) => {
    uni.showModal({
      title: '提示更新',
      content: '新版本已经准备好，是否重启应用？',
      success: (res) => {
        if (res.confirm) {
          updateManager.applyUpdate();
        }
      },
    });
  });

  updateManager.onUpdateFailed(() => {
    uni.showModal({
      title: '已经有新版本',
      content: '请您删除当前小程序，到微信 “发现-小程序” 页，重新搜索打开',
      showCancel: false,
    });
  });
};

/*** method **
 *  add / subtract / multiply /divide
 * floatObj.add(0.1, 0.2) >> 0.3
 * floatObj.multiply(19.9, 100) >> 1990
 *
 */
export const floatObj = (function () {
  /*
   * 判断obj是否为一个整数
   */
  function isInteger(obj) {
    return Math.floor(obj) === obj;
  }

  /*
   * 将一个浮点数转成整数，返回整数和倍数。如 3.14 >> 314，倍数是 100
   * @param floatNum {number} 小数
   * @return {object}
   *   {times:100, num: 314}
   */
  function toInteger(floatNum) {
    var ret = { times: 1, num: 0 };
    if (isInteger(floatNum)) {
      ret.num = floatNum;
      return ret;
    }
    var strfi = floatNum + '';
    var dotPos = strfi.indexOf('.');
    var len = strfi.substr(dotPos + 1).length;
    var times = Math.pow(10, len);
    var intNum = Number(floatNum.toString().replace('.', ''));
    ret.times = times;
    ret.num = intNum;
    return ret;
  }

  /*
   * 核心方法，实现加减乘除运算，确保不丢失精度
   * 思路：把小数放大为整数（乘），进行算术运算，再缩小为小数（除）
   *
   * @param a {number} 运算数1
   * @param b {number} 运算数2
   * @param digits {number} 精度，保留的小数点数，比如 2, 即保留为两位小数
   * @param op {string} 运算类型，有加减乘除（add/subtract/multiply/divide）
   *
   */
  function operation(a, b, digits, op) {
    var o1 = toInteger(a);
    var o2 = toInteger(b);
    var n1 = o1.num;
    var n2 = o2.num;
    var t1 = o1.times;
    var t2 = o2.times;
    var max = t1 > t2 ? t1 : t2;
    var result = null;
    switch (op) {
      case 'add':
        if (t1 === t2) {
          // 两个小数位数相同
          result = n1 + n2;
        } else if (t1 > t2) {
          // o1 小数位 大于 o2
          result = n1 + n2 * (t1 / t2);
        } else {
          // o1 小数位 小于 o2
          result = n1 * (t2 / t1) + n2;
        }
        return result / max;
      case 'subtract':
        if (t1 === t2) {
          result = n1 - n2;
        } else if (t1 > t2) {
          result = n1 - n2 * (t1 / t2);
        } else {
          result = n1 * (t2 / t1) - n2;
        }
        return result / max;
      case 'multiply':
        result = (n1 * n2) / (t1 * t2);
        return result;
      case 'divide':
        result = (n1 / n2) * (t2 / t1);
        return result;
    }
  }

  // 加减乘除的四个接口
  function add(a, b, digits) {
    return operation(a, b, digits, 'add');
  }
  function subtract(a, b, digits) {
    return operation(a, b, digits, 'subtract');
  }
  function multiply(a, b, digits) {
    return operation(a, b, digits, 'multiply');
  }
  function divide(a, b, digits) {
    return operation(a, b, digits, 'divide');
  }

  // exports
  return {
    add: add,
    subtract: subtract,
    multiply: multiply,
    divide: divide,
  };
})();
/* eslint-disable no-bitwise */
export const uuid = () => {
  const str = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx';

  return str.replace(/[xy]/g, (item) => {
    const r = (Math.random() * 0x10) | 0;
    const v = item === 'x' ? r : (r && 0x3) || 0x8;

    return v.toString(0x10);
  });
};

export const mergeShoppingListFn = (...argList) => {
  const concatList = [].concat.apply([], argList);
  const groups = [].concat.apply([], argList).reduce((acc, pre) => {
    if (!acc[pre.skuId]) acc[pre.skuId] = 0;
    acc[pre.skuId] += pre.quantity;
    acc[pre.skuId] = acc[pre.skuId] > 8 ? 8 : acc[pre.skuId];
    return acc;
  }, {});

  const list = Object.keys(groups).map((cur) => ({ skuId: cur, quantity: groups[cur] }));

  return list;
};
//价格处理成千分位
export const numberWithCommas = (x) => {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

export function getUrlParams(url) {
  // 通过 ? 分割获取后面的参数字符串
  let urlStr = url?.split('?')?.[1]
    // 创建空对象存储参数
  let obj = {};
    // 再通过 & 将每一个参数单独分割出来
  let paramsArr = urlStr.split('&')
  for(let i = 0,len = paramsArr.length;i < len;i++){
        // 再通过 = 将每一个参数分割为 key:value 的形式
    let arr = paramsArr?.[i]?.split('=')
    obj[arr[0]] = arr[1];
  }
  return obj
}

export const parseUrl = (url) => {
  const [path, queryString] = url
    .split('?');                          // 分割路径和查询参数

  // 规范化路径格式
  const formattedPath = `/${path.replace(/^\/+|\/+$/g, '')}`;

  // 解析查询参数
  const params = {};
  if (queryString) {
    queryString.split('&').forEach(pair => {
      const [keyEncoded, valueEncoded] = pair.split('=');
      if (!keyEncoded) return;
      
      const key = decodeURIComponent(keyEncoded);
      const value = valueEncoded !== undefined 
        ? decodeURIComponent(valueEncoded) 
        : '';
      
      params[key] = value;
    });
  }

  return { path: formattedPath, params };
}