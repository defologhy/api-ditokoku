import {DataTypes, fn} from 'sequelize';
import ditokokuSequelize from '../connections/ditokoku-sequelize';

const ConfigurationBalanceBonus = ditokokuSequelize.define('ConfigurationBalanceBonus', {
    // Model attributes are defined here
    id: {
        type: DataTypes.INTEGER,
        allowNull:false,
        primaryKey: true,
        autoIncrement: true
    },
    amount: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    minimum_amount_sales_order: {
        type: DataTypes.INTEGER,
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
    tableName: 'configuration_balance_bonus',
    timestamps: false,
    indexes: [
        {
            name: 'idx_configuration_balance_bonus_id',
            unique: true,
            fields: [{
                attribute: 'id',
                order: 'ASC'
            }]
        },
        {
            name: 'idx_configuration_balance_bonus_deleted_datetime',
            unique: false,
            fields: [{
                attribute: 'deleted_datetime',
                order: 'ASC'
            }]
        }
    ]
});

export { ConfigurationBalanceBonus as default}
