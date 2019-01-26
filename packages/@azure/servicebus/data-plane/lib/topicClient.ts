// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import * as Long from "long";
import * as log from "./log";
import { ConnectionContext } from "./connectionContext";
import { MessageSender } from "./core/messageSender";
import { SendableMessageInfo } from "./serviceBusMessage";
import { Client } from "./client";
import { ScheduleMessage } from "./core/managementClient";

/**
 * Describes the TopicClient that is used to interact with a ServiceBus Topic.
 * @class TopicClient
 */
export class TopicClient extends Client {
  /**
   * Instantiates a client pointing to the ServiceBus Topic given by this configuration.
   * This is not meant for the user to call directly.
   * The user should use the `createTopicClient` on the Namespace instead.
   *
   * @constructor
   * @param name - The topic name.
   * @param context - The connection context to create the TopicClient.
   * @param [options] - The TopicClient options.
   */
  constructor(name: string, context: ConnectionContext) {
    super(name, context);
  }

  /**
   * Closes the AMQP connection to the ServiceBus Topic for this client.
   *
   * @returns {Promise<void>}
   */
  async close(): Promise<void> {
    try {
      if (this._context.namespace.connection && this._context.namespace.connection.isOpen()) {
        // Close the sender.
        if (this._context.sender) {
          await this._context.sender.close();
        }
        log.topicClient("Closed the topic client '%s'.", this.id);
      }
    } catch (err) {
      const msg =
        `An error occurred while closing the topic client ` +
        `"${this.id}": ${JSON.stringify(err)} `;
      log.error(msg);
      throw new Error(msg);
    }
  }

  /**
   * Sends the given message to a ServiceBus Queue.
   * To send a message to a `session` or `partition` enabled Queue, please set the
   * `sessionId` property and `partitionKey` properties respectively.
   *
   * @param message - Message to send.
   * @returns Promise<void>
   */
  async send(message: SendableMessageInfo): Promise<void> {
    const sender = MessageSender.create(this._context);
    return sender.send(message);
  }

  /**
   * Sends a batch of SendableMessageInfo to the ServiceBus Queue in a single AMQP message.
   * To send messages to a `session` or `partition` enabled Queue, set the
   * `sessionId` property and `partitionKey` properties respectively. When doing so, all
   * messages in the batch should have the same `sessionId` (if using sessions) and the same
   * `parititionKey` (if using paritions) properties.
   *
   * @param messages  An array of SendableMessageInfo objects to be sent in a Batch message.
   *
   * @return Promise<void>
   */
  async sendBatch(messages: SendableMessageInfo[]): Promise<void> {
    const sender = MessageSender.create(this._context);
    return sender.sendBatch(messages);
  }

  /**
   * Schedules a message to appear on Service Bus at a later time.
   *
   * @param scheduledEnqueueTimeUtc - The UTC time at which the message should be enqueued.
   * @param message - The message that needs to be scheduled.
   * @returns Promise<Long> - The sequence number of the message that was
   * scheduled. Please save the `Long` type as-is in your application. Do not convert it to a
   * number as that may cause loss of precision, since JS only supports 53 bit numbers.
   * `Long` type provides methods for mathematical operations.
   * If you want to save it to a log file, then save the stringifed form
   * `const result = Long.toString();`. When deserializing it, please use
   * `Long.fromString("result");`. This will ensure that precision is preserved.
   */
  async scheduleMessage(
    scheduledEnqueueTimeUtc: Date,
    message: SendableMessageInfo
  ): Promise<Long> {
    const scheduleMessages: ScheduleMessage[] = [
      { message: message, scheduledEnqueueTimeUtc: scheduledEnqueueTimeUtc }
    ];
    const result = await this._context.managementClient!.scheduleMessages(scheduleMessages);
    return result[0];
  }

  /**
   * Schedules a message to appear on a servicebus topic at a later time.
   *
   * @param scheduledEnqueueTimeUtc - The UTC time at which the message should be enqueued.
   * @param messages - Array of Messages that need to be scheduled.
   * @returns Promise<Long[]> - The sequence numbers of messages that were scheduled. Please
   * save the `Long` type as-is in your application. Do not convert it to a number as that may
   * cause loss of precision, since JS only supports 53 bit numbers. `Long` type provides methods
   * for mathematical operations. If you want to save it to a log file, then save the stringifed
   * form `const result = Long.toString();`. When deserializing it, please use
   * `Long.fromString("result");`. This will ensure that precision is preserved.
   */
  async scheduleMessages(
    scheduledEnqueueTimeUtc: Date,
    messages: SendableMessageInfo[]
  ): Promise<Long[]> {
    const scheduleMessages: ScheduleMessage[] = messages.map((message) => {
      return {
        message,
        scheduledEnqueueTimeUtc
      };
    });
    return this._context.managementClient!.scheduleMessages(scheduleMessages);
  }

  /**
   * Cancels a message that was scheduled to appear on a servicebus topic.
   * @param sequenceNumber - The sequence number of the message to be cancelled.
   * @returns Promise<void>
   */
  async cancelScheduledMessage(sequenceNumber: Long): Promise<void> {
    return this._context.managementClient!.cancelScheduledMessages([sequenceNumber]);
  }

  /**
   * Cancels an array of messages that were scheduled to appear on a servicebus topic.
   * @param sequenceNumbers - An Array of sequence numbers of the message to be cancelled.
   * @returns Promise<void>
   */
  async cancelScheduledMessages(sequenceNumbers: Long[]): Promise<void> {
    return this._context.managementClient!.cancelScheduledMessages(sequenceNumbers);
  }
}
