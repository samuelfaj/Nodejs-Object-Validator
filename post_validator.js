'use strict';
const moment = require('moment');
/*
rules = [
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
]
*/

const messages = {
    pt: {
        type: "O item [%1] precisa ser válido e do tipo [%2].",
        required: "O item [%1] deve ser preenchido.",
        /* type - string */
        min_letters: "O item [%1] deve ter no mínimo [%2] caracteres.",
        max_letters: "O item [%1] deve ter no máximo [%2] caracteres.",
        /* type - number */
        min: "O item [%1] deve ser maior que [%2].",
        max: "O item [%1] deve ser menor que [%2].",
    },
    en: {
        type: "The item [%1] must be valid and of [%2] type.",
        required: "the item [%1] must be filled in.",
        /* type - string */
        min_letters: "The item [%1] must be at least [%2] characters.",
        max_letters: "The item [% 1] must be at most [% 2] characters.",
        /* type - number */
        min: "The item [%1] must be bigger than [%2].",
        max: "The item [%1] must be smaller than [%2].",
    }
};

module.exports.post_validator = function (rules,posts) {
    const self  = this;
    const idiom = 'pt';

    this.rule   = {};
    this.post   = {};
    this.result = {result: true, message: ''};

    for (let key in rules) {
        self.rule = rules[key];
        self.post = posts[key];

        let validate = self.validate.init();
        if(!validate.result){ self.result = validate; }
    }

    this.validate = {
        init:   function () {
            if(!'name'     in self.rule) self.rule['name']     = '';
            if(!'type'     in self.rule) self.rule['type']     = 'string';
            if(!'empty'    in self.rule) self.rule['empty']    = false;
            if(!'required' in self.rule) self.rule['required'] = true;

            if((typeof self.post === 'undefined' && self.rule['required'] === true) || (self.post.length === 0 && self.rule['empty'] !== true)){
                return self.return.error('required', '[%1]', self.rule['name']);
            }

            if(self.rule['type'] in self.validate){ return self.validate[self.rule['type']](); }

            throw 'post_validator - ERROR - There aren\'t validations for type "'+ self.rule['type'] +'"';
        } ,
        date:   function () {
            if(!'format' in self.rule){ self.rule['format'] = 'YYYY-MM-DD H:i:s'; }

            if(!moment(self.post,self.rule['format']).isValid()){
                return self.return.error('type', ['[%1]','[%2]'], [self.rule['name'], 'date']);
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

    this.return  = {
        error: function(message, find, replace) {
            return {
                result: false,
                message: (self.rule['error_message'] !== false) ? self.message(messages[self.idiom][message], find, replace) : ''
            };
        },
        success: function() {
            return {
                result: true,
                message: ''
            };
        }
    };
    this.message = function(message, find, replace){
        if(typeof find    === 'string') find    = [find];
        if(typeof replace === 'string') replace = [replace];

        for (let i = 0; i < find.length; i++) {
            message = message.replace(find[i], replace[i]);
        }

        return message;
    };

    return self.result;
};
