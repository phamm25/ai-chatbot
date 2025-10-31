const Slack = require('slack-node');
const moment = require('moment-timezone');
const _ = require('lodash');
const config = require('../config/config');
const { filterErrorMessageForErrorAlert } = require('./constant');
const logger = require('./logger');
const redisCommon = require('./redisCommon');

const formatDate = (datetime, format) => {
  if (!datetime) {
    return '';
  }
  moment.locale('en');
  const timeZone = 'Asia/Ho_Chi_Minh';
  return moment(datetime).tz(timeZone).format(format);
};
const formatDateTimeYyyymmddHHmmss = (dateTime) => formatDate(dateTime, 'YYYY-MM-DD HH:mm:ss');

const slackByChannel = {};
const slackChannelConfig = [
  {
    name: config.slackErrorAlertChannel,
    url: config.slackErrorAlertChannelUrl,
  },
  {
    name: config.slackDebugChannel,
    url: config.slackDebugChannelUrl,
  },
  {
    name: config.slackRequestLatencyChannel,
    url: config.slackRequestLatencyChannelUrl,
  },
  {
    name: config.slackBaoKimPaymentChannel,
    url: config.slackBaoKimPaymentChannelUrl,
  },
  {
    name: config.slackFinvietPaymentChannel,
    url: config.slackFinvietPaymentChannelUrl,
  },
  {
    name: config.slackGrabDeliveryChannel,
    url: config.slackGrabDeliveryChannelUrl,
  },
  {
    name: config.slackPrinterErrorChannel,
    url: config.slackPrinterErrorChannelUrl,
  },
  {
    name: config.slackPrinterDebugChannel,
    url: config.slackPrinterDebugChannelUrl,
  },
  {
    name: config.slackGachaChannel,
    url: config.slackGachaChannelUrl,
  },
  {
    name: config.slackAhamoveDeliveryChannel,
    url: config.slackAhamoveDeliveryChannelUrl,
  },
  {
    name: config.slackZaloMiniAppErrorChannel,
    url: config.slackZaloMiniAppErrorChannelUrl,
  },
  {
    name: config.slackMmenuFoodChannel,
    url: config.slackMmenuFoodChannelUrl,
  },
];

slackChannelConfig.forEach((cfg) => {
  if (cfg.url) {
    const slack = new Slack();
    slack.setWebhook(cfg.url);
    slackByChannel[cfg.name] = slack;
  }
});

const sendMessage = async ({ message, channel, filterMessages }) => {
  try {
    if (config.env === 'test') {
      // console.log(message);
      return;
    }
    if (!channel) {
      return;
    }
    if (!['development', 'production'].includes(config.env)) {
      return;
    }
    if (_.some(filterMessages, (mess) => _.includes(message, mess))) {
      return;
    }
    const slack = slackByChannel[channel];
    if (!slack) {
      return;
    }
    const key = 'slackMessageLock';
    const canSendMessage = await redisCommon.getCloudLock({ key, periodInSecond: 5 });
    if (!canSendMessage) return;

    const curdate = formatDateTimeYyyymmddHHmmss(new Date());
    // eslint-disable-next-line security/detect-non-literal-fs-filename
    const truncatedMessage = _.truncate(message, {
      length: 3000,
      omission: '... [Truncated]',
    });
    slack.webhook(
      {
        channel,
        username: 'mmenu-bot',
        icon_emoji: ':robot_face:',
        text: `${curdate} : ${config.env} ${config.serviceName} ${truncatedMessage}`,
      },
      (err, response) => response,
    );
  } catch (error) {
    // TODO: add log or event to datadog.
  }
};

const sendErrorMessage = async (message) => {
  if (config.env !== 'production') return;
  const curdate = formatDateTimeYyyymmddHHmmss(new Date());
  const text = `SlackError ${curdate} : ${config.env} ${config.serviceName} ${message}`;
  logger.error(text);
  sendMessage({
    message,
    channel: config.slackErrorAlertChannel,
    filterMessages: filterErrorMessageForErrorAlert,
  });
};

// eslint-disable-next-line no-unused-vars
const sendDebugMessage = (message) => {
  // if (!config.slackDebugFlag) {
  //   return;
  // }
  // sendMessage({ message, channel: config.slackDebugChannel });
};

const sendRequestLatencyMessage = (message) =>
  sendMessage({ message, channel: config.slackRequestLatencyChannel });

module.exports = {
  sendErrorMessage,
  sendDebugMessage,
  sendRequestLatencyMessage,
  sendMessage,
};
