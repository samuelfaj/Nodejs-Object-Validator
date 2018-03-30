/*

Node.js - Object Validator.
    Created by Samuel Fajreldines

 -> Objective: This module helps you to validate objects.
 -> Messages: You can edit the messages in messages.json.
 -> Test: You can test this module with the file test.js.

--
Example of

let rules = {
    id_user: {
        name: 'user id' ,
        type: 'number'  ,
        required: true  ,
        empty: false    ,
        min: 0          ,
        max: 1000
    },
    email: {
        name: 'email'    ,
        type: 'email'    ,
        required: true   ,
        empty: false     ,
        min_letters: 10  ,
        max_letters: 255
    },
    name: {
        name: 'user name' ,
        type: 'string'    ,
        required: true    ,
        empty: false      ,
        min_letters: 10   ,
        max_letters: 25
    },
    register_date: {
        name: 'register date' ,
        type: 'date'          ,
        format: 'YYYY-MM-DD'  ,
        required: false
    }
}
*/

const moment   = require('moment');
const messages = require('./messages');

module.exports.validate = function (rules,posts) {
    let self  = this;
    const idiom = 'pt';

    this.rule   = {};
    this.post   = {};
    this.result = {result: true, message: ''};

    this._validate = {
        init:   function () {
            if(!('name'     in self.rule)) self.rule['name']     = '';
            if(!('type'     in self.rule)) self.rule['type']     = 'string';
            if(!('empty'    in self.rule)) self.rule['empty']    = false;
            if(!('required' in self.rule)) self.rule['required'] = true;

            if((typeof self.post === 'undefined' && self.rule['required'] === true) || (self.post.length === 0 && self.rule['empty'] !== true)){
                return self.return.error('required', '[%1]', self.rule['name']);
            }

            if(self.rule['type'] in self._validate){ return self._validate[self.rule['type']](); }

            throw 'post_validator - ERROR - There aren\'t validations for type "'+ self.rule['type'] +'"';
        } ,
        date:   function () {
            if(!'format' in self.rule){ self.rule['format'] = 'YYYY-MM-DD H:i:s'; }

            if(!moment(self.post, self.rule.format, true).isValid()){
                return self.return.error('type', ['[%1]','[%2]'], [self.rule['name'], 'date (' + self.rule['format'] + ')']);
            }

            return self.return.success();
        } ,
        email:  function () {
            if(!/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(self.post)){
                return self.return.error('type', ['[%1]','[%2]'], [self.rule['name'], 'e-mail']);
            }
            if('min_letters' in self.rule && self.post.length < self.rule['min_letters']){
                return self.return.error('min_letters', ['[%1]','[%2]'], [self.rule['name'], self.rule['min_letters']]);
            }
            if('max_letters' in self.rule && self.post.length > self.rule['max_letters']){
                return self.return.error('max_letters', ['[%1]','[%2]'], [self.rule['name'], self.rule['min_letters']]);
            }

            return self.return.success();
        } ,
        number: function () {
            if((isNaN(parseFloat(self.post)) || !isFinite(self.post))){
                return self.return.error('type', ['[%1]','[%2]'], [self.rule['name'], 'number']);
            }
            if('min' in self.rule && self.post < self.rule['min']){
                return self.return.error('min', ['[%1]','[%2]'], [self.rule['name'], self.rule['min']]);
            }
            if('max' in self.rule && self.post.length > self.rule['max']){
                return self.return.error('max', ['[%1]','[%2]'], [self.rule['name'], self.rule['max']]);
            }

            return self.return.success();
        } ,
        string: function () {
            if(typeof self.post !== "string"){
                return self.return.error('type', ['[%1]','[%2]'], [self.rule['name'], 'string']);
            }
            if('min_letters' in self.rule && self.post.length < self.rule['min_letters']){
                return self.return.error('min_letters', ['[%1]','[%2]'], [self.rule['name'], self.rule['min_letters']]);
            }
            if('max_letters' in self.rule && self.post.length > self.rule['max_letters']){
                return self.return.error('max_letters', ['[%1]','[%2]'], [self.rule['name'], self.rule['min_letters']]);
            }

            return self.return.success();
        } ,
    };
    this.message  = function(message, find, replace){
        if(typeof find    === 'string') find    = [find];
        if(typeof replace === 'string') replace = [replace];

        for (let i = 0; i < find.length; i++) {
            message = message.replace(find[i], replace[i]);
        }

        return message;
    };
    this.return   = {
        error: function(message, find, replace) {
            return {
                result: false,
                message: (self.rule['error_message'] !== false) ? self.message(messages[idiom][message], find, replace) : ''
            };
        },
        success: function() {
            return {
                result: true,
                message: ''
            };
        }
    };

    for (let key in rules) {
        self.rule = (typeof rules[key] === 'string') ? {} : rules[key];
        self.post = posts[key];

        if(!(key in posts)) continue;

        let _validate = self._validate.init();
        if(!_validate.result){ self.result = _validate; }
    }

    return self.result;
};
