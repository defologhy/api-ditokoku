import {DataTypes, fn} from 'sequelize';
import ditokokuSequelize from '../connections/ditokoku-sequelize';

const ResellerBalances = ditokokuSequelize.define('ResellerBalances', {
    // Model attributes are defined here
    id: {
        type: DataTypes.INTEGER,
        allowNull:false,
        primaryKey: true,
        autoIncrement: true
    },
    amount: {
        type: DataTypes.DECIMAL(20, 2),
        allowNull: false
    },
    reseller_id: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    reseller_balance_type_id: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    created_datetime: {
        type: DataTypes.DATE(3),
        allowNull: false,
        defaultValue: fn('NOW')
    },
    created_user_id: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    last_updated_datetime: {
        type: DataTypes.DATE(3),
        allowNull: false,
        defaultValue: fn('NOW')
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
    tableName: 'reseller_balances',
    timestamps: false,
    indexes: [
        {
            name: 'idx_reseller_balances_id',
            unique: true,
            fields: [{
                attribute: 'id',
                order: 'ASC'
            }]
        },
        {
            name: 'idx_reseller_balances_reseller_id',
            unique: false,
            fields: [{
                attribute: 'reseller_id',
                order: 'ASC'
            }]
        },
        {
            name: 'idx_reseller_balances_reseller_balance_type_id',
            unique: false,
            fields: [{
                attribute: 'reseller_balance_type_id',
                order: 'ASC'
            }]
        },
        {
            name: 'idx_reseller_balances_deleted_datetime',
            unique: false,
            fields: [{
                attribute: 'deleted_datetime',
                order: 'ASC'
            }]
        }
    ]
});

export { ResellerBalances as default}
