// vip权益伪代码


// 1. 常量定义
const GIFT_STATUS = {
  UNUSED: 'unused',
  RESERVED: 'reserved',
  WRITE_OFF: 'writeOff',
  EXPIRED: 'expired'
};

const CHANNEL = {
  ONLINE: 'online',
  OFFLINE: 'offline'
};

const GIFT_TYPE = {
  BIRTHDAY: '生日礼',
  PROMOTE: '晋升礼',
  REPURCHASE: '回购礼',
  COUNTER: '回柜礼',
};

const VIP_CRM_OFFER_DIVIDER = '#@#';

// 2. 核心服务类
class GiftService {
  constructor() {
    this.giftList = [];
    this.currentGift = null;
  }

  // 获取礼品列表
  async getGiftList(userId) {
    try {
      // 模拟API调用
      const response = await this.api.getGiftByUserId(userId);
      this.giftList = response.data.map(formatGift);
      return this.giftList;
    } catch (error) {
      console.error('获取礼品列表失败:', error);
      throw error;
    }
  }

  // 格式化礼品数据
  async formatGift(gift) {
    const gifts = await this.api.getGiftDetailFromPortal();
    // 此key用来和portal上配置的礼以及om配置的做配对
    const vipKey = i.offerType + VIP_CRM_OFFER_DIVIDER + i.offerName;
    
    return {
      id: gift.id,
      name: gift.offerName,
      type: gift.offerType,
      status: gift.status,
      startTime: new Date(gift.offerStartTime),
      endTime: new Date(gift.offerEndTime),
      channel: gift.applyChannel,
      store: gift.store,
      reservation: gift.reservation,
      writeOff: gift.writeOff,
      vipKey,
      ...gifts(vipKey)
    };
  }

 // 生成portal的产品列表
 genProtalGiftList(gifts) {
    
	return gifts.map(gift=>{
	    // 此key用来和portal上配置的礼以及om配置的做配对
    	const vipKey = gift.offerType + VIP_CRM_OFFER_DIVIDER + gift.offerName;
		return {
            vipKey,
			// 配置赠品信息用于展示
		    products:[skuId,quantity],
			src
		};
	});   
  }
}

// 3. 预约服务
class ReservationService {
  constructor(giftService) {
    this.giftService = giftService;
  }

  // 线下预约
  async reserveOffline({ giftId, storeId, date }) {
    try {
      const gift = this.giftService.currentGift;
      
      // 验证预约条件
      this.validateReservation(gift, storeId, date);

      // 调用预约API
      const response = await this.api.reserveOffline({
        giftId,
        storeId,
        date: this.formatDate(date),
        customerId: this.getCustomerId()
      });

      return response.data;
    } catch (error) {
      console.error('线下预约失败:', error);
      throw error;
    }
  }

  // 线上预约
  async reserveOnline({ giftId, address }) {
    try {
      const gift = this.giftService.currentGift;

      // 验证预约条件
      this.validateOnlineReservation(gift);

      // 调用预约API
      const response = await this.api.reserveOnline({
        giftId,
        customerId: this.getCustomerId()
      });

      return response.data;
    } catch (error) {
      console.error('线上预约失败:', error);
      throw error;
    }
  }

  // 验证预约条件
  validateReservation(gift, storeId, date) {
    if (gift.status !== GIFT_STATUS.UNUSED) {
      throw new Error('礼品状态不可预约');
    }
    if (date < gift.startTime || date > gift.endTime) {
      throw new Error('预约日期不在有效期内');
    }
    // 其他验证...
  }
}

// 4. 核销服务
class WriteOffService {
  constructor(giftService) {
    this.giftService = giftService;
  }

  // 线下核销
  async writeOffOffline({ giftId, storeCode, employeeCode }) {
    try {
      const gift = this.giftService.currentGift;

      // 验证核销条件
      this.validateWriteOff(gift, storeCode);

      // 调用核销API
      const response = await this.api.writeOffOffline({
        giftId,
        storeCode,
        employeeCode,
        customerId: this.getCustomerId()
      });

      return response.data;
    } catch (error) {
      console.error('线下核销失败:', error);
      throw error;
    }
  }

  // 线上核销
  async writeOffOnline({ giftId, orderId }) {
    try {
      const gift = this.giftService.currentGift;

      // 验证核销条件
      await this.validateOnlineWriteOff(gift, orderId);

      // 调用核销API
      const response = await this.api.writeOffOnline({
        giftId,
        orderId,
        customerId: this.getCustomerId()
      });

      return response.data;
    } catch (error) {
      console.error('线上核销失败:', error);
      throw error;
    }
  }

  // 验证核销条件
  validateWriteOff(gift, storeCode) {
    if (gift.status !== GIFT_STATUS.RESERVED) {
      throw new Error('礼品状态不可核销');
    }
    if (gift.channel !== CHANNEL.OFFLINE) {
      throw new Error('非线下礼品不可在门店核销');
    }
    // 其他验证...
  }
}

// 5. 业务流编排
class GiftBusinessFlow {
  constructor() {
    this.giftService = new GiftService();
    this.reservationService = new ReservationService(this.giftService);
    this.writeOffService = new WriteOffService(this.giftService);
  }

  // 线下预约流程
  async handleOfflineReservation(giftId) {
    try {
      // 1. 获取礼品信息
      const gift = await this.giftService.getGiftDetail(giftId);
      
      // 2. 选择门店
      const store = await this.showStorePicker(gift.stores);
      
      // 3. 选择日期
      const date = await this.showDatePicker(gift.startTime, gift.endTime);
      
      // 4. 执行预约
      const result = await this.reservationService.reserveOffline({
        giftId,
        storeId: store.id,
        date
      });

      return result;
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  // 线上预约流程
  async handleOnlineReservation(giftId) {
    try {
      // 1. 获取礼品信息
      const gift = await this.giftService.getGiftDetail(giftId);
     
      // 2. 执行预约
      const result = await this.reservationService.reserveOnline({
        giftId,
      });

      return result;
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  // 线下核销流程
  async handleOfflineWriteOff(giftId) {
    try {
      // 1. 获取礼品信息
      const gift = await this.giftService.getGiftDetail(giftId);
      
      // 2. 获取核销码
      const { storeCode, employeeCode } = await this.showWriteOffInput();
      
      // 3. 执行核销
      const result = await this.writeOffService.writeOffOffline({
        giftId,
        storeCode,
        employeeCode
      });

      return result;
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  // 线上核销流程
  async handleOnlineWriteOff(giftId,orderId) {
    try {
      // 1. 获取礼品信息
      const gift = await this.giftService.getGiftDetail(giftId);
      
      // 2. 执行核销
      const result = await this.writeOffService.writeOffOnline({
        giftId,
        orderId,
      });

      // 3. 处理核销结果
      await this.handleWriteOffResult(result);

      return result;
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  // 工具方法
  async showStorePicker(stores) {
    // 显示门店选择器
    return new Promise((resolve) => {
      // 实现门店选择逻辑
    });
  }

  async showDatePicker(start, end) {
    // 显示日期选择器
    return new Promise((resolve) => {
      // 实现日期选择逻辑
    });
  }

  async showWriteOffInput() {
    // 显示核销码输入框
    return new Promise((resolve) => {
      // 实现核销码输入逻辑
    });
  }

  handleError(error) {
    // 统一错误处理
    console.error('业务处理错误:', error);
    // 显示错误提示
    this.showToast(error.message);
  }
}

// 6. 使用示例
const giftFlow = new GiftBusinessFlow();

// 线下预约
async function reserveGiftOffline(giftId) {
  try {
    const result = await giftFlow.handleOfflineReservation(giftId);
    console.log('预约成功:', result);
  } catch (error) {
    console.error('预约失败:', error);
  }
}

// 线上核销
async function writeOffGiftOnline(giftId) {
  try {
    const result = await giftFlow.handleOnlineWriteOff(giftId);
    console.log('核销成功:', result);
  } catch (error) {
    console.error('核销失败:', error);
  }
}
