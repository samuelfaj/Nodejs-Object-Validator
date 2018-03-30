const validator = require('./obj-validator');

console.log(
    validator.validate(
        {
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
        },
        {
            "id_user": 2331,
            "teste": "dsa"
        }
    )
);