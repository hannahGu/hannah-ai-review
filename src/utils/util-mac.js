import { coxCmsClient } from '@/lib/cox-cms-client';
import { sdClient } from '@/lib/sd-client';
import store from '@/stores/stores';
import { getUniId } from '@/utils/login';
import checkLogin from '@/utils/check-login';
import Constants from '@/utils/constants';
import wxCloudSendSubscriptions from '@/utils/wx-cloud-request-subscription';
import { setStorageSync } from 'remax/wechat';
import { setCurrentPageRoute } from './current-page-route';
import crmMobx from '@/stores/crm-info';

const compareVersion = function (v1, v2) {
  v1 = v1.split('.');
  v2 = v2.split('.');
  const len = Math.max(v1.length, v2.length);

  while (v1.length < len) {
    v1.push('0');
  }
  while (v2.length < len) {
    v2.push('0');
  }

  for (let i = 0; i < len; i++) {
    const num1 = parseInt(v1[i]);
    const num2 = parseInt(v2[i]);

    if (num1 > num2) {
      return 1;
    }
    if (num1 < num2) {
      return -1;
    }
  }

  return 0;
};

const accAdd = function (num1, num2) {
  num1 = Number(num1);
  num2 = Number(num2);
  let dec1;
  let dec2;
  let times;
  try {
    dec1 = countDecimals(num1) + 1;
  } catch (e) {
    dec1 = 0;
  }
  try {
    dec2 = countDecimals(num2) + 1;
  } catch (e) {
    dec2 = 0;
  }
  times = Math.pow(10, Math.max(dec1, dec2));
  // var result = (num1 * times + num2 * times) / times;
  const result = (accMul(num1, times) + accMul(num2, times)) / times;
  return getCorrectResult('add', num1, num2, result);
  // return result;
};
var accMul = function (num1, num2) {
  num1 = Number(num1);
  num2 = Number(num2);
  let times = 0;
  const s1 = num1.toString();
  const s2 = num2.toString();
  try {
    times += countDecimals(s1);
  } catch (e) {}
  try {
    times += countDecimals(s2);
  } catch (e) {}
  const result = (convertToInt(s1) * convertToInt(s2)) / Math.pow(10, times);
  return getCorrectResult('mul', num1, num2, result);
  // return result;
};

var countDecimals = function (num) {
  let len = 0;
  try {
    num = Number(num);
    let str = num.toString().toUpperCase();
    if (str.split('E').length === 2) {
      // scientific notation
      let isDecimal = false;
      if (str.split('.').length === 2) {
        str = str.split('.')[1];
        if (parseInt(str.split('E')[0]) !== 0) {
          isDecimal = true;
        }
      }
      const x = str.split('E');
      if (isDecimal) {
        len = x[0].length;
      }
      len -= parseInt(x[1]);
    } else if (str.split('.').length === 2) {
      // decimal
      if (parseInt(str.split('.')[1]) !== 0) {
        len = str.split('.')[1].length;
      }
    }
  } catch (e) {
    throw e;
  } finally {
    if (isNaN(len) || len < 0) {
      len = 0;
    }
    return len;
  }
};

var convertToInt = function (num) {
  num = Number(num);
  let newNum = num;
  const times = countDecimals(num);
  const temp_num = num.toString().toUpperCase();
  if (temp_num.split('E').length === 2) {
    newNum = Math.round(num * Math.pow(10, times));
  } else {
    newNum = Number(temp_num.replace('.', ''));
  }
  return newNum;
};

var getCorrectResult = function (type, num1, num2, result) {
  let temp_result = 0;
  switch (type) {
    case 'add':
      temp_result = num1 + num2;
      break;
    case 'sub':
      temp_result = num1 - num2;
      break;
    case 'div':
      temp_result = num1 / num2;
      break;
    case 'mul':
      temp_result = num1 * num2;
      break;
  }
  if (Math.abs(result - temp_result) > 1) {
    return temp_result;
  }
  return result;
};

function formatTime(date) {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const hour = date.getHours();
  const minute = date.getMinutes();
  const second = date.getSeconds();

  return `${[year, month, day].map(formatNumber).join('/')} ${[hour, minute, second].map(formatNumber).join(':')}`;
}

function formatNumber(n) {
  n = n.toString();
  return n[1] ? n : `0${n}`;
}

function getUrlDataByObject(obj) {
  let _key;
  let _str = '?';
  for (_key in obj) {
    _str += `${_key}=${obj[_key]}&`;
  }
  const _lastIndex = _str.lastIndexOf('&');
  _str = _str.substring(0, _lastIndex);
  return _str;
}

function getArrIndexByValue(arr, value) {
  let _index = -1;
  for (const i in arr) {
    if (arr[i] == value) _index = i;
  }
  return _index;
}

function turnArrObjToArrByKey(arr, key) {
  const _arr = [];
  for (const i in arr) {
    _arr.push(arr[i][key]);
  }
  return _arr;
}

function turnArrObjToObjByKey(arr, key) {
  const _obj = {};
  for (const i in arr) {
    const _key = arr[i][key];
    _obj[_key] = arr[i];
  }
  return _obj;
}

function ksort(inputArr, sort_flags) {
  const tmp_arr = {};
  const keys = [];
  let sorter;
  let i;
  let k;
  const that = this;
  let strictForIn = false;
  let populateArr = {};

  switch (sort_flags) {
    case 'SORT_STRING':
      // compare items as strings
      sorter = function (a, b) {
        return that.strnatcmp(a, b);
      };
      break;
    case 'SORT_LOCALE_STRING':
      // compare items as strings, original by the current locale (set with  i18n_loc_set_default() as of PHP6)
      var loc = this.i18n_loc_get_default();
      sorter = this.php_js.i18nLocales[loc].sorting;
      break;
    case 'SORT_NUMERIC':
      // compare items numerically
      sorter = function (a, b) {
        return a + 0 - (b + 0);
      };
      break;
    // case 'SORT_REGULAR': // compare items normally (don't change types)
    default:
      sorter = function (a, b) {
        const aFloat = parseFloat(a);
        const bFloat = parseFloat(b);
        const aNumeric = `${aFloat}` === a;
        const bNumeric = `${bFloat}` === b;
        if (aNumeric && bNumeric) {
          return aFloat > bFloat ? 1 : aFloat < bFloat ? -1 : 0;
        }
        if (aNumeric && !bNumeric) {
          return 1;
        }
        if (!aNumeric && bNumeric) {
          return -1;
        }
        return a > b ? 1 : a < b ? -1 : 0;
      };
      break;
  }

  // Make a list of key names
  for (k in inputArr) {
    if (inputArr.hasOwnProperty(k)) {
      keys.push(k);
    }
  }
  keys.sort(sorter);

  // BEGIN REDUNDANT
  this.php_js = this.php_js || {};
  this.php_js.ini = this.php_js.ini || {};
  // END REDUNDANT
  strictForIn = this.php_js.ini['phpjs.strictForIn'] && this.php_js.ini['phpjs.strictForIn'].local_value && this.php_js.ini['phpjs.strictForIn'].local_value !== 'off';
  populateArr = strictForIn ? inputArr : populateArr;

  // Rebuild array with sorted key names
  for (i = 0; i < keys.length; i++) {
    k = keys[i];
    tmp_arr[k] = inputArr[k];
    if (strictForIn) {
      delete inputArr[k];
    }
  }
  for (i in tmp_arr) {
    if (tmp_arr.hasOwnProperty(i)) {
      populateArr[i] = tmp_arr[i];
    }
  }

  return strictForIn || populateArr;
}
/**
 * iPhone X 以后机型
 * IPhone x later
 * */
function isiPhoneXLater(callback) {
  wx.getSystemInfo({
    success(res) {
      const { statusBarHeight } = res;
      if (statusBarHeight === 44) {
        callback(true);
      } else {
        callback(false);
      }
    },
  });
}
function getPagePath() {
  const _pages = getCurrentPages();
  const _page = _pages[_pages.length - 1];
  let _path = `/${_page.route}`;
  if (_page.options) {
    Object.keys(_page.options).forEach((k, i) => {
      if (i == 0) {
        _path += '?';
      } else {
        _path += '&';
      }
      _path += k;
      _path += '=';
      _path += _page.options[k];
    });
  }
  return _path;
}
// 通过skuid获取对应字段信息
//Get the corresponding field information through skuid
async function skuidTransformInfo(list) {
  // [
  //   {
  //     skuId: '',
  //     quantity: 1,
  //   }
  // ]
  const _skuIds = list.map((item) => {
    return item.skuId;
  });
  return new Promise((resolve, reject) => {
    coxCmsClient.product
      .getProductsBySkuId(_skuIds.join(','))
      .then((res) => {
        const productTempArr = res;
        let tempSkuArr = [];
        cartSkus: for (let i = 0, skuLength = list.length; i < skuLength; i++) {
          const cartSku = list[i];

          products: for (let j = 0, proDuctLength = productTempArr.length; j < proDuctLength; j++) {
            const product = productTempArr[j];

            productSkus: for (let k = 0, productSkuLength = product.skus.items.length; k < productSkuLength; k++) {
              const productSku = product.skus.items[k];
              if (cartSku.skuId === productSku.sku_id) {
                const tempObj = {
                  ...product,
                  productId: product.product_id,
                  id: productSku.sku_id,
                  display_name: product.display_name,
                  sku_image: product.sku_image,
                  quantity: cartSku.quantity || 1,
                  productId: product.product_id,
                  status: productSku.is_engravable, // 是否定制
                  price: productSku.prices?.[0].include_tax?.price || productSku.prices?.[0].exclude_tax?.price,
                  image: product.sku_image,
                  describe: productSku.shades && productSku.shades[0].name, // 色号
                  inventory_status: productSku.inventory_status, // 库存
                };
                tempObj.selected = productSku.inventory_status === 'Active';

                tempSkuArr.push(tempObj);
              }
            }
          }
        }
        resolve(tempSkuArr);
      })
      .catch((error) => {
        reject(error);
      });
  });
}

/**
 * 小程序资源位点击跳转事件
 * Applet resource bit click jump event
 */
const resourceClick = (item) => {
  return new Promise((resolve, reject) => {
    try {
      const url = item.mipLinkUrl;
      let jumpUrl = '';

      const pages = getCurrentPages();
      const currentPage = pages[pages.length - 1];
      const currentPageUrl = currentPage.route;
      if (currentPageUrl !== 'pages/gifting-customization/index') {
        setCurrentPageRoute();
      }
      switch (parseFloat(item.mipLinkType)) {
        case 1:
          if (!url) return;
          jumpUrl = `${url}`;
          // 跳转小程序内部页面
          //Jump to applet internal page
          // if (
          //   // url.indexOf('pages/index/index') > -1 &&
          //   url.indexOf('pages/calendarHomePage/index') > -1 &&
          //   url.indexOf('pages/allProducts/index') > -1 &&
          //   url.indexOf('pages/cart/cart') > -1 &&
          //   url.indexOf('pages/personalHomePage/personalHomePage') > -1
          // ) {
          //   wx.reLaunch({
          //     url
          //   })
          // } else {
          //   wx.navigateTo({
          //     url
          //   })
          // }
          if (jumpUrl.indexOf('upgrade-page/createNotes') > -1) {
            checkLogin({ url: jumpUrl });
          } else if (jumpUrl.indexOf('pages/login/login') > -1) {
            checkLogin({
              url: '',
              success: () => {
                wx.navigateTo({
                  url: `/pages/personal-edit/personal-edit`,
                });
              },
            });
          } else {
            wx.navigateTo({
              url: jumpUrl,
            });
          }
          break;
        case 2:
          // 跳转外部小程序
          //Jump to external applet
          wx.navigateToMiniProgram({
            appId: '', //要打开的小程序 appId
            path: '', //打开的页面路径，如果为空则打开首页
            extraData: {},
            envVersion: 'develop', //要打开的小程序版本。仅在当前小程序为开发版或体验版时此参数有效。如果当前小程序是正式版，则打开的小程序必定是正式版。
            success(res) {
              // 打开成功
            },
          });
          break;
        case 3:
          // 打开在线客服
          //Open online customer service
          jumpUrl = `/pages/custom-service/custom-service`;
          wx.navigateTo({
            url: jumpUrl,
          });
          break;
        case 4:
          // 打开图片
          //Open picture
          if (item.mipLinkUrl) {
            resolve(item.mipLinkUrl);
          } else {
            resolve(item.mipLinkFile);
          }
          break;
        case 5:
          // 公众号文章
          //Official account
          let encodeUrl = encodeURIComponent(url);
          jumpUrl = `/pages/web-view/web-view?url=${encodeUrl}`;
          wx.navigateTo({
            url: jumpUrl,
          });
          break;
        case 6:
          // 订阅 + 跳转
          const _mipLinkUrl = item.mipLinkUrl?.split('|');
          if (_mipLinkUrl && _mipLinkUrl[0] === 'subscribeJump') {
            wx.requestSubscribeMessage({
              tmplIds: _mipLinkUrl[1].split(','),
              success: (res) => {
                if (res.errMsg === 'requestSubscribeMessage:ok' && Object.values(res).includes('accept')) {
                  const _tmplIds = [];
                  wx.showToast({
                    title: '订阅成功',
                    icon: 'none',
                  });
                  for (const key in res) {
                    if (Object.prototype.hasOwnProperty.call(res, key) && res[key] === 'accept') {
                      _tmplIds.push(key);
                    }
                  }
                  if (_tmplIds.length) {
                    wxCloudSendSubscriptions(_tmplIds);
                  }
                }
              },
              complete: () => {
                if (_mipLinkUrl.length > 2) {
                  setTimeout(() => {
                    getApp().mtj.trackEvent('subscribe_to_jump', {
                      jump_url: _mipLinkUrl[2],
                    });
                    wx.navigateTo({
                      url: _mipLinkUrl[2],
                    });
                  }, 1000);
                }
              },
            });
          }
          break;
        default:
          // reject(new Error('未知跳转链接'));
          reject('none');
          break;
      }
      const curUrl = getPagePath();
      getApp().mtj.trackEvent('all_site_clicks', {
        click_url: jumpUrl,
        page_url: curUrl,
      });
      getApp().mtj.trackEvent('all_site_block_click', {
        click_url: jumpUrl,
        page_url: curUrl,
      });
      resolve(jumpUrl);
    } catch (error) {
      reject(error);
    }
  });
};
/**
 * JSON array de duplication
 * JSON数组去重
 * @param array jsonArray
 * @param key 根据此key名进行去重
 */
function uniqueJsonArray(array, key) {
  var result = [array[0]];
  for (var i = 1, len = array.length; i < len; i++) {
    var item = array[i];
    var repeat = false;
    for (var j = 0; j < result.length; j++) {
      if (item[key] == result[j][key]) {
        repeat = true;
        break;
      }
    }
    if (!repeat) {
      result.push(item);
    }
  }
  return result;
}

/**
 * Filter and format resource bit data
 * 过滤格式化资源位数据
 */
function formatResource(dataLists, pagesType) {
  if (!dataLists || dataLists.length === 0) return {};
  let topBarData = [],
    popUpData = [],
    floatAdData = [],
    promotionData = [],
    productDetailData = [],
    pageAdData = [],
    categoryAdData = [],
    bottomBarData = [],
    storeAdData = [],
    userCenterData = [],
    colorData = [],
    integralData = [],
    otherData = [];
  let newArr = uniqueJsonArray(dataLists, 'id');
  for (let i = 0, len = newArr.length; i < len; i++) {
    const item = newArr[i];
    let tempArr = [];
    item.fileList &&
      item.fileList.length > 0 &&
      item.fileList.map((ele) => {
        tempArr.push({
          filePath: ele,
        });
      });
    item.fileList = tempArr;
    let tempPageType = parseFloat(item.pagesType);
    let myPageType = parseFloat(pagesType);

    // if(item.pagesType*1 === 12) {
    //   pageAdData.push(item);
    // }

    if (item.pagesType * 1 === 1 && item.type * 1 === 2) {
      topBarData.push(item);
    }

    // if ((tempPageType === myPageType)) {
    switch (item.type * 1) {
      case 1: // 顶部tabBar
        topBarData.push(item);
        break;
      case 2: // 弹窗 Popup
        popUpData.push(item);
        break;
      case 3: // 浮动广告 Floating advertising
        floatAdData.push(item);
        break;
      case 4: // 促销信息 Promotion information
        if (item.productSubList && item.productSubList.length > 0) {
          promotionData.push(item);
        }
        break;
      case 5: // 产品详情 product details
        productDetailData.push(item);
        break;
      case 6: // 页面广告 Page advertisement
        pageAdData.push(item);
        break;
      case 7: // 类目广告 Category advertising
        categoryAdData.push(item);
        break;
      case 8: // 底部bar Bottom bar
        bottomBarData.push(item);
        break;
      case 9: // 门店 store
        storeAdData.push(item);
        break;
      case 10: // 个人主页 Personal home page
        userCenterData.push(item);
        break;
      case 11: // 彩妆师 Makeup artist
        colorData.push(item);
        break;
      case 12: // 积分tab Integral tab
        integralData.push(item);
        break;
      default:
        // 其他 other
        otherData.push(item);
        break;
    }
    // }
  }

  return {
    topBarData, // 顶部tabBar (彩妆师列表)
    popUpData, // 弹窗
    floatAdData, // 浮动广告
    promotionData, // 促销信息
    productDetailData, // 产品详情
    pageAdData, // 页面广告
    categoryAdData, // 类目广告
    bottomBarData, // 底部bar
    storeAdData, // 门店
    userCenterData, // 个人主页
    colorData, // 彩妆师
    integralData, // 积分tab
    otherData, // 其他
  };
}

//一维数组转为二维数组
function translateDataToTree(data, parentId = 0) {
  let tree = [];
  let temp;
  data.forEach((item, index) => {
    if (data[index].parentId == parentId) {
      let obj = data[index];
      temp = translateDataToTree(data, data[index].id);
      if (temp.length > 0) {
        obj.children = temp;
      }
      tree.push(obj);
    }
  });
  return tree;
}

//三级、四级的评论合并到二级里
//Level 3 and 4 comments are merged into Level 2
function childrenAggregation(data, children) {
  if (data == null) {
    return;
  }
  data.forEach((item, index) => {
    children.push({
      id: item.id,
      unionId: item.unionId,
      headPortraitUrl: item.headPortraitUrl,
      userName: item.userName,
      content: item.content,
      contentStatus: item.contentStatus,
      createTime: item.createTime,
      noteId: item.noteId,
      parentId: item.parentId,
      label: 'item.label',
    });

    if (item.children != null) {
      childrenAggregation(item.children, children);
    }
  });
  return children;
}

const formatItem = (items) => {
  let tempMap = items.reduce((previousValue, currentValue, index, array) => {
    let parentId = currentValue['parentId'];
    if (!previousValue[parentId]) {
      previousValue[parentId] = [];
    }
    previousValue[parentId].push(currentValue);
    return previousValue;
  }, {});
  console.log('tempMap', tempMap);
  const swapChildren = (item) => {
    if (tempMap[item.id]) {
      item.children = tempMap[item.id];

      item.children.map((childItem) => {
        childItem = swapChildren(childItem);
        return childItem;
      });
    }
    return item;
  };
  let result = tempMap['0'].map((item) => {
    item = swapChildren(item);
    return item;
  });
  return result;
};

//格式评论列表
//Format comment list
function getList(data) {
  let map = new Map();
  let childrenArr = [];
  data.forEach((item, index) => {
    let childrenObject = {
      content: item.content,
      headPortraitUrl: item.headPortraitUrl,
      createTime: item.createTime,
      userName: item.userName,
      parentId: item.parentId,
    };
    let value = map.get(item.parentId);
    //如果父类id对应的子类属性已存在，则往子类数组里新增一条
    //If the subclass attribute corresponding to the parent class ID already exists, add a new one to the subclass array
    if (null != value) {
      value.push(childrenObject);
      return;
    }
    childrenArr.push(childrenObject);
    //父类id为key
    //Parent class ID is key
    map.set(item.parentId, childrenArr);
    childrenArr = [];
  });

  return fromatValue(data, map);
}

function fromatValue(data, map) {
  let newArray = [];
  data.forEach((item, index) => {
    let key = item.parentId;
    let value = map.get(key);
    if (value == null) {
      return;
    }
    map.delete(key);
    let parentObject = {
      parentContent: item.parentContent,
      parentId: item.parentId,
      headPortraitUrl: item.headPortraitUrl,
      createTime: item.createTime,
      userName: item.userName,
      noteId: item.noteId,
      children: value,
    };
    newArray.push(parentObject);
  });
  return newArray;
}

function formatPhone(tel) {
  if (!tel) return '';
  return tel.substring(0, 3) + '*******' + tel.substr(tel.length - 1);
}

/**
 *
 * @param {*} info 每个笔记的数据  Data for each note
 * @param {*} pages 判断是哪个页面 Determine which page
 * charmFan
 * makeupArtist
 * createNote
 */
function formatWaterfallItem(info, pages) {
  switch (pages) {
    case 'charmFan':
      // 魅粉笔记详情
      //Charm powder notes details
      const masterContent = info.contentRecords
        ? info.contentRecords.filter((v) => v.type === 1 && v.category === 3)[0] ||
          info.contentRecords.filter((v) => v.type === 1 && v.category === 4)[0] ||
          info.contentRecords.filter((v) => v.type === 4 && v.category === 4)[0]
        : '';
      const title = info.contentRecords ? info.contentRecords.filter((v) => v.type === 3 && v.category === 1) || [] : '';
      info.masterImg = masterContent ? masterContent.content : Constants.searchLiveBg;
      info.masterType = info.contentRecords ? (info.contentRecords.filter((v) => v.content.indexOf('.mp4') > -1).length ? 4 : '') : '';
      info.title = title && title[0] && title[0].content ? title[0].content : '';
      info.likeNum = info.likeNum || 0;
      break;

    default:
      break;
  }
  return info;
}

// 互道魅粉点赞
//Praise each other
const hdUpdateLikeStatus = (id, likeFlag) => {
  const { user_id, id_token } = wx.getStorageSync('userInfo');
  return new Promise((resolve, reject) => {
    sdClient.charmFan
      .hdNoteLike({ id: id, like: likeFlag ? false : true, unionId: user_id }, '', id_token)
      .then((res) => {
        resolve(res);
      })
      .catch((error) => {
        reject(error);
      });
  });
};
// 云徙魅粉点赞
//Cloud migration charm powder praise
const yxUpdateLikeStatus = (postId, likeFlag) => {
  const { id_token } = wx.getStorageSync('userInfo');
  return new Promise((resolve, reject) => {
    sdClient.charmFan
      .yxNoteLike({ dr: likeFlag ? 1 : 0, postId: postId, wechatId: coxCmsClient.wechatId }, coxCmsClient.wechatId, id_token)
      .then((res) => {
        resolve(res);
      })
      .catch((error) => {
        reject(error);
      });
  });
};
// 云徙彩妆师点赞
//Yunqian makeup artist likes it
const yxMakeUpUpdateLikeStatus = (id, likeFlag) => {
  const { id_token } = wx.getStorageSync('userInfo');
  return new Promise((resolve, reject) => {
    const paramsData = {
      dr: likeFlag ? 1 : 0,
      postId: id,
      wechatId: coxCmsClient.wechatId,
    };
    sdClient.muaUpPage
      .handleLikeUrl(paramsData, id_token)
      .then((res) => {
        resolve(res);
      })
      .catch((error) => {
        reject(error);
      });
  });
};

// 登录获取状态
//Login get status
const authorizationStatusInfo = (showCancel = true) => {
  return new Promise(async (resolve, reject) => {
    // 如果本身有头像，则直接返回
    //If you have an avatar, return directly
    if (store.userProfile.profilePictureUrl && store.userProfile.firstName) {
      resolve(store.userProfile);
    } else {
      // 没有头像的话去判断处理
      //If there is no avatar, judge and deal with it
      const wxchatUserProfile = wx.getStorageSync('wxchatUserProfile');
      if ((!wxchatUserProfile && !wxchatUserProfile.profilePictureUrl) || !wxchatUserProfile.firstName) {
        // 如果本地没有头像，则去获取用户授权
        //If there is no local avatar, obtain user authorization
        wx.getUserProfile({
          lang: 'zh_CN',
          desc: '用来进行个人发布',
          success: (res) => {
            console.log('用来进行个人发布', res);
            const userData = {
              ...store.userProfile,
              // profilePictureUrl: store.userProfile.profilePictureUrl ? store.userProfile.profilePictureUrl : res.userInfo.avatarUrl,
              // firstName: store.userProfile.firstName ? store.userProfile.firstName : res.userInfo.nickName,
              profilePictureUrl: res.userInfo.avatarUrl,
              firstName: res.userInfo.nickName,
            };
            store.userProfile = userData;
            wx.setStorageSync('wxchatUserProfile', userData);
            sdClient.account.updateMemberMembers({
              userId: userData.id,
              nickname: userData.firstName,
              headUrl: userData.profilePictureUrl,
              openId: userData.socialProfiles[0].providerUserId,
              unionId: userData.socialProfiles[0].profileInfo.unionId,
            });
            resolve(userData);
          },
          fail: (res) => {
            console.log('用户点击取消', res);
            wx.setStorageSync('wxchatUserProfile', {});
            sdClient.account.updateMemberMembers({
              userId: store.userProfile.id,
              nickname: store.userProfile.firstName,
              headUrl: store.userProfile.profilePictureUrl,
              openId: store.userProfile.socialProfiles[0].providerUserId,
              unionId: store.userProfile.socialProfiles[0].profileInfo.unionId,
            });
            if (!showCancel) {
              // 返回上一页
              wx.navigateBack({ delta: 1 });
            }
            reject(res);
          },
        });
      } else {
        // 如果本地有头像，则直接使用
        //If there is a local avatar, use it directly
        const userData = {
          ...store.userProfile,
          profilePictureUrl: wxchatUserProfile.profilePictureUrl,
          firstName: wxchatUserProfile.firstName,
        };
        store.userProfile = userData;
        sdClient.account.updateMemberMembers({
          userId: userData.id,
          nickname: userData.firstName,
          headUrl: userData.profilePictureUrl,
          openId: userData.socialProfiles[0].providerUserId,
          unionId: userData.socialProfiles[0].profileInfo.unionId,
        });
        resolve(userData);
      }
    }
  });
};

// 根据userId获取用户昵称和头像
//Get user nickname and avatar according to userid
const getMemberInfo = async (userIdList) => {
  const data = await sdClient.account.getUserMembers({ userIdList: userIdList });
  return data;
};

const getFansList = async (userIdList, fansList) => {
  const data = await getMemberInfo(userIdList);
  data.forEach((item) => {
    fansList.forEach((v) => {
      if (v.unionId === item.userId) {
        v.headUrl = item.headUrl;
        v.nickName = item.nickname;
      }
    });
  });
  return fansList;
};

// 授权头像昵称
const getUserProfile = () => {
  return new Promise((resolve) => {
    wx.getUserProfile({
      desc: '用于完善会员资料',
      success: (res) => {
        wx.setStorageSync('userProfile', res.userInfo);
        resolve(res.userInfo);
      },
    });
  });
};

// 是否是今天
function isToday(str) {
  const data0 = new Date();
  const y0 = data0.getFullYear();
  const m0 = data0.getMonth() + 1;
  const d0 = data0.getDate();

  const data1 = new Date(str);
  const y1 = data1.getFullYear();
  const m1 = data1.getMonth() + 1;
  const d1 = data1.getDate();
  return y0 == y1 && m0 == m1 && d0 == d1;
}

// 判断是否是正常订单
export function checkNormalOrder(price) {
  return Number(price) > 0.1;
}

// 跳转搜索页
const handleGoSearch = async (path) => {
  getApp().mtj.trackEvent('click_search', {
    page_url: path,
  });

  const idToken = wx.getStorageSync('userInfo').id_token;
  const { defaultWord } = await sdClient.macGirlPost.getHotWords(idToken);
  const defaultArr = defaultWord.split(',');
  const index = Math.floor(Math.random() * defaultArr.length);
  wx.navigateTo({
    url: `/upgrade-page/searchPage/index?searchValue=${defaultArr[index]}`,
  });
};

// 获取试妆数据
const getVtoData = () => {
  return new Promise((resolve, reject) => {
    // https://docs.qq.com/doc/DSWVyU2hjSEhaYnNC  17.VTO试妆配置
    wx.request({
      url: `${process.env.REMAX_APP_PRLS_CMS_URL}/api/assets/mac-wmp/5a4c2978-fb9c-46e2-ab13-e894a25e4f6a/vto-support-prouduct.json`,
      success: (res) => {
        resolve(res.data);
      },
      fail: (error) => {
        reject(error);
      },
    });
  });
};

const stringClampByByte = (str, byteLimit) => {
  const byteLength = (s) => s.replace(/[^x00-xFF]/g, '**').length;
  if (byteLength(str) > byteLimit) {
    const result = str.split('').reduce((prev, cur) => {
      if (byteLength(prev + cur) > byteLimit) {
        return prev;
      } else {
        return prev + cur;
      }
    }, '');

    return `${result}...`;
  } else {
    return str;
  }
};
/**
 * 对emoji表情转义
 * @method utf16toEntities
 * @param {*} strs
 * @returns
 */
const utf16toEntities = (strs) => {
  let str = strs;
  if (!str) {
    str = '';
  }
  try {
    str = str.toString();
  } catch (err) {
    return str;
  }
  const patt = /[\ud800-\udbff][\udc00-\udfff]/g; // 检测utf16字符正则
  str = str.replace(patt, (char) => {
    let H;
    let L;
    let code;
    if (char.length === 2) {
      H = char.charCodeAt(0); // 取出高位
      L = char.charCodeAt(1); // 取出低位
      // eslint-disable-next-line no-mixed-operators
      code = (H - 0xd800) * 0x400 + 0x10000 + L - 0xdc00; // 转换算法
      return `&#${code};`;
    }
    return char;
  });
  return str;
};

// 过滤emoji字符
const filterEmoji = (strs) => {
  let str = strs;

  if (!str) {
    str = '';
  }
  try {
    str = str.toString();
  } catch (err) {
    return str;
  }
  let value = str.replace(/([^\u0020-\u007E\u00A0-\u00BE\u2E80-\uA4CF\uF900-\uFAFF\uFE30-\uFE4F\uFF00-\uFFEF\u0080-\u009F\u2000-\u201f\u2026\u2022\u20ac])/g, '');
  return value;
};


function formatDataForWeAnalyze(data) {
  if (!isEmpty(data)) {
    return Object.entries(data).reduce((acc, [key, value]) => {
      acc[key] = value ?? '';

      return acc;
    }, {});
  }

  return {};
}

function getFormatMemberLevel() {
  const { crmInfo } = crmMobx.crmInfo;

  return crmInfo?.customerType ? `${crmInfo.customerType?.split('-')?.[1]}` : '';
}

export function formatPrice(price) {
  return price ? +(price * 100).toFixed(0) : 0;
}

const Util = {
  utf16toEntities,
  checkNormalOrder,
  isToday,
  getList,
  compareVersion,
  ksort,
  formatTime,
  formatNumber,
  getArrIndexByValue,
  getUrlDataByObject,
  turnArrObjToArrByKey,
  turnArrObjToObjByKey,
  isiPhoneXLater,
  accAdd,
  getPagePath,
  skuidTransformInfo,
  formatResource, // 格式化资源位列表 Format resource bit list
  resourceClick, // 资源位点击事件 Resource bit click event
  translateDataToTree, // 一维数组转成树状数组 Convert one-dimensional array to tree array
  formatPhone,
  formatItem,
  childrenAggregation,
  formatWaterfallItem,
  hdUpdateLikeStatus,
  yxUpdateLikeStatus,
  yxMakeUpUpdateLikeStatus,
  authorizationStatusInfo,
  getMemberInfo,
  getFansList,
  getUserProfile,
  handleGoSearch,
  getVtoData,
  stringClampByByte,
  filterEmoji,
  formatDataForWeAnalyze,
  getFormatMemberLevel,
  formatPrice,
};
export default Util;
