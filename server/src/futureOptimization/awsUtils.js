const { AWS_ACCESS_KEY, AWS_SECRET_KEY } = process.env;
const AWS = require('aws-sdk');
const { ApiGatewayManagementApiClient, PostToConnectionCommand } = require('@aws-sdk/client-apigatewaymanagementapi');
const {
  SchedulerClient,
  CreateScheduleCommand,
  ListSchedulesCommand,
  DeleteScheduleCommand,
} = require('@aws-sdk/client-scheduler');
const sharp = require('sharp');
const _ = require('lodash');
const fs = require('fs');
const mime = require('mime');
const logger = require('./logger');
const config = require('../config/config');
const slack = require('./slack');
const { sendErrorMessage } = require('./slack');
const { throwBadRequest } = require('./badRequestHandlingUtils');
const { BYTES_TO_MB, MAX_SIZE_FILE } = require('./constant');
const { getMessageByLocale } = require('../locale');
// TODO: put this to environment parameter
// (NODE_ENV === 'production') ? 'mmenu' : 'mmenu-dev';
const bucketName = 'mmenu-dev';
const region = 'ap-southeast-1';
const s3BaseUrl = `https://${bucketName}.s3.${region}.amazonaws.com`;
const { parseWebsocketProto } = require('../converter/webSocketProto');
const redis = require('./redis');
const { MAX_SIZE_VIDEO_FILE } = require('./constant');

AWS.config.update({
  accessKeyId: AWS_ACCESS_KEY,
  secretAccessKey: AWS_SECRET_KEY,
  region,
});
const s3 = new AWS.S3();
const sqs = new AWS.SQS({ apiVersion: '2012-11-05' });
const cw = new AWS.CloudWatch({ apiVersion: '2010-08-01' });

const schedulerClient = new SchedulerClient({
  credentials: {
    accessKeyId: AWS_ACCESS_KEY,
    secretAccessKey: AWS_SECRET_KEY,
  },
  region,
});

const _reziseImageBuffer = async (imageBuffer) => {
  const options = {
    width: config.resizeImageWith,
    height: config.resizeImageWith,
    fit: sharp.fit.inside,
    withoutEnlargement: true,
  };
  try {
    return await sharp(imageBuffer).resize(options).withMetadata().jpeg({ quality: 80, progressive: true }).toBuffer();
  } catch (error) {
    sendErrorMessage(`order logger error. ${error.stack}`);
    logger.error(error.stack);
    return imageBuffer;
  }
};

// scheduleExpression: 'at(2023-06-16T15:36:00)'
// timezone: 'Asia/Saigon', 'UTC'
// require: {name, scheduleExpression, targetInput}
// name: must not excess 64 characters
const createScheduleInEventBridgeScheduler = async ({
  name,
  scheduleExpression,
  timezone = 'UTC',
  targetInput,
  startDate,
  endDate,
  groupName = 'default',
  ActionAfterCompletion = 'DELETE',
}) => {
  logger.debug(`group name = ${config.env}_${groupName}`);
  const input = {
    ActionAfterCompletion,
    GroupName: `${config.env}_${groupName}`,
    Name: name,
    ScheduleExpression: scheduleExpression,
    Target: {
      Arn: config.awsJobLambdaArn,
      RoleArn: config.awsSchedulerRoleArn,
      Input: JSON.stringify(targetInput),
      RetryPolicy: {
        MaximumEventAgeInSeconds: 86400,
        MaximumRetryAttempts: 185,
      },
    },
    FlexibleTimeWindow: {
      MaximumWindowInMinutes: null,
      Mode: 'OFF',
    },
  };

  if (timezone) {
    input.ScheduleExpressionTimezone = timezone;
  }
  if (startDate) {
    input.StartDate = startDate;
  }
  if (endDate) {
    input.EndDate = endDate;
  }

  try {
    const command = new CreateScheduleCommand(input);
    const response = await schedulerClient.send(command);
    return response;
  } catch (err) {
    const message = `error when createScheduleInEventBridgeScheduler. errStack: ${err.stack}`;
    logger.error(message);
    slack.sendErrorMessage(message);
  }
};

// Delete schedule starts with a namePrefix
const deleteScheduleInEventBridgeScheduler = async (namePrefix) => {
  try {
    const listSchedulesCommand = new ListSchedulesCommand({
      Filter: `NamePrefix=${namePrefix}`,
    });

    const response = await schedulerClient.send(listSchedulesCommand);
    if (response.Schedules && response.Schedules.length > 0) {
      for (const schedule of response.Schedules) {
        const deleteCommand = new DeleteScheduleCommand({
          Name: schedule.Name,
        });
        await schedulerClient.send(deleteCommand);
        logger.info(`Deleted schedule: ${schedule.Name}`);
      }
    }
  } catch (err) {
    const message = `Error when deleting schedules with prefix ${namePrefix}. errStack: ${err.stack}`;
    logger.error(message);
    slack.sendErrorMessage(message);
  }
};

const uploadFileToS3 = async ({ fileName, targetFilePath, type = 'default', imageForReservation }) => {
  // Read content from the file
  const fileContent = fs.readFileSync(fileName); // eslint-disable-line
  let resizeContent;
  if (imageForReservation) {
    resizeContent = fileContent;
  } else {
    resizeContent = await _reziseImageBuffer(fileContent);
  }
  const fileInfo = fs.statSync(fileName); // eslint-disable-line
  const fileSize = _.get(fileInfo, 'size', 0);
  const fileSizeMb = fileSize / BYTES_TO_MB;
  if (type === 'video') {
    throwBadRequest(fileSizeMb > MAX_SIZE_VIDEO_FILE, getMessageByLocale({ key: 'uploadMessage.exceedFileUploadSize50MB' }));
  } else {
    throwBadRequest(fileSizeMb > MAX_SIZE_FILE, getMessageByLocale({ key: 'uploadMessage.exceedFileUploadSize5MB' }));
  }
  const contentType = mime.getType(targetFilePath);
  return new Promise((resolve, reject) => {
    const params = {
      Bucket: bucketName,
      Key: targetFilePath,
      Body: type === 'video' ? fileContent : resizeContent,
      ContentType: contentType,
    };
    // Uploading files to the bucket
    s3.putObject(params, (err) => {
      if (err) {
        reject(err);
      }
      const resultUrl = `${s3BaseUrl}/${targetFilePath}`;
      logger.debug(`upload file to ${resultUrl}`);
      resolve(resultUrl);
    });
  });
};

const uploadBufferImageToS3 = async ({ bufferData, targetFilePath }) => {
  // Read content from the file
  const resizeContent = await _reziseImageBuffer(bufferData);
  const fileSizeMb = _.get(bufferData, 'length', 0) / BYTES_TO_MB;
  throwBadRequest(fileSizeMb > config.maxSizeFile, getMessageByLocale({ key: 'uploadMessage.exceedFileUploadSize5MB' }));
  const contentType = mime.getType(targetFilePath);
  return new Promise((resolve, reject) => {
    const params = {
      Bucket: bucketName,
      Key: targetFilePath,
      Body: resizeContent,
      ContentType: contentType,
    };
    // Uploading files to the bucket
    s3.putObject(params, (err) => {
      if (err) {
        reject(err);
      }
      const resultUrl = `${s3BaseUrl}/${targetFilePath}`;
      logger.debug(`upload buffer image to ${resultUrl}`);
      resolve(resultUrl);
    });
  });
};

const uploadPublicFileToS3 = async ({ file, Bucket = 'mmenuio', targetFilePath }) => {
  if (config.env === 'test') return;
  const baseUrl = `https://${Bucket}.s3.${region}.amazonaws.com`;
  const fileSize = file.size;
  const fileSizeMb = fileSize / BYTES_TO_MB;
  throwBadRequest(fileSizeMb > config.maxSizeFile, getMessageByLocale({ key: 'uploadMessage.exceedFileUploadSize5MB' }));
  const contentType = mime.getType(targetFilePath);
  return new Promise((resolve, reject) => {
    const params = {
      Bucket,
      Key: targetFilePath,
      Body: file.buffer,
      ContentType: contentType,
    };
    // Uploading files to the bucket
    s3.putObject(params, (err) => {
      if (err) {
        reject(err);
      }
      const resultUrl = `${baseUrl}/${targetFilePath}`;
      logger.debug(`upload file to ${resultUrl}`);
      resolve(resultUrl);
    });
  });
};

const removePublicFileFromS3 = async ({ Bucket = 'mmenuio', url }) => {
  if (config.env === 'test') return;
  const baseUrl = `https://${Bucket}.s3.${region}.amazonaws.com/`;
  const Key = _.replace(url, baseUrl, '');
  return new Promise((resolve, reject) => {
    const params = {
      Bucket,
      Key,
    };
    s3.deleteObject(params, (err) => {
      if (err) {
        reject(err);
      }
      logger.debug(`deleted ${url}`);
      resolve(url);
    });
  });
};

// lấy thông tin 1 sqs queue
const listQueueUrl = async (queueNamePrefix) => {
  const params = {
    QueueNamePrefix: queueNamePrefix,
  };

  return new Promise((resolve) => {
    sqs.listQueues(params, (err, data) => {
      if (err) {
        resolve(null);
      } else {
        resolve(_.get(data, 'QueueUrls.0'));
      }
    });
  });
};

// tạo 1 sqs queue
const createAwsSqsQueue = async (queueName) => {
  // https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/SQS.html#createQueue-property
  const params = {
    QueueName: queueName,
    Attributes: {
      DelaySeconds: '0',
      VisibilityTimeout: '3600',
      MessageRetentionPeriod: '3660', // 1 hour
    },
  };
  return new Promise((resolve, reject) => {
    sqs.createQueue(params, (err, data) => {
      if (err) {
        reject(err);
      } else {
        resolve(data);
      }
    });
  });
};

const _isRedisQueue = (queueUrl) => {
  try {
    const redisKeyWord = config.mmenuPrinterRedisRestaurant;
    if (_.isEmpty(redisKeyWord)) {
      return false;
    }
    const keys = redisKeyWord.split(',');
    return _.some(keys, (key) => _.includes(queueUrl, key));
  } catch (err) {
    return false;
  }
};

// Làm theo cách hacky, dổi sqs sang redis queue
const _sendToRedisQueue = async ({ messageBody, queueUrl }) => {
  try {
    logger.info(`send Job to redis queue ${queueUrl}`);
    await redis.pushToQueue({ key: queueUrl, val: messageBody });
  } catch (err) {
    const message = `error when send job to redis queeu. ${queueUrl} = ${err.stack}`;
    logger.error(message);
    slack.sendErrorMessage(message);
  }
};

const _getMessageFromRedisQueue = async ({ queueUrl }) => {
  try {
    const result = await redis.popFromQueue({ key: queueUrl });
    if (result) {
      logger.info(`Get message Job from redis queue ${queueUrl}`);
      return { Messages: [{ Body: result }] };
    }
    return result;
  } catch (err) {
    const message = `error when get job from redis queeu. ${queueUrl} = ${err.stack}`;
    logger.error(message);
    slack.sendErrorMessage(message);
  }
};

// gửi tin nhắn lên 1 queue
// messageBody: string
const sendAwsSqsMessage = async ({ messageBody, queueUrl }, retry = 0) => {
  if (_isRedisQueue(queueUrl)) {
    await _sendToRedisQueue({ messageBody, queueUrl });
    return;
  }
  if (config.env === 'test' || config.env === 'local') {
    logger.debug(messageBody);
    logger.debug(queueUrl);
    return;
  }

  const params = {
    DelaySeconds: 0,
    MessageBody: messageBody,
    QueueUrl: queueUrl,
  };

  return new Promise((resolve) => {
    sqs.sendMessage(params, (err, data) => {
      if (err) {
        logger.error(`error when send job to sqs. ${queueUrl} = ${err.stack}. retry = ${retry}`);
        slack.sendErrorMessage(`error when send job to sqs. ${queueUrl} = ${err.stack}. retry = ${retry}`);
        slack.sendErrorMessage(`error when send job to sqs. ${queueUrl}.  ${messageBody}`);
        if (retry < 5) {
          setTimeout(() => sendAwsSqsMessage({ messageBody, queueUrl }, retry + 1), 1000);
        }
        resolve();
      } else {
        resolve(data);
      }
    });
  });
};

const sendAwsSqsMessageWithTryCatch = async ({ messageBody, queueUrl, printerIp }) => {
  try {
    const notificationResponse = JSON.parse(messageBody);
    const printer = {
      printerId: '62a04d61edc83ed87e14404b',
      printerName: 'bep',
      printerHost: printerIp,
      printerPort: 9100,
      isDefaultPayment: true,
      isDefaultForOrderConfirmed: true,
      size: 80,
      doNotIncludePriceInBill: false,
      dishTypes: ['drink', 'other', 'food'],
      includeNoteInBill: true,
      includeOrderDetailNumber: true,
    };
    notificationResponse.printerInfo = [printer];
    logger.info(`send mirror message to sqs: ${queueUrl}, ${JSON.stringify(notificationResponse)}`);
    await sendAwsSqsMessage({ messageBody: JSON.stringify(notificationResponse), queueUrl });
  } catch (err) {
    const msg = `error sendAwsSqsMessageWithTryCatch ${err.stack}`;
    logger.error(msg);
    slack.sendErrorMessage(msg);
  }
};

const deleteAwsSqsMessage = async (queueUrl, messagePayload) => {
  if (config.env === 'test') {
    return;
  }

  if (_isRedisQueue(queueUrl)) {
    return;
  }

  const deleteParams = {
    QueueUrl: queueUrl,
    ReceiptHandle: messagePayload.Messages[0].ReceiptHandle,
  };
  return new Promise((resolve, reject) => {
    sqs.deleteMessage(deleteParams, (err, data) => {
      if (err) {
        reject(err);
      } else {
        resolve(data);
      }
    });
  });
};

const receiveAwsSqsMessage = async (queueUrl) => {
  if (_isRedisQueue(queueUrl)) {
    return _getMessageFromRedisQueue({ queueUrl });
  }
  const params = {
    AttributeNames: ['SentTimestamp'],
    MaxNumberOfMessages: 1,
    MessageAttributeNames: ['All'],
    QueueUrl: queueUrl,
    // will not show to other request
    VisibilityTimeout: 60,
    WaitTimeSeconds: 0,
  };
  return new Promise((resolve, reject) => {
    sqs.receiveMessage(params, (err, data) => {
      if (err) {
        reject(err);
      } else {
        resolve(data);
      }
    });
  });
};

const sendMessageToWebsocket = async ({ message, websocketUrl, connectionIds }) => {
  try {
    const messageProto = await parseWebsocketProto(message);
    const client = new ApiGatewayManagementApiClient({
      credentials: { accessKeyId: AWS_ACCESS_KEY, secretAccessKey: AWS_SECRET_KEY },
      region,
      endpoint: websocketUrl,
    });
    for (const connectionId of connectionIds) {
      const command = new PostToConnectionCommand({
        ConnectionId: connectionId,
        Data: JSON.stringify(messageProto.toJSON()),
      });
      // eslint-disable-next-line
      await client.send(command);
    }
  } catch (err) {
    slack.sendErrorMessage(`error when send Printer message to WebSocket . errStack = ${err.stack}`);
    logger.error(err);
  }
};

const publishRedisQueueData = async (value) => {
  try {
    if (config.env === 'test' || config.env === 'development') {
      return;
    }
    const params = {
      MetricData: [
        {
          MetricName: 'QueueSize',
          Unit: 'None',
          Value: value,
        },
      ],
      Namespace: 'Mmenu/jobQueue',
    };
    cw.putMetricData(params, (err, data) => {
      if (err) {
        const message = `error put metric. ${err}`;
        logger.error(message);
        slack.sendErrorMessage(message);
      } else {
        logger.info('Success', JSON.stringify(data));
      }
    });
  } catch (err) {
    logger.err('error upload data');
  }
};

// sendAwsSqsMessage({
//   queueUrl: 'https://sqs.ap-southeast-1.amazonaws.com/633454557521/621f4664516816e8bd64bf36_printer',
//   messageBody: JSON.stringify(testdata),
// });
// sendAwsSqsMessage({ queueUrl: 'https://sqs.ap-southeast-1.amazonaws.com/633454557521/queuetestes', messageBody: 'test test 2' });

module.exports = {
  uploadFileToS3,
  uploadBufferImageToS3,
  s3BaseUrl,
  region,
  createAwsSqsQueue,
  sendAwsSqsMessage,
  listQueueUrl,
  receiveAwsSqsMessage,
  deleteAwsSqsMessage,
  sendAwsSqsMessageWithTryCatch,
  uploadPublicFileToS3,
  removePublicFileFromS3,
  sendMessageToWebsocket,
  publishRedisQueueData,
  createScheduleInEventBridgeScheduler,
  deleteScheduleInEventBridgeScheduler,
};
