import {DataTypes, fn} from 'sequelize';
import ditokokuSequelize from '../connections/ditokoku-sequelize';

const Resellers = ditokokuSequelize.define('Resellers', {
    // Model attributes are defined here
    id: {
        type: DataTypes.INTEGER,
        allowNull:false,
        primaryKey: true,
        autoIncrement: true
    },
    username: {
        type: DataTypes.STRING(50),
        allowNull: false
    },
    full_name: {
        type: DataTypes.STRING(100),
        allowNull: true
    },
    phone_number: {
        type: DataTypes.STRING(20),
        allowNull: false
    },
    gender_id: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    password: {
        type: DataTypes.STRING(300),
        allowNull: false
    },
    image_filename: {
        type: DataTypes.STRING(300),
        allowNull: true
    },
    created_datetime: {
        type: DataTypes.DATE(3),
        allowNull: false,
        // defaultValue: fn('NOW')
    },
    created_user_id: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    last_updated_datetime: {
        type: DataTypes.DATE(3),
        allowNull: false,
        // defaultValue: fn('NOW')
    },
    last_updated_user_id: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    deleted_datetime: {
        type: DataTypes.DATE(3),
        allowNull: true
    },
    deleted_user_id: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
}, {
    tableName: 'resellers',
    timestamps: false,
    indexes: [
        {
            name: 'idx_resellers_id',
            unique: true,
            fields: [{
                attribute: 'id',
                order: 'ASC'
            }]
        },
        {
            name: 'idx_resellers_username',
            unique: false,
            fields: [{
                attribute: 'username',
                order: 'ASC'
            }]
        },
        {
            name: 'idx_resellers_full_name',
            unique: false,
            fields: [{
                attribute: 'full_name',
                order: 'ASC'
            }]
        },
        {
            name: 'idx_resellers_phone_number',
            unique: false,
            fields: [{
                attribute: 'phone_number',
                order: 'ASC'
            }]
        },
        {
            name: 'idx_resellers_gender_id',
            unique: false,
            fields: [{
                attribute: 'gender_id',
                order: 'ASC'
            }]
        },
        {
            name: 'idx_resellers_deleted_datetime',
            unique: false,
            fields: [{
                attribute: 'deleted_datetime',
                order: 'ASC'
            }]
        }
    ]
});

export { Resellers as default}
