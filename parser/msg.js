/**
 * msg.js
 *
 * Base module that other message modules use.
 */
'use strict';

/**
 * Base inteface for other message classes.
 */
class Message {
    /**
     * Class constructor.
     * @param {Parser} parser Parser instance
     * @param {String} raw Unparsed message from WikiaRC
     * @param {String} type Message type
     */
    constructor(parser, raw, type) {
        this._parser = parser;
        this.raw = raw;
        this.type = type;
        this.error = false;
    }
    /**
     * Marks a message as errored out.
     * @param {String} code Error code
     * @param {String} message Error message
     * @param {Object} details Error details
     * @protected
     */
    _error(code, message, details) {
        this.error = code;
        this.errmsg = message;
        this.errdetails = details;
        if (typeof this._reject === 'function') {
            this._reject();
        }
    }
    /**
     * Starts fetching more details about the message.
     * @param {Client} client Client instance to get external clients from
     * @param {Array<String>} properties Details to fetch
     * @param {Array<String>} interested Modules interested in the message
     * @returns {Promise} Promise that resolves when the details are fetched
     */
    fetch(client, properties, interested) {
        this._client = client;
        if (!this._properties) {
            this._properties = properties;
        }
        if (!this._interested) {
            this._interested = interested;
        }
        return new Promise(function(resolve, reject) {
            this._resolve = resolve;
            this._reject = reject;
        }.bind(this));
    }
    /**
     * Cleans up after a failed fetch.
     * Interested modules and properties to fetch should remain, as they are
     * only generated by the client once.
     */
    cleanup() {
        this.error = false;
        delete this.errmsg;
        delete this.errdetails;
        delete this._cached;
        delete this._client;
        delete this._resolve;
        delete this._reject;
        this.retries = (this.retries || 0) + 1;
    }
    /**
     * Stringifies the object when passed through JSON.stringify.
     * @returns {Object} Object to stringify
     */
    toJSON() {
        const clone = {};
        for (const prop in this) {
            if (
                (
                    !prop.startsWith('_') ||
                    typeof this[prop] === 'string'
                ) &&
                typeof this[prop] !== 'function'
            ) {
                clone[prop] = this[prop];
            }
        }
        return clone;
    }
    /**
     * Gets interested modules.
     * @returns {Array<String>} Modules interested in the message
     */
    get interested() {
        return this._interested;
    }
}

module.exports = Message;
